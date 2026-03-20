// src/components/armies/ArmyDetail.jsx
import React, {useState, useEffect} from 'react';
import {Card, Row, Col, Badge, Button, Alert, ListGroup} from 'react-bootstrap';
import {useNavigate, Link} from 'react-router-dom';
import {doc, getDoc, deleteDoc, collection, getDocs, query, where, updateDoc} from 'firebase/firestore';
import {db} from '../../firebase/config';
import {useAuth} from '../../contexts/AuthContext';
import LoadingSpinner from '../layout/LoadingSpinner';
import ExportButton from '../common/ExportButton';
import ExportUtils from '../../utils/ExportUtils';
import ArmyPointsCalculator from '../../utils/ArmyPointsCalculator';
import AoSRegimentValidator from '../../utils/AoSRegimentValidator';
import {useGameSystem} from '../../contexts/GameSystemContext';
import GameSystems from '../../enums/GameSystems';
import AoSFactions from '../../enums/aos/AoSFactions';
import AoSUnitTypes from '../../enums/aos/AoSUnitTypes';
import AoSKeywords from '../../enums/aos/AoSKeywords';
import Factions from '../../enums/Factions';
import UnitTypes from '../../enums/UnitTypes';
import RegimentCard from '../aos/RegimentCard';

const ArmyDetail = ({armyId}) => {
    const [army, setArmy] = useState(null);
    const [units, setUnits] = useState([]);
    const [armyContent, setArmyContent] = useState([]);
    const [customKeywords, setCustomKeywords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [validation, setValidation] = useState({valid: true, errors: [], warnings: []});

    const {currentUser} = useAuth();
    const {currentSystem} = useGameSystem();
    const navigate = useNavigate();

    const isAoS = currentSystem === GameSystems.AOS;
    const FactionEnum = isAoS ? AoSFactions : Factions;
    const TypeEnum = isAoS ? AoSUnitTypes : UnitTypes;

    useEffect(() => {
        const fetchArmy = async () => {
            if (!currentUser || !armyId) return;

            try {
                setLoading(true);
                const armyRef = doc(db, 'users', currentUser.uid, 'armies', armyId);
                const armyDoc = await getDoc(armyRef);

                if (!armyDoc.exists()) {
                    setError('Army not found');
                    return;
                }

                const armyData = {id: armyDoc.id, ...armyDoc.data()};
                setArmy(armyData);

                const unitPromises = (armyData.units || []).map(async (unitId) => {
                    const unitRef = doc(db, 'users', currentUser.uid, 'units', unitId);
                    const unitDoc = await getDoc(unitRef);
                    return unitDoc.exists() ? {id: unitDoc.id, ...unitDoc.data()} : null;
                });
                const unitsData = (await Promise.all(unitPromises)).filter(Boolean);
                setUnits(unitsData);

                const keywordsRef = collection(db, 'users', currentUser.uid, 'customKeywords');
                const keywordsSnapshot = await getDocs(keywordsRef);
                const keywordsList = keywordsSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
                setCustomKeywords(keywordsList);

                if (isAoS) {
                    const contentRef = collection(db, 'users', currentUser.uid, 'armyContent');
                    const contentQuery = query(contentRef, where('gameSystem', '==', GameSystems.AOS));
                    const contentSnapshot = await getDocs(contentQuery);
                    const contentList = contentSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
                    setArmyContent(contentList);
                }
            } catch (err) {
                console.error('Error fetching army:', err);
                setError('Failed to load army');
            } finally {
                setLoading(false);
            }
        };

        fetchArmy();
    }, [currentUser, armyId, isAoS]);

    useEffect(() => {
        if (isAoS && army && units.length > 0) {
            const result = AoSRegimentValidator.validateArmy(army, units, armyContent);
            setValidation(result);
        }
    }, [army, units, armyContent, isAoS]);

    const handleDelete = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }

        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'armies', armyId));
            navigate('/armies');
        } catch (err) {
            console.error('Error deleting army:', err);
            setError('Failed to delete army');
        }
    };

    const handleExportArmy = () => {
        if (!army) return;
        const armyText = ExportUtils.exportArmy(army, units, customKeywords, [], [], [], [], armyContent);
        ExportUtils.downloadTextFile(armyText, `${army.name.replace(/\s+/g, '_')}_army.txt`);
    };

    const calculateTotalPoints = () => {
        return isAoS && army.regiments
            ? ArmyPointsCalculator.calculateArmyPointsWithRegiments(army, units, armyContent)
            : ArmyPointsCalculator.calculateArmyPoints(units, []);
    };

    const getKeywordDisplay = (keyword) => {
        // Handle non-string keywords
        if (!keyword || typeof keyword !== 'string') {
            return keyword;
        }

        if (keyword.startsWith('custom:')) {
            const customId = keyword.replace('custom:', '');
            const customKeyword = customKeywords.find(k => k.id === customId);
            return customKeyword?.name || keyword;
        }
        return AoSKeywords.getDisplayName(keyword);
    };

    const handleEditRegiment = (regiment) => {
        navigate(`/armies/${armyId}/regiments`, { state: { editingRegiment: regiment } });
    };

    const handleDeleteRegiment = async (regimentId) => {
        if (!window.confirm('Delete this regiment?')) return;

        try {
            const regiments = (army.regiments || []).filter(r => r.id !== regimentId);
            const armyRef = doc(db, 'users', currentUser.uid, 'armies', armyId);
            await updateDoc(armyRef, { regiments });
            setArmy({ ...army, regiments });
        } catch (err) {
            console.error('Error deleting regiment:', err);
            setError('Failed to delete regiment');
        }
    };

    if (loading) return <LoadingSpinner text="Loading army..."/>;

    if (error || !army) {
        return (
            <Alert variant="danger">
                {error || 'Army not found'}
                <div className="mt-3">
                    <Button onClick={() => navigate('/armies')}>Back to Armies</Button>
                </div>
            </Alert>
        );
    }

    const generalUnit = isAoS ? units.find(u => u.id === army.generalUnitId) : null;
    const regiments = army.regiments || [];
    const auxiliaryUnits = (army.auxiliaryUnits || [])
        .map(id => units.find(u => u.id === id))
        .filter(Boolean);

    return (
        <>
            {confirmDelete && (
                <Alert variant="danger">
                    <Alert.Heading>Confirm Delete</Alert.Heading>
                    <p>Delete this army? This cannot be undone.</p>
                    <div className="d-flex justify-content-end gap-2">
                        <Button variant="outline-secondary" onClick={() => setConfirmDelete(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>Delete Army</Button>
                    </div>
                </Alert>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2>{army.name}</h2>
                    <p className="text-muted mb-0">
                        {FactionEnum.getDisplayName(army.faction)} • {calculateTotalPoints()} points
                    </p>
                </div>
                <div className="d-flex gap-2">
                    <ExportButton onExport={handleExportArmy} text="Export"/>
                    <Button variant="outline-primary" onClick={() => window.print()}>
                        <i className="bi bi-printer"></i>
                    </Button>
                    <Button variant="outline-primary" onClick={() => navigate(`/armies/edit/${armyId}`)}>
                        Edit
                    </Button>
                    <Button variant="outline-danger" onClick={handleDelete}>
                        Delete
                    </Button>
                </div>
            </div>

            {isAoS && validation.errors.length > 0 && (
                <Alert variant="danger">
                    <Alert.Heading><i className="bi bi-exclamation-triangle me-2"></i>Validation Errors</Alert.Heading>
                    <ul className="mb-0">
                        {validation.errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                </Alert>
            )}

            {isAoS && validation.warnings.length > 0 && (
                <Alert variant="warning">
                    <Alert.Heading><i className="bi bi-info-circle me-2"></i>Warnings</Alert.Heading>
                    <ul className="mb-0">
                        {validation.warnings.map((warn, i) => <li key={i}>{warn}</li>)}
                    </ul>
                </Alert>
            )}

            {isAoS && (
                <>
                    {isAoS && armyId && (
                        <div className="d-flex gap-2 mb-3">
                            <Button variant="outline-primary" onClick={() => navigate(`/armies/${armyId}/regiments`)}>
                                <i className="bi bi-diagram-3 me-2"></i>Manage Regiments
                            </Button>
                            <Button variant="outline-primary" onClick={() => navigate(`/armies/${armyId}/content`)}>
                                <i className="bi bi-book me-2"></i>Army Content
                            </Button>
                            <Button variant="outline-primary" onClick={() => navigate(`/armies/${armyId}/enhancements`)}>
                                <i className="bi bi-gem me-2"></i>Hero Enhancements
                            </Button>
                        </div>
                    )}

                    <Card className="mb-4">
                        <Card.Header className={`faction-${army.faction}`}>
                            <h5 className="mb-0">
                                <i className="bi bi-diagram-3 me-2"></i>
                                Regiments ({regiments.length}/5)
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            {generalUnit && (
                                <Alert variant="info" className="mb-3">
                                    <strong>General:</strong> {generalUnit.name}
                                    {generalUnit.keywords?.includes(AoSKeywords.WARMASTER) && (
                                        <Badge bg="warning" text="dark" className="ms-2">WARMASTER</Badge>
                                    )}
                                </Alert>
                            )}

                            {regiments.length === 0 ? (
                                <Alert variant="warning">
                                    <strong>No Regiments</strong>
                                    <p className="mb-2 mt-2">AoS 4E armies require regiments. Each regiment needs:</p>
                                    <ul className="mb-0">
                                        <li>1 Commander (HERO)</li>
                                        <li>0-3 Units (0-4 if general's regiment)</li>
                                        <li>Heroes can join as sub-commanders if allowed</li>
                                    </ul>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        className="mt-3"
                                        onClick={() => navigate(`/armies/${armyId}/regiments`)}
                                    >
                                        Create Regiment
                                    </Button>
                                </Alert>
                            ) : (
                                regiments.map(regiment => (
                                    <RegimentCard
                                        key={regiment.id}
                                        regiment={regiment}
                                        units={units}
                                        content={armyContent}
                                        generalUnitId={army.generalUnitId}
                                        customKeywords={customKeywords}
                                        onEdit={handleEditRegiment}
                                        onDelete={handleDeleteRegiment}
                                    />
                                ))
                            )}

                            {auxiliaryUnits.length > 0 && (
                                <div className="mt-4">
                                    <h6 className="text-muted">
                                        <i className="bi bi-box me-2"></i>
                                        Auxiliary Units ({auxiliaryUnits.length})
                                    </h6>
                                    <Alert variant="secondary" className="small">
                                        Opponent gains +1 CP per round. Each deploys separately.
                                    </Alert>
                                    <ListGroup>
                                        {auxiliaryUnits.map(unit => (
                                            <ListGroup.Item key={unit.id} className="d-flex justify-content-between">
                                                <div>
                                                    <strong>{unit.name}</strong>
                                                    <span className="ms-2 text-muted small">
                                                        {TypeEnum.getDisplayName(unit.type)}
                                                    </span>
                                                </div>
                                                <Button as={Link} to={`/units/${unit.id}`} variant="link" size="sm">
                                                    View
                                                </Button>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    {(army.battleTraits?.length > 0 || army.battleFormations?.length > 0) && (
                        <Card className="mb-4">
                            <Card.Header>
                                <h5 className="mb-0"><i className="bi bi-shield-check me-2"></i>Army Abilities</h5>
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
            )}

            <Card className="mb-4">
                <Card.Header>
                    <h5 className="mb-0">All Units ({units.length})</h5>
                </Card.Header>
                <Card.Body>
                    {units.length === 0 ? (
                        <Alert variant="info">No units in this army</Alert>
                    ) : (
                        <Row>
                            {units.map(unit => (
                                <Col md={6} lg={4} key={unit.id} className="mb-3">
                                    <Card className="h-100">
                                        <Card.Header className="d-flex justify-content-between">
                                            <strong>{unit.name}</strong>
                                            <Badge bg="secondary">{unit.points} pts</Badge>
                                        </Card.Header>
                                        <Card.Body>
                                            <p className="text-muted small mb-2">
                                                {TypeEnum.getDisplayName(unit.type)}
                                            </p>
                                            {isAoS && unit.keywords?.length > 0 && (
                                                <div className="mb-2">
                                                    {unit.keywords.slice(0, 3).map(kw => (
                                                        <Badge key={kw} bg="light" text="dark" className="me-1 mb-1">
                                                            {getKeywordDisplay(kw)}
                                                        </Badge>
                                                    ))}
                                                    {unit.keywords.length > 3 && (
                                                        <Badge bg="light" text="dark" className="mb-1">
                                                            +{unit.keywords.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                        </Card.Body>
                                        <Card.Footer>
                                            <Button
                                                as={Link}
                                                to={`/units/${unit.id}`}
                                                variant="outline-primary"
                                                size="sm"
                                                className="w-100"
                                            >
                                                View Details
                                            </Button>
                                        </Card.Footer>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </Card.Body>
            </Card>

            <Button variant="secondary" onClick={() => navigate('/armies')}>
                Back to Armies
            </Button>
        </>
    );
};

export default ArmyDetail;