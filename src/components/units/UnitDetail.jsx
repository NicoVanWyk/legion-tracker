import React, {useState, useEffect} from 'react';
import {
    Card,
    Row,
    Col,
    Badge,
    Button,
    Alert,
    ListGroup,
    Accordion,
    Tab,
    Tabs,
    Form,
    OverlayTrigger,
    Tooltip
} from 'react-bootstrap';
import {Link, useNavigate} from 'react-router-dom';
import {doc, getDoc, deleteDoc, collection, getDocs} from 'firebase/firestore';
import {db} from '../../firebase/config';
import {useAuth} from '../../contexts/AuthContext';
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
import {exportToPDF} from '../../utils/exportToPDF';
import KeywordUtils from '../../utils/KeywordUtils';
import {useGameSystem} from '../../contexts/GameSystemContext';
import AoSFactions from '../../enums/aos/AoSFactions';
import AoSUnitTypes from '../../enums/aos/AoSUnitTypes';
import AoSFactionKeywords from '../../enums/aos/AoSFactionKeywords';
import GameSystems from '../../enums/GameSystems';

const UnitDetail = ({unitId}) => {
    const [unit, setUnit] = useState(null);
    const [abilities, setAbilities] = useState([]);
    const [upgrades, setUpgrades] = useState([]);
    const [customKeywords, setCustomKeywords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [customUnitTypes, setCustomUnitTypes] = useState([]);
    const [activeTab, setActiveTab] = useState('details');
    const {currentUser} = useAuth();
    const {currentSystem} = useGameSystem();
    const navigate = useNavigate();

    const isAoS = currentSystem === GameSystems.AOS;
    const isLegion = currentSystem === GameSystems.LEGION;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const unitRef = doc(db, 'users', currentUser.uid, 'units', unitId);
                const unitDoc = await getDoc(unitRef);

                if (unitDoc.exists()) {
                    const unitData = {id: unitDoc.id, ...unitDoc.data()};
                    setUnit(unitData);

                    if (unitData.abilities?.length > 0) {
                        const abilitiesRef = collection(db, 'users', currentUser.uid, 'abilities');
                        const abilitiesSnapshot = await getDocs(abilitiesRef);
                        const abilitiesList = abilitiesSnapshot.docs
                            .map(doc => ({id: doc.id, ...doc.data()}))
                            .filter(ability => unitData.abilities.includes(ability.id));
                        setAbilities(abilitiesList);
                    }

                    const allEquippedUpgrades = [];
                    unitData.upgradeSlots?.forEach(slot => {
                        if (slot.equippedUpgrades) allEquippedUpgrades.push(...slot.equippedUpgrades);
                    });

                    if (allEquippedUpgrades.length > 0) {
                        const upgradesRef = collection(db, 'users', currentUser.uid, 'upgradeCards');
                        const upgradesSnapshot = await getDocs(upgradesRef);
                        const upgradesList = upgradesSnapshot.docs
                            .map(doc => ({id: doc.id, ...doc.data()}))
                            .filter(upgrade => allEquippedUpgrades.includes(upgrade.id));
                        setUpgrades(upgradesList);
                    }

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

    const getKeywordDefinition = (keyword) => {
        if (keyword.startsWith('custom:')) {
            const customId = keyword.replace('custom:', '');
            const customKeyword = customKeywords.find(k => k.id === customId);
            return customKeyword?.definition || customKeyword?.description || 'Custom keyword';
        }
        return Keywords.getDefinition ? Keywords.getDefinition(keyword) : null;
    };

    const getTypeDisplayName = (type) => {
        const typeEnum = isLegion ? UnitTypes : AoSUnitTypes;
        if (Object.values(typeEnum).includes(type)) {
            return typeEnum.getDisplayName(type);
        }
        const customType = customUnitTypes.find(t => t.name === type);
        return customType ? customType.displayName : type;
    };

    const getFactionDisplayName = (faction) => {
        const factionEnum = isLegion ? Factions : AoSFactions;
        return factionEnum.getDisplayName(faction);
    };

    const getFactionColor = (faction) => {
        const factionEnum = isLegion ? Factions : AoSFactions;
        return factionEnum.getColor ? factionEnum.getColor(faction) : '#6c757d';
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

    const handleExportUnit = () => {
        if (!unit) return;
        const unitText = ExportUtils.exportUnit(unit, customKeywords, upgrades, abilities, customUnitTypes);
        ExportUtils.downloadTextFile(unitText, `${unit.name.replace(/\s+/g, '_')}_unit.txt`);
    };

    const getAllKeywords = () => {
        if (!unit) return [];
        return KeywordUtils.getAllKeywords(unit, upgrades);
    };

    const calculateModifiedStats = () => {
        if (!unit) return null;

        let stats = isLegion ? {
            wounds: unit.wounds || 1,
            courage: unit.isVehicle ? 0 : (unit.courage !== undefined ? unit.courage : 1),
            resilience: unit.isVehicle ? (unit.resilience !== undefined ? unit.resilience : 0) : 0,
            speed: unit.speed || 2,
            modelCount: unit.minModelCount || 1,
            totalPoints: unit.points || 0,
            surgeAttack: unit.surgeAttack || false,
            surgeDefense: unit.surgeDefense || false
        } : {
            health: unit.health || 1,
            move: unit.move || 5,
            save: unit.save || 4,
            control: unit.control || 1,
            modelCount: unit.minModelCount || 1,
            totalPoints: unit.points || 0
        };

        unit.upgradeSlots?.forEach(slot => {
            slot.equippedUpgrades?.forEach(upgradeId => {
                const upgrade = upgrades.find(u => u.id === upgradeId);
                if (upgrade) {
                    stats.totalPoints += upgrade.pointsCost || 0;

                    if (upgrade.effects?.statModifiers) {
                        const mods = upgrade.effects.statModifiers;

                        if (isLegion) {
                            stats.wounds += mods.wounds || 0;
                            if (unit.isVehicle) {
                                stats.resilience += mods.resilience || mods.courage || 0;
                            } else {
                                stats.courage += mods.courage || 0;
                            }
                            stats.speed += mods.speed || 0;
                            if (mods.surgeAttack) stats.surgeAttack = true;
                            if (mods.surgeDefense) stats.surgeDefense = true;
                        } else {
                            stats.health += mods.health || 0;
                            stats.move += mods.move || 0;
                            stats.save += mods.save || 0;
                            stats.control += mods.control || 0;
                        }
                    }

                    stats.modelCount += upgrade.effects?.modelCountChange || 0;
                }
            });
        });

        return stats;
    };

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

        return [...baseWeapons.map(w => ({...w, source: 'Base Unit'})), ...upgradeWeapons];
    };

    const printUnitCard = () => {
        window.print();
    };

    if (loading) return <LoadingSpinner text="Loading unit details..."/>;

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
                                        border: `2px solid ${getFactionColor(unit.faction)}`
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
                            <Card className="mb-4">
                                <Card.Header className={`faction-${unit.faction}`}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">Unit Information</h5>
                                        <div className="d-flex align-items-center">
                                            <Badge bg="secondary"
                                                   className="me-2">{getTypeDisplayName(unit.type)}</Badge>
                                            {isLegion && unit.isVehicle &&
                                                <Badge bg="info" className="me-2">Vehicle</Badge>}
                                            {isAoS && unit.reinforceable &&
                                                <Badge bg="info" className="me-2">Reinforceable</Badge>}
                                        </div>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col md={3}>
                                            <p>
                                                <strong>Faction:</strong> {getFactionDisplayName(unit.faction)}
                                            </p>
                                        </Col>
                                        {isAoS && Array.isArray(unit.subfaction) && unit.subfaction.length > 0 && (
                                            <Col md={3}>
                                                <p>
                                                    <strong>Subfaction{unit.subfaction.length > 1 ? 's' : ''}:</strong>
                                                    <div className="mt-1">
                                                        {unit.subfaction.map(sf => (
                                                            <Badge key={sf} bg="info" className="me-1 mb-1">
                                                                {AoSFactionKeywords.getDisplayName(sf)}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </p>
                                            </Col>
                                        )}
                                        <Col md={3}>
                                            <p>
                                                <strong>Points:</strong> {unit.points || 0}
                                                {modifiedStats.totalPoints !== unit.points && (
                                                    <span className="text-primary"> → {modifiedStats.totalPoints}</span>
                                                )}
                                            </p>
                                        </Col>
                                        <Col
                                            md={isAoS && Array.isArray(unit.subfaction) && unit.subfaction.length > 0 ? 3 : 6}>
                                            {isLegion && (
                                                <p>
                                                    <strong>Stats:</strong>{' '}
                                                    {modifiedStats.wounds !== unit.wounds &&
                                                        <span className="text-primary">{modifiedStats.wounds}</span>}
                                                    {modifiedStats.wounds === unit.wounds && (unit.wounds || 1)}W /{' '}

                                                    {unit.isVehicle ? (
                                                        <>
                                                            {modifiedStats.resilience !== unit.resilience && <span
                                                                className="text-primary">{modifiedStats.resilience === 0 ? '-' : modifiedStats.resilience}</span>}
                                                            {modifiedStats.resilience === unit.resilience && (unit.resilience === 0 ? '-' : unit.resilience)}R
                                                            /{' '}
                                                        </>
                                                    ) : (
                                                        <>
                                                            {modifiedStats.courage !== unit.courage && <span
                                                                className="text-primary">{modifiedStats.courage === 0 ? '-' : modifiedStats.courage}</span>}
                                                            {modifiedStats.courage === unit.courage && (unit.courage === 0 ? '-' : unit.courage)}C
                                                            /{' '}
                                                        </>
                                                    )}

                                                    {modifiedStats.speed !== unit.speed &&
                                                        <span className="text-primary">{modifiedStats.speed}</span>}
                                                    {modifiedStats.speed === unit.speed && (unit.speed || 2)}S /{' '}
                                                    <span className={DefenseDice.getColorClass(unit.defense)}>
                                                        {unit.defense === 'white' ? 'W' : 'R'}
                                                    </span> Defense
                                                </p>
                                            )}
                                            {isAoS && (
                                                <p>
                                                    <strong>Stats:</strong>{' '}
                                                    {modifiedStats.move !== unit.move &&
                                                        <span className="text-primary">{modifiedStats.move}</span>}
                                                    {modifiedStats.move === unit.move && (unit.move || 5)}" Move /{' '}
                                                    {modifiedStats.health !== unit.health &&
                                                        <span className="text-primary">{modifiedStats.health}</span>}
                                                    {modifiedStats.health === unit.health && (unit.health || 1)} Health
                                                    /{' '}
                                                    {modifiedStats.save !== unit.save &&
                                                        <span className="text-primary">{modifiedStats.save}</span>}
                                                    {modifiedStats.save === unit.save && (unit.save || 4)}+ Save /{' '}
                                                    {modifiedStats.control !== unit.control &&
                                                        <span className="text-primary">{modifiedStats.control}</span>}
                                                    {modifiedStats.control === unit.control && (unit.control || 1)} Control
                                                </p>
                                            )}
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={6}>
                                            <p>
                                                <strong>Model Count:</strong> Min: {unit.minModelCount || 1} |
                                                Current: {unit.minModelCount || 1}
                                                {modifiedStats.modelCount !== unit.minModelCount && (
                                                    <span className="text-primary"> → {modifiedStats.modelCount}</span>
                                                )}
                                            </p>
                                        </Col>
                                        {isLegion && (
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
                                        )}
                                        {isAoS && unit.baseSize && (
                                            <Col md={6}>
                                                <p><strong>Base Size:</strong> {unit.baseSize}</p>
                                            </Col>
                                        )}
                                    </Row>
                                </Card.Body>
                            </Card>

                            <Row>
                                <Col md={6}>
                                    <Card className="mb-4">
                                        <Card.Header>
                                            <h5 className="mb-0">Keywords</h5>
                                        </Card.Header>
                                        <Card.Body>
                                            {getAllKeywords().length > 0 ? (
                                                <div>
                                                    {getAllKeywords().map((keyword, index) => {
                                                        const definition = getKeywordDefinition(keyword);
                                                        const keywordBadge = (
                                                            <Badge
                                                                key={index}
                                                                bg={keyword.startsWith('custom:') ? 'info' : (
                                                                    unit.keywords && unit.keywords.includes(keyword) ? 'secondary' : 'success'
                                                                )}
                                                                className="me-2 mb-2 p-2"
                                                            >
                                                                {getKeywordDisplay(keyword)}
                                                                {!unit.keywords?.includes(keyword) && (
                                                                    <span className="ms-1" title="From Upgrade">+</span>
                                                                )}
                                                            </Badge>
                                                        );

                                                        return definition ? (
                                                            <OverlayTrigger
                                                                key={index}
                                                                placement="top"
                                                                trigger={['hover', 'click']}
                                                                overlay={
                                                                    <Tooltip id={`tooltip-keyword-${index}`}>
                                                                        {definition}
                                                                    </Tooltip>
                                                                }
                                                            >
                                                                {keywordBadge}
                                                            </OverlayTrigger>
                                                        ) : keywordBadge;
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="text-muted">No keywords assigned to this unit.</p>
                                            )}
                                        </Card.Body>
                                    </Card>

                                    {isAoS && unit.battleProfile && (unit.battleProfile.allowedKeywords?.length > 0 || unit.battleProfile.canSubCommander || unit.battleProfile.allowsSubCommanders) && (
                                        <Card className="mb-4">
                                            <Card.Header>
                                                <h5 className="mb-0">Regiment Rules</h5>
                                            </Card.Header>
                                            <Card.Body>
                                                {unit.battleProfile.allowedKeywords?.length > 0 && (
                                                    <div className="mb-3">
                                                        <strong>Allowed Unit Keywords:</strong>
                                                        <div className="mt-2">
                                                            {unit.battleProfile.allowedKeywords.map(kw => (
                                                                <Badge key={kw} bg="primary" className="me-2 mb-2">
                                                                    {AoSFactionKeywords.getDisplayName(kw) || kw}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                        <Form.Text className="text-muted">
                                                            Units must have at least one of these keywords to join this
                                                            hero's regiment
                                                        </Form.Text>
                                                    </div>
                                                )}

                                                {unit.battleProfile.canSubCommander && (
                                                    <div className="mb-2">
                                                        <Badge bg="info">Can Join as Sub-Commander</Badge>
                                                        <Form.Text className="text-muted d-block mt-1">
                                                            This hero can join another hero's regiment as a
                                                            sub-commander
                                                        </Form.Text>
                                                    </div>
                                                )}

                                                {unit.battleProfile.allowsSubCommanders && (
                                                    <div>
                                                        <Badge bg="success">Allows Sub-Commanders</Badge>
                                                        <span
                                                            className="ms-2">Max: {unit.battleProfile.maxSubCommanders || 1}</span>
                                                        <Form.Text className="text-muted d-block mt-1">
                                                            This hero's regiment can include sub-commanders
                                                        </Form.Text>
                                                    </div>
                                                )}
                                            </Card.Body>
                                        </Card>
                                    )}
                                </Col>

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
                                                            <div
                                                                className="d-flex justify-content-between align-items-center">
                                                                <h6 className="mb-0">{weapon.name}</h6>
                                                                <Badge
                                                                    bg={weapon.source === 'Base Unit' ? 'secondary' : 'info'}>
                                                                    {weapon.source}
                                                                </Badge>
                                                            </div>
                                                            <div className="small text-muted">
                                                                <strong>Range:</strong>{' '}
                                                                {WeaponRanges.getDisplayName ? WeaponRanges.getDisplayName(weapon.range) : weapon.range}
                                                            </div>
                                                            {isLegion && (
                                                                <div className="small">
                                                                    <strong>Dice:</strong>
                                                                    {weapon.dice?.[AttackDice.RED] > 0 && <span
                                                                        className="text-danger"> {weapon.dice[AttackDice.RED]}R</span>}
                                                                    {weapon.dice?.[AttackDice.BLACK] > 0 &&
                                                                        <span> {weapon.dice[AttackDice.BLACK]}B</span>}
                                                                    {weapon.dice?.[AttackDice.WHITE] > 0 && <span
                                                                        className="text-muted"> {weapon.dice[AttackDice.WHITE]}W</span>}
                                                                </div>
                                                            )}
                                                            {isAoS && weapon.attacks && (
                                                                <div className="small">
                                                                    <strong>Attacks:</strong> {weapon.attacks}
                                                                </div>
                                                            )}
                                                            {weapon.keywords?.length > 0 && (
                                                                <div className="small">
                                                                    <strong>Keywords:</strong>{' '}
                                                                    {weapon.keywords
                                                                        .map(kw => WeaponKeywords.getDisplayName ? WeaponKeywords.getDisplayName(kw) : kw)
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

                            {abilities.length > 0 && (
                                <Card className="mb-4">
                                    <Card.Header>
                                        <h5 className="mb-0">Abilities</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <Accordion>
                                            {abilities.map((ability, index) => {
                                                const effects = ability.effects || {};
                                                const mods = effects.statModifiers || {};
                                                const hasEffects = Object.keys(mods).length > 0 ||
                                                    effects.modelCountChange ||
                                                    (effects.addKeywords && effects.addKeywords.length > 0) ||
                                                    (effects.addWeapons && effects.addWeapons.length > 0);

                                                return (
                                                    <Accordion.Item key={ability.id} eventKey={index.toString()}>
                                                        <Accordion.Header>
                                                            <strong>{ability.name}</strong>
                                                            {hasEffects &&
                                                                <Badge bg="success" className="ms-2">Has
                                                                    Effects</Badge>}
                                                        </Accordion.Header>
                                                        <Accordion.Body>
                                                            {ability.description && (
                                                                <p className="mb-2 text-muted">{ability.description}</p>
                                                            )}

                                                            {ability.effectText && (
                                                                <div className="mb-2">
                                                                    <strong>Effect:</strong> {ability.effectText}
                                                                </div>
                                                            )}

                                                            {ability.rulesText && (
                                                                <div className="mb-2">{ability.rulesText}</div>
                                                            )}

                                                            {hasEffects && (
                                                                <div className="mt-3">
                                                                    <strong className="small">Effects:</strong>
                                                                    <div className="mt-1">
                                                                        {Object.entries(mods)
                                                                            .filter(([_, value]) => value !== undefined && value !== null && value !== 0)
                                                                            .map(([key, value], idx) => {
                                                                                const statName = key.charAt(0).toUpperCase() + key.slice(1);
                                                                                if (typeof value === 'boolean') {
                                                                                    return <Badge key={idx} bg="success"
                                                                                                  className="me-1 mb-1">Adds {statName}</Badge>;
                                                                                }
                                                                                const prefix = value > 0 ? '+' : '';
                                                                                return <Badge key={idx} bg="success"
                                                                                              className="me-1 mb-1">{statName} {prefix}{value}</Badge>;
                                                                            })}

                                                                        {typeof effects.modelCountChange === 'number' && effects.modelCountChange !== 0 && (
                                                                            <Badge bg="success" className="me-1 mb-1">
                                                                                Models {effects.modelCountChange > 0 ? '+' : ''}{effects.modelCountChange}
                                                                            </Badge>
                                                                        )}

                                                                        {effects.addKeywords && effects.addKeywords.length > 0 && (
                                                                            <Badge bg="success" className="me-1 mb-1">
                                                                                Adds {effects.addKeywords.length} Keyword{effects.addKeywords.length !== 1 ? 's' : ''}
                                                                            </Badge>
                                                                        )}

                                                                        {effects.addWeapons && effects.addWeapons.length > 0 && (
                                                                            <Badge bg="success" className="me-1 mb-1">
                                                                                Adds {effects.addWeapons.length} Weapon{effects.addWeapons.length !== 1 ? 's' : ''}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {ability.reminders && ability.reminders.length > 0 && (
                                                                <div className="mt-3">
                                                                    <strong className="small">Reminders:</strong>
                                                                    <div className="mt-1">
                                                                        {ability.reminders.map((reminder, idx) => (
                                                                            <div key={idx}
                                                                                 className="small text-muted mb-1">
                                                                                • {reminder.text}
                                                                                {reminder.condition && (
                                                                                    <span
                                                                                        className="fst-italic"> ({reminder.condition})</span>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Accordion.Body>
                                                    </Accordion.Item>
                                                );
                                            })}
                                        </Accordion>
                                    </Card.Body>
                                </Card>
                            )}

                            {isLegion && unit.upgradeSlots && unit.upgradeSlots.length > 0 && (
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
                                                    <div
                                                        className="d-flex justify-content-between align-items-center mb-2">
                                                        <Badge bg={UpgradeCardTypes.getBadgeColor(slot.type)}>
                                                            <i className={UpgradeCardTypes.getIconClass(slot.type) + ' me-1'}></i>
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
                                                                    <div
                                                                        className="small text-muted">{upgrade.description}</div>
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
                                        <p style={{whiteSpace: 'pre-line'}}>{unit.miniatures}</p>
                                    </Card.Body>
                                </Card>
                            )}

                            {unit.notes && (
                                <Card className="mb-4">
                                    <Card.Header>
                                        <h5 className="mb-0">Notes</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <p style={{whiteSpace: 'pre-line'}}>{unit.notes}</p>
                                    </Card.Body>
                                </Card>
                            )}
                        </Tab>
                        <Tab eventKey="card" title="Unit Card">
                            <Card className="mb-4">
                                <Card.Body>
                                    <Row>
                                        <Col lg={8} className="mx-auto">
                                            <div id="exportArea" className="export-container">
                                                <UnitCard
                                                    unit={unit}
                                                    customUnitTypes={customUnitTypes}
                                                />
                                            </div>
                                            <div className="text-center mt-4">
                                                <Button onClick={() => exportToPDF("exportArea", "Legion_Report.pdf")}>
                                                    Export as PDF
                                                </Button>
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