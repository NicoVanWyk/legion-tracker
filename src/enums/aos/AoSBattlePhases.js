const AoSBattlePhases = {
    SETUP: 'SETUP',
    PRIORITY: 'PRIORITY',
    HERO: 'HERO',
    MOVEMENT: 'MOVEMENT',
    SHOOTING: 'SHOOTING',
    CHARGE: 'CHARGE',
    COMBAT: 'COMBAT',
    END_OF_TURN: 'END_OF_TURN',

    getDisplayName: (phase) => {
        const names = {
            SETUP: 'Setup',
            PRIORITY: 'Priority Roll',
            HERO: 'Hero Phase',
            MOVEMENT: 'Movement Phase',
            SHOOTING: 'Shooting Phase',
            CHARGE: 'Charge Phase',
            COMBAT: 'Combat Phase',
            END_OF_TURN: 'End of Turn'
        };
        return names[phase] || phase;
    },

    getNextPhase: (currentPhase) => {
        const order = [
            'SETUP', 'PRIORITY', 'HERO', 'MOVEMENT',
            'SHOOTING', 'CHARGE', 'COMBAT', 'END_OF_TURN'
        ];
        const index = order.indexOf(currentPhase);
        return index >= 0 && index < order.length - 1 ? order[index + 1] : null;
    },

    getColor: (phase) => {
        const colors = {
            SETUP: '#6c757d',
            PRIORITY: '#17a2b8',
            HERO: '#6f42c1',
            MOVEMENT: '#28a745',
            SHOOTING: '#dc3545',
            CHARGE: '#fd7e14',
            COMBAT: '#e83e8c',
            END_OF_TURN: '#20c997'
        };
        return colors[phase] || '#6c757d';
    }
};

export default AoSBattlePhases;