// src/enums/ReferenceCategories.js
const ReferenceCategories = Object.freeze({
  KEYWORD: 'keyword',
  WEAPON_KEYWORD: 'weapon_keyword',
  RULE: 'rule',
  ABILITY: 'ability',
  UPGRADE: 'upgrade',
  TERRAIN: 'terrain',
  CONDITION: 'condition',
  CUSTOM: 'custom',
  
  // For display purposes
  getDisplayName: function(category) {
    switch(category) {
      case this.KEYWORD: return 'Unit Keyword';
      case this.WEAPON_KEYWORD: return 'Weapon Keyword';
      case this.RULE: return 'Game Rule';
      case this.ABILITY: return 'Special Ability';
      case this.UPGRADE: return 'Upgrade Card';
      case this.TERRAIN: return 'Terrain Rule';
      case this.CONDITION: return 'Battlefield Condition';
      case this.CUSTOM: return 'Custom Reference';
      default: return 'Unknown Category';
    }
  },
  
  // Get icon class for UI elements
  getIconClass: function(category) {
    switch(category) {
      case this.KEYWORD: return 'bi-tag-fill';
      case this.WEAPON_KEYWORD: return 'bi-lightning-fill';
      case this.RULE: return 'bi-book-fill';
      case this.ABILITY: return 'bi-stars';
      case this.UPGRADE: return 'bi-arrow-up-circle-fill';
      case this.TERRAIN: return 'bi-tree-fill';
      case this.CONDITION: return 'bi-cloud-fill';
      case this.CUSTOM: return 'bi-bookmark-fill';
      default: return 'bi-question-circle';
    }
  },
  
  // Get badge color for UI elements
  getBadgeColor: function(category) {
    switch(category) {
      case this.KEYWORD: return 'secondary';
      case this.WEAPON_KEYWORD: return 'info';
      case this.RULE: return 'primary';
      case this.ABILITY: return 'success';
      case this.UPGRADE: return 'warning';
      case this.TERRAIN: return 'dark';
      case this.CONDITION: return 'light';
      case this.CUSTOM: return 'danger';
      default: return 'secondary';
    }
  },
  
  // Get all categories as an array
  getAllCategories: function() {
    return [
      this.KEYWORD, 
      this.WEAPON_KEYWORD,
      this.RULE,
      this.ABILITY,
      this.UPGRADE,
      this.TERRAIN,
      this.CONDITION,
      this.CUSTOM
    ];
  }
});

export default ReferenceCategories;