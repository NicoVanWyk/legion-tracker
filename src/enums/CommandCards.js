// src/enums/CommandCards.js
import Factions from './Factions';

const CommandCards = Object.freeze({
    // ===== Universal Command Cards (available to all armies) =====
    AMBUSH: 'ambush',
    ASSAULT: 'assault',
    PUSH: 'push',
    STANDING_ORDERS: 'standing_orders',

    // ===== Republic Command Cards =====
    // Generic Republic Cards
    ATTACK_OF_THE_CLONES: 'attack_of_the_clones',
    SYNCHRONISED_OFFENSIVE: 'synchronised_offensive',
    AIR_SUPPORT: 'air_support',

    // Obi-Wan Kenobi Cards (Core Set)
    GENERAL_KENOBI: 'general_kenobi',
    KNOWLEDGE_AND_DEFENSE: 'knowledge_and_defense',
    HELLO_THERE: 'hello_there',

    // Clone Commander Cody Cards
    BRING_IT_DOWN: 'bring_it_down',
    HAVE_I_EVER_LET_YOU_DOWN: 'have_i_ever_let_you_down',
    COMBINED_ARMS: 'combined_arms',

    // ===== Separatist Command Cards =====
    // Generic Separatist Cards
    ROGER_ROGER: 'roger_roger',

    // General Grievous Cards (Core Set)
    TRAINED_IN_YOUR_JEDI_ARTS: 'trained_in_your_jedi_arts',
    SUPREME_COMMANDER: 'supreme_commander',
    CRUSH_THEM: 'crush_them',

    // Function to get display name
    getDisplayName: function(id) {
        if (!id) return '';

        switch (id) {
            // Universal Cards
            case this.AMBUSH: return 'Ambush';
            case this.ASSAULT: return 'Assault';
            case this.PUSH: return 'Push';
            case this.STANDING_ORDERS: return 'Standing Orders';

            // Republic Cards
            case this.ATTACK_OF_THE_CLONES: return 'Attack of the Clones';
            case this.SYNCHRONISED_OFFENSIVE: return 'Synchronised Offensive';
            case this.AIR_SUPPORT: return 'Air Support';

            // Obi-Wan Kenobi Cards
            case this.GENERAL_KENOBI: return 'General Kenobi';
            case this.KNOWLEDGE_AND_DEFENSE: return 'Knowledge and Defense';
            case this.HELLO_THERE: return 'Hello There!';

            // Clone Commander Cody Cards
            case this.BRING_IT_DOWN: return 'Bring It Down!';
            case this.HAVE_I_EVER_LET_YOU_DOWN: return 'Have I Ever Let You Down?';
            case this.COMBINED_ARMS: return 'Combined Arms';

            // Separatist Cards
            case this.ROGER_ROGER: return 'Roger Roger';

            // General Grievous Cards
            case this.TRAINED_IN_YOUR_JEDI_ARTS: return 'Trained in Your Jedi Arts';
            case this.SUPREME_COMMANDER: return 'Supreme Commander';
            case this.CRUSH_THEM: return 'Crush Them!';

            default:
                return id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }
    },

    // Function to get card pips (difficulty)
    getPips: function(id) {
        switch (id) {
            // 1-Pip Cards
            case this.AMBUSH:
            case this.SYNCHRONISED_OFFENSIVE:
            case this.HELLO_THERE:
            case this.BRING_IT_DOWN:
            case this.TRAINED_IN_YOUR_JEDI_ARTS:
                return 1;

            // 2-Pip Cards
            case this.PUSH:
            case this.AIR_SUPPORT:
            case this.KNOWLEDGE_AND_DEFENSE:
            case this.HAVE_I_EVER_LET_YOU_DOWN:
            case this.SUPREME_COMMANDER:
                return 2;

            // 3-Pip Cards
            case this.ROGER_ROGER:
            case this.GENERAL_KENOBI:
            case this.ASSAULT:
            case this.ATTACK_OF_THE_CLONES:
            case this.COMBINED_ARMS:
            case this.CRUSH_THEM:
                return 3;

            // 4-Pip Cards
            case this.STANDING_ORDERS:
                return 4;

            default:
                return null;
        }
    },

    // Function to get card commander requirement (null if generic)
    getCommanderRequirement: function(id) {
        switch (id) {
            // Obi-Wan Kenobi Cards
            case this.GENERAL_KENOBI:
            case this.KNOWLEDGE_AND_DEFENSE:
            case this.HELLO_THERE:
                return 'Obi-Wan Kenobi';

            // Clone Commander Cody Cards
            case this.BRING_IT_DOWN:
            case this.HAVE_I_EVER_LET_YOU_DOWN:
            case this.COMBINED_ARMS:
                return 'Clone Commander Cody';

            // General Grievous Cards
            case this.TRAINED_IN_YOUR_JEDI_ARTS:
            case this.SUPREME_COMMANDER:
            case this.CRUSH_THEM:
                return 'General Grievous - The Jedi Slayer';

            default:
                return null;
        }
    },

    // Function to get card faction
    getFaction: function(id) {
        // Universal Cards
        if ([this.AMBUSH, this.ASSAULT, this.PUSH, this.STANDING_ORDERS].includes(id)) {
            return null; // All factions can use these
        }

        // Republic Cards
        if ([this.ATTACK_OF_THE_CLONES, this.SYNCHRONISED_OFFENSIVE, this.AIR_SUPPORT,
            this.GENERAL_KENOBI, this.KNOWLEDGE_AND_DEFENSE, this.HELLO_THERE,
            this.BRING_IT_DOWN, this.HAVE_I_EVER_LET_YOU_DOWN, this.COMBINED_ARMS].includes(id)) {
            return Factions.REPUBLIC;
        }

        // Separatist Cards
        if ([this.ROGER_ROGER, this.TRAINED_IN_YOUR_JEDI_ARTS, this.SUPREME_COMMANDER, 
            this.CRUSH_THEM, this.WIPE_THEM_OUT].includes(id)) {
            return Factions.SEPARATIST;
        }

        return null;
    },

    // Get card description
    getDescription: function(id) {
        switch (id) {
            // Universal Cards
            case this.AMBUSH:
                return "1 Unit.";
            case this.ASSAULT:
                return "3 Units.";
            case this.PUSH:
                return "2 Units.";
            case this.STANDING_ORDERS:
                return "1 Unit.";

            // Republic Cards
            case this.ATTACK_OF_THE_CLONES:
                return "3 Clone Troopers.";
            case this.SYNCHRONISED_OFFENSIVE:
                return "1 Vehicle.";
            case this.AIR_SUPPORT:
                return "1 Commander or Heavy Unit. Once this round, at the end of the activation of a friendly Commander clone trooper unit or friendly FIELD COMMANDER unit, it may perform an attack using the following weapon: Air Support; Range 4+; 1 Red Dice, 2 Black Dice; Beam 2, Immune: Deflect.";

            // Obi-Wan Kenobi Cards
            case this.KNOWLEDGE_AND_DEFENSE:
                return "2 Troopers. Obi-Wan Kenobi gains 1 dodge token for each other friendly trooper unit at range 1. Obi-Wan Kenobi can use Guardian during a melee attack.";
            case this.HELLO_THERE:
                return "1 Obi-Wan Kenobi. Obi-Wan Kenobi gains Nimble. At the start of the Activation Phase, Obi-Wan Kenobi gains 1 aim, 1 dodge, 1 standby, or 1 surge token for each enemy unit at range 1-2.";
            case this.GENERAL_KENOBI: 
                return "1 Obi-Wan Kenobi & 2 Units. When Obi-Wan Kenobi issues an order to a unit, that unit gains 1 surge token for each other friendly unit at range 1 of it."
                
            // Clone Commander Cody Cards
            case this.BRING_IT_DOWN:
                return "1 Clone Commander Cody.  During his activation, Clone Commander Cody may perform his Exhaust actions up to 2 times. When a friendly unit declares an attack against an enemy unit that has an observation token, you may spend the token. If you do, the attack gains Suppressive if the enemy unit is a trooper unit, and Impact 1 if the enemy unit is a vehicle unit.";
            case this.HAVE_I_EVER_LET_YOU_DOWN:
                return "1 Clone Commander Cody & 1 Trooper. While a unit that was issued an order by this card is at Range 1 of Clone Commander Cody and suffers wounds from an enemy attack, after the attack is resolved, if Clone Commander Cody is at Range 4 and has LOS to the enemy unit, he may perform an attack against that unit.";
            case this.COMBINED_ARMS:
                return "2 Troopers & 2 Vehicles. During his activation, Clone Commander Cody may perform his Exhaust actions up to 2 times. When a friendly vehicle unit declares an attack against an enemy unit that has an observation token, they may spend the token. If they do, after the attack a friendly Clone Trooper unit at Range 1 of that vehicle may perform a speed-1 move.";

            // Separatist Cards
            case this.ROGER_ROGER:
                return "3 Droid Troopers. ";

            // General Grievous Cards
            case this.TRAINED_IN_YOUR_JEDI_ARTS:
                return "1 General Grievous. General Grievous gains Disengage and 1 dodge token. At the end of his activation he may perform an attack against each enemy unit at range 1 using the following weapon: Trained in Your Jedi Arts; Range 1; 1 Red Dice, 2 Black Dice, 1 White Dice; Suppressive, Versatile.";
            case this.SUPREME_COMMANDER:
                return "2 Troopers. General Grievous gains 1 surge token for each friendly trooper unit at range 1. While another friendly trooper unit has a faceup order token, it gains Guardian 2 and can use Guardian during a melee attack.";
            case this.CRUSH_THEM:
                return "1 General Grievous & 2 Units. When General Grievous issues an order to a unit, that unit gains 1 surge token for each defeated enemy unit.";

            default:
                return "No description available.";
        }
    },

    // Get available cards for a faction (including universal)
    getAvailableCardsForFaction: function(faction) {
        // Universal cards available to all
        const universalCards = [this.AMBUSH, this.ASSAULT, this.PUSH, this.STANDING_ORDERS];

        // Faction-specific cards
        let factionCards = [];

        switch (faction) {
            case Factions.REPUBLIC:
                factionCards = [
                    this.ATTACK_OF_THE_CLONES,
                    this.SYNCHRONISED_OFFENSIVE,
                    this.AIR_SUPPORT,
                    this.GENERAL_KENOBI,
                    this.KNOWLEDGE_AND_DEFENSE,
                    this.HELLO_THERE,
                    this.BRING_IT_DOWN,
                    this.HAVE_I_EVER_LET_YOU_DOWN,
                    this.COMBINED_ARMS
                ];
                break;
            case Factions.SEPARATIST:
                factionCards = [
                    this.ROGER_ROGER,
                    this.TRAINED_IN_YOUR_JEDI_ARTS,
                    this.SUPREME_COMMANDER,
                    this.CRUSH_THEM,
                ];
                break;
            case Factions.EMPIRE:
                factionCards = [
                ];
                break;
            case Factions.REBEL:
                factionCards = [
                ];
                break;
            default:
                return universalCards;
        }

        return [...universalCards, ...factionCards];
    },

    // Get all system command cards
    getAllSystemCards: function() {
        return [
            // Universal
            this.AMBUSH, this.ASSAULT, this.PUSH, this.STANDING_ORDERS,

            // Republic
            this.ATTACK_OF_THE_CLONES, this.SYNCHRONISED_OFFENSIVE, this.AIR_SUPPORT,
            this.GENERAL_KENOBI, this.KNOWLEDGE_AND_DEFENSE, this.HELLO_THERE,
            this.BRING_IT_DOWN, this.HAVE_I_EVER_LET_YOU_DOWN, this.COMBINED_ARMS,

            // Separatist
            this.ROGER_ROGER, this.TRAINED_IN_YOUR_JEDI_ARTS, this.SUPREME_COMMANDER, 
            this.CRUSH_THEM,
        ];
    }
});

export default CommandCards;