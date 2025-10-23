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
  SCOUTING_PARTY_1: 'scouting_party_1',
  SCOUTING_PARTY_2: 'scouting_party_2',
  WHEEL_MODE: 'wheel_mode',
  AGILE_1: 'agile_1',
  AGILE_2: 'agile_2',
  CLIMBING_VEHICLE: 'climbing_vehicle',
  EXPERT_CLIMBER: 'expert_climber',
  GROUNDED: 'grounded',
  REPOSITION: 'reposition',
  SPUR: 'spur',
  OUTMANEUVER: 'outmaneuver',
  PIVOT: 'pivot',
  
  // Attack Keywords
  ARSENAL_2: 'arsenal_2',
  SHARPSHOOTER_1: 'sharpshooter_1',
  SHARPSHOOTER_2: 'sharpshooter_2',
  PRECISE_1: 'precise_1',
  PRECISE_2: 'precise_2',
  LETHAL_1: 'lethal_1',
  LETHAL_2: 'lethal_2',
  BARRAGE: 'barrage',
  DUELIST: 'duelist',
  STEADY: 'steady',
  
  // Defense Keywords
  ARMOR_1: 'armor_1',
  ARMOR_2: 'armor_2',
  ARMOR_3: 'armor_3',
  IMPERVIOUS: 'impervious',
  IMMUNE_PIERCE: 'immune_pierce',
  IMMUNE_DEFLECT: 'immune_deflect',
  IMMUNE_ENEMY_EFFECTS: 'immune_enemy_effects',
  DEFLECT: 'deflect',
  BLOCK: 'block',
  COVER_1: 'cover_1',
  COVER_2: 'cover_2',
  SHIELDED_1: 'shielded_1',
  SHIELDED_2: 'shielded_2',
  SHIELDED_3: 'shielded_3',
  SHIELDED_4: 'shielded_4',
  DANGER_SENSE_1: 'danger_sense_1',
  DANGER_SENSE_2: 'danger_sense_2',
  DANGER_SENSE_3: 'danger_sense_3',
  INCONSPICUOUS: 'inconspicuous',
  LOW_PROFILE: 'low_profile',
  
  // Command Keywords
  INSPIRE_1: 'inspire_1',
  INSPIRE_2: 'inspire_2',
  TACTICAL_1: 'tactical_1',
  TACTICAL_2: 'tactical_2',
  TARGET_1: 'target_1',
  TARGET_2: 'target_2',
  COORDINATE: 'coordinate',
  COORDINATE_DROID_TROOPER: 'coordinate_droid_trooper',
  EXEMPLAR: 'exemplar',
  ENTOURAGE: 'entourage',
  OBSERVE_1: 'observe_1',
  OBSERVE_2: 'observe_2',
  SPOTTER_1: 'spotter_1',
  SPOTTER_2: 'spotter_2',
  PULLING_THE_STRINGS: 'pulling_the_strings',
  
  // AI Keywords
  AI_ATTACK: 'ai_attack',
  AI_MOVE: 'ai_move',
  AI_MOVE_ATTACK: 'ai_move_attack',
  SWARM_INSTINCT_ATTACK: 'swarm_instinct_attack',
  SWARM_INSTINCT_MOVE: 'swarm_instinct_move',
  
  // Force Keywords
  CHARGE: 'charge',
  GUARDIAN_1: 'guardian_1',
  GUARDIAN_2: 'guardian_2',
  GUARDIAN_3: 'guardian_3',
  JEDI_HUNTER: 'jedi_hunter',
  MASTER_OF_THE_FORCE_1: 'master_of_the_force_1',
  SORESU_MASTERY: 'soresu_mastery',
  MAKASHI_MASTERY: 'makashi_mastery',
  JARKAI_MASTERY: 'jarkai_mastery',
  
  // Special Keywords
  GENERATOR_1: 'generator_1',
  RELIABLE_1: 'reliable_1',
  SENTINEL: 'sentinel',
  UNSTOPPABLE: 'unstoppable',
  FIRE_SUPPORT: 'fire_support',
  INDEPENDENT: 'independent',
  DETACHMENT: 'detachment',
  ASSOCIATE: 'associate',
  CLAIM: 'claim',
  TRANSPORT_1: 'transport_1',
  TRANSPORT_2: 'transport_2',
  TRANSPORT_3: 'transport_3',
  OPEN_TRANSPORT: 'open_transport',
  BOUNTY: 'bounty',
  DAUNTLESS: 'dauntless',
  DISCIPLINED_1: 'disciplined_1',
  DISCIPLINED_2: 'disciplined_2',
  INDOMITABLE: 'indomitable',
  ENRAGE_1: 'enrage_1',
  ENRAGE_2: 'enrage_2',
  ENRAGE_3: 'enrage_3',
  INTERROGATE: 'interrogate',
  CUNNING: 'cunning',
  SMOKE_1: 'smoke_1',
  SMOKE_2: 'smoke_2',
  DEMORALIZE_1: 'demoralize_1',
  DEMORALIZE_2: 'demoralize_2',
  REINFORCEMENTS: 'reinforcements',
  LOADOUT: 'loadout',
  LEADER: 'leader',
  AID: 'aid',
  INCOGNITO: 'incognito',
  WE_RE_NOT_REGS: 'we_re_not_regs',
  ADVANCED_TARGETING_1: 'advanced_targeting_1',
  ADVANCED_TARGETING_2: 'advanced_targeting_2',
  TAKE_COVER_1: 'take_cover_1',
  TAKE_COVER_2: 'take_cover_2',
  
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
      case this.WHEEL_MODE: return 'Wheel Mode';
      case this.AGILE_1: return 'Agile 1';
      case this.AGILE_2: return 'Agile 2';
      case this.CLIMBING_VEHICLE: return 'Climbing Vehicle';
      case this.EXPERT_CLIMBER: return 'Expert Climber';
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
      case this.IMMUNE_DEFLECT: return 'Immune: Deflect';
      case this.IMMUNE_ENEMY_EFFECTS: return 'Immune: Enemy Effects';
      case this.COVER_1: return 'Cover 1';
      case this.COVER_2: return 'Cover 2';
      case this.SHIELDED_1: return 'Shielded 1';
      case this.SHIELDED_2: return 'Shielded 2';
      case this.SHIELDED_3: return 'Shielded 3';
      case this.SHIELDED_4: return 'Shielded 4';
      case this.DANGER_SENSE_1: return 'Danger Sense 1';
      case this.DANGER_SENSE_2: return 'Danger Sense 2';
      case this.DANGER_SENSE_3: return 'Danger Sense 3';
      case this.LOW_PROFILE: return 'Low Profile';
      case this.INSPIRE_1: return 'Inspire 1';
      case this.INSPIRE_2: return 'Inspire 2';
      case this.TACTICAL_1: return 'Tactical 1';
      case this.TACTICAL_2: return 'Tactical 2';
      case this.TARGET_1: return 'Target 1';
      case this.TARGET_2: return 'Target 2';
      case this.COORDINATE_DROID_TROOPER: return 'Coordinate: Droid Trooper';
      case this.OBSERVE_1: return 'Observe 1';
      case this.OBSERVE_2: return 'Observe 2';
      case this.SPOTTER_1: return 'Spotter 1';
      case this.SPOTTER_2: return 'Spotter 2';
      case this.PULLING_THE_STRINGS: return 'Pulling the Strings';
      case this.AI_ATTACK: return 'AI: Attack';
      case this.AI_MOVE: return 'AI: Move';
      case this.AI_MOVE_ATTACK: return 'AI: Move, Attack';
      case this.SWARM_INSTINCT_ATTACK: return 'Swarm Instinct: Attack';
      case this.SWARM_INSTINCT_MOVE: return 'Swarm Instinct: Move';
      case this.GUARDIAN_1: return 'Guardian 1';
      case this.GUARDIAN_2: return 'Guardian 2';
      case this.GUARDIAN_3: return 'Guardian 3';
      case this.JEDI_HUNTER: return 'Jedi Hunter';
      case this.MASTER_OF_THE_FORCE_1: return 'Master of the Force 1';
      case this.SORESU_MASTERY: return 'Soresu Mastery';
      case this.MAKASHI_MASTERY: return 'Makashi Mastery';
      case this.JARKAI_MASTERY: return 'Jar\'Kai Mastery';
      case this.GENERATOR_1: return 'Generator 1';
      case this.RELIABLE_1: return 'Reliable 1';
      case this.FIRE_SUPPORT: return 'Fire Support';
      case this.TRANSPORT_1: return 'Transport 1';
      case this.TRANSPORT_2: return 'Transport 2';
      case this.TRANSPORT_3: return 'Transport 3';
      case this.OPEN_TRANSPORT: return 'Open Transport';
      case this.DISCIPLINED_1: return 'Disciplined 1';
      case this.DISCIPLINED_2: return 'Disciplined 2';
      case this.ENRAGE_1: return 'Enrage 1';
      case this.ENRAGE_2: return 'Enrage 2';
      case this.ENRAGE_3: return 'Enrage 3';
      case this.SMOKE_1: return 'Smoke 1';
      case this.SMOKE_2: return 'Smoke 2';
      case this.DEMORALIZE_1: return 'Demoralize 1';
      case this.DEMORALIZE_2: return 'Demoralize 2';
      case this.WE_RE_NOT_REGS: return 'We\'re Not Regs';
      case this.ADVANCED_TARGETING_1: return 'Advanced Targeting 1';
      case this.ADVANCED_TARGETING_2: return 'Advanced Targeting 2';
      case this.TAKE_COVER_1: return 'Take Cover 1';
      case this.TAKE_COVER_2: return 'Take Cover 2';
      case this.SCOUTING_PARTY_1: return 'Scouting Party 1';
      case this.SCOUTING_PARTY_2: return 'Scouting Party 2';
      case this.SCOUT_1: return 'Scout 1';
      case this.SCOUT_2: return 'Scout 2';
      
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
      
      case this.WHEEL_MODE:
        return 'At the start of this unit\'s activation, it can enter Wheel Mode and increase its speed to 3 as an action. If it does, until it spends an action to exit Wheel mode, it gains Cover 2 and cannot attack or flip active shield tokens.';

      case this.RELENTLESS:
        return "After this unit performs a move action, it may perform a free attack action. If it does, it may not take another attack action during its Activation, but can take other actions.";
      
      case this.SCOUT_1:
      case this.SCOUT_2:
        return `After setup, this unit can perform a speed-${keyword.split('_')[1]} move.`;

      case this.SCOUTING_PARTY_1:
      case this.SCOUTING_PARTY_2:
        return `After a unit with the Scouting Party ${keyword.split('_')[2]} keyword uses the Scout keyword, it may choose up to ${keyword.split('_')[2]} friendly trooper units at range 1-2 that have not performed a move using the Scout keyword. Each chosen unit may perform a move with a speed equal to x, where x is the Scout x value of the unit with the Scouting Party keyword.`;
      
      case this.AGILE_1:
      case this.AGILE_2:
        return `After this unit performs a standard move, it gains ${keyword.split('_')[1]} dodge token(s).`;
      
      case this.CLIMBING_VEHICLE:
        return "This unit is treated as a trooper for the purposes of vertical movement.";
      
      case this.EXPERT_CLIMBER:
        return "This unit does not suffer wounds when clambering.";
      
      case this.GROUNDED:
        return "This unit cannot climb or clamber.";
      
      case this.REPOSITION:
        return "After this unit performs a standard move, it may perform a free pivot action.";
      
      case this.SPUR:
        return "During a move, this unit may gain 1 suppression token to increase its maximum speed by 1.";
      
      case this.OUTMANEUVER:
        return "While this unit is defending, if it has a faceup order token, the attacker cannot spend aim tokens.";
      
      case this.PIVOT:
        return "This unit may pivot up to 360° when performing a pivot action.";
        
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
      
      case this.BARRAGE:
        return "This unit can perform 2 attack actions during its activation if it does not use weapons with Arsenal.";
      
      case this.DUELIST:
        return "While performing a melee attack, you may spend 1 aim token to gain Pierce 1, or spend 1 dodge token to gain Immune: Pierce.";
      
      case this.STEADY:
        return "After this unit performs a move action, it may perform a free ranged attack action.";
        
      // Defense Keywords
      case this.ARMOR_1:
      case this.ARMOR_2:
      case this.ARMOR_3:
        return `During the "Modify Attack Dice" step of an attack, this unit can cancel up to ${keyword.split('_')[1]} hit result(s) produced by the attack roll.`;
      
      case this.IMPERVIOUS:
        return "While this unit is defending, it rolls a number of additional defence dice equal to the Pierce x value of the attack pool.";
      
      case this.IMMUNE_PIERCE:
        return "This unit cannot be affected by the Pierce keyword from attacks targeting it.";
      
      case this.IMMUNE_DEFLECT:
        return "This unit cannot be affected by the Deflect keyword.";
      
      case this.IMMUNE_ENEMY_EFFECTS:
        return "During setup and the first round, this unit cannot be affected by enemy card effects.";
      
      case this.DEFLECT:
        return "While this unit is defending, if it spends a dodge token, it gains Surge To Deflect. Additionally, if the attack is ranged, the attacker suffers one wound for each surge result rolled by this unit during the \"Roll Defense Dice\" step.";
      
      case this.BLOCK:
        return "If this unit blocks and it spends a dodge token, its Surge Chart gains Surge to Defence.";
      
      case this.COVER_1:
      case this.COVER_2:
        return `During the "Apply Dodge and Cover" step of a ranged attack, this unit improves its cover by ${keyword.split('_')[1]}.`;
      
      case this.SHIELDED_1:
      case this.SHIELDED_2:
      case this.SHIELDED_3:
      case this.SHIELDED_4:
        return `This unit has ${keyword.split('_')[1]} shield token(s).`;
      
      case this.DANGER_SENSE_1:
      case this.DANGER_SENSE_2:
      case this.DANGER_SENSE_3:
        return `While defending, if this unit has a suppression token, roll ${keyword.split('_')[2]} additional defense die.`;
      
      case this.INCONSPICUOUS:
        return "This unit cannot be targeted by enemy attacks unless the attacking unit is at range 1-2.";
      
      case this.LOW_PROFILE:
        return "While defending against a ranged attack, if this unit has not moved this round, improve cover by 1.";
        
      // Command Keywords
      case this.INSPIRE_1:
      case this.INSPIRE_2:
        return `After this unit performs its "Rally" step, remove a total of up to ${keyword.split('_')[1]} suppression token(s) from other friendly units at range 1-2.`;
      
      case this.TACTICAL_1:
      case this.TACTICAL_2:
        return `This unit gains ${keyword.split('_')[1]} aim token(s) each time it performs a standard move.`;
      
      case this.TARGET_1:
      case this.TARGET_2:
        return `After this unit is issued an order, it gains ${keyword.split('_')[1]} aim token(s).`;
      
      case this.COORDINATE:
        return "After this unit is issued an order, it may issue an order to a friendly unit at range 1.";
      
      case this.COORDINATE_DROID_TROOPER:
        return "After this unit is issued an order, it may issue an order to a friendly Droid Trooper unit at range 1.";
      
      case this.EXEMPLAR:
        return "Friendly units at range 1-2 and in line of sight can spend your Aim, Dodge, and Standby tokens.";
      
      case this.ENTOURAGE:
        return "When building an army, you may include specific units that would otherwise not be eligible.";
      
      case this.OBSERVE_1:
      case this.OBSERVE_2:
        return `After this unit is issued an order, choose up to ${keyword.split('_')[1]} friendly units at range 1-3. Each chosen unit gains 1 aim token.`;
      
      case this.SPOTTER_1:
      case this.SPOTTER_2:
        return `Exhaust: Choose ${keyword.split('_')[1]} friendly unit(s) at range 1. Each chosen unit gains 1 aim token.`;
      
      case this.PULLING_THE_STRINGS:
        return "Exhaust: Choose a friendly trooper unit at range 1-2. That unit may perform a free attack action or a free move action.";
        
      // AI Keywords
      case this.AI_ATTACK:
        return "During the Perform Actions step of this unit's activation, it must perform an attack action if it does not have a faceup order token.";
      
      case this.AI_MOVE:
        return "During the Perform Actions step of this unit's activation, it must perform a move action if it does not have a faceup order token.";
      
      case this.AI_MOVE_ATTACK:
        return "During the Perform Actions step of this unit's activation, it must perform an attack or move action if it does not have a faceup order token.";

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
        
      case this.SORESU_MASTERY:
        return "While this unit is defending or using Guardian X, if it spends a dodge token, it gains Surge To Defence and the attacker suffers one wound for each surge result rolled.";
      
      case this.MAKASHI_MASTERY:
        return "While performing a melee attack, during the \"Reroll Attack Dice\" step, you may reroll up to 2 attack dice.";
      
      case this.JARKAI_MASTERY:
        return "While performing a melee attack, you may spend 1 aim token to add 1 additional die to your attack pool.";

      // Special Keywords
      case this.GENERATOR_1:
        return "During the End Phase, flip 1 inactive shield token.";
      
      case this.RELIABLE_1:
        return "This unit gains 1 surge token at the start of every round.";
      
      case this.SENTINEL:
        return "This unit can spend a standby token after an enemy unit attacks, moves, or performs an action and is at range 1-3, rather than at range 1-2.";
      
      case this.UNSTOPPABLE:
        return "This unit ignores suppression and can move through difficult terrain without penalty.";
      
      case this.FIRE_SUPPORT:
        return "When another friendly unit performs a ranged attack, if you have a faceup order token, each mini in your unit may add an eligible weapon to the attack pool. If you do, flip your order token facedown. Limit 1 Fire Support per attack pool.";
      
      case this.INDEPENDENT:
        return "If this unit does not have a faceup order token, it gains 1 aim and 1 dodge token.";
      
      case this.DETACHMENT:
        return "When building your army, this unit does not count toward the rank requirements of your army.";
      
      case this.ASSOCIATE:
        return "When you add a unit with this keyword to your army, you may include specific associated units that would otherwise not be eligible.";
      
      case this.CLAIM:
        return "This unit can claim objective tokens.";
      
      case this.TRANSPORT_1:
      case this.TRANSPORT_2:
      case this.TRANSPORT_3:
        return `This unit can transport up to ${keyword.split('_')[1]} trooper unit(s).`;
      
      case this.OPEN_TRANSPORT:
        return "Units embarked on this transport may perform attacks as if they were not embarked.";
      
      case this.BOUNTY:
        return "After this unit defeats an enemy unit, it may gain 1 aim, dodge, or standby token.";
      
      case this.DAUNTLESS:
        return "After this unit rallies, if it is suppressed but not panicked, it may gain 1 aim token.";
      
      case this.DISCIPLINED_1:
      case this.DISCIPLINED_2:
        return `When this unit is issued an order, it may remove ${keyword.split('_')[1]} suppression token(s).`;
      
      case this.INDOMITABLE:
        return "While this unit has a faceup order token, it ignores suppression.";
      
      case this.ENRAGE_1:
      case this.ENRAGE_2:
      case this.ENRAGE_3:
        return `While this unit has ${keyword.split('_')[1]} or more wound tokens, it gains 1 aim token at the start of its activation.`;
      
      case this.INTERROGATE:
        return "After this unit defeats an enemy trooper unit, if that unit is suppressed, you may draw 1 battle card.";
      
      case this.CUNNING:
        return "After deployment, you may choose up to 2 enemy units. Each chosen unit gains 1 suppression token.";
      
      case this.SMOKE_1:
      case this.SMOKE_2:
        return `Exhaust: Choose ${keyword.split('_')[1]} friendly unit(s) at range 1. Each chosen unit gains 1 smoke token. While a unit with a smoke token defends, it has heavy cover.`;
      
      case this.DEMORALIZE_1:
      case this.DEMORALIZE_2:
        return `After this unit performs an attack, if the defender is at range 1-2, that unit gains ${keyword.split('_')[1]} suppression token(s).`;
      
      case this.REINFORCEMENTS:
        return "You may set aside this unit during deployment. At the start of a round, you may deploy this unit within range 1 of a friendly edge.";
      
      case this.LOADOUT:
        return "This unit must equip specific upgrades as indicated on its unit card.";
      
      case this.LEADER:
        return "This mini is the unit leader.";
      
      case this.AID:
        return "Exhaust: Choose a friendly trooper unit at range 1. Remove 1 wound token or 1 poison token from that unit.";
      
      case this.INCOGNITO:
        return "During deployment, this unit may be deployed anywhere beyond range 3 of all enemy units.";
      
      case this.WE_RE_NOT_REGS:
        return "You cannot include this unit in an army that includes units with the Clone Trooper upgrade type.";
      
      case this.ADVANCED_TARGETING_1:
      case this.ADVANCED_TARGETING_2:
        return `Exhaust: Choose ${keyword.split('_')[2]} enemy unit(s) at range 1-3. Each chosen unit gains 1 aim token.`;
      
      case this.TAKE_COVER_1:
      case this.TAKE_COVER_2:
        return `Exhaust: Choose up to ${keyword.split('_')[2]} friendly unit(s) at range 1. Each chosen unit gains 1 dodge token.`;
        
      default:
        return "No description available.";
    }
  },
  
  // Get all keywords by category
  getAllKeywords: function() {
    return {
      movement: [
        this.JUMP_1, this.JUMP_2, this.SCALE, this.SPEEDER_1, 
        this.SPEEDER_2, this.RELENTLESS, this.SCOUT_1, this.SCOUT_2, 
        this.SCOUTING_PARTY_1, this.SCOUTING_PARTY_2, this.WHEEL_MODE,
        this.AGILE_1, this.AGILE_2, this.CLIMBING_VEHICLE, this.EXPERT_CLIMBER,
        this.GROUNDED, this.REPOSITION, this.SPUR, this.OUTMANEUVER, this.PIVOT
      ],
      attack: [
        this.ARSENAL_2, this.SHARPSHOOTER_1, this.SHARPSHOOTER_2, 
        this.PRECISE_1, this.PRECISE_2, this.LETHAL_1, this.LETHAL_2,
        this.BARRAGE, this.DUELIST, this.STEADY
      ],
      defense: [
        this.ARMOR_1, this.ARMOR_2, this.ARMOR_3, this.IMPERVIOUS, 
        this.IMMUNE_PIERCE, this.IMMUNE_DEFLECT, this.IMMUNE_ENEMY_EFFECTS,
        this.DEFLECT, this.BLOCK, this.COVER_1, this.COVER_2, 
        this.SHIELDED_1, this.SHIELDED_2, this.SHIELDED_3, this.SHIELDED_4,
        this.DANGER_SENSE_1, this.DANGER_SENSE_2, this.DANGER_SENSE_3,
        this.INCONSPICUOUS, this.LOW_PROFILE
      ],
      command: [
        this.INSPIRE_1, this.INSPIRE_2, this.TACTICAL_1, this.TACTICAL_2, 
        this.TARGET_1, this.TARGET_2, this.COORDINATE, this.COORDINATE_DROID_TROOPER,
        this.EXEMPLAR, this.ENTOURAGE, this.OBSERVE_1, this.OBSERVE_2,
        this.SPOTTER_1, this.SPOTTER_2, this.PULLING_THE_STRINGS
      ],
      ai: [
        this.AI_ATTACK, this.AI_MOVE, this.AI_MOVE_ATTACK, 
        this.SWARM_INSTINCT_ATTACK, this.SWARM_INSTINCT_MOVE
      ],
      force: [
        this.CHARGE, this.GUARDIAN_1, this.GUARDIAN_2, this.GUARDIAN_3, 
        this.JEDI_HUNTER, this.MASTER_OF_THE_FORCE_1, this.SORESU_MASTERY,
        this.MAKASHI_MASTERY, this.JARKAI_MASTERY
      ],
      special: [
        this.GENERATOR_1, this.RELIABLE_1, this.SENTINEL, this.UNSTOPPABLE, 
        this.FIRE_SUPPORT, this.INDEPENDENT, this.DETACHMENT, this.ASSOCIATE,
        this.CLAIM, this.TRANSPORT_1, this.TRANSPORT_2, this.TRANSPORT_3,
        this.OPEN_TRANSPORT, this.BOUNTY, this.DAUNTLESS, this.DISCIPLINED_1,
        this.DISCIPLINED_2, this.INDOMITABLE, this.ENRAGE_1, this.ENRAGE_2,
        this.ENRAGE_3, this.INTERROGATE, this.CUNNING, this.SMOKE_1, this.SMOKE_2,
        this.DEMORALIZE_1, this.DEMORALIZE_2, this.REINFORCEMENTS, this.LOADOUT,
        this.LEADER, this.AID, this.INCOGNITO, this.WE_RE_NOT_REGS,
        this.ADVANCED_TARGETING_1, this.ADVANCED_TARGETING_2, this.TAKE_COVER_1,
        this.TAKE_COVER_2
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
      ...this.getAllKeywords().special
    ];
  }
});

export default Keywords;