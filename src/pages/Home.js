// src/pages/Home.js
import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <div className="py-5 text-center">
            <h1>Star Wars Legion Tracker</h1>
            <p className="lead">
              Create, manage, and track your custom Star Wars Legion units, armies, and battles
            </p>
            
            {!currentUser && (
              <div className="d-flex justify-content-center gap-3 mt-4">
                <Button as={Link} to="/register" variant="primary" size="lg">
                  Sign Up
                </Button>
                <Button as={Link} to="/login" variant="outline-primary" size="lg">
                  Login
                </Button>
              </div>
            )}
          </div>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Img variant="top" src="/img/units.jpg" />
            <Card.Body>
              <Card.Title>Custom Units</Card.Title>
              <Card.Text>
                Create and manage your custom units with detailed stat blocks, weapons, and keywords.
                Track proxy miniatures for each unit.
              </Card.Text>
              {currentUser ? (
                <Button as={Link} to="/units" variant="primary">View My Units</Button>
              ) : (
                <Button as={Link} to="/login" variant="primary">Login to Create Units</Button>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Img variant="top" src="/img/armies.jpg" />
            <Card.Body>
              <Card.Title>Army Builder</Card.Title>
              <Card.Text>
                Build custom armies using your units. Track points, balance, and army composition.
              </Card.Text>
              {currentUser ? (
                <Button as={Link} to="/armies" variant="primary">View My Armies</Button>
              ) : (
                <Button as={Link} to="/login" variant="primary">Login to Build Armies</Button>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Img variant="top" src="/img/battles.jpg" />
            <Card.Body>
              <Card.Title>Battle Tracker</Card.Title>
              <Card.Text>
                Track your Star Wars Legion battles in real-time. Manage unit activations,
                suppression, wounds, and more.
              </Card.Text>
              {currentUser ? (
                <Button as={Link} to="/battles" variant="primary">View My Battles</Button>
              ) : (
                <Button as={Link} to="/login" variant="primary">Login to Track Battles</Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mb-5">
        <Col>
          <Card className="bg-light">
            <Card.Body>
              <h3>Features</h3>
              <Row>
                <Col md={6}>
                  <ul>
                    <li>Create custom units with detailed stat blocks</li>
                    <li>Build balanced armies for your games</li>
                    <li>Track miniature proxies for each unit</li>
                    <li>Manage points costs and army composition</li>
                  </ul>
                </Col>
                <Col md={6}>
                  <ul>
                    <li>Real-time battle tracking</li>
                    <li>Reference library for keywords and rules</li>
                    <li>Battle statistics and history</li>
                    <li>Mobile-friendly interface</li>
                  </ul>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;