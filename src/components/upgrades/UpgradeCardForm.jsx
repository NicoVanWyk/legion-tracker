// src/components/upgrades/UpgradeCardForm.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Row, Col, ListGroup, Badge, Accordion } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, doc, addDoc, updateDoc, getDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import UpgradeCardTypes from '../../enums/UpgradeCardTypes';
import ReminderTypes from '../../enums/ReminderTypes';

const UpgradeCardForm = () => {
    const { upgradeId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        upgradeType: UpgradeCardTypes.GEAR,
        pointsCost: 0,
        description: '',
        effects: {
            modelCountChange: 0,
            addWeapons: [],
            addKeywords: [],
            addAbilities: [],
            statModifiers: {}
        },
        reminders: []
    });

    const [availableWeapons, setAvailableWeapons] = useState([]);
    const [availableKeywords, setAvailableKeywords] = useState([]);
    const [availableAbilities, setAvailableAbilities] = useState([]);

    const [newReminder, setNewReminder] = useState({
        text: '',
        reminderType: ReminderTypes.GENERAL,
        condition: ''
    });

    useEffect(() => {
        fetchUpgrade();
        fetchAvailableOptions();
    }, [upgradeId, currentUser]);

    const fetchUpgrade = async () => {
        if (!upgradeId || !currentUser) return;

        try {
            const upgradeRef = doc(db, 'users', currentUser.uid, 'upgradeCards', upgradeId);
            const upgradeDoc = await getDoc(upgradeRef);

            if (upgradeDoc.exists()) {
                const data = upgradeDoc.data();
                setFormData({
                    ...data,
                    effects: data.effects || {
                        modelCountChange: 0,
                        addWeapons: [],
                        addKeywords: [],
                        addAbilities: [],
                        statModifiers: {}
                    },
                    reminders: data.reminders || []
                });
            } else {
                setError('Upgrade card not found');
            }
        } catch (err) {
            console.error('Error fetching upgrade:', err);
            setError('Failed to load upgrade card');
        }
    };

    const fetchAvailableOptions = async () => {
        if (!currentUser) return;

        try {
            // Fetch user's custom keywords
            const keywordsRef = collection(db, 'users', currentUser.uid, 'customKeywords');
            const keywordsSnapshot = await getDocs(keywordsRef);
            const keywords = keywordsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAvailableKeywords(keywords);

            // Fetch user's abilities
            const abilitiesRef = collection(db, 'users', currentUser.uid, 'abilities');
            const abilitiesSnapshot = await getDocs(abilitiesRef);
            const abilities = abilitiesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAvailableAbilities(abilities);
        } catch (err) {
            console.error('Error fetching options:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    const handleEffectChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            effects: {
                ...prev.effects,
                [field]: value
            }
        }));
    };

    const handleStatModifierChange = (stat, value) => {
        setFormData(prev => ({
            ...prev,
            effects: {
                ...prev.effects,
                statModifiers: {
                    ...prev.effects.statModifiers,
                    [stat]: parseInt(value) || 0
                }
            }
        }));
    };

    const toggleKeyword = (keywordId) => {
        const keywords = formData.effects.addKeywords || [];
        if (keywords.includes(keywordId)) {
            handleEffectChange('addKeywords', keywords.filter(k => k !== keywordId));
        } else {
            handleEffectChange('addKeywords', [...keywords, keywordId]);
        }
    };

    const toggleAbility = (abilityId) => {
        const abilities = formData.effects.addAbilities || [];
        if (abilities.includes(abilityId)) {
            handleEffectChange('addAbilities', abilities.filter(a => a !== abilityId));
        } else {
            handleEffectChange('addAbilities', [...abilities, abilityId]);
        }
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
            setError('Upgrade name is required');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const upgradeData = {
                name: formData.name.trim(),
                upgradeType: formData.upgradeType,
                pointsCost: formData.pointsCost,
                description: formData.description.trim(),
                effects: formData.effects,
                reminders: formData.reminders,
                lastUpdated: serverTimestamp(),
                userId: currentUser.uid,
                isCustom: true
            };

            if (upgradeId) {
                await updateDoc(
                    doc(db, 'users', currentUser.uid, 'upgradeCards', upgradeId),
                    upgradeData
                );
                setSuccess('Upgrade card updated successfully!');
            } else {
                upgradeData.createdAt = serverTimestamp();
                await addDoc(
                    collection(db, 'users', currentUser.uid, 'upgradeCards'),
                    upgradeData
                );
                setSuccess('Upgrade card created successfully!');

                // Reset form
                setFormData({
                    name: '',
                    upgradeType: UpgradeCardTypes.GEAR,
                    pointsCost: 0,
                    description: '',
                    effects: {
                        modelCountChange: 0,
                        addWeapons: [],
                        addKeywords: [],
                        addAbilities: [],
                        statModifiers: {}
                    },
                    reminders: []
                });
            }

            setTimeout(() => {
                navigate('/upgrades');
            }, 1500);
        } catch (err) {
            console.error('Error saving upgrade:', err);
            setError('Failed to save upgrade card: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <Card.Header>
                <h3 className="mb-0">{upgradeId ? 'Edit' : 'Create'} Upgrade Card</h3>
            </Card.Header>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Upgrade Name*</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., Advanced Targeting Computer"
                                    required
                                />
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Upgrade Type*</Form.Label>
                                <Form.Select
                                    name="upgradeType"
                                    value={formData.upgradeType}
                                    onChange={handleChange}
                                    required
                                >
                                    {UpgradeCardTypes.getAllTypes().map(type => (
                                        <option key={type} value={type}>
                                            {UpgradeCardTypes.getDisplayName(type)}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Points Cost</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="pointsCost"
                                    value={formData.pointsCost}
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-4">
                        <Form.Label>Description*</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe what this upgrade does..."
                            rows={3}
                            required
                        />
                    </Form.Group>

                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">Upgrade Effects</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>Model Count Change</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={formData.effects.modelCountChange}
                                    onChange={(e) => handleEffectChange('modelCountChange', parseInt(e.target.value) || 0)}
                                    min="-10"
                                    max="10"
                                />
                                <Form.Text className="text-muted">
                                    Number of models added (positive) or removed (negative)
                                </Form.Text>
                            </Form.Group>

                            <Accordion className="mb-3">
                                <Accordion.Item eventKey="keywords">
                                    <Accordion.Header>
                                        Keywords ({formData.effects.addKeywords?.length || 0} selected)
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        {availableKeywords.length === 0 ? (
                                            <Alert variant="info">
                                                No custom keywords available. Create keywords first.
                                            </Alert>
                                        ) : (
                                            <ListGroup>
                                                {availableKeywords.map(keyword => (
                                                    <ListGroup.Item
                                                        key={keyword.id}
                                                        action
                                                        active={formData.effects.addKeywords?.includes(keyword.id)}
                                                        onClick={() => toggleKeyword(keyword.id)}
                                                    >
                                                        {keyword.name}
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        )}
                                    </Accordion.Body>
                                </Accordion.Item>

                                <Accordion.Item eventKey="abilities">
                                    <Accordion.Header>
                                        Abilities ({formData.effects.addAbilities?.length || 0} selected)
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        {availableAbilities.length === 0 ? (
                                            <Alert variant="info">
                                                No abilities available. Create abilities first.
                                            </Alert>
                                        ) : (
                                            <ListGroup>
                                                {availableAbilities.map(ability => (
                                                    <ListGroup.Item
                                                        key={ability.id}
                                                        action
                                                        active={formData.effects.addAbilities?.includes(ability.id)}
                                                        onClick={() => toggleAbility(ability.id)}
                                                    >
                                                        <div className="fw-bold">{ability.name}</div>
                                                        <div className="small text-muted">{ability.description}</div>
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        )}
                                    </Accordion.Body>
                                </Accordion.Item>

                                <Accordion.Item eventKey="stats">
                                    <Accordion.Header>Stat Modifiers</Accordion.Header>
                                    <Accordion.Body>
                                        <Row>
                                            <Col md={4}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label>Wounds</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        value={formData.effects.statModifiers.wounds || 0}
                                                        onChange={(e) => handleStatModifierChange('wounds', e.target.value)}
                                                        min="-10"
                                                        max="10"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label>Courage</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        value={formData.effects.statModifiers.courage || 0}
                                                        onChange={(e) => handleStatModifierChange('courage', e.target.value)}
                                                        min="-5"
                                                        max="5"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label>Speed</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        value={formData.effects.statModifiers.speed || 0}
                                                        onChange={(e) => handleStatModifierChange('speed', e.target.value)}
                                                        min="-3"
                                                        max="3"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </Card.Body>
                    </Card>

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
                            onClick={() => navigate('/upgrades')}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? 'Saving...' : (upgradeId ? 'Update' : 'Create') + ' Upgrade Card'}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default UpgradeCardForm;