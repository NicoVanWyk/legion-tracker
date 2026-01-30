// src/components/battles/MobileBattleControls.jsx
import React, { useState } from 'react';
import { Card, Button, Badge, Alert, Modal } from 'react-bootstrap';
import BattlePhases from '../../enums/BattlePhases';
import PlayerSides from '../../enums/PlayerSides';

const MobileBattleControls = ({ battle, onAdvancePhase, userTurn, disabled }) => {
    const [showPhaseHelp, setShowPhaseHelp] = useState(false);
    const [confirmAdvance, setConfirmAdvance] = useState(false);

    // Check if phase can be advanced
    const canAdvancePhase = () => {
        if (!userTurn) return false;

        switch (battle.currentPhase) {
            case BattlePhases.COMMAND:
                // Both players need command cards selected
                return battle.blueCommandCard && battle.redCommandCard;
            
            case BattlePhases.ACTIVATION:
                // All active player's units must be activated
                const activeUnits = battle.activePlayer === PlayerSides.BLUE 
                    ? battle.blueUnits : battle.redUnits;
                return activeUnits.every(unit => unit.hasActivated);
            
            case BattlePhases.END:
                // Can always advance from end phase
                return true;
            
            default:
                return false;
        }
    };

    // Get next phase information
    const getNextPhaseInfo = () => {
        const nextPhase = BattlePhases.getNextPhase(battle.currentPhase);
        
        if (battle.currentPhase === BattlePhases.END && nextPhase === BattlePhases.COMMAND) {
            return {
                name: `Round ${battle.currentRound + 1}`,
                description: 'Start the next round'
            };
        }
        
        return {
            name: BattlePhases.getDisplayName(nextPhase),
            description: BattlePhases.getDescription(nextPhase)
        };
    };

    // Get current phase requirements
    const getPhaseRequirements = () => {
        switch (battle.currentPhase) {
            case BattlePhases.COMMAND:
                return {
                    title: 'Command Phase Requirements',
                    items: [
                        'Both players select command cards',
                        'Determine priority (lower pips goes first)',
                        'Issue orders to units based on card pips'
                    ],
                    completed: [
                        battle.blueCommandCard ? 'Blue command card selected' : null,
                        battle.redCommandCard ? 'Red command card selected' : null,
                        battle.blueCommandCard && battle.redCommandCard ? 'Priority determined' : null
                    ].filter(Boolean)
                };
            
            case BattlePhases.ACTIVATION:
                const activeUnits = battle.activePlayer === PlayerSides.BLUE 
                    ? battle.blueUnits : battle.redUnits;
                const activatedCount = activeUnits.filter(u => u.hasActivated).length;
                
                return {
                    title: 'Activation Phase Requirements',
                    items: [
                        'Players alternate activating units',
                        'Units with orders activate first',
                        'Random selection for units without orders',
                        'All units must activate before phase ends'
                    ],
                    completed: [
                        `${activatedCount}/${activeUnits.length} units activated`
                    ]
                };
            
            case BattlePhases.END:
                return {
                    title: 'End Phase Actions',
                    items: [
                        'Remove unspent tokens',
                        'Rally suppressed units',
                        'Apply end-of-round effects',
                        'Prepare for next round'
                    ],
                    completed: []
                };
            
            default:
                return { title: 'Unknown Phase', items: [], completed: [] };
        }
    };

    const handleAdvancePhase = () => {
        if (canAdvancePhase()) {
            if (battle.currentPhase === BattlePhases.END) {
                setConfirmAdvance(true);
            } else {
                onAdvancePhase();
            }
        }
    };

    const confirmNewRound = () => {
        onAdvancePhase();
        setConfirmAdvance(false);
    };

    const nextPhaseInfo = getNextPhaseInfo();
    const requirements = getPhaseRequirements();

    return (
        <>
            {/* Current Phase Status */}
            <Card className="mb-3">
                <Card.Header className="d-flex justify-content-between align-items-center p-2">
                    <div>
                        <h6 className="mb-0">{BattlePhases.getDisplayName(battle.currentPhase)}</h6>
                        <small className="text-muted">Round {battle.currentRound}</small>
                    </div>
                    <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => setShowPhaseHelp(true)}
                    >
                        <i className="bi bi-question-circle"></i>
                    </Button>
                </Card.Header>
                
                <Card.Body className="p-2">
                    <p className="mb-2 small">{BattlePhases.getDescription(battle.currentPhase)}</p>
                    
                    {/* Progress indicators */}
                    {requirements.completed.length > 0 && (
                        <div className="mb-2">
                            {requirements.completed.map((item, index) => (
                                <Badge key={index} bg="success" className="me-1 mb-1 small">
                                    <i className="bi bi-check-circle me-1"></i>{item}
                                </Badge>
                            ))}
                        </div>
                    )}
                    
                    {!userTurn && (
                        <Alert variant="warning" className="mb-0 p-2">
                            <small>
                                <i className="bi bi-clock me-1"></i>
                                Waiting for {battle.activePlayer === PlayerSides.BLUE ? battle.bluePlayer : battle.redPlayer}
                            </small>
                        </Alert>
                    )}
                </Card.Body>
            </Card>

            {/* Phase Advance Button */}
            {userTurn && (
                <Card className="mb-3">
                    <Card.Body className="p-2 text-center">
                        <Button
                            variant="primary"
                            size="lg"
                            className="w-100"
                            onClick={handleAdvancePhase}
                            disabled={!canAdvancePhase()}
                        >
                            {canAdvancePhase() ? (
                                <>
                                    <i className="bi bi-arrow-right-circle me-2"></i>
                                    Advance to {nextPhaseInfo.name}
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-hourglass-split me-2"></i>
                                    Complete Current Phase
                                </>
                            )}
                        </Button>
                        
                        {!canAdvancePhase() && (
                            <small className="text-muted d-block mt-1">
                                Complete phase requirements to advance
                            </small>
                        )}
                    </Card.Body>
                </Card>
            )}

            {/* Phase Help Modal */}
            <Modal show={showPhaseHelp} onHide={() => setShowPhaseHelp(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{requirements.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h6>What to do:</h6>
                    <ul className="mb-3">
                        {requirements.items.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                    
                    {requirements.completed.length > 0 && (
                        <>
                            <h6>Completed:</h6>
                            <ul className="list-unstyled">
                                {requirements.completed.map((item, index) => (
                                    <li key={index} className="text-success">
                                        <i className="bi bi-check-circle me-2"></i>{item}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPhaseHelp(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Confirm New Round Modal */}
            <Modal show={confirmAdvance} onHide={() => setConfirmAdvance(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Start New Round?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>This will start Round {battle.currentRound + 1} and:</p>
                    <ul>
                        <li>Reset all unit activations and orders</li>
                        <li>Remove unspent tokens</li>
                        <li>Clear command cards</li>
                        <li>Switch the active player</li>
                    </ul>
                    <p className="mb-0">Are you sure you want to continue?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setConfirmAdvance(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={confirmNewRound}>
                        Start Round {battle.currentRound + 1}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default MobileBattleControls;