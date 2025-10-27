// src/pages/NotFound.js
import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
      <Row className="w-100">
        <Col md={8} className="mx-auto text-center">
          <Card>
            <Card.Body className="py-5">
              <h1 className="display-1 mb-4">404</h1>
              <h2 className="mb-4">Page Not Found</h2>
              <p className="mb-4 text-muted">
                The page you are looking for might have been removed, 
                had its name changed, or is temporarily unavailable.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Button as={Link} to="/" variant="primary">
                  Return to Home
                </Button>
                <Button as={Link} to="/units" variant="outline-secondary">
                  View Units
                </Button>
                <Button as={Link} to="/armies" variant="outline-secondary">
                  View Armies
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;