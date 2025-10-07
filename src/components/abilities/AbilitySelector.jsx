// src/components/abilities/AbilitySelector.jsx
import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Form, InputGroup, Button, Alert, Badge } from 'react-bootstrap';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import ReminderTypes from '../../enums/ReminderTypes';
import LoadingSpinner from '../layout/LoadingSpinner';

const AbilitySelector = ({ selectedAbilities = [], onChange }) => {
    const [abilities, setAbilities] = useState([]);
    const [filteredAbilities, setFilteredAbilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTiming, setFilterTiming] = useState('all');
    const { currentUser } = useAuth();

    useEffect(() => {
        fetchAbilities();
    }, [currentUser]);

    useEffect(() => {
        filterAbilitiesList();
    }, [abilities, searchTerm, filterTiming]);

    const fetchAbilities = async () => {
        if (!currentUser) return;

        try {
            setLoading(true);
            const abilitiesRef = collection(db, 'users', currentUser.uid, 'abilities');
            const q = query(abilitiesRef, orderBy('name', 'asc'));
            const snapshot = await getDocs(q);

            const abilitiesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setAbilities(abilitiesList);
            setError('');
        } catch (err) {
            console.error('Error fetching abilities:', err);
            setError('Failed to fetch abilities');
        } finally {
            setLoading(false);
        }
    };

    const filterAbilitiesList = () => {
        let filtered = abilities;

        if (filterTiming !== 'all') {
            filtered = filtered.filter(a => a.timing === filterTiming);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(a =>
                a.name.toLowerCase().includes(term) ||
                a.description?.toLowerCase().includes(term) ||
                a.rulesText?.toLowerCase().includes(term)
            );
        }

        setFilteredAbilities(filtered);
    };

    const toggleAbility = (abilityId) => {
        if (selectedAbilities.includes(abilityId)) {
            onChange(selectedAbilities.filter(id => id !== abilityId));
        } else {
            onChange([...selectedAbilities, abilityId]);
        }
    };

    if (loading) {
        return <LoadingSpinner text="Loading abilities..." />;
    }

    return (
        <div className="ability-selector">
            <div className="mb-3">
                <h5>Selected Abilities</h5>
                <div>
                    {selectedAbilities.length === 0 ? (
                        <p className="text-muted">No abilities selected</p>
                    ) : (
                        abilities
                            .filter(ability => selectedAbilities.includes(ability.id))
                            .map(ability => (
                                <Badge
                                    key={ability.id}
                                    bg={ReminderTypes.getBadgeColor(ability.timing)}
                                    className="me-2 mb-2 p-2"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => toggleAbility(ability.id)}
                                >
                                    {ability.name} ×
                                </Badge>
                            ))
                    )}
                </div>
            </div>

            <Form.Group className="mb-3">
                <Form.Control
                    type="text"
                    placeholder="Search abilities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Filter by Timing</Form.Label>
                <Form.Select
                    value={filterTiming}
                    onChange={(e) => setFilterTiming(e.target.value)}
                >
                    <option value="all">All Timings</option>
                    {ReminderTypes.getAllTypes().map(type => (
                        <option key={type} value={type}>
                            {ReminderTypes.getDisplayName(type)}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            {abilities.length === 0 ? (
                <Alert variant="info">
                    <p className="mb-2">You haven't created any abilities yet.</p>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => window.open('/abilities/create', '_blank')}
                    >
                        Create Ability
                    </Button>
                </Alert>
            ) : filteredAbilities.length === 0 ? (
                <Alert variant="warning">
                    <p className="mb-0">No abilities match your filters.</p>
                </Alert>
            ) : (
                <ListGroup className="ability-list">
                    {filteredAbilities.map(ability => (
                        <ListGroup.Item
                            key={ability.id}
                            action
                            active={selectedAbilities.includes(ability.id)}
                            onClick={() => toggleAbility(ability.id)}
                        >
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <div className="fw-bold">{ability.name}</div>
                                    <div className="small text-muted">{ability.description}</div>
                                    <Badge
                                        bg={ReminderTypes.getBadgeColor(ability.timing)}
                                        className="mt-1"
                                    >
                                        {ReminderTypes.getDisplayName(ability.timing)}
                                    </Badge>
                                </div>
                                <Button
                                    variant={selectedAbilities.includes(ability.id) ? "danger" : "primary"}
                                    size="sm"
                                >
                                    {selectedAbilities.includes(ability.id) ? "Remove" : "Add"}
                                </Button>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </div>
    );
};

export default AbilitySelector;