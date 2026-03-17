// src/components/aos/ArmyContentSelection.jsx
import React, {useState, useEffect} from 'react';
import {Card, Button, Row, Col, Alert, ListGroup, Form, Badge} from 'react-bootstrap';
import {useParams, useNavigate, Link} from 'react-router-dom';
import {doc, getDoc, updateDoc, collection, query, where, getDocs} from 'firebase/firestore';
import {db} from '../../firebase/config';
import {useAuth} from '../../contexts/AuthContext';
import {useGameSystem} from '../../contexts/GameSystemContext';
import AoSContentTypes from '../../enums/aos/AoSContentTypes';
import AoSFactions from '../../enums/aos/AoSFactions';
import GameSystems from '../../enums/GameSystems';
import LoadingSpinner from '../layout/LoadingSpinner';

const ArmyContentSelection = () => {
    const {armyId} = useParams();
    const navigate = useNavigate();
    const {currentUser} = useAuth();
    const {currentSystem} = useGameSystem();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [army, setArmy] = useState(null);
    const [availableContent, setAvailableContent] = useState([]);
    const [selectedContent, setSelectedContent] = useState({
        battleTraits: [],
        battleFormations: [],
        spellLores: [],
        prayerLores: [],
        manifestations: []
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

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

                if (armyData.gameSystem !== GameSystems.AOS) {
                    setError('Army content selection is only available for Age of Sigmar.');
                    setLoading(false);
                    return;
                }

                setArmy(armyData);

                // Fetch available army content
                const contentRef = collection(db, 'users', currentUser.uid, 'armyContent');
                const contentQuery = query(
                    contentRef,
                    where('gameSystem', '==', GameSystems.AOS)
                );
                const contentSnapshot = await getDocs(contentQuery);

                const contentList = contentSnapshot.docs
                    .map(doc => ({id: doc.id, ...doc.data()}))
                    .filter(content => {
                        // Filter by faction (show universal or matching faction)
                        return !content.faction || content.faction === '' || content.faction === armyData.faction;
                    })
                    .sort((a, b) => a.name.localeCompare(b.name));

                setAvailableContent(contentList);

                // Set selected content from army
                setSelectedContent({
                    battleTraits: armyData.battleTraits || [],
                    battleFormations: armyData.battleFormations || [],
                    spellLores: armyData.spellLores || [],
                    prayerLores: armyData.prayerLores || [],
                    manifestations: armyData.manifestations || []
                });
            } catch (err) {
                console.error('Error fetching army data:', err);
                setError('Failed to load army content: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchArmyData();
    }, [currentUser, armyId]);

    const handleAddContent = (contentId, contentType) => {
        const typeKey = getTypeKey(contentType);
        
        if (selectedContent[typeKey].includes(contentId)) {
            setError('This content is already selected.');
            return;
        }

        setSelectedContent(prev => ({
            ...prev,
            [typeKey]: [...prev[typeKey], contentId]
        }));
        setError('');
    };

    const handleRemoveContent = (contentId, contentType) => {
        const typeKey = getTypeKey(contentType);
        
        setSelectedContent(prev => ({
            ...prev,
            [typeKey]: prev[typeKey].filter(id => id !== contentId)
        }));
    };

    const getTypeKey = (contentType) => {
        switch (contentType) {
            case AoSContentTypes.BATTLE_TRAIT:
                return 'battleTraits';
            case AoSContentTypes.BATTLE_FORMATION:
                return 'battleFormations';
            case AoSContentTypes.SPELL_LORE:
                return 'spellLores';
            case AoSContentTypes.PRAYER_LORE:
                return 'prayerLores';
            case AoSContentTypes.MANIFESTATION:
                return 'manifestations';
            default:
                return null;
        }
    };

    const handleSaveContent = async () => {
        if (!currentUser || !armyId) return;

        try {
            setSaving(true);

            const armyRef = doc(db, 'users', currentUser.uid, 'armies', armyId);
            await updateDoc(armyRef, selectedContent);

            setSuccess('Army content saved successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error saving army content:', err);
            setError('Failed to save army content: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const filteredAvailableContent = availableContent.filter(content => {
        if (filterType !== 'all' && content.contentType !== filterType) {
            return false;
        }
        if (!searchTerm) return true;
        return (
            content.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (content.description && content.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    });

    const isContentSelected = (contentId) => {
        return Object.values(selectedContent).some(arr => arr.includes(contentId));
    };

    const getSelectedContentByType = (type) => {
        const typeKey = getTypeKey(type);
        if (!typeKey) return [];
        
        return selectedContent[typeKey]
            .map(id => availableContent.find(c => c.id === id))
            .filter(Boolean);
    };

    if (loading) {
        return <LoadingSpinner text="Loading army content..."/>;
    }

    if (!army) {
        return (
            <Alert variant="danger">
                Army not found.
                <div className="mt-3">
                    <Button variant="primary" as={Link} to="/armies">
                        Back to Armies
                    </Button>
                </div>
            </Alert>
        );
    }

    const contentTypes = [
        AoSContentTypes.BATTLE_TRAIT,
        AoSContentTypes.BATTLE_FORMATION,
        AoSContentTypes.SPELL_LORE,
        AoSContentTypes.PRAYER_LORE,
        AoSContentTypes.MANIFESTATION
    ];

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Army Content: {army.name}</h2>
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
                        onClick={handleSaveContent}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Content'}
                    </Button>
                </div>
            </div>

            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

            <Row>
                <Col md={7}>
                    <Card className="mb-4">
                        <Card.Header className={`faction-${army.faction}`}>
                            <h4 className="mb-0">Selected Content</h4>
                        </Card.Header>
                        <Card.Body>
                            {contentTypes.map(type => {
                                const items = getSelectedContentByType(type);
                                if (items.length === 0) return null;

                                return (
                                    <div key={type} className="mb-3">
                                        <h6 className="text-muted">
                                            <i className={`${AoSContentTypes.getIcon(type)} me-2`}></i>
                                            {AoSContentTypes.getDisplayName(type)} ({items.length})
                                        </h6>
                                        <ListGroup>
                                            {items.map(content => (
                                                <ListGroup.Item
                                                    key={content.id}
                                                    className="d-flex justify-content-between align-items-start"
                                                >
                                                    <div>
                                                        <strong>{content.name}</strong>
                                                        {content.description && (
                                                            <p className="mb-0 small text-muted mt-1">
                                                                {content.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleRemoveContent(content.id, content.contentType)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    </div>
                                );
                            })}

                            {Object.values(selectedContent).every(arr => arr.length === 0) && (
                                <Alert variant="info">
                                    No content selected. Add content from the list on the right.
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={5}>
                    <Card>
                        <Card.Header>
                            <h4 className="mb-0">Available Content</h4>
                        </Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="text"
                                    placeholder="Search content..."
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    value={searchTerm}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                                    <option value="all">All Types</option>
                                    {contentTypes.map(type => (
                                        <option key={type} value={type}>
                                            {AoSContentTypes.getDisplayName(type)}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            {availableContent.length === 0 ? (
                                <Alert variant="info">
                                    <p className="mb-2">No army content created yet.</p>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        as={Link}
                                        to="/army-content/create"
                                    >
                                        Create Army Content
                                    </Button>
                                </Alert>
                            ) : (
                                <ListGroup style={{maxHeight: '600px', overflowY: 'auto'}}>
                                    {filteredAvailableContent.map(content => {
                                        const isSelected = isContentSelected(content.id);

                                        return (
                                            <ListGroup.Item
                                                key={content.id}
                                                className="d-flex justify-content-between align-items-start"
                                            >
                                                <div>
                                                    <div className="d-flex align-items-center">
                                                        <i className={`${AoSContentTypes.getIcon(content.contentType)} me-2`} 
                                                           style={{color: AoSContentTypes.getColor(content.contentType)}}></i>
                                                        <h6 className="mb-0">{content.name}</h6>
                                                    </div>
                                                    <div className="small mt-1">
                                                        <Badge bg="secondary" className="me-1">
                                                            {AoSContentTypes.getDisplayName(content.contentType)}
                                                        </Badge>
                                                        {content.faction ? (
                                                            <Badge bg="primary">
                                                                {AoSFactions.getDisplayName(content.faction)}
                                                            </Badge>
                                                        ) : (
                                                            <Badge bg="light" text="dark">Universal</Badge>
                                                        )}
                                                    </div>
                                                    {content.description && (
                                                        <p className="mt-1 mb-0 small text-muted">
                                                            {content.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <Button
                                                    variant={isSelected ? "outline-success" : "outline-primary"}
                                                    size="sm"
                                                    onClick={() => handleAddContent(content.id, content.contentType)}
                                                    disabled={isSelected}
                                                >
                                                    {isSelected ? "Added" : "Add"}
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
        </div>
    );
};

export default ArmyContentSelection;