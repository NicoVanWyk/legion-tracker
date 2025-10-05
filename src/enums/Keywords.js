// src/enums/Keywords.js
const Keywords = Object.freeze({
  // Movement Keywords
  JUMP_1: 'jump_1',
  JUMP_2: 'jump_2',
  SCALE: 'scale',
  SPEEDER_1: 'speeder_1',
  SPEEDER_2: 'speeder_2',
  RELENTLESS: 'relentless',
  SCOUT_1: 'scout_1',
  SCOUT_2: 'scout_2',
  
  // Attack Keywords
  ARSENAL_2: 'arsenal_2',
  SHARPSHOOTER_1: 'sharpshooter_1',
  SHARPSHOOTER_2: 'sharpshooter_2',
  PRECISE_1: 'precise_1',
  PRECISE_2: 'precise_2',
  LETHAL_1: 'lethal_1',
  LETHAL_2: 'lethal_2',
  
  // Defense Keywords
  ARMOR_1: 'armor_1',
  ARMOR_2: 'armor_2',
  ARMOR_3: 'armor_3',
  IMPERVIOUS: 'impervious',
  IMMUNE_PIERCE: 'immune_pierce',
  DEFLECT: 'deflect',
  BLOCK: 'block',
  COVER_1: 'cover_1',
  COVER_2: 'cover_2',
  SHIELDED_1: 'shielded_1',
  SHIELDED_2: 'shielded_2',
  
  // Command Keywords
  INSPIRE_1: 'inspire_1',
  INSPIRE_2: 'inspire_2',
  TACTICAL_1: 'tactical_1',
  TACTICAL_2: 'tactical_2',
  TARGET_1: 'target_1',
  TARGET_2: 'target_2',
  COORDINATE: 'coordinate',
  
  // AI Keywords
  AI_ATTACK: 'ai_attack',
  AI_MOVE: 'ai_move',
  SWARM_INSTINCT_ATTACK: 'swarm_instinct_attack',
  SWARM_INSTINCT_MOVE: 'swarm_instinct_move',
  
  // Force Keywords
  CHARGE: 'charge',
  GUARDIAN_1: 'guardian_1',
  GUARDIAN_2: 'guardian_2',
  GUARDIAN_3: 'guardian_3',
  JEDI_HUNTER: 'jedi_hunter',
  MASTER_OF_THE_FORCE_1: 'master_of_the_force_1',
  
  // Special Keywords
  GENERATOR_1: 'generator_1',
  RELIABLE_1: 'reliable_1',
  SENTINEL: 'sentinel',
  UNSTOPPABLE: 'unstoppable',
  FIRE_SUPPORT: 'fire_support',
  
  // Custom Keywords (For custom armies)
  MERCENARY_MOTIVATION: 'mercenary_motivation',
  NEURAL_OVERRIDE: 'neural_override',
  HIVE_MIND: 'hive_mind',
  EXHAUST_SPOTTER_1: 'exhaust_spotter_1',
  EXHAUST_TAKE_COVER_1: 'exhaust_take_cover_1',
  
  // For display purposes
  getDisplayName: function(keyword) {
    // Replace underscores with spaces and capitalize words
    if (!keyword) return '';
    
    // Handle special cases
    switch(keyword) {
      case this.JUMP_1: return 'Jump 1';
      case this.JUMP_2: return 'Jump 2';
      case this.SPEEDER_1: return 'Speeder 1';
      case this.SPEEDER_2: return 'Speeder 2';
      case this.ARSENAL_2: return 'Arsenal 2';
      case this.SHARPSHOOTER_1: return 'Sharpshooter 1';
      case this.SHARPSHOOTER_2: return 'Sharpshooter 2';
      case this.PRECISE_1: return 'Precise 1';
      case this.PRECISE_2: return 'Precise 2';
      case this.LETHAL_1: return 'Lethal 1';
      case this.LETHAL_2: return 'Lethal 2';
      case this.ARMOR_1: return 'Armor 1';
      case this.ARMOR_2: return 'Armor 2';
      case this.ARMOR_3: return 'Armor 3';
      case this.IMMUNE_PIERCE: return 'Immune: Pierce';
      case this.COVER_1: return 'Cover 1';
      case this.COVER_2: return 'Cover 2';
      case this.SHIELDED_1: return 'Shielded 1';
      case this.SHIELDED_2: return 'Shielded 2';
      case this.INSPIRE_1: return 'Inspire 1';
      case this.INSPIRE_2: return 'Inspire 2';
      case this.TACTICAL_1: return 'Tactical 1';
      case this.TACTICAL_2: return 'Tactical 2';
      case this.TARGET_1: return 'Target 1';
      case this.TARGET_2: return 'Target 2';
      case this.AI_ATTACK: return 'AI: Attack';
      case this.AI_MOVE: return 'AI: Move';
      case this.SWARM_INSTINCT_ATTACK: return 'Swarm Instinct: Attack';
      case this.SWARM_INSTINCT_MOVE: return 'Swarm Instinct: Move';
      case this.GUARDIAN_1: return 'Guardian 1';
      case this.GUARDIAN_2: return 'Guardian 2';
      case this.GUARDIAN_3: return 'Guardian 3';
      case this.MASTER_OF_THE_FORCE_1: return 'Master of the Force 1';
      case this.GENERATOR_1: return 'Generator 1';
      case this.RELIABLE_1: return 'Reliable 1';
      case this.EXHAUST_SPOTTER_1: return 'Exhaust: Spotter 1';
      case this.EXHAUST_TAKE_COVER_1: return 'Exhaust: Take Cover 1';
      
      default:
        return keyword.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
  },
  
  // Get description of keyword effect
  getDescription: function(keyword) {
    switch(keyword) {
      // Movement Keywords
      case this.JUMP_1:
      case this.JUMP_2:
        return `This unit can pass over or end its movement on terrain that is height ${keyword.split('_')[1]} or lower, measured from the unit's starting position.`;
      
      case this.SCALE:
        return "This unit ignores difficult terrain, and when it performs a climb it may move a vertical distance up to Height 2.";
      
      case this.SPEEDER_1:
      case this.SPEEDER_2:
        return `This unit must make a compulsory free move action at the start of its activation. This move ignores terrain ${keyword.split('_')[1]} or lower, and does not reduce the number of actions available to the unit.`;
      
      case this.RELENTLESS:
        return "After this unit performs a move action, it may perform a free attack action. If it does, it may not take another attack action during its Activation, but can take other actions.";
      
      case this.SCOUT_1:
      case this.SCOUT_2:
        return `After setup, this unit can perform a speed-${keyword.split('_')[1]} move.`;
        
      // Attack Keywords
      case this.ARSENAL_2:
        return "This unit can add 2 of its weapons to the attack pool when taking an attack action.";
      
      case this.SHARPSHOOTER_1:
      case this.SHARPSHOOTER_2:
        return `During the "Apply Dodge and Cover" step of this unit's attack, reduce the defender's cover by ${keyword.split('_')[1]}.`;
      
      case this.PRECISE_1:
      case this.PRECISE_2:
        return `This unit can reroll ${keyword.split('_')[1]} additional dice when it spends an aim token.`;
      
      case this.LETHAL_1:
      case this.LETHAL_2:
        return `While performing an attack, this unit can spend an aim token to reroll up to ${keyword.split('_')[1]} additional attack dice.`;
        
      // Defense Keywords
      case this.ARMOR_1:
      case this.ARMOR_2:
      case this.ARMOR_3:
        return `During the "Modify Attack Dice" step of an attack, this unit can cancel up to ${keyword.split('_')[1]} hit result(s) produced by the attack roll.`;
      
      case this.IMPERVIOUS:
        return "While this unit is defending, it rolls a number of additional defence dice equal to the Pierce x value of the attack pool.";
      
      case this.IMMUNE_PIERCE:
        return "This cannot be affected by the Pierce keyword from attacks targeting it.";
      
      case this.DEFLECT:
        return "While this unit is defending, if it spends a dodge token, it gains Surge To Deflect. Additionally, if the attack is ranged, the attacker suffers one wound for each surge result rolled by this unit during the \"Roll Defense Dice\" step.";
      
      case this.BLOCK:
        return "If this unit blocks and it spends a dodge token, its Surge Chart gains Surge to Defence.";
      
      case this.COVER_1:
      case this.COVER_2:
        return `During the "Apply Dodge and Cover" step of a ranged attack, this unit improves its cover by ${keyword.split('_')[1]}.`;
      
      case this.SHIELDED_1:
      case this.SHIELDED_2:
        return `This unit has ${keyword.split('_')[1]} shield token(s).`;
        
      // Command Keywords
      case this.INSPIRE_1:
      case this.INSPIRE_2:
        return `After this unit performs its "Rally" step, remove a total of up to ${keyword.split('_')[1]} suppression token(s) from other friendly units at range 1–2.`;
      
      case this.TACTICAL_1:
      case this.TACTICAL_2:
        return `This unit gains ${keyword.split('_')[1]} aim token(s) each time it performs a standard move.`;
      
      case this.TARGET_1:
      case this.TARGET_2:
        return `After this unit is issued an order, it gains ${keyword.split('_')[1]} aim token(s).`;
      
      case this.COORDINATE:
        return "After this unit is issued an order, it may issue an order to a friendly Unit at range 1.";
        
      // AI Keywords
      case this.AI_ATTACK:
        return "During the Perform Actions step of this unit's activation, it must perform an attack action if it does not have a faceup order token.";
      
      case this.AI_MOVE:
        return "During the Perform Actions step of this unit's activation, it must perform a move action if it does not have a faceup order token.";
      
      case this.SWARM_INSTINCT_ATTACK:
        return "During the Perform Actions step of this unit's activation, it must perform an attack action if it does not have a faceup order token.";
      
      case this.SWARM_INSTINCT_MOVE:
        return "During the Perform Actions step of this unit's activation, it must perform a move action if it does not have a faceup order token.";
        
      // Force Keywords
      case this.CHARGE:
        return "After this unit performs a move action to start a melee with an enemy unit, it may perform a free melee attack action against that unit. If it does, it may not take another attack action during its Activation, but can take other actions.";
      
      case this.GUARDIAN_1:
      case this.GUARDIAN_2:
      case this.GUARDIAN_3:
        return `This unit can protect a friendly trooper within range 1 and line of sight during a ranged attack targeting that trooper by cancelling up to ${keyword.split('_')[1]} hit result(s). For each hit cancelled, this unit rolls its defence dice and suffers 1 wound for each blank result.`;
      
      case this.JEDI_HUNTER:
        return "While this unit is attacking a unit with a Force Upgrade Slot, its Surge Chart gains Surge to Crit.";
      
      case this.MASTER_OF_THE_FORCE_1:
        return "At the end of this unit's activation, it may ready up to 1 exhausted Force upgrade cards.";
        
      // Special Keywords
      case this.GENERATOR_1:
        return "During the End Phase, flip 1 inactive shield token.";
      
      case this.RELIABLE_1:
        return "This unit gains 1 surge token at the start of every round.";
      
      case this.SENTINEL:
        return "This unit can spend a standby token after an enemy unit attacks, moves, or performs an action and is at range 1–3, rather than at range 1–2.";
      
      case this.UNSTOPPABLE:
        return "This unit ignores suppression and can move through difficult terrain without penalty.";
      
      case this.FIRE_SUPPORT:
        return "When another friendly unit performs a ranged attack, if you have a faceup order token, each mini in your unit may add an eligible weapon to the attack pool. If you do, flip your order token facedown. Limit 1 Fire Support per attack pool.";
        
      // Custom Keywords
      case this.MERCENARY_MOTIVATION:
        return "At the start of the Command Phase, you may choose to pay this unit by spending 1 aim or dodge token from your commander. If paid, this unit gains Independent Orders and Ruthless 1 until the end of the round. If unpaid, this unit gains Insubordinate until the end of the round.";
      
      case this.NEURAL_OVERRIDE:
        return "At the start of this unit's activation, you may have the Cyborg Overseer suffer 1 wound to ignore this unit's AI keyword until the end of the activation.";
      
      case this.HIVE_MIND:
        return "At the start of the Command Phase, you may choose one Unit with the Swarm Instincts keyword. This unit can issue an order to the chosen unit regardless of range.";
      
      case this.EXHAUST_SPOTTER_1:
        return "As a card action, this unit can choose up to 1 friendly units at range 1. Each chosen unit gains one aim token.";
      
      case this.EXHAUST_TAKE_COVER_1:
        return "As a card action, this unit can choose up to 1 friendly units at range 1. Each chosen unit gains one dodge token.";
      
      default:
        return "No description available.";
    }
  },
  
  // Get all keywords by category
  getAllKeywords: function() {
    return {
      movement: [
        this.JUMP_1, this.JUMP_2, this.SCALE, this.SPEEDER_1, 
        this.SPEEDER_2, this.RELENTLESS, this.SCOUT_1, this.SCOUT_2
      ],
      attack: [
        this.ARSENAL_2, this.SHARPSHOOTER_1, this.SHARPSHOOTER_2, 
        this.PRECISE_1, this.PRECISE_2, this.LETHAL_1, this.LETHAL_2
      ],
      defense: [
        this.ARMOR_1, this.ARMOR_2, this.ARMOR_3, this.IMPERVIOUS, 
        this.IMMUNE_PIERCE, this.DEFLECT, this.BLOCK, this.COVER_1, 
        this.COVER_2, this.SHIELDED_1, this.SHIELDED_2
      ],
      command: [
        this.INSPIRE_1, this.INSPIRE_2, this.TACTICAL_1, this.TACTICAL_2, 
        this.TARGET_1, this.TARGET_2, this.COORDINATE
      ],
      ai: [
        this.AI_ATTACK, this.AI_MOVE, this.SWARM_INSTINCT_ATTACK, this.SWARM_INSTINCT_MOVE
      ],
      force: [
        this.CHARGE, this.GUARDIAN_1, this.GUARDIAN_2, this.GUARDIAN_3, 
        this.JEDI_HUNTER, this.MASTER_OF_THE_FORCE_1
      ],
      special: [
        this.GENERATOR_1, this.RELIABLE_1, this.SENTINEL, this.UNSTOPPABLE, this.FIRE_SUPPORT
      ],
      custom: [
        this.MERCENARY_MOTIVATION, this.NEURAL_OVERRIDE, this.HIVE_MIND,
        this.EXHAUST_SPOTTER_1, this.EXHAUST_TAKE_COVER_1
      ]
    };
  },
  
  // Get a flat array of all keywords
  getAllKeywordsFlat: function() {
    return [
      ...this.getAllKeywords().movement,
      ...this.getAllKeywords().attack,
      ...this.getAllKeywords().defense,
      ...this.getAllKeywords().command,
      ...this.getAllKeywords().ai,
      ...this.getAllKeywords().force,
      ...this.getAllKeywords().special,
      ...this.getAllKeywords().custom
    ];
  }
});

export default Keywords;