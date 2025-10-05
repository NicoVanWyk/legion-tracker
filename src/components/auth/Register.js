import React, { useContext, useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== passwordConfirm) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/');
    } catch (err) {
      setError('Failed to create an account: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center">
      <Card style={{ width: '400px' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Register</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="email" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>
            <Form.Group id="password" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Form.Group id="password-confirm" className="mb-3">
              <Form.Label>Password Confirmation</Form.Label>
              <Form.Control 
                type="password" 
                required 
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </Form.Group>
            <Button disabled={loading} className="w-100" type="submit">
              Register
            </Button>
          </Form>
        </Card.Body>
        <Card.Footer className="text-center">
          Already have an account? <Link to="/login">Log In</Link>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default Register;