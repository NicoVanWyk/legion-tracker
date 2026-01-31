import React, { useState } from 'react';
import { OverlayTrigger, Tooltip, Badge, Button, Modal } from 'react-bootstrap';
import WeaponKeywords from '../../enums/WeaponKeywords';

const WeaponKeywordHelper = ({ keywords, variant = 'badge' }) => {
    const [showModal, setShowModal] = useState(false);
    const [selectedKeyword, setSelectedKeyword] = useState(null);

    if (!keywords || keywords.length === 0) return null;

    const handleKeywordClick = (keyword) => {
        setSelectedKeyword(keyword);
        setShowModal(true);
    };

    if (variant === 'badge') {
        return (
            <>
                {keywords.map((kw, i) => {
                    const displayName = WeaponKeywords.getDisplayName(kw);
                    const description = WeaponKeywords.getDescription(kw);
                    
                    return (
                        <OverlayTrigger
                            key={i}
                            placement="top"
                            overlay={
                                <Tooltip id={`tooltip-${kw}`}>
                                    <strong>{displayName}</strong><br/>
                                    {description.length > 100 
                                        ? `${description.substring(0, 100)}... (click for full)`
                                        : description
                                    }
                                </Tooltip>
                            }
                        >
                            <Badge 
                                bg="light" 
                                text="dark" 
                                className="me-1 mb-1"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleKeywordClick(kw)}
                            >
                                {displayName}
                            </Badge>
                        </OverlayTrigger>
                    );
                })}
                
                {/* Keyword Detail Modal */}
                <Modal 
                    show={showModal} 
                    onHide={() => setShowModal(false)}
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {selectedKeyword && WeaponKeywords.getDisplayName(selectedKeyword)}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedKeyword && (
                            <p>{WeaponKeywords.getDescription(selectedKeyword)}</p>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }

    if (variant === 'text') {
        return (
            <div className="weapon-keywords-text">
                {keywords.map((kw, i) => (
                    <span key={i}>
                        <Button
                            variant="link"
                            className="p-0 text-decoration-none"
                            onClick={() => handleKeywordClick(kw)}
                        >
                            {WeaponKeywords.getDisplayName(kw)}
                        </Button>
                        {i < keywords.length - 1 && ', '}
                    </span>
                ))}
            </div>
        );
    }

    return null;
};

export default WeaponKeywordHelper;