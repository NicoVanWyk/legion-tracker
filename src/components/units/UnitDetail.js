// src/components/units/UnitDetail.js
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Alert, ListGroup, Accordion, Tab, Tabs } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import UnitTypes from '../../enums/UnitTypes';
import Factions from '../../enums/Factions';
import DefenseDice from '../../enums/DefenseDice';
import UpgradeCardTypes from '../../enums/UpgradeCardTypes';
import Keywords from '../../enums/Keywords';
import WeaponRanges from '../../enums/WeaponRanges';
import AttackDice from '../../enums/AttackDice';
import WeaponKeywords from '../../enums/WeaponKeywords';
import LoadingSpinner from '../layout/LoadingSpinner';
import UnitCard from './UnitCard';
import ExportButton from '../common/ExportButton';
import ExportUtils from '../../utils/ExportUtils';

const UnitDetail = ({ unitId }) => {
    const [unit, setUnit] = useState(null);
    const [abilities, setAbilities] = useState([]);
    const [upgrades, setUpgrades] = useState([]);
    const [customKeywords, setCustomKeywords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [customUnitTypes, setCustomUnitTypes] = useState([]);
    const [activeTab, setActiveTab] = useState('details');
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch unit
                const unitRef = doc(db, 'users', currentUser.uid, 'units', unitId);
                const unitDoc = await getDoc(unitRef);

                if (unitDoc.exists()) {
                    const unitData = { id: unitDoc.id, ...unitDoc.data() };
                    setUnit(unitData);

                    // Fetch abilities
                    if (unitData.abilities?.length > 0) {
                        const abilitiesRef = collection(db, 'users', currentUser.uid, 'abilities');
                        const abilitiesSnapshot = await getDocs(abilitiesRef);
                        const abilitiesList = abilitiesSnapshot.docs
                            .map(doc => ({ id: doc.id, ...doc.data() }))
                            .filter(ability => unitData.abilities.includes(ability.id));
                        setAbilities(abilitiesList);
                    }

                    // Fetch upgrade cards for equipped upgrades
                    const allEquippedUpgrades = [];
                    unitData.upgradeSlots?.forEach(slot => {
                        if (slot.equippedUpgrades) allEquippedUpgrades.push(...slot.equippedUpgrades);
                    });

                    if (allEquippedUpgrades.length > 0) {
                        const upgradesRef = collection(db, 'users', currentUser.uid, 'upgradeCards');
                        const upgradesSnapshot = await getDocs(upgradesRef);
                        const upgradesList = upgradesSnapshot.docs
                            .map(doc => ({ id: doc.id, ...doc.data() }))
                            .filter(upgrade => allEquippedUpgrades.includes(upgrade.id));
                        setUpgrades(upgradesList);
                    }

                    // Fetch custom keywords
                    const keywordsRef = collection(db, 'users', currentUser.uid, 'customKeywords');
                    const keywordsSnapshot = await getDocs(keywordsRef);
                    const keywordsList = keywordsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setCustomKeywords(keywordsList);

                    const typesRef = collection(db, 'users', currentUser.uid, 'customUnitTypes');
                    const typesSnapshot = await getDocs(typesRef);
                    setCustomUnitTypes(typesSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })));
                } else {
                    setError('Unit not found');
                }
            } catch (err) {
                console.error('Error fetching unit:', err);
                setError('Failed to fetch unit details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (currentUser && unitId) fetchData();
    }, [currentUser, unitId]);

    const getKeywordDisplay = keyword => {
        if (keyword.startsWith('custom:')) {
            const customId = keyword.replace('custom:', '');
            const customKeyword = customKeywords.find(k => k.id === customId);
            return customKeyword ? (
                <>
                    {customKeyword.name}
                    <span className="ms-1" title="Custom Keyword">★</span>
                </>
            ) : (
                keyword
            );
        }
        return Keywords.getDisplayName(keyword);
    };

    const getTypeDisplayName = (type) => {
        if (Object.values(UnitTypes).includes(type)) {
            return UnitTypes.getDisplayName(type);
        }
        const customType = customUnitTypes.find(t => t.name === type);
        return customType ? customType.displayName : type;
    };

    const handleEdit = () => navigate(`/units/edit/${unitId}`);

    const handleDelete = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }

        try {
            setLoading(true);
            await deleteDoc(doc(db, 'users', currentUser.uid, 'units', unitId));
            navigate('/units');
        } catch (err) {
            console.error('Error deleting unit:', err);
            setError('Failed to delete unit. Please try again later.');
            setLoading(false);
        }
    };

    const cancelDelete = () => setConfirmDelete(false);

    // Handle exporting the unit
    const handleExportUnit = () => {
        if (!unit) return;
        
        // Use ExportUtils to generate text content
        const unitText = ExportUtils.exportUnit(unit, customKeywords, upgrades, abilities, customUnitTypes);
        
        // Download the file
        ExportUtils.downloadTextFile(unitText, `${unit.name.replace(/\s+/g, '_')}_unit.txt`);
    };

    // Get all keywords including those from upgrades
    const getAllKeywords = () => {
        if (!unit) return [];

        let allKeywords = [...(unit.keywords || [])];

        // Add keywords from equipped upgrades
        unit.upgradeSlots?.forEach(slot => {
            slot.equippedUpgrades?.forEach(upgradeId => {
                const upgrade = upgrades.find(u => u.id === upgradeId);
                if (upgrade?.effects?.addKeywords?.length > 0) {
                    allKeywords = [...allKeywords, ...upgrade.effects.addKeywords];
                }
            });
        });

        // Remove duplicates
        return [...new Set(allKeywords)];
    };

    const calculateModifiedStats = () => {
        if (!unit) return null;

        let stats = {
            wounds: unit.wounds || 1,
            // Allow 0 values explicitly (will render as dash)
            courage: unit.isVehicle ? 0 : (unit.courage !== undefined ? unit.courage : 1),
            resilience: unit.isVehicle ? (unit.resilience !== undefined ? unit.resilience : 0) : 0,
            speed: unit.speed || 2,
            modelCount: unit.minModelCount || 1,
            totalPoints: unit.points || 0,
            surgeAttack: unit.surgeAttack || false,
            surgeDefense: unit.surgeDefense || false
        };

        // Apply upgrade modifications
        unit.upgradeSlots?.forEach(slot => {
            slot.equippedUpgrades?.forEach(upgradeId => {
                const upgrade = upgrades.find(u => u.id === upgradeId);
                if (upgrade) {
                    stats.totalPoints += upgrade.pointsCost || 0;

                    if (upgrade.effects?.statModifiers) {
                        stats.wounds += upgrade.effects.statModifiers.wounds || 0;
                        if (unit.isVehicle) {
                            stats.resilience += upgrade.effects.statModifiers.resilience || upgrade.effects.statModifiers.courage || 0;
                        } else {
                            stats.courage += upgrade.effects.statModifiers.courage || 0;
                        }
                        stats.speed += upgrade.effects.statModifiers.speed || 0;

                        if (upgrade.effects.statModifiers.surgeAttack) stats.surgeAttack = true;
                        if (upgrade.effects.statModifiers.surgeDefense) stats.surgeDefense = true;
                    }

                    stats.modelCount += upgrade.effects?.modelCountChange || 0;
                }
            });
        });

        return stats;
    };

    // Combine base weapons with upgrade weapons
    const calculateModifiedWeapons = () => {
        if (!unit) return [];

        const baseWeapons = unit.weapons || [];
        const upgradeWeapons = [];

        unit.upgradeSlots?.forEach(slot => {
            slot.equippedUpgrades?.forEach(upgradeId => {
                const upgrade = upgrades.find(u => u.id === upgradeId);
                if (upgrade?.effects?.addWeapons?.length > 0) {
                    upgrade.effects.addWeapons.forEach(weapon => {
                        upgradeWeapons.push({
                            ...weapon,
                            source: upgrade.name
                        });
                    });
                }
            });
        });

        return [...baseWeapons.map(w => ({ ...w, source: 'Base Unit' })), ...upgradeWeapons];
    };

    const printUnitCard = () => {
        window.print();
    };

    if (loading) return <LoadingSpinner text="Loading unit details..." />;

    if (error)
        return (
            <Alert variant="danger">
                {error}
                <div className="mt-3">
                    <Button variant="primary" onClick={() => navigate('/units')}>
                        Back to Units
                    </Button>
                </div>
            </Alert>
        );

    if (!unit)
        return (
            <Alert variant="warning">
                Unit not found.
                <div className="mt-3">
                    <Button variant="primary" onClick={() => navigate('/units')}>
                        Back to Units
                    </Button>
                </div>
            </Alert>
        );

    const modifiedStats = calculateModifiedStats();
    const modifiedWeapons = calculateModifiedWeapons();

    return (
        <>
            {confirmDelete && (
                <Alert variant="danger">
                    <Alert.Heading>Confirm Delete</Alert.Heading>
                    <p>Are you sure you want to delete this unit? This action cannot be undone.</p>
                    <div className="d-flex justify-content-end">
                        <Button variant="outline-secondary" onClick={cancelDelete} className="me-2">
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Delete Unit
                        </Button>
                    </div>
                </Alert>
            )}

            <Row>
                <Col>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="d-flex align-items-center">
                            {unit.name}
                            {unit.unitIcon && (
                                <div 
                                    className="unit-icon-small ms-3"
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        backgroundColor: 'white',
                                        border: `2px solid ${Factions.getColor(unit.faction)}`
                                    }}
                                >
                                    <img 
                                        src={unit.unitIcon} 
                                        alt={unit.name} 
                                        style={{
                                            maxWidth: '70%',
                                            maxHeight: '70%',
                                            objectFit: 'contain'
                                        }}
                                    />
                                </div>
                            )}
                        </h2>
                        <div>
                            <ExportButton 
                                className="me-2" 
                                onExport={handleExportUnit}
                                text="Export Unit"
                            />
                            <Button variant="outline-secondary" onClick={printUnitCard} className="me-2">
                                <i className="bi bi-printer"></i> Print Card
                            </Button>
                            <Button variant="outline-primary" onClick={handleEdit} className="me-2">
                                Edit
                            </Button>
                            <Button variant="outline-danger" onClick={handleDelete}>
                                {confirmDelete ? 'Confirm Delete' : 'Delete'}
                            </Button>
                        </div>
                    </div>

                    <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
                        <Tab eventKey="details" title="Details">
                            {/* --- UNIT INFO --- */}
                            <Card className="mb-4">
                                <Card.Header className={`faction-${unit.faction}`}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">Unit Information</h5>
                                        <div className="d-flex align-items-center">
                                            <Badge bg="secondary" className="me-2">{getTypeDisplayName(unit.type)}</Badge>
                                            {unit.isVehicle && <Badge bg="info" className="me-2">Vehicle</Badge>}
                                        </div>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col md={3}>
                                            <p>
                                                <strong>Faction:</strong> {Factions.getDisplayName(unit.faction)}
                                            </p>
                                        </Col>
                                        <Col md={3}>
                                            <p>
                                                <strong>Points:</strong> {unit.points || 0}
                                                {modifiedStats.totalPoints !== unit.points && (
                                                    <span className="text-primary"> → {modifiedStats.totalPoints}</span>
                                                )}
                                            </p>
                                        </Col>
                                        <Col md={6}>
                                            <p>
                                                <strong>Stats:</strong>{' '}
                                                {modifiedStats.wounds !== unit.wounds && (
                                                    <span className="text-primary">{modifiedStats.wounds}</span>
                                                )}
                                                {modifiedStats.wounds === unit.wounds && (unit.wounds || 1)}W /{' '}

                                                {unit.isVehicle ? (
                                                    <>
                                                        {modifiedStats.resilience !== unit.resilience && (
                                                            <span className="text-primary">
                                                                {modifiedStats.resilience === 0 ? '-' : modifiedStats.resilience}
                                                            </span>
                                                        )}
                                                        {modifiedStats.resilience === unit.resilience && (
                                                            unit.resilience === 0 ? '-' : unit.resilience
                                                        )}R /{' '}
                                                    </>
                                                ) : (
                                                    <>
                                                        {modifiedStats.courage !== unit.courage && (
                                                            <span className="text-primary">
                                                                {modifiedStats.courage === 0 ? '-' : modifiedStats.courage}
                                                            </span>
                                                        )}
                                                        {modifiedStats.courage === unit.courage && (
                                                            unit.courage === 0 ? '-' : unit.courage
                                                        )}C /{' '}
                                                    </>
                                                )}

                                                {modifiedStats.speed !== unit.speed && (
                                                    <span className="text-primary">{modifiedStats.speed}</span>
                                                )}
                                                {modifiedStats.speed === unit.speed && (unit.speed || 2)}S /{' '}
                                                <span className={DefenseDice.getColorClass(unit.defense)}>
                                                  {unit.defense === 'white' ? 'W' : 'R'}
                                                </span>{' '}
                                                Defense
                                            </p>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={6}>
                                            <p>
                                                <strong>Model Count:</strong> Min: {unit.minModelCount || 1} | Current:{' '}
                                                {unit.minModelCount || 1}
                                                {modifiedStats.modelCount !== unit.minModelCount && (
                                                    <span className="text-primary"> → {modifiedStats.modelCount}</span>
                                                )}
                                            </p>
                                        </Col>
                                        <Col md={6}>
                                            <p>
                                                <strong>Surge Tokens:</strong>{' '}
                                                {unit.surgeAttack || modifiedStats.surgeAttack ? (
                                                    <Badge bg="success" className="me-2">Attack</Badge>
                                                ) : (
                                                    <Badge bg="secondary" className="me-2">No Attack</Badge>
                                                )}
                                                {unit.surgeDefense || modifiedStats.surgeDefense ? (
                                                    <Badge bg="success">Defense</Badge>
                                                ) : (
                                                    <Badge bg="secondary">No Defense</Badge>
                                                )}
                                            </p>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* --- KEYWORDS --- */}
                            <Row>
                                <Col md={6}>
                                    <Card className="mb-4">
                                        <Card.Header>
                                            <h5 className="mb-0">Keywords</h5>
                                        </Card.Header>
                                        <Card.Body>
                                            {getAllKeywords().length > 0 ? (
                                                <div>
                                                    {getAllKeywords().map((keyword, index) => (
                                                        <Badge
                                                            key={index}
                                                            bg={keyword.startsWith('custom:') ? 'info' : (
                                                                // Show keywords from upgrades in a different color
                                                                unit.keywords && unit.keywords.includes(keyword) ? 'secondary' : 'success'
                                                            )}
                                                            className="me-2 mb-2 p-2"
                                                        >
                                                            {getKeywordDisplay(keyword)}
                                                            {!unit.keywords?.includes(keyword) && (
                                                                <span className="ms-1" title="From Upgrade">+</span>
                                                            )}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-muted">No keywords assigned to this unit.</p>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* --- WEAPONS (Base + Upgrades) --- */}
                                <Col md={6}>
                                    <Card className="mb-4">
                                        <Card.Header>
                                            <h5 className="mb-0">Weapons</h5>
                                        </Card.Header>
                                        <Card.Body>
                                            {modifiedWeapons.length > 0 ? (
                                                <ListGroup variant="flush">
                                                    {modifiedWeapons.map((weapon, index) => (
                                                        <ListGroup.Item key={index}>
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <h6 className="mb-0">{weapon.name}</h6>
                                                                <Badge bg={weapon.source === 'Base Unit' ? 'secondary' : 'info'}>
                                                                    {weapon.source}
                                                                </Badge>
                                                            </div>
                                                            <div className="small text-muted">
                                                                <strong>Range:</strong>{' '}
                                                                {WeaponRanges.getDisplayName
                                                                    ? WeaponRanges.getDisplayName(weapon.range)
                                                                    : weapon.range}
                                                            </div>
                                                            <div className="small">
                                                                <strong>Dice:</strong>
                                                                {weapon.dice?.[AttackDice.RED] > 0 && (
                                                                    <span className="text-danger"> {weapon.dice[AttackDice.RED]}R</span>
                                                                )}
                                                                {weapon.dice?.[AttackDice.BLACK] > 0 && (
                                                                    <span> {weapon.dice[AttackDice.BLACK]}B</span>
                                                                )}
                                                                {weapon.dice?.[AttackDice.WHITE] > 0 && (
                                                                    <span className="text-muted"> {weapon.dice[AttackDice.WHITE]}W</span>
                                                                )}
                                                            </div>
                                                            {weapon.keywords?.length > 0 && (
                                                                <div className="small">
                                                                    <strong>Keywords:</strong>{' '}
                                                                    {weapon.keywords
                                                                        .map(kw =>
                                                                            WeaponKeywords.getDisplayName
                                                                                ? WeaponKeywords.getDisplayName(kw)
                                                                                : kw
                                                                        )
                                                                        .join(', ')}
                                                                </div>
                                                            )}
                                                        </ListGroup.Item>
                                                    ))}
                                                </ListGroup>
                                            ) : (
                                                <p className="text-muted">No weapons assigned to this unit.</p>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            {/* --- ABILITIES, UPGRADES, NOTES, etc --- */}
                            {abilities.length > 0 && (
                                <Card className="mb-4">
                                    <Card.Header>
                                        <h5 className="mb-0">Abilities</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <Accordion>
                                            {abilities.map((ability, index) => (
                                                <Accordion.Item key={ability.id} eventKey={index.toString()}>
                                                    <Accordion.Header>
                                                        <strong>{ability.name}</strong>
                                                    </Accordion.Header>
                                                    <Accordion.Body>
                                                        <p className="mb-2 text-muted">{ability.description}</p>
                                                        <div className="mb-2">{ability.rulesText}</div>
                                                        {ability.reminders?.length > 0 && (
                                                            <div className="mt-3">
                                                                <strong className="small">Reminders:</strong>
                                                                <div className="mt-1">
                                                                    {ability.reminders.map((reminder, idx) => (
                                                                        <div key={idx} className="small text-muted mb-1">
                                                                            • {reminder.text}
                                                                            {reminder.condition && (
                                                                                <span className="fst-italic"> ({reminder.condition})</span>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Accordion.Body>
                                                </Accordion.Item>
                                            ))}
                                        </Accordion>
                                    </Card.Body>
                                </Card>
                            )}

                            {unit.upgradeSlots && unit.upgradeSlots.length > 0 && (
                                <Card className="mb-4">
                                    <Card.Header>
                                        <h5 className="mb-0">Upgrade Slots</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        {unit.upgradeSlots.map((slot, index) => {
                                            const equippedUpgrades = upgrades.filter(u =>
                                                slot.equippedUpgrades?.includes(u.id)
                                            );

                                            return (
                                                <div key={index} className="mb-3">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <Badge bg={UpgradeCardTypes.getBadgeColor(slot.type)}>
                                                            <i
                                                                className={UpgradeCardTypes.getIconClass(slot.type) + ' me-1'}
                                                            ></i>
                                                            {UpgradeCardTypes.getDisplayName(slot.type)}
                                                        </Badge>
                                                        <span className="small text-muted">
                          {slot.equippedUpgrades?.length || 0} / {slot.maxCount} equipped
                        </span>
                                                    </div>

                                                    {equippedUpgrades.length > 0 ? (
                                                        <ListGroup variant="flush">
                                                            {equippedUpgrades.map(upgrade => (
                                                                <ListGroup.Item key={upgrade.id} className="py-2">
                                                                    <div className="d-flex justify-content-between">
                                                                        <strong>{upgrade.name}</strong>
                                                                        <Badge bg="warning" text="dark">
                                                                            {upgrade.pointsCost} pts
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="small text-muted">{upgrade.description}</div>
                                                                </ListGroup.Item>
                                                            ))}
                                                        </ListGroup>
                                                    ) : (
                                                        <p className="small text-muted mb-0">No upgrades equipped</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </Card.Body>
                                </Card>
                            )}

                            {unit.miniatures && (
                                <Card className="mb-4">
                                    <Card.Header>
                                        <h5 className="mb-0">Miniature Information</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <p style={{ whiteSpace: 'pre-line' }}>{unit.miniatures}</p>
                                    </Card.Body>
                                </Card>
                            )}

                            {unit.notes && (
                                <Card className="mb-4">
                                    <Card.Header>
                                        <h5 className="mb-0">Notes</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <p style={{ whiteSpace: 'pre-line' }}>{unit.notes}</p>
                                    </Card.Body>
                                </Card>
                            )}
                        </Tab>
                        <Tab eventKey="card" title="Unit Card">
                            {/* Unit Card Display */}
                            <Card className="mb-4">
                                <Card.Body>
                                    <Row>
                                        <Col lg={8} className="mx-auto">
                                            <UnitCard 
                                                unit={unit} 
                                                customUnitTypes={customUnitTypes}
                                            />
                                            <div className="text-center mt-4">
                                                <ExportButton 
                                                    className="me-2"
                                                    variant="primary" 
                                                    onExport={handleExportUnit}
                                                    text="Export Unit"
                                                />
                                                <Button variant="outline-secondary" onClick={printUnitCard}>
                                                    <i className="bi bi-printer"></i> Print Card
                                                </Button>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Tab>
                    </Tabs>

                    <div className="d-flex justify-content-start mt-4">
                        <Button variant="secondary" onClick={() => navigate('/units')}>
                            Back to Units
                        </Button>
                    </div>
                </Col>
            </Row>
        </>
    );
};

export default UnitDetail;