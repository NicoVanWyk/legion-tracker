// src/components/reminders/ReminderPanel.jsx
import React, { useState, useEffect } from 'react';
import { Card, Badge, Collapse, Button, ListGroup, Alert } from 'react-bootstrap';
import ReminderTypes from '../../enums/ReminderTypes';

const ReminderPanel = ({
                           reminders = [],
                           currentPhase = null,
                           activeUnit = null,
                           position = 'sidebar' // 'sidebar' or 'banner'
                       }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [filteredReminders, setFilteredReminders] = useState([]);

    useEffect(() => {
        filterReminders();
    }, [reminders, currentPhase, activeUnit]);

    const filterReminders = () => {
        let filtered = [...reminders];

        // Filter by current phase if applicable
        if (currentPhase) {
            filtered = filtered.filter(reminder =>
                reminder.reminderType === currentPhase ||
                reminder.reminderType === ReminderTypes.GENERAL
            );
        }

        // Filter by active unit if applicable
        if (activeUnit) {
            filtered = filtered.filter(reminder =>
                !reminder.unitId || reminder.unitId === activeUnit.id
            );
        }

        // Sort by priority (phase-specific first, then general)
        filtered.sort((a, b) => {
            if (a.reminderType === currentPhase && b.reminderType !== currentPhase) return -1;
            if (a.reminderType !== currentPhase && b.reminderType === currentPhase) return 1;
            return 0;
        });

        setFilteredReminders(filtered);
    };

    const groupRemindersByType = () => {
        const grouped = {};
        filteredReminders.forEach(reminder => {
            const type = reminder.reminderType;
            if (!grouped[type]) {
                grouped[type] = [];
            }
            grouped[type].push(reminder);
        });
        return grouped;
    };

    if (filteredReminders.length === 0) {
        return null;
    }

    const groupedReminders = groupRemindersByType();

    // Sidebar style (for desktop)
    if (position === 'sidebar') {
        return (
            <Card
                className="reminder-panel sidebar-reminder"
                style={{
                    position: 'sticky',
                    top: '20px',
                    maxHeight: 'calc(100vh - 40px)',
                    overflowY: 'auto'
                }}
            >
                <Card.Header
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ cursor: 'pointer' }}
                    className="d-flex justify-content-between align-items-center"
                >
                    <h5 className="mb-0">
                        <i className="bi bi-bell-fill me-2"></i>
                        Reminders
                    </h5>
                    <Badge bg="primary">{filteredReminders.length}</Badge>
                </Card.Header>
                <Collapse in={isOpen}>
                    <Card.Body className="p-0">
                        {Object.entries(groupedReminders).map(([type, typeReminders]) => (
                            <div key={type}>
                                <div className="p-2 bg-light border-bottom">
                                    <Badge bg={ReminderTypes.getBadgeColor(type)}>
                                        {ReminderTypes.getDisplayName(type)}
                                    </Badge>
                                </div>
                                <ListGroup variant="flush">
                                    {typeReminders.map((reminder, index) => (
                                        <ListGroup.Item key={index} className="py-2">
                                            <div className="small">
                                                {reminder.source && (
                                                    <div className="fw-bold text-muted mb-1">
                                                        {reminder.source}
                                                    </div>
                                                )}
                                                <div>{reminder.text}</div>
                                                {reminder.condition && (
                                                    <div className="text-muted fst-italic mt-1">
                                                        {reminder.condition}
                                                    </div>
                                                )}
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </div>
                        ))}
                    </Card.Body>
                </Collapse>
            </Card>
        );
    }

    // Banner style (for mobile/top of page)
    return (
        <Alert
            variant="info"
            dismissible={false}
            className="reminder-panel banner-reminder mb-3"
        >
            <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center">
                    <i className="bi bi-bell-fill me-2"></i>
                    <strong>Reminders ({filteredReminders.length})</strong>
                </div>
                <Button
                    variant="link"
                    size="sm"
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-0 text-decoration-none"
                >
                    {isOpen ? 'Hide' : 'Show'}
                </Button>
            </div>

            <Collapse in={isOpen}>
                <div>
                    {Object.entries(groupedReminders).map(([type, typeReminders]) => (
                        <div key={type} className="mb-2">
                            <Badge bg={ReminderTypes.getBadgeColor(type)} className="mb-2">
                                {ReminderTypes.getDisplayName(type)}
                            </Badge>
                            {typeReminders.map((reminder, index) => (
                                <div key={index} className="mb-2 ps-3">
                                    {reminder.source && (
                                        <div className="fw-bold small">
                                            {reminder.source}
                                        </div>
                                    )}
                                    <div className="small">{reminder.text}</div>
                                    {reminder.condition && (
                                        <div className="text-muted fst-italic small">
                                            {reminder.condition}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </Collapse>
        </Alert>
    );
};

export default ReminderPanel;