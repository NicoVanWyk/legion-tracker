import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useRealtimeBattle = (battleId, isSharedBattle = false) => {
    const [battle, setBattle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!battleId) return;

        const battleRef = isSharedBattle 
            ? doc(db, 'shared-battles', battleId)
            : doc(db, 'users', currentUser.uid, 'battles', battleId);

        const unsubscribe = onSnapshot(battleRef, 
            (doc) => {
                if (doc.exists()) {
                    setBattle({
                        id: doc.id,
                        ...doc.data()
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
    }, [battleId, isSharedBattle]);

    return { battle, loading, error };
};