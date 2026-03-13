// src/components/abilities/AbilityForm.jsx
import React, {useState, useEffect} from 'react';
import {Form, Button, Card, Alert, Row, Col, ListGroup, Badge} from 'react-bootstrap';
import {useNavigate, useParams} from 'react-router-dom';
import {collection, doc, addDoc, updateDoc, getDoc, serverTimestamp} from 'firebase/firestore';
import {db} from '../../firebase/config';
import {useAuth} from '../../contexts/AuthContext';
import ReminderTypes from '../../enums/ReminderTypes';
import {useGameSystem} from '../../contexts/GameSystemContext';
import GameSystems from '../../enums/GameSystems';
import AoSAbilityKeywords from '../../enums/aos/AoSAbilityKeywords';
import AoSPhases from '../../enums/aos/AoSPhases';
import AoSAbilityFrequency from '../../enums/aos/AoSAbilityFrequency';

const AbilityForm = () => {
    const {currentSystem} = useGameSystem();
    const {abilityId} = useParams();
    const navigate = useNavigate();
    const {currentUser} = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const isAoS = currentSystem === GameSystems.AOS;
    const isLegion = currentSystem === GameSystems.LEGION;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        rulesText: '',
        timing: ReminderTypes.GENERAL,
        reminders: [],
        // AoS specific
        abilityKeywords: [],
        phase: AoSPhases.ANY,
        frequency: AoSAbilityFrequency.UNLIMITED,
        declareText: '',
        effectText: ''
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
                    const data = abilityDoc.data();

                    if (data.gameSystem && data.gameSystem !== currentSystem) {
                        setError(`This ability belongs to ${data.gameSystem}. Switch to that system to edit it.`);
                        return;
                    }

                    setFormData({
                        name: data.name || '',
                        description: data.description || '',
                        rulesText: data.rulesText || '',
                        timing: data.timing || ReminderTypes.GENERAL,
                        reminders: data.reminders || [],
                        abilityKeywords: data.abilityKeywords || [],
                        phase: data.phase || AoSPhases.ANY,
                        frequency: data.frequency || AoSAbilityFrequency.UNLIMITED,
                        declareText: data.declareText || '',
                        effectText: data.effectText || ''
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
    }, [abilityId, currentUser, currentSystem]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleReminderChange = (e) => {
        const {name, value} = e.target;
        setNewReminder(prev => ({...prev, [name]: value}));
    };

    const addReminder = () => {
        if (!newReminder.text.trim()) {
            setError('Reminder text is required');
            return;
        }

        setFormData(prev => ({
            ...prev,
            reminders: [...prev.reminders, {...newReminder}]
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
                gameSystem: currentSystem,
                lastUpdated: serverTimestamp(),
                userId: currentUser.uid,
                isCustom: true
            };

            // Add AoS-specific fields
            if (isAoS) {
                abilityData.abilityKeywords = formData.abilityKeywords;
                abilityData.phase = formData.phase;
                abilityData.frequency = formData.frequency;
                abilityData.declareText = formData.declareText.trim();
                abilityData.effectText = formData.effectText.trim();
            }

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

                setFormData({
                    name: '',
                    description: '',
                    rulesText: '',
                    timing: ReminderTypes.GENERAL,
                    reminders: [],
                    abilityKeywords: [],
                    phase: AoSPhases.ANY,
                    frequency: AoSAbilityFrequency.UNLIMITED,
                    declareText: '',
                    effectText: ''
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
                            placeholder={isAoS ? "e.g., Scions of the Storm" : "e.g., Tactical Superiority"}
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

                    {isAoS && (
                        <>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Phase</Form.Label>
                                        <Form.Select
                                            name="phase"
                                            value={formData.phase}
                                            onChange={handleChange}
                                        >
                                            {Object.values(AoSPhases).filter(p => typeof p === 'string').map(phase => (
                                                <option key={phase} value={phase}>
                                                    {AoSPhases.getDisplayName(phase)}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        <Form.Text className="text-muted">
                                            When this ability can be used
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Frequency</Form.Label>
                                        <Form.Select
                                            name="frequency"
                                            value={formData.frequency}
                                            onChange={handleChange}
                                        >
                                            {Object.values(AoSAbilityFrequency).filter(f => typeof f === 'string').map(freq => (
                                                <option key={freq} value={freq}>
                                                    {AoSAbilityFrequency.getDisplayName(freq)}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        <Form.Text className="text-muted">
                                            How often this ability can be used
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Ability Keywords</Form.Label>
                                <div className="d-flex flex-wrap gap-2">
                                    {Object.values(AoSAbilityKeywords).filter(k => typeof k === 'string').map(keyword => (
                                        <Form.Check
                                            key={keyword}
                                            type="checkbox"
                                            id={`keyword-${keyword}`}
                                            label={AoSAbilityKeywords.getDisplayName(keyword)}
                                            checked={formData.abilityKeywords?.includes(keyword)}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    abilityKeywords: checked
                                                        ? [...(prev.abilityKeywords || []), keyword]
                                                        : (prev.abilityKeywords || []).filter(k => k !== keyword)
                                                }));
                                            }}
                                        />
                                    ))}
                                </div>
                                <Form.Text className="text-muted">
                                    Select all keywords that apply to this ability
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Declare</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="declareText"
                                    value={formData.declareText}
                                    onChange={handleChange}
                                    placeholder="Declare: Pick a friendly unit..."
                                    rows={2}
                                />
                                <Form.Text className="text-muted">
                                    What you declare when using this ability (optional)
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Effect</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="effectText"
                                    value={formData.effectText}
                                    onChange={handleChange}
                                    placeholder="Effect: That unit can..."
                                    rows={3}
                                />
                                <Form.Text className="text-muted">
                                    What happens when the ability is used (optional)
                                </Form.Text>
                            </Form.Group>
                        </>
                    )}

                    {isLegion && (
                        <>
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
                        </>
                    )}

                    {/* Combined rules text for AoS - optional fallback */}
                    {isAoS && (
                        <Form.Group className="mb-3">
                            <Form.Label>Additional Rules Text (Optional)</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="rulesText"
                                value={formData.rulesText}
                                onChange={handleChange}
                                placeholder="Any additional rules or clarifications..."
                                rows={2}
                            />
                        </Form.Group>
                    )}

                    {isLegion && (
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
                    )}

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