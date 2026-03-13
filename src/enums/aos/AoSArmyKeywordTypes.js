// src/enums/aos/AoSArmyKeywordTypes.js
const AoSArmyKeywordTypes = {
    BATTLE_TRAIT: 'battle_trait',
    BATTLE_FORMATION: 'battle_formation',
    REGIMENT_ABILITY: 'regiment_ability',
    COMMAND_TRAIT: 'command_trait',
    ARTEFACT: 'artefact',
    MOUNT_TRAIT: 'mount_trait',
    SPELL_LORE: 'spell_lore',
    PRAYER_LORE: 'prayer_lore',
    MANIFESTATION_LORE: 'manifestation_lore',
    HEROIC_TRAIT: 'heroic_trait',
    ENHANCEMENT: 'enhancement',
    TRIUMPH: 'triumph',
    OTHER: 'other'
};

AoSArmyKeywordTypes.getDisplayName = (type) => {
    const names = {
        [AoSArmyKeywordTypes.BATTLE_TRAIT]: 'Battle Trait',
        [AoSArmyKeywordTypes.BATTLE_FORMATION]: 'Battle Formation',
        [AoSArmyKeywordTypes.REGIMENT_ABILITY]: 'Regiment Ability',
        [AoSArmyKeywordTypes.COMMAND_TRAIT]: 'Command Trait',
        [AoSArmyKeywordTypes.ARTEFACT]: 'Artefact of Power',
        [AoSArmyKeywordTypes.MOUNT_TRAIT]: 'Mount Trait',
        [AoSArmyKeywordTypes.SPELL_LORE]: 'Spell Lore',
        [AoSArmyKeywordTypes.PRAYER_LORE]: 'Prayer Lore',
        [AoSArmyKeywordTypes.MANIFESTATION_LORE]: 'Manifestation Lore',
        [AoSArmyKeywordTypes.HEROIC_TRAIT]: 'Heroic Trait',
        [AoSArmyKeywordTypes.ENHANCEMENT]: 'Enhancement',
        [AoSArmyKeywordTypes.TRIUMPH]: 'Triumph',
        [AoSArmyKeywordTypes.OTHER]: 'Other'
    };
    return names[type] || type;
};

AoSArmyKeywordTypes.getDescription = (type) => {
    const descriptions = {
        [AoSArmyKeywordTypes.BATTLE_TRAIT]: 'Army-wide abilities that define your faction\'s playstyle',
        [AoSArmyKeywordTypes.BATTLE_FORMATION]: 'Special army configurations with unique rules and restrictions',
        [AoSArmyKeywordTypes.REGIMENT_ABILITY]: 'Abilities granted by organizing units into regiments',
        [AoSArmyKeywordTypes.COMMAND_TRAIT]: 'Special abilities for your army general',
        [AoSArmyKeywordTypes.ARTEFACT]: 'Magical items and relics carried by Heroes',
        [AoSArmyKeywordTypes.MOUNT_TRAIT]: 'Special abilities for mounted Heroes',
        [AoSArmyKeywordTypes.SPELL_LORE]: 'Collection of spells available to your Wizards',
        [AoSArmyKeywordTypes.PRAYER_LORE]: 'Collection of prayers available to your Priests',
        [AoSArmyKeywordTypes.MANIFESTATION_LORE]: 'Endless spells and invocations your army can summon',
        [AoSArmyKeywordTypes.HEROIC_TRAIT]: 'Additional heroic abilities',
        [AoSArmyKeywordTypes.ENHANCEMENT]: 'General term for upgrades and special rules',
        [AoSArmyKeywordTypes.TRIUMPH]: 'Bonus abilities for being the underdog',
        [AoSArmyKeywordTypes.OTHER]: 'Other custom abilities and rules'
    };
    return descriptions[type] || '';
};

export default AoSArmyKeywordTypes;