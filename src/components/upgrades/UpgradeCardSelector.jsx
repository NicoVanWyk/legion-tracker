// src/components/upgrades/UpgradeCardSelector.jsx
import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Form, Button, Alert, Badge } from 'react-bootstrap';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import UpgradeCardTypes from '../../enums/UpgradeCardTypes';
import LoadingSpinner from '../layout/LoadingSpinner';

const ITEMS_PER_PAGE = 2;

const UpgradeCardSelector = ({ upgradeType, selectedUpgrades = [], onChange, maxCount = 1 }) => {
    const [upgrades, setUpgrades] = useState([]);
    const [filteredUpgrades, setFilteredUpgrades] = useState([]);
    const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { currentUser } = useAuth();

    useEffect(() => {
        fetchUpgrades();
    }, [currentUser, upgradeType]);

    useEffect(() => {
        filterUpgradesList();
        setDisplayedCount(ITEMS_PER_PAGE); // Reset displayed count when filters change
    }, [upgrades, searchTerm]);

    const fetchUpgrades = async () => {
        if (!currentUser || !upgradeType) return;

        try {
            setLoading(true);
            const upgradesRef = collection(db, 'users', currentUser.uid, 'upgradeCards');
            const q = query(
                upgradesRef,
                where('upgradeType', '==', upgradeType),
                orderBy('pointsCost', 'asc')
            );
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
        if (!upgrades) return [];

        let filtered = [...upgrades];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(u =>
                u.name.toLowerCase().includes(term) ||
                u.description?.toLowerCase().includes(term)
            );
        }

        setFilteredUpgrades(filtered);
    };

    const toggleUpgrade = (upgradeId) => {
        // Check if already selected
        if (selectedUpgrades.includes(upgradeId)) {
            // Remove the upgrade
            onChange(selectedUpgrades.filter(id => id !== upgradeId));
        } else {
            // Add the upgrade, but check if we've reached the limit
            if (selectedUpgrades.length < maxCount) {
                onChange([...selectedUpgrades, upgradeId]);
            } else {
                // Replace the first one if we're at maximum
                const newSelected = [...selectedUpgrades];
                newSelected[0] = upgradeId;
                onChange(newSelected);
            }
        }
    };

    const showMore = () => {
        setDisplayedCount(prev => prev + ITEMS_PER_PAGE);
    };

    const showAll = () => {
        setDisplayedCount(filteredUpgrades.length);
    };

    const getEffectsSummary = (effects) => {
        const summary = [];

        if (effects?.modelCountChange) {
            summary.push(`Models: ${effects.modelCountChange > 0 ? '+' : ''}${effects.modelCountChange}`);
        }

        if (effects?.addKeywords?.length > 0) {
            summary.push(`+${effects.addKeywords.length} keyword${effects.addKeywords.length > 1 ? 's' : ''}`);
        }

        if (effects?.addAbilities?.length > 0) {
            summary.push(`+${effects.addAbilities.length} abilit${effects.addAbilities.length > 1 ? 'ies' : 'y'}`);
        }

        if (effects?.addWeapons?.length > 0) {
            summary.push(`+${effects.addWeapons.length} weapon${effects.addWeapons.length > 1 ? 's' : ''}`);
        }

        if (effects?.statModifiers) {
            const { wounds, courage, resilience, speed } = effects.statModifiers;
            if (wounds) summary.push(`Wounds: ${wounds > 0 ? '+' : ''}${wounds}`);
            if (courage) summary.push(`Courage: ${courage > 0 ? '+' : ''}${courage}`);
            if (resilience) summary.push(`Resilience: ${resilience > 0 ? '+' : ''}${resilience}`);
            if (speed) summary.push(`Speed: ${speed > 0 ? '+' : ''}${speed}`);
        }

        return summary.length > 0 ? summary.join(' • ') : 'No effects';
    };

    if (loading) {
        return <LoadingSpinner text="Loading upgrade cards..." />;
    }

    const displayedUpgrades = filteredUpgrades.slice(0, displayedCount);
    const hasMore = displayedCount < filteredUpgrades.length;
    const remainingCount = filteredUpgrades.length - displayedCount;

    return (
        <div className="upgrade-card-selector">
            <div className="mb-3">
                <h5 className="d-flex justify-content-between">
                    <span>
                        {UpgradeCardTypes.getDisplayName(upgradeType)} Upgrades 
                        <Badge bg={UpgradeCardTypes.getBadgeColor(upgradeType)} className="ms-2">
                            {selectedUpgrades.length}/{maxCount}
                        </Badge>
                    </span>
                </h5>
                <div>
                    {selectedUpgrades.length === 0 ? (
                        <p className="text-muted">No upgrades selected</p>
                    ) : (
                        upgrades
                            .filter(upgrade => selectedUpgrades.includes(upgrade.id))
                            .map(upgrade => (
                                <Card key={upgrade.id} className="mb-2">
                                    <Card.Body className="p-2">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <div className="fw-bold">
                                                    {upgrade.name}
                                                    <Badge bg="warning" text="dark" className="ms-2">
                                                        {upgrade.pointsCost} pts
                                                    </Badge>
                                                </div>
                                                <div className="small text-muted">{upgrade.description}</div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="danger"
                                                size="sm"
                                                onClick={() => toggleUpgrade(upgrade.id)}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            ))
                    )}
                </div>
            </div>

            <Form.Group className="mb-3">
                <Form.Control
                    type="text"
                    placeholder="Search upgrades..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {filteredUpgrades.length > 0 && (
                    <Form.Text className="text-muted">
                        Showing {Math.min(displayedCount, filteredUpgrades.length)} of {filteredUpgrades.length} upgrade{filteredUpgrades.length !== 1 ? 's' : ''}
                    </Form.Text>
                )}
            </Form.Group>

            {upgrades.length === 0 ? (
                <Alert variant="info">
                    <p className="mb-2">No {UpgradeCardTypes.getDisplayName(upgradeType)} upgrades available.</p>
                    <Button
                        type="button"
                        variant="outline-primary"
                        size="sm"
                        onClick={() => window.open('/upgrades/create', '_blank')}
                    >
                        Create Upgrade Card
                    </Button>
                </Alert>
            ) : filteredUpgrades.length === 0 ? (
                <Alert variant="warning">
                    <p className="mb-0">No upgrades match your search.</p>
                </Alert>
            ) : (
                <>
                    <ListGroup className="upgrade-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {displayedUpgrades.map(upgrade => (
                            <ListGroup.Item
                                key={upgrade.id}
                                action
                                active={selectedUpgrades.includes(upgrade.id)}
                                onClick={() => toggleUpgrade(upgrade.id)}
                                disabled={selectedUpgrades.length >= maxCount && !selectedUpgrades.includes(upgrade.id)}
                            >
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <div className="fw-bold">
                                            {upgrade.name}
                                            <Badge bg="warning" text="dark" className="ms-2">
                                                {upgrade.pointsCost} pts
                                            </Badge>
                                        </div>
                                        <div className="small text-muted">{upgrade.description}</div>
                                        <div className="small">{getEffectsSummary(upgrade.effects)}</div>
                                        {upgrade.reminders?.length > 0 && (
                                            <div className="mt-1">
                                                <Badge bg="secondary">
                                                    {upgrade.reminders.length} reminder{upgrade.reminders.length !== 1 ? 's' : ''}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        type="button"
                                        variant={selectedUpgrades.includes(upgrade.id) ? "danger" : "primary"}
                                        size="sm"
                                        disabled={selectedUpgrades.length >= maxCount && !selectedUpgrades.includes(upgrade.id)}
                                    >
                                        {selectedUpgrades.includes(upgrade.id) ? "Remove" : "Add"}
                                    </Button>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                    
                    {hasMore && (
                        <div className="text-center mt-3">
                            <Button 
                                type="button"
                                variant="outline-primary" 
                                size="sm" 
                                onClick={showMore}
                                className="me-2"
                            >
                                Show {Math.min(ITEMS_PER_PAGE, remainingCount)} More
                            </Button>
                            {remainingCount > ITEMS_PER_PAGE && (
                                <Button 
                                    type="button"
                                    variant="outline-secondary" 
                                    size="sm" 
                                    onClick={showAll}
                                >
                                    Show All ({remainingCount} remaining)
                                </Button>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default UpgradeCardSelector;