// src/enums/aos/AoSUnitTypes.js
const AoSUnitTypes = {
    HERO: 'hero',
    BATTLELINE: 'battleline',
    OTHER: 'other',
    BEHEMOTH: 'behemoth',
    MANIFESTATION: 'manifestation',
    ARTILLERY: 'artillery'
};

AoSUnitTypes.getDisplayName = (type) => {
    const names = {
        [AoSUnitTypes.HERO]: 'Hero',
        [AoSUnitTypes.BATTLELINE]: 'Battleline',
        [AoSUnitTypes.OTHER]: 'Other',
        [AoSUnitTypes.BEHEMOTH]: 'Behemoth',
        [AoSUnitTypes.MANIFESTATION]: 'Manifestation',
        [AoSUnitTypes.ARTILLERY]: 'Artillery'
    };
    return names[type] || type;
};

export default AoSUnitTypes;