// src/enums/aos/AoSWeaponAbilities.js
const AoSWeaponAbilities = {
    ANTI_CHARGE: 'anti_charge',
    ANTI_INFANTRY: 'anti_infantry',
    ANTI_WIZARD: 'anti_wizard',
    ANTI_PRIEST: 'anti_priest',
    ANTI_CAVALRY: 'anti_cavalry',
    ANTI_MONSTER: 'anti_monster',
    ANTI_HERO: 'anti_hero',
    ANTI_WARMACHINE: 'anti_warmachine',
    CHARGE: 'charge',
    COMPANION: 'companion',
    CRIT_2_HITS: 'crit_2_hits',
    CRIT_MORTAL: 'crit_mortal',
    CRIT_AUTO_WOUND: 'crit_auto_wound',
    SHOOT_IN_COMBAT: 'shoot_in_combat',
    STRIKE_FIRST: 'strike_first',
    STRIKE_LAST: 'strike_last'
};

AoSWeaponAbilities.getDisplayName = (ability) => {
    const names = {
        [AoSWeaponAbilities.ANTI_CHARGE]: 'Anti-charge (+1 Rend)',
        [AoSWeaponAbilities.ANTI_INFANTRY]: 'Anti-infantry (+1 Rend)',
        [AoSWeaponAbilities.ANTI_WIZARD]: 'Anti-wizard (+1 Rend)',
        [AoSWeaponAbilities.ANTI_PRIEST]: 'Anti-priest (+1 Rend)',
        [AoSWeaponAbilities.ANTI_CAVALRY]: 'Anti-cavalry (+1 Rend)',
        [AoSWeaponAbilities.ANTI_MONSTER]: 'Anti-monster (+1 Rend)',
        [AoSWeaponAbilities.ANTI_HERO]: 'Anti-hero (+1 Rend)',
        [AoSWeaponAbilities.ANTI_WARMACHINE]: 'Anti-war machine (+1 Rend)',
        [AoSWeaponAbilities.CHARGE]: 'Charge (+1 Damage)',
        [AoSWeaponAbilities.COMPANION]: 'Companion',
        [AoSWeaponAbilities.CRIT_2_HITS]: 'Crit (2 Hits)',
        [AoSWeaponAbilities.CRIT_MORTAL]: 'Crit (Mortal)',
        [AoSWeaponAbilities.CRIT_AUTO_WOUND]: 'Crit (Auto-wound)',
        [AoSWeaponAbilities.SHOOT_IN_COMBAT]: 'Shoot in Combat',
        [AoSWeaponAbilities.STRIKE_FIRST]: 'Strike-first',
        [AoSWeaponAbilities.STRIKE_LAST]: 'Strike-last'
    };
    return names[ability] || ability;
};

AoSWeaponAbilities.getDescription = (ability) => {
    const descriptions = {
        [AoSWeaponAbilities.ANTI_CHARGE]: 'Add 1 to the Rend characteristic of this weapon if the attacking unit charged this turn',
        [AoSWeaponAbilities.ANTI_INFANTRY]: 'Add 1 to the Rend characteristic of this weapon for attacks that target an Infantry unit',
        [AoSWeaponAbilities.ANTI_WIZARD]: 'Add 1 to the Rend characteristic of this weapon for attacks that target a Wizard unit',
        [AoSWeaponAbilities.ANTI_PRIEST]: 'Add 1 to the Rend characteristic of this weapon for attacks that target a Priest unit',
        [AoSWeaponAbilities.ANTI_CAVALRY]: 'Add 1 to the Rend characteristic of this weapon for attacks that target a Cavalry unit',
        [AoSWeaponAbilities.ANTI_MONSTER]: 'Add 1 to the Rend characteristic of this weapon for attacks that target a Monster',
        [AoSWeaponAbilities.ANTI_HERO]: 'Add 1 to the Rend characteristic of this weapon for attacks that target a Hero',
        [AoSWeaponAbilities.ANTI_WARMACHINE]: 'Add 1 to the Rend characteristic of this weapon for attacks that target a War Machine',
        [AoSWeaponAbilities.CHARGE]: 'Add 1 to the Damage characteristic of this weapon if the attacking unit charged this turn',
        [AoSWeaponAbilities.COMPANION]: 'This weapon cannot be affected by abilities that affect weapon characteristics and cannot be used for attacks made by Champion models',
        [AoSWeaponAbilities.CRIT_2_HITS]: 'If an attack made with this weapon scores a critical hit, that attack scores 2 hits on the target unit instead of 1',
        [AoSWeaponAbilities.CRIT_MORTAL]: 'If an attack made with this weapon scores a critical hit, that attack inflicts mortal damage on the target unit equal to the Damage characteristic',
        [AoSWeaponAbilities.CRIT_AUTO_WOUND]: 'If an attack made with this weapon scores a critical hit, that attack automatically wounds',
        [AoSWeaponAbilities.SHOOT_IN_COMBAT]: 'This weapon can be used to make shooting attacks even if the attacking unit is in combat',
        [AoSWeaponAbilities.STRIKE_FIRST]: 'Units with this ability that are eligible to fight at the start of the combat phase can be picked to use a Fight ability immediately after the players have picked units to use Monstrous Rampage abilities',
        [AoSWeaponAbilities.STRIKE_LAST]: 'This unit cannot be picked to use a Fight ability until after all other units have done so'
    };
    return descriptions[ability] || '';
};

AoSWeaponAbilities.getAllAbilities = () => {
    return {
        anti: [
            AoSWeaponAbilities.ANTI_CHARGE,
            AoSWeaponAbilities.ANTI_INFANTRY,
            AoSWeaponAbilities.ANTI_WIZARD,
            AoSWeaponAbilities.ANTI_PRIEST,
            AoSWeaponAbilities.ANTI_CAVALRY,
            AoSWeaponAbilities.ANTI_MONSTER,
            AoSWeaponAbilities.ANTI_HERO,
            AoSWeaponAbilities.ANTI_WARMACHINE
        ],
        critical: [
            AoSWeaponAbilities.CRIT_2_HITS,
            AoSWeaponAbilities.CRIT_MORTAL,
            AoSWeaponAbilities.CRIT_AUTO_WOUND
        ],
        combat: [
            AoSWeaponAbilities.CHARGE,
            AoSWeaponAbilities.COMPANION,
            AoSWeaponAbilities.SHOOT_IN_COMBAT,
            AoSWeaponAbilities.STRIKE_FIRST,
            AoSWeaponAbilities.STRIKE_LAST
        ]
    };
};

export default AoSWeaponAbilities;