// src/components/units/UnitList.js - Updated with export button
import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Alert, Row, Col, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import UnitTypes from '../../enums/UnitTypes';
import Factions from '../../enums/Factions';
import Keywords from '../../enums/Keywords';
import LoadingSpinner from '../layout/LoadingSpinner';
import KeywordUtils from '../../utils/KeywordUtils';
import ExportUtils from '../../utils/ExportUtils';

const UnitList = () => {
    const [units, setUnits] = useState([]);
    const [upgrades, setUpgrades] = useState([]);
    const [customKeywords, setCustomKeywords] = useState([]);
    const [customUnitTypes, setCustomUnitTypes] = useState([]);
    const [filteredUnits, setFilteredUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterFaction, setFilterFaction] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [abilities, setAbilities] = useState([]);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Fetch data on component mount
    useEffect(() => {
        fetchData();
    }, [currentUser]);

    // Filter units whenever filtering criteria changes
    useEffect(() => {
        filterUnitsList();
    }, [units, filterFaction, filterType, searchTerm]);

    const fetchData = async () => {
        if (!currentUser) return;

        try {
            setLoading(true);

            // Fetch units
            const unitsRef = collection(db, 'users', currentUser.uid, 'units');
            const unitsQuery = query(unitsRef, orderBy('name', 'asc'));
            const unitsSnapshot = await getDocs(unitsQuery);
            const unitsList = unitsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Fetch upgrades (needed for keyword effects)
            const upgradesRef = collection(db, 'users', currentUser.uid, 'upgradeCards');
            const upgradesSnapshot = await getDocs(upgradesRef);
            const upgradesList = upgradesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Fetch custom keywords
            const keywordsRef = collection(db, 'users', currentUser.uid, 'customKeywords');
            const keywordsSnapshot = await getDocs(keywordsRef);
            const keywordsList = keywordsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Fetch custom unit types
            const typesRef = collection(db, 'users', currentUser.uid, 'customUnitTypes');
            const typesSnapshot = await getDocs(typesRef);
            const typesList = typesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Fetch abilities
            const abilitiesRef = collection(db, 'users', currentUser.uid, 'abilities');
            const abilitiesSnapshot = await getDocs(abilitiesRef);
            const abilitiesList = abilitiesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setUnits(unitsList);
            setUpgrades(upgradesList);
            setCustomKeywords(keywordsList);
            setCustomUnitTypes(typesList);
            setAbilities(abilitiesList);
            setError('');
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to fetch units. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const filterUnitsList = () => {
        let filtered = [...units];

        if (filterFaction !== 'all') {
            filtered = filtered.filter(u => u.faction === filterFaction);
        }

        if (filterType !== 'all') {
            filtered = filtered.filter(u => u.type === filterType);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(u =>
                u.name.toLowerCase().includes(term) ||
                u.notes?.toLowerCase().includes(term) ||
                // Also search in keywords
                getAllKeywords(u).some(k => getKeywordDisplay(k).toString().toLowerCase().includes(term))
            );
        }

        setFilteredUnits(filtered);
    };

    // Get all keywords including those from upgrades, with stacking applied
    const getAllKeywords = (unit) => {
        return KeywordUtils.getAllKeywords(unit, upgrades);
    };

    const getKeywordDisplay = (keyword) => {
        if (keyword.startsWith('custom:')) {
            const customId = keyword.replace('custom:', '');
            const customKeyword = customKeywords.find(k => k.id === customId);
            return customKeyword ? customKeyword.name : keyword;
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

    const getTotalPoints = (unit) => {
        let total = unit.points || 0;

        // Add points from equipped upgrades
        unit.upgradeSlots?.forEach(slot => {
            slot.equippedUpgrades?.forEach(upgradeId => {
                const upgrade = upgrades.find(u => u.id === upgradeId);
                if (upgrade) total += upgrade.pointsCost || 0;
            });
        });

        return total;
    };

    // Handle exporting a unit directly from the list
    const handleExportUnit = (unit) => {
        if (!unit) return;

        // Get the unit's equipped upgrades and abilities
        const unitUpgrades = upgrades.filter(upgrade =>
            unit.upgradeSlots?.some(slot =>
                slot.equippedUpgrades?.includes(upgrade.id)
            )
        );

        const unitAbilities = abilities.filter(ability =>
            unit.abilities?.includes(ability.id)
        );

        // Use ExportUtils to generate text content
        const unitText = ExportUtils.exportUnit(
            unit,
            customKeywords,
            unitUpgrades,
            unitAbilities,
            customUnitTypes
        );

        // Download the file
        ExportUtils.downloadTextFile(unitText, `${unit.name.replace(/\s+/g, '_')}_unit.txt`);
    };

    if (loading) {
        return <LoadingSpinner text="Loading units..." />;
    }

    return (
        <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">My Units</h4>
                <Button as={Link} to="/units/create" variant="primary">
                    Create New Unit
                </Button>
            </Card.Header>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                <Row className="mb-3">
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Search</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Search by name or keywords..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Faction</Form.Label>
                            <Form.Select
                                value={filterFaction}
                                onChange={(e) => setFilterFaction(e.target.value)}
                            >
                                <option value="all">All Factions</option>
                                {Object.values(Factions).filter(f => typeof f === 'string').map(faction => (
                                    <option key={faction} value={faction}>
                                        {Factions.getDisplayName(faction)}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Unit Type</Form.Label>
                            <Form.Select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="all">All Types</option>
                                {/* System unit types */}
                                {Object.values(UnitTypes).filter(t => typeof t !== 'function').map(type => (
                                    <option key={type} value={type}>
                                        {UnitTypes.getDisplayName(type)}
                                    </option>
                                ))}
                                {/* Custom unit types */}
                                {customUnitTypes.map(t => (
                                    <option key={t.id} value={t.name}>
                                        {t.displayName}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                {units.length === 0 ? (
                    <Alert variant="info" className="text-center">
                        <p className="mb-3">You haven't created any units yet.</p>
                        <Button as={Link} to="/units/create" variant="primary">
                            Create Your First Unit
                        </Button>
                    </Alert>
                ) : filteredUnits.length === 0 ? (
                    <Alert variant="warning" className="text-center">
                        <p className="mb-0">No units match your filters.</p>
                    </Alert>
                ) : (
                    <Row xs={1} md={2} lg={3} className="g-4">
                        {filteredUnits.map(unit => (
                            <Col key={unit.id}>
                                <Card
                                    className={`h-100 faction-${unit.faction}-border`}
                                    onClick={() => navigate(`/units/${unit.id}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <Card.Header className={`faction-${unit.faction}`}>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h5 className="mb-0">{unit.name}</h5>
                                            <Badge bg="warning" text="dark">
                                                {getTotalPoints(unit)} pts
                                            </Badge>
                                        </div>
                                    </Card.Header>
                                    <Card.Body className="d-flex flex-column">
                                        <div className="mb-2">
                                            <Badge bg="secondary" className="me-2">{getTypeDisplayName(unit.type)}</Badge>
                                            {unit.isVehicle && <Badge bg="info">Vehicle</Badge>}
                                            <div className="mt-2 small text-muted">
                                                <strong>Faction:</strong> {Factions.getDisplayName(unit.faction)}
                                            </div>
                                        </div>

                                        <div className="keyword-container mb-3" style={{ minHeight: '60px', flexGrow: 1 }}>
                                            <div className="small mb-1 text-muted">Keywords:</div>
                                            {getAllKeywords(unit).length > 0 ? (
                                                <div className="d-flex flex-wrap">
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
                                                                <span className="ms-1" title="From Upgrade">+</span>
                                                            )}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-muted small">No keywords</div>
                                            )}
                                        </div>

                                        <div className="mt-auto">
                                            {/* Weapons count */}
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    {unit.weapons?.length > 0 && (
                                                        <small className="text-muted me-2">
                                                            {unit.weapons.length} weapon{unit.weapons.length !== 1 ? 's' : ''}
                                                        </small>
                                                    )}
                                                    {unit.upgradeSlots?.some(slot => slot.equippedUpgrades?.length > 0) && (
                                                        <Badge bg="info" className="me-1">
                                                            {unit.upgradeSlots.reduce((total, slot) =>
                                                                total + (slot.equippedUpgrades?.length || 0), 0)
                                                            } upgrades
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="d-flex">
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleExportUnit(unit);
                                                        }}
                                                    >
                                                        <i className="bi bi-download"></i> Export
                                                    </Button>
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        className="me-2"
                                                        as={Link}
                                                        to={`/units/edit/${unit.id}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        as={Link}
                                                        to={`/units/${unit.id}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        View
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Card.Body>
        </Card>
    );
};

export default UnitList;