// 1. Create src/components/battles/BattleEditForm.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../layout/LoadingSpinner';

const BattleEditForm = () => {
    const { battleId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        bluePlayer: '',
        redPlayer: '',
        objectives: {
            primary: '',
            secondary: '',
            deployment: ''
        }
    });

    // Load battle data
    useEffect(() => {
        const fetchBattle = async () => {
            try {
                setLoading(true);
                const battleRef = doc(db, 'users', currentUser.uid, 'battles', battleId);
                const battleDoc = await getDoc(battleRef);

                if (battleDoc.exists()) {
                    const battleData = battleDoc.data();
                    setFormData({
                        name: battleData.name || '',
                        bluePlayer: battleData.bluePlayer || '',
                        redPlayer: battleData.redPlayer || '',
                        objectives: {
                            primary: battleData.objectives?.primary || '',
                            secondary: battleData.objectives?.secondary || '',
                            deployment: battleData.objectives?.deployment || ''
                        }
                    });
                } else {
                    setError('Battle not found');
                }
            } catch (err) {
                console.error('Error fetching battle:', err);
                setError('Failed to fetch battle details.');
            } finally {
                setLoading(false);
            }
        };

        if (currentUser && battleId) {
            fetchBattle();
        }
    }, [currentUser, battleId]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle objective changes
    const handleObjectiveChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            objectives: {
                ...prev.objectives,
                [name]: value
            }
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setSaving(true);
            setError('');

            const battleRef = doc(db, 'users', currentUser.uid, 'battles', battleId);
            await updateDoc(battleRef, {
                name: formData.name,
                bluePlayer: formData.bluePlayer,
                redPlayer: formData.redPlayer,
                objectives: formData.objectives,
                lastUpdated: serverTimestamp()
            });

            setSuccess('Battle updated successfully!');

            // Navigate back to battle after short delay
            setTimeout(() => {
                navigate(`/battles/${battleId}`);
            }, 1500);
        } catch (err) {
            console.error('Error updating battle:', err);
            setError('Failed to update battle. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <LoadingSpinner text="Loading battle data..." />;
    }

    return (
        <div className="battle-edit-form">
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Card>
                <Card.Header>
                    <h3 className="mb-0">Edit Battle Details</h3>
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Battle Name</Form.Label>
                                    <Form.Control
                                        required
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter battle name"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Blue Player Name</Form.Label>
                                    <Form.Control
                                        required
                                        type="text"
                                        name="bluePlayer"
                                        value={formData.bluePlayer}
                                        onChange={handleChange}
                                        placeholder="Enter blue player's name"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Red Player Name</Form.Label>
                                    <Form.Control
                                        required
                                        type="text"
                                        name="redPlayer"
                                        value={formData.redPlayer}
                                        onChange={handleChange}
                                        placeholder="Enter red player's name"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Card className="mb-4">
                            <Card.Header>
                                <h5 className="mb-0">Battle Objectives</h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Primary Objective</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="primary"
                                                value={formData.objectives.primary}
                                                onChange={handleObjectiveChange}
                                                placeholder="E.g., Key Positions"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Secondary Objective</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="secondary"
                                                value={formData.objectives.secondary}
                                                onChange={handleObjectiveChange}
                                                placeholder="E.g., Breakthrough"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Deployment</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="deployment"
                                                value={formData.objectives.deployment}
                                                onChange={handleObjectiveChange}
                                                placeholder="E.g., Major Offensive"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Form>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between">
                    <Button 
                        variant="secondary" 
                        onClick={() => navigate(`/battles/${battleId}`)}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleSubmit}
                        disabled={saving}
                    >
                        {saving ? 'Updating...' : 'Update Battle'}
                    </Button>
                </Card.Footer>
            </Card>
        </div>
    );
};

export default BattleEditForm;