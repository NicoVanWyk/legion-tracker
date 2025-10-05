// src/components/auth/ForgotPassword.js
import React, { useState } from 'react';
import { Form, Button, Card, Alert, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../layout/LoadingSpinner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setMessage('');
      setError('');
      setLoading(true);
      
      await resetPassword(email);
      setMessage('Check your email for further instructions');
    } catch (err) {
      setError('Failed to reset password: ' + (err.message || 'Please check your email and try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Sending password reset email..." />;
  }

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
      <div className="w-100" style={{ maxWidth: '400px' }}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Password Reset</h2>
            
            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}
            
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
              
              <Button type="submit" className="w-100" disabled={loading}>
                Reset Password
              </Button>
            </Form>
            
            <div className="w-100 text-center mt-3">
              <Link to="/login">Back to Login</Link>
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

export default ForgotPassword;