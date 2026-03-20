import React from 'react';
import {Card, Button, ButtonGroup} from 'react-bootstrap';
import AoSBattlePhases from '../../../enums/aos/AoSBattlePhases';

const AoSPhaseControls = ({currentPhase, currentRound, onPhaseChange}) => {
    const nextPhase = AoSBattlePhases.getNextPhase(currentPhase);

    const phases = [
        AoSBattlePhases.PRIORITY,
        AoSBattlePhases.HERO,
        AoSBattlePhases.MOVEMENT,
        AoSBattlePhases.SHOOTING,
        AoSBattlePhases.CHARGE,
        AoSBattlePhases.COMBAT,
        AoSBattlePhases.END_OF_TURN
    ];

    return (
        <Card>
            <Card.Header>
                <h5 className="mb-0">Phase Control</h5>
            </Card.Header>
            <Card.Body>
                <div className="mb-3">
                    <strong>Current:</strong> Round {currentRound}, {AoSBattlePhases.getDisplayName(currentPhase)}
                </div>

                <ButtonGroup className="w-100 mb-3">
                    {phases.map(phase => (
                        <Button
                            key={phase}
                            variant={currentPhase === phase ? 'primary' : 'outline-secondary'}
                            onClick={() => onPhaseChange(phase)}
                            size="sm"
                        >
                            {AoSBattlePhases.getDisplayName(phase).replace(' Phase', '')}
                        </Button>
                    ))}
                </ButtonGroup>

                {nextPhase && (
                    <Button
                        variant="success"
                        className="w-100"
                        onClick={() => onPhaseChange(nextPhase)}
                    >
                        Next Phase: {AoSBattlePhases.getDisplayName(nextPhase)}
                    </Button>
                )}

                {currentPhase === AoSBattlePhases.END_OF_TURN && (
                    <Button
                        variant="primary"
                        className="w-100 mt-2"
                        onClick={() => onPhaseChange(AoSBattlePhases.PRIORITY)}
                    >
                        Start Round {currentRound + 1}
                    </Button>
                )}
            </Card.Body>
        </Card>
    );
};

export default AoSPhaseControls;