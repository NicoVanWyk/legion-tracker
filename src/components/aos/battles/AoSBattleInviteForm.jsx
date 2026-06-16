import React, {useState, useEffect} from 'react';
import {Modal, Form, Button, Alert, Row, Col} from 'react-bootstrap';
import {collection, query, where, getDocs, addDoc, serverTimestamp} from 'firebase/firestore';
import {db} from '../../../firebase/config';
import {useAuth} from '../../../contexts/AuthContext';
import GameSystems from '../../../enums/GameSystems';

const MAP_SIZES = [
    {label: 'Contest of Generals (44" × 30")',  widthIn: 44, heightIn: 30},
    {label: 'Spearhead (22" × 30")',             widthIn: 22, heightIn: 30},
    {label: 'Grand Tournament (60" × 44")',      widthIn: 60, heightIn: 44},
    {label: 'Pitched Battle (44" × 60")',        widthIn: 44, heightIn: 60},
    {label: 'Custom',                            widthIn: null, heightIn: null},
];

const AoSBattleInviteForm = ({show, onHide, onInviteSent, existingBattle = null, existingBattleId = null}) => {
    const [friends, setFriends] = useState([]);
    const [armies, setArmies] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState('');
    const [selectedArmy, setSelectedArmy] = useState('');
    const [battleName, setBattleName] = useState('');
    const [battlePoints, setBattlePoints] = useState(2000);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mapSizePreset, setMapSizePreset] = useState(0);
    const [mapWidthIn, setMapWidthIn] = useState(44);
    const [mapHeightIn, setMapHeightIn] = useState(30);
    const {currentUser} = useAuth();

    useEffect(() => {
        if (show && currentUser) {
            fetchFriendsAndArmies();
        }
    }, [show, currentUser]);

    // When inviting to an existing battle, inherit its mapConfig if present
    useEffect(() => {
        if (existingBattle?.mapConfig) {
            setMapWidthIn(existingBattle.mapConfig.widthIn || 44);
            setMapHeightIn(existingBattle.mapConfig.heightIn || 30);
            // Try to match a preset
            const idx = MAP_SIZES.findIndex(
                s => s.widthIn === existingBattle.mapConfig.widthIn &&
                     s.heightIn === existingBattle.mapConfig.heightIn
            );
            setMapSizePreset(idx >= 0 ? idx : MAP_SIZES.length - 1); // last = Custom
        }
    }, [existingBattle]);

    const fetchFriendsAndArmies = async () => {
        try {
            const friendsQuery = query(
                collection(db, 'users', currentUser.uid, 'friends'),
                where('status', '==', 'accepted')
            );
            const friendsSnapshot = await getDocs(friendsQuery);
            setFriends(friendsSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));

            const armiesQuery = query(
                collection(db, 'users', currentUser.uid, 'armies'),
                where('gameSystem', '==', GameSystems.AOS)
            );
            const armiesSnapshot = await getDocs(armiesQuery);
            setArmies(armiesSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
        } catch (err) {
            setError('Failed to load friends and armies');
        }
    };

    const handlePresetChange = (idx) => {
        const preset = MAP_SIZES[idx];
        setMapSizePreset(idx);
        if (preset.widthIn !== null) {
            setMapWidthIn(preset.widthIn);
            setMapHeightIn(preset.heightIn);
        }
    };

    const isCustom = MAP_SIZES[mapSizePreset].widthIn === null;

    const mapConfig = {widthIn: mapWidthIn, heightIn: mapHeightIn};

    const sendInvitation = async () => {
        if (!selectedFriend) {
            setError('Please select a friend');
            return;
        }

        if (!existingBattle && !selectedArmy) {
            setError('Please select an army');
            return;
        }

        try {
            setLoading(true);
            let battleRef;

            if (existingBattle && existingBattleId) {
                // Inviting to existing battle — convert to shared battle
                const battleData = {
                    name: existingBattle.name,
                    gameSystem: GameSystems.AOS,
                    battlePointsLimit: existingBattle.battlePointsLimit,
                    mapConfig,

                    participants: {
                        [currentUser.uid]: {
                            role: 'player1',
                            armyId: existingBattle.player1.armyId,
                            username: currentUser.displayName || currentUser.email
                        }
                    },

                    invitations: [{
                        userId: selectedFriend,
                        status: 'pending',
                        invitedAt: new Date()
                    }],

                    battleData: {
                        ...existingBattle,
                        mapConfig,
                        isSharedBattle: true,
                        isActive: false
                    },

                    createdBy: currentUser.uid,
                    createdAt: new Date(),
                    originalBattleId: existingBattleId
                };

                battleRef = await addDoc(collection(db, 'aos-shared-battles'), battleData);
            } else {
                // Creating new shared battle from scratch
                const battleData = {
                    name: battleName || `${currentUser.displayName || 'Player 1'} vs ${friends.find(f => f.id === selectedFriend)?.username}`,
                    gameSystem: GameSystems.AOS,
                    battlePointsLimit: battlePoints,
                    mapConfig,

                    participants: {
                        [currentUser.uid]: {
                            role: 'player1',
                            armyId: selectedArmy,
                            username: currentUser.displayName || currentUser.email
                        }
                    },

                    invitations: [{
                        userId: selectedFriend,
                        status: 'pending',
                        invitedAt: new Date()
                    }],

                    battleData: {
                        mapConfig,
                        currentPhase: 'SETUP',
                        currentRound: 1,
                        isActive: false
                    },

                    createdBy: currentUser.uid,
                    createdAt: new Date()
                };

                battleRef = await addDoc(collection(db, 'aos-shared-battles'), battleData);
            }

            await addDoc(collection(db, 'aos-battle-invitations'), {
                fromUserId: currentUser.uid,
                fromUsername: currentUser.displayName || currentUser.email,
                toUserId: selectedFriend,
                battleId: battleRef.id,
                message: message || 'Join me for an Age of Sigmar battle!',
                battlePoints: existingBattle?.battlePointsLimit || battlePoints,
                status: 'pending',
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });

            onInviteSent && onInviteSent();
            onHide();

            setSelectedFriend('');
            setSelectedArmy('');
            setBattleName('');
            setMessage('');
            setError('');
        } catch (err) {
            console.error('Error sending invitation:', err);
            setError('Failed to send invitation: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {existingBattle ? 'Invite to Existing Battle' : 'Invite to AoS Battle'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                {existingBattle && (
                    <Alert variant="info" className="mb-3">
                        You're inviting someone to join: <strong>{existingBattle.name}</strong>
                        <br/>
                        Your army: <strong>{existingBattle.player1.armyName}</strong>
                        <br/>
                        Points: <strong>{existingBattle.battlePointsLimit}</strong>
                    </Alert>
                )}

                {!existingBattle && (
                    <>
                        <Form.Group className="mb-3">
                            <Form.Label>Battle Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={battleName}
                                onChange={(e) => setBattleName(e.target.value)}
                                placeholder="Optional"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Battle Size (Points)</Form.Label>
                            <Form.Control
                                type="number"
                                step="500"
                                value={battlePoints}
                                onChange={(e) => setBattlePoints(parseInt(e.target.value))}
                            />
                        </Form.Group>
                    </>
                )}

                {/* Map size — shown for both new and existing battles */}
                <Form.Group className="mb-3">
                    <Form.Label>Map Size</Form.Label>
                    <Form.Select
                        value={mapSizePreset}
                        onChange={(e) => handlePresetChange(parseInt(e.target.value))}
                        disabled={!!existingBattle?.mapConfig} // locked if inherited
                    >
                        {MAP_SIZES.map((size, idx) => (
                            <option key={idx} value={idx}>{size.label}</option>
                        ))}
                    </Form.Select>
                </Form.Group>

                {isCustom && (
                    <Row className="mb-3">
                        <Col>
                            <Form.Group>
                                <Form.Label>Width (inches)</Form.Label>
                                <Form.Control
                                    type="number" min="12" max="120"
                                    value={mapWidthIn}
                                    onChange={(e) => setMapWidthIn(parseInt(e.target.value) || 44)}
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group>
                                <Form.Label>Height (inches)</Form.Label>
                                <Form.Control
                                    type="number" min="12" max="120"
                                    value={mapHeightIn}
                                    onChange={(e) => setMapHeightIn(parseInt(e.target.value) || 30)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                )}

                <Form.Text className="d-block mb-3 text-muted">
                    Map: {mapWidthIn}" × {mapHeightIn}"
                    {' '}({Math.ceil(mapWidthIn * 25.4 / 25)} × {Math.ceil(mapHeightIn * 25.4 / 25)} zones at 25mm each)
                </Form.Text>

                <Form.Group className="mb-3">
                    <Form.Label>Select Friend</Form.Label>
                    <Form.Select
                        value={selectedFriend}
                        onChange={(e) => setSelectedFriend(e.target.value)}
                    >
                        <option value="">Choose a friend...</option>
                        {friends.map(friend => (
                            <option key={friend.id} value={friend.id}>
                                {friend.username}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                {!existingBattle && (
                    <Form.Group className="mb-3">
                        <Form.Label>Your Army</Form.Label>
                        <Form.Select
                            value={selectedArmy}
                            onChange={(e) => setSelectedArmy(e.target.value)}
                        >
                            <option value="">Choose your army...</option>
                            {armies.map(army => (
                                <option key={army.id} value={army.id}>
                                    {army.name} ({army.totalPoints || 0} pts)
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                )}

                <Form.Group className="mb-3">
                    <Form.Label>Message (Optional)</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={2}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Add a personal message..."
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={sendInvitation}
                    disabled={loading || !selectedFriend || (!existingBattle && !selectedArmy)}
                >
                    {loading ? 'Sending...' : 'Send Invitation'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AoSBattleInviteForm;