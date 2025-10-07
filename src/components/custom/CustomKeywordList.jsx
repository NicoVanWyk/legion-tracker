// src/components/custom/CustomKeywordList.jsx
import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, ListGroup, Row, Col, Form, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../layout/LoadingSpinner';

const CustomKeywordList = () => {
    const [keywords, setKeywords] = useState([]);
    const [filteredKeywords, setFilteredKeywords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const { currentUser } = useAuth();

    const categories = [
        { value: 'all', label: 'All Categories' },
        { value: 'movement', label: 'Movement' },
        { value: 'attack', label: 'Attack' },
        { value: 'defense', label: 'Defense' },
        { value: 'command', label: 'Command' },
        { value: 'special', label: 'Special' },
        { value: 'custom', label: 'Custom' }
    ];

    useEffect(() => {
        fetchKeywords();
    }, [currentUser]);

    useEffect(() => {
        filterKeywordsList();
    }, [keywords, searchTerm, filterCategory]);

    const fetchKeywords = async () => {
        if (!currentUser) return;

        try {
            setLoading(true);
            const keywordsRef = collection(db, 'users', currentUser.uid, 'customKeywords');
            const q = query(keywordsRef, orderBy('name', 'asc'));
            const querySnapshot = await getDocs(q);

            const keywordsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setKeywords(keywordsList);
            setError('');
        } catch (err) {
            console.error('Error fetching keywords:', err);
            setError('Failed to fetch custom keywords');
        } finally {
            setLoading(false);
        }
    };

    const filterKeywordsList = () => {
        let filtered = keywords;

        if (filterCategory !== 'all') {
            filtered = filtered.filter(kw => kw.category === filterCategory);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(kw =>
                kw.name.toLowerCase().includes(term) ||
                kw.description?.toLowerCase().includes(term)
            );
        }

        setFilteredKeywords(filtered);
    };

    const handleDelete = async (keywordId) => {
        if (!window.confirm('Are you sure you want to delete this keyword?')) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'customKeywords', keywordId));
            fetchKeywords();
        } catch (err) {
            console.error('Error deleting keyword:', err);
            setError('Failed to delete keyword');
        }
    };

    const getCategoryColor = (category) => {
        const colors = {
            movement: 'primary',
            attack: 'danger',
            defense: 'success',
            command: 'info',
            special: 'warning',
            custom: 'secondary'
        };
        return colors[category] || 'secondary';
    };

    if (loading) {
        return <LoadingSpinner text="Loading custom keywords..." />;
    }

    return (
        <>
            <Card className="mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">Custom Keywords</h4>
                    <Button as={Link} to="/units/keywords/create" variant="primary">
                        Create Keyword
                    </Button>
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Search</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Search keywords..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Category</Form.Label>
                                <Form.Select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
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

                    {keywords.length === 0 ? (
                        <Alert variant="info" className="text-center">
                            <p className="mb-3">You haven't created any custom keywords yet.</p>
                            <Button as={Link} to="/units/keywords/create" variant="primary">
                                Create Your First Keyword
                            </Button>
                        </Alert>
                    ) : filteredKeywords.length === 0 ? (
                        <Alert variant="warning" className="text-center">
                            <p className="mb-0">No keywords match your filters.</p>
                        </Alert>
                    ) : (
                        <ListGroup>
                            {filteredKeywords.map(keyword => (
                                <ListGroup.Item key={keyword.id}>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div className="flex-grow-1">
                                            <h5 className="mb-2">
                                                {keyword.name}
                                                <Badge
                                                    bg={getCategoryColor(keyword.category)}
                                                    className="ms-2"
                                                >
                                                    {keyword.category}
                                                </Badge>
                                            </h5>
                                            <p className="mb-2">{keyword.description}</p>
                                            {keyword.timing && (
                                                <p className="text-muted small mb-2">
                                                    <strong>Timing:</strong> {keyword.timing}
                                                </p>
                                            )}
                                            {keyword.examples && keyword.examples.length > 0 && (
                                                <div className="small text-muted">
                                                    <strong>Examples:</strong>
                                                    <ul className="mb-0 mt-1">
                                                        {keyword.examples.map((example, idx) => (
                                                            <li key={idx}>{example}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                        <div className="ms-3">
                                            <Button
                                                as={Link}
                                                to={`/units/keywords/edit/${keyword.id}`}
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-2"
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleDelete(keyword.id)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </Card.Body>
            </Card>
        </>
    );
};

export default CustomKeywordList;