// src/components/units/ArmyForm.js
import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert, ListGroup, Badge } from 'react-bootstrap';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { doc, collection, addDoc, updateDoc, getDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import Factions from '../../enums/Factions';
import UnitTypes from '../../enums/UnitTypes';
import CommandCards from '../../enums/CommandCards';
import LoadingSpinner from '../layout/LoadingSpinner';
import ArmyPointsCalculator from '../../utils/ArmyPointsCalculator';

const ArmyForm = () => {
    const { armyId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [loadingArmy, setLoadingArmy] = useState(!!armyId);
    const [loadingUnits, setLoadingUnits] = useState(true);
    const [customUnitTypes, setCustomUnitTypes] = useState([]);
    const [upgrades, setUpgrades] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        faction: Factions.REPUBLIC,
        description: '',
        units: [], // Array of unit IDs
        commandCards: [], // Array of command card IDs
        totalPoints: 0
    });

    // Available units
    const [availableUnits, setAvailableUnits] = useState([]);

    // Selected units with details
    const [selectedUnits, setSelectedUnits] = useState([]);

    // Form validation state
    const [validated, setValidated] = useState(false);

    // Load army data if editing
    useEffect(() => {
        const fetchArmy = async () => {
            try {
                if (armyId && currentUser) {
                    setLoadingArmy(true);

                    // Get reference to the army document
                    const armyRef = doc(db, 'users', currentUser.uid, 'armies', armyId);

                    // Get the army data
                    const armyDoc = await getDoc(armyRef);

                    if (armyDoc.exists()) {
                        const armyData = armyDoc.data();
                        setFormData({
                            ...armyData,
                            // Ensure we have the required fields even if they're missing in the data
                            units: armyData.units || [],
                            commandCards: armyData.commandCards || [], // Load command cards
                        });

                        // Fetch upgrades
                        const upgradesRef = collection(db, 'users', currentUser.uid, 'upgradeCards');
                        const upgradesSnapshot = await getDocs(upgradesRef);
                        const upgradesList = upgradesSnapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }));
                        setUpgrades(upgradesList);

                        // Fetch selected units' details
                        const unitIds = armyData.units || [];
                        const unitDetails = [];

                        for (const unitId of unitIds) {
                            const unitRef = doc(db, 'users', currentUser.uid, 'units', unitId);
                            const unitDoc = await getDoc(unitRef);

                            if (unitDoc.exists()) {
                                unitDetails.push({
                                    id: unitDoc.id,
                                    ...unitDoc.data()
                                });
                            }
                        }

                        setSelectedUnits(unitDetails);

                        // Recalculate total points based on units and upgrades
                        const calculatedPoints = ArmyPointsCalculator.calculateArmyPoints(unitDetails, upgradesList);
                        if (calculatedPoints !== armyData.totalPoints) {
                            setFormData(prev => ({
                                ...prev,
                                totalPoints: calculatedPoints
                            }));
                        }
                    } else {
                        setError('Army not found');
                    }
                }
            } catch (err) {
                console.error('Error fetching army:', err);
                setError('Failed to fetch army details. Please try again later.');
            } finally {
                setLoadingArmy(false);
            }
        };

        fetchArmy();
    }, [currentUser, armyId]);

    // Load custom unit types
    useEffect(() => {
        const fetchCustomUnitTypes = async () => {
            if (!currentUser) return;

            try {
                const typesRef = collection(db, 'users', currentUser.uid, 'customUnitTypes');
                const typesSnapshot = await getDocs(typesRef);
                const typesList = typesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCustomUnitTypes(typesList);
            } catch (err) {
                console.error('Error fetching custom unit types:', err);
            }
        };

        fetchCustomUnitTypes();
    }, [currentUser]);

    // Load available units based on faction
    useEffect(() => {
        const fetchUnits = async () => {
            try {
                setLoadingUnits(true);

                if (!currentUser) return;

                // Fetch all upgrades if not already loaded
                if (upgrades.length === 0) {
                    const upgradesRef = collection(db, 'users', currentUser.uid, 'upgradeCards');
                    const upgradesSnapshot = await getDocs(upgradesRef);
                    const upgradesList = upgradesSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setUpgrades(upgradesList);
                }

                // Create a reference to the user's units collection
                const unitsRef = collection(db, 'users', currentUser.uid, 'units');

                // Create a query for units of the selected faction
                const q = query(unitsRef, where('faction', '==', formData.faction));

                // Execute the query
                const querySnapshot = await getDocs(q);

                // Map through the documents
                const unitsList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Sort by unit type
                unitsList.sort((a, b) => {
                    // Order: Command, Corps, Special Forces, Support, Heavy, Operative, Auxiliary
                    const typeOrder = {
                        [UnitTypes.COMMAND]: 1,
                        [UnitTypes.CORPS]: 2,
                        [UnitTypes.SPECIAL_FORCES]: 3,
                        [UnitTypes.SUPPORT]: 4,
                        [UnitTypes.HEAVY]: 5,
                        [UnitTypes.OPERATIVE]: 6,
                        [UnitTypes.AUXILIARY]: 7
                    };

                    // Add custom unit types to the ordering
                    customUnitTypes.forEach(ct => {
                        typeOrder[ct.name] = ct.sortOrder || 100;
                    });

                    // If type isn't found in typeOrder, give it a high number
                    const aOrder = typeOrder[a.type] !== undefined ? typeOrder[a.type] : 999;
                    const bOrder = typeOrder[b.type] !== undefined ? typeOrder[b.type] : 999;

                    return aOrder - bOrder || a.name.localeCompare(b.name);
                });

                setAvailableUnits(unitsList);
            } catch (err) {
                console.error('Error fetching units:', err);
                setError('Failed to fetch available units. Please try again later.');
            } finally {
                setLoadingUnits(false);
            }
        };

        fetchUnits();
    }, [currentUser, formData.faction, customUnitTypes, upgrades.length]);

    const getTypeDisplayName = (type) => {
        // First check if it's a system unit type
        if (Object.values(UnitTypes).includes(type)) {
            return UnitTypes.getDisplayName(type);
        }

        // Then check if it's a custom unit type
        const customType = customUnitTypes.find(t => t.name === type);
        if (customType) {
            return customType.displayName || customType.name;
        }

        // If we can't find it, just return the type as-is
        return type;
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'faction') {
            // Reset selected units when faction changes
            setFormData(prev => ({
                ...prev,
                [name]: value,
                units: [],
                totalPoints: 0
            }));
            setSelectedUnits([]);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Handle adding a unit to the army
    const handleAddUnit = (unit) => {
        // Check if unit is already selected
        if (formData.units.includes(unit.id)) {
            return;
        }

        // Calculate unit points including upgrades
        const unitPoints = ArmyPointsCalculator.calculateUnitPoints(unit, upgrades);

        // Add unit to the army
        setFormData(prev => ({
            ...prev,
            units: [...prev.units, unit.id],
            totalPoints: prev.totalPoints + unitPoints
        }));

        // Add unit to the selected units
        setSelectedUnits(prev => [...prev, unit]);
    };

    // Handle removing a unit from the army
    const handleRemoveUnit = (unitId) => {
        // Find the unit in selected units
        const unit = selectedUnits.find(u => u.id === unitId);

        if (!unit) return;

        // Calculate unit points including upgrades
        const unitPoints = ArmyPointsCalculator.calculateUnitPoints(unit, upgrades);

        // Remove unit from the army
        setFormData(prev => ({
            ...prev,
            units: prev.units.filter(id => id !== unitId),
            totalPoints: prev.totalPoints - unitPoints
        }));

        // Remove unit from the selected units
        setSelectedUnits(prev => prev.filter(u => u.id !== unitId));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        try {
            setLoading(true);
            setError('');

            if (!currentUser) {
                throw new Error('You must be logged in to create an army');
            }

            // Prepare data
            const armyToSave = {
                ...formData,
                userId: currentUser.uid,
                updatedAt: serverTimestamp()
            };

            if (armyId) {
                // Update existing army
                const armyRef = doc(db, 'users', currentUser.uid, 'armies', armyId);
                await updateDoc(armyRef, armyToSave);
                setSuccess('Army updated successfully!');

                // Navigate to army details after short delay
                setTimeout(() => {
                    navigate(`/armies/${armyId}`);
                }, 1500);
            } else {
                // Create new army
                armyToSave.createdAt = serverTimestamp();
                const armyRef = await addDoc(collection(db, 'users', currentUser.uid, 'armies'), armyToSave);
                setSuccess('Army created successfully!');

                // Reset form
                setFormData({
                    name: '',
                    faction: Factions.REPUBLIC,
                    description: '',
                    units: [],
                    commandCards: [],
                    totalPoints: 0
                });

                setSelectedUnits([]);

                // Navigate to army details after short delay
                setTimeout(() => {
                    navigate(`/armies/${armyRef.id}`);
                }, 1500);
            }
        } catch (err) {
            console.error('Error saving army:', err);
            setError(`Failed to save army: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Group units by type for the available units list
    const getGroupedAvailableUnits = () => {
        // First, get all unit types from the available units
        const unitTypes = [...new Set(availableUnits.map(unit => unit.type))];

        // Sort types based on the same order logic used in fetchUnits
        unitTypes.sort((a, b) => {
            const typeOrder = {
                [UnitTypes.COMMAND]: 1,
                [UnitTypes.CORPS]: 2,
                [UnitTypes.SPECIAL_FORCES]: 3,
                [UnitTypes.SUPPORT]: 4,
                [UnitTypes.HEAVY]: 5,
                [UnitTypes.OPERATIVE]: 6,
                [UnitTypes.AUXILIARY]: 7
            };

            // Add custom unit types to the ordering
            customUnitTypes.forEach(ct => {
                typeOrder[ct.name] = ct.sortOrder || 100;
            });

            // If type isn't found in typeOrder, give it a high number
            const aOrder = typeOrder[a] !== undefined ? typeOrder[a] : 999;
            const bOrder = typeOrder[b] !== undefined ? typeOrder[b] : 999;

            return aOrder - bOrder;
        });

        // For each type, get all units of that type
        return unitTypes.map(type => ({
            type,
            displayName: getTypeDisplayName(type),
            units: availableUnits.filter(unit => unit.type === type)
        }));
    };

    // Calculate counts of each unit type
    const unitTypeCounts = selectedUnits.reduce((counts, unit) => {
        const type = unit.type;
        counts[type] = (counts[type] || 0) + 1;
        return counts;
    }, {});

    if (loadingArmy) {
        return <LoadingSpinner text="Loading army data..." />;
    }

    if (loading) {
        return <LoadingSpinner text={armyId ? 'Updating army...' : 'Creating army...'} />;
    }

    // Group available units by type
    const groupedUnits = getGroupedAvailableUnits();

    return (
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Row>
                <Col md={7}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">Army Details</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={8}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Army Name</Form.Label>
                                        <Form.Control
                                            required
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter army name"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Please enter an army name.
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>

                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Faction</Form.Label>
                                        <Form.Select
                                            required
                                            name="faction"
                                            value={formData.faction}
                                            onChange={handleChange}
                                            disabled={selectedUnits.length > 0}
                                        >
                                            <option value={Factions.REPUBLIC}>{Factions.getDisplayName(Factions.REPUBLIC)}</option>
                                            <option value={Factions.SEPARATIST}>{Factions.getDisplayName(Factions.SEPARATIST)}</option>
                                            <option value={Factions.REBEL}>{Factions.getDisplayName(Factions.REBEL)}</option>
                                            <option value={Factions.EMPIRE}>{Factions.getDisplayName(Factions.EMPIRE)}</option>
                                        </Form.Select>
                                        {selectedUnits.length > 0 && (
                                            <Form.Text className="text-muted">
                                                Cannot change faction while units are selected.
                                            </Form.Text>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter a description for your army..."
                                    rows={3}
                                />
                            </Form.Group>

                            <Row>
                                <Col>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h5>Selected Units ({selectedUnits.length})</h5>
                                        <span className="fw-bold">
                                            Total Points: {formData.totalPoints}
                                        </span>
                                    </div>

                                    {/* Unit type counts */}
                                    <div className="mb-3">
                                        {Object.entries(unitTypeCounts).map(([type, count]) => (
                                            <Badge
                                                key={type}
                                                bg="secondary"
                                                className={`me-2 unit-type-${type}`}
                                                style={{
                                                    fontSize: '0.85rem',
                                                    padding: '0.25rem 0.5rem'
                                                }}
                                            >
                                                {getTypeDisplayName(type)}: {count}
                                            </Badge>
                                        ))}
                                    </div>

                                    {selectedUnits.length === 0 ? (
                                        <Alert variant="info">
                                            No units selected. Add units from the list on the right.
                                        </Alert>
                                    ) : (
                                        <ListGroup variant="flush" className="border rounded">
                                            {selectedUnits.map(unit => (
                                                <ListGroup.Item
                                                    key={unit.id}
                                                    className="d-flex justify-content-between align-items-center"
                                                >
                                                    <div>
                                                        <div className="fw-bold">{unit.name}</div>
                                                        <div className="small text-muted">
                                                            {getTypeDisplayName(unit.type)} • 
                                                            {ArmyPointsCalculator.calculateUnitPoints(unit, upgrades)} points
                                                            {ArmyPointsCalculator.calculateUnitPoints(unit, upgrades) !== unit.points && (
                                                                <span className="ms-1 text-primary" title="Includes upgrade costs">
                                                                    (Base: {unit.points})
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleRemoveUnit(unit.id)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </Col>
                            </Row>

                            {/* Command Cards Notice */}
                            {formData.units.length > 0 && (
                                <Alert variant="info" className="mt-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>
                                            <strong>Command Cards:</strong> {formData.commandCards?.length || 0}/7
                                        </span>
                                        {armyId ? (
                                            <Button
                                                as={Link}
                                                to={`/armies/${armyId}/command-cards`}
                                                variant="outline-primary"
                                                size="sm"
                                            >
                                                Manage Command Cards
                                            </Button>
                                        ) : (
                                            <span className="text-muted">Save army first to manage command cards</span>
                                        )}
                                    </div>
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>

                    <div className="d-flex justify-content-between">
                        <Button variant="secondary" onClick={() => navigate('/armies')}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            {armyId ? 'Update Army' : 'Create Army'}
                        </Button>
                    </div>
                </Col>

                <Col md={5}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Available Units</h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {loadingUnits ? (
                                <div className="text-center py-4">
                                    <LoadingSpinner text="Loading units..." />
                                </div>
                            ) : availableUnits.length === 0 ? (
                                <div className="text-center py-4">
                                    <p className="mb-0">No units available for the selected faction.</p>
                                    <Button
                                        as={Link}
                                        to="/units/create"
                                        variant="link"
                                    >
                                        Create a new unit
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {groupedUnits.map(group => (
                                        <div key={group.type}>
                                            <div className={`bg-light p-2 fw-bold ${group.type === Object.values(UnitTypes)[0] ? 'border-top-0' : ''}`}>
                                                {group.displayName}
                                                {customUnitTypes.find(t => t.name === group.type) && (
                                                    <Badge bg="info" className="ms-2">Custom</Badge>
                                                )}
                                            </div>
                                            <ListGroup variant="flush">
                                                {group.units.map(unit => (
                                                    <ListGroup.Item
                                                        key={unit.id}
                                                        className="d-flex justify-content-between align-items-center"
                                                    >
                                                        <div>
                                                            <div className="fw-bold">{unit.name}</div>
                                                            <div className="small text-muted">
                                                                {ArmyPointsCalculator.calculateUnitPoints(unit, upgrades)} points
                                                                {ArmyPointsCalculator.calculateUnitPoints(unit, upgrades) !== unit.points && (
                                                                    <span className="ms-1 text-primary" title="Includes upgrade costs">
                                                                        (Base: {unit.points})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant={formData.units.includes(unit.id) ? "outline-success" : "outline-primary"}
                                                            size="sm"
                                                            onClick={() => handleAddUnit(unit)}
                                                            disabled={formData.units.includes(unit.id)}
                                                        >
                                                            {formData.units.includes(unit.id) ? "Added" : "Add"}
                                                        </Button>
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        </div>
                                    ))}
                                </>
                            )}
                        </Card.Body>
                    </Card>

                    <Alert variant="secondary" className="mt-3">
                        <p className="mb-1"><strong>Army Building Rules:</strong></p>
                        <ul className="mb-0 small">
                            <li>Every army requires at least 1 Commander unit</li>
                            <li>An army must include 3-6 Corps units</li>
                            <li>Special Forces, Support, Heavy, and Operative units are optional</li>
                            <li>Once your army is saved, you can add command cards</li>
                            <li>A complete army should have 7 command cards</li>
                        </ul>
                    </Alert>
                </Col>
            </Row>
        </Form>
    );
};

export default ArmyForm;