// src/pages/ReferencePage.jsx
import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import ReferenceList from '../components/reference/ReferenceList';
import ReferenceDetail from '../components/reference/ReferenceDetail';
import ReferenceForm from '../components/reference/ReferenceForm';

const ReferencePage = () => {
  const { id } = useParams();
  const location = useLocation();
  
  // Determine which view to show based on the path
  const pathname = location.pathname;
  
  // Check if we're creating a new reference
  if (pathname === '/references/create') {
    return (
      <Container className="mt-4">
        <ReferenceForm />
      </Container>
    );
  }
  
  // Check if we're editing an existing reference
  if (pathname.startsWith('/references/edit/')) {
    return (
      <Container className="mt-4">
        <ReferenceForm />
      </Container>
    );
  }
  
  // Check if we're viewing a specific reference detail
  if (id && !pathname.includes('/edit/') && !pathname.includes('/create')) {
    return (
      <Container className="mt-4">
        <ReferenceDetail />
      </Container>
    );
  }
  
  // Default: show the list view
  return (
    <Container className="mt-4">
      <h2 className="mb-4">Game References</h2>
      <ReferenceList />
    </Container>
  );
};

export default ReferencePage;