import React from 'react';
import { Button } from 'react-bootstrap';

const QuickReferenceButton = ({ onShow, size = "sm", variant = "outline-info" }) => {
    return (
        <Button
            variant={variant}
            size={size}
            onClick={onShow}
            className="d-flex align-items-center"
        >
            <i className="bi bi-book me-1"></i>
            Rules
        </Button>
    );
};

export default QuickReferenceButton;