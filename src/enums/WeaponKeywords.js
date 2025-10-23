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
  
  // Ion keywords
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
  
  // Beam
  BEAM_1: 'beam_1',
  BEAM_2: 'beam_2',
  BEAM_3: 'beam_3',
  
  // Ram
  RAM_1: 'ram_1',
  RAM_2: 'ram_2',
  RAM_3: 'ram_3',
  
  // Scatter
  SCATTER: 'scatter',
  
  // Poison
  POISON_1: 'poison_1',
  POISON_2: 'poison_2',
  POISON_3: 'poison_3',
  
  // Tow Cable
  TOW_CABLE: 'tow_cable',
  
  // Detonate
  DETONATE_1: 'detonate_1',
  DETONATE_2: 'detonate_2',
  DETONATE_3: 'detonate_3',
  
  // Arm
  ARM_1: 'arm_1',
  ARM_2: 'arm_2',
  
  // Cumbersome
  CUMBERSOME: 'cumbersome',
  
  // Reconfigure
  RECONFIGURE: 'reconfigure',
  
  // Strafe
  STRAFE: 'strafe',
  
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
      
      // Beam
      case this.BEAM_1: return 'Beam 1';
      case this.BEAM_2: return 'Beam 2';
      case this.BEAM_3: return 'Beam 3';
      
      // Ram
      case this.RAM_1: return 'Ram 1';
      case this.RAM_2: return 'Ram 2';
      case this.RAM_3: return 'Ram 3';
      
      // Poison
      case this.POISON_1: return 'Poison 1';
      case this.POISON_2: return 'Poison 2';
      case this.POISON_3: return 'Poison 3';
      
      // Detonate
      case this.DETONATE_1: return 'Detonate 1';
      case this.DETONATE_2: return 'Detonate 2';
      case this.DETONATE_3: return 'Detonate 3';
      
      // Arm
      case this.ARM_1: return 'Arm 1';
      case this.ARM_2: return 'Arm 2';
      
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
      case this.SCATTER: return 'Scatter';
      case this.TOW_CABLE: return 'Tow Cable';
      case this.CUMBERSOME: return 'Cumbersome';
      case this.RECONFIGURE: return 'Reconfigure';
      case this.STRAFE: return 'Strafe';
      
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
        return `While attacking a unit that has Armor, change up to ${keyword.split('_')[1]} hit results to critical hit results.`;
      
      // Pierce
      case this.PIERCE_1:
      case this.PIERCE_2:
      case this.PIERCE_3:
        return `When attacking, ignore up to ${keyword.split('_')[1]} block results.`;
        
      // Critical
      case this.CRITICAL_1:
      case this.CRITICAL_2:
        return `When attacking, convert up to ${keyword.split('_')[1]} hit results to critical hit results.`;
        
      // Ion
      case this.ION_1:
      case this.ION_2:
        return `When attacking a vehicle or droid trooper, add ${keyword.split('_')[1]} suppression token(s) to the target.`;
      
      // Beam
      case this.BEAM_1:
      case this.BEAM_2:
      case this.BEAM_3:
        return `After declaring a defender, you may choose up to ${keyword.split('_')[1]} additional unit(s) at range and in line of sight of the defender. For each chosen unit, create a separate dice pool and perform a separate attack.`;
      
      // Ram
      case this.RAM_1:
      case this.RAM_2:
      case this.RAM_3:
        return `During a melee attack, if you performed a move action this activation, convert up to ${keyword.split('_')[1]} hit results to critical hit results.`;
      
      // Poison
      case this.POISON_1:
      case this.POISON_2:
      case this.POISON_3:
        return `After a unit suffers wounds from this attack, it gains ${keyword.split('_')[1]} poison token(s). At the end of its activation, it suffers 1 wound for each poison token it has, then removes all poison tokens.`;
        
      // Others
      case this.BLAST:
        return 'Ignore cover when attacking.';
      
      case this.SUPPRESSIVE:
        return 'After this attack is resolved, the defender gains 1 suppression token.';
      
      case this.FIXED_FRONT:
        return 'This weapon can only be used to attack units in the front arc of the unit leader.';
      
      case this.FIXED_SIDES:
        return 'This weapon can only be used to attack units in the side arcs of the unit leader.';
      
      case this.FIXED_REAR:
        return 'This weapon can only be used to attack units in the rear arc of the unit leader.';
      
      case this.SPRAY:
        return 'Add 1 hit result for each mini in the defending unit that does not have a wound token.';
      
      case this.HIGH_VELOCITY:
        return 'When attacking, the defender cannot spend dodge tokens.';
      
      case this.EXHAUST:
        return 'Exhaust: Add this weapon to the attack pool.';
      
      case this.CYCLE:
        return 'After this weapon is added to the attack pool, place a cycle token on this card. This weapon cannot be used while it has a cycle token on it.';
      
      case this.LIMITED:
        return 'This weapon can only be used once per game.';
      
      case this.VERSATILE:
        return 'This weapon can be used to perform both melee and ranged attacks.';
      
      case this.SCATTER:
        return 'After an attack using this weapon is resolved, the defender may perform a speed-1 move.';
      
      case this.TOW_CABLE:
        return 'After this attack is resolved, if the defender is a vehicle and suffered at least 1 wound, the defender gains 3 immobilized tokens.';
      
      case this.DETONATE_1:
      case this.DETONATE_2:
      case this.DETONATE_3:
        return `Exhaust: Choose up to ${keyword.split('_')[1]} of your undetonated charge tokens at range 1 and in line of sight. Detonate them.`;
      
      case this.ARM_1:
      case this.ARM_2:
        return `Exhaust: Place ${keyword.split('_')[1]} charge token(s) on the battlefield within range 1 and in line of sight.`;
      
      case this.CUMBERSOME:
        return 'This weapon cannot be used if the unit has performed a move action during the same activation.';
      
      case this.RECONFIGURE:
        return 'As a free action, this weapon may switch between different configurations with different weapon profiles.';
      
      case this.STRAFE:
        return 'After you perform an attack, you may perform a speed-1 move. This move does not trigger abilities.';
      
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
      beam: [this.BEAM_1, this.BEAM_2, this.BEAM_3],
      ram: [this.RAM_1, this.RAM_2, this.RAM_3],
      poison: [this.POISON_1, this.POISON_2, this.POISON_3],
      detonate: [this.DETONATE_1, this.DETONATE_2, this.DETONATE_3],
      arm: [this.ARM_1, this.ARM_2],
      fixed: [this.FIXED_FRONT, this.FIXED_SIDES, this.FIXED_REAR],
      special: [this.BLAST, this.SUPPRESSIVE, this.SPRAY, this.HIGH_VELOCITY, 
                this.SCATTER, this.TOW_CABLE, this.STRAFE],
      usage: [this.EXHAUST, this.CYCLE, this.LIMITED, this.VERSATILE, 
              this.CUMBERSOME, this.RECONFIGURE]
    };
  },
  
  // Get a flat array of all keywords
  getAllKeywordsFlat: function() {
    return [
      this.IMPACT_1, this.IMPACT_2, this.IMPACT_3,
      this.PIERCE_1, this.PIERCE_2, this.PIERCE_3,
      this.CRITICAL_1, this.CRITICAL_2,
      this.ION_1, this.ION_2,
      this.BEAM_1, this.BEAM_2, this.BEAM_3,
      this.RAM_1, this.RAM_2, this.RAM_3,
      this.POISON_1, this.POISON_2, this.POISON_3,
      this.DETONATE_1, this.DETONATE_2, this.DETONATE_3,
      this.ARM_1, this.ARM_2,
      this.BLAST, this.SUPPRESSIVE,
      this.FIXED_FRONT, this.FIXED_SIDES, this.FIXED_REAR,
      this.SPRAY, this.HIGH_VELOCITY,
      this.EXHAUST, this.CYCLE, this.LIMITED, this.VERSATILE,
      this.SCATTER, this.TOW_CABLE, this.CUMBERSOME, 
      this.RECONFIGURE, this.STRAFE
    ];
  }
});

export default WeaponKeywords;