import React, {useState, useEffect} from 'react';
import {Form, Button, Card, Alert, Row, Col, ListGroup, Badge} from 'react-bootstrap';
import AoSKeywords from '../../enums/aos/AoSKeywords';
import AoSContentTypes from '../../enums/aos/AoSContentTypes';

const RegimentBuilder = ({
                             regiment,
                             availableUnits = [],
                             availableContent = [],
                             onSave,
                             onCancel,
                             saving,
                             generalUnitId
                         }) => {

    const isGeneralRegiment = regiment?.commander === generalUnitId;
    const [formData, setFormData] = useState({
        name: '',
        commander: null,
        units: [],
        regimentAbility: null,
        heroEquipment: {}
    });
    const [errors, setErrors] = useState([]);

    const commander = availableUnits.find(u => u.id === formData.commander);
    const isRegimentOfRenown = commander?.battleProfile?.isRegimentOfRenown || false;
    const rorRequirements = isRegimentOfRenown ? {
        requiredUnits: commander?.battleProfile?.requiredUnits || [],
        requiredAbility: commander?.battleProfile?.requiredRegimentAbility || null
    } : null;

    useEffect(() => {
        if (regiment) {
            setFormData({
                name: regiment.name || '',
                commander: regiment.commander || null,
                units: (regiment.units || []).map(u => ({
                    unitId: u.unitId,
                    isSubCommander: u.isSubCommander || false,
                    isReinforced: u.isReinforced || false,
                    reinforcingUnitId: u.reinforcingUnitId || null
                })),
                regimentAbility: regiment.regimentAbility || null,
                heroEquipment: regiment.heroEquipment || {}
            });
        }
    }, [regiment]);

    useEffect(() => {
        if (isRegimentOfRenown && rorRequirements) {
            if (rorRequirements.requiredAbility && !formData.regimentAbility) {
                setFormData(prev => ({
                    ...prev,
                    regimentAbility: rorRequirements.requiredAbility
                }));
            }
        }
    }, [isRegimentOfRenown, rorRequirements, formData.regimentAbility]);

    const getTroopSlots = () => formData.units.length;

    const validate = () => {
        const errors = [];

        if (!formData.name.trim()) {
            errors.push('Regiment name is required');
        }

        if (!formData.commander) {
            errors.push('Commander is required');
        } else {
            if (!commander?.keywords?.includes(AoSKeywords.HERO)) {
                errors.push('Commander must be a HERO');
            }
        }

        const maxSlots = isGeneralRegiment ? 4 : 3;
        const usedSlots = getTroopSlots();
        if (usedSlots > maxSlots) {
            errors.push(`Maximum ${maxSlots} unit slots allowed (currently using ${usedSlots})`);
        }

        formData.units.forEach(({unitId, isSubCommander, isReinforced, reinforcingUnitId}) => {
            const unit = availableUnits.find(u => u.id === unitId);
            if (isSubCommander && !unit?.keywords?.includes(AoSKeywords.HERO)) {
                errors.push(`${unit?.name} must be a HERO to be sub-commander`);
            }
            if (isReinforced && !reinforcingUnitId) {
                errors.push(`${unit?.name} is marked as reinforced but no reinforcing unit selected`);
            }
        });

        if (isRegimentOfRenown && rorRequirements) {
            rorRequirements.requiredUnits.forEach(requiredId => {
                const isIncluded = formData.units.some(u => u.unitId === requiredId);
                if (!isIncluded) {
                    const requiredUnit = availableUnits.find(u => u.id === requiredId);
                    errors.push(`Regiment of Renown requires ${requiredUnit?.name || requiredId}`);
                }
            });

            if (rorRequirements.requiredAbility && formData.regimentAbility !== rorRequirements.requiredAbility) {
                const ability = availableContent.find(c => c.id === rorRequirements.requiredAbility);
                errors.push(`Regiment of Renown requires "${ability?.name || 'specific'}" regiment ability`);
            }
        }

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

    const handleAddUnit = (unitId) => {
        setFormData(prev => ({
            ...prev,
            units: [...prev.units, {unitId, isSubCommander: false, isReinforced: false, reinforcingUnitId: null}]
        }));
    };

    const handleRemoveUnit = (index) => {
        setFormData(prev => ({
            ...prev,
            units: prev.units.filter((_, i) => i !== index)
        }));
    };

    const handleToggleSubCommander = (index) => {
        setFormData(prev => ({
            ...prev,
            units: prev.units.map((u, i) =>
                i === index ? {...u, isSubCommander: !u.isSubCommander} : u
            )
        }));
    };

    const handleToggleReinforced = (index) => {
        const unit = availableUnits.find(u => u.id === formData.units[index].unitId);
        if (!unit?.reinforceable) return;

        setFormData(prev => ({
            ...prev,
            units: prev.units.map((u, i) =>
                i === index ? {...u, isReinforced: !u.isReinforced, reinforcingUnitId: null} : u
            )
        }));
    };

    const handleSetReinforcingUnit = (index, reinforcingId) => {
        setFormData(prev => ({
            ...prev,
            units: prev.units.map((u, i) =>
                i === index ? {...u, reinforcingUnitId: reinforcingId || null} : u
            )
        }));
    };

    const getAvailableReinforcingUnits = (baseUnitId) => {
        const baseUnit = availableUnits.find(u => u.id === baseUnitId);
        if (!baseUnit) return [];

        const getBaseName = (name) => {
            const words = name.split(' ');
            const stopWords = ['Desert', 'Volcano', 'Prime', 'Alpha', 'Beta', 'I', 'II', 'III'];
            const baseWords = [];
            for (const word of words) {
                if (stopWords.includes(word)) break;
                baseWords.push(word);
                if (baseWords.length >= 2) break;
            }
            return baseWords.join(' ');
        };

        const baseName = getBaseName(baseUnit.name);

        const usedIds = new Set([
            formData.commander,
            ...formData.units.map(u => u.unitId),
            ...formData.units.map(u => u.reinforcingUnitId).filter(Boolean)
        ]);

        return availableUnits.filter(u => {
            const candidateBase = getBaseName(u.name);
            return candidateBase === baseName && !usedIds.has(u.id);
        });
    };

    const handleHeroEquipment = (unitId, equipmentType, contentId) => {
        setFormData(prev => ({
            ...prev,
            heroEquipment: {
                ...prev.heroEquipment,
                [unitId]: {
                    ...(prev.heroEquipment[unitId] || {}),
                    [equipmentType]: contentId || null
                }
            }
        }));
    };

    const getHeroes = () => {
        const heroes = [];
        if (formData.commander) heroes.push(formData.commander);
        formData.units.forEach(({unitId, isSubCommander}) => {
            if (isSubCommander) heroes.push(unitId);
        });
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

    const maxSlots = isGeneralRegiment ? 4 : 3;

    return (
        <Card>
            <Card.Header>
                <h4 className="mb-0">
                    {regiment ? 'Edit Regiment' : 'Create Regiment'}
                    {isGeneralRegiment && <Badge bg="warning" text="dark" className="ms-2">General's Regiment</Badge>}
                    {isRegimentOfRenown && <Badge bg="info" className="ms-2">Regiment of Renown</Badge>}
                </h4>
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

                    {isRegimentOfRenown && rorRequirements && (
                        <Alert variant="info" className="mb-3">
                            <strong><i className="bi bi-star-fill me-2"></i>Regiment of Renown Requirements</strong>
                            <ul className="mb-0 mt-2">
                                {rorRequirements.requiredUnits.length > 0 && (
                                    <li>Must include {rorRequirements.requiredUnits.length} specific unit(s)</li>
                                )}
                                {rorRequirements.requiredAbility && (
                                    <li>Must use specific regiment ability</li>
                                )}
                            </ul>
                        </Alert>
                    )}

                    <Card className="mb-3">
                        <Card.Header>
                            <h5 className="mb-0">Commander (Required)</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form.Select
                                value={formData.commander || ''}
                                onChange={(e) => setFormData(prev => ({...prev, commander: e.target.value || null}))}
                            >
                                <option value="">Select Commander...</option>
                                {availableUnits.filter(u => u.keywords?.includes(AoSKeywords.HERO)).map(unit => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.name} ({unit.points} pts)
                                    </option>
                                ))}
                            </Form.Select>
                        </Card.Body>
                    </Card>

                    <Card className="mb-3">
                        <Card.Header>
                            <h5 className="mb-0">Units ({getTroopSlots()}/{maxSlots} slots)</h5>
                        </Card.Header>
                        <Card.Body>
                            {formData.units.length === 0 ? (
                                <Alert variant="info">No units added yet</Alert>
                            ) : (
                                <ListGroup className="mb-3">
                                    {formData.units.map(({
                                                             unitId,
                                                             isSubCommander,
                                                             isReinforced,
                                                             reinforcingUnitId
                                                         }, index) => {
                                        const unit = availableUnits.find(u => u.id === unitId);
                                        if (!unit) return null;

                                        const isRequired = isRegimentOfRenown && rorRequirements?.requiredUnits.includes(unitId);

                                        return (
                                            <ListGroup.Item key={index}>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <div className="flex-grow-1">
                                                        <strong>{unit.name}</strong>
                                                        {isRequired && <Badge bg="warning" text="dark"
                                                                              className="ms-2">Required</Badge>}
                                                        {unit.keywords?.includes(AoSKeywords.HERO) && (
                                                            <Form.Check
                                                                type="checkbox"
                                                                inline
                                                                label="Sub-commander"
                                                                checked={isSubCommander}
                                                                onChange={() => handleToggleSubCommander(index)}
                                                                className="ms-3"
                                                            />
                                                        )}
                                                        {unit.reinforceable && !isSubCommander && (
                                                            <Form.Check
                                                                type="checkbox"
                                                                inline
                                                                label="Reinforced"
                                                                checked={isReinforced}
                                                                onChange={() => handleToggleReinforced(index)}
                                                                className="ms-3"
                                                            />
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleRemoveUnit(index)}
                                                        disabled={isRequired}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                                {isReinforced && (
                                                    <Form.Select
                                                        size="sm"
                                                        value={reinforcingUnitId || ''}
                                                        onChange={(e) => handleSetReinforcingUnit(index, e.target.value)}
                                                        className="mt-2"
                                                    >
                                                        <option value="">Select reinforcing unit...</option>
                                                        {getAvailableReinforcingUnits(unitId).map(u => (
                                                            <option key={u.id} value={u.id}>
                                                                {u.name} ({u.points} pts)
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                )}
                                            </ListGroup.Item>
                                        );
                                    })}
                                </ListGroup>
                            )}

                            {getTroopSlots() < maxSlots && (
                                <Form.Select
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            handleAddUnit(e.target.value);
                                            e.target.value = '';
                                        }
                                    }}
                                >
                                    <option value="">Add Unit...</option>
                                    {availableUnits
                                        .filter(u => u.id !== formData.commander)
                                        .filter(u => !formData.units.some(({unitId}) => unitId === u.id))
                                        .filter(u => !formData.units.some(({reinforcingUnitId}) => reinforcingUnitId === u.id))
                                        .map(unit => (
                                            <option key={unit.id} value={unit.id}>
                                                {unit.name} ({unit.points} pts)
                                            </option>
                                        ))}
                                </Form.Select>
                            )}
                        </Card.Body>
                    </Card>

                    <Row className="mt-4">
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Regiment Ability
                                    {isRegimentOfRenown && rorRequirements?.requiredAbility && ' (Required)'}
                                </Form.Label>
                                <Form.Select
                                    value={formData.regimentAbility || ''}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        regimentAbility: e.target.value || null
                                    }))}
                                    disabled={isRegimentOfRenown && rorRequirements?.requiredAbility}
                                >
                                    <option value="">None</option>
                                    {regimentAbilities.map(ability => (
                                        <option key={ability.id} value={ability.id}>
                                            {ability.name}
                                        </option>
                                    ))}
                                </Form.Select>
                                {isRegimentOfRenown && rorRequirements?.requiredAbility && (
                                    <Form.Text className="text-warning">
                                        <i className="bi bi-lock-fill me-1"></i>
                                        Required by Regiment of Renown
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

                                    const isUnique = hero.keywords?.includes(AoSKeywords.UNIQUE);

                                    return (
                                        <Card key={heroId} className="mb-3" bg="light">
                                            <Card.Body>
                                                <h6>
                                                    {hero.name}
                                                    {isUnique &&
                                                        <Badge bg="warning" text="dark" className="ms-2">UNIQUE (No
                                                            Enhancements)</Badge>}
                                                </h6>
                                                {!isUnique && (
                                                    <Row>
                                                        <Col md={6}>
                                                            <Form.Group className="mb-2">
                                                                <Form.Label className="small">Heroic Trait</Form.Label>
                                                                <Form.Select
                                                                    size="sm"
                                                                    value={formData.heroEquipment[heroId]?.heroicTrait || ''}
                                                                    onChange={(e) => handleHeroEquipment(heroId, 'heroicTrait', e.target.value)}
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
                                                                    onChange={(e) => handleHeroEquipment(heroId, 'artefact', e.target.value)}
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
                                                )}
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
                            <li>Units: {getTroopSlots()}/{maxSlots} slots</li>
                            <li>Regiment Ability: {formData.regimentAbility ? '✓' : 'None'}</li>
                            {isRegimentOfRenown &&
                                <li className="text-warning">Regiment of Renown: Restrictions apply</li>}
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