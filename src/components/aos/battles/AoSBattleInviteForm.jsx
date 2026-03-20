import React, {useState, useEffect} from 'react';
import {Modal, Form, Button, Alert, ListGroup} from 'react-bootstrap';
import {collection, query, where, getDocs, addDoc, serverTimestamp} from 'firebase/firestore';
import {db} from '../../../firebase/config';
import {useAuth} from '../../../contexts/AuthContext';

const AoSBattleInviteForm = ({show, onHide, onInviteSent}) => {
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
                where('gameSystem', '==', 'AOS')
            );
            const armiesSnapshot = await getDocs(armiesQuery);
            setArmies(armiesSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
        } catch (err) {
            setError('Failed to load friends and armies');
        }
    };

    const sendInvitation = async () => {
        if (!selectedFriend || !selectedArmy) {
            setError('Please select a friend and an army');
            return;
        }

        try {
            setLoading(true);

            const sharedBattleData = {
                name: battleName || `${currentUser.displayName || 'Player 1'} vs ${friends.find(f => f.id === selectedFriend)?.username}`,
                gameSystem: 'AOS',
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
                    invitedAt: serverTimestamp()
                }],

                battleData: {
                    currentPhase: 'SETUP',
                    currentRound: 1,
                    isActive: false
                },

                createdBy: currentUser.uid,
                createdAt: serverTimestamp()
            };

            const battleRef = await addDoc(collection(db, 'aos-shared-battles'), sharedBattleData);

            await addDoc(collection(db, 'aos-battle-invitations'), {
                fromUserId: currentUser.uid,
                fromUsername: currentUser.displayName || currentUser.email,
                toUserId: selectedFriend,
                battleId: battleRef.id,
                message: message || 'Join me for an Age of Sigmar battle!',
                battlePoints: battlePoints,
                status: 'pending',
                createdAt: serverTimestamp(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });

            onInviteSent && onInviteSent();
            onHide();

            setSelectedFriend('');
            setSelectedArmy('');
            setBattleName('');
            setMessage('');
        } catch (err) {
            console.error('Error sending invitation:', err);
            setError('Failed to send invitation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Invite to AoS Battle</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}

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
                    disabled={loading || !selectedFriend || !selectedArmy}
                >
                    {loading ? 'Sending...' : 'Send Invitation'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AoSBattleInviteForm;