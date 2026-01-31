import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, ListGroup, Badge } from 'react-bootstrap';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';

const BattleInviteForm = ({ show, onHide, onInviteSent }) => {
    const [friends, setFriends] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState('');
    const [selectedArmy, setSelectedArmy] = useState('');
    const [armies, setArmies] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { currentUser } = useAuth();

    useEffect(() => {
        if (show && currentUser) {
            fetchFriendsAndArmies();
        }
    }, [show, currentUser]);

    const fetchFriendsAndArmies = async () => {
        try {
            // Fetch friends
            const friendsQuery = query(
                collection(db, 'users', currentUser.uid, 'friends'),
                where('status', '==', 'accepted')
            );
            const friendsSnapshot = await getDocs(friendsQuery);
            setFriends(friendsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            // Fetch user's armies
            const armiesQuery = collection(db, 'users', currentUser.uid, 'armies');
            const armiesSnapshot = await getDocs(armiesQuery);
            setArmies(armiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
            
            // Create shared battle
            const battleData = {
                participants: {
                    [currentUser.uid]: {
                        role: 'host',
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
                    name: `${currentUser.displayName || currentUser.email} vs ${friends.find(f => f.id === selectedFriend)?.username}`,
                    currentPhase: 'setup',
                    currentRound: 0,
                    isActive: false
                },
                createdBy: currentUser.uid,
                createdAt: serverTimestamp()
            };

            const battleRef = await addDoc(collection(db, 'shared-battles'), battleData);

            // Create battle invitation
            await addDoc(collection(db, 'battle-invitations'), {
                fromUserId: currentUser.uid,
                fromUsername: currentUser.displayName || currentUser.email,
                toUserId: selectedFriend,
                battleId: battleRef.id,
                message: message || 'Join me for a battle!',
                status: 'pending',
                createdAt: serverTimestamp(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            });

            onInviteSent && onInviteSent();
            onHide();
            
            setSelectedFriend('');
            setSelectedArmy('');
            setMessage('');
        } catch (err) {
            setError('Failed to send invitation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Invite Friend to Battle</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                
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

export default BattleInviteForm;