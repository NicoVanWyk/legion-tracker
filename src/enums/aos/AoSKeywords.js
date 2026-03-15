// src/enums/aos/AoSKeywords.js
const AoSKeywords = {
    FLY: 'fly',
    WARD: 'ward',
    WIZARD1: 'wizard1',
    WIZARD2: 'wizard2',
    WIZARD3: 'wizard3',
    WIZARD4: 'wizard4',
    WIZARD5: 'wizard5',
    WIZARD6: 'wizard6',
    WIZARD7: 'wizard7',
    WIZARD8: 'wizard8',
    WIZARD9: 'wizard9',
    WIZARD10: 'wizard10',
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
        [AoSKeywords.WIZARD1]: 'Wizard (1)',
        [AoSKeywords.WIZARD2]: 'Wizard (2)',
        [AoSKeywords.WIZARD3]: 'Wizard (3)',
        [AoSKeywords.WIZARD4]: 'Wizard (4)',
        [AoSKeywords.WIZARD5]: 'Wizard (5)',
        [AoSKeywords.WIZARD6]: 'Wizard (6)',
        [AoSKeywords.WIZARD7]: 'Wizard (7)',
        [AoSKeywords.WIZARD8]: 'Wizard (8)',
        [AoSKeywords.WIZARD9]: 'Wizard (9)',
        [AoSKeywords.WIZARD10]: 'Wizard (10)',
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