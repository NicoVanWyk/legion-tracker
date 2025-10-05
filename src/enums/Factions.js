// src/enums/Factions.js
const Factions = Object.freeze({
  REPUBLIC: 'republic',
  SEPARATIST: 'separatist',
  REBEL: 'rebel',
  EMPIRE: 'empire',
  
  // For display purposes
  getDisplayName: function(faction) {
    switch(faction) {
      case this.REPUBLIC: return 'Galactic Republic';
      case this.SEPARATIST: return 'Separatist Alliance';
      case this.REBEL: return 'Rebel Alliance';
      case this.EMPIRE: return 'Galactic Empire';
      default: return 'Unknown Faction';
    }
  },
  
  // Get faction color for UI elements
  getColor: function(faction) {
    switch(faction) {
      case this.REPUBLIC: return '#a30000'; // Republic Red
      case this.SEPARATIST: return '#0057b7'; // Separatist Blue
      case this.REBEL: return '#ff4500'; // Rebel Orange
      case this.EMPIRE: return '#2e2e2e'; // Empire Dark Gray
      default: return '#6c757d'; // Default Gray
    }
  }
});

export default Factions;