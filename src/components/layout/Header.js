// src/components/layout/Header.js (Updated with new navigation)
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
                                <NavDropdown title="Units & Armies" id="units-dropdown">
                                    <NavDropdown.Item as={Link} to="/units">My Units</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/units/create">Create Unit</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item as={Link} to="/armies">My Armies</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/armies/create">Create Army</NavDropdown.Item>
                                </NavDropdown>

                                <NavDropdown title="Customization" id="custom-dropdown">
                                    <NavDropdown.Header>Keywords & Types</NavDropdown.Header>
                                    <NavDropdown.Item as={Link} to="/units/keywords">
                                        <i className="bi bi-tag-fill me-2"></i>
                                        Custom Keywords
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/units/types">
                                        <i className="bi bi-diagram-3-fill me-2"></i>
                                        Custom Unit Types
                                    </NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Header>Abilities & Upgrades</NavDropdown.Header>
                                    <NavDropdown.Item as={Link} to="/abilities">
                                        <i className="bi bi-stars me-2"></i>
                                        Abilities
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/upgrades">
                                        <i className="bi bi-arrow-up-circle-fill me-2"></i>
                                        Upgrade Cards
                                    </NavDropdown.Item>
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
                            <NavDropdown
                                title={
                                    <>
                                        <i className="bi bi-person-circle me-2"></i>
                                        {currentUser.displayName || currentUser.email}
                                    </>
                                }
                                id="user-dropdown"
                                align="end"
                            >
                                <NavDropdown.Item as={Link} to="/profile">
                                    <i className="bi bi-person-fill me-2"></i>
                                    Profile
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/profile/settings">
                                    <i className="bi bi-gear-fill me-2"></i>
                                    Settings
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/profile/stats">
                                    <i className="bi bi-graph-up me-2"></i>
                                    Battle Statistics
                                </NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={handleLogout}>
                                    <i className="bi bi-box-arrow-right me-2"></i>
                                    Logout
                                </NavDropdown.Item>
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