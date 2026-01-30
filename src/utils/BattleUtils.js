export const BattleUtils = {
    isUserTurn: (battle, currentUser) => {
        if (!battle || !currentUser) return false;
        
        // Check if user owns units on the active side
        const userIsBlue = battle.blueUnits?.some(u => u.userId === currentUser.uid);
        const userIsRed = battle.redUnits?.some(u => u.userId === currentUser.uid);
        
        return (battle.activePlayer === 'blue' && userIsBlue) ||
               (battle.activePlayer === 'red' && userIsRed);
    },

    getUserUnits: (battle, currentUser) => {
        if (!battle || !currentUser) return [];
        
        const userIsBlue = battle.blueUnits?.some(u => u.userId === currentUser.uid);
        return userIsBlue ? battle.blueUnits : battle.redUnits;
    },

    getOpponentUnits: (battle, currentUser) => {
        if (!battle || !currentUser) return [];
        
        const userIsBlue = battle.blueUnits?.some(u => u.userId === currentUser.uid);
        return userIsBlue ? battle.redUnits : battle.blueUnits;
    },

    canAdvancePhase: (battle, currentPhase, currentUser) => {
        const isUserTurn = BattleUtils.isUserTurn(battle, currentUser);
        if (!isUserTurn) return false;

        switch (currentPhase) {
            case 'command':
                return battle.blueCommandCard && battle.redCommandCard;
            case 'activation':
                const userUnits = BattleUtils.getUserUnits(battle, currentUser);
                return userUnits.every(unit => unit.hasActivated);
            case 'end':
                return true;
            default:
                return false;
        }
    }
};