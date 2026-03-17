import React from 'react';
import {Card, Row, Col, Form} from 'react-bootstrap';
import IconSelector from './IconSelector';
import BackgroundSelector from './BackgroundSelector';
import UnitCard from './UnitCard';

const AppearanceTab = ({formData, setFormData, customUnitTypes}) => {
    const handleIconChange = (iconPath) => {
        setFormData(prev => ({...prev, unitIcon: iconPath}));
    };

    const handleBackgroundChange = (backgroundPath) => {
        setFormData(prev => ({...prev, cardBackground: backgroundPath}));
    };

    return (
        <Card>
            <Card.Body>
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-4">
                            <Form.Label><strong>Unit Icon</strong></Form.Label>
                            <IconSelector
                                selectedIcon={formData.unitIcon}
                                onChange={handleIconChange}
                            />
                            <Form.Text className="text-muted">
                                Select an icon to represent this unit on cards and in the army list.
                            </Form.Text>
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group className="mb-4">
                            <Form.Label><strong>Card Background</strong></Form.Label>
                            <BackgroundSelector
                                selectedBackground={formData.cardBackground}
                                onChange={handleBackgroundChange}
                            />
                            <Form.Text className="text-muted">
                                Select a background image for this unit's card.
                            </Form.Text>
                        </Form.Group>
                    </Col>
                </Row>

                <div className="mt-4">
                    <div className="mb-3">
                        <strong>Preview</strong>
                    </div>
                    <Row>
                        <Col md={8} className="mx-auto">
                            <UnitCard unit={formData} customUnitTypes={customUnitTypes}/>
                        </Col>
                    </Row>
                </div>
            </Card.Body>
        </Card>
    );
};

export default AppearanceTab;