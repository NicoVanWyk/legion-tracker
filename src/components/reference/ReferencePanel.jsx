// src/components/reference/ReferencePanel.jsx
import React, { useState, useEffect } from 'react';
import { Card, Form, ListGroup, Badge, Collapse, Button, Offcanvas, Accordion, Alert, Spinner } from 'react-bootstrap';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import ReferenceCategories from '../../enums/ReferenceCategories';

const ReferencePanel = ({ show, onHide }) => {
    const [references, setReferences] = useState([]);
    const [filteredRefs, setFilteredRefs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [selectedReference, setSelectedReference] = useState(null);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (show) {
            fetchReferences();
        }
    }, [show, currentUser]);

    useEffect(() => {
        filterReferencesList();
    }, [references, searchTerm, filterCategory]);

    const fetchReferences = async () => {
        try {
            setLoading(true);
            
            // Fetch system references
            const systemQuery = query(
                collection(db, 'references'),
                orderBy('term', 'asc')
            );
            const systemSnapshot = await getDocs(systemQuery);
            const refsData = systemSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                isSystem: true
            }));
            
            // Fetch user custom references if logged in
            if (currentUser) {
                const userQuery = query(
                    collection(db, 'users', currentUser.uid, 'references'),
                    orderBy('term', 'asc')
                );
                const userSnapshot = await getDocs(userQuery);
                userSnapshot.docs.forEach(doc => {
                    refsData.push({
                        id: doc.id,
                        ...doc.data(),
                        isCustom: true
                    });
                });
            }
            
            // Sort all by term
            refsData.sort((a, b) => a.term.localeCompare(b.term));
            
            setReferences(refsData);
            setError('');
        } catch (err) {
            console.error('Error fetching references:', err);
            setError('Failed to load references');
        } finally {
            setLoading(false);
        }
    };

    const filterReferencesList = () => {
        let filtered = references;

        if (filterCategory !== 'all') {
            filtered = filtered.filter(ref => ref.category === filterCategory);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(ref =>
                ref.term.toLowerCase().includes(term) ||
                ref.description?.toLowerCase().includes(term)
            );
        }

        setFilteredRefs(filtered);
    };

    const handleReferenceClick = (reference) => {
        setSelectedReference(reference);
    };

    const handleBackToList = () => {
        setSelectedReference(null);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setFilterCategory('all');
        setSelectedReference(null);
    };

    return (
        <Offcanvas 
            show={show} 
            onHide={onHide} 
            placement="end"
            style={{ width: '500px' }}
            className="reference-panel-offcanvas"
        >
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>
                    <i className="bi bi-book-fill me-2"></i>
                    Game References
                </Offcanvas.Title>
            </Offcanvas.Header>
            
            <Offcanvas.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" />
                        <p className="mt-2">Loading references...</p>
                    </div>
                ) : selectedReference ? (
                    /* DETAIL VIEW */
                    <div className="reference-detail-view">
                        <Button 
                            variant="link" 
                            onClick={handleBackToList}
                            className="p-0 mb-3"
                        >
                            <i className="bi bi-arrow-left me-2"></i>
                            Back to list
                        </Button>
                        
                        <Card>
                            <Card.Header>
                                <h5 className="mb-1">{selectedReference.term}</h5>
                                <Badge bg={ReferenceCategories.getBadgeColor(selectedReference.category)}>
                                    <i className={ReferenceCategories.getIconClass(selectedReference.category) + ' me-1'}></i>
                                    {ReferenceCategories.getDisplayName(selectedReference.category)}
                                </Badge>
                                {selectedReference.isCustom && (
                                    <Badge bg="info" className="ms-2">Custom</Badge>
                                )}
                            </Card.Header>
                            <Card.Body>
                                <div className="mb-3">
                                    <strong>Description:</strong>
                                    <p className="mt-1">{selectedReference.description}</p>
                                </div>
                                
                                {selectedReference.examples && selectedReference.examples.length > 0 && (
                                    <div className="mb-3">
                                        <strong>Examples:</strong>
                                        <ListGroup variant="flush" className="mt-1">
                                            {selectedReference.examples.map((example, idx) => (
                                                <ListGroup.Item key={idx} className="px-0">
                                                    <small>{example}</small>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    </div>
                                )}
                                
                                {selectedReference.relatedTerms && selectedReference.relatedTerms.length > 0 && (
                                    <div>
                                        <strong>Related Terms:</strong>
                                        <div className="mt-1">
                                            {selectedReference.relatedTerms.map((term, idx) => (
                                                <Badge 
                                                    key={idx} 
                                                    bg="secondary" 
                                                    className="me-1 mb-1"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => {
                                                        const related = references.find(r => r.id === term.id);
                                                        if (related) handleReferenceClick(related);
                                                    }}
                                                >
                                                    {term.term}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </div>
                ) : (
                    /* LIST VIEW */
                    <div className="reference-list-view">
                        {/* Search and Filter */}
                        <div className="mb-3">
                            <Form.Group className="mb-2">
                                <Form.Control
                                    type="text"
                                    placeholder="Search references..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </Form.Group>
                            
                            <Form.Group className="mb-2">
                                <Form.Select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    size="sm"
                                >
                                    <option value="all">All Categories</option>
                                    {ReferenceCategories.getAllCategories().map(category => (
                                        <option key={category} value={category}>
                                            {ReferenceCategories.getDisplayName(category)}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            
                            {(searchTerm || filterCategory !== 'all') && (
                                <Button 
                                    variant="outline-secondary" 
                                    size="sm" 
                                    onClick={handleClearSearch}
                                    className="w-100"
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                        
                        {/* Results Count */}
                        <div className="mb-2 text-muted small">
                            {filteredRefs.length} reference{filteredRefs.length !== 1 ? 's' : ''} found
                        </div>
                        
                        {/* References List */}
                        {filteredRefs.length === 0 ? (
                            <Alert variant="info">
                                No references found matching your search.
                            </Alert>
                        ) : (
                            <Accordion className="reference-accordion">
                                {filteredRefs.map((ref, idx) => (
                                    <Accordion.Item key={ref.id} eventKey={idx.toString()}>
                                        <Accordion.Header>
                                            <div className="d-flex align-items-center w-100">
                                                <div className="flex-grow-1">
                                                    <strong>{ref.term}</strong>
                                                    <div>
                                                        <Badge 
                                                            bg={ReferenceCategories.getBadgeColor(ref.category)}
                                                            className="me-1"
                                                        >
                                                            <i className={ReferenceCategories.getIconClass(ref.category) + ' me-1'}></i>
                                                            {ReferenceCategories.getDisplayName(ref.category)}
                                                        </Badge>
                                                        {ref.isCustom && (
                                                            <Badge bg="info">Custom</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <div className="mb-2">
                                                <strong className="small">Description:</strong>
                                                <p className="mb-1 small">{ref.description}</p>
                                            </div>
                                            
                                            {ref.examples && ref.examples.length > 0 && (
                                                <div className="mb-2">
                                                    <strong className="small">Examples:</strong>
                                                    <ul className="mb-0 small ps-3">
                                                        {ref.examples.map((example, eidx) => (
                                                            <li key={eidx}>{example}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => handleReferenceClick(ref)}
                                                className="mt-2"
                                            >
                                                View Full Details
                                            </Button>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                        )}
                    </div>
                )}
                
                {/* Quick Actions */}
                {!loading && !selectedReference && (
                    <div className="mt-4 pt-3 border-top">
                        <div className="d-grid gap-2">
                            <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => window.open('/legion-tracker/references', '_blank')}
                            >
                                <i className="bi bi-box-arrow-up-right me-2"></i>
                                View All References
                            </Button>
                            {currentUser && (
                                <Button 
                                    variant="outline-success" 
                                    size="sm"
                                    onClick={() => window.open('/legion-tracker/references/create', '_blank')}
                                >
                                    <i className="bi bi-plus-circle me-2"></i>
                                    Create New Reference
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default ReferencePanel;