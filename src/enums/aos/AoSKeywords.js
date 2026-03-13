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
    WAR_MACHINE: 'war_machine',
    CAVALRY: 'cavalry',
    INFANTRY: 'infantry',
    DAEMON: 'daemon',
    WARMASTER: 'warmaster',
    HERO: 'hero',
    REINFORCEMENTS: 'reinforcements',
    UNLIMITED: 'unlimited',
    MANIFESTATION: 'manifestation',
    UNIQUE: 'unique'
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
        [AoSKeywords.WAR_MACHINE]: 'War Machine',
        [AoSKeywords.CAVALRY]: 'Cavalry',
        [AoSKeywords.INFANTRY]: 'Infantry',
        [AoSKeywords.DAEMON]: 'Daemon',
        [AoSKeywords.WARMASTER]: 'Warmaster',
        [AoSKeywords.HERO]: 'Hero',
        [AoSKeywords.REINFORCEMENTS]: 'Reinforcements',
        [AoSKeywords.UNLIMITED]: 'Unlimited',
        [AoSKeywords.MANIFESTATION]: 'Manifestation',
        [AoSKeywords.UNIQUE]: 'Unique'
    };
    return names[keyword] || keyword;
};

export default AoSKeywords;