import React, {useState, useEffect, useCallback} from 'react';
import {Form, Button, Card, Alert, Row, Col} from 'react-bootstrap';
import {useNavigate, useParams} from 'react-router-dom';
import {collection, doc, addDoc, updateDoc, getDoc, serverTimestamp} from 'firebase/firestore';
import {db} from '../../firebase/config';
import {useAuth} from '../../contexts/AuthContext';
import {useGameSystem} from '../../contexts/GameSystemContext';
import AoSFactions from '../../enums/aos/AoSFactions';
import AoSContentTypes from '../../enums/aos/AoSContentTypes';
import GameSystems from '../../enums/GameSystems';
import AoSKeywords from '../../enums/aos/AoSKeywords';
import AoSAbilityFrequency from '../../enums/aos/AoSAbilityFrequency';
import ArmyContentKeywordSelector from './ArmyContentKeywordSelector';
import AoSPhases from '../../enums/aos/AoSPhases';
import SpellLoreSection from './SpellLoreSection';
import PrayerLoreSection from './PrayerLoreSection';
import ManifestationLoreSection from './ManifestationLoreSection';

const ArmyContentForm = () => {
    const {contentId} = useParams();
    const navigate = useNavigate();
    const {currentUser} = useAuth();
    const {currentSystem} = useGameSystem();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        contentType: AoSContentTypes.BATTLE_TRAIT,
        faction: '',
        description: '',
        effectText: '',
        restrictions: [],
        pointsCost: 0,
        phase: AoSPhases.PASSIVE,
        frequency: AoSAbilityFrequency.UNLIMITED,
        keywords: [],
        spells: [],
        prayers: [],
        manifestations: [],
        formationRequirements: '',
        commandValue: 1
    });

    const fetchContent = useCallback(async () => {
        if (!contentId || !currentUser || currentSystem !== GameSystems.AOS) return;

        try {
            setLoading(true);
            const contentRef = doc(db, 'users', currentUser.uid, 'armyContent', contentId);
            const contentDoc = await getDoc(contentRef);

            if (contentDoc.exists()) {
                const data = contentDoc.data();
                setFormData({
                    name: data.name || '',
                    contentType: data.contentType || AoSContentTypes.BATTLE_TRAIT,
                    faction: data.faction || '',
                    description: data.description || '',
                    effectText: data.effectText || '',
                    restrictions: data.restrictions || [],
                    pointsCost: data.pointsCost || 0,
                    phase: data.phase || AoSPhases.PASSIVE,
                    frequency: data.frequency || AoSAbilityFrequency.UNLIMITED,
                    keywords: data.keywords || [],
                    spells: data.spells || [],
                    prayers: data.prayers || [],
                    manifestations: data.manifestations || [],
                    formationRequirements: data.formationRequirements || '',
                    commandValue: data.commandValue || 1
                });
            }
        } catch (err) {
            console.error('Error fetching content:', err);
            setError('Failed to load content');
        } finally {
            setLoading(false);
        }
    }, [contentId, currentUser, currentSystem]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    if (currentSystem !== GameSystems.AOS) {
        return (
            <Alert variant="info">
                <h4>Army Content is only available for Age of Sigmar</h4>
                <Button onClick={() => navigate('/')} variant="secondary">Back</Button>
            </Alert>
        );
    }

    const handleChange = (e) => {
        const {name, value, type} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    const handleRestrictionToggle = (restriction) => {
        setFormData(prev => ({
            ...prev,
            restrictions: prev.restrictions.includes(restriction)
                ? prev.restrictions.filter(r => r !== restriction)
                : [...prev.restrictions, restriction]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            setError('You must be logged in');
            return;
        }

        if (!formData.name.trim()) {
            setError('Name is required');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const contentData = {
                name: formData.name.trim(),
                contentType: formData.contentType,
                faction: formData.faction,
                gameSystem: GameSystems.AOS,
                lastUpdated: serverTimestamp(),
                userId: currentUser.uid
            };

            // Only add description/effectText for non-lore types
            if (formData.contentType !== AoSContentTypes.SPELL_LORE &&
                formData.contentType !== AoSContentTypes.PRAYER_LORE &&
                formData.contentType !== AoSContentTypes.MANIFESTATION) {
                contentData.description = formData.description.trim();
                contentData.effectText = formData.effectText.trim();
            }

            // Add phase/frequency/keywords for all types (optional)
            contentData.phase = formData.phase;
            contentData.keywords = formData.keywords;
            contentData.frequency = formData.frequency;

            // Only add restrictions for non-lore types
            if (formData.contentType !== AoSContentTypes.SPELL_LORE &&
                formData.contentType !== AoSContentTypes.PRAYER_LORE &&
                formData.contentType !== AoSContentTypes.MANIFESTATION) {
                contentData.restrictions = formData.restrictions;
            }

            // Add type-specific fields
            if (formData.contentType === AoSContentTypes.SPELL_LORE) {
                contentData.spells = formData.spells;
            } else if (formData.contentType === AoSContentTypes.PRAYER_LORE) {
                contentData.prayers = formData.prayers;
            } else if (formData.contentType === AoSContentTypes.MANIFESTATION) {
                contentData.manifestations = formData.manifestations;
            } else if (formData.contentType === AoSContentTypes.BATTLE_FORMATION) {
                contentData.formationRequirements = formData.formationRequirements;
            } else if (formData.contentType === AoSContentTypes.COMMAND) {
                contentData.commandValue = formData.commandValue;
            }

            if (contentId) {
                await updateDoc(
                    doc(db, 'users', currentUser.uid, 'armyContent', contentId),
                    contentData
                );
                setSuccess('Content updated successfully!');
            } else {
                contentData.createdAt = serverTimestamp();
                await addDoc(
                    collection(db, 'users', currentUser.uid, 'armyContent'),
                    contentData
                );
                setSuccess('Content created successfully!');

                // Reset form
                setFormData({
                    name: '',
                    contentType: AoSContentTypes.BATTLE_TRAIT,
                    faction: '',
                    description: '',
                    effectText: '',
                    restrictions: [],
                    pointsCost: 0,
                    phase: AoSPhases.PASSIVE,
                    frequency: AoSAbilityFrequency.UNLIMITED,
                    keywords: [],
                    spells: [],
                    prayers: [],
                    manifestations: [],
                    manifestationType: 'ENDLESS_SPELL',
                    formationRequirements: '',
                    commandValue: 1
                });
            }

            setTimeout(() => {
                navigate('/army-content');
            }, 1500);
        } catch (err) {
            console.error('Error saving content:', err);
            setError('Failed to save: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderPhaseAndKeywords = () => (
        <>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Phase</Form.Label>
                        <Form.Select name="phase" value={formData.phase} onChange={handleChange}>
                            {Object.values(AoSPhases).filter(p => typeof p === 'string').map(phase => (
                                <option key={phase} value={phase}>{AoSPhases.getDisplayName(phase)}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Frequency</Form.Label>
                        <Form.Select name="frequency" value={formData.frequency} onChange={handleChange}>
                            {Object.values(AoSAbilityFrequency).filter(f => typeof f === 'string').map(freq => (
                                <option key={freq} value={freq}>{AoSAbilityFrequency.getDisplayName(freq)}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>
            <Form.Group className="mb-3">
                <Form.Label>Keywords</Form.Label>
                <ArmyContentKeywordSelector
                    selected={formData.keywords}
                    onChange={(kw) => setFormData(prev => ({...prev, keywords: kw}))}
                />
            </Form.Group>
        </>
    );

    const renderTypeSpecificFields = () => {
        switch (formData.contentType) {
            case AoSContentTypes.BATTLE_TRAIT:
            case AoSContentTypes.HEROIC_TRAIT:
                return renderPhaseAndKeywords();

            case AoSContentTypes.SPELL_LORE:
                return (
                    <SpellLoreSection
                        spells={formData.spells}
                        onUpdate={(spells) => setFormData(prev => ({...prev, spells}))}
                    />
                );

            case AoSContentTypes.PRAYER_LORE:
                return (
                    <PrayerLoreSection
                        prayers={formData.prayers}
                        onUpdate={(prayers) => setFormData(prev => ({...prev, prayers}))}
                    />
                );

            case AoSContentTypes.MANIFESTATION:
                return (
                    <ManifestationLoreSection
                        manifestations={formData.manifestations}
                        onUpdate={(manifestations) => setFormData(prev => ({...prev, manifestations}))}
                    />
                );

            case AoSContentTypes.BATTLE_FORMATION:
                return (
                    <>
                        <Form.Group className="mb-3">
                            <Form.Label>Formation Requirements</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="formationRequirements"
                                value={formData.formationRequirements}
                                onChange={handleChange}
                                placeholder="e.g., 1 HERO, 3 BATTLELINE units, 1000+ points"
                                rows={2}
                            />
                        </Form.Group>
                        {renderPhaseAndKeywords()}
                    </>
                );

            case AoSContentTypes.COMMAND:
                return (
                    <>
                        <Form.Group className="mb-3">
                            <Form.Label>Command Value (1-4)</Form.Label>
                            <Form.Control
                                type="number"
                                name="commandValue"
                                value={formData.commandValue}
                                onChange={handleChange}
                                min="1"
                                max="4"
                            />
                            <Form.Text>Command point cost</Form.Text>
                        </Form.Group>
                        {renderPhaseAndKeywords()}
                    </>
                );

            case AoSContentTypes.ARTEFACT:
                return (
                    <>
                        <Form.Group className="mb-3">
                            <Form.Label>Points Cost</Form.Label>
                            <Form.Control
                                type="number"
                                name="pointsCost"
                                value={formData.pointsCost}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        {renderPhaseAndKeywords()}
                    </>
                );

            default:
                return null;
        }
    };

    const showDescriptionAndEffect = formData.contentType !== AoSContentTypes.SPELL_LORE &&
        formData.contentType !== AoSContentTypes.PRAYER_LORE &&
        formData.contentType !== AoSContentTypes.MANIFESTATION;

    return (
        <Card>
            <Card.Header>
                <h3 className="mb-0">{contentId ? 'Edit' : 'Create'} Army Content</h3>
            </Card.Header>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Name*</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Content Type*</Form.Label>
                                <Form.Select name="contentType" value={formData.contentType} onChange={handleChange}>
                                    {AoSContentTypes.getAllTypes().map(type => (
                                        <option key={type} value={type}>
                                            {AoSContentTypes.getDisplayName(type)}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Faction</Form.Label>
                                <Form.Select name="faction" value={formData.faction} onChange={handleChange}>
                                    <option value="">Universal</option>
                                    {Object.values(AoSFactions).filter(f => typeof f === 'string').map(faction => (
                                        <option key={faction} value={faction}>
                                            {AoSFactions.getDisplayName(faction)}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    {showDescriptionAndEffect && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
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
                                    rows={4}
                                />
                            </Form.Group>
                        </>
                    )}

                    {renderTypeSpecificFields()}

                    {showDescriptionAndEffect && (
                        <Form.Group className="mb-3">
                            <Form.Label>Restrictions</Form.Label>
                            <div>
                                {[AoSKeywords.HERO, AoSKeywords.WIZARD1, AoSKeywords.PRIEST].map(kw => (
                                    <Form.Check
                                        key={kw}
                                        inline
                                        type="checkbox"
                                        id={`restriction-${kw}`}
                                        label={AoSKeywords.getDisplayName(kw)}
                                        checked={formData.restrictions.includes(kw)}
                                        onChange={() => handleRestrictionToggle(kw)}
                                    />
                                ))}
                            </div>
                        </Form.Group>
                    )}

                    <div className="d-flex justify-content-between">
                        <Button variant="secondary" onClick={() => navigate('/army-content')}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? 'Saving...' : (contentId ? 'Update' : 'Create')}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default ArmyContentForm;