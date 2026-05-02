import React, {useState, useEffect} from 'react';
import {Container, Row, Col, Card, Button, Alert, Modal, Form} from 'react-bootstrap';
import {useParams, useNavigate} from 'react-router-dom';
import {doc, getDoc, updateDoc} from 'firebase/firestore';
import {db} from '../../../firebase/config';
import {useAuth} from '../../../contexts/AuthContext';
import AoSBattlePhases from '../../../enums/aos/AoSBattlePhases';
import AoSBattleHeader from './AoSBattleHeader';
import AoSPlayerPanel from './AoSPlayerPanel';
import AoSUnitTracker from './AoSUnitTracker';
import AoSCommandPanel from './AoSCommandPanel';
import AoSPhaseControls from './AoSPhaseControls';
import AoSPhaseReference from './AoSPhaseReference';
import AoSBattleInviteForm from './AoSBattleInviteForm';
import LoadingSpinner from '../../layout/LoadingSpinner';

const AoSBattleTracker = () => {
    const {battleId} = useParams();
    const {currentUser} = useAuth();
    const navigate = useNavigate();
    const [battle, setBattle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showEndBattleModal, setShowEndBattleModal] = useState(false);
    const [selectedWinner, setSelectedWinner] = useState(null);
    const [showInviteModal, setShowInviteModal] = useState(false);

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
        const updates = {currentPhase: newPhase};

        updates.usedAbilitiesThisPhase = {
            player1: [],
            player2: []
        };

        if (newPhase === AoSBattlePhases.END_OF_TURN) {
            const newRound = battle.currentRound + 1;
            updates.currentRound = newRound;
            updates.currentPhase = AoSBattlePhases.PRIORITY;

            const cpHistoryEntry = {
                round: battle.currentRound,
                player1: {
                    start: battle.player1CommandPoints,
                    end: battle.player1CommandPoints
                },
                player2: {
                    start: battle.player2CommandPoints,
                    end: battle.player2CommandPoints
                }
            };
            updates.cpHistory = [...(battle.cpHistory || []), cpHistoryEntry];
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

    const handlePriorityRoll = async (winner) => {
        await saveBattle({
            priorityPlayer: winner,
            currentPhase: AoSBattlePhases.HERO
        });
    };

    const handleCPSpend = async (player, abilityId, cost) => {
        const cpField = player === 1 ? 'player1CommandPoints' : 'player2CommandPoints';
        const usedField = player === 1 ? 'player1' : 'player2';

        const updates = {
            [cpField]: battle[cpField] - cost,
            usedAbilitiesThisPhase: {
                ...battle.usedAbilitiesThisPhase,
                [usedField]: [...battle.usedAbilitiesThisPhase[usedField], abilityId]
            }
        };

        await saveBattle(updates);
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

    if (loading) return <LoadingSpinner text="Loading battle..."/>;
    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!battle) return <Alert variant="warning">Battle not found</Alert>;

    return (
        <Container fluid>
            <AoSBattleHeader
                battle={battle}
                onPriorityRoll={handlePriorityRoll}
            />

            <Row className="mt-3">
                <Col className="text-end">
                    {!battle.player2.userId && (
                        <Button 
                            variant="info" 
                            className="me-2"
                            onClick={() => setShowInviteModal(true)}
                        >
                            Invite Player 2
                        </Button>
                    )}
                    <Button variant="warning" onClick={() => setShowEndBattleModal(true)}>
                        End Battle
                    </Button>
                </Col>
            </Row>

            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

            <Row className="mt-3">
                <Col lg={6}>
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
                </Col>

                <Col lg={6}>
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
                </Col>
            </Row>

            <Row className="mt-3">
                <Col>
                    <AoSPhaseReference
                        battle={battle}
                        currentPhase={battle.currentPhase}
                        onToggleOncePerBattle={handleToggleOncePerBattle}
                    />
                </Col>
            </Row>

            <Row className="mt-3">
                <Col>
                    <AoSCommandPanel
                        battle={battle}
                        onCPSpend={handleCPSpend}
                    />
                </Col>
            </Row>

            <Row className="mt-3">
                <Col>
                    <AoSPhaseControls
                        currentPhase={battle.currentPhase}
                        currentRound={battle.currentRound}
                        onPhaseChange={handlePhaseChange}
                    />
                </Col>
            </Row>

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

            <AoSBattleInviteForm 
                show={showInviteModal}
                onHide={() => setShowInviteModal(false)}
                existingBattle={battle}
                existingBattleId={battleId}
                onInviteSent={() => {
                    setShowInviteModal(false);
                    // Optionally navigate to shared battle or show success message
                }}
            />
        </Container>
    );
};

export default AoSBattleTracker;