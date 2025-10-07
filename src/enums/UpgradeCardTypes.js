// src/enums/UpgradeCardTypes.js
const UpgradeCardTypes = Object.freeze({
    PERSONNEL: 'personnel',
    HEAVY_WEAPON: 'heavy_weapon',
    GEAR: 'gear',
    GRENADES: 'grenades',
    COMMS: 'comms',
    FORCE: 'force',
    COMMAND: 'command',
    TRAINING: 'training',
    PILOT: 'pilot',
    HARDPOINT: 'hardpoint',
    ORDNANCE: 'ordnance',
    ARMAMENT: 'armament',

    getDisplayName: function(type) {
        const names = {
            [this.PERSONNEL]: 'Personnel',
            [this.HEAVY_WEAPON]: 'Heavy Weapon',
            [this.GEAR]: 'Gear',
            [this.GRENADES]: 'Grenades',
            [this.COMMS]: 'Comms',
            [this.FORCE]: 'Force',
            [this.COMMAND]: 'Command',
            [this.TRAINING]: 'Training',
            [this.PILOT]: 'Pilot',
            [this.HARDPOINT]: 'Hardpoint',
            [this.ORDNANCE]: 'Ordnance',
            [this.ARMAMENT]: 'Armament'
        };
        return names[type] || 'Unknown';
    },

    getDescription: function(type) {
        const descriptions = {
            [this.PERSONNEL]: 'Add additional personnel to the unit',
            [this.HEAVY_WEAPON]: 'Equip heavy weapons for increased firepower',
            [this.GEAR]: 'Add equipment and gear to enhance capabilities',
            [this.GRENADES]: 'Add grenade weapons to the unit',
            [this.COMMS]: 'Improve communication and command abilities',
            [this.FORCE]: 'Force-sensitive abilities and powers',
            [this.COMMAND]: 'Command abilities and leadership upgrades',
            [this.TRAINING]: 'Special training and tactics',
            [this.PILOT]: 'Vehicle pilot upgrades and skills',
            [this.HARDPOINT]: 'Vehicle weapon hardpoint upgrades',
            [this.ORDNANCE]: 'Vehicle ordnance and ammunition upgrades',
            [this.ARMAMENT]: 'Additional armament options'
        };
        return descriptions[type] || 'No description available';
    },

    getAllTypes: function() {
        return [
            this.PERSONNEL,
            this.HEAVY_WEAPON,
            this.GEAR,
            this.GRENADES,
            this.COMMS,
            this.FORCE,
            this.COMMAND,
            this.TRAINING,
            this.PILOT,
            this.HARDPOINT,
            this.ORDNANCE,
            this.ARMAMENT
        ];
    },

    getInfantryTypes: function() {
        return [
            this.PERSONNEL,
            this.HEAVY_WEAPON,
            this.GEAR,
            this.GRENADES,
            this.COMMS,
            this.TRAINING
        ];
    },

    getVehicleTypes: function() {
        return [
            this.PILOT,
            this.HARDPOINT,
            this.ORDNANCE,
            this.COMMS,
            this.GEAR
        ];
    },

    getCommanderTypes: function() {
        return [
            this.FORCE,
            this.COMMAND,
            this.TRAINING,
            this.GEAR
        ];
    },

    getIconClass: function(type) {
        const icons = {
            [this.PERSONNEL]: 'bi-person-plus-fill',
            [this.HEAVY_WEAPON]: 'bi-crosshair',
            [this.GEAR]: 'bi-gear-fill',
            [this.GRENADES]: 'bi-bomb',
            [this.COMMS]: 'bi-broadcast',
            [this.FORCE]: 'bi-stars',
            [this.COMMAND]: 'bi-flag-fill',
            [this.TRAINING]: 'bi-trophy-fill',
            [this.PILOT]: 'bi-person-badge-fill',
            [this.HARDPOINT]: 'bi-lightning-charge-fill',
            [this.ORDNANCE]: 'bi-rocket-takeoff-fill',
            [this.ARMAMENT]: 'bi-shield-fill-plus'
        };
        return icons[type] || 'bi-question-circle';
    },

    getBadgeColor: function(type) {
        const colors = {
            [this.PERSONNEL]: 'primary',
            [this.HEAVY_WEAPON]: 'danger',
            [this.GEAR]: 'secondary',
            [this.GRENADES]: 'warning',
            [this.COMMS]: 'info',
            [this.FORCE]: 'dark',
            [this.COMMAND]: 'success',
            [this.TRAINING]: 'primary',
            [this.PILOT]: 'info',
            [this.HARDPOINT]: 'danger',
            [this.ORDNANCE]: 'warning',
            [this.ARMAMENT]: 'secondary'
        };
        return colors[type] || 'secondary';
    }
});

export default UpgradeCardTypes;