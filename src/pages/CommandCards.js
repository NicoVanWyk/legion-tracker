// src/pages/CommandCards.js
import React, { useState } from 'react';
import { Container, Row, Col, Card, Tab, Nav } from 'react-bootstrap';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import CommandCardList from '../components/command/CommandCardList';
import CustomCommandCardForm from '../components/command/CustomCommandCardForm';

const CommandCards = () => {
    const { cardId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('list');

    // Set active tab based on URL parameters
    React.useEffect(() => {
        if (location.pathname.includes('/command-cards/create')) {
            setActiveTab('create');
        } else if (location.pathname.includes('/command-cards/edit/')) {
            setActiveTab('edit');
        } else {
            setActiveTab('list');
        }
    }, [location.pathname]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);

        if (tab === 'list') {
            navigate('/command-cards');
        } else if (tab === 'create') {
            navigate('/command-cards/create');
        }
    };

    return (
        <Container>
            <Row className="mb-4">
                <Col>
                    <h1>Command Cards</h1>
                    <p>Create and manage your Star Wars Legion command cards for use in your armies.</p>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Tab.Container activeKey={activeTab} onSelect={handleTabChange}>
                        <Card>
                            <Card.Header>
                                <Nav variant="tabs">
                                    <Nav.Item>
                                        <Nav.Link eventKey="list">All Command Cards</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="create">Create Command Card</Nav.Link>
                                    </Nav.Item>
                                    {location.pathname.includes('/command-cards/edit/') && (
                                        <Nav.Item>
                                            <Nav.Link eventKey="edit">Edit Command Card</Nav.Link>
                                        </Nav.Item>
                                    )}
                                </Nav>
                            </Card.Header>

                            <Card.Body>
                                <Tab.Content>
                                    <Tab.Pane eventKey="list">
                                        <CommandCardList />
                                    </Tab.Pane>

                                    <Tab.Pane eventKey="create">
                                        <CustomCommandCardForm />
                                    </Tab.Pane>

                                    <Tab.Pane eventKey="edit">
                                        <CustomCommandCardForm />
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

export default CommandCards;