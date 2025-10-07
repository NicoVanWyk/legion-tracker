// src/components/abilities/AbilityList.jsx
import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Button, Badge, Alert, Row, Col, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import ReminderTypes from '../../enums/ReminderTypes';
import LoadingSpinner from '../layout/LoadingSpinner';

const AbilityList = () => {
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

    const handleDelete = async (abilityId) => {
        if (!window.confirm('Are you sure you want to delete this ability? Units using this ability will no longer have access to it.')) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'abilities', abilityId));
            fetchAbilities();
        } catch (err) {
            console.error('Error deleting ability:', err);
            setError('Failed to delete ability');
        }
    };

    if (loading) {
        return <LoadingSpinner text="Loading abilities..." />;
    }

    return (
        <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Abilities</h4>
                <Button as={Link} to="/abilities/create" variant="primary">
                    Create Ability
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
                                placeholder="Search abilities..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
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
                    </Col>
                </Row>

                {abilities.length === 0 ? (
                    <Alert variant="info" className="text-center">
                        <p className="mb-3">You haven't created any abilities yet.</p>
                        <Button as={Link} to="/abilities/create" variant="primary">
                            Create Your First Ability
                        </Button>
                    </Alert>
                ) : filteredAbilities.length === 0 ? (
                    <Alert variant="warning" className="text-center">
                        <p className="mb-0">No abilities match your filters.</p>
                    </Alert>
                ) : (
                    <ListGroup>
                        {filteredAbilities.map(ability => (
                            <ListGroup.Item key={ability.id}>
                                <div className="d-flex justify-content-between align-items-start">
                                    <div className="flex-grow-1">
                                        <h5 className="mb-2">
                                            {ability.name}
                                            <Badge
                                                bg={ReminderTypes.getBadgeColor(ability.timing)}
                                                className="ms-2"
                                            >
                                                {ReminderTypes.getDisplayName(ability.timing)}
                                            </Badge>
                                        </h5>
                                        <p className="mb-2 text-muted">{ability.description}</p>
                                        {ability.rulesText && (
                                            <div className="small mb-2" style={{ whiteSpace: 'pre-line' }}>
                                                {ability.rulesText}
                                            </div>
                                        )}
                                        {ability.reminders && ability.reminders.length > 0 && (
                                            <div className="mt-2">
                                                <strong className="small">Reminders:</strong>
                                                {ability.reminders.map((reminder, idx) => (
                                                    <Badge
                                                        key={idx}
                                                        bg={ReminderTypes.getBadgeColor(reminder.reminderType)}
                                                        className="ms-2 mb-1"
                                                    >
                                                        {ReminderTypes.getDisplayName(reminder.reminderType)}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="ms-3 text-nowrap">
                                        <Button
                                            as={Link}
                                            to={`/abilities/edit/${ability.id}`}
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2"
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDelete(ability.id)}
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

export default AbilityList;