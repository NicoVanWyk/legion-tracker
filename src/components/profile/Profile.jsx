// src/components/profile/Profile.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner, Card, Row, Col } from 'react-bootstrap';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [userProfile, setUserProfile] = useState({
        displayName: '',
        email: '',
        photoURL: '',
        newPassword: '',
        confirmPassword: '',
        currentPassword: ''
    });

    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    // Check if email or password has changed to require current password
    const emailChanged = userProfile.email !== currentUser.email;
    const passwordChanged = userProfile.newPassword.length > 0;
    const needsReauth = emailChanged || passwordChanged;

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const userRef = doc(db, 'users', currentUser.uid);
                const userSnapshot = await getDoc(userRef);

                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data();
                    setUserProfile({
                        displayName: currentUser.displayName || '',
                        email: currentUser.email || '',
                        photoURL: currentUser.photoURL || '',
                        newPassword: '',
                        confirmPassword: '',
                        currentPassword: ''
                    });
                } else {
                    // Create user document if it doesn't exist
                    await updateDoc(userRef, {
                        displayName: currentUser.displayName || '',
                        email: currentUser.email || '',
                        photoURL: currentUser.photoURL || '',
                        createdAt: new Date()
                    });

                    setUserProfile({
                        displayName: currentUser.displayName || '',
                        email: currentUser.email || '',
                        photoURL: currentUser.photoURL || '',
                        newPassword: '',
                        confirmPassword: '',
                        currentPassword: ''
                    });
                }

                setLoading(false);
            } catch (error) {
                setError('Failed to load profile. Please try again later.');
                console.error('Error fetching user profile:', error);
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [currentUser]);

    // Remove useEffect that was showing/hiding password field based on changes

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserProfile({
            ...userProfile,
            [name]: value
        });
    };

    const handleAvatarChange = (e) => {
        if (e.target.files[0]) {
            setAvatar(e.target.files[0]);
            setAvatarPreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const validateForm = () => {
        // Reset error and success messages
        setError('');
        setSuccess('');

        // Check if anything changed
        const isDisplayNameChanged = userProfile.displayName !== currentUser.displayName;
        const isEmailChanged = userProfile.email !== currentUser.email;
        const isPasswordChanged = userProfile.newPassword.length > 0;
        const isAvatarChanged = avatar !== null;

        if (!isDisplayNameChanged && !isEmailChanged && !isPasswordChanged && !isAvatarChanged) {
            setError('No changes to save.');
            return false;
        }

        // Validate password if changed
        if (isPasswordChanged) {
            if (userProfile.newPassword.length < 6) {
                setError('Password must be at least 6 characters');
                return false;
            }

            if (userProfile.newPassword !== userProfile.confirmPassword) {
                setError('Passwords do not match');
                return false;
            }
        }

        // Email or password change requires reauthentication with current password
        if (needsReauth) {
            if (!userProfile.currentPassword) {
                setError('Current password is required to change email or password');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setUpdating(true);

        try {
            // Update authentication profile
            const profileUpdates = {};

            // Handle email/password changes requiring reauthentication
            if (needsReauth) {
                try {
                    // Reauthenticate user
                    const credential = EmailAuthProvider.credential(
                        currentUser.email,
                        userProfile.currentPassword
                    );

                    await reauthenticateWithCredential(auth.currentUser, credential);

                    // Update email if changed
                    if (userProfile.email !== currentUser.email) {
                        await updateEmail(auth.currentUser, userProfile.email);
                        profileUpdates.email = userProfile.email;
                    }

                    // Update password if provided
                    if (userProfile.newPassword) {
                        await updatePassword(auth.currentUser, userProfile.newPassword);
                    }
                } catch (authError) {
                    // Handle specific authentication errors
                    if (authError.code === 'auth/wrong-password') {
                        setError('The current password you entered is incorrect.');
                        setUpdating(false);
                        return;
                    } else {
                        throw authError; // Rethrow other errors
                    }
                }

                // Reset password fields
                setUserProfile({
                    ...userProfile,
                    newPassword: '',
                    confirmPassword: '',
                    currentPassword: ''
                });
            }

            // Handle avatar upload
            if (avatar) {
                const fileExtension = avatar.name.split('.').pop();
                const storageRef = ref(storage, `profile_images/${currentUser.uid}.${fileExtension}`);
                await uploadBytes(storageRef, avatar);
                const photoURL = await getDownloadURL(storageRef);

                profileUpdates.photoURL = photoURL;
                await updateProfile(auth.currentUser, { photoURL });

                // Reset avatar state
                setAvatar(null);
            }

            // Update display name
            if (userProfile.displayName !== currentUser.displayName) {
                profileUpdates.displayName = userProfile.displayName;
                await updateProfile(auth.currentUser, { displayName: userProfile.displayName });
            }

            // Update Firestore document
            if (Object.keys(profileUpdates).length > 0) {
                const userRef = doc(db, 'users', currentUser.uid);
                await updateDoc(userRef, {
                    ...profileUpdates,
                    updatedAt: new Date()
                });
            }

            setSuccess('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);

            if (error.code === 'auth/requires-recent-login') {
                setError('Please log out and log back in to change your email or password.');
            } else if (error.code === 'auth/email-already-in-use') {
                setError('Email is already in use by another account.');
            } else {
                setError('Failed to update profile: ' + (error.message || 'Unknown error'));
            }
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center">
                <Spinner animation="border" />
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="profile-editor">
            <h3 className="mb-4">Edit Profile</h3>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Card className="mb-4 text-center">
                    <Card.Body>
                        <div className="avatar-container">
                            <img
                                src={avatarPreview || userProfile.photoURL || '/default-avatar.png'}
                                alt="Profile"
                                className="rounded-circle mb-3"
                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                            />

                            <div>
                                <Form.Group controlId="avatar" className="mt-2">
                                    <Form.Label className="btn btn-sm btn-outline-secondary">
                                        Change Profile Picture
                                        <Form.Control
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            style={{ display: 'none' }}
                                        />
                                    </Form.Label>
                                </Form.Group>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                <Form.Group controlId="displayName" className="mb-3">
                    <Form.Label>Display Name</Form.Label>
                    <Form.Control
                        type="text"
                        name="displayName"
                        value={userProfile.displayName}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group controlId="email" className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                        type="email"
                        name="email"
                        value={userProfile.email}
                        onChange={handleChange}
                    />
                    {userProfile.email !== currentUser.email && (
                        <Form.Text className="text-warning">
                            Changing email requires password confirmation
                        </Form.Text>
                    )}
                </Form.Group>

                <h5 className="mt-4 mb-3">Change Password</h5>
                <Card className="mb-3">
                    <Card.Body>
                        <Row>
                            <Col md={12} className="mb-3">
                                <Form.Group controlId="currentPassword">
                                    <Form.Label>
                                        Current Password
                                        {needsReauth && <span className="text-danger">*</span>}
                                    </Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="currentPassword"
                                        value={userProfile.currentPassword}
                                        onChange={handleChange}
                                        autoComplete="current-password"
                                        isInvalid={needsReauth && !userProfile.currentPassword && error}
                                        placeholder="Enter your current password"
                                    />
                                    <Form.Text className="text-muted">
                                        Required when changing email or password
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group controlId="newPassword" className="mb-3">
                                    <Form.Label>New Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="newPassword"
                                        value={userProfile.newPassword}
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                        placeholder="Enter new password"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="confirmPassword" className="mb-3">
                                    <Form.Label>Confirm New Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="confirmPassword"
                                        value={userProfile.confirmPassword}
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                        placeholder="Confirm new password"
                                        isInvalid={userProfile.newPassword !== userProfile.confirmPassword && userProfile.confirmPassword}
                                    />
                                    {userProfile.newPassword !== userProfile.confirmPassword && userProfile.confirmPassword && (
                                        <Form.Control.Feedback type="invalid">
                                            Passwords do not match
                                        </Form.Control.Feedback>
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <div className="d-flex justify-content-end mt-4">
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={updating}
                        className="d-flex align-items-center"
                    >
                        {updating && (
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                            />
                        )}
                        {updating ? 'Updating...' : 'Save Changes'}
                    </Button>
                </div>
            </Form>

            <div className="mt-5">
                <h5 className="text-danger">Account Management</h5>
                <p className="text-muted">
                    Need to delete your account? This action cannot be undone.
                </p>
                <Button variant="outline-danger" size="sm">
                    Delete My Account
                </Button>
            </div>
        </div>
    );
};

export default Profile;