import React, { useState, useEffect } from 'react';
import { Card, Button, ListGroup, Badge, Form, InputGroup, Alert } from 'react-bootstrap';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../layout/LoadingSpinner';

const FriendsList = () => {
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [searchUser, setSearchUser] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) return;

        // Listen to friends
        const friendsQuery = query(
            collection(db, 'users', currentUser.uid, 'friends'),
            where('status', '==', 'accepted')
        );
        
        const unsubscribeFriends = onSnapshot(friendsQuery, (snapshot) => {
            const friendsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setFriends(friendsData);
            setLoading(false);
        });

        // Listen to pending friend requests
        const requestsQuery = query(
            collection(db, 'users', currentUser.uid, 'friend-requests'),
            where('status', '==', 'pending')
        );
        
        const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
            const requestsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPendingRequests(requestsData);
        });

        return () => {
            unsubscribeFriends();
            unsubscribeRequests();
        };
    }, [currentUser]);

    const searchForUser = async () => {
        if (!searchUser.trim()) return;
        
        try {
            const usersQuery = query(
                collection(db, 'users'),
                where('username', '==', searchUser.toLowerCase())
            );
            
            const snapshot = await getDocs(usersQuery);
            if (!snapshot.empty) {
                const userData = snapshot.docs[0];
                if (userData.id !== currentUser.uid) {
                    await sendFriendRequest(userData.id, userData.data());
                }
            } else {
                setError('User not found');
            }
        } catch (err) {
            setError('Error searching for user');
        }
    };

    const sendFriendRequest = async (toUserId, userData) => {
        try {
            // Add to recipient's friend requests
            await addDoc(collection(db, 'users', toUserId, 'friend-requests'), {
                fromUserId: currentUser.uid,
                fromUsername: currentUser.displayName || currentUser.email,
                toUserId,
                message: `${currentUser.displayName || currentUser.email} wants to be friends`,
                status: 'pending',
                createdAt: serverTimestamp()
            });
            
            setSearchUser('');
            setError('');
        } catch (err) {
            setError('Failed to send friend request');
        }
    };

    const acceptFriendRequest = async (request) => {
        try {
            // Add friend to both users
            await addDoc(collection(db, 'users', currentUser.uid, 'friends'), {
                userId: request.fromUserId,
                username: request.fromUsername,
                status: 'accepted',
                acceptedAt: serverTimestamp()
            });
            
            await addDoc(collection(db, 'users', request.fromUserId, 'friends'), {
                userId: currentUser.uid,
                username: currentUser.displayName || currentUser.email,
                status: 'accepted',
                acceptedAt: serverTimestamp()
            });
            
            // Update request status
            await updateDoc(doc(db, 'users', currentUser.uid, 'friend-requests', request.id), {
                status: 'accepted'
            });
        } catch (err) {
            setError('Failed to accept friend request');
        }
    };

    if (loading) return <LoadingSpinner text="Loading friends..." />;

    return (
        <div className="friends-list">
            {error && <Alert variant="danger">{error}</Alert>}
            
            {/* Add Friend */}
            <Card className="mb-4">
                <Card.Header>
                    <h5 className="mb-0">Add Friend</h5>
                </Card.Header>
                <Card.Body>
                    <InputGroup>
                        <Form.Control
                            type="text"
                            placeholder="Enter username"
                            value={searchUser}
                            onChange={(e) => setSearchUser(e.target.value)}
                        />
                        <Button variant="primary" onClick={searchForUser}>
                            Send Request
                        </Button>
                    </InputGroup>
                </Card.Body>
            </Card>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <Card className="mb-4">
                    <Card.Header>
                        <h5 className="mb-0">Friend Requests</h5>
                    </Card.Header>
                    <ListGroup variant="flush">
                        {pendingRequests.map(request => (
                            <ListGroup.Item key={request.id} className="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>{request.fromUsername}</strong>
                                    <div className="small text-muted">{request.message}</div>
                                </div>
                                <div>
                                    <Button 
                                        size="sm" 
                                        variant="success" 
                                        onClick={() => acceptFriendRequest(request)}
                                        className="me-2"
                                    >
                                        Accept
                                    </Button>
                                    <Button size="sm" variant="outline-secondary">
                                        Decline
                                    </Button>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Card>
            )}

            {/* Friends List */}
            <Card>
                <Card.Header>
                    <h5 className="mb-0">Friends ({friends.length})</h5>
                </Card.Header>
                {friends.length === 0 ? (
                    <Card.Body>
                        <p className="text-muted text-center">No friends yet. Add some friends to start playing together!</p>
                    </Card.Body>
                ) : (
                    <ListGroup variant="flush">
                        {friends.map(friend => (
                            <ListGroup.Item key={friend.id} className="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>{friend.username}</strong>
                                    <Badge bg="success" className="ms-2">Online</Badge>
                                </div>
                                <Button size="sm" variant="primary">
                                    Invite to Battle
                                </Button>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Card>
        </div>
    );
};

export default FriendsList;