import React, {useState} from 'react';
import {Card, ListGroup, Form, Button, Badge, Row, Col, Collapse} from 'react-bootstrap';

const AoSUnitTracker = ({units, playerNumber, onUnitUpdate}) => {
    const [expandedUnit, setExpandedUnit] = useState(null);

    const handleModelChange = (index, newCount) => {
        const unit = units[index];
        const validCount = Math.max(0, Math.min(newCount, unit.startingModels));
        onUnitUpdate(playerNumber, index, {
            currentModels: validCount,
            isDefeated: validCount === 0
        });
    };

    const handleWoundChange = (index, newWounds) => {
        const unit = units[index];
        const validWounds = Math.max(0, Math.min(newWounds, unit.maxWounds));
        onUnitUpdate(playerNumber, index, {
            currentWounds: validWounds
        });
    };

    const toggleDefeat = (index) => {
        const unit = units[index];
        onUnitUpdate(playerNumber, index, {
            isDefeated: !unit.isDefeated,
            currentModels: unit.isDefeated ? unit.startingModels : 0
        });
    };

    return (
        <Card>
            <Card.Header>
                <h5 className="mb-0">Units ({units.length})</h5>
            </Card.Header>
            <Card.Body style={{maxHeight: '500px', overflowY: 'auto'}}>
                <ListGroup variant="flush">
                    {units.map((unit, index) => (
                        <ListGroup.Item
                            key={index}
                            className={unit.isDefeated ? 'bg-light text-muted' : ''}
                        >
                            <div
                                className="d-flex justify-content-between align-items-center"
                                onClick={() => setExpandedUnit(expandedUnit === index ? null : index)}
                                style={{cursor: 'pointer'}}
                            >
                                <div>
                                    <strong>{unit.name}</strong>
                                    {unit.isDefeated && <Badge bg="danger" className="ms-2">Defeated</Badge>}
                                    {unit.hasBattleDamaged && unit.maxWounds > 0 && (
                                        <Badge bg="warning" text="dark" className="ms-2">Battle Damaged</Badge>
                                    )}
                                    <div className="small text-muted">
                                        Models: {unit.currentModels}/{unit.startingModels}
                                        {unit.maxWounds > 0 && ` | Wounds: ${unit.currentWounds}/${unit.maxWounds}`}
                                    </div>
                                </div>
                                <i className={`bi bi-chevron-${expandedUnit === index ? 'up' : 'down'}`}></i>
                            </div>

                            <Collapse in={expandedUnit === index}>
                                <div className="mt-3">
                                    <Row>
                                        <Col md={unit.maxWounds > 0 ? 6 : 12}>
                                            <Form.Group className="mb-2">
                                                <Form.Label className="small">Model Count</Form.Label>
                                                <Form.Range
                                                    min="0"
                                                    max={unit.startingModels}
                                                    value={unit.currentModels}
                                                    onChange={(e) => handleModelChange(index, parseInt(e.target.value))}
                                                    disabled={unit.isDefeated}
                                                />
                                                <div className="text-center small">
                                                    {unit.currentModels} / {unit.startingModels}
                                                </div>
                                            </Form.Group>
                                        </Col>

                                        {unit.maxWounds > 0 && (
                                            <Col md={6}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className="small">Wounds (per model)</Form.Label>
                                                    <Form.Range
                                                        min="0"
                                                        max={unit.maxWounds}
                                                        value={unit.currentWounds}
                                                        onChange={(e) => handleWoundChange(index, parseInt(e.target.value))}
                                                        disabled={unit.isDefeated}
                                                    />
                                                    <div className="text-center small">
                                                        {unit.currentWounds} / {unit.maxWounds}
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                        )}
                                    </Row>

                                    <Button
                                        variant={unit.isDefeated ? 'success' : 'danger'}
                                        size="sm"
                                        onClick={() => toggleDefeat(index)}
                                        className="w-100"
                                    >
                                        {unit.isDefeated ? 'Restore Unit' : 'Mark as Defeated'}
                                    </Button>
                                </div>
                            </Collapse>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Card.Body>
        </Card>
    );
};

export default AoSUnitTracker;