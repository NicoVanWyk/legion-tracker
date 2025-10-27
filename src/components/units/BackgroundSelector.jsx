// src/components/units/BackgroundSelector.js
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Modal } from 'react-bootstrap';
import { importAll } from '../../utils/fileUtils';

const BackgroundSelector = ({ selectedBackground, onChange }) => {
    const [backgrounds, setBackgrounds] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredBackgrounds, setFilteredBackgrounds] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Faction categories for easier filtering
    const factionCategories = [
        { id: 'all', name: 'All' },
        { id: 'republic', name: 'Republic' },
        { id: 'separatist', name: 'Separatist' },
        { id: 'rebel', name: 'Rebel' },
        { id: 'empire', name: 'Empire' },
        { id: 'neutral', name: 'Neutral' }
    ];
    const [selectedFaction, setSelectedFaction] = useState('all');

    useEffect(() => {
        // Load all backgrounds from the assets/cardbackgrounds directory
        const loadBackgrounds = async () => {
            try {
                setLoading(true);
                // In a real implementation, you would dynamically load backgrounds
                // For development, we're simulating it with a list of backgrounds
                const backgroundList = await importAll(require.context('../../assets/cardbackgrounds', false, /\.(png|jpe?g|svg)$/));
                setBackgrounds(backgroundList);
                setFilteredBackgrounds(backgroundList);
            } catch (err) {
                console.error('Failed to load backgrounds:', err);
            } finally {
                setLoading(false);
            }
        };

        loadBackgrounds();
    }, []);

    // Filter backgrounds based on search term and selected faction
    useEffect(() => {
        let filtered = backgrounds;
        
        // Filter by faction
        if (selectedFaction !== 'all') {
            filtered = filtered.filter(bg => 
                bg.faction === selectedFaction || bg.faction === 'neutral'
            );
        }
        
        // Filter by search term
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(bg => 
                bg.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        setFilteredBackgrounds(filtered);
    }, [searchTerm, selectedFaction, backgrounds]);

    const handleSelectBackground = (background) => {
        onChange(background.path);
        setShowModal(false);
    };

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    const getCurrentBackgroundName = () => {
        if (!selectedBackground) return 'Default';
        
        const selectedBgObj = backgrounds.find(bg => bg.path === selectedBackground);
        return selectedBgObj ? selectedBgObj.name : 'Custom';
    };

    return (
        <>
            <div className="d-flex align-items-center mb-3">
                <div className="me-3">
                    {selectedBackground ? (
                        <div 
                            className="bg-preview" 
                            style={{ 
                                width: '100px', 
                                height: '60px', 
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#f8f9fa',
                                backgroundImage: `url(${selectedBackground})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        />
                    ) : (
                        <div 
                            className="bg-placeholder"
                            style={{ 
                                width: '100px', 
                                height: '60px', 
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#f8f9fa',
                                color: '#6c757d'
                            }}
                        >
                            <i className="bi bi-card-image"></i>
                        </div>
                    )}
                </div>
                <div className="flex-grow-1">
                    <p className="mb-0">
                        <strong>Current Background: </strong>
                        {getCurrentBackgroundName()}
                    </p>
                    <Button variant="outline-primary" size="sm" onClick={openModal} className="mt-2">
                        {selectedBackground ? 'Change Background' : 'Select Background'}
                    </Button>
                    {selectedBackground && (
                        <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            onClick={() => onChange('')} 
                            className="mt-2 ms-2"
                        >
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            <Modal show={showModal} onHide={closeModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Select Card Background</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="mb-3">
                        <Col md={8}>
                            <Form.Group>
                                <Form.Control
                                    type="text"
                                    placeholder="Search backgrounds..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Select
                                    value={selectedFaction}
                                    onChange={(e) => setSelectedFaction(e.target.value)}
                                >
                                    {factionCategories.map(faction => (
                                        <option key={faction.id} value={faction.id}>
                                            {faction.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    {loading ? (
                        <div className="text-center py-4">
                            <span>Loading backgrounds...</span>
                        </div>
                    ) : filteredBackgrounds.length === 0 ? (
                        <div className="text-center py-4">
                            <p>No backgrounds found matching your criteria.</p>
                        </div>
                    ) : (
                        <Row xs={1} sm={2} md={3} className="g-3">
                            {filteredBackgrounds.map((bg, index) => (
                                <Col key={index}>
                                    <Card 
                                        onClick={() => handleSelectBackground(bg)}
                                        className={`bg-card h-100 ${selectedBackground === bg.path ? 'border-primary' : ''}`}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div 
                                            style={{ 
                                                height: '120px',
                                                backgroundImage: `url(${bg.path})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                borderTopLeftRadius: 'calc(0.375rem - 1px)',
                                                borderTopRightRadius: 'calc(0.375rem - 1px)'
                                            }}
                                        />
                                        <Card.Body className="p-2">
                                            <div className="d-flex justify-content-between">
                                                <div className="small">
                                                    {bg.name}
                                                </div>
                                                <div className="small text-muted">
                                                    {bg.faction.charAt(0).toUpperCase() + bg.faction.slice(1)}
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default BackgroundSelector;