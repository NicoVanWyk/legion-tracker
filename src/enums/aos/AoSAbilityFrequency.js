// src/enums/aos/AoSAbilityFrequency.js
const AoSAbilityFrequency = {
    UNLIMITED: 'unlimited',
    ONCE_PER_TURN: 'once_per_turn',
    ONCE_PER_BATTLE_ROUND: 'once_per_battle_round',
    ONCE_PER_PHASE: 'once_per_phase',
    ONCE_PER_BATTLE: 'once_per_battle',
    ONCE_PER_TURN_ARMY: 'once_per_turn_army',
    ONCE_PER_BATTLE_ROUND_ARMY: 'once_per_battle_round_army',
    ONCE_PER_PHASE_ARMY: 'once_per_phase_army',
    ONCE_PER_BATTLE_ARMY: 'once_per_battle_army'
};

AoSAbilityFrequency.getDisplayName = (freq) => {
    const names = {
        [AoSAbilityFrequency.UNLIMITED]: 'Unlimited',
        [AoSAbilityFrequency.ONCE_PER_TURN]: 'Once Per Turn',
        [AoSAbilityFrequency.ONCE_PER_BATTLE_ROUND]: 'Once Per Battle Round',
        [AoSAbilityFrequency.ONCE_PER_PHASE]: 'Once Per Phase',
        [AoSAbilityFrequency.ONCE_PER_BATTLE]: 'Once Per Battle',
        [AoSAbilityFrequency.ONCE_PER_TURN_ARMY]: 'Once Per Turn (Army)',
        [AoSAbilityFrequency.ONCE_PER_BATTLE_ROUND_ARMY]: 'Once Per Battle Round (Army)',
        [AoSAbilityFrequency.ONCE_PER_PHASE_ARMY]: 'Once Per Phase (Army)',
        [AoSAbilityFrequency.ONCE_PER_BATTLE_ARMY]: 'Once Per Battle (Army)'
    };
    return names[freq] || freq;
};

export default AoSAbilityFrequency;