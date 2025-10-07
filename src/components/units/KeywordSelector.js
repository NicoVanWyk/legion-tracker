// src/components/units/KeywordSelector.js (Updated to include custom keywords)
import React, { useState, useEffect } from 'react';
import { Form, Button, Badge, Accordion, ListGroup, Alert } from 'react-bootstrap';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import Keywords from '../../enums/Keywords';

const KeywordSelector = ({ selectedKeywords = [], onChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [customKeywords, setCustomKeywords] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    const keywordsByCategory = Keywords.getAllKeywords();

    useEffect(() => {
        fetchCustomKeywords();
    }, [currentUser]);

    const fetchCustomKeywords = async () => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        try {
            const keywordsRef = collection(db, 'users', currentUser.uid, 'customKeywords');
            const querySnapshot = await getDocs(keywordsRef);

            const keywords = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setCustomKeywords(keywords);
        } catch (err) {
            console.error('Error fetching custom keywords:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleKeywordToggle = (keyword) => {
        if (selectedKeywords.includes(keyword)) {
            onChange(selectedKeywords.filter(k => k !== keyword));
        } else {
            onChange([...selectedKeywords, keyword]);
        }
    };

    const handleCustomKeywordToggle = (keywordId) => {
        const keywordRef = `custom:${keywordId}`;
        if (selectedKeywords.includes(keywordRef)) {
            onChange(selectedKeywords.filter(k => k !== keywordRef));
        } else {
            onChange([...selectedKeywords, keywordRef]);
        }
    };

    // Filter system keywords
    const filteredSystemKeywords = searchTerm.trim() === ''
        ? keywordsByCategory
        : Object.keys(keywordsByCategory).reduce((filtered, category) => {
            const matchingKeywords = keywordsByCategory[category].filter(keyword =>
                Keywords.getDisplayName(keyword).toLowerCase().includes(searchTerm.toLowerCase())
            );
            if (matchingKeywords.length > 0) {
                filtered[category] = matchingKeywords;
            }
            return filtered;
        }, {});

    // Filter custom keywords
    const filteredCustomKeywords = searchTerm.trim() === ''
        ? customKeywords
        : customKeywords.filter(kw =>
            kw.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            kw.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const getDisplayName = (keyword) => {
        if (keyword.startsWith('custom:')) {
            const customId = keyword.replace('custom:', '');
            const customKeyword = customKeywords.find(k => k.id === customId);
            return customKeyword ? customKeyword.name : keyword;
        }
        return Keywords.getDisplayName(keyword);
    };

    return (
        <div>
            {/* Selected Keywords Display */}
            <div className="mb-3">
                <h5>Selected Keywords</h5>
                <div>
                    {selectedKeywords.length === 0 ? (
                        <p className="text-muted">No keywords selected</p>
                    ) : (
                        selectedKeywords.map(keyword => (
                            <Badge
                                key={keyword}
                                bg={keyword.startsWith('custom:') ? 'info' : 'primary'}
                                className="me-2 mb-2 p-2"
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                    if (keyword.startsWith('custom:')) {
                                        handleCustomKeywordToggle(keyword.replace('custom:', ''));
                                    } else {
                                        handleKeywordToggle(keyword);
                                    }
                                }}
                            >
                                {getDisplayName(keyword)}
                                {keyword.startsWith('custom:') && (
                                    <span className="ms-1" title="Custom Keyword">★</span>
                                )}
                                {' '}×
                            </Badge>
                        ))
                    )}
                </div>
            </div>

            {/* Search Bar */}
            <Form.Group className="mb-3">
                <Form.Control
                    type="text"
                    placeholder="Search keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </Form.Group>

            {/* Keywords by Category */}
            <Accordion className="mb-3">
                {/* System Keywords */}
                {Object.entries(filteredSystemKeywords).map(([category, keywords]) => (
                    <Accordion.Item key={category} eventKey={category}>
                        <Accordion.Header>
                            {category.charAt(0).toUpperCase() + category.slice(1)} Keywords
                            <Badge bg="secondary" className="ms-2">System</Badge>
                        </Accordion.Header>
                        <Accordion.Body className="p-0">
                            <ListGroup variant="flush">
                                {keywords.map(keyword => (
                                    <ListGroup.Item
                                        key={keyword}
                                        action
                                        active={selectedKeywords.includes(keyword)}
                                        onClick={() => handleKeywordToggle(keyword)}
                                    >
                                        <div className="d-flex justify-content-between align-items-center">
                                            <strong>{Keywords.getDisplayName(keyword)}</strong>
                                            <Button
                                                variant={selectedKeywords.includes(keyword) ? "danger" : "primary"}
                                                size="sm"
                                            >
                                                {selectedKeywords.includes(keyword) ? "Remove" : "Add"}
                                            </Button>
                                        </div>
                                        <small className="text-muted d-block mt-1">
                                            {Keywords.getDescription(keyword)}
                                        </small>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Accordion.Body>
                    </Accordion.Item>
                ))}

                {/* Custom Keywords */}
                {filteredCustomKeywords.length > 0 && (
                    <Accordion.Item eventKey="custom">
                        <Accordion.Header>
                            Custom Keywords
                            <Badge bg="info" className="ms-2">{filteredCustomKeywords.length}</Badge>
                        </Accordion.Header>
                        <Accordion.Body className="p-0">
                            {loading ? (
                                <div className="p-3 text-center">
                                    <span>Loading custom keywords...</span>
                                </div>
                            ) : (
                                <ListGroup variant="flush">
                                    {filteredCustomKeywords.map(keyword => {
                                        const keywordRef = `custom:${keyword.id}`;
                                        return (
                                            <ListGroup.Item
                                                key={keyword.id}
                                                action
                                                active={selectedKeywords.includes(keywordRef)}
                                                onClick={() => handleCustomKeywordToggle(keyword.id)}
                                            >
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <strong>
                                                            {keyword.name}
                                                            <span className="ms-2" title="Custom Keyword">★</span>
                                                        </strong>
                                                        {keyword.category && (
                                                            <Badge bg="secondary" className="ms-2">
                                                                {keyword.category}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant={selectedKeywords.includes(keywordRef) ? "danger" : "primary"}
                                                        size="sm"
                                                    >
                                                        {selectedKeywords.includes(keywordRef) ? "Remove" : "Add"}
                                                    </Button>
                                                </div>
                                                <small className="text-muted d-block mt-1">
                                                    {keyword.description}
                                                </small>
                                                {keyword.timing && (
                                                    <small className="text-info d-block mt-1">
                                                        Timing: {keyword.timing}
                                                    </small>
                                                )}
                                            </ListGroup.Item>
                                        );
                                    })}
                                </ListGroup>
                            )}
                        </Accordion.Body>
                    </Accordion.Item>
                )}
            </Accordion>

            {!loading && customKeywords.length === 0 && (
                <Alert variant="info">
                    <p className="mb-2">You haven't created any custom keywords yet.</p>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => window.open('/units/keywords/create', '_blank')}
                    >
                        Create Custom Keyword
                    </Button>
                </Alert>
            )}
        </div>
    );
};

export default KeywordSelector;