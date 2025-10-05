// src/enums/PlayerSides.js
const PlayerSides = Object.freeze({
  BLUE: 'blue',
  RED: 'red',
  
  // For display purposes
  getDisplayName: function(side) {
    switch(side) {
      case this.BLUE: return 'Blue Player';
      case this.RED: return 'Red Player';
      default: return 'Unknown Player';
    }
  },
  
  // Get color class for UI elements
  getColorClass: function(side) {
    switch(side) {
      case this.BLUE: return 'player-blue';
      case this.RED: return 'player-red';
      default: return '';
    }
  },
  
  // Get hex color code
  getColor: function(side) {
    switch(side) {
      case this.BLUE: return '#007bff';
      case this.RED: return '#dc3545';
      default: return '#6c757d';
    }
  },
  
  // Get opposite side
  getOpposite: function(side) {
    return side === this.BLUE ? this.RED : this.BLUE;
  }
});

export default PlayerSides;