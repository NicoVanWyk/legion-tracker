// src/pages/Battles.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tab, Nav } from 'react-bootstrap';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import BattleList from '../components/battles/BattleList';
import BattleForm from '../components/battles/BattleForm';
import BattleTracker from '../components/battles/BattleTracker';

const Battles = () => {
  const { battleId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list');

  // Set active tab based on URL parameters
  useEffect(() => {
    if (window.location.pathname.includes('/battles/create')) {
      setActiveTab('create');
    } else if (battleId) {
      setActiveTab('detail');
    } else {
      setActiveTab('list');
    }
  }, [battleId, location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    if (tab === 'list') {
      navigate('/battles');
    } else if (tab === 'create') {
      navigate('/battles/create');
    }
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Battles</h1>
          <p>Track and manage your Star Wars Legion battles.</p>
        </Col>
      </Row>

      <Row>
        <Col>
          <Tab.Container activeKey={activeTab} onSelect={handleTabChange}>
            <Card>
              <Card.Header>
                <Nav variant="tabs">
                  <Nav.Item>
                    <Nav.Link eventKey="list">My Battles</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="create">New Battle</Nav.Link>
                  </Nav.Item>
                  {battleId && (
                    <Nav.Item>
                      <Nav.Link eventKey="detail">Battle Tracker</Nav.Link>
                    </Nav.Item>
                  )}
                </Nav>
              </Card.Header>
              
              <Card.Body>
                <Tab.Content>
                  <Tab.Pane eventKey="list">
                    <BattleList />
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="create">
                    <BattleForm />
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="detail">
                    {battleId && <BattleTracker battleId={battleId} />}
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

export default Battles;