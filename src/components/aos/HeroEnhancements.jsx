// src/components/aos/HeroEnhancements.jsx
import React, {useState, useEffect} from 'react';
import {Card, Button, Row, Col, Alert, ListGroup, Badge, Form} from 'react-bootstrap';
import {useParams, useNavigate, Link} from 'react-router-dom';
import {doc, getDoc, updateDoc, collection, query, where, getDocs} from 'firebase/firestore';
import {db} from '../../firebase/config';
import {useAuth} from '../../contexts/AuthContext';
import GameSystems from '../../enums/GameSystems';
import AoSKeywords from '../../enums/aos/AoSKeywords';
import AoSContentTypes from '../../enums/aos/AoSContentTypes';
import LoadingSpinner from '../layout/LoadingSpinner';

const HeroEnhancements = () => {
    const {armyId} = useParams();
    const navigate = useNavigate();
    const {currentUser} = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [army, setArmy] = useState(null);
    const [units, setUnits] = useState([]);
    const [content, setContent] = useState([]);
    const [enhancements, setEnhancements] = useState({});

    useEffect(() => {
        fetchData();
    }, [currentUser, armyId]);

    const fetchData = async () => {
        if (!currentUser || !armyId) return;

        try {
            setLoading(true);

            const armyRef = doc(db, 'users', currentUser.uid, 'armies', armyId);
            const armyDoc = await getDoc(armyRef);

            if (!armyDoc.exists()) {
                setError('Army not found');
                return;
            }

            const armyData = {id: armyDoc.id, ...armyDoc.data()};

            if (armyData.gameSystem !== GameSystems.AOS) {
                setError('Hero enhancements are only available for Age of Sigmar');
                return;
            }

            setArmy(armyData);

            // Fetch units
            const unitPromises = (armyData.units || []).map(async (unitId) => {
                const unitRef = doc(db, 'users', currentUser.uid, 'units', unitId);
                const unitDoc = await getDoc(unitRef);
                return unitDoc.exists() ? {id: unitDoc.id, ...unitDoc.data()} : null;
            });
            const unitsData = (await Promise.all(unitPromises)).filter(Boolean);
            setUnits(unitsData);

            // Fetch army content
            const contentRef = collection(db, 'users', currentUser.uid, 'armyContent');
            const contentQuery = query(contentRef, where('gameSystem', '==', GameSystems.AOS));
            const contentSnapshot = await getDocs(contentQuery);
            const contentList = contentSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
            setContent(contentList);

            // Extract enhancements from regiments
            const initialEnhancements = {};
            (armyData.regiments || []).forEach(regiment => {
                if (regiment.heroEquipment) {
                    Object.entries(regiment.heroEquipment).forEach(([unitId, equipment]) => {
                        initialEnhancements[unitId] = equipment;
                    });
                }
            });

            setEnhancements(initialEnhancements);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEnhancement = (unitId, type, contentId) => {
        setEnhancements(prev => ({
            ...prev,
            [unitId]: {
                ...(prev[unitId] || {}),
                [type]: contentId || null
            }
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Update regiments with new hero equipment
            const updatedRegiments = (army.regiments || []).map(regiment => {
                const heroEquipment = {};
                
                // Get commander equipment
                if (regiment.commander && enhancements[regiment.commander]) {
                    heroEquipment[regiment.commander] = enhancements[regiment.commander];
                }

                // Get sub-commander equipment
                (regiment.units || []).forEach(({unitId, isSubCommander}) => {
                    if (isSubCommander && enhancements[unitId]) {
                        heroEquipment[unitId] = enhancements[unitId];
                    }
                });

                return {...regiment, heroEquipment};
            });

            const armyRef = doc(db, 'users', currentUser.uid, 'armies', armyId);
            await updateDoc(armyRef, {regiments: updatedRegiments});

            setArmy({...army, regiments: updatedRegiments});
            setSuccess('Enhancements saved successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error saving:', err);
            setError('Failed to save enhancements');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner text="Loading hero enhancements..."/>;

    if (error && !army) {
        return (
            <Alert variant="danger">
                {error}
                <div className="mt-3">
                    <Button as={Link} to="/armies">Back to Armies</Button>
                </div>
            </Alert>
        );
    }

    const heroes = units.filter(u => u.keywords?.includes(AoSKeywords.HERO));
    const uniqueHeroes = heroes.filter(u => u.keywords?.includes(AoSKeywords.UNIQUE));
    const nonUniqueHeroes = heroes.filter(u => !u.keywords?.includes(AoSKeywords.UNIQUE));

    const heroicTraits = content.filter(c => c.contentType === AoSContentTypes.HEROIC_TRAIT);
    const artefacts = content.filter(c => c.contentType === AoSContentTypes.ARTEFACT);

    const usedTraits = new Set(Object.values(enhancements).map(e => e.heroicTrait).filter(Boolean));
    const usedArtefacts = new Set(Object.values(enhancements).map(e => e.artefact).filter(Boolean));

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Hero Enhancements: {army.name}</h2>
                <div>
                    <Button variant="outline-secondary" as={Link} to={`/armies/${armyId}`} className="me-2">
                        Back to Army
                    </Button>
                    <Button variant="primary" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Enhancements'}
                    </Button>
                </div>
            </div>

            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

            <Alert variant="info" className="mb-4">
                <strong>Enhancement Rules:</strong>
                <ul className="mb-0">
                    <li>Each heroic trait and artefact can only be used once per army</li>
                    <li>UNIQUE heroes cannot receive enhancements</li>
                    <li>Only heroes in regiments can receive enhancements</li>
                </ul>
            </Alert>

            {uniqueHeroes.length > 0 && (
                <Card className="mb-4">
                    <Card.Header>
                        <h5 className="mb-0">
                            <i className="bi bi-star-fill me-2"></i>
                            Unique Heroes (No Enhancements Allowed)
                        </h5>
                    </Card.Header>
                    <Card.Body>
                        <ListGroup variant="flush">
                            {uniqueHeroes.map(hero => (
                                <ListGroup.Item key={hero.id}>
                                    <strong>{hero.name}</strong>
                                    <Badge bg="warning" text="dark" className="ms-2">UNIQUE</Badge>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card.Body>
                </Card>
            )}

            <Card>
                <Card.Header>
                    <h5 className="mb-0">
                        <i className="bi bi-gem me-2"></i>
                        Hero Enhancements ({nonUniqueHeroes.length} Heroes)
                    </h5>
                </Card.Header>
                <Card.Body>
                    {nonUniqueHeroes.length === 0 ? (
                        <Alert variant="info">No non-unique heroes in this army</Alert>
                    ) : (
                        <Row>
                            {nonUniqueHeroes.map(hero => (
                                <Col md={6} key={hero.id} className="mb-3">
                                    <Card bg="light">
                                        <Card.Body>
                                            <h6 className="mb-3">{hero.name}</h6>

                                            <Form.Group className="mb-2">
                                                <Form.Label className="small">Heroic Trait</Form.Label>
                                                <Form.Select
                                                    size="sm"
                                                    value={enhancements[hero.id]?.heroicTrait || ''}
                                                    onChange={(e) => handleUpdateEnhancement(hero.id, 'heroicTrait', e.target.value)}
                                                >
                                                    <option value="">None</option>
                                                    {heroicTraits.map(trait => (
                                                        <option 
                                                            key={trait.id} 
                                                            value={trait.id}
                                                            disabled={usedTraits.has(trait.id) && enhancements[hero.id]?.heroicTrait !== trait.id}
                                                        >
                                                            {trait.name} {usedTraits.has(trait.id) && enhancements[hero.id]?.heroicTrait !== trait.id ? '(Used)' : ''}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>

                                            <Form.Group>
                                                <Form.Label className="small">Artefact of Power</Form.Label>
                                                <Form.Select
                                                    size="sm"
                                                    value={enhancements[hero.id]?.artefact || ''}
                                                    onChange={(e) => handleUpdateEnhancement(hero.id, 'artefact', e.target.value)}
                                                >
                                                    <option value="">None</option>
                                                    {artefacts.map(art => (
                                                        <option 
                                                            key={art.id} 
                                                            value={art.id}
                                                            disabled={usedArtefacts.has(art.id) && enhancements[hero.id]?.artefact !== art.id}
                                                        >
                                                            {art.name} {usedArtefacts.has(art.id) && enhancements[hero.id]?.artefact !== art.id ? '(Used)' : ''}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}

                    {(heroicTraits.length === 0 || artefacts.length === 0) && (
                        <Alert variant="warning" className="mt-3">
                            {heroicTraits.length === 0 && <div>No heroic traits created yet.</div>}
                            {artefacts.length === 0 && <div>No artefacts created yet.</div>}
                            <Button
                                variant="outline-primary"
                                size="sm"
                                as={Link}
                                to="/army-content/create"
                                className="mt-2"
                            >
                                Create Army Content
                            </Button>
                        </Alert>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default HeroEnhancements;