// src/utils/ExportUtils.js
import Factions from '../enums/Factions';
import UnitTypes from '../enums/UnitTypes';
import DefenseDice from '../enums/DefenseDice';
import Keywords from '../enums/Keywords';
import WeaponRanges from '../enums/WeaponRanges';
import AttackDice from '../enums/AttackDice';
import WeaponKeywords from '../enums/WeaponKeywords';
import UpgradeCardTypes from '../enums/UpgradeCardTypes';
import KeywordUtils from './KeywordUtils';

/**
 * Utility for exporting unit and army data to text files
 */
export default class ExportUtils {
  
  /**
   * Creates a text export of a unit with all its details
   * @param {Object} unit The unit to export
   * @param {Array} customKeywords Array of custom keywords
   * @param {Array} upgrades Array of equipped upgrade cards 
   * @param {Array} abilities Array of abilities
   * @param {Array} customUnitTypes Array of custom unit types
   * @returns {String} Formatted text of unit data
   */
  static exportUnit(unit, customKeywords = [], upgrades = [], abilities = [], customUnitTypes = []) {
    if (!unit) return '';
    
    let exportText = '';
    
    // HEADER SECTION
    exportText += `============================================\n`;
    exportText += `STAR WARS LEGION - UNIT CARD\n`;
    exportText += `============================================\n\n`;
    
    // BASIC INFO
    exportText += `${unit.name?.toUpperCase() || 'UNNAMED UNIT'}\n`;
    exportText += `--------------------------------------------\n`;
    exportText += `Faction: ${Factions.getDisplayName(unit.faction)}\n`;
    exportText += `Type: ${this.getTypeDisplayName(unit.type, customUnitTypes)}\n`;
    exportText += `${unit.isVehicle ? 'Vehicle' : 'Trooper'}\n`;
    exportText += `Points Cost: ${unit.points || 0}\n\n`;
    
    // STATS
    exportText += `STATS:\n`;
    exportText += `--------------------------------------------\n`;
    exportText += `Wounds: ${unit.wounds || 1}\n`;
    
    if (unit.isVehicle) {
      exportText += `Resilience: ${unit.resilience === 0 ? '-' : unit.resilience}\n`;
    } else {
      exportText += `Courage: ${unit.courage === 0 ? '-' : unit.courage}\n`;
    }
    
    exportText += `Speed: ${unit.speed || 2}\n`;
    exportText += `Defense: ${unit.defense === 'white' ? 'White' : 'Red'}\n`;
    exportText += `Models: ${unit.minModelCount || 1} (min) / ${unit.currentModelCount || 1} (current)\n`;
    exportText += `Surge Tokens: ${unit.surgeAttack ? 'Attack' : 'No Attack'}, ${unit.surgeDefense ? 'Defense' : 'No Defense'}\n\n`;

   // KEYWORDS
  const allKeywords = this.getAllKeywords(unit, customKeywords, upgrades);
  if (allKeywords.length > 0) {
      exportText += `KEYWORDS:\n`;
      exportText += `--------------------------------------------\n`;

      // Use the processed keywords directly
      allKeywords.forEach(keyword => {
          let keywordName = this.getKeywordDisplayName(keyword, customKeywords);

          // Check if base keyword exists in the unit's keywords
          const baseKeyword = KeywordUtils.getKeywordBase(keyword);
          const isBaseKeyword = unit.keywords?.some(k =>
              KeywordUtils.getKeywordBase(k) === baseKeyword
          );

          keywordName = isBaseKeyword ? keywordName : `${keywordName} (from upgrade)`;

          exportText += `- ${keywordName}\n`;
      });

      exportText += `\n`;
  }
    
    // WEAPONS
    const weapons = this.getAllWeapons(unit, upgrades);
    if (weapons.length > 0) {
      exportText += `WEAPONS:\n`;
      exportText += `--------------------------------------------\n`;
      
      weapons.forEach(weapon => {
        exportText += `- ${weapon.name} (${weapon.source || 'Base Unit'})\n`;
        exportText += `  Range: ${WeaponRanges.getDisplayName ? WeaponRanges.getDisplayName(weapon.range) : weapon.range}\n`;
        
        exportText += `  Dice: `;
        if (weapon.dice?.[AttackDice.RED] > 0) {
          exportText += `${weapon.dice[AttackDice.RED]} Red, `;
        }
        if (weapon.dice?.[AttackDice.BLACK] > 0) {
          exportText += `${weapon.dice[AttackDice.BLACK]} Black, `;
        }
        if (weapon.dice?.[AttackDice.WHITE] > 0) {
          exportText += `${weapon.dice[AttackDice.WHITE]} White, `;
        }
        // Remove trailing comma and space
        exportText = exportText.replace(/,\s$/, '');
        exportText += `\n`;
        
        if (weapon.keywords?.length > 0) {
          exportText += `  Keywords: ${weapon.keywords.map(k => 
            WeaponKeywords.getDisplayName ? WeaponKeywords.getDisplayName(k) : k
          ).join(', ')}\n`;
        }
        
        exportText += `\n`;
      });
    }
    
    // ABILITIES
    if (abilities && abilities.length > 0) {
      exportText += `ABILITIES:\n`;
      exportText += `--------------------------------------------\n`;
      
      abilities.forEach(ability => {
        exportText += `- ${ability.name}\n`;
        exportText += `  ${ability.description || ''}\n`;
        
        if (ability.rulesText) {
          exportText += `  Rules: ${ability.rulesText}\n`;
        }
        
        if (ability.reminders?.length > 0) {
          exportText += `  Reminders:\n`;
          ability.reminders.forEach(reminder => {
            exportText += `    • ${reminder.text}`;
            if (reminder.condition) {
              exportText += ` (${reminder.condition})`;
            }
            exportText += `\n`;
          });
        }
        
        exportText += `\n`;
      });
    }
    
    // UPGRADES
    if (unit.upgradeSlots?.length > 0) {
      exportText += `UPGRADE SLOTS:\n`;
      exportText += `--------------------------------------------\n`;
      
      unit.upgradeSlots.forEach(slot => {
        const equippedUpgrades = upgrades.filter(u => slot.equippedUpgrades?.includes(u.id));
        
        exportText += `- ${UpgradeCardTypes.getDisplayName(slot.type)} (${slot.equippedUpgrades?.length || 0}/${slot.maxCount})\n`;
        
        if (equippedUpgrades.length > 0) {
          equippedUpgrades.forEach(upgrade => {
            exportText += `  • ${upgrade.name} (${upgrade.pointsCost || 0} pts)\n`;
            if (upgrade.description) {
              exportText += `    ${upgrade.description}\n`;
            }
          });
        }
        
        exportText += `\n`;
      });
    }
    
    // MINIATURE INFORMATION & NOTES
    if (unit.miniatures) {
      exportText += `MINIATURE INFORMATION:\n`;
      exportText += `--------------------------------------------\n`;
      exportText += unit.miniatures + `\n\n`;
    }
    
    if (unit.notes) {
      exportText += `NOTES:\n`;
      exportText += `--------------------------------------------\n`;
      exportText += unit.notes + `\n`;
    }
    
    return exportText;
  }
  
  /**
   * Creates a text export of a complete army with all unit details
   * @param {Object} army The army to export
   * @param {Array} unitDetails Array of unit details
   * @param {Array} customKeywords Array of custom keywords
   * @param {Array} upgrades Array of all upgrades
   * @param {Array} abilities Array of all abilities
   * @param {Array} customUnitTypes Array of custom unit types
   * @returns {String} Formatted text of army data
   */
  static exportArmy(army, unitDetails = [], customKeywords = [], upgrades = [], abilities = [], customUnitTypes = []) {
    if (!army) return '';
    
    let exportText = '';
    
    // HEADER SECTION
    exportText += `============================================\n`;
    exportText += `STAR WARS LEGION - ARMY ROSTER\n`;
    exportText += `============================================\n\n`;
    
    // ARMY INFO
    exportText += `${army.name?.toUpperCase() || 'UNNAMED ARMY'}\n`;
    exportText += `--------------------------------------------\n`;
    exportText += `Faction: ${Factions.getDisplayName(army.faction)}\n`;
    exportText += `Total Points: ${army.totalPoints || 0}\n`;
    exportText += `Total Units: ${unitDetails.length}\n\n`;
    
    if (army.description) {
      exportText += `DESCRIPTION:\n`;
      exportText += army.description + `\n\n`;
    }
    
    // UNIT SUMMARY
    exportText += `UNIT SUMMARY:\n`;
    exportText += `--------------------------------------------\n`;
    
    // Group units by type
    const unitsByType = {};
    
    unitDetails.forEach(unit => {
      const type = this.getTypeDisplayName(unit.type, customUnitTypes);
      
      if (!unitsByType[type]) {
        unitsByType[type] = [];
      }
      
      unitsByType[type].push(unit);
    });
    
    // Print units by type
    Object.entries(unitsByType).forEach(([type, units]) => {
      exportText += `${type} (${units.length}):\n`;
      
      units.forEach(unit => {
        // Calculate total points including upgrades
        let totalPoints = unit.points || 0;
        
        if (unit.upgradeSlots) {
          unit.upgradeSlots.forEach(slot => {
            slot.equippedUpgrades?.forEach(upgradeId => {
              const upgrade = upgrades.find(u => u.id === upgradeId);
              if (upgrade) {
                totalPoints += upgrade.pointsCost || 0;
              }
            });
          });
        }
        
        exportText += `- ${unit.name} (${totalPoints} pts)\n`;
      });
      
      exportText += `\n`;
    });
    
    // DETAILED UNIT INFORMATION
    exportText += `============================================\n`;
    exportText += `DETAILED UNIT INFORMATION\n`;
    exportText += `============================================\n\n`;
    
    // For each unit, get its abilities and upgrades
    unitDetails.forEach((unit, index) => {
      // Get unit abilities
      const unitAbilities = [];
      if (unit.abilities?.length > 0) {
        unit.abilities.forEach(abilityId => {
          const ability = abilities.find(a => a.id === abilityId);
          if (ability) {
            unitAbilities.push(ability);
          }
        });
      }
      
      // Get unit upgrades
      const unitUpgrades = [];
      if (unit.upgradeSlots) {
        unit.upgradeSlots.forEach(slot => {
          slot.equippedUpgrades?.forEach(upgradeId => {
            const upgrade = upgrades.find(u => u.id === upgradeId);
            if (upgrade) {
              unitUpgrades.push(upgrade);
            }
          });
        });
      }
      
      // Export unit details
      exportText += this.exportUnit(unit, customKeywords, unitUpgrades, unitAbilities, customUnitTypes);
      
      // Add separator between units
      if (index < unitDetails.length - 1) {
        exportText += `\n\n============================================\n\n`;
      }
    });
    
    return exportText;
  }
  
  // Helper methods
  
  /**
   * Gets the display name for a unit type, handling custom types
   */
  static getTypeDisplayName(type, customUnitTypes = []) {
    if (Object.values(UnitTypes).includes(type)) {
      return UnitTypes.getDisplayName(type);
    }
    const customType = customUnitTypes.find(t => t.name === type);
    return customType ? customType.displayName : type;
  }
  
  /**
   * Gets the display name for a keyword, handling custom keywords
   */
  static getKeywordDisplayName(keyword, customKeywords = []) {
    if (keyword.startsWith('custom:')) {
      const customId = keyword.replace('custom:', '');
      const customKeyword = customKeywords.find(k => k.id === customId);
      return customKeyword ? customKeyword.name : customId;
    }
    return Keywords.getDisplayName(keyword);
  }
  
  /**
   * Gets all keywords including those from upgrades
   */
  static getAllKeywords(unit, customKeywords = [], upgrades = []) {
      if (!unit) return [];

      // Use KeywordUtils to get all keywords with stacking applied
      return KeywordUtils.getAllKeywords(unit, upgrades);
  }
  
  /**
   * Gets all weapons including those from upgrades
   */
  static getAllWeapons(unit, upgrades = []) {
    if (!unit) return [];
    
    const baseWeapons = unit.weapons || [];
    const upgradeWeapons = [];
    
    unit.upgradeSlots?.forEach(slot => {
      slot.equippedUpgrades?.forEach(upgradeId => {
        const upgrade = upgrades.find(u => u.id === upgradeId);
        if (upgrade?.effects?.addWeapons?.length > 0) {
          upgrade.effects.addWeapons.forEach(weapon => {
            upgradeWeapons.push({
              ...weapon,
              source: upgrade.name
            });
          });
        }
      });
    });
    
    return [...baseWeapons.map(w => ({ ...w, source: 'Base Unit' })), ...upgradeWeapons];
  }
  
  /**
   * Creates a download of a text file
   * @param {String} content Text content to download
   * @param {String} fileName Name of the file
   */
  static downloadTextFile(content, fileName) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.download = fileName;
    link.href = url;
    link.click();
    
    // Clean up
    URL.revokeObjectURL(url);
  }
}