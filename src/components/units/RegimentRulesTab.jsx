import React, {useState, useEffect} from 'react';
import {Card, Form, Badge, Alert, Row, Col, ListGroup} from 'react-bootstrap';
import {collection, getDocs, query, where} from 'firebase/firestore';
import {db} from '../../firebase/config';
import {useAuth} from '../../contexts/AuthContext';
import AoSFactionKeywords from '../../enums/aos/AoSFactionKeywords';
import AoSKeywords from '../../enums/aos/AoSKeywords';
import AoSContentTypes from '../../enums/aos/AoSContentTypes';
import GameSystems from '../../enums/GameSystems';

const RegimentRulesTab = ({battleProfile, onChange, faction, unitId}) => {
    const {currentUser} = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [unitSearchTerm, setUnitSearchTerm] = useState('');
    const [availableUnits, setAvailableUnits] = useState([]);
    const [regimentAbilities, setRegimentAbilities] = useState([]);
    const [loading, setLoading] = useState(true);

    const profile = battleProfile || {
        allowedKeywords: [],
        canSubCommander: false,
        allowsSubCommanders: false,
        maxSubCommanders: 1,
        isRegimentOfRenown: false,
        requiredUnits: [],
        requiredRegimentAbility: ''
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser || !faction) return;

            try {
                setLoading(true);

                const unitsRef = collection(db, 'users', currentUser.uid, 'units');
                const unitsQuery = query(
                    unitsRef,
                    where('gameSystem', '==', GameSystems.AOS),
                    where('faction', '==', faction)
                );
                const unitsSnapshot = await getDocs(unitsQuery);
                const unitsList = unitsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAvailableUnits(unitsList);

                const contentRef = collection(db, 'users', currentUser.uid, 'armyContent');
                const contentQuery = query(
                    contentRef,
                    where('gameSystem', '==', GameSystems.AOS),
                    where('contentType', '==', AoSContentTypes.REGIMENT_ABILITY)
                );
                const contentSnapshot = await getDocs(contentQuery);
                const abilitiesList = contentSnapshot.docs
                    .map(doc => ({id: doc.id, ...doc.data()}))
                    .filter(ability => !ability.faction || ability.faction === '' || ability.faction === faction);
                setRegimentAbilities(abilitiesList);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser, faction]);

    const allKeywords = [...new Set([
        ...AoSFactionKeywords.getAllKeywords(),
        ...Object.values(AoSKeywords).filter(v => typeof v === 'string' && !['HERO', 'UNIQUE', 'WARMASTER'].includes(v))
    ])];

    const handleToggleKeyword = (keyword) => {
        const current = profile.allowedKeywords || [];
        const updated = current.includes(keyword)
            ? current.filter(k => k !== keyword)
            : [...current, keyword];
        onChange({...profile, allowedKeywords: updated});
    };

    const handleToggleRequiredUnit = (unitId) => {
        const current = profile.requiredUnits || [];
        const updated = current.includes(unitId)
            ? current.filter(id => id !== unitId)
            : [...current, unitId];
        onChange({...profile, requiredUnits: updated});
    };

    const getSuggestions = () => {
        if (faction) {
            const factionKey = faction.toUpperCase();
            if (allKeywords.includes(factionKey)) return [factionKey];
        }
        return [];
    };

    const suggestions = getSuggestions();
    const filteredKeywords = allKeywords.filter(k =>
        k.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card>
            <Card.Body>
                <Alert variant="info">
                    <strong>What are regiment rules?</strong>
                    <p className="mb-0 mt-2">
                        Define which units this hero can lead and whether sub-commanders are allowed.
                    </p>
                </Alert>

                <h5>Allowed Unit Keywords</h5>
                <p className="text-muted">Select keywords units must have to join this regiment</p>

                {suggestions.length > 0 && profile.allowedKeywords.length === 0 && (
                    <Alert variant="secondary">
                        <strong>Suggested:</strong> {suggestions.map(s => (
                        <Badge
                            key={s}
                            bg="light"
                            text="dark"
                            className="ms-2"
                            style={{cursor: 'pointer'}}
                            onClick={() => handleToggleKeyword(s)}
                        >
                            + {AoSFactionKeywords.getDisplayName(s)}
                        </Badge>
                    ))}
                    </Alert>
                )}

                <div className="mb-3">
                    <strong>Selected ({profile.allowedKeywords.length}):</strong>
                    <div className="mt-2">
                        {profile.allowedKeywords.length === 0 ? (
                            <span className="text-muted">None (allows any faction unit)</span>
                        ) : (
                            profile.allowedKeywords.map(keyword => (
                                <Badge
                                    key={keyword}
                                    bg="primary"
                                    className="me-2 mb-2 p-2"
                                    style={{cursor: 'pointer'}}
                                    onClick={() => handleToggleKeyword(keyword)}
                                >
                                    {AoSFactionKeywords.getDisplayName(keyword) || keyword} ×
                                </Badge>
                            ))
                        )}
                    </div>
                </div>

                <Form.Group className="mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Search keywords..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Form.Group>

                <div style={{maxHeight: '300px', overflowY: 'auto'}}>
                    {filteredKeywords
                        .filter(k => !profile.allowedKeywords.includes(k))
                        .map(keyword => (
                            <Badge
                                key={keyword}
                                bg="light"
                                text="dark"
                                className="me-2 mb-2 p-2"
                                style={{cursor: 'pointer'}}
                                onClick={() => handleToggleKeyword(keyword)}
                            >
                                + {AoSFactionKeywords.getDisplayName(keyword) || keyword}
                            </Badge>
                        ))}
                </div>

                <hr/>

                <h5>Sub-Commander Rules</h5>

                <Form.Check
                    type="checkbox"
                    id="canSubCommander"
                    label="This hero can join another hero's regiment as a sub-commander"
                    checked={profile.canSubCommander}
                    onChange={(e) => onChange({...profile, canSubCommander: e.target.checked})}
                    className="mb-3"
                />
                <Form.Text className="text-muted d-block mb-3">
                    Rare in 4E. Only select if this hero's warscroll specifically allows it.
                </Form.Text>

                <Form.Check
                    type="checkbox"
                    id="allowsSubCommanders"
                    label="This hero's regiment allows sub-commanders"
                    checked={profile.allowsSubCommanders}
                    onChange={(e) => onChange({...profile, allowsSubCommanders: e.target.checked})}
                    className="mb-3"
                />

                {profile.allowsSubCommanders && (
                    <Row>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Maximum Sub-Commanders Allowed</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    max="3"
                                    value={profile.maxSubCommanders || 1}
                                    onChange={(e) => onChange({
                                        ...profile,
                                        maxSubCommanders: parseInt(e.target.value) || 1
                                    })}
                                />
                                <Form.Text className="text-muted">
                                    Usually 1, rarely more
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>
                )}

                <hr/>

                <h5>Regiment of Renown</h5>

                <Form.Check
                    type="checkbox"
                    id="isRegimentOfRenown"
                    label="This hero leads a Regiment of Renown"
                    checked={profile.isRegimentOfRenown}
                    onChange={(e) => onChange({...profile, isRegimentOfRenown: e.target.checked})}
                    className="mb-3"
                />
                <Form.Text className="text-muted d-block mb-3">
                    Regiment of Renown units come with specific mandatory companions and abilities (e.g., The
                    Blacktalons)
                </Form.Text>

                {profile.isRegimentOfRenown && (
                    <>
                        <Alert variant="warning">
                            <strong>Important:</strong> Regiment of Renown regiments must include specific units and
                            abilities that cannot be changed.
                        </Alert>

                        <Form.Group className="mb-3">
                            <Form.Label>Required Units ({profile.requiredUnits?.length || 0} selected)</Form.Label>
                            {loading ? (
                                <div className="text-muted">Loading units...</div>
                            ) : availableUnits.length === 0 ? (
                                <Alert variant="info">
                                    No units found for this faction. Create units first.
                                </Alert>
                            ) : (
                                <>
                                    <div className="mb-2">
                                        {(profile.requiredUnits || [])
                                            .filter(id => id !== unitId)
                                            .map(reqUnitId => {
                                                const unit = availableUnits.find(u => u.id === reqUnitId);
                                                return unit ? (
                                                    <Badge
                                                        key={reqUnitId}
                                                        bg="primary"
                                                        className="me-2 mb-2 p-2"
                                                        style={{cursor: 'pointer'}}
                                                        onClick={() => handleToggleRequiredUnit(reqUnitId)}
                                                    >
                                                        {unit.name} ×
                                                    </Badge>
                                                ) : null;
                                            })}
                                    </div>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search units..."
                                        value={unitSearchTerm}
                                        onChange={(e) => setUnitSearchTerm(e.target.value)}
                                        className="mb-2"
                                    />
                                    <ListGroup style={{maxHeight: '250px', overflowY: 'auto'}}>
                                        {availableUnits
                                            .filter(u => u.id !== unitId)
                                            .filter(u => !profile.requiredUnits?.includes(u.id))
                                            .filter(u =>
                                                unitSearchTerm === '' ||
                                                u.name.toLowerCase().includes(unitSearchTerm.toLowerCase()) ||
                                                u.type?.toLowerCase().includes(unitSearchTerm.toLowerCase())
                                            )
                                            .map(unit => (
                                                <ListGroup.Item
                                                    key={unit.id}
                                                    action
                                                    onClick={() => handleToggleRequiredUnit(unit.id)}
                                                    style={{cursor: 'pointer'}}
                                                >
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <strong>{unit.name}</strong>
                                                            <div className="small text-muted">{unit.type}</div>
                                                        </div>
                                                        <Badge bg="light" text="dark">+ Add</Badge>
                                                    </div>
                                                </ListGroup.Item>
                                            ))}
                                    </ListGroup>
                                </>
                            )}
                            <Form.Text>
                                These units must be included in every regiment with this commander.
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Required Regiment Ability</Form.Label>
                            {loading ? (
                                <div className="text-muted">Loading abilities...</div>
                            ) : (
                                <Form.Select
                                    value={profile.requiredRegimentAbility || ''}
                                    onChange={(e) => onChange({
                                        ...profile,
                                        requiredRegimentAbility: e.target.value
                                    })}
                                >
                                    <option value="">None</option>
                                    {regimentAbilities.map(ability => (
                                        <option key={ability.id} value={ability.id}>
                                            {ability.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            )}
                            <Form.Text>
                                This specific regiment ability must be used for regiments with this commander.
                            </Form.Text>
                        </Form.Group>
                    </>
                )}
            </Card.Body>
        </Card>
    );
};

export default RegimentRulesTab;