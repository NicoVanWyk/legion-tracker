// src/components/battles/CommandPhase.js
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, ListGroup, Button, Form, Badge, Alert } from 'react-bootstrap';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import UnitTypes from '../../enums/UnitTypes';
import PlayerSides from '../../enums/PlayerSides';
import CommandCards from '../../enums/CommandCards';

const CommandPhase = ({ battle, onUnitUpdate, onSave }) => {
    const [selectedCommandCards, setSelectedCommandCards] = useState({
        blue: battle.blueCommandCard || '',
        red: battle.redCommandCard || ''
    });

    const [blueCommandCards, setBlueCommandCards] = useState([]);
    const [redCommandCards, setRedCommandCards] = useState([]);
    const [blueCommanderNames, setBlueCommanderNames] = useState([]);
    const [redCommanderNames, setRedCommanderNames] = useState([]);
    const [customUnitTypes, setCustomUnitTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [determiningPriority, setDeterminingPriority] = useState(false);
    const [priorityResult, setPriorityResult] = useState(null);

    useEffect(() => {
        const fetchCommandCards = async () => {
            try {
                setLoading(true);
                if (!battle?.blueUnits?.[0]?.userId) return;

                const userId = battle.blueUnits[0].userId || battle.redUnits[0].userId;

                // 1. Fetch custom unit types
                const typesSnap = await getDocs(collection(db, 'users', userId, 'customUnitTypes'));
                setCustomUnitTypes(typesSnap.docs.map(d => ({ id: d.id, ...d.data() })));

                // 2. Get commander names from both armies
                const blueCommanderUnits = battle.blueUnits.filter(u =>
                    u.type === UnitTypes.COMMAND || u.type === UnitTypes.OPERATIVE
                );
                const redCommanderUnits = battle.redUnits.filter(u =>
                    u.type === UnitTypes.COMMAND || u.type === UnitTypes.OPERATIVE
                );

                setBlueCommanderNames(blueCommanderUnits.map(u => u.name));
                setRedCommanderNames(redCommanderUnits.map(u => u.name));

                // 3. Get command cards for blue army
                if (battle.blueArmyId) {
                    const armyRef = doc(db, 'users', userId, 'armies', battle.blueArmyId);
                    const armyDoc = await getDoc(armyRef);

                    if (armyDoc.exists() && armyDoc.data().commandCards?.length > 0) {
                        const cardIds = armyDoc.data().commandCards;
                        const customCardsSnap = await getDocs(collection(db, 'users', userId, 'commandCards'));
                        const customCards = customCardsSnap.docs
                            .filter(doc => cardIds.includes(doc.id))
                            .map(doc => ({ id: doc.id, ...doc.data(), isSystem: false }));

                        // Add system cards
                        const systemCards = cardIds
                            .filter(id => !customCards.find(c => c.id === id))
                            .map(id => ({
                                id: id,
                                name: CommandCards.getDisplayName(id),
                                pips: CommandCards.getPips(id),
                                faction: CommandCards.getFaction(id),
                                commander: CommandCards.getCommanderRequirement(id),
                                description: CommandCards.getDescription(id),
                                isSystem: true
                            }));

                        setBlueCommandCards([...customCards, ...systemCards]);
                    } else {
                        // Fall back to faction default cards if army has no command cards
                        const defaultCards = CommandCards.getAvailableCardsForFaction(battle.blueFaction || 'republic')
                            .map(id => ({
                                id: id,
                                name: CommandCards.getDisplayName(id),
                                pips: CommandCards.getPips(id),
                                faction: CommandCards.getFaction(id),
                                commander: CommandCards.getCommanderRequirement(id),
                                description: CommandCards.getDescription(id),
                                isSystem: true
                            }));

                        setBlueCommandCards(defaultCards);
                    }
                }

                // 4. Get command cards for red army
                if (battle.redArmyId) {
                    const armyRef = doc(db, 'users', userId, 'armies', battle.redArmyId);
                    const armyDoc = await getDoc(armyRef);

                    if (armyDoc.exists() && armyDoc.data().commandCards?.length > 0) {
                        const cardIds = armyDoc.data().commandCards;
                        const customCardsSnap = await getDocs(collection(db, 'users', userId, 'commandCards'));
                        const customCards = customCardsSnap.docs
                            .filter(doc => cardIds.includes(doc.id))
                            .map(doc => ({ id: doc.id, ...doc.data(), isSystem: false }));

                        // Add system cards
                        const systemCards = cardIds
                            .filter(id => !customCards.find(c => c.id === id))
                            .map(id => ({
                                id: id,
                                name: CommandCards.getDisplayName(id),
                                pips: CommandCards.getPips(id),
                                faction: CommandCards.getFaction(id),
                                commander: CommandCards.getCommanderRequirement(id),
                                description: CommandCards.getDescription(id),
                                isSystem: true
                            }));

                        setRedCommandCards([...customCards, ...systemCards]);
                    } else {
                        // Fall back to faction default cards if army has no command cards
                        const defaultCards = CommandCards.getAvailableCardsForFaction(battle.redFaction || 'empire')
                            .map(id => ({
                                id: id,
                                name: CommandCards.getDisplayName(id),
                                pips: CommandCards.getPips(id),
                                faction: CommandCards.getFaction(id),
                                commander: CommandCards.getCommanderRequirement(id),
                                description: CommandCards.getDescription(id),
                                isSystem: true
                            }));

                        setRedCommandCards(defaultCards);
                    }
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching command cards:', err);
                setError('Failed to load command cards');
                setLoading(false);
            }
        };

        fetchCommandCards();
    }, [battle]);

    const getTypeDisplayName = (type) => {
        if (Object.values(UnitTypes).includes(type)) {
            return UnitTypes.getDisplayName(type);
        }
        const customType = customUnitTypes.find(t => t.name === type);
        return customType ? customType.displayName : type;
    };

    // Toggle order status for a unit
    const toggleUnitOrder = (side, unitId) => {
        const units = side === PlayerSides.BLUE ? battle.blueUnits : battle.redUnits;
        const unit = units.find(u => u.id === unitId);

        if (unit) {
            onUnitUpdate(side, unitId, { hasOrder: !unit.hasOrder });
        }
    };

    // Handle command card selection
    const handleCommandCardChange = (side, cardId) => {
        setSelectedCommandCards(prev => ({
            ...prev,
            [side.toLowerCase()]: cardId
        }));

        // Update battle state with selected command card
        const cardDetails = side === PlayerSides.BLUE
            ? blueCommandCards.find(c => c.id === cardId)
            : redCommandCards.find(c => c.id === cardId);

        if (side === PlayerSides.BLUE) {
            onSave({
                ...battle,
                blueCommandCard: cardId,
                blueCommandCardDetails: cardDetails
            });
        } else {
            onSave({
                ...battle,
                redCommandCard: cardId,
                redCommandCardDetails: cardDetails
            });
        }
    };

    // Check if a commander is valid for a command card
    const isCommanderValid = (side, commanderName) => {
        if (!commanderName) return true;

        const commanderList = side === PlayerSides.BLUE
            ? blueCommanderNames
            : redCommanderNames;

        return commanderList.includes(commanderName);
    };

    // Determine which player has priority based on command cards
    const determineCardPriority = () => {
        setDeterminingPriority(true);

        const blueCard = blueCommandCards.find(c => c.id === selectedCommandCards.blue);
        const redCard = redCommandCards.find(c => c.id === selectedCommandCards.red);

        if (!blueCard || !redCard) {
            setPriorityResult('Both players must select a command card');
            return;
        }

        const bluePips = blueCard.pips;
        const redPips = redCard.pips;

        if (bluePips < redPips) {
            setPriorityResult(`${battle.bluePlayer} has priority (lower pips)`);
            onSave({
                ...battle,
                activePlayer: PlayerSides.BLUE
            });
        } else if (redPips < bluePips) {
            setPriorityResult(`${battle.redPlayer} has priority (lower pips)`);
            onSave({
                ...battle,
                activePlayer: PlayerSides.RED
            });
        } else {
            // Equal pips, roll a die
            const roll = Math.random();
            if (roll < 0.5) {
                setPriorityResult(`${battle.bluePlayer} has priority (equal pips, won roll)`);
                onSave({
                    ...battle,
                    activePlayer: PlayerSides.BLUE
                });
            } else {
                setPriorityResult(`${battle.redPlayer} has priority (equal pips, won roll)`);
                onSave({
                    ...battle,
                    activePlayer: PlayerSides.RED
                });
            }
        }
    };

    // Get the number of orders a commander can issue based on the command card
    const getOrderCount = (side) => {
        const cardId = side === PlayerSides.BLUE
            ? selectedCommandCards.blue
            : selectedCommandCards.red;

        const card = side === PlayerSides.BLUE
            ? blueCommandCards.find(c => c.id === cardId)
            : redCommandCards.find(c => c.id === cardId);

        if (!card) return 0;

        // The pip count is usually the number of orders
        // Standing orders (4 pips) only gives 1 order
        return card.pips === 4 ? 1 : card.pips;
    };

    // Render command card selector for a side
    const renderCommandCardSelector = (side) => {
        const player = side === PlayerSides.BLUE ? battle.bluePlayer : battle.redPlayer;
        const color = side === PlayerSides.BLUE ? 'primary' : 'danger';
        const cards = side === PlayerSides.BLUE ? blueCommandCards : redCommandCards;
        const selectedCard = selectedCommandCards[side.toLowerCase()];

        return (
            <Card className="mb-3">
                <Card.Header className={`bg-${color} text-white d-flex justify-content-between align-items-center`}>
                    <h5 className="mb-0">{player}'s Command Card</h5>
                </Card.Header>
                <Card.Body>
                    <Form.Group>
                        <Form.Select
                            value={selectedCard}
                            onChange={(e) => handleCommandCardChange(side, e.target.value)}
                        >
                            <option value="">Select Command Card</option>
                            {cards.map(card => {
                                const isValid = isCommanderValid(side, card.commander);
                                const pipsDisplay = "●".repeat(card.pips);

                                return (
                                    <option
                                        key={card.id}
                                        value={card.id}
                                        disabled={!isValid}
                                    >
                                        [{pipsDisplay}] {card.name} {!isValid ? '(Missing Commander)' : ''}
                                    </option>
                                );
                            })}
                        </Form.Select>
                    </Form.Group>

                    {selectedCard && (
                        <div className="mt-3">
                            <div className="d-flex justify-content-between">
                                <h6>
                                    {cards.find(c => c.id === selectedCard)?.name}
                                </h6>
                                <div>
                                    {"●".repeat(cards.find(c => c.id === selectedCard)?.pips || 0)}
                                </div>
                            </div>
                            <p className="small mb-2">
                                {cards.find(c => c.id === selectedCard)?.description || 'No description'}
                            </p>
                            <div>
                                <strong>Orders:</strong> {getOrderCount(side)}
                            </div>
                        </div>
                    )}
                </Card.Body>
            </Card>
        );
    };

    // Render units by type for a specific side
    const renderUnitsByType = (side) => {
        const units = side === PlayerSides.BLUE ? battle.blueUnits : battle.redUnits;
        const player = side === PlayerSides.BLUE ? battle.bluePlayer : battle.redPlayer;
        const color = side === PlayerSides.BLUE ? 'primary' : 'danger';
        const orderCount = getOrderCount(side);
        const ordersIssued = units.filter(unit => unit.hasOrder).length;

        // Group units by type
        const unitsByType = units.reduce((acc, unit) => {
            const type = unit.type;
            if (!acc[type]) acc[type] = [];
            acc[type].push(unit);
            return acc;
        }, {});

        // Sort unit types by priority
        const sortedTypes = Object.keys(unitsByType).sort((a, b) => {
            const typeOrder = {
                [UnitTypes.COMMAND]: 1,
                [UnitTypes.CORPS]: 2,
                [UnitTypes.SPECIAL_FORCES]: 3,
                [UnitTypes.SUPPORT]: 4,
                [UnitTypes.HEAVY]: 5,
                [UnitTypes.OPERATIVE]: 6,
                [UnitTypes.AUXILIARY]: 7
            };

            const customOrder = a => {
                const customType = customUnitTypes.find(t => t.name === a);
                return customType ? customType.sortOrder || 100 : 100;
            };

            return (typeOrder[a] || customOrder(a)) - (typeOrder[b] || customOrder(b));
        });

        return (
            <>
                <Card className="mb-3">
                    <Card.Header className={`bg-${color} text-white d-flex justify-content-between align-items-center`}>
                        <h5 className="mb-0">Issue Orders</h5>
                        <span>
              {ordersIssued}/{orderCount} Orders
            </span>
                    </Card.Header>
                    <Card.Body>
                        <Alert variant="info">
                            You can issue orders to {orderCount} units based on the selected command card.
                        </Alert>

                        {ordersIssued > orderCount && (
                            <Alert variant="warning">
                                You have issued too many orders. Please remove some orders.
                            </Alert>
                        )}
                    </Card.Body>
                </Card>

                {sortedTypes.map(type => (
                    <Card key={type} className="mb-3">
                        <Card.Header className={`bg-${color} text-white d-flex justify-content-between align-items-center`}>
                            <span>{getTypeDisplayName(type)}</span>
                            <span>
                {unitsByType[type].filter(unit => unit.hasOrder).length}/{unitsByType[type].length} Orders
              </span>
                        </Card.Header>
                        <ListGroup variant="flush">
                            {unitsByType[type].map(unit => (
                                <ListGroup.Item
                                    key={unit.id}
                                    className="d-flex justify-content-between align-items-center"
                                >
                                    <div>
                                        {unit.name}
                                        {unit.hasOrder && <Badge bg="success" className="ms-2">Order</Badge>}
                                    </div>
                                    <Button
                                        variant={unit.hasOrder ? "outline-success" : "outline-secondary"}
                                        size="sm"
                                        onClick={() => toggleUnitOrder(side, unit.id)}
                                        disabled={ordersIssued >= orderCount && !unit.hasOrder}
                                    >
                                        {unit.hasOrder ? "Remove Order" : "Issue Order"}
                                    </Button>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card>
                ))}
            </>
        );
    };

    if (loading) {
        return (
            <div className="command-phase mt-4">
                <h4 className="mb-3">Command Phase</h4>
                <p className="text-center">Loading command cards...</p>
            </div>
        );
    }

    return (
        <div className="command-phase mt-4">
            <h4 className="mb-3">Command Phase</h4>
            <p className="mb-4">
                Select command cards and issue orders to units on the battlefield.
            </p>

            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}

            <Row className="mb-4">
                <Col md={6}>
                    {renderCommandCardSelector(PlayerSides.BLUE)}
                </Col>

                <Col md={6}>
                    {renderCommandCardSelector(PlayerSides.RED)}
                </Col>
            </Row>

            {selectedCommandCards.blue && selectedCommandCards.red && !determiningPriority && (
                <div className="text-center mb-4">
                    <Button
                        variant="primary"
                        onClick={determineCardPriority}
                    >
                        Determine Priority
                    </Button>
                </div>
            )}

            {priorityResult && (
                <Alert variant="success" className="mb-4 text-center">
                    <h5>{priorityResult}</h5>
                    <p className="mb-0">
                        The active player may now issue orders to units.
                    </p>
                </Alert>
            )}

            {priorityResult && (
                <Row>
                    <Col md={6}>
                        <h5 className="text-primary mb-3">Blue Side: {battle.bluePlayer}</h5>
                        {renderUnitsByType(PlayerSides.BLUE)}
                    </Col>

                    <Col md={6}>
                        <h5 className="text-danger mb-3">Red Side: {battle.redPlayer}</h5>
                        {renderUnitsByType(PlayerSides.RED)}
                    </Col>
                </Row>
            )}
        </div>
    );
};

export default CommandPhase;