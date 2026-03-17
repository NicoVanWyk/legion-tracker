import React, {useState} from 'react';
import {Form, Button, Card, Row, Col, Badge, ListGroup} from 'react-bootstrap';
import AoSPhases from '../../enums/aos/AoSPhases';
import ArmyContentKeywordSelector from './ArmyContentKeywordSelector';

const SpellLoreSection = ({spells, onUpdate}) => {
    const [newSpell, setNewSpell] = useState({
        name: '',
        description: '',
        castingValue: 6,
        range: '',
        effect: '',
        phase: AoSPhases.HERO,
        keywords: []
    });
    const [editingIndex, setEditingIndex] = useState(null);

    const addSpell = () => {
        if (!newSpell.name.trim()) return;

        if (editingIndex !== null) {
            onUpdate(spells.map((spell, i) => i === editingIndex ? {...newSpell} : spell));
            setEditingIndex(null);
        } else {
            onUpdate([...spells, {...newSpell}]);
        }

        resetForm();
    };

    const editSpell = (index) => {
        setNewSpell({...spells[index]});
        setEditingIndex(index);
    };

    const cancelEdit = () => {
        resetForm();
        setEditingIndex(null);
    };

    const removeSpell = (index) => {
        onUpdate(spells.filter((_, i) => i !== index));
        if (editingIndex === index) {
            cancelEdit();
        }
    };

    const resetForm = () => {
        setNewSpell({
            name: '',
            description: '',
            castingValue: 6,
            range: '',
            effect: '',
            phase: AoSPhases.HERO,
            keywords: []
        });
    };

    return (
        <Card className="mb-3">
            <Card.Header>Spells</Card.Header>
            <Card.Body>
                <Row className="mb-3">
                    <Col md={12}>
                        <Form.Group className="mb-2">
                            <Form.Label>Spell Name</Form.Label>
                            <Form.Control
                                placeholder="Spell name"
                                value={newSpell.name}
                                onChange={(e) => setNewSpell(prev => ({...prev, name: e.target.value}))}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="Brief description of the spell"
                                value={newSpell.description}
                                onChange={(e) => setNewSpell(prev => ({...prev, description: e.target.value}))}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>Cast Value</Form.Label>
                            <Form.Control
                                type="number"
                                value={newSpell.castingValue}
                                onChange={(e) => setNewSpell(prev => ({
                                    ...prev,
                                    castingValue: parseInt(e.target.value)
                                }))}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>Range</Form.Label>
                            <Form.Control
                                placeholder="Range"
                                value={newSpell.range}
                                onChange={(e) => setNewSpell(prev => ({...prev, range: e.target.value}))}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Phase</Form.Label>
                            <Form.Select value={newSpell.phase} onChange={(e) => setNewSpell(prev => ({
                                ...prev,
                                phase: e.target.value
                            }))}>
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
                                value={newSpell.effect}
                                onChange={(e) => setNewSpell(prev => ({...prev, effect: e.target.value}))}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={12}>
                        <Form.Group>
                            <Form.Label>Keywords</Form.Label>
                            <ArmyContentKeywordSelector
                                selected={newSpell.keywords}
                                onChange={(kw) => setNewSpell(prev => ({...prev, keywords: kw}))}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <div className="mb-3">
                    <Button onClick={addSpell} variant="primary">
                        {editingIndex !== null ? 'Update Spell' : 'Add Spell'}
                    </Button>
                    {editingIndex !== null && (
                        <Button onClick={cancelEdit} variant="secondary" className="ms-2">
                            Cancel
                        </Button>
                    )}
                </div>

                {spells.length > 0 && (
                    <ListGroup>
                        {spells.map((spell, i) => (
                            <ListGroup.Item key={i} className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                    <strong>{spell.name}</strong> - Cast {spell.castingValue}, {spell.range}
                                    {spell.description && (
                                        <div className="small text-muted mt-1">{spell.description}</div>
                                    )}
                                    <div className="small text-muted mt-1">
                                        <Badge bg="secondary"
                                               className="me-1">{AoSPhases.getDisplayName(spell.phase)}</Badge>
                                        {spell.keywords?.map(kw => (
                                            <Badge key={kw} bg="primary" className="me-1">{kw}</Badge>
                                        ))}
                                    </div>
                                    <div className="small mt-1"><strong>Effect:</strong> {spell.effect}</div>
                                </div>
                                <div className="d-flex gap-2">
                                    <Button variant="outline-primary" size="sm"
                                            onClick={() => editSpell(i)}>Edit</Button>
                                    <Button variant="outline-danger" size="sm"
                                            onClick={() => removeSpell(i)}>×</Button>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Card.Body>
        </Card>
    );
};

export default SpellLoreSection;