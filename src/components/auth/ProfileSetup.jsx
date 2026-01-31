import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { doc, setDoc, getDoc, query, where, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';

const ProfileSetup = ({ onComplete }) => {
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [checking, setChecking] = useState(false);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (currentUser) {
            setDisplayName(currentUser.displayName || '');
        }
    }, [currentUser]);

    const checkUsernameAvailable = async (usernameToCheck) => {
        if (!usernameToCheck || usernameToCheck.length < 3) return false;
        
        setChecking(true);
        try {
            const q = query(
                collection(db, 'users'),
                where('username', '==', usernameToCheck.toLowerCase())
            );
            const snapshot = await getDocs(q);
            return snapshot.empty;
        } catch (err) {
            console.error('Error checking username:', err);
            return false;
        } finally {
            setChecking(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }
        
        const isAvailable = await checkUsernameAvailable(username);
        if (!isAvailable) {
            setError('Username is not available');
            return;
        }

        try {
            setLoading(true);
            
            await setDoc(doc(db, 'users', currentUser.uid), {
                username: username.toLowerCase(),
                displayName: displayName || currentUser.displayName || username,
                email: currentUser.email,
                createdAt: new Date(),
                isProfileComplete: true
            });

            onComplete && onComplete();
        } catch (err) {
            setError('Failed to create profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <Card.Header>
                <h4>Complete Your Profile</h4>
            </Card.Header>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Username*</Form.Label>
                        <Form.Control
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Choose a unique username"
                            required
                            minLength={3}
                        />
                        <Form.Text className="text-muted">
                            This will be used for friend invitations and battles
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Display Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="How others will see you"
                        />
                    </Form.Group>

                    <Button 
                        type="submit" 
                        variant="primary" 
                        disabled={loading || checking}
                        className="w-100"
                    >
                        {loading ? 'Creating Profile...' : 'Complete Setup'}
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default ProfileSetup;