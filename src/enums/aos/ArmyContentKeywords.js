const ArmyContentKeywords = {
    DEPLOY: 'DEPLOY',
    RELENTLESS_DISCIPLINE: 'RELENTLESS_DISCIPLINE',
    SPELL: 'SPELL',
    PRAYER: 'PRAYER',
    UNLIMITED: 'UNLIMITED',
    SUMMON: 'SUMMON',

    getDisplayName: (keyword) => {
        const names = {
            DEPLOY: 'Deploy',
            RELENTLESS_DISCIPLINE: 'Relentless Discipline',
            SPELL: 'Spell',
            PRAYER: 'Prayer',
            UNLIMITED: 'Unlimited',
            SUMMON: 'Summon',
        };
        return names[keyword] || keyword.replace(/_/g, ' ');
    },

    getColor: (keyword) => {
        return '#007bff';
    },

    getAllKeywords: () => {
        return Object.values(ArmyContentKeywords).filter(v => typeof v === 'string');
    }
};

export default ArmyContentKeywords;