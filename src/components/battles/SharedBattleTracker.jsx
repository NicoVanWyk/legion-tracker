import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import MobileBattleTracker from './MobileBattleTracker';
import BattleTracker from './BattleTracker';
import { useIsMobile } from '../../hooks/useIsMobile';
import LoadingSpinner from '../layout/LoadingSpinner';
import { Alert } from 'react-bootstrap';

const SharedBattleTracker = () => {
    const { battleId } = useParams();
    const { currentUser } = useAuth();
    const isMobile = useIsMobile();
    const [battle, setBattle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!battleId || !currentUser) return;

        // Real-time listener for shared battle
        const battleRef = doc(db, 'shared-battles', battleId);
        const unsubscribe = onSnapshot(battleRef,
            (doc) => {
                if (doc.exists()) {
                    const battleData = doc.data();
                    
                    // Check if user is participant
                    if (!battleData.participants[currentUser.uid]) {
                        setError('You are not a participant in this battle');
                        setLoading(false);
                        return;
                    }

                    setBattle({
                        id: doc.id,
                        ...battleData,
                        // Flatten battle data for compatibility
                        ...battleData.battleData,
                        isSharedBattle: true
                    });
                } else {
                    setError('Battle not found');
                }
                setLoading(false);
            },
            (err) => {
                setError('Failed to load battle');
                setLoading(false);
            }
        );

        return unsubscribe;
    }, [battleId, currentUser]);

    // Save battle state (override for shared battles)
    const saveBattle = async (updatedBattle) => {
        try {
            const battleRef = doc(db, 'shared-battles', battleId);
            await updateDoc(battleRef, {
                battleData: {
                    ...updatedBattle,
                    lastUpdated: new Date()
                }
            });
        } catch (err) {
            console.error('Error saving shared battle:', err);
        }
    };

    // Determine if it's current user's turn
    const isCurrentUserTurn = () => {
        if (!battle || !currentUser) return false;
        
        const userParticipation = battle.participants[currentUser.uid];
        if (!userParticipation) return false;
        
        return battle.activePlayer === userParticipation.role;
    };

    if (loading) return <LoadingSpinner text="Loading multiplayer battle..." />;

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    // Pass modified props for shared battle
    const battleProps = {
        battle: {
            ...battle,
            isSharedBattle: true,
            isCurrentUserTurn: isCurrentUserTurn(),
            currentUserRole: battle.participants[currentUser.uid]?.role
        },
        onSave: saveBattle
    };

    return isMobile ? 
        <MobileBattleTracker {...battleProps} /> : 
        <BattleTracker {...battleProps} />;
};

export default SharedBattleTracker;