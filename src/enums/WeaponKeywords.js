// src/enums/WeaponKeywords.js
const WeaponKeywords = Object.freeze({
  // Impact keywords
  IMPACT_1: 'impact_1',
  IMPACT_2: 'impact_2',
  IMPACT_3: 'impact_3',
  
  // Pierce keywords
  PIERCE_1: 'pierce_1',
  PIERCE_2: 'pierce_2',
  PIERCE_3: 'pierce_3',
  
  // Critical keywords
  CRITICAL_1: 'critical_1',
  CRITICAL_2: 'critical_2',
  
  // Ion keyword
  ION_1: 'ion_1',
  ION_2: 'ion_2',
  
  // Blast
  BLAST: 'blast',
  
  // Suppressive
  SUPPRESSIVE: 'suppressive',
  
  // Fixed direction
  FIXED_FRONT: 'fixed_front',
  FIXED_SIDES: 'fixed_sides',
  FIXED_REAR: 'fixed_rear',
  
  // Spray
  SPRAY: 'spray',
  
  // High Velocity
  HIGH_VELOCITY: 'high_velocity',
  
  // Exhaustible weapons
  EXHAUST: 'exhaust',
  
  // Cycle (requires reload)
  CYCLE: 'cycle',
  
  // Limited use
  LIMITED: 'limited',
  
  // Versatile (can be used in melee or at range)
  VERSATILE: 'versatile',
  
  // For display purposes
  getDisplayName: function(keyword) {
    switch(keyword) {
      // Impact
      case this.IMPACT_1: return 'Impact 1';
      case this.IMPACT_2: return 'Impact 2';
      case this.IMPACT_3: return 'Impact 3';
      
      // Pierce
      case this.PIERCE_1: return 'Pierce 1';
      case this.PIERCE_2: return 'Pierce 2';
      case this.PIERCE_3: return 'Pierce 3';
      
      // Critical
      case this.CRITICAL_1: return 'Critical 1';
      case this.CRITICAL_2: return 'Critical 2';
      
      // Ion
      case this.ION_1: return 'Ion 1';
      case this.ION_2: return 'Ion 2';
      
      // Others
      case this.BLAST: return 'Blast';
      case this.SUPPRESSIVE: return 'Suppressive';
      case this.FIXED_FRONT: return 'Fixed: Front';
      case this.FIXED_SIDES: return 'Fixed: Sides';
      case this.FIXED_REAR: return 'Fixed: Rear';
      case this.SPRAY: return 'Spray';
      case this.HIGH_VELOCITY: return 'High Velocity';
      case this.EXHAUST: return 'Exhaust';
      case this.CYCLE: return 'Cycle';
      case this.LIMITED: return 'Limited';
      case this.VERSATILE: return 'Versatile';
      
      default: return keyword.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
  },
  
  // Get description of keyword effect
  getDescription: function(keyword) {
    switch(keyword) {
      // Impact
      case this.IMPACT_1: 
      case this.IMPACT_2: 
      case this.IMPACT_3:
        return `While attacking a unit that has Armor, change up to ${keyword.split('_')[1]} Hit results to Critical Hit results.`;
      
      // Pierce
      case this.PIERCE_1:
      case this.PIERCE_2:
      case this.PIERCE_3:
        return `When attacking, ignore up to ${keyword.split('_')[1]} Block results.`;
        
      // Critical
      case this.CRITICAL_1:
      case this.CRITICAL_2:
        return `When attacking, convert up to ${keyword.split('_')[1]} Hit results to Critical Hit results.`;
        
      // Ion
      case this.ION_1:
      case this.ION_2:
        return `When attacking a vehicle or droid trooper, add ${keyword.split('_')[1]} Suppression token(s) to the target.`;
        
      // Others
      case this.BLAST:
        return 'Ignore cover when attacking.';
      case this.SUPPRESSIVE:
        return 'Add 1 suppression token to the target unit.';
      case this.FIXED_FRONT:
        return 'The weapon can only be used in the front firing arc.';
      case this.FIXED_SIDES:
        return 'The weapon can only be used in the side firing arcs.';
      case this.FIXED_REAR:
        return 'The weapon can only be used in the rear firing arc.';
      case this.SPRAY:
        return 'Add 1 hit per mini in the defender that does not have a wound.';
      case this.HIGH_VELOCITY:
        return 'When attacking, the defender cannot spend dodge tokens.';
      case this.EXHAUST:
        return 'After using this weapon, flip this card. It cannot be used again until flipped back.';
      case this.CYCLE:
        return 'After using this weapon, place a cycle token on it. It cannot be used again until the token is removed.';
      case this.LIMITED:
        return 'This weapon can only be used once per game.';
      case this.VERSATILE:
        return 'This weapon can be used for both melee and ranged attacks.';
      
      default:
        return 'No description available.';
    }
  },
  
  // Get all keyword values organized by categories
  getAllKeywords: function() {
    return {
      impact: [this.IMPACT_1, this.IMPACT_2, this.IMPACT_3],
      pierce: [this.PIERCE_1, this.PIERCE_2, this.PIERCE_3],
      critical: [this.CRITICAL_1, this.CRITICAL_2],
      ion: [this.ION_1, this.ION_2],
      fixed: [this.FIXED_FRONT, this.FIXED_SIDES, this.FIXED_REAR],
      special: [this.BLAST, this.SUPPRESSIVE, this.SPRAY, this.HIGH_VELOCITY],
      usage: [this.EXHAUST, this.CYCLE, this.LIMITED, this.VERSATILE]
    };
  },
  
  // Get a flat array of all keywords
  getAllKeywordsFlat: function() {
    return [
      this.IMPACT_1, this.IMPACT_2, this.IMPACT_3,
      this.PIERCE_1, this.PIERCE_2, this.PIERCE_3,
      this.CRITICAL_1, this.CRITICAL_2,
      this.ION_1, this.ION_2,
      this.BLAST, this.SUPPRESSIVE,
      this.FIXED_FRONT, this.FIXED_SIDES, this.FIXED_REAR,
      this.SPRAY, this.HIGH_VELOCITY,
      this.EXHAUST, this.CYCLE, this.LIMITED, this.VERSATILE
    ];
  }
});

export default WeaponKeywords;