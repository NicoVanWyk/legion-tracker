// src/enums/AttackDice.js
const AttackDice = Object.freeze({
  RED: 'red',
  BLACK: 'black',
  WHITE: 'white',
  
  // For display purposes
  getDisplayName: function(dice) {
    switch(dice) {
      case this.RED: return 'Red Attack Dice';
      case this.BLACK: return 'Black Attack Dice';
      case this.WHITE: return 'White Attack Dice';
      default: return 'Unknown Dice';
    }
  },
  
  // For CSS classes
  getColorClass: function(dice) {
    switch(dice) {
      case this.RED: return 'attack-red';
      case this.BLACK: return 'attack-black';
      case this.WHITE: return 'attack-white';
      default: return '';
    }
  }
});

export default AttackDice;