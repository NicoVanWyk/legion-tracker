import React, {useState, useEffect} from 'react';
import {Card, ListGroup, Button, Badge, Alert, Modal, Form} from 'react-bootstrap';
import {collection, query, where, getDocs, updateDoc, doc, getDoc} from 'firebase/firestore';
import {db} from '../../../firebase/config';
import {useAuth} from '../../../contexts/AuthContext';
import {useNavigate} from 'react-router-dom';
import GameSystems from '../../../enums/GameSystems';
import LoadingSpinner from '../../layout/LoadingSpinner';

const AoSBattleInvitations = () => {
    const {currentUser} = useAuth();
    const navigate = useNavigate();
    const [invitations, setInvitations] = useState([]);
    const [armies, setArmies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [selectedInvite, setSelectedInvite] = useState(null);
    const [selectedArmy, setSelectedArmy] = useState('');

    useEffect(() => {
        if (currentUser) {
            fetchInvitations();
            fetchArmies();
        }
    }, [currentUser]);

    const fetchInvitations = async () => {
        try {
            const invitesQuery = query(
                collection(db, 'aos-battle-invitations'),
                where('toUserId', '==', currentUser.uid),
                where('status', '==', 'pending')
            );
            const snapshot = await getDocs(invitesQuery);
            setInvitations(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
        } catch (err) {
            console.error('Error fetching invitations:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchArmies = async () => {
        try {
            const armiesQuery = query(
                collection(db, 'users', currentUser.uid, 'armies'),
                where('gameSystem', '==', GameSystems.AOS)
            );
            const snapshot = await getDocs(armiesQuery);
            setArmies(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
        } catch (err) {
            console.error('Error fetching armies:', err);
        }
    };

    const handleAccept = async () => {
        if (!selectedArmy || !selectedInvite) return;

        try {
            const inviteRef = doc(db, 'aos-battle-invitations', selectedInvite.id);
            await updateDoc(inviteRef, {status: 'accepted'});

            const battleRef = doc(db, 'aos-shared-battles', selectedInvite.battleId);
            const battleDoc = await getDoc(battleRef);

            if (battleDoc.exists()) {
                const battleData = battleDoc.data();
                await updateDoc(battleRef, {
                    participants: {
                        ...battleData.participants,
                        [currentUser.uid]: {
                            role: 'player2',
                            armyId: selectedArmy,
                            username: currentUser.displayName || currentUser.email
                        }
                    },
                    'battleData.isActive': true
                });
            }

            navigate(`/aos/shared-battles/${selectedInvite.battleId}`);
        } catch (err) {
            console.error('Error accepting invitation:', err);
        }
    };

    const handleDecline = async (inviteId) => {
        try {
            const inviteRef = doc(db, 'aos-battle-invitations', inviteId);
            await updateDoc(inviteRef, {status: 'declined'});
            setInvitations(invitations.filter(i => i.id !== inviteId));
        } catch (err) {
            console.error('Error declining invitation:', err);
        }
    };

    if (loading) return <LoadingSpinner text="Loading invitations..."/>;

    return (
        <>
            <Card>
                <Card.Header>
                    <h4>AoS Battle Invitations</h4>
                </Card.Header>
                <Card.Body>
                    {invitations.length === 0 ? (
                        <Alert variant="info">No pending battle invitations</Alert>
                    ) : (
                        <ListGroup>
                            {invitations.map(invite => (
                                <ListGroup.Item key={invite.id}>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h6>{invite.fromUsername} invites you to battle!</h6>
                                            <p className="mb-1">{invite.message}</p>
                                            <small className="text-muted">
                                                Battle Size: {invite.battlePoints} points
                                            </small>
                                        </div>
                                        <div>
                                            <Button
                                                variant="success"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => {
                                                    setSelectedInvite(invite);
                                                    setShowAcceptModal(true);
                                                }}
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDecline(invite.id)}
                                            >
                                                Decline
                                            </Button>
                                        </div>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showAcceptModal} onHide={() => setShowAcceptModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Accept Battle Invitation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
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
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAcceptModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleAccept}
                        disabled={!selectedArmy}
                    >
                        Join Battle
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default AoSBattleInvitations;