import React, {useState, useEffect} from 'react';
import {Form, Button, Row, Col, Card, Alert, Tab, Tabs, Badge, ListGroup} from 'react-bootstrap';
import {useNavigate, useParams} from 'react-router-dom';
import {doc, collection, addDoc, updateDoc, getDoc, getDocs, serverTimestamp} from 'firebase/firestore';
import {db} from '../../firebase/config';
import {useAuth} from '../../contexts/AuthContext';
import UnitTypes from '../../enums/UnitTypes';
import Factions from '../../enums/Factions';
import DefenseDice from '../../enums/DefenseDice';
import UpgradeCardTypes from '../../enums/UpgradeCardTypes';
import KeywordSelector from './KeywordSelector';
import WeaponSelector from './WeaponSelector';
import IconSelector from './IconSelector';
import BackgroundSelector from './BackgroundSelector';
import LoadingSpinner from '../layout/LoadingSpinner';
import UpgradeCardSelector from '../upgrades/UpgradeCardSelector';
import AbilitySelector from '../abilities/AbilitySelector';
import UnitCard from './UnitCard';
import {useGameSystem} from '../../contexts/GameSystemContext';
import AoSFactions from '../../enums/aos/AoSFactions';
import AoSUnitTypes from '../../enums/aos/AoSUnitTypes';
import GameSystems from '../../enums/GameSystems';

const UnitForm = () => {
    const {currentSystem} = useGameSystem();
    const {unitId} = useParams();
    const navigate = useNavigate();
    const {currentUser} = useAuth();
    const [loading, setLoading] = useState(false);
    const [loadingUnit, setLoadingUnit] = useState(!!unitId);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('basic');
    const [customUnitTypes, setCustomUnitTypes] = useState([]);
    const [availableUpgrades, setAvailableUpgrades] = useState([]);

    const isAoS = currentSystem === GameSystems.AOS;
    const isLegion = currentSystem === GameSystems.LEGION;

    const [formData, setFormData] = useState({
        name: '',
        faction: isLegion ? Factions.REPUBLIC : AoSFactions.STORMCAST_ETERNALS,
        type: isLegion ? UnitTypes.CORPS : AoSUnitTypes.BATTLELINE,
        points: 0,
        // Legion stats
        wounds: 1,
        courage: 1,
        resilience: 0,
        ward: 6,
        defense: DefenseDice.WHITE,
        isVehicle: false,
        surgeAttack: false,
        surgeDefense: false,
        // AoS stats
        health: 1,
        move: 5,
        save: 4,
        control: 1,
        baseSize: '32mm',
        reinforceable: false,
        // Common
        speed: 2,
        minModelCount: 1,
        currentModelCount: 1,
        keywords: [],
        weapons: [],
        abilities: [],
        upgradeSlots: [],
        miniatures: '',
        notes: '',
        unitIcon: '',
        cardBackground: ''
    });

    const [validated, setValidated] = useState(false);

    useEffect(() => {
        const fetchUnit = async () => {
            if (!unitId || !currentUser) return;
            try {
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
                        isVehicle: unitData.isVehicle || false,
                        surgeAttack: unitData.surgeAttack || false,
                        surgeDefense: unitData.surgeDefense || false,
                        courage: unitData.isVehicle ? 0 : (unitData.courage !== undefined ? unitData.courage : 1),
                        resilience: unitData.isVehicle ? (unitData.resilience !== undefined ? unitData.resilience : 0) : 0,
                        health: unitData.health || unitData.wounds || 1,
                        move: unitData.move || 5,
                        save: unitData.save || 4,
                        control: unitData.control || 1,
                        baseSize: unitData.baseSize || '32mm',
                        reinforceable: unitData.reinforceable || false,
                        unitIcon: unitData.unitIcon || '',
                        cardBackground: unitData.cardBackground || ''
                    });
                } else {
                    setError('Unit not found');
                }
            } catch (err) {
                console.error('Error fetching unit:', err);
                setError('Failed to fetch unit details.');
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
                const customTypesSnap = await getDocs(collection(db, 'users', currentUser.uid, 'customUnitTypes'));
                setCustomUnitTypes(customTypesSnap.docs.map(d => ({id: d.id, ...d.data()})));
                const upgradesSnap = await getDocs(collection(db, 'users', currentUser.uid, 'upgradeCards'));
                setAvailableUpgrades(upgradesSnap.docs.map(d => ({id: d.id, ...d.data()})));
            } catch (err) {
                console.error('Error fetching options:', err);
            }
        };
        fetchAvailableOptions();
    }, [currentUser]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: ['points', 'wounds', 'courage', 'resilience', 'speed', 'minModelCount', 'health', 'move', 'save', 'control'].includes(name)
                ? (value === '' ? 0 : parseInt(value, 10))
                : value
        }));
    };

    const handleCheckboxChange = (e) => {
        const {name, checked} = e.target;
        setFormData(prev => ({...prev, [name]: checked}));
    };

    const handleIconChange = (iconPath) => {
        setFormData(prev => ({...prev, unitIcon: iconPath}));
    };

    const handleBackgroundChange = (backgroundPath) => {
        setFormData(prev => ({...prev, cardBackground: backgroundPath}));
    };

    const handleKeywordsChange = (keywords) => {
        setFormData(prev => ({...prev, keywords}));
    };

    const handleWeaponsChange = (weapons) => setFormData(prev => ({...prev, weapons}));
    const handleAbilitiesChange = (abilities) => setFormData(prev => ({...prev, abilities}));

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

    useEffect(() => {
        const calcModelCount = async () => {
            if (!currentUser) return;
            let total = formData.minModelCount || 1;

            for (const slot of formData.upgradeSlots) {
                for (const id of slot.equippedUpgrades || []) {
                    const upgradeDoc = await getDoc(doc(db, 'users', currentUser.uid, 'upgradeCards', id));
                    if (upgradeDoc.exists()) {
                        const effects = upgradeDoc.data().effects;
                        if (effects?.modelCountChange) total += effects.modelCountChange;
                    }
                }
            }
            setFormData(prev => ({...prev, currentModelCount: total}));
        };
        calcModelCount();
    }, [formData.upgradeSlots, formData.minModelCount, currentUser]);

    const calculateTotalPoints = () => {
        let total = formData.points || 0;
        formData.upgradeSlots?.forEach(slot =>
            slot.equippedUpgrades?.forEach(id => {
                const up = availableUpgrades.find(u => u.id === id);
                if (up) total += up.pointsCost || 0;
            })
        );
        return total;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        if (formData.minModelCount < 1) {
            setError('Minimum model count must be at least 1');
            return;
        }

        try {
            setLoading(true);
            const dataToSave = {
                ...formData,
                gameSystem: currentSystem,
                totalPoints: calculateTotalPoints(),
                updatedAt: serverTimestamp(),
                userId: currentUser.uid
            };

            if (unitId) {
                await updateDoc(doc(db, 'users', currentUser.uid, 'units', unitId), dataToSave);
                setSuccess('Unit updated!');
            } else {
                dataToSave.createdAt = serverTimestamp();
                const ref = await addDoc(collection(db, 'users', currentUser.uid, 'units'), dataToSave);
                setSuccess('Unit created!');
                navigate(`/units/${ref.id}`);
            }
        } catch (err) {
            console.error('Save error:', err);
            setError('Failed to save unit.');
        } finally {
            setLoading(false);
        }
    };

    if (loadingUnit) return <LoadingSpinner text="Loading unit..."/>;
    if (loading) return <LoadingSpinner text="Saving..."/>;

    const FactionEnum = isLegion ? Factions : AoSFactions;
    const TypeEnum = isLegion ? UnitTypes : AoSUnitTypes;

    return (
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-3" fill>
                <Tab eventKey="basic" title="Basic Info">
                    <Card>
                        <Card.Body>
                            <Row>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Unit Name</Form.Label>
                                        <Form.Control
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter unit name"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Faction</Form.Label>
                                        <Form.Select name="faction" value={formData.faction} onChange={handleChange}>
                                            {Object.values(FactionEnum).filter(f => typeof f === 'string').map(f => (
                                                <option key={f} value={f}>{FactionEnum.getDisplayName(f)}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Unit Type</Form.Label>
                                        <Form.Select name="type" value={formData.type} onChange={handleChange}>
                                            {Object.values(TypeEnum).filter(t => typeof t !== 'function' && typeof t === 'string').map(t => (
                                                <option key={t} value={t}>{TypeEnum.getDisplayName(t)}</option>
                                            ))}
                                            {customUnitTypes.map(t => (
                                                <option key={t.id} value={t.name}>{t.displayName}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Points</Form.Label>
                                        <Form.Control
                                            name="points"
                                            type="number"
                                            value={formData.points}
                                            onChange={handleChange}
                                        />
                                        <Form.Text>Total: {calculateTotalPoints()} pts</Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>

                            {isLegion && (
                                <>
                                    <Row className="mt-3">
                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label>Defense Dice</Form.Label>
                                                <Form.Select
                                                    name="defense"
                                                    value={formData.defense}
                                                    onChange={handleChange}
                                                >
                                                    {Object.values(DefenseDice).filter(f => typeof f === 'string').map(f => (
                                                        <option key={f}
                                                                value={f}>{DefenseDice.getDisplayName(f)}</option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label>Wounds</Form.Label>
                                                <Form.Control
                                                    name="wounds"
                                                    type="number"
                                                    value={formData.wounds}
                                                    onChange={handleChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label>
                                                    {formData.isVehicle ? 'Resilience' : 'Courage'}
                                                    {currentSystem === GameSystems.LEGION && (
                                                        <Badge bg="info" className="ms-2">
                                                            {formData.isVehicle ? 'Vehicle' : 'Trooper'}
                                                        </Badge>
                                                    )}
                                                </Form.Label>
                                                <Form.Control
                                                    name={formData.isVehicle ? 'resilience' : 'courage'}
                                                    type="number"
                                                    value={formData.isVehicle ? formData.resilience : formData.courage}
                                                    onChange={handleChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label>Speed</Form.Label>
                                                <Form.Control
                                                    name="speed"
                                                    type="number"
                                                    value={formData.speed}
                                                    onChange={handleChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className="mt-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Surge Tokens</Form.Label>
                                                <div>
                                                    <Form.Check
                                                        type="checkbox"
                                                        id="surge-attack"
                                                        label="Surge to Attack"
                                                        name="surgeAttack"
                                                        checked={formData.surgeAttack}
                                                        onChange={handleCheckboxChange}
                                                        className="mb-2"
                                                    />
                                                    <Form.Check
                                                        type="checkbox"
                                                        id="surge-defense"
                                                        label="Surge to Defense"
                                                        name="surgeDefense"
                                                        checked={formData.surgeDefense}
                                                        onChange={handleCheckboxChange}
                                                    />
                                                </div>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Vehicle Type</Form.Label>
                                                <Form.Check
                                                    type="checkbox"
                                                    id="is-vehicle"
                                                    label="This unit is a vehicle"
                                                    name="isVehicle"
                                                    checked={formData.isVehicle}
                                                    onChange={handleCheckboxChange}
                                                    className="mb-2"
                                                />
                                                <Form.Text className="text-muted">
                                                    Vehicles use Resilience instead of Courage.
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </>
                            )}

                            {isAoS && (
                                <>
                                    <Row className="mt-3">
                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label>Move</Form.Label>
                                                <Form.Control
                                                    name="move"
                                                    type="number"
                                                    value={formData.move}
                                                    onChange={handleChange}
                                                />
                                                <Form.Text>inches</Form.Text>
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label>Health</Form.Label>
                                                <Form.Control
                                                    name="health"
                                                    type="number"
                                                    value={formData.health}
                                                    onChange={handleChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label>Save</Form.Label>
                                                <Form.Control
                                                    name="save"
                                                    type="number"
                                                    min="2"
                                                    max="6"
                                                    value={formData.save}
                                                    onChange={handleChange}
                                                />
                                                <Form.Text>2+ to 6+</Form.Text>
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label>Control</Form.Label>
                                                <Form.Control
                                                    name="control"
                                                    type="number"
                                                    value={formData.control}
                                                    onChange={handleChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className="mt-3">
                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label>Ward Save (Optional)</Form.Label>
                                                <Form.Control
                                                    name="ward"
                                                    type="number"
                                                    min="2"
                                                    max="6"
                                                    value={formData.ward || ''}
                                                    onChange={handleChange}
                                                    placeholder="e.g., 5"
                                                />
                                                <Form.Text>Ward save value (2-6)</Form.Text>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className="mt-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Base Size</Form.Label>
                                                <Form.Control
                                                    name="baseSize"
                                                    value={formData.baseSize}
                                                    onChange={handleChange}
                                                    placeholder="e.g., 32mm, 40mm, 60x35mm oval"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Unit Options</Form.Label>
                                                <Form.Check
                                                    type="checkbox"
                                                    id="reinforceable"
                                                    label="Unit can be Reinforced"
                                                    name="reinforceable"
                                                    checked={formData.reinforceable}
                                                    onChange={handleCheckboxChange}
                                                />
                                                <Form.Text className="text-muted">
                                                    Reinforced units contain double the models.
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </>
                            )}

                            <Card className="mt-3">
                                <Card.Header><strong>Model Count</strong></Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>
                                                    {isAoS ? 'Base Models' : 'Minimum Models'}
                                                </Form.Label>
                                                <Form.Control
                                                    name="minModelCount"
                                                    type="number"
                                                    value={formData.minModelCount}
                                                    onChange={handleChange}
                                                    min="1"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Current Models</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    value={formData.currentModelCount}
                                                    disabled
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="keywords" title="Keywords">
                    <Card><Card.Body><KeywordSelector selectedKeywords={formData.keywords}
                                                      onChange={handleKeywordsChange}/></Card.Body></Card>
                </Tab>

                <Tab eventKey="weapons" title="Weapons">
                    <Card><Card.Body><WeaponSelector weapons={formData.weapons}
                                                     onChange={handleWeaponsChange}/></Card.Body></Card>
                </Tab>

                <Tab eventKey="abilities" title={`Abilities (${formData.abilities?.length || 0})`}>
                    <Card>
                        <Card.Body>
                            <AbilitySelector
                                selectedAbilities={formData.abilities}
                                onChange={handleAbilitiesChange}
                            />
                        </Card.Body>
                    </Card>
                </Tab>

                {isLegion && (
                    <Tab eventKey="upgrades" title={`Upgrades (${formData.upgradeSlots?.length || 0})`}>
                        <Card>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5>Upgrade Slots</h5>
                                    <Button onClick={addUpgradeSlot}>+ Add Slot</Button>
                                </div>

                                {formData.upgradeSlots.length === 0 ? (
                                    <Alert>No upgrade slots added yet</Alert>
                                ) : (
                                    <ListGroup>
                                        {formData.upgradeSlots.map((slot, i) => (
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
                    </Tab>
                )}

                <Tab eventKey="appearance" title="Appearance">
                    <Card>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-4">
                                        <Form.Label><strong>Unit Icon</strong></Form.Label>
                                        <IconSelector
                                            selectedIcon={formData.unitIcon}
                                            onChange={handleIconChange}
                                        />
                                        <Form.Text className="text-muted">
                                            Select an icon to represent this unit on cards and in the army list.
                                        </Form.Text>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group className="mb-4">
                                        <Form.Label><strong>Card Background</strong></Form.Label>
                                        <BackgroundSelector
                                            selectedBackground={formData.cardBackground}
                                            onChange={handleBackgroundChange}
                                        />
                                        <Form.Text className="text-muted">
                                            Select a background image for this unit's card.
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="mt-4">
                                <div className="mb-3">
                                    <strong>Preview</strong>
                                </div>
                                <Row>
                                    <Col md={8} className="mx-auto">
                                        <UnitCard unit={formData} customUnitTypes={customUnitTypes}/>
                                    </Col>
                                </Row>
                            </div>
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="notes" title="Notes">
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Miniature Information</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>Miniatures</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="miniatures"
                                    rows={3}
                                    value={formData.miniatures || ''}
                                    onChange={handleChange}
                                    placeholder="Enter information about which miniatures to use for this unit..."
                                />
                            </Form.Group>
                        </Card.Body>
                    </Card>

                    <Card className="mt-3">
                        <Card.Header>
                            <h5 className="mb-0">Notes</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form.Control
                                as="textarea"
                                name="notes"
                                rows={5}
                                value={formData.notes || ''}
                                onChange={handleChange}
                                placeholder="Enter any additional notes about this unit..."
                            />
                        </Card.Body>
                    </Card>
                </Tab>
            </Tabs>

            <div className="d-flex justify-content-between mt-3">
                <Button variant="secondary" onClick={() => navigate('/units')}>Cancel</Button>
                <Button type="submit" variant="primary">{unitId ? 'Update Unit' : 'Create Unit'}</Button>
            </div>
        </Form>
    );
};

export default UnitForm;