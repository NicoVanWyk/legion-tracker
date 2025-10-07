// src/components/custom/CustomKeywordForm.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, doc, addDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';

const CustomKeywordForm = () => {
    const { keywordId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        category: 'custom',
        description: '',
        timing: '',
        examples: ['']
    });

    const categories = [
        { value: 'movement', label: 'Movement' },
        { value: 'attack', label: 'Attack' },
        { value: 'defense', label: 'Defense' },
        { value: 'command', label: 'Command' },
        { value: 'special', label: 'Special' },
        { value: 'custom', label: 'Custom' }
    ];

    useEffect(() => {
        const fetchKeyword = async () => {
            if (!keywordId || !currentUser) return;

            try {
                const keywordRef = doc(db, 'users', currentUser.uid, 'customKeywords', keywordId);
                const keywordDoc = await getDoc(keywordRef);

                if (keywordDoc.exists()) {
                    const data = keywordDoc.data();
                    setFormData({
                        ...data,
                        examples: data.examples || ['']
                    });
                } else {
                    setError('Keyword not found');
                }
            } catch (err) {
                console.error('Error fetching keyword:', err);
                setError('Failed to load keyword');
            }
        };

        fetchKeyword();
    }, [keywordId, currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleExampleChange = (index, value) => {
        const updatedExamples = [...formData.examples];
        updatedExamples[index] = value;
        setFormData({ ...formData, examples: updatedExamples });
    };

    const addExample = () => {
        setFormData({ ...formData, examples: [...formData.examples, ''] });
    };

    const removeExample = (index) => {
        const updatedExamples = formData.examples.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            examples: updatedExamples.length ? updatedExamples : ['']
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError('Keyword name is required');
            return;
        }

        if (!formData.description.trim()) {
            setError('Description is required');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const filteredExamples = formData.examples.filter(ex => ex.trim() !== '');

            const keywordData = {
                name: formData.name.trim(),
                category: formData.category,
                description: formData.description.trim(),
                timing: formData.timing.trim(),
                examples: filteredExamples,
                lastUpdated: serverTimestamp(),
                userId: currentUser.uid
            };

            if (keywordId) {
                await updateDoc(
                    doc(db, 'users', currentUser.uid, 'customKeywords', keywordId),
                    keywordData
                );
                setSuccess('Keyword updated successfully!');
            } else {
                keywordData.createdAt = serverTimestamp();
                await addDoc(
                    collection(db, 'users', currentUser.uid, 'customKeywords'),
                    keywordData
                );
                setSuccess('Keyword created successfully!');

                // Reset form
                setFormData({
                    name: '',
                    category: 'custom',
                    description: '',
                    timing: '',
                    examples: ['']
                });
            }

            setTimeout(() => {
                navigate('/units/keywords');
            }, 1500);
        } catch (err) {
            console.error('Error saving keyword:', err);
            setError('Failed to save keyword: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <Card.Header>
                <h3 className="mb-0">{keywordId ? 'Edit' : 'Create'} Custom Keyword</h3>
            </Card.Header>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={8}>
                            <Form.Group className="mb-3">
                                <Form.Label>Keyword Name*</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., Quick Strike 1"
                                    required
                                />
                                <Form.Text className="text-muted">
                                    The name of your custom keyword
                                </Form.Text>
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Category*</Form.Label>
                                <Form.Select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                >
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Description*</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe what this keyword does and how it works..."
                            rows={4}
                            required
                        />
                        <Form.Text className="text-muted">
                            Detailed explanation of the keyword's effect
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label>Timing (Optional)</Form.Label>
                        <Form.Control
                            type="text"
                            name="timing"
                            value={formData.timing}
                            onChange={handleChange}
                            placeholder="e.g., During activation, Before attacking"
                        />
                        <Form.Text className="text-muted">
                            When this keyword takes effect
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label>Examples</Form.Label>
                        {formData.examples.map((example, index) => (
                            <div key={index} className="d-flex mb-2">
                                <Form.Control
                                    type="text"
                                    value={example}
                                    onChange={(e) => handleExampleChange(index, e.target.value)}
                                    placeholder={`Example ${index + 1}`}
                                    className="me-2"
                                />
                                {formData.examples.length > 1 && (
                                    <Button
                                        variant="outline-danger"
                                        onClick={() => removeExample(index)}
                                    >
                                        Remove
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button variant="outline-secondary" onClick={addExample} className="mt-2">
                            Add Example
                        </Button>
                    </Form.Group>

                    <div className="d-flex justify-content-between">
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/units/keywords')}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? 'Saving...' : (keywordId ? 'Update' : 'Create') + ' Keyword'}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default CustomKeywordForm;