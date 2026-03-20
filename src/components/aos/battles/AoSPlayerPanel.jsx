import React from 'react';
import {Card, Badge, Button, ButtonGroup} from 'react-bootstrap';
import AoSGrandStrategies from '../../../enums/aos/AoSGrandStrategies';

const AoSPlayerPanel = ({
                            player,
                            playerNumber,
                            commandPoints,
                            victoryPoints,
                            isPriority,
                            hasAuxiliary,
                            onVPChange
                        }) => {
    return (
        <Card className="mb-3">
            <Card.Header
                className={`d-flex justify-content-between align-items-center ${isPriority ? 'bg-success text-white' : ''}`}>
                <div>
                    <h5 className="mb-0">{player.name}</h5>
                    <small>{player.armyName}</small>
                </div>
                {isPriority && <Badge bg="light" text="dark">PRIORITY</Badge>}
            </Card.Header>
            <Card.Body>
                <div className="d-flex justify-content-around">
                    <div className="text-center">
                        <div className="display-4">{commandPoints}</div>
                        <small className="text-muted">CP (max 6)</small>
                        {hasAuxiliary && (
                            <div>
                                <Badge bg="warning" text="dark" className="mt-2">
                                    Has Auxiliary
                                </Badge>
                            </div>
                        )}
                    </div>

                    <div className="text-center">
                        <div className="display-4">{victoryPoints}</div>
                        <small className="text-muted">Victory Points</small>
                        <div className="mt-2">
                            <ButtonGroup size="sm">
                                <Button variant="outline-success" onClick={() => onVPChange(1)}>
                                    +1
                                </Button>
                                <Button variant="outline-success" onClick={() => onVPChange(5)}>
                                    +5
                                </Button>
                                <Button variant="outline-danger" onClick={() => onVPChange(-1)}>
                                    -1
                                </Button>
                            </ButtonGroup>
                        </div>
                    </div>
                </div>

                {player.grandStrategy && (
                    <div className="mt-3 p-2 bg-light rounded">
                        <div className="d-flex justify-content-between align-items-start">
                            <div>
                                <strong className="text-primary">Grand Strategy:</strong>{' '}
                                {AoSGrandStrategies.getDisplayName(player.grandStrategy)}
                                <div className="small text-muted mt-1">
                                    {AoSGrandStrategies.getDescription(player.grandStrategy)}
                                </div>
                            </div>
                            <Badge bg="info">3-5 VP</Badge>
                        </div>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default AoSPlayerPanel;