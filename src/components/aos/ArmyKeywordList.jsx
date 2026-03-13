// src/components/aos/ArmyKeywordForm.jsx - AOS ONLY
import React, {useState, useEffect, useCallback} from 'react';
import {Form, Button, Card, Alert, Row, Col, Badge} from 'react-bootstrap';
import {useNavigate, useParams} from 'react-router-dom';
import {collection, doc, addDoc, updateDoc, getDoc, serverTimestamp} from 'firebase/firestore';
import {db} from '../../firebase/config';
import {useAuth} from '../../contexts/AuthContext';
import {useGameSystem} from '../../contexts/GameSystemContext';
import AoSFactions from '../../enums/aos/AoSFactions';
import GameSystems from '../../enums/GameSystems';

const ArmyKeywordForm = () => {
    const {keywordId} = useParams();
    const navigate = useNavigate();
    const {currentUser} = useAuth();
    const {currentSystem} = useGameSystem();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        keywordType: 'battle_trait',
        faction: '',
        description: '',
        effectText: '',
        isUniversal: false
    });

    const fetchKeyword = useCallback(async () => {
        if (!keywordId || !currentUser || currentSystem !== GameSystems.AOS) return;

        try {
            setLoading(true);
            const keywordRef = doc(db, 'users', currentUser.uid, 'armyKeywords', keywordId);
            const keywordDoc = await getDoc(keywordRef);

            if (keywordDoc.exists()) {
                const data = keywordDoc.data();

                if (data.gameSystem && data.gameSystem !== GameSystems.AOS) {
                    setError(`This keyword belongs to ${data.gameSystem}. Switch to that system to edit it.`);
                    return;
                }

                setFormData({
                    name: data.name || '',
                    keywordType: data.keywordType || 'battle_trait',
                    faction: data.faction || '',
                    description: data.description || '',
                    effectText: data.effectText || '',
                    isUniversal: data.isUniversal || false
                });
            } else {
                setError('Army keyword not found');
            }
        } catch (err) {
            console.error('Error fetching army keyword:', err);
            setError('Failed to load army keyword: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, [keywordId, currentUser, currentSystem]);

    useEffect(() => {
        fetchKeyword();
    }, [fetchKeyword]);

    // System check
    if (currentSystem !== GameSystems.AOS) {
        return (
            <Alert variant="info">
                <h4 className="mb-3">Army Keywords are only available for Age of Sigmar</h4>
                <p>You are currently viewing {currentSystem}. Army keywords are an AOS-specific game mechanic.</p>
                <div className="mt-3">
                    <Button onClick={() => navigate('/army-keywords')} variant="secondary">
                        Back
                    </Button>
                </div>
            </Alert>
        );
    }

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            setError('You must be logged in to create army keywords');
            return;
        }

        if (!formData.name.trim()) {
            setError('Name is required');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const keywordData = {
                name: formData.name.trim(),
                keywordType: formData.keywordType,
                faction: formData.faction,
                description: formData.description.trim(),
                effectText: formData.effectText.trim(),
                isUniversal: formData.isUniversal,
                gameSystem: GameSystems.AOS,
                lastUpdated: serverTimestamp(),
                userId: currentUser.uid
            };

            if (keywordId) {
                await updateDoc(
                    doc(db, 'users', currentUser.uid, 'armyKeywords', keywordId),
                    keywordData
                );
                setSuccess('Army keyword updated successfully!');
            } else {
                keywordData.createdAt = serverTimestamp();
                await addDoc(
                    collection(db, 'users', currentUser.uid, 'armyKeywords'),
                    keywordData
                );
                setSuccess('Army keyword created successfully!');

                setFormData({
                    name: '',
                    keywordType: 'battle_trait',
                    faction: '',
                    description: '',
                    effectText: '',
                    isUniversal: false
                });
            }

            setTimeout(() => {
                navigate('/army-keywords');
            }, 1500);
        } catch (err) {
            console.error('Error saving army keyword:', err);
            setError('Failed to save army keyword: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <Card.Header>
                <h3 className="mb-0">{keywordId ? 'Edit' : 'Create'} Army Keyword</h3>
            </Card.Header>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={8}>
                            <Form.Group className="mb-3">
                                <Form.Label>Keyword Name*</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter keyword name"
                                    required
                                />
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Keyword Type*</Form.Label>
                                <Form.Select
                                    name="keywordType"
                                    value={formData.keywordType}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="battle_trait">Battle Trait</option>
                                    <option value="enhancement">Enhancement</option>
                                    <option value="spell_lore">Spell Lore</option>
                                    <option value="prayer">Prayer</option>
                                    <option value="other">Other</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Faction</Form.Label>
                        <Form.Select
                            name="faction"
                            value={formData.faction}
                            onChange={handleChange}
                        >
                            <option value="">Universal (All Factions)</option>
                            {Object.values(AoSFactions).filter(f => typeof f === 'string').map(faction => (
                                <option key={faction} value={faction}>
                                    {AoSFactions.getDisplayName(faction)}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

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
                            If checked, this keyword can be used by any army of the selected faction.
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Brief description of the keyword"
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
                            placeholder="Detailed rules text for the keyword's effect"
                            rows={4}
                        />
                    </Form.Group>

                    <div className="mb-4">
                        <h5>Keyword Preview</h5>
                        <Card className="keyword-preview">
                            <Card.Header>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">{formData.name || 'Keyword Name'}</h5>
                                    <Badge bg="info">
                                        {formData.keywordType.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <div className="mb-2">
                                    {formData.faction ? (
                                        <Badge bg="primary">{AoSFactions.getDisplayName(formData.faction)}</Badge>
                                    ) : (
                                        <Badge bg="secondary">Universal</Badge>
                                    )}

                                    {formData.isUniversal && (
                                        <Badge bg="success" className="ms-2">All Armies</Badge>
                                    )}
                                </div>

                                <p className="small text-muted">{formData.description || 'Description will appear here'}</p>
                                <hr/>
                                <p>{formData.effectText || 'Effect text will appear here'}</p>
                            </Card.Body>
                        </Card>
                    </div>

                    <div className="d-flex justify-content-between">
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/army-keywords')}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : (keywordId ? 'Update' : 'Create') + ' Army Keyword'}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default ArmyKeywordForm;