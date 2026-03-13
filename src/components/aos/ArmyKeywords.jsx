// src/components/aos/ArmyKeywords.jsx - AOS ONLY
import React, {useState, useEffect} from 'react';
import {Card, Button, Row, Col, Alert, ListGroup, Form, Badge} from 'react-bootstrap';
import {useParams, useNavigate, Link} from 'react-router-dom';
import {doc, getDoc, updateDoc, collection, query, where, getDocs} from 'firebase/firestore';
import {db} from '../../firebase/config';
import {useAuth} from '../../contexts/AuthContext';
import {useGameSystem} from '../../contexts/GameSystemContext';
import AoSFactions from '../../enums/aos/AoSFactions';
import GameSystems from '../../enums/GameSystems';
import LoadingSpinner from '../layout/LoadingSpinner';

const ArmyKeywords = () => {
    const {armyId} = useParams();
    const navigate = useNavigate();
    const {currentUser} = useAuth();
    const {currentSystem} = useGameSystem();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [army, setArmy] = useState(null);
    const [availableKeywords, setAvailableKeywords] = useState([]);
    const [selectedKeywords, setSelectedKeywords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const MAX_KEYWORDS = 5; // Adjust based on AOS rules

    useEffect(() => {
        if (!currentUser || !armyId) return;

        const fetchArmyData = async () => {
            try {
                setLoading(true);

                const armyRef = doc(db, 'users', currentUser.uid, 'armies', armyId);
                const armyDoc = await getDoc(armyRef);

                if (!armyDoc.exists()) {
                    setError('Army not found');
                    setLoading(false);
                    return;
                }

                const armyData = {id: armyDoc.id, ...armyDoc.data()};

                // Check system compatibility - AOS only
                if (armyData.gameSystem !== GameSystems.AOS) {
                    setError('Army keywords are only available for Age of Sigmar.');
                    setLoading(false);
                    return;
                }

                setArmy(armyData);

                // Fetch custom army keywords/traits
                const keywordsRef = collection(db, 'users', currentUser.uid, 'armyKeywords');
                const keywordsQuery = query(
                    keywordsRef,
                    where('gameSystem', '==', GameSystems.AOS)
                );
                const keywordsSnapshot = await getDocs(keywordsQuery);

                const keywordsList = keywordsSnapshot.docs
                    .map(doc => ({id: doc.id, ...doc.data()}))
                    .filter(keyword => {
                        return (
                            (!keyword.faction || keyword.faction === '' || keyword.faction === armyData.faction) &&
                            (keyword.isUniversal || !keyword.armies || keyword.armies.length === 0 || keyword.armies.includes(armyId))
                        );
                    })
                    .sort((a, b) => a.name.localeCompare(b.name));

                setAvailableKeywords(keywordsList);

                if (armyData.armyKeywords) {
                    setSelectedKeywords(armyData.armyKeywords);
                }
            } catch (err) {
                console.error('Error fetching army data:', err);
                setError('Failed to load army keywords: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchArmyData();
    }, [currentUser, armyId, currentSystem]);

    const handleAddKeyword = (keywordId) => {
        if (selectedKeywords.length >= MAX_KEYWORDS) {
            setError(`Cannot add more than ${MAX_KEYWORDS} keywords to an army.`);
            return;
        }

        if (selectedKeywords.includes(keywordId)) {
            setError('This keyword is already in your army.');
            return;
        }

        setSelectedKeywords([...selectedKeywords, keywordId]);
        setError('');
    };

    const handleRemoveKeyword = (keywordId) => {
        setSelectedKeywords(selectedKeywords.filter(id => id !== keywordId));
    };

    const handleSaveKeywords = async () => {
        if (!currentUser || !armyId) return;

        try {
            setSaving(true);

            const armyRef = doc(db, 'users', currentUser.uid, 'armies', armyId);
            await updateDoc(armyRef, {
                armyKeywords: selectedKeywords
            });

            setSuccess('Army keywords saved successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error saving army keywords:', err);
            setError('Failed to save army keywords: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const filteredAvailableKeywords = availableKeywords.filter(keyword => {
        if (!searchTerm) return true;
        return (
            keyword.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (keyword.description && keyword.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    });

    if (loading) {
        return <LoadingSpinner text="Loading army keywords..."/>;
    }

    if (!army) {
        return (
            <Alert variant="danger">
                Army not found. Please select a valid army.
                <div className="mt-3">
                    <Button variant="primary" as={Link} to="/armies">
                        Back to Armies
                    </Button>
                </div>
            </Alert>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Army Keywords: {army.name}</h2>
                <div>
                    <Button
                        variant="outline-secondary"
                        as={Link}
                        to={`/armies/${armyId}`}
                        className="me-2"
                    >
                        Back to Army
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSaveKeywords}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Keywords'}
                    </Button>
                </div>
            </div>

            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

            <Row>
                <Col md={7}>
                    <Card className="mb-4">
                        <Card.Header className={`faction-${army.faction}`}>
                            <h4 className="mb-0">Selected Keywords ({selectedKeywords.length}/{MAX_KEYWORDS})</h4>
                        </Card.Header>
                        <Card.Body>
                            {selectedKeywords.length === 0 ? (
                                <Alert variant="info">
                                    No keywords selected. Add keywords from the list on the right.
                                </Alert>
                            ) : (
                                <ListGroup>
                                    {selectedKeywords.map(keywordId => {
                                        const keyword = availableKeywords.find(k => k.id === keywordId);
                                        if (!keyword) return null;

                                        return (
                                            <ListGroup.Item
                                                key={keywordId}
                                                className="d-flex justify-content-between align-items-center"
                                            >
                                                <div>
                                                    <h5 className="mb-1">{keyword.name}</h5>

                                                    <div className="mt-1">
                                                        {keyword.faction ? (
                                                            <Badge bg="primary" className="me-2">
                                                                {AoSFactions.getDisplayName(keyword.faction)}
                                                            </Badge>
                                                        ) : (
                                                            <Badge bg="secondary" className="me-2">Universal</Badge>
                                                        )}

                                                        {keyword.keywordType && (
                                                            <Badge bg="info" className="me-2">
                                                                {keyword.keywordType}
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <p className="mt-1 mb-0 small">{keyword.description}</p>
                                                    {keyword.effectText && (
                                                        <p className="mt-1 mb-0 small text-muted">{keyword.effectText}</p>
                                                    )}
                                                </div>

                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleRemoveKeyword(keywordId)}
                                                >
                                                    Remove
                                                </Button>
                                            </ListGroup.Item>
                                        );
                                    })}
                                </ListGroup>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={5}>
                    <Card>
                        <Card.Header>
                            <h4 className="mb-0">Available Keywords</h4>
                        </Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="text"
                                    placeholder="Search available keywords..."
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    value={searchTerm}
                                />
                            </Form.Group>

                            {availableKeywords.length === 0 ? (
                                <Alert variant="info">
                                    <p className="mb-2">No army keywords created yet.</p>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        as={Link}
                                        to="/army-keywords/create"
                                    >
                                        Create Army Keyword
                                    </Button>
                                </Alert>
                            ) : (
                                <ListGroup>
                                    {filteredAvailableKeywords.map(keyword => {
                                        if (selectedKeywords.includes(keyword.id)) {
                                            return null;
                                        }

                                        return (
                                            <ListGroup.Item
                                                key={keyword.id}
                                                className="d-flex justify-content-between align-items-center"
                                            >
                                                <div>
                                                    <div>
                                                        <h6 className="mb-0">{keyword.name}</h6>
                                                        <div className="small">
                                                            {keyword.faction ? (
                                                                <Badge bg="primary" size="sm" className="me-1">
                                                                    {AoSFactions.getDisplayName(keyword.faction)}
                                                                </Badge>
                                                            ) : (
                                                                <Badge bg="secondary" size="sm"
                                                                       className="me-1">Universal</Badge>
                                                            )}

                                                            {keyword.keywordType && (
                                                                <Badge bg="info" size="sm">
                                                                    {keyword.keywordType}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {keyword.description && (
                                                        <p className="mt-1 mb-0 small">{keyword.description}</p>
                                                    )}
                                                </div>

                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => handleAddKeyword(keyword.id)}
                                                >
                                                    Add
                                                </Button>
                                            </ListGroup.Item>
                                        );
                                    })}
                                </ListGroup>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <div className="mt-4">
                <Alert variant="info">
                    <p className="mb-1"><strong>Army Keyword Rules:</strong></p>
                    <ul className="mb-0">
                        <li>Maximum of {MAX_KEYWORDS} army keywords</li>
                        <li>Keywords apply army-wide effects</li>
                        <li>Battle traits and enhancements can be managed here</li>
                    </ul>
                </Alert>
            </div>
        </div>
    );
};

export default ArmyKeywords;