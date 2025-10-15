// src/components/battles/UnitTracker.js
import React, { useState } from 'react';
import { Row, Col, Card, Button, Form, Badge, InputGroup } from 'react-bootstrap';

const UnitTracker = ({ unit, onUpdate }) => {
    const [wounds, setWounds] = useState(unit.currentWounds || unit.wounds);
    const [suppression, setSuppression] = useState(unit.suppression || 0);
    const [surgeAttackUsed, setSurgeAttackUsed] = useState(false);
    const [surgeDefenseUsed, setSurgeDefenseUsed] = useState(false);

    const [tokens, setTokens] = useState({
        aim: unit.tokens?.aim || 0,
        dodge: unit.tokens?.dodge || 0,
        surge: unit.tokens?.surge || 0,
        shield: unit.tokens?.shield || 0,
        ion: unit.tokens?.ion || 0,
        smoke: unit.tokens?.smoke || 0,
        standby: unit.tokens?.standby || 0
    });

    // Apply changes immediately
    const applyChanges = () => {
        onUpdate({
            currentWounds: wounds,
            suppression,
            tokens,
            surgeAttackUsed,
            surgeDefenseUsed
        });
    };

    // Handle number input changes
    const handleNumberChange = (e, setter, field, min = 0, max = 100) => {
        const value = parseInt(e.target.value, 10);
        const newValue = isNaN(value) ? min : Math.max(min, Math.min(max, value));

        setter(newValue);

        // For tokens, update the specific token
        if (field && field.startsWith('token_')) {
            const tokenName = field.replace('token_', '');
            const updatedTokens = { ...tokens, [tokenName]: newValue };
            setTokens(updatedTokens);

            // Update parent component
            onUpdate({
                currentWounds: wounds,
                suppression,
                tokens: updatedTokens,
                surgeAttackUsed,
                surgeDefenseUsed
            });
        } else {
            // Update parent component with other fields
            onUpdate({
                currentWounds: field === 'wounds' ? newValue : wounds,
                suppression: field === 'suppression' ? newValue : suppression,
                tokens,
                surgeAttackUsed,
                surgeDefenseUsed
            });
        }
    };

    // Handle checkbox changes
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;

        if (name === 'surgeAttackUsed') {
            setSurgeAttackUsed(checked);
            onUpdate({
                currentWounds: wounds,
                suppression,
                tokens,
                surgeAttackUsed: checked,
                surgeDefenseUsed
            });
        } else if (name === 'surgeDefenseUsed') {
            setSurgeDefenseUsed(checked);
            onUpdate({
                currentWounds: wounds,
                suppression,
                tokens,
                surgeAttackUsed,
                surgeDefenseUsed: checked
            });
        }
    };

    // Increment/decrement buttons for any value
    const adjustValue = (setter, field, amount, min = 0, max = 100) => {
        setter(prev => {
            const newValue = Math.max(min, Math.min(max, prev + amount));

            // For tokens, update the specific token
            if (field && field.startsWith('token_')) {
                const tokenName = field.replace('token_', '');
                const updatedTokens = { ...tokens, [tokenName]: newValue };
                setTokens(updatedTokens);

                // Update parent component
                onUpdate({
                    currentWounds: wounds,
                    suppression,
                    tokens: updatedTokens,
                    surgeAttackUsed,
                    surgeDefenseUsed
                });
            } else {
                // Update parent component with other fields
                onUpdate({
                    currentWounds: field === 'wounds' ? newValue : wounds,
                    suppression: field === 'suppression' ? newValue : suppression,
                    tokens,
                    surgeAttackUsed,
                    surgeDefenseUsed
                });
            }

            return newValue;
        });
    };

    // Token counter component
    const TokenCounter = ({ name, value, icon, color = 'primary' }) => {
        return (
            <Card className="mb-2">
                <Card.Body className="p-2">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <Badge bg={color} className="me-2">{icon}</Badge>
                            {name}
                        </div>
                        <InputGroup size="sm" className="w-50">
                            <Button
                                variant="outline-secondary"
                                onClick={() => adjustValue(
                                    () => {},
                                    `token_${name.toLowerCase()}`,
                                    -1,
                                    0
                                )}
                                disabled={tokens[name.toLowerCase()] <= 0}
                            >
                                -
                            </Button>
                            <Form.Control
                                type="number"
                                value={tokens[name.toLowerCase()]}
                                onChange={(e) => handleNumberChange(
                                    e,
                                    () => {},
                                    `token_${name.toLowerCase()}`,
                                    0
                                )}
                                min="0"
                                style={{ textAlign: 'center' }}
                            />
                            <Button
                                variant="outline-secondary"
                                onClick={() => adjustValue(
                                    () => {},
                                    `token_${name.toLowerCase()}`,
                                    1,
                                    0
                                )}
                            >
                                +
                            </Button>
                        </InputGroup>
                    </div>
                </Card.Body>
            </Card>
        );
    };

    return (
        <div>
            <Row className="mb-4">
                <Col md={6}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Unit Status</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <Form.Label>Wounds ({wounds}/{unit.wounds})</Form.Label>
                                <InputGroup>
                                    <Button
                                        variant="outline-danger"
                                        onClick={() => adjustValue(setWounds, 'wounds', -1, 0, unit.wounds)}
                                        disabled={wounds <= 0}
                                    >
                                        Take Wound
                                    </Button>
                                    <Form.Control
                                        type="number"
                                        value={wounds}
                                        onChange={(e) => handleNumberChange(e, setWounds, 'wounds', 0, unit.wounds)}
                                        min="0"
                                        max={unit.wounds}
                                    />
                                    <Button
                                        variant="outline-success"
                                        onClick={() => adjustValue(setWounds, 'wounds', 1, 0, unit.wounds)}
                                        disabled={wounds >= unit.wounds}
                                    >
                                        Heal Wound
                                    </Button>
                                </InputGroup>
                            </div>

                            <div className="mb-3">
                                <Form.Label>
                                    Suppression
                                    {suppression >= 3 && (
                                        <Badge bg="warning" className="ms-2">Suppressed</Badge>
                                    )}
                                    {suppression >= 6 && (
                                        <Badge bg="danger" className="ms-2">Panicked</Badge>
                                    )}
                                </Form.Label>
                                <InputGroup>
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => adjustValue(setSuppression, 'suppression', -1, 0)}
                                        disabled={suppression <= 0}
                                    >
                                        Remove
                                    </Button>
                                    <Form.Control
                                        type="number"
                                        value={suppression}
                                        onChange={(e) => handleNumberChange(e, setSuppression, 'suppression', 0)}
                                        min="0"
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => adjustValue(setSuppression, 'suppression', 1, 0)}
                                    >
                                        Add
                                    </Button>
                                </InputGroup>
                            </div>

                            <div className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    label="Unit has activated"
                                    checked={unit.hasActivated}
                                    onChange={(e) => onUpdate({ hasActivated: e.target.checked })}
                                />
                            </div>

                            <div className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    label="Unit has order"
                                    checked={unit.hasOrder}
                                    onChange={(e) => onUpdate({ hasOrder: e.target.checked })}
                                />
                            </div>

                            {/* Surge Section */}
                            {(unit.surgeAttack || unit.surgeDefense) && (
                                <Card className="mb-3">
                                    <Card.Header className="p-2">
                                        <h6 className="mb-0">Surge Abilities</h6>
                                    </Card.Header>
                                    <Card.Body className="p-2">
                                        {unit.surgeAttack && (
                                            <Form.Check
                                                type="checkbox"
                                                id="surge-attack-used"
                                                name="surgeAttackUsed"
                                                label="Surge to Attack Used"
                                                checked={surgeAttackUsed}
                                                onChange={handleCheckboxChange}
                                                className="mb-2"
                                            />
                                        )}
                                        {unit.surgeDefense && (
                                            <Form.Check
                                                type="checkbox"
                                                id="surge-defense-used"
                                                name="surgeDefenseUsed"
                                                label="Surge to Defense Used"
                                                checked={surgeDefenseUsed}
                                                onChange={handleCheckboxChange}
                                            />
                                        )}
                                    </Card.Body>
                                </Card>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Tokens</h5>
                        </Card.Header>
                        <Card.Body>
                            <TokenCounter name="Aim" value={tokens.aim} icon="🎯" color="primary" />
                            <TokenCounter name="Dodge" value={tokens.dodge} icon="🛡️" color="success" />
                            <TokenCounter name="Surge" value={tokens.surge} icon="⚡" color="warning" />
                            <TokenCounter name="Shield" value={tokens.shield} icon="🔄" color="info" />
                            <TokenCounter name="Ion" value={tokens.ion} icon="⚡" color="danger" />
                            <TokenCounter name="Smoke" value={tokens.smoke} icon="💨" color="secondary" />
                            <TokenCounter name="Standby" value={tokens.standby} icon="⏲️" color="dark" />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <div className="d-flex justify-content-end">
                <Button
                    variant="primary"
                    onClick={applyChanges}
                >
                    Apply All Changes
                </Button>
            </div>
        </div>
    );
};

export default UnitTracker;