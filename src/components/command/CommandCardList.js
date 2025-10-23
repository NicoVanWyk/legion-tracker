// src/components/command/CommandCardList.js
import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Badge, ListGroup, Form, InputGroup, Alert, Tabs, Tab } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import CommandCards from '../../enums/CommandCards';
import Factions from '../../enums/Factions';
import LoadingSpinner from '../layout/LoadingSpinner';

const CommandCardList = () => {
    const [customCards, setCustomCards] = useState([]);
    const [systemCards, setSystemCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterFaction, setFilterFaction] = useState('all');
    const [filterPips, setFilterPips] = useState('all');
    const [activeTab, setActiveTab] = useState('all');
    const { currentUser } = useAuth();

    useEffect(() => {
        fetchCommandCards();
    }, [currentUser]);

    const fetchCommandCards = async () => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError('');

            // 1. Get custom command cards from Firestore
            const cardsRef = collection(db, 'users', currentUser.uid, 'commandCards');
            const cardsSnapshot = await getDocs(cardsRef);

            const customCardsList = cardsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                type: 'custom'
            }));

            setCustomCards(customCardsList);

            // 2. Generate system cards from the CommandCards enum
            const systemCardsList = CommandCards.getAllSystemCards().map(cardId => ({
                id: cardId,
                name: CommandCards.getDisplayName(cardId),
                pips: CommandCards.getPips(cardId),
                faction: CommandCards.getFaction(cardId),
                description: CommandCards.getDescription(cardId),
                commander: CommandCards.getCommanderRequirement(cardId),
                isSystem: true,
                type: 'system'
            }));

            setSystemCards(systemCardsList);
        } catch (err) {
            console.error('Error fetching command cards:', err);
            setError('Failed to fetch command cards. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCard = async (cardId) => {
        if (!window.confirm('Are you sure you want to delete this command card?')) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'commandCards', cardId));
            // Refresh the list
            fetchCommandCards();
        } catch (err) {
            console.error('Error deleting command card:', err);
            setError('Failed to delete command card: ' + err.message);
        }
    };

    // Filter function
    const filterCards = (cards) => {
        return cards.filter(card => {
            // Apply faction filter
            if (filterFaction !== 'all' && card.faction !== filterFaction) {
                // Special case: universal cards (null faction) should be shown for all factions
                if (card.faction !== null && card.faction !== '') {
                    return false;
                }
            }

            // Apply pips filter
            if (filterPips !== 'all' && card.pips !== parseInt(filterPips)) {
                return false;
            }

            // Apply search term
            if (searchTerm && !card.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                // Also check description
                if (!card.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
                    return false;
                }
            }

            // Apply tab filter
            if (activeTab === 'system' && card.type !== 'system') {
                return false;
            }
            if (activeTab === 'custom' && card.type !== 'custom') {
                return false;
            }

            return true;
        });
    };

    // Get filtered cards based on all current filters
    const filteredCards = [...filterCards(systemCards), ...filterCards(customCards)].sort((a, b) => {
        // Sort by pips first
        if (a.pips !== b.pips) {
            return a.pips - b.pips;
        }

        // Then by name
        return a.name.localeCompare(b.name);
    });

    if (loading) {
        return <LoadingSpinner text="Loading command cards..." />;
    }

    return (
        <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Command Cards</h4>
                <Button as={Link} to="/command-cards/create" variant="primary">
                    Create Command Card
                </Button>
            </Card.Header>
            <Card.Body>
                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                <Row className="mb-3">
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Search</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="Search cards..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => setSearchTerm('')}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </InputGroup>
                        </Form.Group>
                    </Col>

                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>Faction</Form.Label>
                            <Form.Select
                                value={filterFaction}
                                onChange={(e) => setFilterFaction(e.target.value)}
                            >
                                <option value="all">All Factions</option>
                                <option value="">Universal Only</option>
                                <option value={Factions.REPUBLIC}>{Factions.getDisplayName(Factions.REPUBLIC)}</option>
                                <option value={Factions.SEPARATIST}>{Factions.getDisplayName(Factions.SEPARATIST)}</option>
                                <option value={Factions.REBEL}>{Factions.getDisplayName(Factions.REBEL)}</option>
                                <option value={Factions.EMPIRE}>{Factions.getDisplayName(Factions.EMPIRE)}</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>Pips</Form.Label>
                            <Form.Select
                                value={filterPips}
                                onChange={(e) => setFilterPips(e.target.value)}
                            >
                                <option value="all">All Priorities</option>
                                <option value="1">1 Pip (High Priority)</option>
                                <option value="2">2 Pips (Medium Priority)</option>
                                <option value="3">3 Pips (Low Priority)</option>
                                <option value="4">4 Pips (Lowest Priority)</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col md={2}>
                        <Form.Group>
                            <Form.Label>Card Type</Form.Label>
                            <Tabs
                                activeKey={activeTab}
                                onSelect={(key) => setActiveTab(key)}
                                className="mb-3"
                            >
                                <Tab eventKey="all" title="All" />
                                <Tab eventKey="system" title="System" />
                                <Tab eventKey="custom" title="Custom" />
                            </Tabs>
                        </Form.Group>
                    </Col>
                </Row>

                {filteredCards.length === 0 ? (
                    <Alert variant="info">
                        No command cards match your filters. Try adjusting your search criteria.
                    </Alert>
                ) : (
                    <ListGroup>
                        {filteredCards.map(card => (
                            <ListGroup.Item key={card.id} className="command-card-item">
                                <Row>
                                    <Col md={7}>
                                        <div className="d-flex align-items-center">
                                            <div className="me-2 pips-display">
                                                {[...Array(card.pips)].map((_, i) => (
                                                    <i key={i} className="bi bi-circle-fill me-1"></i>
                                                ))}
                                            </div>
                                            <div>
                                                <h5 className="mb-1">{card.name}</h5>
                                                <div>
                                                    {card.faction ? (
                                                        <Badge bg="primary" className="me-2">{Factions.getDisplayName(card.faction)}</Badge>
                                                    ) : (
                                                        <Badge bg="secondary" className="me-2">Universal</Badge>
                                                    )}

                                                    {card.commander && (
                                                        <Badge bg="info" className="me-2">{card.commander}</Badge>
                                                    )}

                                                    {card.type === 'system' ? (
                                                        <Badge bg="dark">System Card</Badge>
                                                    ) : (
                                                        <Badge bg="success">Custom Card</Badge>
                                                    )}

                                                    {card.isUniversal && (
                                                        <Badge bg="warning" text="dark" className="ms-2">All Armies</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <p className="mt-2 mb-0">{card.description || 'No description'}</p>
                                    </Col>

                                    <Col md={3} className="d-flex align-items-center small">
                                        {card.effectText && (
                                            <div className="text-muted">
                                                {card.effectText.length > 100
                                                    ? card.effectText.substring(0, 100) + '...'
                                                    : card.effectText}
                                            </div>
                                        )}
                                    </Col>

                                    <Col md={2} className="d-flex align-items-center justify-content-end">
                                        {card.type === 'custom' ? (
                                            <>
                                                <Button
                                                    as={Link}
                                                    to={`/command-cards/edit/${card.id}`}
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-2"
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteCard(card.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </>
                                        ) : (
                                            <Badge bg="secondary">System Card</Badge>
                                        )}
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Card.Body>
            <Card.Footer>
                <small className="text-muted">
                    Showing {filteredCards.length} cards ({systemCards.filter(card => filterCards([card]).length).length} system,
                    {customCards.filter(card => filterCards([card]).length).length} custom)
                </small>
            </Card.Footer>
        </Card>
    );
};

export default CommandCardList;