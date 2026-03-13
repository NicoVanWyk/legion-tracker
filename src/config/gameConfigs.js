// src/config/gameConfigs.js
import GameSystems from '../enums/GameSystems';
import Factions from '../enums/Factions';
import UnitTypes from '../enums/UnitTypes';
import Keywords from '../enums/Keywords';
import DefenseDice from '../enums/DefenseDice';
import WeaponRanges from '../enums/WeaponRanges';
import AttackDice from '../enums/AttackDice';
import WeaponKeywords from '../enums/WeaponKeywords';

// Import AOS enums (to be created)
import AoSFactions from '../enums/aos/AoSFactions';
import AoSUnitTypes from '../enums/aos/AoSUnitTypes';
import AoSKeywords from '../enums/aos/AoSKeywords';
import AoSWeaponTypes from '../enums/aos/AoSWeaponTypes';

const GAME_CONFIGS = {
    [GameSystems.LEGION]: {
        name: 'Star Wars: Legion',
        factions: Factions,
        unitTypes: UnitTypes,
        keywords: Keywords,
        defenseDice: DefenseDice,
        weaponRanges: WeaponRanges,
        attackDice: AttackDice,
        weaponKeywords: WeaponKeywords,
        
        stats: {
            primary: [
                { key: 'wounds', label: 'Wounds', abbr: 'W', min: 1 },
                { key: 'courage', label: 'Courage', abbr: 'C', min: 0, vehicleKey: 'resilience', vehicleLabel: 'Resilience', vehicleAbbr: 'R' },
                { key: 'speed', label: 'Speed', abbr: 'S', min: 1 }
            ],
            defense: { key: 'defense', label: 'Defense Dice', enum: DefenseDice },
            modelCount: { key: 'minModelCount', label: 'Min Models', min: 1 }
        },
        
        features: {
            hasVehicles: true,
            hasSurgeTokens: true,
            hasUpgradeSlots: true,
            hasCommandCards: true,
            hasAbilities: true
        },
        
        weaponStructure: {
            hasRange: true,
            hasDice: true,
            diceTypes: AttackDice,
            hasKeywords: true
        }
    },
    
    [GameSystems.AOS]: {
        name: 'Warhammer: Age of Sigmar',
        factions: AoSFactions,
        unitTypes: AoSUnitTypes,
        keywords: AoSKeywords,
        weaponTypes: AoSWeaponTypes,
        
        stats: {
            primary: [
                { key: 'wounds', label: 'Wounds', abbr: 'W', min: 1 },
                { key: 'bravery', label: 'Bravery', abbr: 'Bv', min: 1 },
                { key: 'move', label: 'Move', abbr: 'M', min: 1 },
                { key: 'save', label: 'Save', abbr: 'Sv', min: 1, max: 7, suffix: '+' }
            ],
            modelCount: { key: 'minModelCount', label: 'Min Models', min: 1 }
        },
        
        features: {
            hasVehicles: false,
            hasSurgeTokens: false,
            hasUpgradeSlots: false,
            hasCommandCards: false,
            hasAbilities: true,
            hasWarscrolls: true
        },
        
        weaponStructure: {
            hasRange: true,
            hasAttacks: true,
            hasToHit: true,
            hasToWound: true,
            hasRend: true,
            hasDamage: true,
            hasKeywords: false
        }
    }
};

export default GAME_CONFIGS;