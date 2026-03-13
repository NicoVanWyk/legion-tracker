// src/enums/aos/AoSWeaponTypes.js
const AoSWeaponTypes = {
    MELEE: 'melee',
    MISSILE: 'missile'
};

AoSWeaponTypes.getDisplayName = (type) => {
    const names = {
        [AoSWeaponTypes.MELEE]: 'Melee',
        [AoSWeaponTypes.MISSILE]: 'Missile'
    };
    return names[type] || type;
};

export default AoSWeaponTypes;