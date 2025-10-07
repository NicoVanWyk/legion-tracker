// src/components/custom/CustomUnitTypeList.jsx
import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, ListGroup, Row, Col, Form, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../layout/LoadingSpinner';

const CustomUnitTypeList = () => {
    const [unitTypes, setUnitTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { currentUser } = useAuth();

    useEffect(() => {
        fetchUnitTypes();
    }, [currentUser]);

    const fetchUnitTypes = async () => {
        if (!currentUser) return;

        try {
            setLoading(true);
            const typesRef = collection(db, 'users', currentUser.uid, 'customUnitTypes');
            const q = query(typesRef, orderBy('sortOrder', 'asc'), orderBy('displayName', 'asc'));
            const querySnapshot = await getDocs(q);

            const typesList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setUnitTypes(typesList);
            setError('');
        } catch (err) {
            console.error('Error fetching unit types:', err);
            setError('Failed to fetch custom unit types');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (typeId) => {
        if (!window.confirm('Are you sure you want to delete this unit type? Units using this type may be affected.')) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'customUnitTypes', typeId));
            fetchUnitTypes();
        } catch (err) {
            console.error('Error deleting unit type:', err);
            setError('Failed to delete unit type');
        }
    };

    const filteredTypes = unitTypes.filter(type =>
        searchTerm === '' ||
        type.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <LoadingSpinner text="Loading custom unit types..." />;
    }

    return (
        <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Custom Unit Types</h4>
                <Button as={Link} to="/units/types/create" variant="primary">
                    Create Unit Type
                </Button>
            </Card.Header>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                <Row className="mb-3">
                    <Col md={12}>
                        <Form.Group>
                            <Form.Label>Search</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Search unit types..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                {unitTypes.length === 0 ? (
                    <Alert variant="info" className="text-center">
                        <p className="mb-3">You haven't created any custom unit types yet.</p>
                        <p className="small text-muted mb-3">
                            Custom unit types allow you to create your own categories beyond Command, Corps, etc.
                        </p>
                        <Button as={Link} to="/units/types/create" variant="primary">
                            Create Your First Unit Type
                        </Button>
                    </Alert>
                ) : filteredTypes.length === 0 ? (
                    <Alert variant="warning" className="text-center">
                        <p className="mb-0">No unit types match your search.</p>
                    </Alert>
                ) : (
                    <ListGroup>
                        {filteredTypes.map(type => (
                            <ListGroup.Item key={type.id}>
                                <div className="d-flex justify-content-between align-items-start">
                                    <div className="flex-grow-1">
                                        <h5 className="mb-2">
                                            {type.icon && <i className={`${type.icon} me-2`}></i>}
                                            {type.displayName}
                                            <Badge bg="secondary" className="ms-2">
                                                Sort: {type.sortOrder}
                                            </Badge>
                                        </h5>
                                        <div className="small text-muted mb-2">
                                            <strong>Internal name:</strong> {type.name}
                                        </div>
                                        {type.description && (
                                            <p className="mb-0">{type.description}</p>
                                        )}
                                    </div>
                                    <div className="ms-3 text-nowrap">
                                        <Button
                                            as={Link}
                                            to={`/units/types/edit/${type.id}`}
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2"
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDelete(type.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}

                {unitTypes.length > 0 && (
                    <Alert variant="info" className="mt-3 mb-0">
                        <small>
                            <strong>Note:</strong> Custom unit types will appear in unit creation dropdowns alongside system types.
                            The sort order determines their position in lists.
                        </small>
                    </Alert>
                )}
            </Card.Body>
        </Card>
    );
};

export default CustomUnitTypeList;