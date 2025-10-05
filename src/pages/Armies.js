// src/pages/Armies.js
import React, { useState } from 'react';
import { Container, Row, Col, Card, Tab, Nav } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ArmyList from '../components/units/ArmyList';
import ArmyForm from '../components/units/ArmyForm';
import ArmyDetail from '../components/units/ArmyDetail';

const Armies = () => {
  const { armyId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list');

  // Set active tab based on URL parameters
  React.useEffect(() => {
    if (window.location.pathname.includes('/armies/create')) {
      setActiveTab('create');
    } else if (window.location.pathname.includes('/armies/edit/')) {
      setActiveTab('edit');
    } else if (armyId) {
      setActiveTab('detail');
    } else {
      setActiveTab('list');
    }
  }, [armyId]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    if (tab === 'list') {
      navigate('/armies');
    } else if (tab === 'create') {
      navigate('/armies/create');
    }
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Armies</h1>
          <p>Create and manage your Star Wars Legion armies.</p>
        </Col>
      </Row>

      <Row>
        <Col>
          <Tab.Container activeKey={activeTab} onSelect={handleTabChange}>
            <Card>
              <Card.Header>
                <Nav variant="tabs">
                  <Nav.Item>
                    <Nav.Link eventKey="list">My Armies</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="create">Create Army</Nav.Link>
                  </Nav.Item>
                  {armyId && (
                    <Nav.Item>
                      <Nav.Link eventKey="detail">Army Details</Nav.Link>
                    </Nav.Item>
                  )}
                  {window.location.pathname.includes('/armies/edit/') && (
                    <Nav.Item>
                      <Nav.Link eventKey="edit">Edit Army</Nav.Link>
                    </Nav.Item>
                  )}
                </Nav>
              </Card.Header>
              
              <Card.Body>
                <Tab.Content>
                  <Tab.Pane eventKey="list">
                    <ArmyList />
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="create">
                    <ArmyForm />
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="detail">
                    {armyId && <ArmyDetail armyId={armyId} />}
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="edit">
                    {armyId && <ArmyForm />}
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

export default Armies;