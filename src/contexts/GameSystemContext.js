// src/contexts/GameSystemContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import GameSystems from '../enums/GameSystems';
import GAME_CONFIGS from '../config/gameConfigs';

const GameSystemContext = createContext();

export const useGameSystem = () => {
    const context = useContext(GameSystemContext);
    if (!context) {
        throw new Error('useGameSystem must be used within GameSystemProvider');
    }
    return context;
};

export const GameSystemProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [currentSystem, setCurrentSystem] = useState(GameSystems.LEGION);
    const [loading, setLoading] = useState(true);

    // Load user's preferred game system
    useEffect(() => {
        const loadGameSystem = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                const userRef = doc(db, 'users', currentUser.uid);
                const userDoc = await getDoc(userRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setCurrentSystem(userData.gameSystem || GameSystems.LEGION);
                } else {
                    // Default to Legion for existing users
                    setCurrentSystem(GameSystems.LEGION);
                }
            } catch (err) {
                console.error('Error loading game system:', err);
                setCurrentSystem(GameSystems.LEGION);
            } finally {
                setLoading(false);
            }
        };

        loadGameSystem();
    }, [currentUser]);

    // Save game system preference
    const switchGameSystem = async (newSystem) => {
        if (!currentUser) return;

        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await setDoc(userRef, { gameSystem: newSystem }, { merge: true });
            setCurrentSystem(newSystem);
        } catch (err) {
            console.error('Error switching game system:', err);
        }
    };

    const config = GAME_CONFIGS[currentSystem];

    const value = {
        currentSystem,
        switchGameSystem,
        config,
        loading
    };

    return (
        <GameSystemContext.Provider value={value}>
            {children}
        </GameSystemContext.Provider>
    );
};