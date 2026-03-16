const AoSAbilityKeywords = {
  // Spell Keywords
  SPELL: 'SPELL',
  UNBIND: 'UNBIND',
  BANISH: 'BANISH',
  
  // Prayer Keywords
  PRAYER: 'PRAYER',
  
  // Command Keywords
  RALLY: 'RALLY',
  REDEPLOY: 'REDEPLOY',
  RETREAT: 'RETREAT',
  ALL_OUT_ATTACK: 'ALL_OUT_ATTACK',
  ALL_OUT_DEFENCE: 'ALL_OUT_DEFENCE',
  FORWARD_TO_VICTORY: 'FORWARD_TO_VICTORY',
  
  // Combat Keywords
  RAMPAGE: 'RAMPAGE',
  FIGHT: 'FIGHT',
  SHOOT: 'SHOOT',
  CHARGE: 'CHARGE',
  
  // Movement Keywords
  RUN: 'RUN',
  NORMAL_MOVE: 'NORMAL_MOVE',
  
  // Misc Keywords
  REACTION: 'REACTION',
  PASSIVE: 'PASSIVE',
  ONCE_PER_TURN: 'ONCE_PER_TURN',
  ONCE_PER_BATTLE: 'ONCE_PER_BATTLE',

  getDisplayName: (keyword) => {
    const names = {
      SPELL: 'Spell',
      UNBIND: 'Unbind',
      BANISH: 'Banish',
      PRAYER: 'Prayer',
      RALLY: 'Rally',
      REDEPLOY: 'Redeploy',
      RETREAT: 'Retreat',
      ALL_OUT_ATTACK: 'All-out Attack',
      ALL_OUT_DEFENCE: 'All-out Defence',
      FORWARD_TO_VICTORY: 'Forward to Victory',
      RAMPAGE: 'Rampage',
      FIGHT: 'Fight',
      SHOOT: 'Shoot',
      CHARGE: 'Charge',
      RUN: 'Run',
      NORMAL_MOVE: 'Normal Move',
      REACTION: 'Reaction',
      PASSIVE: 'Passive',
      ONCE_PER_TURN: 'Once Per Turn',
      ONCE_PER_BATTLE: 'Once Per Battle'
    };
    return names[keyword] || keyword;
  },

  getDescription: (keyword) => {
    const descriptions = {
      SPELL: 'This ability is a spell that can be cast by a WIZARD',
      UNBIND: 'This ability can unbind enemy spells',
      BANISH: 'This ability can banish enemy manifestations',
      PRAYER: 'This ability is a prayer that can be chanted by a PRIEST',
      RALLY: 'Returns slain models to units',
      REDEPLOY: 'Allows units to be redeployed',
      RETREAT: 'Allows units to retreat from combat',
      ALL_OUT_ATTACK: 'Improves attack characteristics',
      ALL_OUT_DEFENCE: 'Improves defensive characteristics',
      FORWARD_TO_VICTORY: 'Improves charge rolls',
      RAMPAGE: 'Used during the charge phase',
      FIGHT: 'Used during combat',
      SHOOT: 'Used during shooting',
      CHARGE: 'Used during charges',
      RUN: 'Used when running',
      NORMAL_MOVE: 'Used during normal movement',
      REACTION: 'Triggered by enemy actions',
      PASSIVE: 'Always active, no activation required',
      ONCE_PER_TURN: 'Can only be used once per turn',
      ONCE_PER_BATTLE: 'Can only be used once per battle'
    };
    return descriptions[keyword] || '';
  },

  getColor: (keyword) => {
    const colors = {
      SPELL: '#9b59b6',
      UNBIND: '#8e44ad',
      BANISH: '#6c3483',
      PRAYER: '#f39c12',
      RALLY: '#27ae60',
      REDEPLOY: '#3498db',
      RETREAT: '#95a5a6',
      ALL_OUT_ATTACK: '#e74c3c',
      ALL_OUT_DEFENCE: '#2980b9',
      FORWARD_TO_VICTORY: '#f1c40f',
      RAMPAGE: '#c0392b',
      FIGHT: '#d35400',
      SHOOT: '#16a085',
      CHARGE: '#d68910',
      RUN: '#7f8c8d',
      NORMAL_MOVE: '#95a5a6',
      REACTION: '#e67e22',
      PASSIVE: '#34495e',
      ONCE_PER_TURN: '#2c3e50',
      ONCE_PER_BATTLE: '#8e44ad'
    };
    return colors[keyword] || '#6c757d';
  },

  getAllKeywords: () => {
    return Object.values(AoSAbilityKeywords).filter(v => typeof v === 'string');
  }
};

export default AoSAbilityKeywords;