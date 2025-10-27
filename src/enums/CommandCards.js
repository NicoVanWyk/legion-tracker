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
    TRAINED_FOR_WAR: 'trained_for_war',
    SOMEONE_ELSE_WILL_DO_THE_JOB: 'someone_else_will_do_the_job',

    // Obi-Wan Kenobi Cards (Core Set)
    GENERAL_KENOBI: 'general_kenobi',
    KNOWLEDGE_AND_DEFENSE: 'knowledge_and_defense',
    HELLO_THERE: 'hello_there',

    // ===== Separatist Command Cards =====
    // Generic Separatist Cards
    ROGER_ROGER: 'roger_roger',
    MECHANIZED_WARFARE: 'mechanized_warfare',
    CRUSH_THEM: 'crush_them',

    // General Grievous Cards (Core Set)
    SUPREME_COMMANDER: 'supreme_commander',
    TRAINED_IN_YOUR_JEDI_ARTS: 'trained_in_your_jedi_arts',
    WIPE_THEM_OUT: 'wipe_them_out',

    // ===== Imperial Command Cards =====
    // Generic Imperial Cards
    IMPERIAL_DISCIPLINE: 'imperial_discipline',
    COORDINATED_FIRE: 'coordinated_fire',
    PINNED_DOWN: 'pinned_down',

    // ===== Rebel Command Cards =====
    // Generic Rebel Cards
    REBEL_YELL: 'rebel_yell',
    TURNING_THE_TIDE: 'turning_the_tide',
    COVERING_FIRE: 'covering_fire',

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
            case this.TRAINED_FOR_WAR: return 'Trained for War';
            case this.SOMEONE_ELSE_WILL_DO_THE_JOB: return 'Someone Else Will Do the Job';

            // Obi-Wan Kenobi Cards
            case this.GENERAL_KENOBI: return 'General Kenobi';
            case this.KNOWLEDGE_AND_DEFENSE: return 'Knowledge and Defense';
            case this.HELLO_THERE: return 'Hello There!';

            // Separatist Cards
            case this.ROGER_ROGER: return 'Roger Roger';
            case this.MECHANIZED_WARFARE: return 'Mechanized Warfare';
            case this.CRUSH_THEM: return 'Crush Them';

            // General Grievous Cards
            case this.SUPREME_COMMANDER: return 'Supreme Commander';
            case this.TRAINED_IN_YOUR_JEDI_ARTS: return 'Trained in Your Jedi Arts';
            case this.WIPE_THEM_OUT: return 'Wipe Them Out';

            // Imperial Cards
            case this.IMPERIAL_DISCIPLINE: return 'Imperial Discipline';
            case this.COORDINATED_FIRE: return 'Coordinated Fire';
            case this.PINNED_DOWN: return 'Pinned Down';

            // Rebel Cards
            case this.REBEL_YELL: return 'Rebel Yell';
            case this.TURNING_THE_TIDE: return 'Turning the Tide';
            case this.COVERING_FIRE: return 'Covering Fire';

            default:
                return id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }
    },

    // Function to get card pips (difficulty)
    getPips: function(id) {
        switch (id) {
            // 1-Pip Cards
            case this.AMBUSH:
            case this.GENERAL_KENOBI:
            case this.ROGER_ROGER:
            case this.SUPREME_COMMANDER:
            case this.IMPERIAL_DISCIPLINE:
            case this.REBEL_YELL:
                return 1;

            // 2-Pip Cards
            case this.PUSH:
            case this.TRAINED_FOR_WAR:
            case this.KNOWLEDGE_AND_DEFENSE:
            case this.MECHANIZED_WARFARE:
            case this.TRAINED_IN_YOUR_JEDI_ARTS:
            case this.COORDINATED_FIRE:
            case this.TURNING_THE_TIDE:
                return 2;

            // 3-Pip Cards
            case this.ASSAULT:
            case this.ATTACK_OF_THE_CLONES:
            case this.HELLO_THERE:
            case this.CRUSH_THEM:
            case this.WIPE_THEM_OUT:
            case this.PINNED_DOWN:
            case this.COVERING_FIRE:
                return 3;

            // 4-Pip Cards
            case this.STANDING_ORDERS:
            case this.SOMEONE_ELSE_WILL_DO_THE_JOB:
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

            // General Grievous Cards
            case this.SUPREME_COMMANDER:
            case this.TRAINED_IN_YOUR_JEDI_ARTS:
            case this.WIPE_THEM_OUT:
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
        if ([this.ATTACK_OF_THE_CLONES, this.TRAINED_FOR_WAR, this.SOMEONE_ELSE_WILL_DO_THE_JOB,
            this.GENERAL_KENOBI, this.KNOWLEDGE_AND_DEFENSE, this.HELLO_THERE].includes(id)) {
            return Factions.REPUBLIC;
        }

        // Separatist Cards
        if ([this.ROGER_ROGER, this.MECHANIZED_WARFARE, this.CRUSH_THEM,
            this.SUPREME_COMMANDER, this.TRAINED_IN_YOUR_JEDI_ARTS, this.WIPE_THEM_OUT].includes(id)) {
            return Factions.SEPARATIST;
        }

        // Imperial Cards
        if ([this.IMPERIAL_DISCIPLINE, this.COORDINATED_FIRE, this.PINNED_DOWN].includes(id)) {
            return Factions.EMPIRE;
        }

        // Rebel Cards
        if ([this.REBEL_YELL, this.TURNING_THE_TIDE, this.COVERING_FIRE].includes(id)) {
            return Factions.REBEL;
        }

        return null;
    },

    // Get card description
    getDescription: function(id) {
        switch (id) {
            // Universal Cards
            case this.AMBUSH:
                return "After issuing orders, shuffle the order pool.";
            case this.ASSAULT:
                return "Each trooper unit that is issued an order gains 1 dodge token.";
            case this.PUSH:
                return "Any unit can be issued an order, regardless of range.";
            case this.STANDING_ORDERS:
                return "Gain an additional command action during the Command Phase.";

            // Republic Cards
            case this.ATTACK_OF_THE_CLONES:
                return "When a trooper unit is issued an order, it gains 1 aim token and 1 dodge token.";
            case this.TRAINED_FOR_WAR:
                return "When activating a clone trooper unit, it may perform a free aim action.";
            case this.SOMEONE_ELSE_WILL_DO_THE_JOB:
                return "When a clone trooper unit suffers wounds, you may transfer up to 2 wounds to another friendly clone trooper unit within range 1-2.";

            // Obi-Wan Kenobi Cards
            case this.GENERAL_KENOBI:
                return "Obi-Wan Kenobi gains Jump 2 and may perform a free move action.";
            case this.KNOWLEDGE_AND_DEFENSE:
                return "When Obi-Wan Kenobi or a friendly trooper unit at range 1-2 of him is defending against a ranged attack, the attacker cannot resolve critical hits.";
            case this.HELLO_THERE:
                return "Place Obi-Wan Kenobi anywhere on the battlefield beyond range 3 of all enemy units. He gains 2 suppression tokens.";

            // Separatist Cards
            case this.ROGER_ROGER:
                return "When a droid trooper unit is issued an order, it may perform a free attack action.";
            case this.MECHANIZED_WARFARE:
                return "Vehicle units gain Surge to Hit for their next attack.";
            case this.CRUSH_THEM:
                return "When an enemy unit within range 1-2 of your commander activates, it gains 1 suppression token.";

            // General Grievous Cards
            case this.SUPREME_COMMANDER:
                return "General Grievous gains 1 aim token and 1 dodge token. He may perform up to 2 attack actions during his activation.";
            case this.TRAINED_IN_YOUR_JEDI_ARTS:
                return "When General Grievous performs an attack targeting a unit with a Force upgrade, he gains Lethal 2.";
            case this.WIPE_THEM_OUT:
                return "Up to 3 droid trooper units at range 1-3 of General Grievous may perform a free move action.";

            // Imperial Cards
            case this.IMPERIAL_DISCIPLINE:
                return "When an Imperial trooper unit is issued an order, it may remove 1 suppression token.";
            case this.COORDINATED_FIRE:
                return "Choose up to 2 friendly units. Until the end of the round, while these units are attacking the same enemy unit, they gain Precise 1.";
            case this.PINNED_DOWN:
                return "Choose an enemy unit. That unit gains 2 suppression tokens and cannot remove suppression tokens during its next activation.";

            // Rebel Cards
            case this.REBEL_YELL:
                return "Each Rebel trooper unit that is issued an order may perform a free move action immediately.";
            case this.TURNING_THE_TIDE:
                return "Choose a friendly unit that has 1 or more wound tokens. That unit gains Inspire 2 until the end of the round.";
            case this.COVERING_FIRE:
                return "When a Rebel trooper unit with a faceup order token activates, all other friendly units within range 1 gain a dodge token.";

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
                    this.TRAINED_FOR_WAR,
                    this.SOMEONE_ELSE_WILL_DO_THE_JOB,
                    this.GENERAL_KENOBI,
                    this.KNOWLEDGE_AND_DEFENSE,
                    this.HELLO_THERE
                ];
                break;
            case Factions.SEPARATIST:
                factionCards = [
                    this.ROGER_ROGER,
                    this.MECHANIZED_WARFARE,
                    this.CRUSH_THEM,
                    this.SUPREME_COMMANDER,
                    this.TRAINED_IN_YOUR_JEDI_ARTS,
                    this.WIPE_THEM_OUT
                ];
                break;
            case Factions.EMPIRE:
                factionCards = [
                    this.IMPERIAL_DISCIPLINE,
                    this.COORDINATED_FIRE,
                    this.PINNED_DOWN
                ];
                break;
            case Factions.REBEL:
                factionCards = [
                    this.REBEL_YELL,
                    this.TURNING_THE_TIDE,
                    this.COVERING_FIRE
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
            this.ATTACK_OF_THE_CLONES, this.TRAINED_FOR_WAR, this.SOMEONE_ELSE_WILL_DO_THE_JOB,
            this.GENERAL_KENOBI, this.KNOWLEDGE_AND_DEFENSE, this.HELLO_THERE,

            // Separatist
            this.ROGER_ROGER, this.MECHANIZED_WARFARE, this.CRUSH_THEM,
            this.SUPREME_COMMANDER, this.TRAINED_IN_YOUR_JEDI_ARTS, this.WIPE_THEM_OUT,

            // Imperial
            this.IMPERIAL_DISCIPLINE, this.COORDINATED_FIRE, this.PINNED_DOWN,

            // Rebel
            this.REBEL_YELL, this.TURNING_THE_TIDE, this.COVERING_FIRE
        ];
    }
});

export default CommandCards;