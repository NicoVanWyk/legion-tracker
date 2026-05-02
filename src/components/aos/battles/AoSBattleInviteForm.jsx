import React, {useState, useEffect} from 'react';
import {Modal, Form, Button, Alert, ListGroup} from 'react-bootstrap';
import {collection, query, where, getDocs, addDoc, serverTimestamp} from 'firebase/firestore';
import {db} from '../../../firebase/config';
import {useAuth} from '../../../contexts/AuthContext';
import GameSystems from '../../../enums/GameSystems';

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
    const {currentUser} = useAuth();

    useEffect(() => {
        if (show && currentUser) {
            fetchFriendsAndArmies();
        }
    }, [show, currentUser]);

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
            let battleData;

            if (existingBattle && existingBattleId) {
                // Inviting to existing battle - convert to shared battle
                battleData = {
                    name: existingBattle.name,
                    gameSystem: GameSystems.AOS,
                    battlePointsLimit: existingBattle.battlePointsLimit,

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
                        isSharedBattle: true,
                        isActive: false
                    },

                    createdBy: currentUser.uid,
                    createdAt: new Date(),
                    originalBattleId: existingBattleId
                };

                battleRef = await addDoc(collection(db, 'aos-shared-battles'), battleData);
            } else {
                // Creating new battle
                battleData = {
                    name: battleName || `${currentUser.displayName || 'Player 1'} vs ${friends.find(f => f.id === selectedFriend)?.username}`,
                    gameSystem: GameSystems.AOS,
                    battlePointsLimit: battlePoints,

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