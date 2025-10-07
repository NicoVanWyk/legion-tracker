// src/enums/ReminderTypes.js
const ReminderTypes = Object.freeze({
    COMMAND_PHASE: 'command_phase',
    ACTIVATION_START: 'activation_start',
    ACTIVATION_END: 'activation_end',
    ATTACK_DECLARE: 'attack_declare',
    ATTACK_DICE: 'attack_dice',
    DEFENSE_DICE: 'defense_dice',
    END_PHASE: 'end_phase',
    RALLY: 'rally',
    GENERAL: 'general',
    UNIT_SELECTION: 'unit_selection',
    ARMY_BUILDING: 'army_building',

    getDisplayName: function(type) {
        const names = {
            [this.COMMAND_PHASE]: 'Command Phase',
            [this.ACTIVATION_START]: 'Activation Start',
            [this.ACTIVATION_END]: 'Activation End',
            [this.ATTACK_DECLARE]: 'Attack Declaration',
            [this.ATTACK_DICE]: 'Attack Dice',
            [this.DEFENSE_DICE]: 'Defense Dice',
            [this.END_PHASE]: 'End Phase',
            [this.RALLY]: 'Rally Step',
            [this.GENERAL]: 'General',
            [this.UNIT_SELECTION]: 'Unit Selection',
            [this.ARMY_BUILDING]: 'Army Building'
        };
        return names[type] || 'Unknown';
    },

    getDescription: function(type) {
        const descriptions = {
            [this.COMMAND_PHASE]: 'Reminders shown during the Command Phase',
            [this.ACTIVATION_START]: 'Reminders shown when a unit begins activation',
            [this.ACTIVATION_END]: 'Reminders shown when a unit finishes activation',
            [this.ATTACK_DECLARE]: 'Reminders shown when declaring an attack',
            [this.ATTACK_DICE]: 'Reminders shown when rolling attack dice',
            [this.DEFENSE_DICE]: 'Reminders shown when rolling defense dice',
            [this.END_PHASE]: 'Reminders shown during the End Phase',
            [this.RALLY]: 'Reminders shown during the Rally step',
            [this.GENERAL]: 'General reminders always visible',
            [this.UNIT_SELECTION]: 'Reminders shown when selecting units',
            [this.ARMY_BUILDING]: 'Reminders shown during army construction'
        };
        return descriptions[type] || 'No description available';
    },

    getPhaseTypes: function() {
        return [
            this.COMMAND_PHASE,
            this.ACTIVATION_START,
            this.ACTIVATION_END,
            this.END_PHASE,
            this.RALLY
        ];
    },

    getCombatTypes: function() {
        return [
            this.ATTACK_DECLARE,
            this.ATTACK_DICE,
            this.DEFENSE_DICE
        ];
    },

    getArmyBuildingTypes: function() {
        return [
            this.UNIT_SELECTION,
            this.ARMY_BUILDING
        ];
    },

    getAllTypes: function() {
        return [
            this.COMMAND_PHASE,
            this.ACTIVATION_START,
            this.ACTIVATION_END,
            this.ATTACK_DECLARE,
            this.ATTACK_DICE,
            this.DEFENSE_DICE,
            this.END_PHASE,
            this.RALLY,
            this.GENERAL,
            this.UNIT_SELECTION,
            this.ARMY_BUILDING
        ];
    },

    getBadgeColor: function(type) {
        const colors = {
            [this.COMMAND_PHASE]: 'primary',
            [this.ACTIVATION_START]: 'success',
            [this.ACTIVATION_END]: 'info',
            [this.ATTACK_DECLARE]: 'danger',
            [this.ATTACK_DICE]: 'danger',
            [this.DEFENSE_DICE]: 'warning',
            [this.END_PHASE]: 'secondary',
            [this.RALLY]: 'success',
            [this.GENERAL]: 'dark',
            [this.UNIT_SELECTION]: 'info',
            [this.ARMY_BUILDING]: 'primary'
        };
        return colors[type] || 'secondary';
    }
});

export default ReminderTypes;