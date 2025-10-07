// src/components/abilities/AbilityForm.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Row, Col, ListGroup, Badge } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, doc, addDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import ReminderTypes from '../../enums/ReminderTypes';

const AbilityForm = () => {
    const { abilityId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        rulesText: '',
        timing: ReminderTypes.GENERAL,
        reminders: []
    });

    const [newReminder, setNewReminder] = useState({
        text: '',
        reminderType: ReminderTypes.GENERAL,
        condition: ''
    });

    useEffect(() => {
        const fetchAbility = async () => {
            if (!abilityId || !currentUser) return;

            try {
                const abilityRef = doc(db, 'users', currentUser.uid, 'abilities', abilityId);
                const abilityDoc = await getDoc(abilityRef);

                if (abilityDoc.exists()) {
                    setFormData({
                        ...abilityDoc.data(),
                        reminders: abilityDoc.data().reminders || []
                    });
                } else {
                    setError('Ability not found');
                }
            } catch (err) {
                console.error('Error fetching ability:', err);
                setError('Failed to load ability');
            }
        };

        fetchAbility();
    }, [abilityId, currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleReminderChange = (e) => {
        const { name, value } = e.target;
        setNewReminder(prev => ({ ...prev, [name]: value }));
    };

    const addReminder = () => {
        if (!newReminder.text.trim()) {
            setError('Reminder text is required');
            return;
        }

        setFormData(prev => ({
            ...prev,
            reminders: [...prev.reminders, { ...newReminder }]
        }));

        setNewReminder({
            text: '',
            reminderType: ReminderTypes.GENERAL,
            condition: ''
        });
        setError('');
    };

    const removeReminder = (index) => {
        setFormData(prev => ({
            ...prev,
            reminders: prev.reminders.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError('Ability name is required');
            return;
        }

        if (!formData.description.trim()) {
            setError('Description is required');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const abilityData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                rulesText: formData.rulesText.trim(),
                timing: formData.timing,
                reminders: formData.reminders,
                lastUpdated: serverTimestamp(),
                userId: currentUser.uid,
                isCustom: true
            };

            if (abilityId) {
                await updateDoc(
                    doc(db, 'users', currentUser.uid, 'abilities', abilityId),
                    abilityData
                );
                setSuccess('Ability updated successfully!');
            } else {
                abilityData.createdAt = serverTimestamp();
                await addDoc(
                    collection(db, 'users', currentUser.uid, 'abilities'),
                    abilityData
                );
                setSuccess('Ability created successfully!');

                // Reset form
                setFormData({
                    name: '',
                    description: '',
                    rulesText: '',
                    timing: ReminderTypes.GENERAL,
                    reminders: []
                });
            }

            setTimeout(() => {
                navigate('/abilities');
            }, 1500);
        } catch (err) {
            console.error('Error saving ability:', err);
            setError('Failed to save ability: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <Card.Header>
                <h3 className="mb-0">{abilityId ? 'Edit' : 'Create'} Ability</h3>
            </Card.Header>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Ability Name*</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., Tactical Superiority"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Description*</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Brief description of the ability..."
                            rows={2}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Rules Text*</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="rulesText"
                            value={formData.rulesText}
                            onChange={handleChange}
                            placeholder="Detailed rules for how this ability works..."
                            rows={4}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label>Primary Timing</Form.Label>
                        <Form.Select
                            name="timing"
                            value={formData.timing}
                            onChange={handleChange}
                        >
                            {ReminderTypes.getAllTypes().map(type => (
                                <option key={type} value={type}>
                                    {ReminderTypes.getDisplayName(type)}
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Text className="text-muted">
                            When this ability is primarily used
                        </Form.Text>
                    </Form.Group>

                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">Reminders</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row className="mb-3">
                                <Col md={12}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Reminder Text</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            name="text"
                                            value={newReminder.text}
                                            onChange={handleReminderChange}
                                            placeholder="What should the player be reminded about?"
                                            rows={2}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Reminder Type</Form.Label>
                                        <Form.Select
                                            name="reminderType"
                                            value={newReminder.reminderType}
                                            onChange={handleReminderChange}
                                        >
                                            {ReminderTypes.getAllTypes().map(type => (
                                                <option key={type} value={type}>
                                                    {ReminderTypes.getDisplayName(type)}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Condition (Optional)</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="condition"
                                            value={newReminder.condition}
                                            onChange={handleReminderChange}
                                            placeholder="e.g., When attacking"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Button variant="outline-primary" onClick={addReminder}>
                                Add Reminder
                            </Button>

                            {formData.reminders.length > 0 && (
                                <ListGroup className="mt-3">
                                    {formData.reminders.map((reminder, index) => (
                                        <ListGroup.Item key={index}>
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <div className="mb-1">{reminder.text}</div>
                                                    <Badge bg={ReminderTypes.getBadgeColor(reminder.reminderType)}>
                                                        {ReminderTypes.getDisplayName(reminder.reminderType)}
                                                    </Badge>
                                                    {reminder.condition && (
                                                        <span className="ms-2 text-muted small">
                              Condition: {reminder.condition}
                            </span>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => removeReminder(index)}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </Card.Body>
                    </Card>

                    <div className="d-flex justify-content-between">
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/abilities')}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? 'Saving...' : (abilityId ? 'Update' : 'Create') + ' Ability'}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default AbilityForm;