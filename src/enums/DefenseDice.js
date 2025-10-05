// src/enums/DefenseDice.js
const DefenseDice = Object.freeze({
  WHITE: 'white',
  RED: 'red',
  
  // For display purposes
  getDisplayName: function(dice) {
    switch(dice) {
      case this.WHITE: return 'White Defense Dice';
      case this.RED: return 'Red Defense Dice';
      default: return 'Unknown Dice';
    }
  },
  
  // For CSS classes
  getColorClass: function(dice) {
    switch(dice) {
      case this.WHITE: return 'defense-white';
      case this.RED: return 'defense-red';
      default: return '';
    }
  }
});

export default DefenseDice;