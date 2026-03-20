import React, {useState, useEffect} from 'react';
import {doc, onSnapshot, updateDoc} from 'firebase/firestore';
import {db} from '../../../firebase/config';
import {useAuth} from '../../../contexts/AuthContext';
import {useParams} from 'react-router-dom';
import AoSMobileBattleTracker from './AoSMobileBattleTracker';
import AoSBattleTracker from './AoSBattleTracker';
import {useIsMobile} from '../../../hooks/useIsMobile';
import LoadingSpinner from '../../layout/LoadingSpinner';
import {Alert} from 'react-bootstrap';

const AoSSharedBattleTracker = () => {
    const {battleId} = useParams();
    const {currentUser} = useAuth();
    const isMobile = useIsMobile();
    const [battle, setBattle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!battleId || !currentUser) return;

        const battleRef = doc(db, 'aos-shared-battles', battleId);
        const unsubscribe = onSnapshot(battleRef,
            (doc) => {
                if (doc.exists()) {
                    const battleData = doc.data();

                    if (!battleData.participants[currentUser.uid]) {
                        setError('You are not a participant in this battle');
                        setLoading(false);
                        return;
                    }

                    setBattle({
                        id: doc.id,
                        ...battleData,
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

    const saveBattle = async (updatedBattle) => {
        try {
            const battleRef = doc(db, 'aos-shared-battles', battleId);
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

    const isCurrentUserTurn = () => {
        if (!battle || !currentUser) return false;

        const userParticipation = battle.participants[currentUser.uid];
        if (!userParticipation) return false;

        return battle.activePlayer === userParticipation.role;
    };

    if (loading) return <LoadingSpinner text="Loading multiplayer battle..."/>;
    if (error) return <Alert variant="danger">{error}</Alert>;

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
        <AoSMobileBattleTracker {...battleProps} /> :
        <AoSBattleTracker {...battleProps} />;
};

export default AoSSharedBattleTracker;