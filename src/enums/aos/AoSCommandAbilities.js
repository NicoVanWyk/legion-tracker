const AoSCommandAbilities = {
    // Core Commands
    ALL_OUT_ATTACK: {
        id: 'all_out_attack',
        name: 'All-out Attack',
        cost: 1,
        phase: 'COMBAT',
        type: 'CORE',
        description: 'Add 1 to hit rolls for attacks made by a friendly unit'
    },
    ALL_OUT_DEFENCE: {
        id: 'all_out_defence',
        name: 'All-out Defence',
        cost: 1,
        phase: 'COMBAT',
        type: 'CORE',
        description: 'Add 1 to save rolls for attacks that target a friendly unit'
    },
    FORWARD_TO_VICTORY: {
        id: 'forward_to_victory',
        name: 'Forward to Victory',
        cost: 1,
        phase: 'CHARGE',
        type: 'CORE',
        description: 'Add 1 to charge rolls for a friendly unit'
    },
    RALLY: {
        id: 'rally',
        name: 'Rally',
        cost: 1,
        phase: 'HERO',
        type: 'CORE',
        description: 'Return D6 slain models to a friendly unit'
    },
    REDEPLOY: {
        id: 'redeploy',
        name: 'Redeploy',
        cost: 1,
        phase: 'MOVEMENT',
        type: 'CORE',
        description: 'Remove a friendly unit and set it up again'
    },

    // Heroic Actions
    HEROIC_LEADERSHIP: {
        id: 'heroic_leadership',
        name: 'Heroic Leadership',
        cost: 1,
        phase: 'HERO',
        type: 'HEROIC',
        description: 'Auto-rally D3 models to a friendly unit'
    },
    HEROIC_RECOVERY: {
        id: 'heroic_recovery',
        name: 'Heroic Recovery',
        cost: 1,
        phase: 'HERO',
        type: 'HEROIC',
        description: 'Heal D3 wounds on a friendly HERO'
    },
    THEIR_FINEST_HOUR: {
        id: 'their_finest_hour',
        name: 'Their Finest Hour',
        cost: 1,
        phase: 'HERO',
        type: 'HEROIC',
        description: 'Ward (6+) for one turn on a friendly HERO'
    },

    // Reactions
    COUNTER_CHARGE: {
        id: 'counter_charge',
        name: 'Counter-charge',
        cost: 1,
        phase: 'CHARGE',
        type: 'REACTION',
        description: 'Fight with a unit that was charged'
    },
    STAND_AND_SHOOT: {
        id: 'stand_and_shoot',
        name: 'Stand and Shoot',
        cost: 1,
        phase: 'CHARGE',
        type: 'REACTION',
        description: 'Shoot at charging enemy unit'
    },
    BRACE_FOR_IMPACT: {
        id: 'brace_for_impact',
        name: 'Brace for Impact',
        cost: 1,
        phase: 'COMBAT',
        type: 'REACTION',
        description: 'Add 1 to save rolls against charging units'
    },

    getAbilityById: (id) => {
        return Object.values(AoSCommandAbilities).find(a => a.id === id);
    },

    getAbilitiesByPhase: (phase) => {
        return Object.values(AoSCommandAbilities)
            .filter(a => typeof a === 'object' && a.phase === phase);
    },

    getAbilitiesByType: (type) => {
        return Object.values(AoSCommandAbilities)
            .filter(a => typeof a === 'object' && a.type === type);
    },

    getAllAbilities: () => {
        return Object.values(AoSCommandAbilities).filter(a => typeof a === 'object');
    }
};

export default AoSCommandAbilities;