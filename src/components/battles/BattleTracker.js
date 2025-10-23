// src/components/battles/BattleTracker.js
import React, { useState, useEffect } from 'react';
import { Card, Alert, Badge, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import BattlePhases from '../../enums/BattlePhases';
import PlayerSides from '../../enums/PlayerSides';
import CommandCards from '../../enums/CommandCards';
import CommandPhase from './CommandPhase';
import ActivationPhase from './ActivationPhase';
import EndPhase from './EndPhase';
import BattleControls from './BattleControls';
import LoadingSpinner from '../layout/LoadingSpinner';
import ReminderPanel from '../reminders/ReminderPanel';

const BattleTracker = ({ battleId }) => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [battle, setBattle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [confirmEndBattle, setConfirmEndBattle] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [abilities, setAbilities] = useState([]);
    const [upgrades, setUpgrades] = useState([]);
    const [commandReminders, setCommandReminders] = useState([]);

    // Load battle data
    useEffect(() => {
        const fetchBattle = async () => {
            try {
                setLoading(true);

                const battleRef = doc(db, 'users', currentUser.uid, 'battles', battleId);
                const battleDoc = await getDoc(battleRef);

                if (battleDoc.exists()) {
                    const battleData = {
                        id: battleDoc.id,
                        ...battleDoc.data(),
                        createdAt: battleDoc.data().createdAt?.toDate() || new Date(),
                        lastUpdated: battleDoc.data().lastUpdated?.toDate() || new Date()
                    };

                    setBattle(battleData);
                } else {
                    setError('Battle not found');
                }
            } catch (err) {
                console.error('Error fetching battle:', err);
                setError('Failed to fetch battle details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (currentUser && battleId) {
            fetchBattle();
        }
    }, [currentUser, battleId]);

    // Fetch abilities and upgrades
    useEffect(() => {
        const fetchAbilitiesAndUpgrades = async () => {
            if (!currentUser) return;

            try {
                // Fetch abilities
                const abilitiesRef = collection(db, 'users', currentUser.uid, 'abilities');
                const abilitiesSnapshot = await getDocs(abilitiesRef);
                setAbilities(abilitiesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })));

                // Fetch upgrades
                const upgradesRef = collection(db, 'users', currentUser.uid, 'upgradeCards');
                const upgradesSnapshot = await getDocs(upgradesRef);
                setUpgrades(upgradesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })));
            } catch (err) {
                console.error('Error fetching abilities/upgrades:', err);
            }
        };

        fetchAbilitiesAndUpgrades();
    }, [currentUser]);

    // Update command card reminders when cards change
    useEffect(() => {
        if (!battle) return;

        const reminders = [];

        // Add reminders from blue command card
        if (battle.blueCommandCard) {
            const cardId = battle.blueCommandCard;

            // For system cards
            if (CommandCards.getAllSystemCards().includes(cardId)) {
                reminders.push({
                    text: CommandCards.getDescription(cardId),
                    phase: BattlePhases.COMMAND,
                    source: `${battle.bluePlayer}'s card: ${CommandCards.getDisplayName(cardId)}`,
                    team: PlayerSides.BLUE,
                    condition: 'Command phase'
                });
            }
            // For custom cards
            else if (battle.blueCommandCardDetails) {
                reminders.push({
                    text: battle.blueCommandCardDetails.description ||
                        battle.blueCommandCardDetails.effectText ||
                        'No effect description',
                    phase: BattlePhases.COMMAND,
                    source: `${battle.bluePlayer}'s card: ${battle.blueCommandCardDetails.name}`,
                    team: PlayerSides.BLUE,
                    condition: 'Command phase'
                });
            }
        }

        // Add reminders from red command card
        if (battle.redCommandCard) {
            const cardId = battle.redCommandCard;

            // For system cards
            if (CommandCards.getAllSystemCards().includes(cardId)) {
                reminders.push({
                    text: CommandCards.getDescription(cardId),
                    phase: BattlePhases.COMMAND,
                    source: `${battle.redPlayer}'s card: ${CommandCards.getDisplayName(cardId)}`,
                    team: PlayerSides.RED,
                    condition: 'Command phase'
                });
            }
            // For custom cards
            else if (battle.redCommandCardDetails) {
                reminders.push({
                    text: battle.redCommandCardDetails.description ||
                        battle.redCommandCardDetails.effectText ||
                        'No effect description',
                    phase: BattlePhases.COMMAND,
                    source: `${battle.redPlayer}'s card: ${battle.redCommandCardDetails.name}`,
                    team: PlayerSides.RED,
                    condition: 'Command phase'
                });
            }
        }

        setCommandReminders(reminders);
    }, [battle?.blueCommandCard, battle?.redCommandCard, battle?.blueCommandCardDetails, battle?.redCommandCardDetails, battle?.bluePlayer, battle?.redPlayer]);

    // Save battle state to Firestore
    const saveBattle = async (updatedBattle = battle) => {
        try {
            setSaving(true);
            const battleRef = doc(db, 'users', currentUser.uid, 'battles', battleId);
            await updateDoc(battleRef, {
                ...updatedBattle,
                lastUpdated: serverTimestamp()
            });

            // Update local state
            setBattle(updatedBattle);
        } catch (err) {
            console.error('Error saving battle:', err);
            setError('Failed to save battle state. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const collectReminders = () => {
        if (!battle) return [];

        const reminders = [...commandReminders]; // Include command card reminders

        // Helper function to process unit reminders
        const processUnitReminders = (unit) => {
            // From unit abilities
            unit.abilities?.forEach(abilityId => {
                const ability = abilities.find(a => a.id === abilityId);
                ability?.reminders?.forEach(reminder => {
                    reminders.push({
                        ...reminder,
                        source: `${unit.name} - ${ability.name}`,
                        unitId: unit.id
                    });
                });
            });

            // From equipped upgrades
            unit.upgradeSlots?.forEach(slot => {
                slot.equippedUpgrades?.forEach(upgradeId => {
                    const upgrade = upgrades.find(u => u.id === upgradeId);
                    upgrade?.reminders?.forEach(reminder => {
                        reminders.push({
                            ...reminder,
                            source: `${unit.name} - ${upgrade.name}`,
                            unitId: unit.id
                        });
                    });
                });
            });
        };

        // Process blue units
        battle.blueUnits?.forEach(processUnitReminders);

        // Process red units
        battle.redUnits?.forEach(processUnitReminders);

        return reminders;
    };

    // Handle advancing phase
    const handleAdvancePhase = async () => {
        const nextPhase = BattlePhases.getNextPhase(battle.currentPhase);

        let nextRound = battle.currentRound;
        if (battle.currentPhase === BattlePhases.END && nextPhase === BattlePhases.COMMAND) {
            nextRound += 1;
        }

        const updatedBattle = {
            ...battle,
            currentPhase: nextPhase,
            currentRound: nextRound
        };

        if (battle.currentPhase === BattlePhases.END && nextPhase === BattlePhases.COMMAND) {
            // Reset units for the next round
            updatedBattle.blueUnits = battle.blueUnits.map(unit => ({
                ...unit,
                hasOrder: false,
                hasActivated: false,
                // Reset tokens except shield
                tokens: {
                    ...unit.tokens,
                    aim: 0,
                    dodge: 0,
                    surge: 0,
                    // Keep shield tokens if they came from keywords
                    ion: 0,
                    smoke: 0,
                    standby: 0
                },
                // Reset surge usage
                surgeAttackUsed: false,
                surgeDefenseUsed: false
            }));

            updatedBattle.redUnits = battle.redUnits.map(unit => ({
                ...unit,
                hasOrder: false,
                hasActivated: false,
                // Reset tokens except shield
                tokens: {
                    ...unit.tokens,
                    aim: 0,
                    dodge: 0,
                    surge: 0,
                    // Keep shield tokens if they came from keywords
                    ion: 0,
                    smoke: 0,
                    standby: 0
                },
                // Reset surge usage
                surgeAttackUsed: false,
                surgeDefenseUsed: false
            }));

            // Reset command cards for the new round
            updatedBattle.blueCommandCard = null;
            updatedBattle.redCommandCard = null;
            updatedBattle.blueCommandCardDetails = null;
            updatedBattle.redCommandCardDetails = null;

            // Alternate active player each round
            updatedBattle.activePlayer = battle.activePlayer === PlayerSides.BLUE
                ? PlayerSides.RED
                : PlayerSides.BLUE;
        }

        await saveBattle(updatedBattle);
    };

    // Handle unit updates
    const handleUnitUpdate = (side, unitId, updates) => {
        const updatedBattle = { ...battle };

        if (side === PlayerSides.BLUE) {
            updatedBattle.blueUnits = battle.blueUnits.map(unit =>
                unit.id === unitId ? { ...unit, ...updates } : unit
            );
        } else {
            updatedBattle.redUnits = battle.redUnits.map(unit =>
                unit.id === unitId ? { ...unit, ...updates } : unit
            );
        }

        setBattle(updatedBattle);
        saveBattle(updatedBattle);
    };

    // Handle changing active player
    const handleChangeActivePlayer = () => {
        const updatedBattle = {
            ...battle,
            activePlayer: battle.activePlayer === PlayerSides.BLUE
                ? PlayerSides.RED
                : PlayerSides.BLUE
        };

        setBattle(updatedBattle);
        saveBattle(updatedBattle);
    };

    // Handle ending the battle
    const handleEndBattle = async (winner) => {
        if (!confirmEndBattle) {
            setConfirmEndBattle(true);
            return;
        }

        const updatedBattle = {
            ...battle,
            isComplete: true,
            winner
        };

        setBattle(updatedBattle);
        await saveBattle(updatedBattle);
        navigate('/battles');
    };

    // Render command cards info for battle summary
    const renderCommandCards = () => {
        const blueCardName = battle.blueCommandCardDetails?.name ||
            (battle.blueCommandCard ? CommandCards.getDisplayName(battle.blueCommandCard) : 'None');

        const redCardName = battle.redCommandCardDetails?.name ||
            (battle.redCommandCard ? CommandCards.getDisplayName(battle.redCommandCard) : 'None');

        const bluePips = battle.blueCommandCardDetails?.pips ||
            (battle.blueCommandCard ? CommandCards.getPips(battle.blueCommandCard) : 0);

        const redPips = battle.redCommandCardDetails?.pips ||
            (battle.redCommandCard ? CommandCards.getPips(battle.redCommandCard) : 0);

        return (
            <Row className="mb-4">
                <Col md={12}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Command Cards</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col xs={6}>
                                    <div className="p-2" style={{ background: '#f0f8ff', borderRadius: '5px' }}>
                                        <h6 className="text-primary">{battle.bluePlayer}'s Card</h6>
                                        <div>
                                            {blueCardName} {bluePips > 0 && `(${"●".repeat(bluePips)})`}
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={6}>
                                    <div className="p-2" style={{ background: '#fff0f0', borderRadius: '5px' }}>
                                        <h6 className="text-danger">{battle.redPlayer}'s Card</h6>
                                        <div>
                                            {redCardName} {redPips > 0 && `(${"●".repeat(redPips)})`}
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        );
    };

    if (loading) {
        return <LoadingSpinner text="Loading battle..." />;
    }

    if (error) {
        return (
            <Alert variant="danger">
                {error}
                <div className="mt-3">
                    <Button variant="primary" onClick={() => navigate('/battles')}>
                        Back to Battles
                    </Button>
                </div>
            </Alert>
        );
    }

    if (!battle) {
        return (
            <Alert variant="warning">
                Battle not found.
                <div className="mt-3">
                    <Button variant="primary" onClick={() => navigate('/battles')}>
                        Back to Battles
                    </Button>
                </div>
            </Alert>
        );
    }

    // If battle is complete, show summary
    if (battle.isComplete) {
        return (
            <Card>
                <Card.Header>
                    <h4>{battle.name} - Battle Complete</h4>
                </Card.Header>
                <Card.Body>
                    <div className="text-center mb-4">
                        <h5>Winner: {battle.winner === PlayerSides.BLUE ? battle.bluePlayer : battle.redPlayer}</h5>
                        <Badge
                            bg={battle.winner === PlayerSides.BLUE ? 'primary' : 'danger'}
                            className="p-2 fs-6"
                        >
                            {battle.winner === PlayerSides.BLUE ? battle.blueArmy : battle.redArmy}
                        </Badge>
                    </div>

                    <div className="d-flex justify-content-between mb-4">
                        <div className="text-center p-3" style={{ background: '#f0f8ff', borderRadius: '5px', flex: '1', marginRight: '10px' }}>
                            <h5 className="text-primary">{battle.bluePlayer}</h5>
                            <div>{battle.blueArmy}</div>
                            <div>Units: {battle.blueUnits.length}</div>
                            {battle.winner === PlayerSides.BLUE && (
                                <Badge bg="success" className="mt-2">Winner</Badge>
                            )}
                        </div>

                        <div className="text-center p-3" style={{ background: '#fff0f0', borderRadius: '5px', flex: '1', marginLeft: '10px' }}>
                            <h5 className="text-danger">{battle.redPlayer}</h5>
                            <div>{battle.redArmy}</div>
                            <div>Units: {battle.redUnits.length}</div>
                            {battle.winner === PlayerSides.RED && (
                                <Badge bg="success" className="mt-2">Winner</Badge>
                            )}
                        </div>
                    </div>

                    <div className="d-flex justify-content-between">
                        <Button variant="secondary" onClick={() => navigate('/battles')}>
                            Back to Battles
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        );
    }

    return (
        <>
            {saving && (
                <Alert variant="info">Saving battle state...</Alert>
            )}

            {confirmEndBattle && (
                <Alert variant="warning">
                    <Alert.Heading>Confirm End Battle</Alert.Heading>
                    <p>Are you sure you want to end this battle? This action will mark the battle as complete.</p>
                    <p>Select the winner:</p>
                    <div className="d-flex justify-content-between">
                        <Button
                            variant="primary"
                            onClick={() => handleEndBattle(PlayerSides.BLUE)}
                            className="me-2"
                        >
                            {battle.bluePlayer} ({battle.blueArmy})
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => handleEndBattle(PlayerSides.RED)}
                            className="me-2"
                        >
                            {battle.redPlayer} ({battle.redArmy})
                        </Button>
                        <Button variant="secondary" onClick={() => setConfirmEndBattle(false)}>
                            Cancel
                        </Button>
                    </div>
                </Alert>
            )}

            <div className="d-flex">
                <div className="battle-content flex-grow-1">
                    <Card className="mb-4">
                        <Card.Header>
                            <div className="d-flex justify-content-between align-items-center">
                                <h4>{battle.name}</h4>
                                <Badge bg="primary" className="p-2">
                                    Round {battle.currentRound} - {BattlePhases.getDisplayName(battle.currentPhase)}
                                </Badge>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <BattleControls
                                battle={battle}
                                onAdvancePhase={handleAdvancePhase}
                                onChangeActivePlayer={handleChangeActivePlayer}
                                onEndBattle={() => setConfirmEndBattle(true)}
                            />

                            {/* Show command cards for current round if selected */}
                            {(battle.blueCommandCard || battle.redCommandCard) && battle.currentPhase !== BattlePhases.COMMAND && (
                                renderCommandCards()
                            )}

                            {battle.currentPhase === BattlePhases.COMMAND && (
                                <CommandPhase
                                    battle={battle}
                                    onUnitUpdate={handleUnitUpdate}
                                    onSave={saveBattle}
                                />
                            )}

                            {battle.currentPhase === BattlePhases.ACTIVATION && (
                                <ActivationPhase
                                    battle={battle}
                                    onUnitUpdate={handleUnitUpdate}
                                    onSetSelectedUnit={setSelectedUnit}
                                    onSave={saveBattle}
                                />
                            )}

                            {battle.currentPhase === BattlePhases.END && (
                                <EndPhase
                                    battle={battle}
                                    onUnitUpdate={handleUnitUpdate}
                                    onSave={saveBattle}
                                />
                            )}
                        </Card.Body>
                    </Card>
                </div>

                {/* ReminderPanel - Desktop version */}
                <div className="d-none d-lg-block ms-3" style={{ width: '300px' }}>
                    <ReminderPanel
                        reminders={collectReminders()}
                        currentPhase={battle.currentPhase}
                        activeUnit={selectedUnit}
                        position="sidebar"
                    />
                </div>
            </div>

            {/* ReminderPanel - Mobile version */}
            <div className="d-block d-lg-none mb-4">
                <ReminderPanel
                    reminders={collectReminders()}
                    currentPhase={battle.currentPhase}
                    activeUnit={selectedUnit}
                    position="banner"
                />
            </div>
        </>
    );
};

export default BattleTracker;