// src/enums/UpgradeCardTypes.js (Updated with Specialist)
const UpgradeCardTypes = {
  // Type constants
  HEAVY_WEAPON: 'heavy_weapon',
  PERSONNEL: 'personnel',
  FORCE: 'force',
  COMMAND: 'command',
  HARDPOINT: 'hardpoint',
  GEAR: 'gear',
  GRENADES: 'grenades',
  COMMS: 'comms',
  PILOT: 'pilot',
  TRAINING: 'training',
  GENERATOR: 'generator',
  ARMAMENT: 'armament',
  SPECIALIST: 'specialist',  // NEW TYPE

  // Display names
  getDisplayName: (type) => {
    const names = {
      heavy_weapon: 'Heavy Weapon',
      personnel: 'Personnel',
      force: 'Force',
      command: 'Command',
      hardpoint: 'Hardpoint',
      gear: 'Gear',
      grenades: 'Grenades',
      comms: 'Comms',
      pilot: 'Pilot',
      training: 'Training',
      generator: 'Generator',
      armament: 'Armament',
      specialist: 'Specialist'
    };
    return names[type] || type;
  },

  // Descriptions
  getDescription: (type) => {
    const descriptions = {
      heavy_weapon: 'Add a heavy weapon to the unit',
      personnel: 'Add additional personnel to the unit',
      force: 'Force-sensitive upgrades and abilities',
      command: 'Leadership and command abilities',
      hardpoint: 'Vehicle or emplacement weapon systems',
      gear: 'Equipment and tactical gear',
      grenades: 'Explosive ordnance',
      comms: 'Communication equipment',
      pilot: 'Vehicle crew and pilot upgrades',
      training: 'Special training and tactics',
      generator: 'Shield generators and power systems',
      armament: 'Additional armaments and weapons',
      specialist: 'Specialized unit members with unique skills'
    };
    return descriptions[type] || '';
  },

  // Badge colors for UI
  getBadgeColor: (type) => {
    const colors = {
      heavy_weapon: 'danger',
      personnel: 'primary',
      force: 'info',
      command: 'warning',
      hardpoint: 'dark',
      gear: 'secondary',
      grenades: 'danger',
      comms: 'info',
      pilot: 'primary',
      training: 'success',
      generator: 'info',
      armament: 'danger',
      specialist: 'purple'
    };
    return colors[type] || 'secondary';
  },

  // Icon classes (Bootstrap Icons)
  getIconClass: (type) => {
    const icons = {
      heavy_weapon: 'bi-crosshair',
      personnel: 'bi-people-fill',
      force: 'bi-stars',
      command: 'bi-flag-fill',
      hardpoint: 'bi-bullseye',
      gear: 'bi-tools',
      grenades: 'bi-circle-fill',
      comms: 'bi-broadcast',
      pilot: 'bi-person-badge',
      training: 'bi-book',
      generator: 'bi-shield-fill-check',
      armament: 'bi-hammer',
      specialist: 'bi-award-fill'
    };
    return icons[type] || 'bi-box';
  },

  // Get all upgrade types
  getAllTypes: () => {
    return [
      UpgradeCardTypes.HEAVY_WEAPON,
      UpgradeCardTypes.PERSONNEL,
      UpgradeCardTypes.FORCE,
      UpgradeCardTypes.COMMAND,
      UpgradeCardTypes.HARDPOINT,
      UpgradeCardTypes.GEAR,
      UpgradeCardTypes.GRENADES,
      UpgradeCardTypes.COMMS,
      UpgradeCardTypes.PILOT,
      UpgradeCardTypes.TRAINING,
      UpgradeCardTypes.GENERATOR,
      UpgradeCardTypes.ARMAMENT,
      UpgradeCardTypes.SPECIALIST
    ];
  },

  // Check if a type typically adds weapons
  shouldAddWeapons: (type) => {
    return [
      UpgradeCardTypes.HEAVY_WEAPON,
      UpgradeCardTypes.HARDPOINT,
      UpgradeCardTypes.GRENADES,
      UpgradeCardTypes.ARMAMENT,
      UpgradeCardTypes.SPECIALIST
    ].includes(type);
  }
};

export default UpgradeCardTypes;