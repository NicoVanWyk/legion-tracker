// src/components/battles/CasualtyQuickLogger.jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, ListGroup, Row, Col, Alert } from 'react-bootstrap';

const CasualtyQuickLogger = ({ unit, onUpdateModels, onClose }) => {
    const [models, setModels] = useState([]);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (unit.models && unit.models.length > 0) {
            setModels([...unit.models]);
        } else {
            // Initialize models if not present
            const initialModels = [];
            let modelId = 0;

            // Add base unit models
            const baseCount = unit.minModelCount || 1;
            for (let i = 0; i < baseCount; i++) {
                initialModels.push({
                    id: modelId++,
                    name: `${unit.name} #${i + 1}`,
                    type: 'base',
                    source: 'Base Unit',
                    isAlive: true,
                    weapons: unit.weapons || [],
                    abilities: unit.abilities || [],
                    keywords: unit.keywords || []
                });
            }

            setModels(initialModels);
        }
    }, [unit]);

    // Toggle model alive status
    const toggleModel = (modelId) => {
        const updatedModels = models.map(model =>
            model.id === modelId ? { ...model, isAlive: !model.isAlive } : model
        );
        setModels(updatedModels);
        setHasChanges(true);
    };

    // Quick kill multiple models
    const killModels = (count) => {
        let remainingKills = count;
        const updatedModels = [...models];

        for (let i = 0; i < updatedModels.length && remainingKills > 0; i++) {
            if (updatedModels[i].isAlive) {
                updatedModels[i].isAlive = false;
                remainingKills--;
            }
        }

        setModels(updatedModels);
        setHasChanges(true);
    };

    // Revive all models
    const reviveAll = () => {
        const updatedModels = models.map(model => ({ ...model, isAlive: true }));
        setModels(updatedModels);
        setHasChanges(true);
    };

    // Save changes
    const saveChanges = () => {
        onUpdateModels(models);
        setHasChanges(false);
        onClose();
    };

    // Get weapon counts from alive models
    const getWeaponSummary = () => {
        const weaponCounts = {};
        
        models.filter(m => m.isAlive).forEach(model => {
            model.weapons?.forEach(weapon => {
                weaponCounts[weapon.name] = (weaponCounts[weapon.name] || 0) + 1;
            });
        });

        return Object.entries(weaponCounts);
    };

    const aliveCount = models.filter(m => m.isAlive).length;
    const deadCount = models.filter(m => !m.isAlive).length;
    const totalCount = models.length;
    const weaponSummary = getWeaponSummary();

    return (
        <div className="casualty-quick-logger">
            {/* Summary Header */}
            <Card className="mb-3">
                <Card.Body className="p-3">
                    <Row className="text-center">
                        <Col xs={4}>
                            <div className="h4 text-success mb-1">{aliveCount}</div>
                            <div className="small text-muted">Alive</div>
                        </Col>
                        <Col xs={4}>
                            <div className="h4 text-danger mb-1">{deadCount}</div>
                            <div className="small text-muted">Casualties</div>
                        </Col>
                        <Col xs={4}>
                            <div className="h4 text-primary mb-1">{totalCount}</div>
                            <div className="small text-muted">Total</div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Quick Actions */}
            <Card className="mb-3">
                <Card.Header className="p-2">
                    <h6 className="mb-0">Quick Actions</h6>
                </Card.Header>
                <Card.Body className="p-2">
                    <Row className="g-2">
                        <Col xs={6}>
                            <Button
                                variant="danger"
                                size="sm"
                                className="w-100"
                                onClick={() => killModels(1)}
                                disabled={aliveCount === 0}
                            >
                                Kill 1
                            </Button>
                        </Col>
                        <Col xs={6}>
                            <Button
                                variant="danger"
                                size="sm"
                                className="w-100"
                                onClick={() => killModels(2)}
                                disabled={aliveCount < 2}
                            >
                                Kill 2
                            </Button>
                        </Col>
                        <Col xs={6}>
                            <Button
                                variant="danger"
                                size="sm"
                                className="w-100"
                                onClick={() => killModels(3)}
                                disabled={aliveCount < 3}
                            >
                                Kill 3
                            </Button>
                        </Col>
                        <Col xs={6}>
                            <Button
                                variant="success"
                                size="sm"
                                className="w-100"
                                onClick={reviveAll}
                                disabled={deadCount === 0}
                            >
                                Revive All
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Individual Models */}
            <Card className="mb-3">
                <Card.Header className="p-2">
                    <h6 className="mb-0">Individual Models</h6>
                </Card.Header>
                <ListGroup variant="flush">
                    {models.map(model => (
                        <ListGroup.Item 
                            key={model.id}
                            className="p-2"
                            variant={model.isAlive ? '' : 'danger'}
                        >
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="flex-grow-1">
                                    <div className="d-flex align-items-center">
                                        <strong>{model.name}</strong>
                                        {!model.isAlive && (
                                            <Badge bg="danger" className="ms-2 small">KIA</Badge>
                                        )}
                                    </div>
                                    <div className="small text-muted">{model.source}</div>
                                    {model.weapons?.length > 0 && (
                                        <div className="small text-muted">
                                            Weapons: {model.weapons.map(w => w.name).join(', ')}
                                        </div>
                                    )}
                                </div>
                                
                                <Button
                                    size="sm"
                                    variant={model.isAlive ? 'outline-danger' : 'outline-success'}
                                    onClick={() => toggleModel(model.id)}
                                >
                                    {model.isAlive ? 'Kill' : 'Revive'}
                                </Button>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Card>

            {/* Weapon Summary */}
            {weaponSummary.length > 0 && (
                <Card className="mb-3">
                    <Card.Header className="p-2">
                        <h6 className="mb-0">Active Weapons</h6>
                    </Card.Header>
                    <Card.Body className="p-2">
                        <div className="d-flex flex-wrap gap-1">
                            {weaponSummary.map(([weaponName, count]) => (
                                <Badge key={weaponName} bg="info">
                                    {weaponName} x{count}
                                </Badge>
                            ))}
                        </div>
                    </Card.Body>
                </Card>
            )}

            {/* Warning for Lost Effects */}
            {deadCount > 0 && (
                <Alert variant="warning" className="mb-3">
                    <div className="small">
                        <strong>Effects Lost:</strong>
                        <ul className="mb-0 mt-1">
                            <li>{models.filter(m => !m.isAlive).flatMap(m => m.weapons).length} weapon(s)</li>
                            <li>{models.filter(m => !m.isAlive).flatMap(m => m.abilities).length} ability(ies)</li>
                            <li>{models.filter(m => !m.isAlive).flatMap(m => m.keywords).length} keyword(s)</li>
                        </ul>
                    </div>
                </Alert>
            )}

            {/* Action Buttons */}
            <div className="d-flex gap-2">
                <Button
                    variant="secondary"
                    onClick={onClose}
                    className="flex-grow-1"
                >
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={saveChanges}
                    disabled={!hasChanges}
                    className="flex-grow-1"
                >
                    Save Changes
                </Button>
            </div>
        </div>
    );
};

export default CasualtyQuickLogger;