// src/components/command/ArmyCommandCards.js
import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Alert, ListGroup, Form, Badge } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import CommandCards from '../../enums/CommandCards';
import Factions from '../../enums/Factions';
import LoadingSpinner from '../layout/LoadingSpinner';

const ArmyCommandCards = () => {
    const { armyId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [army, setArmy] = useState(null);
    const [availableCards, setAvailableCards] = useState([]);
    const [selectedCards, setSelectedCards] = useState([]);
    const [commanderNames, setCommanderNames] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // Added missing state variable

    const MAX_CARDS = 7; // Maximum allowed command cards per army

    // Load army data and command cards
    useEffect(() => {
        if (!currentUser || !armyId) return;

        const fetchArmyData = async () => {
            try {
                setLoading(true);

                // 1. Fetch the army details
                const armyRef = doc(db, 'users', currentUser.uid, 'armies', armyId);
                const armyDoc = await getDoc(armyRef);

                if (!armyDoc.exists()) {
                    setError('Army not found');
                    setLoading(false);
                    return;
                }

                const armyData = { id: armyDoc.id, ...armyDoc.data() };
                setArmy(armyData);

                // 2. Fetch commander names from units in this army
                const commanderUnits = [];
                if (armyData.units?.length > 0) {
                    for (const unitId of armyData.units) {
                        const unitRef = doc(db, 'users', currentUser.uid, 'units', unitId);
                        const unitDoc = await getDoc(unitRef);

                        if (unitDoc.exists()) {
                            const unitData = unitDoc.data();
                            // For simplicity, treat all Command and Operative units as potential commanders
                            if (unitData.type === 'COMMAND' || unitData.type === 'OPERATIVE') {
                                commanderUnits.push(unitData.name);
                            }
                        }
                    }
                }
                setCommanderNames(commanderUnits);

                // 3. Get system cards available for this army's faction
                const systemCardsList = CommandCards.getAvailableCardsForFaction(armyData.faction)
                    .map(cardId => ({
                        id: cardId,
                        name: CommandCards.getDisplayName(cardId),
                        pips: CommandCards.getPips(cardId),
                        faction: CommandCards.getFaction(cardId),
                        description: CommandCards.getDescription(cardId),
                        commander: CommandCards.getCommanderRequirement(cardId),
                        isSystem: true
                    }));

                // 4. Get custom command cards from Firestore
                const customCardsRef = collection(db, 'users', currentUser.uid, 'commandCards');
                const customCardsSnapshot = await getDocs(customCardsRef);

                const customCardsList = customCardsSnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(card => {
                        // Keep cards that are:
                        // - Universal (null/empty faction) OR match the army's faction
                        // - AND are either marked as universal for all armies OR have no specific army assigned
                        return (
                            (!card.faction || card.faction === '' || card.faction === armyData.faction) &&
                            (card.isUniversal || !card.armies || card.armies.length === 0 || card.armies.includes(armyId))
                        );
                    });

                // 5. Combine both card lists and set them as available
                const allAvailableCards = [...systemCardsList, ...customCardsList].sort((a, b) => {
                    // Sort by pips first
                    if (a.pips !== b.pips) return a.pips - b.pips;
                    // Then by name
                    return a.name.localeCompare(b.name);
                });

                setAvailableCards(allAvailableCards);

                // 6. Set selected cards from army data
                if (armyData.commandCards) {
                    setSelectedCards(armyData.commandCards);
                }
            } catch (err) {
                console.error('Error fetching army data:', err);
                setError('Failed to load army command cards: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchArmyData();
    }, [currentUser, armyId]);

    const isCardUsable = (card) => {
        // Check if card requires a commander that's in the army
        if (card.commander && !commanderNames.includes(card.commander)) {
            return false;
        }

        return true;
    };

    const getCardPipCount = (pip) => {
        return selectedCards.filter(cardId => {
            const card = availableCards.find(c => c.id === cardId);
            return card && card.pips === pip;
        }).length;
    };

    const handleAddCard = (cardId) => {
        if (selectedCards.length >= MAX_CARDS) {
            setError(`Cannot add more than ${MAX_CARDS} command cards to an army.`);
            return;
        }

        if (selectedCards.includes(cardId)) {
            setError('This card is already in your army.');
            return;
        }

        // Check if adding this card would exceed the pip count limits
        const card = availableCards.find(c => c.id === cardId);
        if (card) {
            const pipCount = getCardPipCount(card.pips);
            if (pipCount >= 2) {
                setError(`Cannot add more than 2 command cards with ${card.pips} pip${card.pips !== 1 ? 's' : ''}.`);
                return;
            }
        }

        setSelectedCards([...selectedCards, cardId]);
        setError('');
    };

    const handleRemoveCard = (cardId) => {
        setSelectedCards(selectedCards.filter(id => id !== cardId));
    };

    const handleSaveCards = async () => {
        if (!currentUser || !armyId) return;

        try {
            setSaving(true);

            // Update the army document with the selected command cards
            const armyRef = doc(db, 'users', currentUser.uid, 'armies', armyId);
            await updateDoc(armyRef, {
                commandCards: selectedCards
            });

            setSuccess('Command cards saved successfully!');

            // Clear success message after a few seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error saving command cards:', err);
            setError('Failed to save command cards: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Filter available cards based on search term
    const filteredAvailableCards = availableCards.filter(card => {
        if (!searchTerm) return true;

        return (
            card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (card.description && card.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    });

    if (loading) {
        return <LoadingSpinner text="Loading army command cards..." />;
    }

    if (!army) {
        return (
            <Alert variant="danger">
                Army not found. Please select a valid army.
                <div className="mt-3">
                    <Button variant="primary" as={Link} to="/armies">
                        Back to Armies
                    </Button>
                </div>
            </Alert>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Command Cards: {army.name}</h2>
                <div>
                    <Button
                        variant="outline-secondary"
                        as={Link}
                        to={`/armies/${armyId}`}
                        className="me-2"
                    >
                        Back to Army
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSaveCards}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Command Cards'}
                    </Button>
                </div>
            </div>

            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

            <Row>
                <Col md={7}>
                    <Card className="mb-4">
                        <Card.Header className={`faction-${army.faction}`}>
                            <h4 className="mb-0">Selected Command Cards ({selectedCards.length}/{MAX_CARDS})</h4>
                        </Card.Header>
                        <Card.Body>
                            {selectedCards.length === 0 ? (
                                <Alert variant="info">
                                    No command cards selected. Add cards from the list on the right.
                                </Alert>
                            ) : (
                                <>
                                    <Row className="mb-3">
                                        <Col md={4}>
                                            <div className="text-center">
                                                <h5>1 Pip</h5>
                                                <Badge bg="secondary" className="mb-2">{getCardPipCount(1)}/2</Badge>
                                            </div>
                                        </Col>
                                        <Col md={4}>
                                            <div className="text-center">
                                                <h5>2 Pips</h5>
                                                <Badge bg="secondary" className="mb-2">{getCardPipCount(2)}/2</Badge>
                                            </div>
                                        </Col>
                                        <Col md={4}>
                                            <div className="text-center">
                                                <h5>3+ Pips</h5>
                                                <Badge bg="secondary" className="mb-2">{getCardPipCount(3) + getCardPipCount(4)}/3</Badge>
                                            </div>
                                        </Col>
                                    </Row>

                                    <ListGroup>
                                        {selectedCards.map(cardId => {
                                            const card = availableCards.find(c => c.id === cardId);
                                            if (!card) return null;

                                            return (
                                                <ListGroup.Item
                                                    key={cardId}
                                                    className="d-flex justify-content-between align-items-center"
                                                >
                                                    <div>
                                                        <div className="d-flex align-items-center">
                                                            <div className="me-2 pips-display">
                                                                {[...Array(card.pips)].map((_, i) => (
                                                                    <i key={i} className="bi bi-circle-fill me-1"></i>
                                                                ))}
                                                            </div>
                                                            <h5 className="mb-0">{card.name}</h5>
                                                        </div>

                                                        <div className="mt-1">
                                                            {card.faction ? (
                                                                <Badge bg="primary" className="me-2">{Factions.getDisplayName(card.faction)}</Badge>
                                                            ) : (
                                                                <Badge bg="secondary" className="me-2">Universal</Badge>
                                                            )}

                                                            {card.commander && (
                                                                <Badge bg="info" className="me-2">{card.commander}</Badge>
                                                            )}

                                                            {card.isSystem ? (
                                                                <Badge bg="dark">System</Badge>
                                                            ) : (
                                                                <Badge bg="success">Custom</Badge>
                                                            )}
                                                        </div>

                                                        <p className="mt-1 mb-0 small">{card.description}</p>
                                                    </div>

                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleRemoveCard(cardId)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </ListGroup.Item>
                                            );
                                        })}
                                    </ListGroup>
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={5}>
                    <Card>
                        <Card.Header>
                            <h4 className="mb-0">Available Command Cards</h4>
                        </Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="text"
                                    placeholder="Search available cards..."
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    value={searchTerm}
                                />
                            </Form.Group>

                            <ListGroup>
                                {filteredAvailableCards.map(card => {
                                    // Skip cards that are already selected
                                    if (selectedCards.includes(card.id)) {
                                        return null;
                                    }

                                    const isUsable = isCardUsable(card);

                                    return (
                                        <ListGroup.Item
                                            key={card.id}
                                            className="d-flex justify-content-between align-items-center"
                                            disabled={!isUsable}
                                        >
                                            <div>
                                                <div className="d-flex align-items-center">
                                                    <div className="me-2 pips-display">
                                                        {[...Array(card.pips)].map((_, i) => (
                                                            <i key={i} className="bi bi-circle-fill me-1"></i>
                                                        ))}
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-0">{card.name}</h6>
                                                        <div className="small">
                                                            {card.faction ? (
                                                                <Badge bg="primary" size="sm" className="me-1">{Factions.getDisplayName(card.faction)}</Badge>
                                                            ) : (
                                                                <Badge bg="secondary" size="sm" className="me-1">Universal</Badge>
                                                            )}

                                                            {card.isSystem ? (
                                                                <Badge bg="dark" size="sm">System</Badge>
                                                            ) : (
                                                                <Badge bg="success" size="sm">Custom</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {!isUsable && card.commander && (
                                                    <div className="text-danger small mt-1">
                                                        Requires commander: {card.commander}
                                                    </div>
                                                )}
                                            </div>

                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => handleAddCard(card.id)}
                                                disabled={!isUsable}
                                            >
                                                Add
                                            </Button>
                                        </ListGroup.Item>
                                    );
                                })}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <div className="mt-4">
                <Alert variant="info">
                    <p className="mb-1"><strong>Command Card Rules:</strong></p>
                    <ul className="mb-0">
                        <li>Maximum of {MAX_CARDS} command cards per army</li>
                        <li>Up to 2 cards with 1 pip</li>
                        <li>Up to 2 cards with 2 pips</li>
                        <li>Up to 3 cards with 3 or more pips</li>
                        <li>Cards that require a specific commander can only be used if that commander is in your army</li>
                    </ul>
                </Alert>
            </div>
        </div>
    );
};

export default ArmyCommandCards;