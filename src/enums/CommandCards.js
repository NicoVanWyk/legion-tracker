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
    MECHANIZED_WARFARE: 'mechanized_warfare',

    // General Grievous Cards (Core Set)
    TRAINED_IN_YOUR_JEDI_ARTS: 'trained_in_your_jedi_arts',
    SUPREME_COMMANDER: 'supreme_commander',
    CRUSH_THEM: 'crush_them',
    WIPE_THEM_OUT: 'wipe_them_out',

    // ===== Imperial Command Cards =====
    // Generic Imperial Cards
    IMPERIAL_DISCIPLINE: 'imperial_discipline',
    COORDINATED_FIRE: 'coordinated_fire',
    PINNED_DOWN: 'pinned_down',

    // Darth Vader Cards
    IMPLACABLE: 'implacable',
    NEW_WAYS_TO_MOTIVATE_THEM: 'new_ways_to_motivate_them',
    MASTER_OF_EVIL: 'master_of_evil',

    // ===== Rebel Command Cards =====
    // Generic Rebel Cards
    REBEL_YELL: 'rebel_yell',
    TURNING_THE_TIDE: 'turning_the_tide',
    COVERING_FIRE: 'covering_fire',

    // Luke Skywalker Cards
    SON_OF_SKYWALKER: 'son_of_skywalker',
    MY_ALLY_IS_THE_FORCE: 'my_ally_is_the_force',
    RETURN_OF_THE_JEDI: 'return_of_the_jedi',

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
            case this.MECHANIZED_WARFARE: return 'Mechanized Warfare';

            // General Grievous Cards
            case this.TRAINED_IN_YOUR_JEDI_ARTS: return 'Trained in Your Jedi Arts';
            case this.SUPREME_COMMANDER: return 'Supreme Commander';
            case this.CRUSH_THEM: return 'Crush Them!';
            case this.WIPE_THEM_OUT: return 'Wipe Them Out';

            // Imperial Cards
            case this.IMPERIAL_DISCIPLINE: return 'Imperial Discipline';
            case this.COORDINATED_FIRE: return 'Coordinated Fire';
            case this.PINNED_DOWN: return 'Pinned Down';

            // Darth Vader Cards
            case this.IMPLACABLE: return 'Implacable';
            case this.NEW_WAYS_TO_MOTIVATE_THEM: return 'New Ways to Motivate Them';
            case this.MASTER_OF_EVIL: return 'Master of Evil';

            // Rebel Cards
            case this.REBEL_YELL: return 'Rebel Yell';
            case this.TURNING_THE_TIDE: return 'Turning the Tide';
            case this.COVERING_FIRE: return 'Covering Fire';

            // Luke Skywalker Cards
            case this.SON_OF_SKYWALKER: return 'Son of Skywalker';
            case this.MY_ALLY_IS_THE_FORCE: return 'My Ally Is the Force';
            case this.RETURN_OF_THE_JEDI: return 'Return of the Jedi';

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
            case this.GENERAL_KENOBI:
            case this.HELLO_THERE:
            case this.BRING_IT_DOWN:
            case this.TRAINED_IN_YOUR_JEDI_ARTS:
            case this.ROGER_ROGER:
            case this.IMPERIAL_DISCIPLINE:
            case this.IMPLACABLE:
            case this.REBEL_YELL:
            case this.SON_OF_SKYWALKER:
                return 1;

            // 2-Pip Cards
            case this.PUSH:
            case this.AIR_SUPPORT:
            case this.TRAINED_FOR_WAR:
            case this.KNOWLEDGE_AND_DEFENSE:
            case this.HAVE_I_EVER_LET_YOU_DOWN:
            case this.SUPREME_COMMANDER:
            case this.MECHANIZED_WARFARE:
            case this.COORDINATED_FIRE:
            case this.NEW_WAYS_TO_MOTIVATE_THEM:
            case this.TURNING_THE_TIDE:
            case this.MY_ALLY_IS_THE_FORCE:
                return 2;

            // 3-Pip Cards
            case this.ASSAULT:
            case this.ATTACK_OF_THE_CLONES:
            case this.COMBINED_ARMS:
            case this.CRUSH_THEM:
            case this.WIPE_THEM_OUT:
            case this.PINNED_DOWN:
            case this.MASTER_OF_EVIL:
            case this.COVERING_FIRE:
            case this.RETURN_OF_THE_JEDI:
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

            // Clone Commander Cody Cards
            case this.BRING_IT_DOWN:
            case this.HAVE_I_EVER_LET_YOU_DOWN:
            case this.COMBINED_ARMS:
                return 'Clone Commander Cody';

            // General Grievous Cards
            case this.TRAINED_IN_YOUR_JEDI_ARTS:
            case this.SUPREME_COMMANDER:
            case this.CRUSH_THEM:
            case this.WIPE_THEM_OUT:
                return 'General Grievous - The Jedi Slayer';

            // Darth Vader Cards
            case this.IMPLACABLE:
            case this.NEW_WAYS_TO_MOTIVATE_THEM:
            case this.MASTER_OF_EVIL:
                return 'Darth Vader';

            // Luke Skywalker Cards
            case this.SON_OF_SKYWALKER:
            case this.MY_ALLY_IS_THE_FORCE:
            case this.RETURN_OF_THE_JEDI:
                return 'Luke Skywalker';

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
            this.SYNCHRONISED_OFFENSIVE, this.AIR_SUPPORT,
            this.GENERAL_KENOBI, this.KNOWLEDGE_AND_DEFENSE, this.HELLO_THERE,
            this.BRING_IT_DOWN, this.HAVE_I_EVER_LET_YOU_DOWN, this.COMBINED_ARMS].includes(id)) {
            return Factions.REPUBLIC;
        }

        // Separatist Cards
        if ([this.ROGER_ROGER, this.MECHANIZED_WARFARE,
            this.TRAINED_IN_YOUR_JEDI_ARTS, this.SUPREME_COMMANDER, this.CRUSH_THEM, this.WIPE_THEM_OUT].includes(id)) {
            return Factions.SEPARATIST;
        }

        // Imperial Cards
        if ([this.IMPERIAL_DISCIPLINE, this.COORDINATED_FIRE, this.PINNED_DOWN,
            this.IMPLACABLE, this.NEW_WAYS_TO_MOTIVATE_THEM, this.MASTER_OF_EVIL].includes(id)) {
            return Factions.EMPIRE;
        }

        // Rebel Cards
        if ([this.REBEL_YELL, this.TURNING_THE_TIDE, this.COVERING_FIRE,
            this.SON_OF_SKYWALKER, this.MY_ALLY_IS_THE_FORCE, this.RETURN_OF_THE_JEDI].includes(id)) {
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
            case this.SYNCHRONISED_OFFENSIVE:
                return "Placeholder description for Synchronised Offensive.";
            case this.AIR_SUPPORT:
                return "Placeholder description for Air Support.";

            // Obi-Wan Kenobi Cards
            case this.GENERAL_KENOBI:
                return "Obi-Wan Kenobi gains Jump 2 and may perform a free move action.";
            case this.KNOWLEDGE_AND_DEFENSE:
                return "When Obi-Wan Kenobi or a friendly trooper unit at range 1-2 of him is defending against a ranged attack, the attacker cannot resolve critical hits.";
            case this.HELLO_THERE:
                return "Place Obi-Wan Kenobi anywhere on the battlefield beyond range 3 of all enemy units. He gains 2 suppression tokens.";

            // Clone Commander Cody Cards
            case this.BRING_IT_DOWN:
                return "Placeholder description for Bring It Down!";
            case this.HAVE_I_EVER_LET_YOU_DOWN:
                return "Placeholder description for Have I Ever Let You Down?";
            case this.COMBINED_ARMS:
                return "Placeholder description for Combined Arms.";

            // Separatist Cards
            case this.ROGER_ROGER:
                return "When a droid trooper unit is issued an order, it may perform a free attack action.";
            case this.MECHANIZED_WARFARE:
                return "Vehicle units gain Surge to Hit for their next attack.";

            // General Grievous Cards
            case this.TRAINED_IN_YOUR_JEDI_ARTS:
                return "When General Grievous performs an attack targeting a unit with a Force upgrade, he gains Lethal 2.";
            case this.SUPREME_COMMANDER:
                return "General Grievous gains 1 aim token and 1 dodge token. He may perform up to 2 attack actions during his activation.";
            case this.CRUSH_THEM:
                return "When an enemy unit within range 1-2 of General Grievous activates, it gains 1 suppression token.";
            case this.WIPE_THEM_OUT:
                return "Up to 3 droid trooper units at range 1-3 of General Grievous may perform a free move action.";

            // Imperial Cards
            case this.IMPERIAL_DISCIPLINE:
                return "When an Imperial trooper unit is issued an order, it may remove 1 suppression token.";
            case this.COORDINATED_FIRE:
                return "Choose up to 2 friendly units. Until the end of the round, while these units are attacking the same enemy unit, they gain Precise 1.";
            case this.PINNED_DOWN:
                return "Choose an enemy unit. That unit gains 2 suppression tokens and cannot remove suppression tokens during its next activation.";

            // Darth Vader Cards
            case this.IMPLACABLE:
                return "Placeholder description for Implacable.";
            case this.NEW_WAYS_TO_MOTIVATE_THEM:
                return "Placeholder description for New Ways to Motivate Them.";
            case this.MASTER_OF_EVIL:
                return "Placeholder description for Master of Evil.";

            // Rebel Cards
            case this.REBEL_YELL:
                return "Each Rebel trooper unit that is issued an order may perform a free move action immediately.";
            case this.TURNING_THE_TIDE:
                return "Choose a friendly unit that has 1 or more wound tokens. That unit gains Inspire 2 until the end of the round.";
            case this.COVERING_FIRE:
                return "When a Rebel trooper unit with a faceup order token activates, all other friendly units within range 1 gain a dodge token.";

            // Luke Skywalker Cards
            case this.SON_OF_SKYWALKER:
                return "Placeholder description for Son of Skywalker.";
            case this.MY_ALLY_IS_THE_FORCE:
                return "Placeholder description for My Ally Is the Force.";
            case this.RETURN_OF_THE_JEDI:
                return "Placeholder description for Return of the Jedi.";

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
                    this.MECHANIZED_WARFARE,
                    this.TRAINED_IN_YOUR_JEDI_ARTS,
                    this.SUPREME_COMMANDER,
                    this.CRUSH_THEM,
                    this.WIPE_THEM_OUT
                ];
                break;
            case Factions.EMPIRE:
                factionCards = [
                    this.IMPERIAL_DISCIPLINE,
                    this.COORDINATED_FIRE,
                    this.PINNED_DOWN,
                    this.IMPLACABLE,
                    this.NEW_WAYS_TO_MOTIVATE_THEM,
                    this.MASTER_OF_EVIL
                ];
                break;
            case Factions.REBEL:
                factionCards = [
                    this.REBEL_YELL,
                    this.TURNING_THE_TIDE,
                    this.COVERING_FIRE,
                    this.SON_OF_SKYWALKER,
                    this.MY_ALLY_IS_THE_FORCE,
                    this.RETURN_OF_THE_JEDI
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
            this.SYNCHRONISED_OFFENSIVE, this.AIR_SUPPORT,
            this.GENERAL_KENOBI, this.KNOWLEDGE_AND_DEFENSE, this.HELLO_THERE,
            this.BRING_IT_DOWN, this.HAVE_I_EVER_LET_YOU_DOWN, this.COMBINED_ARMS,

            // Separatist
            this.ROGER_ROGER, this.MECHANIZED_WARFARE,
            this.TRAINED_IN_YOUR_JEDI_ARTS, this.SUPREME_COMMANDER, this.CRUSH_THEM, this.WIPE_THEM_OUT,

            // Imperial
            this.IMPERIAL_DISCIPLINE, this.COORDINATED_FIRE, this.PINNED_DOWN,
            this.IMPLACABLE, this.NEW_WAYS_TO_MOTIVATE_THEM, this.MASTER_OF_EVIL,

            // Rebel
            this.REBEL_YELL, this.TURNING_THE_TIDE, this.COVERING_FIRE,
            this.SON_OF_SKYWALKER, this.MY_ALLY_IS_THE_FORCE, this.RETURN_OF_THE_JEDI
        ];
    }
});

export default CommandCards;