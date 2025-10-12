// src/components/custom/CustomUnitTypeForm.jsx (Fixed)
import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, doc, addDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';

const CustomUnitTypeForm = () => {
    const { typeId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        displayName: '',
        description: '',
        icon: '',
        sortOrder: 100
    });

    useEffect(() => {
        if (typeId && currentUser) {
            fetchUnitType();
        }
    }, [typeId, currentUser]);

    const fetchUnitType = async () => {
        if (!currentUser) return;

        try {
            const typeRef = doc(db, 'users', currentUser.uid, 'customUnitTypes', typeId);
            const typeDoc = await getDoc(typeRef);

            if (typeDoc.exists()) {
                const data = typeDoc.data();
                setFormData({
                    name: data.name || '',
                    displayName: data.displayName || '',
                    description: data.description || '',
                    icon: data.icon || '',
                    sortOrder: data.sortOrder || 100
                });
            } else {
                setError('Unit type not found');
            }
        } catch (err) {
            console.error('Error fetching unit type:', err);
            setError('Failed to load unit type: ' + err.message);
        }
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            setError('You must be logged in to create unit types');
            return;
        }

        if (!formData.name.trim()) {
            setError('Name is required');
            return;
        }

        if (!formData.displayName.trim()) {
            setError('Display name is required');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Create a slug from the name (lowercase, replace spaces with underscores)
            const slug = formData.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

            const typeData = {
                name: slug,
                displayName: formData.displayName.trim(),
                description: formData.description.trim(),
                icon: formData.icon.trim(),
                sortOrder: formData.sortOrder || 100,
                lastUpdated: serverTimestamp(),
                userId: currentUser.uid
            };

            if (typeId) {
                await updateDoc(
                    doc(db, 'users', currentUser.uid, 'customUnitTypes', typeId),
                    typeData
                );
                setSuccess('Unit type updated successfully!');
            } else {
                typeData.createdAt = serverTimestamp();
                await addDoc(
                    collection(db, 'users', currentUser.uid, 'customUnitTypes'),
                    typeData
                );
                setSuccess('Unit type created successfully!');

                // Reset form
                setFormData({
                    name: '',
                    displayName: '',
                    description: '',
                    icon: '',
                    sortOrder: 100
                });
            }

            setTimeout(() => {
                navigate('/units/types');
            }, 1500);
        } catch (err) {
            console.error('Error saving unit type:', err);
            setError('Failed to save unit type: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <Card.Header>
                <h3 className="mb-0">{typeId ? 'Edit' : 'Create'} Custom Unit Type</h3>
            </Card.Header>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Type Name*</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., elite_guard"
                                    required
                                />
                                <Form.Text className="text-muted">
                                    Internal name (will be converted to lowercase with underscores)
                                </Form.Text>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Display Name*</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    placeholder="e.g., Elite Guard"
                                    required
                                />
                                <Form.Text className="text-muted">
                                    Name shown in the interface
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe what this unit type represents..."
                            rows={3}
                        />
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Icon (Optional)</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="icon"
                                    value={formData.icon}
                                    onChange={handleChange}
                                    placeholder="e.g., bi-shield-fill"
                                />
                                <Form.Text className="text-muted">
                                    Bootstrap icon class (see <a href="https://icons.getbootstrap.com" target="_blank" rel="noopener noreferrer">icons.getbootstrap.com</a>)
                                </Form.Text>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Sort Order</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="sortOrder"
                                    value={formData.sortOrder}
                                    onChange={handleChange}
                                    min="0"
                                    max="999"
                                />
                                <Form.Text className="text-muted">
                                    Lower numbers appear first in lists (0-999)
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-between">
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/units/types')}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? 'Saving...' : (typeId ? 'Update' : 'Create') + ' Unit Type'}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default CustomUnitTypeForm;