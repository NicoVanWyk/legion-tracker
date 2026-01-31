// src/components/social/SocialPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Badge, Form, InputGroup, Alert, Modal, Tab, Tabs, Spinner } from 'react-bootstrap';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../layout/LoadingSpinner';

const SocialPage = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    
    // State management
    const [friends, setFriends] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [battleInvitations, setBattleInvitations] = useState([]);
    const [armies, setArmies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Form states
    const [searchUsername, setSearchUsername] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    
    // Modal states
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [selectedArmy, setSelectedArmy] = useState('');
    const [inviteMessage, setInviteMessage] = useState('');
    const [sending, setSending] = useState(false);

    // Real-time listeners
    useEffect(() => {
        if (!currentUser) return;

        const unsubscribers = [];

        // Listen to friends
        const friendsQuery = query(
            collection(db, 'users', currentUser.uid, 'friends'),
            where('status', '==', 'accepted')
        );
        unsubscribers.push(onSnapshot(friendsQuery, (snapshot) => {
            const friendsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setFriends(friendsData);
        }));

        // Listen to incoming friend requests
        const incomingQuery = query(
            collection(db, 'users', currentUser.uid, 'friend-requests'),
            where('status', '==', 'pending'),
            orderBy('createdAt', 'desc')
        );
        unsubscribers.push(onSnapshot(incomingQuery, (snapshot) => {
            const requests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setIncomingRequests(requests);
        }));

        // Listen to outgoing friend requests
        const outgoingQuery = query(
            collection(db, 'friend-requests'),
            where('fromUserId', '==', currentUser.uid),
            where('status', '==', 'pending')
        );
        unsubscribers.push(onSnapshot(outgoingQuery, (snapshot) => {
            const requests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setOutgoingRequests(requests);
        }));

        // Listen to battle invitations
        const invitationsQuery = query(
            collection(db, 'battle-invitations'),
            where('toUserId', '==', currentUser.uid),
            where('status', '==', 'pending'),
            orderBy('createdAt', 'desc')
        );
        unsubscribers.push(onSnapshot(invitationsQuery, (snapshot) => {
            const invitations = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setBattleInvitations(invitations);
        }));

        // Fetch user's armies
        const fetchArmies = async () => {
            try {
                const armiesQuery = collection(db, 'users', currentUser.uid, 'armies');
                const armiesSnapshot = await getDocs(armiesQuery);
                setArmies(armiesSnapshot.docs.map(doc => ({ 
                    id: doc.id, 
                    ...doc.data() 
                })));
            } catch (err) {
                console.error('Error fetching armies:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchArmies();

        return () => unsubscribers.forEach(unsub => unsub());
    }, [currentUser]);

    // Search for users
    const searchUsers = async () => {
        if (!searchUsername.trim()) return;
        
        try {
            setSearching(true);
            setSearchResults([]);
            
            const usersQuery = query(
                collection(db, 'users'),
                where('username', '>=', searchUsername.toLowerCase()),
                where('username', '<=', searchUsername.toLowerCase() + '\uf8ff')
            );
            
            const snapshot = await getDocs(usersQuery);
            const users = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(user => user.id !== currentUser.uid); // Exclude self
            
            setSearchResults(users);
        } catch (err) {
            setError('Error searching for users');
        } finally {
            setSearching(false);
        }
    };

    // Send friend request
    const sendFriendRequest = async (toUser) => {
        try {
            // Check if already friends or request exists
            const existingFriend = friends.find(f => f.userId === toUser.id);
            const existingRequest = outgoingRequests.find(r => r.toUserId === toUser.id);
            
            if (existingFriend) {
                setError('Already friends with this user');
                return;
            }
            
            if (existingRequest) {
                setError('Friend request already sent');
                return;
            }

            // Add to recipient's friend requests
            await addDoc(collection(db, 'users', toUser.id, 'friend-requests'), {
                fromUserId: currentUser.uid,
                fromUsername: currentUser.displayName || currentUser.email,
                fromEmail: currentUser.email,
                message: `${currentUser.displayName || currentUser.email} wants to be friends`,
                status: 'pending',
                createdAt: serverTimestamp()
            });

            // Add to global friend requests for tracking
            await addDoc(collection(db, 'friend-requests'), {
                fromUserId: currentUser.uid,
                toUserId: toUser.id,
                status: 'pending',
                createdAt: serverTimestamp()
            });
            
            setSuccess(`Friend request sent to ${toUser.displayName || toUser.username}`);
            setSearchUsername('');
            setSearchResults([]);
        } catch (err) {
            setError('Failed to send friend request');
        }
    };

    // Accept friend request
    const acceptFriendRequest = async (request) => {
        try {
            // Add friend to both users
            await addDoc(collection(db, 'users', currentUser.uid, 'friends'), {
                userId: request.fromUserId,
                username: request.fromUsername,
                email: request.fromEmail,
                status: 'accepted',
                acceptedAt: serverTimestamp()
            });
            
            await addDoc(collection(db, 'users', request.fromUserId, 'friends'), {
                userId: currentUser.uid,
                username: currentUser.displayName || currentUser.email,
                email: currentUser.email,
                status: 'accepted',
                acceptedAt: serverTimestamp()
            });
            
            // Update request status
            await updateDoc(doc(db, 'users', currentUser.uid, 'friend-requests', request.id), {
                status: 'accepted'
            });

            setSuccess(`You are now friends with ${request.fromUsername}!`);
        } catch (err) {
            setError('Failed to accept friend request');
        }
    };

    // Decline friend request
    const declineFriendRequest = async (request) => {
        try {
            await updateDoc(doc(db, 'users', currentUser.uid, 'friend-requests', request.id), {
                status: 'declined'
            });
            setSuccess('Friend request declined');
        } catch (err) {
            setError('Failed to decline friend request');
        }
    };

    // Open invite modal
    const openInviteModal = (friend) => {
        setSelectedFriend(friend);
        setShowInviteModal(true);
    };

    // Send battle invitation
    const sendBattleInvitation = async () => {
        if (!selectedFriend || !selectedArmy) {
            setError('Please select an army');
            return;
        }

        try {
            setSending(true);
            
            // Create shared battle
            const battleData = {
                participants: {
                    [currentUser.uid]: {
                        role: 'blue',
                        armyId: selectedArmy,
                        username: currentUser.displayName || currentUser.email,
                        userId: currentUser.uid
                    }
                },
                battleData: {
                    name: `${currentUser.displayName || currentUser.email} vs ${selectedFriend.username}`,
                    currentPhase: 'setup',
                    currentRound: 1,
                    isActive: false,
                    activePlayer: 'blue',
                    bluePlayer: currentUser.displayName || currentUser.email,
                    redPlayer: selectedFriend.username,
                    blueUnits: [],
                    redUnits: []
                },
                createdBy: currentUser.uid,
                createdAt: serverTimestamp(),
                status: 'pending'
            };

            const battleRef = await addDoc(collection(db, 'shared-battles'), battleData);

            // Create battle invitation
            await addDoc(collection(db, 'battle-invitations'), {
                fromUserId: currentUser.uid,
                fromUsername: currentUser.displayName || currentUser.email,
                toUserId: selectedFriend.userId,
                toUsername: selectedFriend.username,
                battleId: battleRef.id,
                hostArmyId: selectedArmy,
                message: inviteMessage || 'Join me for a Star Wars Legion battle!',
                status: 'pending',
                createdAt: serverTimestamp(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            });

            setSuccess(`Battle invitation sent to ${selectedFriend.username}!`);
            setShowInviteModal(false);
            setSelectedFriend(null);
            setSelectedArmy('');
            setInviteMessage('');
        } catch (err) {
            setError('Failed to send battle invitation');
        } finally {
            setSending(false);
        }
    };

    // Accept battle invitation
    const acceptBattleInvitation = async (invitation) => {
        try {
            // Update shared battle with guest army
            const selectedGuestArmy = armies[0]?.id; // For demo, select first army
            if (!selectedGuestArmy) {
                setError('You need to create an army first');
                return;
            }

            await updateDoc(doc(db, 'shared-battles', invitation.battleId), {
                [`participants.${currentUser.uid}`]: {
                    role: 'red',
                    armyId: selectedGuestArmy,
                    username: currentUser.displayName || currentUser.email,
                    userId: currentUser.uid
                },
                'battleData.isActive': true,
                status: 'active'
            });

            // Update invitation status
            await updateDoc(doc(db, 'battle-invitations', invitation.id), {
                status: 'accepted',
                guestArmyId: selectedGuestArmy
            });

            setSuccess('Battle invitation accepted! Navigating to battle...');
            setTimeout(() => {
                navigate(`/shared-battles/${invitation.battleId}`);
            }, 1500);
        } catch (err) {
            setError('Failed to accept battle invitation');
        }
    };

    // Decline battle invitation
    const declineBattleInvitation = async (invitation) => {
        try {
            await updateDoc(doc(db, 'battle-invitations', invitation.id), {
                status: 'declined'
            });
            setSuccess('Battle invitation declined');
        } catch (err) {
            setError('Failed to decline battle invitation');
        }
    };

    if (loading) {
        return <LoadingSpinner text="Loading social features..." />;
    }

    return (
        <Container fluid className="social-page">
            <h2 className="mb-4">Social & Multiplayer</h2>
            
            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
            {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

            <Tabs defaultActiveKey="friends" className="mb-4">
                {/* Friends Tab */}
                <Tab eventKey="friends" title={`Friends (${friends.length})`}>
                    <Row>
                        <Col lg={8}>
                            {/* Add Friend */}
                            <Card className="mb-4">
                                <Card.Header>
                                    <h5 className="mb-0">Add New Friend</h5>
                                </Card.Header>
                                <Card.Body>
                                    <InputGroup className="mb-3">
                                        <Form.Control
                                            type="text"
                                            placeholder="Search by username..."
                                            value={searchUsername}
                                            onChange={(e) => setSearchUsername(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                                        />
                                        <Button 
                                            variant="primary" 
                                            onClick={searchUsers}
                                            disabled={searching}
                                        >
                                            {searching ? <Spinner size="sm" /> : 'Search'}
                                        </Button>
                                    </InputGroup>
                                    
                                    {searchResults.length > 0 && (
                                        <div className="search-results">
                                            <h6>Search Results:</h6>
                                            {searchResults.map(user => (
                                                <div key={user.id} className="d-flex justify-content-between align-items-center p-2 border rounded mb-2">
                                                    <div>
                                                        <strong>{user.displayName || user.username}</strong>
                                                        <div className="small text-muted">{user.email}</div>
                                                    </div>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline-primary"
                                                        onClick={() => sendFriendRequest(user)}
                                                    >
                                                        Add Friend
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>

                            {/* Friends List */}
                            <Card>
                                <Card.Header>
                                    <h5 className="mb-0">Your Friends</h5>
                                </Card.Header>
                                {friends.length === 0 ? (
                                    <Card.Body>
                                        <p className="text-muted text-center">
                                            No friends yet. Search for users above to add them!
                                        </p>
                                    </Card.Body>
                                ) : (
                                    <ListGroup variant="flush">
                                        {friends.map(friend => (
                                            <ListGroup.Item key={friend.id} className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <strong>{friend.username}</strong>
                                                    <div className="small text-muted">{friend.email}</div>
                                                </div>
                                                <div className="d-flex gap-2">
                                                    <Badge bg="success">Online</Badge>
                                                    <Button 
                                                        size="sm" 
                                                        variant="primary"
                                                        onClick={() => openInviteModal(friend)}
                                                    >
                                                        Invite to Battle
                                                    </Button>
                                                </div>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                            </Card>
                        </Col>

                        <Col lg={4}>
                            {/* Outgoing Requests */}
                            {outgoingRequests.length > 0 && (
                                <Card className="mb-4">
                                    <Card.Header>
                                        <h6 className="mb-0">Pending Requests ({outgoingRequests.length})</h6>
                                    </Card.Header>
                                    <ListGroup variant="flush">
                                        {outgoingRequests.map(request => (
                                            <ListGroup.Item key={request.id}>
                                                <div className="small">
                                                    Sent to: <strong>{request.toUsername}</strong>
                                                </div>
                                                <Badge bg="warning">Pending</Badge>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </Card>
                            )}
                        </Col>
                    </Row>
                </Tab>

                {/* Requests Tab */}
                <Tab eventKey="requests" title={`Requests (${incomingRequests.length})`}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Friend Requests</h5>
                        </Card.Header>
                        {incomingRequests.length === 0 ? (
                            <Card.Body>
                                <p className="text-muted text-center">No pending friend requests</p>
                            </Card.Body>
                        ) : (
                            <ListGroup variant="flush">
                                {incomingRequests.map(request => (
                                    <ListGroup.Item key={request.id}>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <strong>{request.fromUsername}</strong>
                                                <div className="small text-muted">{request.message}</div>
                                                <div className="small text-muted">
                                                    {request.createdAt?.toDate().toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <Button 
                                                    size="sm" 
                                                    variant="success"
                                                    onClick={() => acceptFriendRequest(request)}
                                                >
                                                    Accept
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline-danger"
                                                    onClick={() => declineFriendRequest(request)}
                                                >
                                                    Decline
                                                </Button>
                                            </div>
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </Card>
                </Tab>

                {/* Battle Invitations Tab */}
                <Tab eventKey="invitations" title={`Battle Invites (${battleInvitations.length})`}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Battle Invitations</h5>
                        </Card.Header>
                        {battleInvitations.length === 0 ? (
                            <Card.Body>
                                <p className="text-muted text-center">No pending battle invitations</p>
                            </Card.Body>
                        ) : (
                            <ListGroup variant="flush">
                                {battleInvitations.map(invitation => (
                                    <ListGroup.Item key={invitation.id}>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <strong>{invitation.fromUsername}</strong> invited you to battle
                                                <div className="small text-muted">{invitation.message}</div>
                                                <div className="small text-muted">
                                                    {invitation.createdAt?.toDate().toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <Button 
                                                    size="sm" 
                                                    variant="success"
                                                    onClick={() => acceptBattleInvitation(invitation)}
                                                >
                                                    Accept
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline-danger"
                                                    onClick={() => declineBattleInvitation(invitation)}
                                                >
                                                    Decline
                                                </Button>
                                            </div>
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </Card>
                </Tab>
            </Tabs>

            {/* Battle Invitation Modal */}
            <Modal show={showInviteModal} onHide={() => setShowInviteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Invite {selectedFriend?.username} to Battle</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Select Your Army</Form.Label>
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
                        {armies.length === 0 && (
                            <Form.Text className="text-muted">
                                You need to create an army first to send battle invitations.
                            </Form.Text>
                        )}
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Message (Optional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={inviteMessage}
                            onChange={(e) => setInviteMessage(e.target.value)}
                            placeholder="Add a personal message..."
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowInviteModal(false)}>
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={sendBattleInvitation}
                        disabled={sending || !selectedArmy}
                    >
                        {sending ? 'Sending...' : 'Send Invitation'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default SocialPage;