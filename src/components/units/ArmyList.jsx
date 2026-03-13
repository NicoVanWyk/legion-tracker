// src/components/units/ArmyList.js
import React, {useState, useEffect} from 'react';
import {Row, Col, Card, Button, Badge, Form, InputGroup} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import {collection, query, where, getDocs} from 'firebase/firestore';
import {db} from '../../firebase/config';
import {useAuth} from '../../contexts/AuthContext';
import {useGameSystem} from '../../contexts/GameSystemContext';
import Factions from '../../enums/Factions';
import UnitTypes from '../../enums/UnitTypes';
import LoadingSpinner from '../layout/LoadingSpinner';
import ArmyPointsCalculator from '../../utils/ArmyPointsCalculator';
import AoSFactions from '../../enums/aos/AoSFactions';
import AoSUnitTypes from '../../enums/aos/AoSUnitTypes';
import GameSystems from '../../enums/GameSystems';

const ArmyList = () => {
    const [armies, setArmies] = useState([]);
    const [units, setUnits] = useState([]);
    const [upgrades, setUpgrades] = useState([]);
    const [customUnitTypes, setCustomUnitTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterFaction, setFilterFaction] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const {currentUser} = useAuth();
    const {currentSystem} = useGameSystem();

    const FactionEnum = currentSystem === GameSystems.LEGION ? Factions : AoSFactions;
    const TypeEnum = currentSystem === GameSystems.LEGION ? UnitTypes : AoSUnitTypes;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const armiesRef = collection(db, 'users', currentUser.uid, 'armies');
                const q = query(
                    armiesRef,
                    where('gameSystem', '==', currentSystem)
                );
                const querySnapshot = await getDocs(q);

                const armiesList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    unitCount: doc.data().units ? doc.data().units.length : 0,
                    totalPoints: doc.data().totalPoints || 0
                }));

                setArmies(armiesList);

                const unitsRef = collection(db, 'users', currentUser.uid, 'units');
                const unitsSnapshot = await getDocs(unitsRef);
                const unitsList = unitsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setUnits(unitsList);

                const upgradesRef = collection(db, 'users', currentUser.uid, 'upgradeCards');
                const upgradesSnapshot = await getDocs(upgradesRef);
                const upgradesList = upgradesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setUpgrades(upgradesList);

                const typesRef = collection(db, 'users', currentUser.uid, 'customUnitTypes');
                const typesSnapshot = await getDocs(typesRef);
                const typesList = typesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setCustomUnitTypes(typesList);

                setError('');
            } catch (err) {
                console.error('Error fetching armies:', err);
                setError('Failed to fetch armies. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchData();
        }
    }, [currentUser, currentSystem]);

    const getTypeDisplayName = (type) => {
        if (Object.values(TypeEnum).includes(type)) {
            return TypeEnum.getDisplayName(type);
        }
        const customType = customUnitTypes.find(t => t.name === type);
        return customType ? (customType.displayName || customType.name) : type;
    };

    const calculateArmyPoints = (army) => {
        if (!army?.units?.length) return 0;
        const armyUnits = units.filter(unit => army.units.includes(unit.id));
        return ArmyPointsCalculator.calculateArmyPoints(armyUnits, upgrades);
    };

    const getArmyUnitTypes = (army) => {
        if (!army?.units?.length) return [];

        const armyUnits = units.filter(unit => army.units.includes(unit.id));
        const typeCounts = {};

        armyUnits.forEach(unit => {
            if (unit.type) {
                typeCounts[unit.type] = (typeCounts[unit.type] || 0) + 1;
            }
        });

        return Object.entries(typeCounts).map(([type, count]) => ({
            type,
            count,
            isCustom: customUnitTypes.some(t => t.name === type),
            displayName: getTypeDisplayName(type)
        }));
    };

    const filteredArmies = armies.filter(army => {
        if (filterFaction !== 'all' && army.faction !== filterFaction) {
            return false;
        }
        if (searchTerm && !army.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }
        return true;
    });

    if (loading) {
        return <LoadingSpinner text="Loading armies..."/>;
    }

    return (
        <>
            <Row className="mb-4">
                <Col>
                    <Card className="mb-4">
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col md={5} className="mb-3 mb-md-0">
                                    <Form.Group>
                                        <Form.Label>Faction</Form.Label>
                                        <Form.Select
                                            value={filterFaction}
                                            onChange={(e) => setFilterFaction(e.target.value)}
                                        >
                                            <option value="all">All Factions</option>
                                            {Object.values(FactionEnum).filter(f => typeof f === 'string').map(faction => (
                                                <option key={faction} value={faction}>
                                                    {FactionEnum.getDisplayName(faction)}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={5} className="mb-3 mb-md-0">
                                    <Form.Group>
                                        <Form.Label>Search</Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type="text"
                                                placeholder="Search army name"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                            {searchTerm && (
                                                <Button
                                                    variant="outline-secondary"
                                                    onClick={() => setSearchTerm('')}
                                                >
                                                    Clear
                                                </Button>
                                            )}
                                        </InputGroup>
                                    </Form.Group>
                                </Col>

                                <Col md={2} className="text-end">
                                    <Button
                                        as={Link}
                                        to="/armies/create"
                                        variant="primary"
                                        className="mt-3 mt-md-0"
                                    >
                                        Create Army
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {error && (
                <Row className="mb-4">
                    <Col>
                        <div className="alert alert-danger">{error}</div>
                    </Col>
                </Row>
            )}

            {armies.length === 0 ? (
                <Card>
                    <Card.Body className="text-center py-5">
                        <h4>No armies found</h4>
                        <p>You haven't created any armies yet. Get started by creating your first army!</p>
                        <Button as={Link} to="/armies/create" variant="primary">
                            Create Army
                        </Button>
                    </Card.Body>
                </Card>
            ) : filteredArmies.length === 0 ? (
                <Card>
                    <Card.Body className="text-center py-5">
                        <h4>No matching armies</h4>
                        <p>No armies match your current filters. Try adjusting your filters.</p>
                        <Button onClick={() => {
                            setFilterFaction('all');
                            setSearchTerm('');
                        }} variant="outline-primary">
                            Clear Filters
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                <Row>
                    {filteredArmies.map(army => {
                        const armyUnitTypes = getArmyUnitTypes(army);
                        const calculatedPoints = calculateArmyPoints(army);
                        const factionColor = FactionEnum.getColor ? FactionEnum.getColor(army.faction) : '#6c757d';

                        return (
                            <Col key={army.id} md={6} lg={4} className="mb-4">
                                <Card className={`army-card faction-${army.faction}`}>
                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                        <span>{army.name}</span>
                                        <Badge
                                            bg="secondary"
                                            style={{
                                                backgroundColor: factionColor,
                                                color: 'white'
                                            }}
                                        >
                                            {FactionEnum.getDisplayName(army.faction)}
                                        </Badge>
                                    </Card.Header>

                                    <Card.Body>
                                        <div className="mb-2">
                                            <strong>Points:</strong> {calculatedPoints}
                                            {calculatedPoints !== army.totalPoints && (
                                                <span className="text-primary ms-1" title="Includes upgrade costs">
                                                    (Base: {army.totalPoints || 0})
                                                </span>
                                            )}
                                        </div>

                                        <div className="mb-2">
                                            <strong>Units:</strong> {army.unitCount || 0}
                                        </div>

                                        {armyUnitTypes.length > 0 && (
                                            <div className="mb-3">
                                                <strong>Composition:</strong>
                                                <div className="mt-1">
                                                    {armyUnitTypes.map((unitType, index) => (
                                                        <Badge
                                                            key={index}
                                                            bg={unitType.isCustom ? "info" : "secondary"}
                                                            className="me-1 mb-1"
                                                        >
                                                            {unitType.displayName}: {unitType.count}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="mb-3">
                                            <strong>Last Updated:</strong>{' '}
                                            {army.updatedAt ? new Date(army.updatedAt.toDate()).toLocaleDateString() : 'Never'}
                                        </div>

                                        <div className="d-flex">
                                            <Link to={`/armies/${army.id}`} className="btn btn-primary btn-sm me-2">
                                                View Details
                                            </Link>
                                            <Link to={`/armies/edit/${army.id}`}
                                                  className="btn btn-outline-secondary btn-sm">
                                                Edit
                                            </Link>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}
        </>
    );
};

export default ArmyList;