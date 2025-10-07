// src/components/upgrades/UpgradeCardList.jsx
import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Button, Badge, Alert, Row, Col, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import UpgradeCardTypes from '../../enums/UpgradeCardTypes';
import LoadingSpinner from '../layout/LoadingSpinner';

const UpgradeCardList = () => {
    const [upgrades, setUpgrades] = useState([]);
    const [filteredUpgrades, setFilteredUpgrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const { currentUser } = useAuth();

    useEffect(() => {
        fetchUpgrades();
    }, [currentUser]);

    useEffect(() => {
        filterUpgradesList();
    }, [upgrades, filterType, searchTerm]);

    const fetchUpgrades = async () => {
        if (!currentUser) return;

        try {
            setLoading(true);
            const upgradesRef = collection(db, 'users', currentUser.uid, 'upgradeCards');
            const q = query(upgradesRef, orderBy('name', 'asc'));
            const snapshot = await getDocs(q);

            const upgradesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setUpgrades(upgradesList);
            setError('');
        } catch (err) {
            console.error('Error fetching upgrades:', err);
            setError('Failed to fetch upgrade cards');
        } finally {
            setLoading(false);
        }
    };

    const filterUpgradesList = () => {
        let filtered = upgrades;

        if (filterType !== 'all') {
            filtered = filtered.filter(u => u.upgradeType === filterType);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(u =>
                u.name.toLowerCase().includes(term) ||
                u.description?.toLowerCase().includes(term)
            );
        }

        setFilteredUpgrades(filtered);
    };

    const handleDelete = async (upgradeId) => {
        if (!window.confirm('Are you sure you want to delete this upgrade card? Units with this upgrade equipped may be affected.')) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'upgradeCards', upgradeId));
            fetchUpgrades();
        } catch (err) {
            console.error('Error deleting upgrade:', err);
            setError('Failed to delete upgrade card');
        }
    };

    const getEffectsSummary = (effects) => {
        const summary = [];

        if (effects.modelCountChange !== 0) {
            summary.push(`Models: ${effects.modelCountChange > 0 ? '+' : ''}${effects.modelCountChange}`);
        }

        if (effects.addKeywords?.length > 0) {
            summary.push(`+${effects.addKeywords.length} keyword${effects.addKeywords.length > 1 ? 's' : ''}`);
        }

        if (effects.addAbilities?.length > 0) {
            summary.push(`+${effects.addAbilities.length} abilit${effects.addAbilities.length > 1 ? 'ies' : 'y'}`);
        }

        if (effects.addWeapons?.length > 0) {
            summary.push(`+${effects.addWeapons.length} weapon${effects.addWeapons.length > 1 ? 's' : ''}`);
        }

        if (effects.statModifiers) {
            const { wounds, courage, speed } = effects.statModifiers;
            if (wounds) summary.push(`Wounds: ${wounds > 0 ? '+' : ''}${wounds}`);
            if (courage) summary.push(`Courage: ${courage > 0 ? '+' : ''}${courage}`);
            if (speed) summary.push(`Speed: ${speed > 0 ? '+' : ''}${speed}`);
        }

        return summary.length > 0 ? summary.join(' • ') : 'No effects';
    };

    if (loading) {
        return <LoadingSpinner text="Loading upgrade cards..." />;
    }

    return (
        <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Upgrade Cards</h4>
                <Button as={Link} to="/upgrades/create" variant="primary">
                    Create Upgrade Card
                </Button>
            </Card.Header>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Search</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Search upgrades..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Type</Form.Label>
                            <Form.Select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="all">All Types</option>
                                {UpgradeCardTypes.getAllTypes().map(type => (
                                    <option key={type} value={type}>
                                        {UpgradeCardTypes.getDisplayName(type)}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                {upgrades.length === 0 ? (
                    <Alert variant="info" className="text-center">
                        <p className="mb-3">You haven't created any upgrade cards yet.</p>
                        <Button as={Link} to="/upgrades/create" variant="primary">
                            Create Your First Upgrade Card
                        </Button>
                    </Alert>
                ) : filteredUpgrades.length === 0 ? (
                    <Alert variant="warning" className="text-center">
                        <p className="mb-0">No upgrades match your filters.</p>
                    </Alert>
                ) : (
                    <ListGroup>
                        {filteredUpgrades.map(upgrade => (
                            <ListGroup.Item key={upgrade.id}>
                                <div className="d-flex justify-content-between align-items-start">
                                    <div className="flex-grow-1">
                                        <h5 className="mb-2">
                                            {upgrade.name}
                                            <Badge
                                                bg={UpgradeCardTypes.getBadgeColor(upgrade.upgradeType)}
                                                className="ms-2"
                                            >
                                                <i className={UpgradeCardTypes.getIconClass(upgrade.upgradeType) + ' me-1'}></i>
                                                {UpgradeCardTypes.getDisplayName(upgrade.upgradeType)}
                                            </Badge>
                                            <Badge bg="warning" text="dark" className="ms-2">
                                                {upgrade.pointsCost} pts
                                            </Badge>
                                        </h5>
                                        <p className="mb-2 text-muted">{upgrade.description}</p>
                                        <div className="small">
                                            <strong>Effects:</strong> {getEffectsSummary(upgrade.effects)}
                                        </div>
                                        {upgrade.reminders?.length > 0 && (
                                            <div className="mt-2">
                                                <strong className="small">Reminders:</strong>
                                                <Badge bg="secondary" className="ms-2">
                                                    {upgrade.reminders.length}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                    <div className="ms-3 text-nowrap">
                                        <Button
                                            as={Link}
                                            to={`/upgrades/edit/${upgrade.id}`}
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2"
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDelete(upgrade.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Card.Body>
        </Card>
    );
};

export default UpgradeCardList;