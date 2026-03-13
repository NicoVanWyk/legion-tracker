// src/enums/aos/AoSAbilityKeywords.js
const AoSAbilityKeywords = {
    CORE: 'core',
    PASSIVE: 'passive',
    MOVE: 'move',
    SHOOT: 'shoot',
    CHARGE: 'charge',
    COMBAT: 'combat',
    REACTION: 'reaction',
    RALLY: 'rally',
    UNLIMITED: 'unlimited',
    SPELL: 'spell',
    PRAYER: 'prayer',
    RAMPAGE: 'rampage',
    ATTACK: 'attack'
};

AoSAbilityKeywords.getDisplayName = (keyword) => {
    const names = {
        [AoSAbilityKeywords.CORE]: 'Core',
        [AoSAbilityKeywords.PASSIVE]: 'Passive',
        [AoSAbilityKeywords.MOVE]: 'Move',
        [AoSAbilityKeywords.SHOOT]: 'Shoot',
        [AoSAbilityKeywords.CHARGE]: 'Charge',
        [AoSAbilityKeywords.COMBAT]: 'Combat',
        [AoSAbilityKeywords.REACTION]: 'Reaction',
        [AoSAbilityKeywords.RALLY]: 'Rally',
        [AoSAbilityKeywords.UNLIMITED]: 'Unlimited',
        [AoSAbilityKeywords.SPELL]: 'Spell',
        [AoSAbilityKeywords.PRAYER]: 'Prayer',
        [AoSAbilityKeywords.RAMPAGE]: 'Rampage',
        [AoSAbilityKeywords.ATTACK]: 'Attack'
    };
    return names[keyword] || keyword;
};

AoSAbilityKeywords.getColor = (keyword) => {
    const colors = {
        [AoSAbilityKeywords.CORE]: '#6c757d',
        [AoSAbilityKeywords.PASSIVE]: '#17a2b8',
        [AoSAbilityKeywords.MOVE]: '#28a745',
        [AoSAbilityKeywords.SHOOT]: '#dc3545',
        [AoSAbilityKeywords.CHARGE]: '#fd7e14',
        [AoSAbilityKeywords.COMBAT]: '#e83e8c',
        [AoSAbilityKeywords.REACTION]: '#ffc107',
        [AoSAbilityKeywords.RALLY]: '#20c997',
        [AoSAbilityKeywords.UNLIMITED]: '#6610f2',
        [AoSAbilityKeywords.SPELL]: '#6f42c1',
        [AoSAbilityKeywords.PRAYER]: '#fd7e14',
        [AoSAbilityKeywords.RAMPAGE]: '#dc3545',
        [AoSAbilityKeywords.ATTACK]: '#e83e8c'
    };
    return colors[keyword] || '#6c757d';
};

export default AoSAbilityKeywords;