// src/enums/aos/AoSKeywords.js
const AoSKeywords = {
    FLY: 'fly',
    WARD: 'ward',
    WIZARD: 'wizard',
    PRIEST: 'priest',
    CHAMPION: 'champion',
    MUSICIAN: 'musician',
    STANDARD_BEARER: 'standard_bearer',
    MOUNT: 'mount',
    MONSTER: 'monster',
    WAR_MACHINE: 'war_machine'
};

AoSKeywords.getDisplayName = (keyword) => {
    const names = {
        [AoSKeywords.FLY]: 'Fly',
        [AoSKeywords.WARD]: 'Ward',
        [AoSKeywords.WIZARD]: 'Wizard',
        [AoSKeywords.PRIEST]: 'Priest',
        [AoSKeywords.CHAMPION]: 'Champion',
        [AoSKeywords.MUSICIAN]: 'Musician',
        [AoSKeywords.STANDARD_BEARER]: 'Standard Bearer',
        [AoSKeywords.MOUNT]: 'Mount',
        [AoSKeywords.MONSTER]: 'Monster',
        [AoSKeywords.WAR_MACHINE]: 'War Machine'
    };
    return names[keyword] || keyword;
};

export default AoSKeywords;