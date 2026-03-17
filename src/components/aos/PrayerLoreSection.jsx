import React, {useState} from 'react';
import {Form, Button, Card, Row, Col, Badge, ListGroup} from 'react-bootstrap';
import AoSPhases from '../../enums/aos/AoSPhases';
import AoSAbilityFrequency from '../../enums/aos/AoSAbilityFrequency';
import ArmyContentKeywordSelector from './ArmyContentKeywordSelector';

const PrayerLoreSection = ({prayers, onUpdate}) => {
    const [newPrayer, setNewPrayer] = useState({
        name: '',
        prayerValue: 3,
        description: '',
        range: '',
        effect: '',
        phase: AoSPhases.HERO,
        frequency: AoSAbilityFrequency.UNLIMITED,
        keywords: []
    });
    const [editingIndex, setEditingIndex] = useState(null);

    const addPrayer = () => {
        if (!newPrayer.name.trim()) return;

        if (editingIndex !== null) {
            onUpdate(prayers.map((prayer, i) => i === editingIndex ? {...newPrayer} : prayer));
            setEditingIndex(null);
        } else {
            onUpdate([...prayers, {...newPrayer}]);
        }

        resetForm();
    };

    const editPrayer = (index) => {
        setNewPrayer({...prayers[index]});
        setEditingIndex(index);
    };

    const cancelEdit = () => {
        resetForm();
        setEditingIndex(null);
    };

    const removePrayer = (index) => {
        onUpdate(prayers.filter((_, i) => i !== index));
        if (editingIndex === index) {
            cancelEdit();
        }
    };

    const resetForm = () => {
        setNewPrayer({
            name: '',
            prayerValue: 3,
            description: '',
            range: '',
            effect: '',
            phase: AoSPhases.HERO,
            frequency: AoSAbilityFrequency.UNLIMITED,
            keywords: []
        });
    };

    return (
        <Card className="mb-3">
            <Card.Header>Prayers</Card.Header>
            <Card.Body>
                <Row className="mb-3">
                    <Col md={12}>
                        <Form.Group className="mb-2">
                            <Form.Label>Prayer Name</Form.Label>
                            <Form.Control
                                placeholder="Prayer name"
                                value={newPrayer.name}
                                onChange={(e) => setNewPrayer(prev => ({...prev, name: e.target.value}))}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="Brief description of the prayer"
                                value={newPrayer.description}
                                onChange={(e) => setNewPrayer(prev => ({...prev, description: e.target.value}))}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={2}>
                        <Form.Group>
                            <Form.Label>Prayer Value</Form.Label>
                            <Form.Control
                                type="number"
                                value={newPrayer.prayerValue}
                                onChange={(e) => setNewPrayer(prev => ({
                                    ...prev,
                                    prayerValue: parseInt(e.target.value)
                                }))}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Form.Group>
                            <Form.Label>Range</Form.Label>
                            <Form.Control
                                placeholder="Range"
                                value={newPrayer.range}
                                onChange={(e) => setNewPrayer(prev => ({...prev, range: e.target.value}))}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>Phase</Form.Label>
                            <Form.Select value={newPrayer.phase} onChange={(e) => setNewPrayer(prev => ({
                                ...prev,
                                phase: e.target.value
                            }))}>
                                {Object.values(AoSPhases).filter(p => typeof p === 'string').map(phase => (
                                    <option key={phase}
                                            value={phase}>{AoSPhases.getDisplayName(phase)}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>Frequency</Form.Label>
                            <Form.Select value={newPrayer.frequency} onChange={(e) => setNewPrayer(prev => ({
                                ...prev,
                                frequency: e.target.value
                            }))}>
                                {Object.values(AoSAbilityFrequency).filter(f => typeof f === 'string').map(freq => (
                                    <option key={freq}
                                            value={freq}>{AoSAbilityFrequency.getDisplayName(freq)}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={12}>
                        <Form.Group>
                            <Form.Label>Effect</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="Effect"
                                value={newPrayer.effect}
                                onChange={(e) => setNewPrayer(prev => ({...prev, effect: e.target.value}))}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={12}>
                        <Form.Group>
                            <Form.Label>Keywords</Form.Label>
                            <ArmyContentKeywordSelector
                                selected={newPrayer.keywords}
                                onChange={(kw) => setNewPrayer(prev => ({...prev, keywords: kw}))}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <div className="mb-3">
                    <Button onClick={addPrayer} variant="primary">
                        {editingIndex !== null ? 'Update Prayer' : 'Add Prayer'}
                    </Button>
                    {editingIndex !== null && (
                        <Button onClick={cancelEdit} variant="secondary" className="ms-2">
                            Cancel
                        </Button>
                    )}
                </div>

                {prayers.length > 0 && (
                    <ListGroup>
                        {prayers.map((prayer, i) => (
                            <ListGroup.Item key={i} className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                    <strong>{prayer.name}</strong> - Prayer {prayer.prayerValue}, {prayer.range}
                                    {prayer.description && (
                                        <div className="small text-muted mt-1">{prayer.description}</div>
                                    )}
                                    <div className="small text-muted mt-1">
                                        <Badge bg="secondary"
                                               className="me-1">{AoSPhases.getDisplayName(prayer.phase)}</Badge>
                                        <Badge bg="info"
                                               className="me-1">{AoSAbilityFrequency.getDisplayName(prayer.frequency)}</Badge>
                                        {prayer.keywords?.map(kw => (
                                            <Badge key={kw} bg="primary" className="me-1">{kw}</Badge>
                                        ))}
                                    </div>
                                    <div className="small mt-1"><strong>Effect:</strong> {prayer.effect}</div>
                                </div>
                                <div className="d-flex gap-2">
                                    <Button variant="outline-primary" size="sm"
                                            onClick={() => editPrayer(i)}>Edit</Button>
                                    <Button variant="outline-danger" size="sm"
                                            onClick={() => removePrayer(i)}>×</Button>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Card.Body>
        </Card>
    );
};

export default PrayerLoreSection;