// src/pages/ArmyKeywordsPage.jsx - AOS ONLY
import React, {useState} from 'react';
import {Container, Row, Col, Card, Tab, Nav, Alert, Button} from 'react-bootstrap';
import {useParams, useLocation, useNavigate, Link} from 'react-router-dom';
import {useGameSystem} from '../contexts/GameSystemContext';
import GameSystems from '../enums/GameSystems';
import ArmyKeywordList from '../components/aos/ArmyKeywordList';
import ArmyKeywordForm from '../components/aos/ArmyKeywordForm';

const ArmyKeywordsPage = () => {
    const {keywordId} = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const {currentSystem} = useGameSystem();
    const [activeTab, setActiveTab] = useState('list');

    // Set active tab based on URL parameters
    React.useEffect(() => {
        if (location.pathname.includes('/army-keywords/create')) {
            setActiveTab('create');
        } else if (location.pathname.includes('/army-keywords/edit/')) {
            setActiveTab('edit');
        } else {
            setActiveTab('list');
        }
    }, [location.pathname]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);

        if (tab === 'list') {
            navigate('/army-keywords');
        } else if (tab === 'create') {
            navigate('/army-keywords/create');
        }
    };

    // System check at page level
    if (currentSystem !== GameSystems.AOS) {
        return (
            <Container>
                <Row className="mb-4">
                    <Col>
                        <Alert variant="info">
                            <h4 className="mb-3">Army Keywords are only available for Age of Sigmar</h4>
                            <p>You are currently viewing {currentSystem}. Army keywords are an AOS-specific game
                                mechanic.</p>
                            {currentSystem === GameSystems.LEGION && (
                                <div className="mt-3">
                                    <Button as={Link} to="/command-cards" variant="primary" className="me-2">
                                        Manage Command Cards
                                    </Button>
                                    <Button as={Link} to="/" variant="secondary">
                                        Back to Home
                                    </Button>
                                </div>
                            )}
                        </Alert>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container>
            <Row className="mb-4">
                <Col>
                    <h1>Army Keywords</h1>
                    <p>Create and manage your Age of Sigmar army keywords, battle traits, and enhancements.</p>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Tab.Container activeKey={activeTab} onSelect={handleTabChange}>
                        <Card>
                            <Card.Header>
                                <Nav variant="tabs">
                                    <Nav.Item>
                                        <Nav.Link eventKey="list">All Army Keywords</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="create">Create Army Keyword</Nav.Link>
                                    </Nav.Item>
                                    {location.pathname.includes('/army-keywords/edit/') && (
                                        <Nav.Item>
                                            <Nav.Link eventKey="edit">Edit Army Keyword</Nav.Link>
                                        </Nav.Item>
                                    )}
                                </Nav>
                            </Card.Header>

                            <Card.Body>
                                <Tab.Content>
                                    <Tab.Pane eventKey="list">
                                        <ArmyKeywordList/>
                                    </Tab.Pane>

                                    <Tab.Pane eventKey="create">
                                        <ArmyKeywordForm/>
                                    </Tab.Pane>

                                    <Tab.Pane eventKey="edit">
                                        <ArmyKeywordForm/>
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

export default ArmyKeywordsPage;