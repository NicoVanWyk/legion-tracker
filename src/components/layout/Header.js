// src/components/layout/Header.js
import React from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img 
            src="/logo.png" 
            width="30" 
            height="30" 
            className="d-inline-block align-top me-2" 
            alt="Star Wars Legion Tracker" 
          />
          SW Legion Tracker
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            
            {currentUser && (
              <>
                <NavDropdown title="Units" id="units-dropdown">
                  <NavDropdown.Item as={Link} to="/units">My Units</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/units/create">Create Unit</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} to="/armies">My Armies</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/armies/create">Create Army</NavDropdown.Item>
                </NavDropdown>
                
                <NavDropdown title="Battles" id="battles-dropdown">
                  <NavDropdown.Item as={Link} to="/battles">My Battles</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/battles/create">Start New Battle</NavDropdown.Item>
                </NavDropdown>
                
                <Nav.Link as={Link} to="/references">Reference</Nav.Link>
              </>
            )}
          </Nav>
          
          <Nav>
            {currentUser ? (
              <NavDropdown title={currentUser.displayName || currentUser.email} id="user-dropdown">
                <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/profile/settings">Settings</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/profile/stats">Battle Statistics</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;