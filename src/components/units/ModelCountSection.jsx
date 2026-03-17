import React from 'react';
import {Card, Row, Col, Form} from 'react-bootstrap';

const ModelCountSection = ({formData, handleChange, isAoS}) => {
    return (
        <Card className="mt-3">
            <Card.Header><strong>Model Count</strong></Card.Header>
            <Card.Body>
                <Row>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>
                                {isAoS ? 'Base Models' : 'Minimum Models'}
                            </Form.Label>
                            <Form.Control
                                name="minModelCount"
                                type="number"
                                value={formData.minModelCount}
                                onChange={handleChange}
                                min="1"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Current Models</Form.Label>
                            <Form.Control
                                type="number"
                                value={formData.currentModelCount}
                                disabled
                            />
                        </Form.Group>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default ModelCountSection;