import React from 'react';
import {Card, Form} from 'react-bootstrap';

const NotesTab = ({miniatures, notes, handleChange}) => {
    return (
        <>
            <Card>
                <Card.Header>
                    <h5 className="mb-0">Miniature Information</h5>
                </Card.Header>
                <Card.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Miniatures</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="miniatures"
                            rows={3}
                            value={miniatures || ''}
                            onChange={handleChange}
                            placeholder="Enter information about which miniatures to use for this unit..."
                        />
                    </Form.Group>
                </Card.Body>
            </Card>

            <Card className="mt-3">
                <Card.Header>
                    <h5 className="mb-0">Notes</h5>
                </Card.Header>
                <Card.Body>
                    <Form.Control
                        as="textarea"
                        name="notes"
                        rows={5}
                        value={notes || ''}
                        onChange={handleChange}
                        placeholder="Enter any additional notes about this unit..."
                    />
                </Card.Body>
            </Card>
        </>
    );
};

export default NotesTab;