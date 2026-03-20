import React, {useState} from 'react';
import {Card, ListGroup, Button, Badge, Form, Alert, Tabs, Tab} from 'react-bootstrap';
import AoSCommandAbilities from '../../../enums/aos/AoSCommandAbilities';

const AoSCommandPanel = ({battle, onCPSpend}) => {
    const [selectedPlayer, setSelectedPlayer] = useState(1);
    const [selectedAbility, setSelectedAbility] = useState(null);

    const currentCP = selectedPlayer === 1 ? battle.player1CommandPoints : battle.player2CommandPoints;
    const usedAbilities = selectedPlayer === 1
        ? battle.usedAbilitiesThisPhase.player1
        : battle.usedAbilitiesThisPhase.player2;

    const phaseAbilities = AoSCommandAbilities.getAbilitiesByPhase(battle.currentPhase);

    const canUseAbility = (ability) => {
        if (currentCP < ability.cost) return false;
        if (usedAbilities.includes(ability.id)) return false;
        return true;
    };

    const handleUseAbility = (ability) => {
        if (!canUseAbility(ability)) return;
        onCPSpend(selectedPlayer, ability.id, ability.cost);
        setSelectedAbility(null);
    };

    return (
        <Card>
            <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Command Abilities</h5>
                    <Form.Select
                        value={selectedPlayer}
                        onChange={(e) => setSelectedPlayer(parseInt(e.target.value))}
                        style={{width: 'auto'}}
                    >
                        <option value={1}>{battle.player1.name}</option>
                        <option value={2}>{battle.player2.name}</option>
                    </Form.Select>
                </div>
            </Card.Header>
            <Card.Body>
                <Alert variant="info" className="mb-3">
                    <strong>Available CP:</strong> {currentCP} / 6
                </Alert>

                <Tabs defaultActiveKey="core" className="mb-3">
                    <Tab eventKey="core" title="Core Commands">
                        <ListGroup>
                            {AoSCommandAbilities.getAbilitiesByType('CORE').map(ability => (
                                <ListGroup.Item
                                    key={ability.id}
                                    className="d-flex justify-content-between align-items-start"
                                >
                                    <div>
                                        <strong>{ability.name}</strong>
                                        <Badge bg="secondary" className="ms-2">{ability.cost} CP</Badge>
                                        {usedAbilities.includes(ability.id) && (
                                            <Badge bg="warning" text="dark" className="ms-2">Used</Badge>
                                        )}
                                        <p className="mb-0 small text-muted mt-1">{ability.description}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        disabled={!canUseAbility(ability)}
                                        onClick={() => handleUseAbility(ability)}
                                    >
                                        Use
                                    </Button>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Tab>

                    <Tab eventKey="heroic" title="Heroic Actions">
                        <ListGroup>
                            {AoSCommandAbilities.getAbilitiesByType('HEROIC').map(ability => (
                                <ListGroup.Item
                                    key={ability.id}
                                    className="d-flex justify-content-between align-items-start"
                                >
                                    <div>
                                        <strong>{ability.name}</strong>
                                        <Badge bg="secondary" className="ms-2">{ability.cost} CP</Badge>
                                        {usedAbilities.includes(ability.id) && (
                                            <Badge bg="warning" text="dark" className="ms-2">Used</Badge>
                                        )}
                                        <p className="mb-0 small text-muted mt-1">{ability.description}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        disabled={!canUseAbility(ability)}
                                        onClick={() => handleUseAbility(ability)}
                                    >
                                        Use
                                    </Button>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Tab>

                    <Tab eventKey="reactions" title="Reactions">
                        <ListGroup>
                            {AoSCommandAbilities.getAbilitiesByType('REACTION').map(ability => (
                                <ListGroup.Item
                                    key={ability.id}
                                    className="d-flex justify-content-between align-items-start"
                                >
                                    <div>
                                        <strong>{ability.name}</strong>
                                        <Badge bg="secondary" className="ms-2">{ability.cost} CP</Badge>
                                        {usedAbilities.includes(ability.id) && (
                                            <Badge bg="warning" text="dark" className="ms-2">Used</Badge>
                                        )}
                                        <p className="mb-0 small text-muted mt-1">{ability.description}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        disabled={!canUseAbility(ability)}
                                        onClick={() => handleUseAbility(ability)}
                                    >
                                        Use
                                    </Button>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Tab>
                </Tabs>
            </Card.Body>
        </Card>
    );
};

export default AoSCommandPanel;