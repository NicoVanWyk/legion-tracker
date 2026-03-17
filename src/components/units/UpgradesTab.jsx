import React from 'react';
import {Card, Button, Alert, ListGroup, Row, Col, Form} from 'react-bootstrap';
import UpgradeCardTypes from '../../enums/UpgradeCardTypes';
import UpgradeCardSelector from '../upgrades/UpgradeCardSelector';

const UpgradesTab = ({upgradeSlots, setFormData, availableUpgrades}) => {
    const addUpgradeSlot = () => {
        setFormData(prev => ({
            ...prev,
            upgradeSlots: [
                ...prev.upgradeSlots,
                {type: UpgradeCardTypes.GEAR, maxCount: 1, equippedUpgrades: []}
            ]
        }));
    };

    const updateUpgradeSlot = (index, field, value) => {
        setFormData(prev => {
            const updated = [...prev.upgradeSlots];
            updated[index] = {...updated[index], [field]: value};
            return {...prev, upgradeSlots: updated};
        });
    };

    const removeUpgradeSlot = (index) => {
        setFormData(prev => ({
            ...prev,
            upgradeSlots: prev.upgradeSlots.filter((_, i) => i !== index)
        }));
    };

    const handleUpgradeChange = (index, upgrades) => {
        setFormData(prev => {
            const slots = [...prev.upgradeSlots];
            slots[index].equippedUpgrades = upgrades;
            return {...prev, upgradeSlots: slots};
        });
    };

    return (
        <Card>
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5>Upgrade Slots</h5>
                    <Button onClick={addUpgradeSlot}>+ Add Slot</Button>
                </div>

                {upgradeSlots.length === 0 ? (
                    <Alert>No upgrade slots added yet</Alert>
                ) : (
                    <ListGroup>
                        {upgradeSlots.map((slot, i) => (
                            <ListGroup.Item key={i}>
                                <Row>
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label>Type</Form.Label>
                                            <Form.Select
                                                value={slot.type}
                                                onChange={(e) => updateUpgradeSlot(i, 'type', e.target.value)}
                                            >
                                                {UpgradeCardTypes.getAllTypes().map((type) => (
                                                    <option key={type} value={type}>
                                                        {UpgradeCardTypes.getDisplayName(type)}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>Max Count</Form.Label>
                                            <Form.Control
                                                type="number"
                                                value={slot.maxCount}
                                                onChange={(e) => updateUpgradeSlot(i, 'maxCount', parseInt(e.target.value) || 1)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={5}>
                                        <UpgradeCardSelector
                                            upgradeType={slot.type}
                                            selectedUpgrades={slot.equippedUpgrades || []}
                                            onChange={(u) => handleUpgradeChange(i, u)}
                                            maxCount={slot.maxCount}
                                        />
                                    </Col>
                                </Row>
                                <div className="mt-2 text-end">
                                    <Button variant="outline-danger" size="sm"
                                            onClick={() => removeUpgradeSlot(i)}>
                                        Remove Slot
                                    </Button>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Card.Body>
        </Card>
    );
};

export default UpgradesTab;