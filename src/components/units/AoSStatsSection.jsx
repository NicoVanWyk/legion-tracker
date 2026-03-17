import React from 'react';
import {Row, Col, Form} from 'react-bootstrap';

const AoSStatsSection = ({formData, handleChange, handleCheckboxChange}) => {
    const isManifestation = formData.keywords?.includes('manifestation');

    return (
        <>
            <Row className="mt-3">
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Move</Form.Label>
                        <Form.Control
                            name="move"
                            type="number"
                            value={formData.move}
                            onChange={handleChange}
                        />
                        <Form.Text>inches</Form.Text>
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Health</Form.Label>
                        <Form.Control
                            name="health"
                            type="number"
                            value={formData.health}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Save</Form.Label>
                        <Form.Control
                            name="save"
                            type="number"
                            min="2"
                            max="6"
                            value={formData.save}
                            onChange={handleChange}
                        />
                        <Form.Text>2+ to 6+</Form.Text>
                    </Form.Group>
                </Col>
                <Col md={3}>
                    {isManifestation ? (
                        <Form.Group>
                            <Form.Label>Banishment</Form.Label>
                            <Form.Control
                                name="banishment"
                                type="number"
                                min="2"
                                max="6"
                                value={formData.banishment || ''}
                                onChange={handleChange}
                                placeholder="e.g., 6"
                            />
                            <Form.Text>Banishment value</Form.Text>
                        </Form.Group>
                    ) : (
                        <Form.Group>
                            <Form.Label>Control</Form.Label>
                            <Form.Control
                                name="control"
                                type="number"
                                value={formData.control}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    )}
                </Col>
            </Row>

            <Row className="mt-3">
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Ward Save (Optional)</Form.Label>
                        <Form.Control
                            name="ward"
                            type="number"
                            min="2"
                            max="6"
                            value={formData.ward || ''}
                            onChange={handleChange}
                            placeholder="e.g., 5"
                        />
                        <Form.Text>Ward save value (2-6)</Form.Text>
                    </Form.Group>
                </Col>
            </Row>

            <Row className="mt-3">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Base Size</Form.Label>
                        <Form.Control
                            name="baseSize"
                            value={formData.baseSize}
                            onChange={handleChange}
                            placeholder="e.g., 32mm, 40mm, 60x35mm oval"
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Unit Options</Form.Label>
                        <Form.Check
                            type="checkbox"
                            id="reinforceable"
                            label="Unit can be Reinforced"
                            name="reinforceable"
                            checked={formData.reinforceable}
                            onChange={handleCheckboxChange}
                        />
                        <Form.Text className="text-muted">
                            Reinforced units contain double the models.
                        </Form.Text>
                    </Form.Group>
                </Col>
            </Row>
        </>
    );
};

export default AoSStatsSection;