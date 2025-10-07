// src/components/units/UnitForm.js (Updated version with model counts, abilities, and upgrades)
import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert, Tab, Tabs, Badge, ListGroup } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, collection, addDoc, updateDoc, getDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import UnitTypes from '../../enums/UnitTypes';
import Factions from '../../enums/Factions';
import DefenseDice from '../../enums/DefenseDice';
import UpgradeCardTypes from '../../enums/UpgradeCardTypes';
import KeywordSelector from './KeywordSelector';
import WeaponSelector from './WeaponSelector';
import LoadingSpinner from '../layout/LoadingSpinner';

const UnitForm = () => {
    const { unitId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [loadingUnit, setLoadingUnit] = useState(unitId ? true : false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('basic');

    // Available options
    const [availableAbilities, setAvailableAbilities] = useState([]);
    const [availableUpgrades, setAvailableUpgrades] = useState([]);

    // Form state with new fields
    const [formData, setFormData] = useState({
        name: '',
        faction: Factions.REPUBLIC,
        type: UnitTypes.CORPS,
        points: 0,
        wounds: 1,
        courage: 1,
        speed: 2,
        defense: DefenseDice.WHITE,
        minModelCount: 1,
        currentModelCount: 1,
        maxModelCount: 10,
        keywords: [],
        weapons: [],
        abilities: [], // Array of ability IDs
        upgradeSlots: [], // Array of {type, maxCount, equippedUpgrades: []}
        miniatures: '',
        notes: '',
    });

    const [validated, setValidated] = useState(false);

    useEffect(() => {
        const fetchUnit = async () => {
            try {
                if (unitId && currentUser) {
                    setLoadingUnit(true);

                    const unitRef = doc(db, 'users', currentUser.uid, 'units', unitId);
                    const unitDoc = await getDoc(unitRef);

                    if (unitDoc.exists()) {
                        const unitData = unitDoc.data();
                        setFormData({
                            ...unitData,
                            keywords: unitData.keywords || [],
                            weapons: unitData.weapons || [],
                            abilities: unitData.abilities || [],
                            upgradeSlots: unitData.upgradeSlots || [],
                            minModelCount: unitData.minModelCount || 1,
                            currentModelCount: unitData.currentModelCount || unitData.minModelCount || 1,
                            maxModelCount: unitData.maxModelCount || 10
                        });
                    } else {
                        setError('Unit not found');
                    }
                }
            } catch (err) {
                console.error('Error fetching unit:', err);
                setError('Failed to fetch unit details. Please try again later.');
            } finally {
                setLoadingUnit(false);
            }
        };

        fetchUnit();
    }, [currentUser, unitId]);

    useEffect(() => {
        const fetchAvailableOptions = async () => {
            if (!currentUser) return;

            try {
                // Fetch abilities
                const abilitiesRef = collection(db, 'users', currentUser.uid, 'abilities');
                const abilitiesSnapshot = await getDocs(abilitiesRef);
                const abilities = abilitiesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAvailableAbilities(abilities);

                // Fetch upgrade cards
                const upgradesRef = collection(db, 'users', currentUser.uid, 'upgradeCards');
                const upgradesSnapshot = await getDocs(upgradesRef);
                const upgrades = upgradesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAvailableUpgrades(upgrades);
            } catch (err) {
                console.error('Error fetching options:', err);
            }
        };

        fetchAvailableOptions();
    }, [currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (['points', 'wounds', 'courage', 'speed', 'minModelCount', 'currentModelCount', 'maxModelCount'].includes(name)) {
            const numValue = parseInt(value, 10);
            setFormData(prev => ({ ...prev, [name]: isNaN(numValue) ? 0 : numValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleKeywordsChange = (keywords) => {
        setFormData(prev => ({ ...prev, keywords }));
    };

    const handleWeaponsChange = (weapons) => {
        setFormData(prev => ({ ...prev, weapons }));
    };

    const toggleAbility = (abilityId) => {
        setFormData(prev => {
            const abilities = prev.abilities || [];
            if (abilities.includes(abilityId)) {
                return { ...prev, abilities: abilities.filter(a => a !== abilityId) };
            } else {
                return { ...prev, abilities: [...abilities, abilityId] };
            }
        });
    };

    const addUpgradeSlot = () => {
        setFormData(prev => ({
            ...prev,
            upgradeSlots: [
                ...prev.upgradeSlots,
                {
                    type: UpgradeCardTypes.GEAR,
                    maxCount: 1,
                    equippedUpgrades: []
                }
            ]
        }));
    };

    const removeUpgradeSlot = (index) => {
        setFormData(prev => ({
            ...prev,
            upgradeSlots: prev.upgradeSlots.filter((_, i) => i !== index)
        }));
    };

    const updateUpgradeSlot = (index, field, value) => {
        setFormData(prev => {
            const slots = [...prev.upgradeSlots];
            slots[index] = {
                ...slots[index],
                [field]: field === 'maxCount' ? parseInt(value) || 1 : value
            };
            return { ...prev, upgradeSlots: slots };
        });
    };

    const calculateTotalPoints = () => {
        let total = formData.points || 0;

        // Add points from equipped upgrades
        formData.upgradeSlots?.forEach(slot => {
            slot.equippedUpgrades?.forEach(upgradeId => {
                const upgrade = availableUpgrades.find(u => u.id === upgradeId);
                if (upgrade) {
                    total += upgrade.pointsCost || 0;
                }
            });
        });

        return total;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        // Validate model counts
        if (formData.minModelCount < 1) {
            setError('Minimum model count must be at least 1');
            return;
        }

        if (formData.currentModelCount < formData.minModelCount) {
            setError('Current model count cannot be less than minimum model count');
            return;
        }

        if (formData.maxModelCount < formData.minModelCount) {
            setError('Maximum model count cannot be less than minimum model count');
            return;
        }

        try {
            setLoading(true);
            setError('');

            if (!currentUser) {
                throw new Error('You must be logged in to create a unit');
            }

            const unitToSave = {
                ...formData,
                userId: currentUser.uid,
                updatedAt: serverTimestamp(),
                totalPoints: calculateTotalPoints()
            };

            if (unitId) {
                const unitRef = doc(db, 'users', currentUser.uid, 'units', unitId);
                await updateDoc(unitRef, unitToSave);
                setSuccess('Unit updated successfully!');

                setTimeout(() => {
                    navigate(`/units/${unitId}`);
                }, 1500);
            } else {
                unitToSave.createdAt = serverTimestamp();
                const unitRef = await addDoc(collection(db, 'users', currentUser.uid, 'units'), unitToSave);
                setSuccess('Unit created successfully!');

                setFormData({
                    name: '',
                    faction: Factions.REPUBLIC,
                    type: UnitTypes.CORPS,
                    points: 0,
                    wounds: 1,
                    courage: 1,
                    speed: 2,
                    defense: DefenseDice.WHITE,
                    minModelCount: 1,
                    currentModelCount: 1,
                    maxModelCount: 10,
                    keywords: [],
                    weapons: [],
                    abilities: [],
                    upgradeSlots: [],
                    miniatures: '',
                    notes: '',
                });

                setTimeout(() => {
                    navigate(`/units/${unitRef.id}`);
                }, 1500);
            }
        } catch (err) {
            console.error('Error saving unit:', err);
            setError(`Failed to save unit: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (loadingUnit) {
        return <LoadingSpinner text="Loading unit data..." />;
    }

    if (loading) {
        return <LoadingSpinner text={unitId ? 'Updating unit...' : 'Creating unit...'} />;
    }

    return (
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-4"
                fill
            >
                <Tab eventKey="basic" title="Basic Info">
                    <Card>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Unit Name</Form.Label>
                                        <Form.Control
                                            required
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter unit name"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Please enter a unit name.
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>

                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Faction</Form.Label>
                                        <Form.Select
                                            required
                                            name="faction"
                                            value={formData.faction}
                                            onChange={handleChange}
                                        >
                                            <option value={Factions.REPUBLIC}>{Factions.getDisplayName(Factions.REPUBLIC)}</option>
                                            <option value={Factions.SEPARATIST}>{Factions.getDisplayName(Factions.SEPARATIST)}</option>
                                            <option value={Factions.REBEL}>{Factions.getDisplayName(Factions.REBEL)}</option>
                                            <option value={Factions.EMPIRE}>{Factions.getDisplayName(Factions.EMPIRE)}</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Unit Type</Form.Label>
                                        <Form.Select
                                            required
                                            name="type"
                                            value={formData.type}
                                            onChange={handleChange}
                                        >
                                            <option value={UnitTypes.COMMAND}>{UnitTypes.getDisplayName(UnitTypes.COMMAND)}</option>
                                            <option value={UnitTypes.CORPS}>{UnitTypes.getDisplayName(UnitTypes.CORPS)}</option>
                                            <option value={UnitTypes.SPECIAL_FORCES}>{UnitTypes.getDisplayName(UnitTypes.SPECIAL_FORCES)}</option>
                                            <option value={UnitTypes.SUPPORT}>{UnitTypes.getDisplayName(UnitTypes.SUPPORT)}</option>
                                            <option value={UnitTypes.HEAVY}>{UnitTypes.getDisplayName(UnitTypes.HEAVY)}</option>
                                            <option value={UnitTypes.OPERATIVE}>{UnitTypes.getDisplayName(UnitTypes.OPERATIVE)}</option>
                                            <option value={UnitTypes.AUXILIARY}>{UnitTypes.getDisplayName(UnitTypes.AUXILIARY)}</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Base Points Cost</Form.Label>
                                        <Form.Control
                                            required
                                            type="number"
                                            name="points"
                                            value={formData.points}
                                            onChange={handleChange}
                                            min="0"
                                            max="500"
                                        />
                                        <Form.Text className="text-muted">
                                            Total: {calculateTotalPoints()} pts
                                        </Form.Text>
                                    </Form.Group>
                                </Col>

                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Wounds</Form.Label>
                                        <Form.Control
                                            required
                                            type="number"
                                            name="wounds"
                                            value={formData.wounds}
                                            onChange={handleChange}
                                            min="1"
                                            max="20"
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={2}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Courage</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="courage"
                                            value={formData.courage}
                                            onChange={handleChange}
                                            min="0"
                                            max="5"
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={2}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Speed</Form.Label>
                                        <Form.Control
                                            required
                                            type="number"
                                            name="speed"
                                            value={formData.speed}
                                            onChange={handleChange}
                                            min="0"
                                            max="3"
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={2}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Defense</Form.Label>
                                        <Form.Select
                                            required
                                            name="defense"
                                            value={formData.defense}
                                            onChange={handleChange}
                                        >
                                            <option value={DefenseDice.WHITE}>White</option>
                                            <option value={DefenseDice.RED}>Red</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Card className="mt-3">
                                <Card.Header>
                                    <h5 className="mb-0">Model Count</h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Minimum Models*</Form.Label>
                                                <Form.Control
                                                    required
                                                    type="number"
                                                    name="minModelCount"
                                                    value={formData.minModelCount}
                                                    onChange={handleChange}
                                                    min="1"
                                                    max="20"
                                                />
                                                <Form.Text className="text-muted">
                                                    Unit must have at least this many models
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>

                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Current Models*</Form.Label>
                                                <Form.Control
                                                    required
                                                    type="number"
                                                    name="currentModelCount"
                                                    value={formData.currentModelCount}
                                                    onChange={handleChange}
                                                    min={formData.minModelCount}
                                                    max={formData.maxModelCount}
                                                />
                                                <Form.Text className="text-muted">
                                                    Default number of models
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>

                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Maximum Models</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="maxModelCount"
                                                    value={formData.maxModelCount}
                                                    onChange={handleChange}
                                                    min={formData.minModelCount}
                                                    max="20"
                                                />
                                                <Form.Text className="text-muted">
                                                    Unit cannot exceed this many models
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="keywords" title="Keywords">
                    <Card>
                        <Card.Body>
                            <KeywordSelector
                                selectedKeywords={formData.keywords}
                                onChange={handleKeywordsChange}
                            />
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="weapons" title="Weapons">
                    <Card>
                        <Card.Body>
                            <WeaponSelector
                                weapons={formData.weapons}
                                onChange={handleWeaponsChange}
                            />
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="abilities" title={`Abilities (${formData.abilities?.length || 0})`}>
                    <Card>
                        <Card.Body>
                            <h5 className="mb-3">Unit Abilities</h5>
                            {availableAbilities.length === 0 ? (
                                <Alert variant="info">
                                    No abilities available. Create abilities first in the Abilities section.
                                </Alert>
                            ) : (
                                <ListGroup>
                                    {availableAbilities.map(ability => (
                                        <ListGroup.Item
                                            key={ability.id}
                                            action
                                            active={formData.abilities?.includes(ability.id)}
                                            onClick={() => toggleAbility(ability.id)}
                                        >
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <div className="fw-bold">{ability.name}</div>
                                                    <div className="small text-muted">{ability.description}</div>
                                                    {ability.rulesText && (
                                                        <div className="small mt-1">{ability.rulesText}</div>
                                                    )}
                                                </div>
                                                <Badge bg={formData.abilities?.includes(ability.id) ? 'success' : 'secondary'}>
                                                    {formData.abilities?.includes(ability.id) ? 'Selected' : 'Select'}
                                                </Badge>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="upgrades" title={`Upgrade Slots (${formData.upgradeSlots?.length || 0})`}>
                    <Card>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">Upgrade Slots</h5>
                                <Button variant="primary" onClick={addUpgradeSlot}>
                                    Add Upgrade Slot
                                </Button>
                            </div>

                            {formData.upgradeSlots?.length === 0 ? (
                                <Alert variant="info">
                                    No upgrade slots configured. Add upgrade slots to allow this unit to equip upgrades.
                                </Alert>
                            ) : (
                                <ListGroup>
                                    {formData.upgradeSlots.map((slot, index) => (
                                        <ListGroup.Item key={index}>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label>Upgrade Type</Form.Label>
                                                        <Form.Select
                                                            value={slot.type}
                                                            onChange={(e) => updateUpgradeSlot(index, 'type', e.target.value)}
                                                        >
                                                            {UpgradeCardTypes.getAllTypes().map(type => (
                                                                <option key={type} value={type}>
                                                                    {UpgradeCardTypes.getDisplayName(type)}
                                                                </option>
                                                            ))}
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={3}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label>Max Count</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            value={slot.maxCount}
                                                            onChange={(e) => updateUpgradeSlot(index, 'maxCount', e.target.value)}
                                                            min="1"
                                                            max="5"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={3} className="d-flex align-items-end">
                                                    <Button
                                                        variant="outline-danger"
                                                        onClick={() => removeUpgradeSlot(index)}
                                                        className="w-100 mb-2"
                                                    >
                                                        Remove Slot
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="miniatures" title="Miniatures">
                    <Card>
                        <Card.Body>
                            <Form.Group>
                                <Form.Label>Miniature Proxy Information</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="miniatures"
                                    value={formData.miniatures}
                                    onChange={handleChange}
                                    placeholder="Enter the miniature(s) used for this unit..."
                                    rows={5}
                                />
                                <Form.Text className="text-muted">
                                    Describe what miniatures are used to represent this unit on the battlefield.
                                </Form.Text>
                            </Form.Group>
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="notes" title="Notes">
                    <Card>
                        <Card.Body>
                            <Form.Group>
                                <Form.Label>Additional Notes</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    placeholder="Enter any additional notes about this unit..."
                                    rows={5}
                                />
                            </Form.Group>
                        </Card.Body>
                    </Card>
                </Tab>
            </Tabs>

            <div className="d-flex justify-content-between mt-4">
                <Button variant="secondary" onClick={() => navigate('/units')}>
                    Cancel
                </Button>
                <Button type="submit" variant="primary">
                    {unitId ? 'Update Unit' : 'Create Unit'}
                </Button>
            </div>
        </Form>
    );
};

export default UnitForm;