import React, {useState, useEffect} from 'react';
import {Form, Button, Card, Alert, Row, Col} from 'react-bootstrap';
import UnitAssignmentPanel from './UnitAssignmentPanel';
import AoSKeywords from '../../enums/aos/AoSKeywords';
import AoSContentTypes from '../../enums/aos/AoSContentTypes';

const RegimentBuilder = ({regiment, availableUnits = [], availableContent = [], onSave, onCancel, saving}) => {
    const [formData, setFormData] = useState({
        name: '',
        commander: null,
        subCommanders: [],
        troops: [],
        regimentAbility: null,
        heroEquipment: {}
    });
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        if (regiment) {
            setFormData({
                name: regiment.name || '',
                commander: regiment.commander || null,
                subCommanders: regiment.subCommanders || [],
                troops: regiment.troops || [],
                regimentAbility: regiment.regimentAbility || null,
                heroEquipment: regiment.heroEquipment || {}
            });
        }
    }, [regiment]);

    if (!availableUnits || availableUnits.length === 0) {
        return <div>Loading units...</div>;
    }

    const validate = () => {
        const errors = [];

        if (!formData.name.trim()) {
            errors.push('Regiment name is required');
        }

        if (!formData.commander) {
            errors.push('Commander is required');
        } else {
            const commander = availableUnits.find(u => u.id === formData.commander);
            if (!commander?.keywords?.includes(AoSKeywords.HERO)) {
                errors.push('Commander must be a HERO');
            }
        }

        if (formData.subCommanders.length > 2) {
            errors.push('Maximum 2 sub-commanders allowed');
        }

        formData.subCommanders.forEach(id => {
            const unit = availableUnits.find(u => u.id === id);
            if (!unit?.keywords?.includes(AoSKeywords.HERO)) {
                errors.push(`Sub-commander ${unit?.name} must be a HERO`);
            }
        });

        const troopSlots = formData.troops.reduce((total, id) => {
            const unit = availableUnits.find(u => u.id === id);
            return total + (unit?.isReinforced ? 2 : 1);
        }, 0);

        if (troopSlots < 2) errors.push('Minimum 2 troop slots required');
        if (troopSlots > 5) errors.push('Maximum 5 troop slots allowed');

        return errors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();

        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors([]);
        onSave(formData);
    };

    const handleUnitAssignment = (slotType, unitIds) => {
        if (slotType === 'commander') {
            setFormData(prev => ({...prev, commander: unitIds[0] || null}));
        } else if (slotType === 'subCommanders') {
            setFormData(prev => ({...prev, subCommanders: unitIds.slice(0, 2)}));
        } else if (slotType === 'troops') {
            setFormData(prev => ({...prev, troops: unitIds}));
        }
    };

    const handleHeroEquipment = (unitId, equipmentType, contentId) => {
        setFormData(prev => ({
            ...prev,
            heroEquipment: {
                ...prev.heroEquipment,
                [unitId]: {
                    ...(prev.heroEquipment[unitId] || {}),
                    [equipmentType]: contentId
                }
            }
        }));
    };

    const getTroopSlots = () => {
        return formData.troops.reduce((total, id) => {
            const unit = availableUnits.find(u => u.id === id);
            return total + (unit?.isReinforced ? 2 : 1);
        }, 0);
    };

    const getHeroes = () => {
        const heroes = [];
        if (formData.commander) heroes.push(formData.commander);
        heroes.push(...formData.subCommanders);
        return heroes;
    };

    const regimentAbilities = availableContent.filter(c =>
        c.contentType === AoSContentTypes.REGIMENT_ABILITY
    );

    const heroicTraits = availableContent.filter(c =>
        c.contentType === AoSContentTypes.HEROIC_TRAIT
    );

    const artefacts = availableContent.filter(c =>
        c.contentType === AoSContentTypes.ARTEFACT
    );

    return (
        <Card>
            <Card.Header>
                <h4 className="mb-0">{regiment ? 'Edit Regiment' : 'Create Regiment'}</h4>
            </Card.Header>
            <Card.Body>
                {errors.length > 0 && (
                    <Alert variant="danger">
                        <strong>Validation Errors:</strong>
                        <ul className="mb-0 mt-2">
                            {errors.map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                        <Form.Label>Regiment Name*</Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                            placeholder="e.g., Vanguard Strike Force"
                            required
                        />
                    </Form.Group>

                    <UnitAssignmentPanel
                        availableUnits={availableUnits}
                        commander={formData.commander}
                        subCommanders={formData.subCommanders}
                        troops={formData.troops}
                        onAssignment={handleUnitAssignment}
                    />

                    <Row className="mt-4">
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Regiment Ability (Optional)</Form.Label>
                                <Form.Select
                                    value={formData.regimentAbility || ''}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        regimentAbility: e.target.value || null
                                    }))}
                                >
                                    <option value="">None</option>
                                    {regimentAbilities.map(ability => (
                                        <option key={ability.id} value={ability.id}>
                                            {ability.name}
                                        </option>
                                    ))}
                                </Form.Select>
                                {regimentAbilities.length === 0 && (
                                    <Form.Text className="text-muted">
                                        No regiment abilities available. Create them in Army Content.
                                    </Form.Text>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>

                    {getHeroes().length > 0 && (
                        <Card className="mb-4">
                            <Card.Header>
                                <h5 className="mb-0">Hero Equipment</h5>
                            </Card.Header>
                            <Card.Body>
                                {getHeroes().map(heroId => {
                                    const hero = availableUnits.find(u => u.id === heroId);
                                    if (!hero) return null;

                                    return (
                                        <Card key={heroId} className="mb-3" bg="light">
                                            <Card.Body>
                                                <h6>{hero.name}</h6>
                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="small">Heroic Trait</Form.Label>
                                                            <Form.Select
                                                                size="sm"
                                                                value={formData.heroEquipment[heroId]?.heroicTrait || ''}
                                                                onChange={(e) => handleHeroEquipment(heroId, 'heroicTrait', e.target.value || null)}
                                                            >
                                                                <option value="">None</option>
                                                                {heroicTraits.map(trait => (
                                                                    <option key={trait.id} value={trait.id}>
                                                                        {trait.name}
                                                                    </option>
                                                                ))}
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="small">Artefact</Form.Label>
                                                            <Form.Select
                                                                size="sm"
                                                                value={formData.heroEquipment[heroId]?.artefact || ''}
                                                                onChange={(e) => handleHeroEquipment(heroId, 'artefact', e.target.value || null)}
                                                            >
                                                                <option value="">None</option>
                                                                {artefacts.map(art => (
                                                                    <option key={art.id} value={art.id}>
                                                                        {art.name}
                                                                    </option>
                                                                ))}
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    );
                                })}
                            </Card.Body>
                        </Card>
                    )}

                    <Alert variant="info">
                        <strong>Regiment Summary:</strong>
                        <ul className="mb-0 mt-2">
                            <li>Commander: {formData.commander ? '✓' : '✗ Required'}</li>
                            <li>Sub-commanders: {formData.subCommanders.length}/2</li>
                            <li>Troops: {getTroopSlots()}/5 slots (need 2-5)</li>
                            <li>Regiment Ability: {formData.regimentAbility ? '✓' : 'None'}</li>
                        </ul>
                    </Alert>

                    <div className="d-flex justify-content-between">
                        <Button variant="secondary" onClick={onCancel} disabled={saving}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Regiment'}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default RegimentBuilder;