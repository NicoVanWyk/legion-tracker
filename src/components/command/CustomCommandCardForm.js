// src/components/command/CustomCommandCardForm.js
import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Row, Col, Badge } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, doc, addDoc, updateDoc, getDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import Factions from '../../enums/Factions';

const CustomCommandCardForm = () => {
    const { cardId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [commanders, setCommanders] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        pips: 1,
        faction: '',  // Empty string means universal
        description: '',
        effectText: '',
        commander: '',  // Empty string means no specific commander required
        isUniversal: false,  // Indicates if the card is available to all armies of the faction
        imageUrl: ''
    });

    // Fetch card data if editing
    useEffect(() => {
        if (cardId && currentUser) {
            fetchCommandCard();
        }

        // Fetch commanders for the dropdown
        fetchCommanders();
    }, [cardId, currentUser]);

    // Fetch existing command card data
    const fetchCommandCard = async () => {
        try {
            setLoading(true);
            const cardRef = doc(db, 'users', currentUser.uid, 'commandCards', cardId);
            const cardDoc = await getDoc(cardRef);

            if (cardDoc.exists()) {
                const data = cardDoc.data();
                setFormData({
                    name: data.name || '',
                    pips: data.pips || 1,
                    faction: data.faction || '',
                    description: data.description || '',
                    effectText: data.effectText || '',
                    commander: data.commander || '',
                    isUniversal: data.isUniversal || false,
                    imageUrl: data.imageUrl || ''
                });
            } else {
                setError('Command card not found');
            }
        } catch (err) {
            console.error('Error fetching command card:', err);
            setError('Failed to load command card: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch commander units for the dropdown
    const fetchCommanders = async () => {
        try {
            const unitsRef = collection(db, 'users', currentUser.uid, 'units');
            const unitsSnapshot = await getDocs(unitsRef);

            // Filter for units that can be commanders (for simplicity, all Command and Operative types)
            const commanderUnits = unitsSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(unit => unit.type === 'COMMAND' || unit.type === 'OPERATIVE');

            setCommanders(commanderUnits);
        } catch (err) {
            console.error('Error fetching commanders:', err);
        }
    };

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            setError('You must be logged in to create command cards');
            return;
        }

        if (!formData.name.trim()) {
            setError('Name is required');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const cardData = {
                name: formData.name.trim(),
                pips: parseInt(formData.pips),
                faction: formData.faction,
                description: formData.description.trim(),
                effectText: formData.effectText.trim(),
                commander: formData.commander,
                isUniversal: formData.isUniversal,
                imageUrl: formData.imageUrl.trim(),
                isSystem: false,  // Custom cards are never system cards
                lastUpdated: serverTimestamp(),
                userId: currentUser.uid
            };

            if (cardId) {
                // Update existing card
                await updateDoc(
                    doc(db, 'users', currentUser.uid, 'commandCards', cardId),
                    cardData
                );
                setSuccess('Command card updated successfully!');
            } else {
                // Create new card
                cardData.createdAt = serverTimestamp();
                await addDoc(
                    collection(db, 'users', currentUser.uid, 'commandCards'),
                    cardData
                );
                setSuccess('Command card created successfully!');

                // Reset form
                setFormData({
                    name: '',
                    pips: 1,
                    faction: '',
                    description: '',
                    effectText: '',
                    commander: '',
                    isUniversal: false,
                    imageUrl: ''
                });
            }

            // Navigate back to command cards list after a short delay
            setTimeout(() => {
                navigate('/command-cards');
            }, 1500);
        } catch (err) {
            console.error('Error saving command card:', err);
            setError('Failed to save command card: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <Card.Header>
                <h3 className="mb-0">{cardId ? 'Edit' : 'Create'} Custom Command Card</h3>
            </Card.Header>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={8}>
                            <Form.Group className="mb-3">
                                <Form.Label>Card Name*</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter command card name"
                                    required
                                />
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Pips (Priority)*</Form.Label>
                                <Form.Select
                                    name="pips"
                                    value={formData.pips}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value={1}>1 Pip (High Priority)</option>
                                    <option value={2}>2 Pips (Medium Priority)</option>
                                    <option value={3}>3 Pips (Low Priority)</option>
                                    <option value={4}>4 Pips (Lowest Priority)</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Faction</Form.Label>
                                <Form.Select
                                    name="faction"
                                    value={formData.faction}
                                    onChange={handleChange}
                                >
                                    <option value="">Universal (All Factions)</option>
                                    <option value={Factions.REPUBLIC}>{Factions.getDisplayName(Factions.REPUBLIC)}</option>
                                    <option value={Factions.SEPARATIST}>{Factions.getDisplayName(Factions.SEPARATIST)}</option>
                                    <option value={Factions.REBEL}>{Factions.getDisplayName(Factions.REBEL)}</option>
                                    <option value={Factions.EMPIRE}>{Factions.getDisplayName(Factions.EMPIRE)}</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Commander Requirement</Form.Label>
                                <Form.Select
                                    name="commander"
                                    value={formData.commander}
                                    onChange={handleChange}
                                >
                                    <option value="">No Specific Commander Required</option>
                                    {commanders.map(commander => (
                                        <option key={commander.id} value={commander.name}>
                                            {commander.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Check
                            type="checkbox"
                            id="isUniversal"
                            label="Available to all armies of the selected faction"
                            name="isUniversal"
                            checked={formData.isUniversal}
                            onChange={handleChange}
                        />
                        <Form.Text className="text-muted">
                            If checked, this card can be used by any army of the selected faction. If unchecked, you'll need to assign it to specific armies.
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Card Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Brief description of the command card"
                            rows={2}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Effect Text</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="effectText"
                            value={formData.effectText}
                            onChange={handleChange}
                            placeholder="Detailed rules text for the card's effect"
                            rows={3}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Image URL (Optional)</Form.Label>
                        <Form.Control
                            type="text"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            placeholder="Enter URL for card image"
                        />
                        <Form.Text className="text-muted">
                            Provide a URL to an image for this command card. Leave blank to use a generated card.
                        </Form.Text>
                    </Form.Group>

                    <div className="mb-4">
                        <h5>Card Preview</h5>
                        <Card className="command-card-preview">
                            <Card.Header>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">{formData.name || 'Card Name'}</h5>
                                    <div className="pips">
                                        {[...Array(formData.pips)].map((_, i) => (
                                            <i key={i} className="bi bi-circle-fill me-1"></i>
                                        ))}
                                    </div>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <div className="mb-2">
                                    {formData.faction ? (
                                        <Badge bg="primary">{Factions.getDisplayName(formData.faction)}</Badge>
                                    ) : (
                                        <Badge bg="secondary">Universal</Badge>
                                    )}

                                    {formData.commander && (
                                        <Badge bg="info" className="ms-2">{formData.commander}</Badge>
                                    )}

                                    {formData.isUniversal && (
                                        <Badge bg="success" className="ms-2">All Armies</Badge>
                                    )}
                                </div>

                                <p className="small text-muted">{formData.description || 'Card description will appear here'}</p>
                                <hr />
                                <p>{formData.effectText || 'Card effect text will appear here'}</p>
                            </Card.Body>
                        </Card>
                    </div>

                    <div className="d-flex justify-content-between">
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/command-cards')}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : (cardId ? 'Update' : 'Create') + ' Command Card'}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default CustomCommandCardForm;