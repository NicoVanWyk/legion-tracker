// src/components/layout/Header.js (Updated with Command Cards)
import React, { useState } from 'react';
import logo from '../../assets/SWLegionLogo.png';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ReferencePanel from '../reference/ReferencePanel';

const Header = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [showReferencePanel, setShowReferencePanel] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    };

    return (
        <>
            <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
                <Container>
                    <Navbar.Brand as={Link} to="/">
                        <img
                            src={logo}
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
                                        <NavDropdown.Divider />
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
                                        <NavDropdown.Header>Cards & Abilities</NavDropdown.Header>
                                        <NavDropdown.Item as={Link} to="/command-cards">
                                            <i className="bi bi-card-heading me-2"></i>
                                            Command Cards
                                        </NavDropdown.Item>
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

                        <Nav className="align-items-center">
                            {/* Quick Reference Lookup Button */}
                            <Button
                                variant="outline-light"
                                size="sm"
                                onClick={() => setShowReferencePanel(true)}
                                className="me-2"
                                title="Quick Reference Lookup"
                            >
                                <i className="bi bi-search me-1"></i>
                                <span className="d-none d-md-inline">Quick Lookup</span>
                                <span className="d-inline d-md-none">Lookup</span>
                            </Button>

                            {currentUser ? (
                                <NavDropdown
                                    title={
                                        <>
                                            <i className="bi bi-person-circle me-2"></i>
                                            <span className="d-none d-lg-inline">
                                                {currentUser.displayName || currentUser.email}
                                            </span>
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

            {/* Reference Panel - Accessible from anywhere */}
            <ReferencePanel
                show={showReferencePanel}
                onHide={() => setShowReferencePanel(false)}
            />
        </>
    );
};

export default Header;