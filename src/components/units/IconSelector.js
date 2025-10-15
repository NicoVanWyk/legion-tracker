// src/components/units/IconSelector.js
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Modal } from 'react-bootstrap';
import { importAll } from '../../utils/fileUtils';

const IconSelector = ({ selectedIcon, onChange }) => {
    const [icons, setIcons] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredIcons, setFilteredIcons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // This function will load all images from the assets/uniticons directory
        // You'll need to implement this in your project or use a different approach
        const loadIcons = async () => {
            try {
                setLoading(true);
                // In a real implementation, you would dynamically load icons
                // For development, we're simulating it with a list of icons
                const iconList = await importAll(require.context('../../assets/uniticons', false, /\.(png|jpe?g|svg)$/));
                setIcons(iconList);
                setFilteredIcons(iconList);
            } catch (err) {
                console.error('Failed to load icons:', err);
            } finally {
                setLoading(false);
            }
        };

        loadIcons();
    }, []);

    // Filter icons based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredIcons(icons);
        } else {
            const filtered = icons.filter(icon => 
                icon.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredIcons(filtered);
        }
    }, [searchTerm, icons]);

    const handleSelectIcon = (icon) => {
        onChange(icon.path);
        setShowModal(false);
    };

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    const getCurrentIconName = () => {
        if (!selectedIcon) return 'None';
        
        const selectedIconObj = icons.find(icon => icon.path === selectedIcon);
        return selectedIconObj ? selectedIconObj.name : 'Custom';
    };

    return (
        <>
            <div className="d-flex align-items-center mb-3">
                <div className="me-3">
                    {selectedIcon ? (
                        <div 
                            className="unit-icon-preview" 
                            style={{ 
                                width: '60px', 
                                height: '60px', 
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#f8f9fa'
                            }}
                        >
                            <img 
                                src={selectedIcon} 
                                alt="Selected Icon" 
                                style={{ maxWidth: '100%', maxHeight: '100%' }}
                            />
                        </div>
                    ) : (
                        <div 
                            className="unit-icon-placeholder"
                            style={{ 
                                width: '60px', 
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
                            <i className="bi bi-image"></i>
                        </div>
                    )}
                </div>
                <div className="flex-grow-1">
                    <p className="mb-0">
                        <strong>Current Icon: </strong>
                        {getCurrentIconName()}
                    </p>
                    <Button variant="outline-primary" size="sm" onClick={openModal} className="mt-2">
                        {selectedIcon ? 'Change Icon' : 'Select Icon'}
                    </Button>
                    {selectedIcon && (
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
                    <Modal.Title>Select Unit Icon</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Control
                            type="text"
                            placeholder="Search icons..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </Form.Group>

                    {loading ? (
                        <div className="text-center py-4">
                            <span>Loading icons...</span>
                        </div>
                    ) : filteredIcons.length === 0 ? (
                        <div className="text-center py-4">
                            <p>No icons found matching your search.</p>
                        </div>
                    ) : (
                        <Row xs={2} sm={3} md={4} lg={5} className="g-2">
                            {filteredIcons.map((icon, index) => (
                                <Col key={index}>
                                    <Card 
                                        onClick={() => handleSelectIcon(icon)}
                                        className={`icon-card h-100 ${selectedIcon === icon.path ? 'border-primary' : ''}`}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <Card.Body className="p-2 text-center">
                                            <div 
                                                style={{ 
                                                    height: '80px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <img 
                                                    src={icon.path}
                                                    alt={icon.name}
                                                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                                                />
                                            </div>
                                            <div className="small mt-2 text-truncate">
                                                {icon.name}
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

export default IconSelector;