// src/enums/BattlePhases.js
const BattlePhases = Object.freeze({
  COMMAND: 'command',
  ACTIVATION: 'activation',
  END: 'end',
  
  // For display purposes
  getDisplayName: function(phase) {
    switch(phase) {
      case this.COMMAND: return 'Command Phase';
      case this.ACTIVATION: return 'Activation Phase';
      case this.END: return 'End Phase';
      default: return 'Unknown Phase';
    }
  },
  
  // Get description of each phase
  getDescription: function(phase) {
    switch(phase) {
      case this.COMMAND: 
        return 'Players select command cards and issue orders to units on the battlefield.';
      case this.ACTIVATION: 
        return 'Players take turns activating units to perform actions.';
      case this.END: 
        return 'Players refresh tokens, remove unspent tokens, and update the battlefield.';
      default: 
        return 'Unknown phase description.';
    }
  },
  
  // Get next phase in sequence
  getNextPhase: function(phase) {
    switch(phase) {
      case this.COMMAND: return this.ACTIVATION;
      case this.ACTIVATION: return this.END;
      case this.END: return this.COMMAND;
      default: return this.COMMAND;
    }
  }
});

export default BattlePhases;