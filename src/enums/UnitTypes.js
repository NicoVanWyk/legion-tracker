// src/enums/UnitTypes.js
const UnitTypes = Object.freeze({
  COMMAND: 'command',
  CORPS: 'corps',
  SPECIAL_FORCES: 'special_forces',
  SUPPORT: 'support',
  HEAVY: 'heavy',
  OPERATIVE: 'operative',
  AUXILIARY: 'auxiliary',
  
  // For display purposes
  getDisplayName: function(type) {
    switch(type) {
      case this.COMMAND: return 'Command';
      case this.CORPS: return 'Corps';
      case this.SPECIAL_FORCES: return 'Special Forces';
      case this.SUPPORT: return 'Support';
      case this.HEAVY: return 'Heavy';
      case this.OPERATIVE: return 'Operative';
      case this.AUXILIARY: return 'Auxiliary';
      default: return 'Unknown';
    }
  }
});

export default UnitTypes;