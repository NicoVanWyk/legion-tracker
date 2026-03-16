// src/components/units/ArmyDetail.js
import React, {useState, useEffect} from 'react';
import {Card, Row, Col, Badge, Button, Alert, Table, ListGroup, Accordion} from 'react-bootstrap';
import {useNavigate, Link} from 'react-router-dom';
import {doc, getDoc, deleteDoc, collection, getDocs, query, where} from 'firebase/firestore';
import {db} from '../../firebase/config';
import {useAuth} from '../../contexts/AuthContext';
import UnitTypes from '../../enums/UnitTypes';
import Factions from '../../enums/Factions';
import DefenseDice from '../../enums/DefenseDice';
import Keywords from '../../enums/Keywords';
import WeaponKeywords from '../../enums/WeaponKeywords';
import WeaponRanges from '../../enums/WeaponRanges';
import AttackDice from '../../enums/AttackDice';
import CommandCards from '../../enums/CommandCards';
import LoadingSpinner from '../layout/LoadingSpinner';
import ExportButton from '../common/ExportButton';
import ExportUtils from '../../utils/ExportUtils';
import CommandCardValidator from '../../utils/CommandCardValidator';
import KeywordUtils from '../../utils/KeywordUtils';
import ArmyPointsCalculator from '../../utils/ArmyPointsCalculator';
import {useGameSystem} from '../../contexts/GameSystemContext';
import AoSFactions from '../../enums/aos/AoSFactions';
import AoSUnitTypes from '../../enums/aos/AoSUnitTypes';
import GameSystems from '../../enums/GameSystems';
import RegimentCard from '../aos/RegimentCard';
import AoSContentTypes from '../../enums/aos/AoSContentTypes';

const ArmyDetail = ({armyId}) => {
    const [army, setArmy] = useState(null);
    const [unitDetails, setUnitDetails] = useState([]);
    const [upgrades, setUpgrades] = useState([]);
    const [abilities, setAbilities] = useState([]);
    const [customKeywords, setCustomKeywords] = useState([]);
    const [customUnitTypes, setCustomUnitTypes] = useState([]);
    const [commandCards, setCommandCards] = useState([]);
    const [commandCardValidation, setCommandCardValidation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [armyContent, setArmyContent] = useState([]);

    const {currentUser} = useAuth();
    const {currentSystem} = useGameSystem();
    const navigate = useNavigate();

    const FactionEnum = currentSystem === GameSystems.LEGION ? Factions : AoSFactions;
    const TypeEnum = currentSystem === GameSystems.LEGION ? UnitTypes : AoSUnitTypes;

    useEffect(() => {
        const fetchArmy = async () => {
            try {
                setLoading(true);

                const armyRef = doc(db, 'users', currentUser.uid, 'armies', armyId);
                const armyDoc = await getDoc(armyRef);

                if (armyDoc.exists()) {
                    const armyData = {
                        id: armyDoc.id,
                        ...armyDoc.data()
                    };

                    setArmy(armyData);

                    const unitIds = armyData.units || [];
                    const units = [];

                    const keywordsRef = collection(db, 'users', currentUser.uid, 'customKeywords');
                    const keywordsSnapshot = await getDocs(keywordsRef);
                    const keywordsList = keywordsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setCustomKeywords(keywordsList);

                    const typesRef = collection(db, 'users', currentUser.uid, 'customUnitTypes');
                    const typesSnapshot = await getDocs(typesRef);
                    const typesList = typesSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setCustomUnitTypes(typesList);

                    const upgradesRef = collection(db, 'users', currentUser.uid, 'upgradeCards');
                    const upgradesSnapshot = await getDocs(upgradesRef);
                    const upgradesList = upgradesSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setUpgrades(upgradesList);

                    const abilitiesRef = collection(db, 'users', currentUser.uid, 'abilities');
                    const abilitiesSnapshot = await getDocs(abilitiesRef);
                    const abilitiesList = abilitiesSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setAbilities(abilitiesList);

                    if (currentSystem === GameSystems.LEGION && armyData.commandCards?.length > 0) {
                        const cardDetails = [];
                        const customCardsRef = collection(db, 'users', currentUser.uid, 'commandCards');
                        const customCardsSnapshot = await getDocs(customCardsRef);

                        for (const cardId of armyData.commandCards) {
                            if (CommandCards.getAllSystemCards().includes(cardId)) {
                                cardDetails.push({
                                    id: cardId,
                                    name: CommandCards.getDisplayName(cardId),
                                    pips: CommandCards.getPips(cardId),
                                    faction: CommandCards.getFaction(cardId),
                                    commander: CommandCards.getCommanderRequirement(cardId),
                                    description: CommandCards.getDescription(cardId),
                                    isSystem: true
                                });
                            } else {
                                const cardDoc = customCardsSnapshot.docs.find(doc => doc.id === cardId);
                                if (cardDoc) {
                                    cardDetails.push({
                                        id: cardId,
                                        ...cardDoc.data(),
                                        isSystem: false
                                    });
                                }
                            }
                        }

                        setCommandCards(cardDetails);

                        const commanders = [];

                        for (const unitId of unitIds) {
                            const unitRef = doc(db, 'users', currentUser.uid, 'units', unitId);
                            const unitDoc = await getDoc(unitRef);

                            if (unitDoc.exists()) {
                                const unitData = unitDoc.data();
                                if (unitData.type === 'COMMAND' || unitData.type === 'OPERATIVE') {
                                    commanders.push(unitData.name);
                                }

                                units.push({
                                    id: unitDoc.id,
                                    ...unitData
                                });
                            }
                        }

                        const validation = CommandCardValidator.validateCommandCards(
                            armyData.commandCards,
                            commanders,
                            armyData.faction
                        );

                        setCommandCardValidation(validation);
                    } else {
                        for (const unitId of unitIds) {
                            const unitRef = doc(db, 'users', currentUser.uid, 'units', unitId);
                            const unitDoc = await getDoc(unitRef);

                            if (unitDoc.exists()) {
                                units.push({
                                    id: unitDoc.id,
                                    ...unitDoc.data()
                                });
                            }
                        }
                    }

                    // Fetch army content if AoS
                    if (currentSystem === GameSystems.AOS && currentUser) {
                    const contentRef = collection(db, 'users', currentUser.uid, 'armyContent');
                    const contentQuery = query(
                        contentRef,
                        where('gameSystem', '==', GameSystems.AOS)
                    );
                    const contentSnapshot = await getDocs(contentQuery);
                    const contentList = contentSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setArmyContent(contentList);
                    }

                    units.sort((a, b) => {
                        const typeOrder = {};

                        if (currentSystem === GameSystems.LEGION) {
                            Object.assign(typeOrder, {
                                [UnitTypes.COMMAND]: 1,
                                [UnitTypes.CORPS]: 2,
                                [UnitTypes.SPECIAL_FORCES]: 3,
                                [UnitTypes.SUPPORT]: 4,
                                [UnitTypes.HEAVY]: 5,
                                [UnitTypes.OPERATIVE]: 6,
                                [UnitTypes.AUXILIARY]: 7
                            });
                        } else {
                            Object.assign(typeOrder, {
                                [AoSUnitTypes.HERO]: 1,
                                [AoSUnitTypes.BATTLELINE]: 2,
                                [AoSUnitTypes.OTHER]: 3,
                                [AoSUnitTypes.BEHEMOTH]: 4,
                                [AoSUnitTypes.ARTILLERY]: 5
                            });
                        }

                        typesList.forEach(ct => {
                            typeOrder[ct.name] = ct.sortOrder || 100;
                        });

                        const aOrder = typeOrder[a.type] !== undefined ? typeOrder[a.type] : 999;
                        const bOrder = typeOrder[b.type] !== undefined ? typeOrder[b.type] : 999;

                        return aOrder - bOrder || a.name.localeCompare(b.name);
                    });

                    setUnitDetails(units);
                } else {
                    setError('Army not found');
                }
            } catch (err) {
                console.error('Error fetching army:', err);
                setError('Failed to fetch army details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (currentUser && armyId) {
            fetchArmy();
        }
    }, [currentUser, armyId, currentSystem]);

    const handleEdit = () => {
        navigate(`/armies/edit/${armyId}`);
    };

    const handleDelete = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }

        try {
            setLoading(true);
            await deleteDoc(doc(db, 'users', currentUser.uid, 'armies', armyId));
            navigate('/armies');
        } catch (err) {
            console.error('Error deleting army:', err);
            setError('Failed to delete army. Please try again later.');
            setLoading(false);
        }
    };

    const cancelDelete = () => {
        setConfirmDelete(false);
    };

    const startBattle = () => {
        navigate(`/battles/create?armyId=${armyId}`);
    };

    const calculateTotalPoints = () => {
        if (!unitDetails || unitDetails.length === 0) return 0;
        
        if (currentSystem === GameSystems.AOS && army.regiments) {
            return ArmyPointsCalculator.calculateArmyPointsWithRegiments(army, unitDetails, armyContent);
        }
        
        return ArmyPointsCalculator.calculateArmyPoints(unitDetails, upgrades);
    };

    const handleExportArmy = () => {
        if (!army) return;

        const armyText = ExportUtils.exportArmy(
            army,
            unitDetails,
            customKeywords,
            upgrades,
            abilities,
            customUnitTypes,
            commandCards,
            armyContent  
        );

        ExportUtils.downloadTextFile(armyText, `${army.name.replace(/\s+/g, '_')}_army.txt`);
    };

    const getTypeDisplayName = (type) => {
        if (Object.values(TypeEnum).includes(type)) {
            return TypeEnum.getDisplayName(type);
        }

        const customType = customUnitTypes.find(t => t.name === type);
        if (customType) {
            return customType.displayName || customType.name;
        }

        return type;
    };

    const isCustomUnitType = (type) => {
        return customUnitTypes.some(t => t.name === type);
    };

    const getCustomTypeIcon = (type) => {
        const customType = customUnitTypes.find(t => t.name === type);
        return customType?.icon || '';
    };

    const getKeywordDisplay = (keyword) => {
        if (keyword.startsWith('custom:')) {
            const customId = keyword.replace('custom:', '');
            const customKeyword = customKeywords.find(k => k.id === customId);
            return customKeyword ? (
                <>
                    {customKeyword.name}
                    <span className="ms-1" title="Custom Keyword">★</span>
                </>
            ) : keyword;
        }
        return Keywords.getDisplayName(keyword);
    };

    const getAllKeywords = (unit) => {
        if (!unit) return [];
        return KeywordUtils.getAllKeywords(unit, upgrades);
    };

    const getEquippedUpgrades = (unit) => {
        if (!unit || !unit.upgradeSlots) return [];

        const equippedUpgrades = [];
        unit.upgradeSlots.forEach(slot => {
            if (slot.equippedUpgrades) {
                slot.equippedUpgrades.forEach(upgradeId => {
                    const upgrade = upgrades.find(u => u.id === upgradeId);
                    if (upgrade) {
                        equippedUpgrades.push({
                            ...upgrade,
                            slotType: slot.type
                        });
                    }
                });
            }
        });

        return equippedUpgrades;
    };

    const getAllWeapons = (unit) => {
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

        return [...baseWeapons.map(w => ({...w, source: 'Base Unit'})), ...upgradeWeapons];
    };

    const getUnitTypes = () => {
        const types = [...new Set(unitDetails.map(unit => unit.type))];

        types.sort((a, b) => {
            const typeOrder = {};

            if (currentSystem === GameSystems.LEGION) {
                Object.assign(typeOrder, {
                    [UnitTypes.COMMAND]: 1,
                    [UnitTypes.CORPS]: 2,
                    [UnitTypes.SPECIAL_FORCES]: 3,
                    [UnitTypes.SUPPORT]: 4,
                    [UnitTypes.HEAVY]: 5,
                    [UnitTypes.OPERATIVE]: 6,
                    [UnitTypes.AUXILIARY]: 7
                });
            } else {
                Object.assign(typeOrder, {
                    [AoSUnitTypes.HERO]: 1,
                    [AoSUnitTypes.BATTLELINE]: 2,
                    [AoSUnitTypes.OTHER]: 3,
                    [AoSUnitTypes.BEHEMOTH]: 4,
                    [AoSUnitTypes.ARTILLERY]: 5
                });
            }

            customUnitTypes.forEach(ct => {
                typeOrder[ct.name] = ct.sortOrder || 100;
            });

            const aOrder = typeOrder[a] !== undefined ? typeOrder[a] : 999;
            const bOrder = typeOrder[b] !== undefined ? typeOrder[b] : 999;

            return aOrder - bOrder;
        });

        return types;
    };

    const printArmy = () => {
        window.print();
    };

    const renderRegiments = () => {
        if (currentSystem !== GameSystems.AOS) return null;

        const regiments = army.regiments || [];
        const auxiliaryUnits = (army.auxiliaryUnits || [])
            .map(id => unitDetails.find(u => u.id === id))
            .filter(Boolean);

        return (
            <>
            <Card className="mb-4">
                <Card.Header className={`faction-${army.faction}`}>
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                    <i className="bi bi-diagram-3-fill me-2"></i>
                    Regiments ({regiments.length})
                    </h5>
                    <Button
                    variant="outline-light"
                    size="sm"
                    onClick={() => navigate(`/armies/${armyId}/regiments`)}
                    >
                    <i className="bi bi-pencil me-2"></i>
                    Manage Regiments
                    </Button>
                </div>
                </Card.Header>
                <Card.Body>
                {regiments.length === 0 ? (
                    <Alert variant="info">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                        <strong>No Regiments Created</strong>
                        <p className="mb-0 mt-2">
                            Age of Sigmar armies must be organized into regiments. 
                            Each regiment needs a commander (HERO) and 2-5 troops.
                        </p>
                        </div>
                        <Button
                        variant="primary"
                        onClick={() => navigate(`/armies/${armyId}/regiments`)}
                        >
                        Create Regiment
                        </Button>
                    </div>
                    </Alert>
                ) : (
                    <>
                    {regiments.map(regiment => (
                        <RegimentCard
                        key={regiment.id}
                        regiment={regiment}
                        units={unitDetails}
                        content={armyContent}
                        showActions={false}
                        />
                    ))}
                    </>
                )}

                {auxiliaryUnits.length > 0 && (
                    <div className="mt-4">
                    <h6 className="text-muted mb-2">
                        <i className="bi bi-box me-2"></i>
                        Auxiliary Units ({auxiliaryUnits.length})
                    </h6>
                    <Alert variant="secondary">
                        <small>These units are not part of any regiment and do not benefit from regiment abilities.</small>
                    </Alert>
                    <ListGroup>
                        {auxiliaryUnits.map(unit => (
                        <ListGroup.Item key={unit.id} className="d-flex justify-content-between align-items-center">
                            <div>
                            <strong>{unit.name}</strong>
                            <span className="ms-2 text-muted small">
                                {AoSUnitTypes.getDisplayName(unit.type)}
                            </span>
                            </div>
                            <Button
                            as={Link}
                            to={`/units/${unit.id}`}
                            variant="link"
                            size="sm"
                            >
                            View
                            </Button>
                        </ListGroup.Item>
                        ))}
                    </ListGroup>
                    </div>
                )}
                </Card.Body>
            </Card>

            {/* Battle Traits & Army-wide Content */}
            {(army.battleTraits?.length > 0 || army.battleFormations?.length > 0) && (
                <Card className="mb-4">
                <Card.Header>
                    <h5 className="mb-0">
                    <i className="bi bi-shield-fill-check me-2"></i>
                    Army Abilities
                    </h5>
                </Card.Header>
                <Card.Body>
                    {army.battleTraits?.map(traitId => {
                    const trait = armyContent.find(c => c.id === traitId);
                    return trait ? (
                        <Card key={traitId} className="mb-2" bg="light">
                        <Card.Body>
                            <h6>{trait.name}</h6>
                            <p className="mb-0 small">{trait.effectText}</p>
                        </Card.Body>
                        </Card>
                    ) : null;
                    })}

                    {army.battleFormations?.map(formationId => {
                    const formation = armyContent.find(c => c.id === formationId);
                    return formation ? (
                        <Card key={formationId} className="mb-2" bg="light">
                        <Card.Body>
                            <h6>
                            {formation.name}
                            <Badge bg="danger" className="ms-2">Battle Formation</Badge>
                            </h6>
                            <p className="mb-0 small">{formation.effectText}</p>
                        </Card.Body>
                        </Card>
                    ) : null;
                    })}
                </Card.Body>
                </Card>
            )}
            </>
        );
    };

    const renderCommandCards = () => {
        if (currentSystem !== GameSystems.LEGION) return null;

        if (!commandCards || commandCards.length === 0) {
            return (
                <Alert variant="warning">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>No Command Cards</strong> - This army doesn't have any command cards assigned.
                        </div>
                        <Button
                            as={Link}
                            to={`/armies/${armyId}/command-cards`}
                            variant="primary"
                            size="sm"
                        >
                            Add Command Cards
                        </Button>
                    </div>
                </Alert>
            );
        }

        return (
            <>
                <Card className="mb-4">
                    <Card.Header className={`faction-${army.faction}`}>
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Command Cards</h5>
                            <Button
                                as={Link}
                                to={`/armies/${armyId}/command-cards`}
                                variant="outline-light"
                                size="sm"
                            >
                                Manage Cards
                            </Button>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        {commandCardValidation && (
                            <>
                                {!commandCardValidation.valid && commandCardValidation.errors.length > 0 && (
                                    <Alert variant="danger" className="mb-3">
                                        <strong>Command Card Errors:</strong>
                                        <ul className="mb-0 mt-2">
                                            {commandCardValidation.errors.map((error, i) => (
                                                <li key={i}>{error}</li>
                                            ))}
                                        </ul>
                                    </Alert>
                                )}

                                {commandCardValidation.warnings.length > 0 && (
                                    <Alert variant="warning" className="mb-3">
                                        <strong>Command Card Warnings:</strong>
                                        <ul className="mb-0 mt-2">
                                            {commandCardValidation.warnings.map((warning, i) => (
                                                <li key={i}>{warning}</li>
                                            ))}
                                        </ul>
                                    </Alert>
                                )}

                                {commandCardValidation.valid && commandCardValidation.warnings.length === 0 && (
                                    <Alert variant="success" className="mb-3">
                                        <strong>Command Card Setup Complete</strong> - This army has a valid set of
                                        command cards.
                                    </Alert>
                                )}

                                <div className="d-flex flex-wrap mb-3">
                                    <Badge bg="primary" className="me-2 mb-2"
                                           style={{fontSize: '0.85rem', padding: '0.4rem'}}>
                                        1-Pip Cards: {commandCardValidation.counts.onePip}/2
                                    </Badge>
                                    <Badge bg="primary" className="me-2 mb-2"
                                           style={{fontSize: '0.85rem', padding: '0.4rem'}}>
                                        2-Pip Cards: {commandCardValidation.counts.twoPip}/2
                                    </Badge>
                                    <Badge bg="primary" className="me-2 mb-2"
                                           style={{fontSize: '0.85rem', padding: '0.4rem'}}>
                                        3-Pip Cards: {commandCardValidation.counts.threePip}/2
                                    </Badge>
                                    <Badge bg="primary" className="me-2 mb-2"
                                           style={{fontSize: '0.85rem', padding: '0.4rem'}}>
                                        4-Pip Card: {commandCardValidation.counts.fourPip}/1
                                    </Badge>
                                </div>
                            </>
                        )}

                        <ListGroup>
                            {[1, 2, 3, 4].map(pips => {
                                const pipCards = commandCards.filter(card => card.pips === pips);
                                if (pipCards.length === 0) return null;

                                return (
                                    <div key={pips} className="mb-3">
                                        <h6 className="mb-2">{pips}-Pip Cards</h6>
                                        {pipCards.map(card => (
                                            <ListGroup.Item key={card.id}>
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <div className="fw-bold">{card.name}</div>
                                                        <div className="small text-muted mt-1">
                                                            {card.description || card.effectText || 'No description'}
                                                        </div>

                                                        {card.commander && (
                                                            <Badge bg="info"
                                                                   className="mt-2">Requires {card.commander}</Badge>
                                                        )}
                                                    </div>
                                                    <Badge bg={card.isSystem ? 'secondary' : 'success'}
                                                           className="ms-2">
                                                        {card.isSystem ? 'System' : 'Custom'}
                                                    </Badge>
                                                </div>
                                            </ListGroup.Item>
                                        ))}
                                    </div>
                                );
                            })}
                        </ListGroup>
                    </Card.Body>
                </Card>
            </>
        );
    };

    if (loading) {
        return <LoadingSpinner text="Loading army details..."/>;
    }

    if (error) {
        return (
            <Alert variant="danger">
                {error}
                <div className="mt-3">
                    <Button variant="primary" onClick={() => navigate('/armies')}>
                        Back to Armies
                    </Button>
                </div>
            </Alert>
        );
    }

    if (!army) {
        return (
            <Alert variant="warning">
                Army not found. Please select a valid army.
                <div className="mt-3">
                    <Button variant="primary" onClick={() => navigate('/armies')}>
                        Back to Armies
                    </Button>
                </div>
            </Alert>
        );
    }

    const unitTypeCounts = unitDetails.reduce((counts, unit) => {
        const type = unit.type;
        counts[type] = (counts[type] || 0) + 1;
        return counts;
    }, {});

    const armyUnitTypes = getUnitTypes();
    const factionColor = FactionEnum.getColor ? FactionEnum.getColor(army.faction) : '#6c757d';

    return (
        <>
            {confirmDelete && (
                <Alert variant="danger">
                    <Alert.Heading>Confirm Delete</Alert.Heading>
                    <p>Are you sure you want to delete this army? This action cannot be undone.</p>
                    <div className="d-flex justify-content-end">
                        <Button variant="outline-secondary" onClick={cancelDelete} className="me-2">
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Delete Army
                        </Button>
                    </div>
                </Alert>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>{army.name}</h2>
                <div>
                    <ExportButton
                        className="me-2"
                        onExport={handleExportArmy}
                        text="Export Army"
                    />
                    <Button variant="outline-primary" onClick={printArmy} className="me-2">
                        <i className="bi bi-printer"></i> Print
                    </Button>
                    <Button variant="outline-success" onClick={startBattle} className="me-2">
                        Start Battle
                    </Button>
                    <Button variant="outline-primary" onClick={handleEdit} className="me-2">
                        Edit
                    </Button>
                    <Button variant="outline-danger" onClick={handleDelete}>
                        {confirmDelete ? 'Confirm Delete' : 'Delete'}
                    </Button>
                </div>
            </div>

            <Row className="mb-4">
                <Col md={6}>
                    <Card>
                        <Card.Header className={`faction-${army.faction}`}>
                            <h5 className="mb-0">Army Information</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <p>
                                        <strong>Faction:</strong><br/>
                                        {FactionEnum.getDisplayName(army.faction)}
                                    </p>
                                </Col>
                                <Col md={6}>
                                    <p>
                                        <strong>Total Points:</strong><br/>
                                        {calculateTotalPoints()} pts
                                        {calculateTotalPoints() !== army.totalPoints && (
                                            <span className="text-danger ms-2" title="Different from base value">
                                                (Base: {army.totalPoints || 0} pts)
                                            </span>
                                        )}
                                    </p>
                                </Col>
                            </Row>

                            {army.description && (
                                <Row>
                                    <Col>
                                        <p>
                                            <strong>Description:</strong><br/>
                                            {army.description}
                                        </p>
                                    </Col>
                                </Row>
                            )}

                            <Row>
                                <Col>
                                    <strong>Unit Composition:</strong><br/>
                                    <div className="mb-2">
                                        {Object.entries(unitTypeCounts).map(([type, count]) => (
                                            <Badge
                                                key={type}
                                                bg={isCustomUnitType(type) ? "info" : "secondary"}
                                                className={`me-2 ${isCustomUnitType(type) ? '' : `unit-type-${type}`}`}
                                                style={{
                                                    fontSize: '0.85rem',
                                                    padding: '0.25rem 0.5rem'
                                                }}
                                            >
                                                {getCustomTypeIcon(type) && (
                                                    <i className={`${getCustomTypeIcon(type)} me-1`}></i>
                                                )}
                                                {getTypeDisplayName(type)}: {count}
                                            </Badge>
                                        ))}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Unit Summary</h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive className="mb-0">
                                <thead>
                                <tr>
                                    <th>Unit</th>
                                    <th>Type</th>
                                    <th>Points</th>
                                    <th>Wounds</th>
                                    <th>{/* Stats */}</th>
                                    <th>{/* Actions */}</th>
                                </tr>
                                </thead>
                                <tbody>
                                {unitDetails.map(unit => (
                                    <tr key={unit.id}>
                                        <td>{unit.name}</td>
                                        <td>
                                            {isCustomUnitType(unit.type) && (
                                                <Badge bg="info" className="me-1" title="Custom Unit Type">C</Badge>
                                            )}
                                            {getTypeDisplayName(unit.type)}
                                        </td>
                                        <td>
                                            {ArmyPointsCalculator.calculateUnitPoints(unit, upgrades)}
                                            {ArmyPointsCalculator.calculateUnitPoints(unit, upgrades) !== unit.points && (
                                                <span className="text-primary ms-1" title="Includes upgrade costs">
                                                    ({unit.points})
                                                </span>
                                            )}
                                        </td>
                                        <td>{unit.wounds || 1}</td>
                                        <td className="small text-nowrap">
                                            {unit.isVehicle ? (
                                                <span>{unit.resilience || 0}R</span>
                                            ) : (
                                                <span>{unit.courage || 0}C</span>
                                            )} / {unit.speed || 2}S
                                        </td>
                                        <td>
                                            <Button
                                                as={Link}
                                                to={`/units/${unit.id}`}
                                                variant="link"
                                                size="sm"
                                                className="p-0 text-decoration-none"
                                            >
                                                View
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {renderRegiments()}

            <h3>Unit Details</h3>

            {armyUnitTypes.map(unitType => {
                const unitsOfType = unitDetails.filter(unit => unit.type === unitType);

                if (unitsOfType.length === 0) {
                    return null;
                }

                const isCustomType = isCustomUnitType(unitType);
                const customTypeIcon = getCustomTypeIcon(unitType);

                return (
                    <Card key={unitType} className="mb-4">
                        <Card.Header className={isCustomType ? 'bg-info text-white' : `unit-type-${unitType}`}>
                            <h5 className="mb-0 d-flex align-items-center">
                                {customTypeIcon && <i className={`${customTypeIcon} me-2`}></i>}
                                {getTypeDisplayName(unitType)}
                                {isCustomType && <Badge bg="light" text="dark" className="ms-2">Custom</Badge>}
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                {unitsOfType.map(unit => (
                                    <Col key={unit.id} md={6} lg={4} className="mb-4">
                                        <Card className="h-100">
                                            <Card.Header>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="fw-bold">{unit.name}</span>
                                                    <span>
                                                        {ArmyPointsCalculator.calculateUnitPoints(unit, upgrades)} pts
                                                        {ArmyPointsCalculator.calculateUnitPoints(unit, upgrades) !== unit.points && (
                                                            <span className="text-primary ms-1"
                                                                  title="Includes upgrade costs">
                                                                ({unit.points})
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            </Card.Header>
                                            <Card.Body className="p-3">
                                                <div className="small mb-2">
                                                    <strong>Stats:</strong> {unit.wounds || 1}W /
                                                    {unit.isVehicle ? (
                                                        ` ${unit.resilience || 0}R /`
                                                    ) : (
                                                        ` ${unit.courage || 0}C /`
                                                    )}
                                                    {unit.speed || 2}S /
                                                    <span className={DefenseDice.getColorClass(unit.defense)}>
                                                      {unit.defense === DefenseDice.WHITE ? 'W' : 'R'}
                                                    </span> Defense
                                                </div>

                                                {getAllKeywords(unit).length > 0 && (
                                                    <div className="small mb-2">
                                                        <strong>Keywords:</strong><br/>
                                                        <div className="mt-1">
                                                            {getAllKeywords(unit).map((keyword, index) => (
                                                                <Badge
                                                                    key={`${unit.id}-kw-${index}`}
                                                                    bg={keyword.startsWith('custom:') ? 'info' : (
                                                                        unit.keywords && unit.keywords.includes(keyword) ? 'secondary' : 'success'
                                                                    )}
                                                                    className="me-1 mb-1"
                                                                >
                                                                    {getKeywordDisplay(keyword)}
                                                                    {!unit.keywords?.includes(keyword) && (
                                                                        <span className="ms-1"
                                                                              title="From Upgrade">+</span>
                                                                    )}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {getAllWeapons(unit).length > 0 && (
                                                    <div className="small">
                                                        <strong>Weapons:</strong>
                                                        <Accordion className="mt-1">
                                                            <Accordion.Item eventKey="0">
                                                                <Accordion.Header>
                                                                    <span
                                                                        className="small">{getAllWeapons(unit).length} weapon{getAllWeapons(unit).length !== 1 ? 's' : ''}</span>
                                                                </Accordion.Header>
                                                                <Accordion.Body className="p-0">
                                                                    <ListGroup variant="flush">
                                                                        {getAllWeapons(unit).map((weapon, index) => (
                                                                            <ListGroup.Item
                                                                                key={`${unit.id}-weapon-${index}`}
                                                                                className="p-2">
                                                                                <div
                                                                                    className="d-flex justify-content-between">
                                                                                    <strong>{weapon.name}</strong>
                                                                                    <Badge
                                                                                        bg={weapon.source === 'Base Unit' ? 'secondary' : 'info'}
                                                                                        className="small">
                                                                                        {weapon.source}
                                                                                    </Badge>
                                                                                </div>
                                                                                <div>
                                                                                    {WeaponRanges.getDisplayName ? WeaponRanges.getDisplayName(weapon.range) : weapon.range} |
                                                                                    {weapon.dice?.[AttackDice.RED] > 0 && (
                                                                                        <span
                                                                                            className="text-danger"> {weapon.dice[AttackDice.RED]}R</span>
                                                                                    )}
                                                                                    {weapon.dice?.[AttackDice.BLACK] > 0 && (
                                                                                        <span> {weapon.dice[AttackDice.BLACK]}B</span>
                                                                                    )}
                                                                                    {weapon.dice?.[AttackDice.WHITE] > 0 && (
                                                                                        <span
                                                                                            className="text-muted"> {weapon.dice[AttackDice.WHITE]}W</span>
                                                                                    )}
                                                                                </div>
                                                                                {weapon.keywords?.length > 0 && (
                                                                                    <div className="small text-muted">
                                                                                        {weapon.keywords.map(keyword =>
                                                                                            WeaponKeywords.getDisplayName ? WeaponKeywords.getDisplayName(keyword) : keyword
                                                                                        ).join(', ')}
                                                                                    </div>
                                                                                )}
                                                                            </ListGroup.Item>
                                                                        ))}
                                                                    </ListGroup>
                                                                </Accordion.Body>
                                                            </Accordion.Item>
                                                        </Accordion>
                                                    </div>
                                                )}

                                                {getEquippedUpgrades(unit).length > 0 && (
                                                    <div className="small mt-2">
                                                        <strong>Upgrades:</strong>
                                                        <Accordion className="mt-1">
                                                            <Accordion.Item eventKey="0">
                                                                <Accordion.Header>
                                                                    <span
                                                                        className="small">{getEquippedUpgrades(unit).length} upgrade{getEquippedUpgrades(unit).length !== 1 ? 's' : ''}</span>
                                                                </Accordion.Header>
                                                                <Accordion.Body className="p-0">
                                                                    <ListGroup variant="flush">
                                                                        {getEquippedUpgrades(unit).map((upgrade, index) => (
                                                                            <ListGroup.Item
                                                                                key={`${unit.id}-upgrade-${index}`}
                                                                                className="p-2">
                                                                                <div
                                                                                    className="d-flex justify-content-between align-items-center">
                                                                                    <strong>{upgrade.name}</strong>
                                                                                    <Badge bg="warning" text="dark">
                                                                                        {upgrade.pointsCost || 0} pts
                                                                                    </Badge>
                                                                                </div>
                                                                                <div
                                                                                    className="text-muted">{upgrade.description}</div>
                                                                            </ListGroup.Item>
                                                                        ))}
                                                                    </ListGroup>
                                                                </Accordion.Body>
                                                            </Accordion.Item>
                                                        </Accordion>
                                                    </div>
                                                )}
                                            </Card.Body>
                                            <Card.Footer className="p-2">
                                                <Link
                                                    to={`/units/${unit.id}`}
                                                    className="btn btn-sm btn-outline-primary w-100"
                                                >
                                                    View Details
                                                </Link>
                                            </Card.Footer>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </Card.Body>
                    </Card>
                );
            })}

            <div className="d-flex justify-content-start mt-4">
                <Button variant="secondary" onClick={() => navigate('/armies')}>
                    Back to Armies
                </Button>
            </div>
        </>
    );
};

export default ArmyDetail;