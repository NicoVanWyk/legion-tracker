import React, {useState, useEffect} from 'react';
import {Container, Card, Button, Tabs, Tab, Badge, Alert, Modal, Form} from 'react-bootstrap';
import {useParams, useNavigate} from 'react-router-dom';
import {doc, getDoc, updateDoc} from 'firebase/firestore';
import {db} from '../../../firebase/config';
import {useAuth} from '../../../contexts/AuthContext';
import AoSBattlePhases from '../../../enums/aos/AoSBattlePhases';
import AoSPlayerPanel from './AoSPlayerPanel';
import AoSUnitTracker from './AoSUnitTracker';
import AoSCommandPanel from './AoSCommandPanel';
import AoSPhaseReference from './AoSPhaseReference';
import LoadingSpinner from '../../layout/LoadingSpinner';

const AoSMobileBattleTracker = () => {
    const {battleId} = useParams();
    const {currentUser} = useAuth();
    const navigate = useNavigate();
    const [battle, setBattle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('p1');
    const [showEndBattleModal, setShowEndBattleModal] = useState(false);
    const [selectedWinner, setSelectedWinner] = useState(null);

    useEffect(() => {
        fetchBattle();
    }, [battleId, currentUser]);

    const fetchBattle = async () => {
        if (!currentUser || !battleId) return;

        try {
            const battleRef = doc(db, 'users', currentUser.uid, 'aosBattles', battleId);
            const battleDoc = await getDoc(battleRef);

            if (!battleDoc.exists()) {
                setError('Battle not found');
                return;
            }

            setBattle({id: battleDoc.id, ...battleDoc.data()});
        } catch (err) {
            console.error('Error fetching battle:', err);
            setError('Failed to load battle');
        } finally {
            setLoading(false);
        }
    };

    const saveBattle = async (updatedBattle) => {
        try {
            const battleRef = doc(db, 'users', currentUser.uid, 'aosBattles', battleId);
            await updateDoc(battleRef, {
                ...updatedBattle,
                lastUpdated: new Date()
            });
            setBattle({...battle, ...updatedBattle});
        } catch (err) {
            console.error('Error saving battle:', err);
            setError('Failed to save changes');
        }
    };

    const handlePhaseChange = async (newPhase) => {
        const updates = {currentPhase: newPhase, usedAbilitiesThisPhase: {player1: [], player2: []}};

        if (newPhase === AoSBattlePhases.END_OF_TURN) {
            updates.currentRound = battle.currentRound + 1;
            updates.currentPhase = AoSBattlePhases.PRIORITY;
        }

        if (newPhase === AoSBattlePhases.HERO) {
            let p1CP = Math.min(6, battle.player1CommandPoints + 1);
            let p2CP = Math.min(6, battle.player2CommandPoints + 1);

            if (battle.player2HasAuxiliary) p1CP = Math.min(6, p1CP + 1);
            if (battle.player1HasAuxiliary) p2CP = Math.min(6, p2CP + 1);

            updates.player1CommandPoints = p1CP;
            updates.player2CommandPoints = p2CP;
        }

        await saveBattle(updates);
    };

    const handleCPSpend = async (player, abilityId, cost) => {
        const cpField = player === 1 ? 'player1CommandPoints' : 'player2CommandPoints';
        const usedField = player === 1 ? 'player1' : 'player2';

        await saveBattle({
            [cpField]: battle[cpField] - cost,
            usedAbilitiesThisPhase: {
                ...battle.usedAbilitiesThisPhase,
                [usedField]: [...battle.usedAbilitiesThisPhase[usedField], abilityId]
            }
        });
    };

    const handleUnitUpdate = async (player, unitIndex, updates) => {
        const unitsField = player === 1 ? 'player1Units' : 'player2Units';
        const units = [...battle[unitsField]];
        units[unitIndex] = {...units[unitIndex], ...updates};
        await saveBattle({[unitsField]: units});
    };

    const handleVPChange = async (player, change) => {
        const vpField = player === 1 ? 'player1VictoryPoints' : 'player2VictoryPoints';
        await saveBattle({[vpField]: battle[vpField] + change});
    };

    const handlePriorityRoll = async (winner) => {
        await saveBattle({
            priorityPlayer: winner,
            currentPhase: AoSBattlePhases.HERO
        });
    };

    const handleToggleOncePerBattle = async (player, abilityId) => {
        const usedField = player === 1 ? 'player1' : 'player2';
        const currentUsed = battle.usedOncePerBattle?.[usedField] || [];

        const existingIndex = currentUsed.findIndex(used => used.abilityId === abilityId);

        let updatedUsed;
        if (existingIndex >= 0) {
            updatedUsed = currentUsed.filter((_, i) => i !== existingIndex);
        } else {
            updatedUsed = [...currentUsed, {
                abilityId,
                usedInRound: battle.currentRound,
                usedInPhase: battle.currentPhase,
                timestamp: new Date()
            }];
        }

        await saveBattle({
            usedOncePerBattle: {
                ...battle.usedOncePerBattle,
                [usedField]: updatedUsed
            }
        });
    };

    const handleEndBattle = async () => {
        try {
            await saveBattle({
                isComplete: true,
                winner: selectedWinner,
                completedAt: new Date()
            });
            setShowEndBattleModal(false);
            navigate('/aos/battles');
        } catch (err) {
            console.error('Error ending battle:', err);
            setError('Failed to end battle');
        }
    };

    const nextPhase = AoSBattlePhases.getNextPhase(battle?.currentPhase);

    if (loading) return <LoadingSpinner text="Loading battle..."/>;
    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!battle) return <Alert variant="warning">Battle not found</Alert>;

    return (
        <Container fluid className="pb-5">
            <Card className="mb-2 sticky-top" style={{top: 0, zIndex: 100}}>
                <Card.Body className="p-2">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 className="mb-0">{battle.name}</h6>
                            <small>
                                <Badge bg="info" className="me-1">R{battle.currentRound}</Badge>
                                <Badge
                                    bg="secondary"
                                    style={{backgroundColor: AoSBattlePhases.getColor(battle.currentPhase)}}
                                >
                                    {AoSBattlePhases.getDisplayName(battle.currentPhase).replace(' Phase', '')}
                                </Badge>
                            </small>
                        </div>
                        <div>
                            {nextPhase && (
                                <Button size="sm" variant="success" onClick={() => handlePhaseChange(nextPhase)}
                                        className="me-2">
                                    Next
                                </Button>
                            )}
                            <Button size="sm" variant="warning" onClick={() => setShowEndBattleModal(true)}>
                                End
                            </Button>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-2">
                <Tab eventKey="p1" title={battle.player1.name}>
                    <AoSPlayerPanel
                        player={battle.player1}
                        playerNumber={1}
                        commandPoints={battle.player1CommandPoints}
                        victoryPoints={battle.player1VictoryPoints}
                        isPriority={battle.priorityPlayer === 1}
                        hasAuxiliary={battle.player1HasAuxiliary}
                        onVPChange={(change) => handleVPChange(1, change)}
                    />
                    <AoSUnitTracker
                        units={battle.player1Units}
                        playerNumber={1}
                        onUnitUpdate={handleUnitUpdate}
                    />
                </Tab>

                <Tab eventKey="p2" title={battle.player2.name}>
                    <AoSPlayerPanel
                        player={battle.player2}
                        playerNumber={2}
                        commandPoints={battle.player2CommandPoints}
                        victoryPoints={battle.player2VictoryPoints}
                        isPriority={battle.priorityPlayer === 2}
                        hasAuxiliary={battle.player2HasAuxiliary}
                        onVPChange={(change) => handleVPChange(2, change)}
                    />
                    <AoSUnitTracker
                        units={battle.player2Units}
                        playerNumber={2}
                        onUnitUpdate={handleUnitUpdate}
                    />
                </Tab>

                <Tab eventKey="reference" title="Reference">
                    <AoSPhaseReference
                        battle={battle}
                        currentPhase={battle.currentPhase}
                        onToggleOncePerBattle={handleToggleOncePerBattle}
                    />
                </Tab>

                <Tab eventKey="commands" title="Commands">
                    <AoSCommandPanel battle={battle} onCPSpend={handleCPSpend}/>
                </Tab>
            </Tabs>

            <Modal show={showEndBattleModal} onHide={() => setShowEndBattleModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>End Battle</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to end this battle?</p>
                    <Form.Group>
                        <Form.Label>Winner (Optional)</Form.Label>
                        <Form.Select value={selectedWinner || ''}
                                     onChange={(e) => setSelectedWinner(e.target.value ? parseInt(e.target.value) : null)}>
                            <option value="">No Winner / Draw</option>
                            <option value="1">{battle.player1.name}</option>
                            <option value="2">{battle.player2.name}</option>
                        </Form.Select>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEndBattleModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleEndBattle}>
                        End Battle
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AoSMobileBattleTracker;