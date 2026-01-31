// src/components/battles/MobileBattleTracker.jsx
import React, { useState, useEffect } from 'react';
import { Card, Alert, Badge, Button, Row, Col, Offcanvas } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import BattlePhases from '../../enums/BattlePhases';
import PlayerSides from '../../enums/PlayerSides';
import CommandPhase from './CommandPhase';
import MobileActivationPhase from './MobileActivationPhase';
import EndPhase from './EndPhase';
import MobileBattleControls from './MobileBattleControls';
import QuickReferenceDrawer from './QuickReferenceDrawer';
import LoadingSpinner from '../layout/LoadingSpinner';
import ReminderPanel from '../reminders/ReminderPanel';

const MobileBattleTracker = ({ battleId }) => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [battle, setBattle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [showReference, setShowReference] = useState(false);
    const [abilities, setAbilities] = useState([]);
    const [upgrades, setUpgrades] = useState([]);

    // Determine if current user is active player
    const isCurrentUserTurn = () => {
        if (!battle || !currentUser) return false;
        
        // Check if user owns units on the active side
        const userIsBlue = battle.blueUnits.some(u => u.userId === currentUser.uid);
        const userIsRed = battle.redUnits.some(u => u.userId === currentUser.uid);
        
        return (battle.activePlayer === PlayerSides.BLUE && userIsBlue) ||
               (battle.activePlayer === PlayerSides.RED && userIsRed);
    };

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
                setError('Failed to fetch battle details.');
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
        const fetchData = async () => {
            if (!currentUser) return;

            try {
                const abilitiesRef = collection(db, 'users', currentUser.uid, 'abilities');
                const abilitiesSnapshot = await getDocs(abilitiesRef);
                setAbilities(abilitiesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })));

                const upgradesRef = collection(db, 'users', currentUser.uid, 'upgradeCards');
                const upgradesSnapshot = await getDocs(upgradesRef);
                setUpgrades(upgradesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })));
            } catch (err) {
                console.error('Error fetching data:', err);
            }
        };

        fetchData();
    }, [currentUser]);

    // Save battle state
    const saveBattle = async (updatedBattle = battle) => {
        try {
            setSaving(true);
            const battleRef = doc(db, 'users', currentUser.uid, 'battles', battleId);
            await updateDoc(battleRef, {
                ...updatedBattle,
                lastUpdated: serverTimestamp()
            });
            setBattle(updatedBattle);
        } catch (err) {
            console.error('Error saving battle:', err);
            setError('Failed to save battle state.');
        } finally {
            setSaving(false);
        }
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
            // Reset units for next round
            updatedBattle.blueUnits = battle.blueUnits.map(unit => ({
                ...unit,
                hasOrder: false,
                hasActivated: false,
                tokens: { ...unit.tokens, aim: 0, dodge: 0, surge: 0, ion: 0, smoke: 0, standby: 0 }
            }));
            
            updatedBattle.redUnits = battle.redUnits.map(unit => ({
                ...unit,
                hasOrder: false,
                hasActivated: false,
                tokens: { ...unit.tokens, aim: 0, dodge: 0, surge: 0, ion: 0, smoke: 0, standby: 0 }
            }));

            // Reset command cards
            updatedBattle.blueCommandCard = null;
            updatedBattle.redCommandCard = null;
            updatedBattle.blueCommandCardDetails = null;
            updatedBattle.redCommandCardDetails = null;

            // Alternate active player
            updatedBattle.activePlayer = battle.activePlayer === PlayerSides.BLUE 
                ? PlayerSides.RED : PlayerSides.BLUE;
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

    const collectReminders = () => {
        if (!battle) return [];
        const reminders = [];
        
        // Collect reminders from units and abilities
        battle.blueUnits?.forEach(unit => {
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
        });

        battle.redUnits?.forEach(unit => {
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
        });

        return reminders;
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

    if (!battle || battle.isComplete) {
        return (
            <Alert variant="warning">
                Battle not found or completed.
                <div className="mt-3">
                    <Button variant="primary" onClick={() => navigate('/battles')}>
                        Back to Battles
                    </Button>
                </div>
            </Alert>
        );
    }

    const userTurn = isCurrentUserTurn();

    return (
        <div className="mobile-battle-tracker">
            {saving && (
                <Alert variant="info" className="mb-2">
                    Saving...
                </Alert>
            )}

            {/* Battle Header */}
            <Card className="mb-3">
                <Card.Header className="d-flex justify-content-between align-items-center p-2">
                    <div>
                        <h6 className="mb-0">{battle.name}</h6>
                        <small className="text-muted">
                            Round {battle.currentRound} - {BattlePhases.getDisplayName(battle.currentPhase)}
                        </small>
                    </div>
                    <Badge bg={userTurn ? 'success' : 'secondary'}>
                        {userTurn ? 'Your Turn' : 'Waiting'}
                    </Badge>
                </Card.Header>
            </Card>

            {/* Turn Status */}
            {!userTurn && (
                <Alert variant="warning" className="mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <span>Waiting for {battle.activePlayer === PlayerSides.BLUE ? battle.bluePlayer : battle.redPlayer}</span>
                        <Button variant="outline-primary" size="sm" onClick={() => setShowReference(true)}>
                            View Rules
                        </Button>
                    </div>
                </Alert>
            )}

            {/* Battle Controls */}
            <MobileBattleControls
                battle={battle}
                onAdvancePhase={handleAdvancePhase}
                userTurn={userTurn}
                disabled={!userTurn}
            />

            {/* Phase Content */}
            <div className="phase-content mb-3">
                {battle.currentPhase === BattlePhases.COMMAND && (
                    <CommandPhase
                        battle={battle}
                        onUnitUpdate={handleUnitUpdate}
                        onSave={saveBattle}
                    />
                )}

                {battle.currentPhase === BattlePhases.ACTIVATION && (
                    <MobileActivationPhase
                        battle={battle}
                        onUnitUpdate={handleUnitUpdate}
                        onSetSelectedUnit={setSelectedUnit}
                        userTurn={userTurn}
                    />
                )}

                {battle.currentPhase === BattlePhases.END && (
                    <EndPhase
                        battle={battle}
                        onUnitUpdate={handleUnitUpdate}
                        onSave={saveBattle}
                    />
                )}
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed-bottom bg-light p-3 border-top d-flex justify-content-between align-items-center">
                <Button 
                    variant="primary" 
                    onClick={() => setShowReference(true)}
                    className="d-flex align-items-center"
                >
                    <i className="bi bi-book-fill me-2"></i> 
                    Weapon Rules
                </Button>
                <div className="d-flex gap-2">
                    <Button 
                        variant="outline-secondary" 
                        onClick={() => navigate('/battles')}
                    >
                        <i className="bi bi-arrow-left"></i>
                    </Button>
                </div>
            </div>

            {/* Quick Reference Drawer */}
            <QuickReferenceDrawer
                show={showReference}
                onHide={() => setShowReference(false)}
                battle={battle}
                reminders={collectReminders()}
            />

            {/* Mobile Reminders Panel */}
            <div className="d-block d-lg-none mb-5">
                <ReminderPanel
                    reminders={collectReminders()}
                    currentPhase={battle.currentPhase}
                    activeUnit={selectedUnit}
                    position="banner"
                />
            </div>
        </div>
    );
};

export default MobileBattleTracker;