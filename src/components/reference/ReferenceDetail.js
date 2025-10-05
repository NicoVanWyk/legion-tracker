// src/components/reference/ReferenceDetail.jsx
import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import ReferenceCategories from '../../enums/ReferenceCategories';
import { confirmAlert } from 'react-confirm-alert';

const ReferenceDetail = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [reference, setReference] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchReferenceDetails = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from system references first
        const systemRef = doc(db, 'references', id);
        const systemSnap = await getDoc(systemRef);
        
        if (systemSnap.exists()) {
          setReference({
            id: systemSnap.id,
            ...systemSnap.data(),
            isSystem: true
          });
        } else if (currentUser) {
          // If not found and user is logged in, try user's custom references
          const userRef = doc(db, 'users', currentUser.uid, 'references', id);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setReference({
              id: userSnap.id,
              ...userSnap.data(),
              isCustom: true
            });
          } else {
            setError('Reference not found');
          }
        } else {
          setError('Reference not found');
        }
      } catch (err) {
        console.error('Error fetching reference details:', err);
        setError('Error loading reference details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReferenceDetails();
  }, [id, currentUser]);
  
  const handleDelete = async () => {
    confirmAlert({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this reference? This action cannot be undone.',
      buttons: [
        {
          label: 'Yes, Delete It',
          onClick: async () => {
            try {
              setLoading(true);
              if (reference.isCustom && currentUser) {
                await deleteDoc(doc(db, 'users', currentUser.uid, 'references', id));
                navigate('/references');
              }
            } catch (err) {
              console.error('Error deleting reference:', err);
              setError('Failed to delete reference. Please try again.');
              setLoading(false);
            }
          }
        },
        {
          label: 'Cancel',
          onClick: () => {}
        }
      ]
    });
  };
  
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p>Loading reference details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="danger">
        {error}
        <div className="mt-3">
          <Button as={Link} to="/references" variant="primary">
            Back to References
          </Button>
        </div>
      </Alert>
    );
  }
  
  if (!reference) {
    return (
      <Alert variant="warning">
        Reference not found
        <div className="mt-3">
          <Button as={Link} to="/references" variant="primary">
            Back to References
          </Button>
        </div>
      </Alert>
    );
  }
  
  return (
    <div className="reference-detail">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h3 className="mb-0">{reference.term}</h3>
          <Badge 
            bg={ReferenceCategories.getBadgeColor(reference.category)}
            className="ms-2"
          >
            {ReferenceCategories.getDisplayName(reference.category)}
          </Badge>
        </Card.Header>
        
        <Card.Body>
          <section className="mb-4">
            <h4>Description</h4>
            <p>{reference.description}</p>
          </section>
          
          {reference.examples && reference.examples.length > 0 && (
            <section className="mb-4">
              <h4>Examples</h4>
              <ListGroup variant="flush">
                {reference.examples.map((example, index) => (
                  <ListGroup.Item key={index}>{example}</ListGroup.Item>
                ))}
              </ListGroup>
            </section>
          )}
          
          {reference.relatedTerms && reference.relatedTerms.length > 0 && (
            <section className="mb-4">
              <h4>Related Terms</h4>
              <div className="d-flex flex-wrap gap-2">
                {reference.relatedTerms.map((term, index) => (
                  <Button 
                    key={index}
                    as={Link}
                    to={`/references/${term.id}`}
                    variant="outline-secondary"
                    size="sm"
                  >
                    {term.term}
                  </Button>
                ))}
              </div>
            </section>
          )}
          
          <div className="reference-source mt-4 text-muted">
            <small>
              {reference.isSystem ? 'System Reference' : 'Custom Reference'}
              {reference.lastUpdated && (
                <span className="ms-2">
                  • Last updated: {reference.lastUpdated.toDate().toLocaleDateString()}
                </span>
              )}
            </small>
          </div>
        </Card.Body>
        
        <Card.Footer className="d-flex justify-content-between">
          <Button 
            as={Link} 
            to="/references" 
            variant="secondary"
          >
            Back to References
          </Button>
          
          {reference.isCustom && currentUser && (
            <div>
              <Button 
                as={Link}
                to={`/references/edit/${id}`}
                variant="primary"
                className="me-2"
              >
                Edit
              </Button>
              <Button 
                variant="danger"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          )}
        </Card.Footer>
      </Card>
    </div>
  );
};

export default ReferenceDetail;