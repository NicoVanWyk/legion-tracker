import React, {useState} from 'react';
import {Form, Button, Card, Row, Col, Badge, ListGroup} from 'react-bootstrap';
import AoSPhases from '../../enums/aos/AoSPhases';
import ArmyContentKeywordSelector from './ArmyContentKeywordSelector';
import ManifestationUnitSelector from './ManifestationUnitSelector';

const ManifestationLoreSection = ({manifestations, onUpdate}) => {
    const [newManifestation, setNewManifestation] = useState({
        name: '',
        description: '',
        manifestationType: 'ENDLESS_SPELL',
        summoningCost: 0,
        effect: '',
        phase: AoSPhases.HERO,
        keywords: [],
        unitId: ''
    });
    const [editingIndex, setEditingIndex] = useState(null);

    const addManifestation = () => {
        if (!newManifestation.name.trim()) return;

        if (editingIndex !== null) {
            onUpdate(manifestations.map((m, i) => i === editingIndex ? {...newManifestation} : m));
            setEditingIndex(null);
        } else {
            onUpdate([...manifestations, {...newManifestation}]);
        }

        resetForm();
    };

    const editManifestation = (index) => {
        setNewManifestation({...manifestations[index]});
        setEditingIndex(index);
    };

    const cancelEdit = () => {
        resetForm();
        setEditingIndex(null);
    };

    const removeManifestation = (index) => {
        onUpdate(manifestations.filter((_, i) => i !== index));
        if (editingIndex === index) {
            cancelEdit();
        }
    };

    const resetForm = () => {
        setNewManifestation({
            name: '',
            description: '',
            manifestationType: 'ENDLESS_SPELL',
            summoningCost: 0,
            effect: '',
            phase: AoSPhases.HERO,
            keywords: [],
            unitId: ''
        });
    };

    return (
        <Card className="mb-3">
            <Card.Header>Manifestations</Card.Header>
            <Card.Body>
                <Row className="mb-3">
                    <Col md={12}>
                        <Form.Group className="mb-2">
                            <Form.Label>Manifestation Name</Form.Label>
                            <Form.Control
                                placeholder="Manifestation name"
                                value={newManifestation.name}
                                onChange={(e) => setNewManifestation(prev => ({...prev, name: e.target.value}))}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="Brief description"
                                value={newManifestation.description}
                                onChange={(e) => setNewManifestation(prev => ({...prev, description: e.target.value}))}
                            />
                        </Form.Group>
                        <ManifestationUnitSelector
                            selectedUnitId={newManifestation.unitId}
                            onChange={(unitId) => setNewManifestation(prev => ({...prev, unitId}))}
                        />
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>Type</Form.Label>
                            <Form.Select
                                value={newManifestation.manifestationType}
                                onChange={(e) => setNewManifestation(prev => ({
                                    ...prev,
                                    manifestationType: e.target.value
                                }))}
                            >
                                <option value="ENDLESS_SPELL">Endless Spell</option>
                                <option value="INVOCATION">Invocation</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Form.Group>
                            <Form.Label>Summoning</Form.Label>
                            <Form.Control
                                type="number"
                                value={newManifestation.summoningCost}
                                onChange={(e) => setNewManifestation(prev => ({
                                    ...prev,
                                    summoningCost: parseInt(e.target.value) || 0
                                }))}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Phase</Form.Label>
                            <Form.Select
                                value={newManifestation.phase}
                                onChange={(e) => setNewManifestation(prev => ({...prev, phase: e.target.value}))}
                            >
                                {Object.values(AoSPhases).filter(p => typeof p === 'string').map(phase => (
                                    <option key={phase} value={phase}>{AoSPhases.getDisplayName(phase)}</option>
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
                                value={newManifestation.effect}
                                onChange={(e) => setNewManifestation(prev => ({...prev, effect: e.target.value}))}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={12}>
                        <Form.Group>
                            <Form.Label>Keywords</Form.Label>
                            <ArmyContentKeywordSelector
                                selected={newManifestation.keywords}
                                onChange={(kw) => setNewManifestation(prev => ({...prev, keywords: kw}))}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <div className="mb-3">
                    <Button onClick={addManifestation} variant="primary">
                        {editingIndex !== null ? 'Update Manifestation' : 'Add Manifestation'}
                    </Button>
                    {editingIndex !== null && (
                        <Button onClick={cancelEdit} variant="secondary" className="ms-2">
                            Cancel
                        </Button>
                    )}
                </div>

                {manifestations.length > 0 && (
                    <ListGroup>
                        {manifestations.map((manifestation, i) => (
                            <ListGroup.Item key={i} className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                    <strong>{manifestation.name}</strong> - {manifestation.manifestationType === 'ENDLESS_SPELL' ? 'Endless Spell' : 'Invocation'}
                                    {manifestation.unitId && (
                                        <Badge bg="success" className="ms-2">Unit Linked</Badge>
                                    )}
                                    {manifestation.description && (
                                        <div className="small text-muted mt-1">{manifestation.description}</div>
                                    )}
                                    <div className="small text-muted mt-1">
                                        <Badge bg="warning" text="dark"
                                               className="me-1">Summon: {manifestation.summoningCost}</Badge>
                                        <Badge bg="info"
                                               className="me-1">{AoSPhases.getDisplayName(manifestation.phase)}</Badge>
                                        {manifestation.keywords?.map(kw => (
                                            <Badge key={kw} bg="primary" className="me-1">{kw}</Badge>
                                        ))}
                                    </div>
                                    <div className="small mt-1"><strong>Effect:</strong> {manifestation.effect}</div>
                                </div>
                                <div className="d-flex gap-2">
                                    <Button variant="outline-primary" size="sm"
                                            onClick={() => editManifestation(i)}>Edit</Button>
                                    <Button variant="outline-danger" size="sm"
                                            onClick={() => removeManifestation(i)}>×</Button>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Card.Body>
        </Card>
    );
};

export default ManifestationLoreSection;