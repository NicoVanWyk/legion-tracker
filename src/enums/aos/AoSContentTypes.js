const AoSContentTypes = {
  BATTLE_TRAIT: 'BATTLE_TRAIT',
  HEROIC_TRAIT: 'HEROIC_TRAIT',
  ARTEFACT: 'ARTEFACT',
  SPELL_LORE: 'SPELL_LORE',
  PRAYER_LORE: 'PRAYER_LORE',
  MANIFESTATION: 'MANIFESTATION',
  BATTLE_FORMATION: 'BATTLE_FORMATION',
  COMMAND: 'COMMAND',
  REGIMENT_ABILITY: 'REGIMENT_ABILITY',

  getDisplayName: (type) => {
    const names = {
      BATTLE_TRAIT: 'Battle Trait',
      HEROIC_TRAIT: 'Heroic Trait',
      ARTEFACT: 'Artefact of Power',
      SPELL_LORE: 'Spell Lore',
      PRAYER_LORE: 'Prayer Lore',
      MANIFESTATION: 'Manifestation',
      BATTLE_FORMATION: 'Battle Formation',
      COMMAND: 'Command',
      REGIMENT_ABILITY: 'Regiment Ability'
    };
    return names[type] || type;
  },

  getDescription: (type) => {
    const descriptions = {
      BATTLE_TRAIT: 'Passive army-wide abilities',
      HEROIC_TRAIT: 'Character enhancement (1 per hero)',
      ARTEFACT: 'Magical item for heroes (1 per hero)',
      SPELL_LORE: 'Collection of spells for Wizards',
      PRAYER_LORE: 'Collection of prayers for Priests',
      MANIFESTATION: 'Endless Spells and Invocations',
      BATTLE_FORMATION: 'Army composition bonuses',
      COMMAND: 'Command abilities',
      REGIMENT_ABILITY: 'Regiment-specific bonuses (1 per regiment)'
    };
    return descriptions[type] || '';
  },

  getIcon: (type) => {
    const icons = {
      BATTLE_TRAIT: 'bi-shield-fill-check',
      HEROIC_TRAIT: 'bi-star-fill',
      ARTEFACT: 'bi-gem',
      SPELL_LORE: 'bi-book-fill',
      PRAYER_LORE: 'bi-book-half',
      MANIFESTATION: 'bi-clouds-fill',
      BATTLE_FORMATION: 'bi-diagram-3-fill',
      COMMAND: 'bi-megaphone-fill',
      REGIMENT_ABILITY: 'bi-people-fill'
    };
    return icons[type] || 'bi-circle-fill';
  },

  getColor: (type) => {
    const colors = {
      BATTLE_TRAIT: '#2c3e50',
      HEROIC_TRAIT: '#f39c12',
      ARTEFACT: '#9b59b6',
      SPELL_LORE: '#3498db',
      PRAYER_LORE: '#e67e22',
      MANIFESTATION: '#1abc9c',
      BATTLE_FORMATION: '#e74c3c',
      COMMAND: '#27ae60',
      REGIMENT_ABILITY: '#34495e'
    };
    return colors[type] || '#6c757d';
  },

  requiresHero: (type) => {
    return ['HEROIC_TRAIT', 'ARTEFACT'].includes(type);
  },

  requiresWizard: (type) => {
    return type === 'SPELL_LORE';
  },

  requiresPriest: (type) => {
    return type === 'PRAYER_LORE';
  },

  getAllTypes: () => {
    return Object.values(AoSContentTypes).filter(v => typeof v === 'string');
  }
};

export default AoSContentTypes;