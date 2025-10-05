// src/components/auth/Login.js
import React, { useState } from 'react';
import { Form, Button, Card, Alert, Container } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../layout/LoadingSpinner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Failed to sign in: ' + (err.message || 'Please check your credentials and try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Logging in..." />;
  }

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
      <div className="w-100" style={{ maxWidth: '400px' }}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Log In</h2>
            
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group id="email" className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </Form.Group>
              
              <Form.Group id="password" className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </Form.Group>
              
              <Button type="submit" className="w-100" disabled={loading}>
                Log In
              </Button>
            </Form>
            
            <div className="w-100 text-center mt-3">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
          </Card.Body>
        </Card>
        
        <div className="w-100 text-center mt-2">
          Need an account? <Link to="/register">Sign Up</Link>
        </div>
      </div>
    </Container>
  );
};

export default Login;