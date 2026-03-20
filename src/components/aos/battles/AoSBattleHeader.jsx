import React, {useState} from 'react';
import {Card, Button, Badge, Modal, Form, Alert} from 'react-bootstrap';
import AoSBattlePhases from '../../../enums/aos/AoSBattlePhases';
const AoSBattleHeader = ({battle, onPriorityRoll}) => {
    const [showPriorityModal, setShowPriorityModal] = useState(false);
    const [player1Roll, setPlayer1Roll] = useState('');
    const [player2Roll, setPlayer2Roll] = useState('');

    const handlePrioritySubmit = () => {
        const roll1 = parseInt(player1Roll);
        const roll2 = parseInt(player2Roll);

        if (roll1 > roll2) {
            onPriorityRoll(1);
        } else if (roll2 > roll1) {
            onPriorityRoll(2);
        } else {
            // Tie - previous priority player wins
            onPriorityRoll(battle.priorityPlayer || 1);
        }

        setShowPriorityModal(false);
        setPlayer1Roll('');
        setPlayer2Roll('');
    };

    return (
        <>
            <Card>
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h3>{battle.name}</h3>
                            <div>
                                <Badge bg="info" className="me-2">Round {battle.currentRound}</Badge>
                                <Badge
                                    bg="secondary"
                                    style={{backgroundColor: AoSBattlePhases.getColor(battle.currentPhase)}}
                                >
                                    {AoSBattlePhases.getDisplayName(battle.currentPhase)}
                                </Badge>
                            </div>
                        </div>

                        <div>
                            {battle.currentPhase === AoSBattlePhases.PRIORITY && (
                                <Button
                                    variant="primary"
                                    onClick={() => setShowPriorityModal(true)}
                                >
                                    Roll for Priority
                                </Button>
                            )}

                            {battle.priorityPlayer && (
                                <div className="text-center">
                                    <small className="text-muted">Priority</small>
                                    <div className="fw-bold">
                                        {battle.priorityPlayer === 1 ? battle.player1.name : battle.player2.name}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Card.Body>
            </Card>

            <Modal show={showPriorityModal} onHide={() => setShowPriorityModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Roll for Priority</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>{battle.player1.name} Roll</Form.Label>
                        <Form.Control
                            type="number"
                            min="1"
                            max="6"
                            value={player1Roll}
                            onChange={(e) => setPlayer1Roll(e.target.value)}
                            placeholder="Enter dice result (1-6)"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>{battle.player2.name} Roll</Form.Label>
                        <Form.Control
                            type="number"
                            min="1"
                            max="6"
                            value={player2Roll}
                            onChange={(e) => setPlayer2Roll(e.target.value)}
                            placeholder="Enter dice result (1-6)"
                        />
                    </Form.Group>

                    <Alert variant="info">
                        Higher roll wins priority. On a tie, the previous priority player keeps priority.
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPriorityModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handlePrioritySubmit}
                        disabled={!player1Roll || !player2Roll}
                    >
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default AoSBattleHeader;