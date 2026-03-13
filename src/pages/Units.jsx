// src/pages/Units.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tab, Nav } from 'react-bootstrap';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import UnitList from '../components/units/UnitList';
import UnitForm from '../components/units/UnitForm';
import UnitDetail from '../components/units/UnitDetail';

const Units = () => {
  const { unitId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list');

  // Set active tab based on URL parameters
  useEffect(() => {
    if (location.pathname.includes('/units/create')) {
      setActiveTab('create');
    } else if (location.pathname.includes('/units/edit/')) {
      setActiveTab('edit');
    } else if (unitId) {
      setActiveTab('detail');
    } else {
      setActiveTab('list');
    }
  }, [unitId, location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    if (tab === 'list') {
      navigate('/units');
    } else if (tab === 'create') {
      navigate('/units/create');
    }
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Units</h1>
          <p>Create and manage your Star Wars Legion units.</p>
        </Col>
      </Row>

      <Row>
        <Col>
          <Tab.Container activeKey={activeTab} onSelect={handleTabChange}>
            <Card>
              <Card.Header>
                <Nav variant="tabs">
                  <Nav.Item>
                    <Nav.Link eventKey="list">My Units</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="create">Create Unit</Nav.Link>
                  </Nav.Item>
                  {unitId && (
                    <Nav.Item>
                      <Nav.Link eventKey="detail">Unit Details</Nav.Link>
                    </Nav.Item>
                  )}
                  {location.pathname.includes('/units/edit/') && (
                    <Nav.Item>
                      <Nav.Link eventKey="edit">Edit Unit</Nav.Link>
                    </Nav.Item>
                  )}
                </Nav>
              </Card.Header>
              
              <Card.Body>
                <Tab.Content>
                  <Tab.Pane eventKey="list">
                    <UnitList />
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="create">
                    <UnitForm />
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="detail">
                    {unitId && <UnitDetail unitId={unitId} />}
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="edit">
                    {unitId && <UnitForm />}
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Card>
          </Tab.Container>
        </Col>
      </Row>
    </Container>
  );
};

export default Units;