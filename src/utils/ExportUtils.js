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
import AoSFactions from '../enums/aos/AoSFactions';
import AoSUnitTypes from '../enums/aos/AoSUnitTypes';
import GameSystems from '../enums/GameSystems';

export default class ExportUtils {
  
  static exportUnit(unit, customKeywords = [], upgrades = [], abilities = [], customUnitTypes = []) {
    if (!unit) return '';
    
    const isAoS = unit.gameSystem === GameSystems.AOS;
    const FactionEnum = isAoS ? AoSFactions : Factions;
    const TypeEnum = isAoS ? AoSUnitTypes : UnitTypes;
    
    let exportText = '';
    
    // HEADER SECTION
    exportText += `============================================\n`;
    exportText += `${isAoS ? 'AGE OF SIGMAR' : 'STAR WARS LEGION'} - UNIT CARD\n`;
    exportText += `============================================\n\n`;
    
    // BASIC INFO
    exportText += `${unit.name?.toUpperCase() || 'UNNAMED UNIT'}\n`;
    exportText += `--------------------------------------------\n`;
    exportText += `Faction: ${FactionEnum.getDisplayName(unit.faction)}\n`;
    exportText += `Type: ${this.getTypeDisplayName(unit.type, customUnitTypes, TypeEnum)}\n`;
    
    if (!isAoS) {
      exportText += `${unit.isVehicle ? 'Vehicle' : 'Trooper'}\n`;
    }
    exportText += `Points Cost: ${unit.points || 0}\n\n`;
    
    // STATS
    exportText += `STATS:\n`;
    exportText += `--------------------------------------------\n`;
    
    if (isAoS) {
      exportText += `Move: ${unit.move || 5}"\n`;
      exportText += `Health: ${unit.health || 1}\n`;
      exportText += `Save: ${unit.save || 4}+\n`;
      exportText += `Control: ${unit.control || 1}\n`;
      if (unit.ward) exportText += `Ward: ${unit.ward}+\n`;
      exportText += `Base Size: ${unit.baseSize || '32mm'}\n`;
      if (unit.reinforceable) exportText += `Reinforceable: Yes\n`;
    } else {
      exportText += `Wounds: ${unit.wounds || 1}\n`;
      
      if (unit.isVehicle) {
        exportText += `Resilience: ${unit.resilience === 0 ? '-' : unit.resilience}\n`;
      } else {
        exportText += `Courage: ${unit.courage === 0 ? '-' : unit.courage}\n`;
      }
      
      exportText += `Speed: ${unit.speed || 2}\n`;
      exportText += `Defense: ${unit.defense === 'white' ? 'White' : 'Red'}\n`;
      exportText += `Surge Tokens: ${unit.surgeAttack ? 'Attack' : 'No Attack'}, ${unit.surgeDefense ? 'Defense' : 'No Defense'}\n`;
    }
    
    exportText += `Models: ${unit.minModelCount || 1} (min) / ${unit.currentModelCount || 1} (current)\n\n`;

    // FACTION KEYWORDS (AoS)
    if (isAoS && unit.factionKeywords?.length > 0) {
      exportText += `FACTION KEYWORDS:\n`;
      exportText += `--------------------------------------------\n`;
      unit.factionKeywords.forEach(kw => {
        exportText += `- ${kw}\n`;
      });
      exportText += `\n`;
    }

    // KEYWORDS (Legion)
    if (!isAoS) {
      const allKeywords = this.getAllKeywords(unit, customKeywords, upgrades);
      if (allKeywords.length > 0) {
        exportText += `KEYWORDS:\n`;
        exportText += `--------------------------------------------\n`;
        allKeywords.forEach(keyword => {
          let keywordName = this.getKeywordDisplayName(keyword, customKeywords);
          const baseKeyword = KeywordUtils.getKeywordBase(keyword);
          const isBaseKeyword = unit.keywords?.some(k =>
            KeywordUtils.getKeywordBase(k) === baseKeyword
          );
          keywordName = isBaseKeyword ? keywordName : `${keywordName} (from upgrade)`;
          exportText += `- ${keywordName}\n`;
        });
        exportText += `\n`;
      }
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
        
        if (ability.effectText) {
          exportText += `  Effect: ${ability.effectText}\n`;
        }
        
        if (ability.rulesText) {
          exportText += `  Rules: ${ability.rulesText}\n`;
        }
        
        if (ability.abilityKeywords?.length > 0) {
          exportText += `  Keywords: ${ability.abilityKeywords.join(', ')}\n`;
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
    
    // UPGRADES (Legion only)
    if (!isAoS && unit.upgradeSlots?.length > 0) {
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
  
  static exportArmy(army, unitDetails = [], customKeywords = [], upgrades = [], abilities = [], customUnitTypes = [], commandCards = [], customContent = []) {
    if (!army) return '';
    
    const isAoS = army.gameSystem === GameSystems.AOS;
    const FactionEnum = isAoS ? AoSFactions : Factions;
    
    let exportText = '';
    
    // HEADER SECTION
    exportText += `============================================\n`;
    exportText += `${isAoS ? 'AGE OF SIGMAR' : 'STAR WARS LEGION'} - ARMY ROSTER\n`;
    exportText += `============================================\n\n`;
    
    // ARMY INFO
    exportText += `${army.name?.toUpperCase() || 'UNNAMED ARMY'}\n`;
    exportText += `--------------------------------------------\n`;
    exportText += `Faction: ${FactionEnum.getDisplayName(army.faction)}\n`;
    exportText += `Total Points: ${army.totalPoints || 0}\n`;
    exportText += `Total Units: ${unitDetails.length}\n\n`;
    
    if (army.description) {
      exportText += `DESCRIPTION:\n`;
      exportText += army.description + `\n\n`;
    }
    
    // REGIMENTS (AoS)
    if (isAoS && army.regiments && army.regiments.length > 0) {
      exportText += `=== REGIMENTS ===\n\n`;
      
      army.regiments.forEach((regiment, index) => {
        exportText += `REGIMENT ${index + 1}: ${regiment.name}\n`;
        exportText += '-'.repeat(50) + '\n';
        
        // Commander
        if (regiment.commander) {
          const commander = unitDetails.find(u => u.id === regiment.commander);
          if (commander) {
            exportText += `Commander: ${commander.name}\n`;
            
            const equipment = regiment.heroEquipment?.[regiment.commander];
            if (equipment) {
              if (equipment.heroicTrait) {
                const trait = customContent?.find(c => c.id === equipment.heroicTrait);
                if (trait) exportText += `  - Heroic Trait: ${trait.name}\n`;
              }
              if (equipment.artefact) {
                const art = customContent?.find(c => c.id === equipment.artefact);
                if (art) exportText += `  - Artefact: ${art.name}\n`;
              }
            }
          }
        }
        
        // Sub-commanders
        if (regiment.subCommanders && regiment.subCommanders.length > 0) {
          exportText += `\nSub-commanders:\n`;
          regiment.subCommanders.forEach(id => {
            const unit = unitDetails.find(u => u.id === id);
            if (unit) {
              exportText += `  - ${unit.name}\n`;
              
              const equipment = regiment.heroEquipment?.[id];
              if (equipment) {
                if (equipment.heroicTrait) {
                  const trait = customContent?.find(c => c.id === equipment.heroicTrait);
                  if (trait) exportText += `    * Heroic Trait: ${trait.name}\n`;
                }
                if (equipment.artefact) {
                  const art = customContent?.find(c => c.id === equipment.artefact);
                  if (art) exportText += `    * Artefact: ${art.name}\n`;
                }
              }
            }
          });
        }
        
        // Troops
        if (regiment.troops && regiment.troops.length > 0) {
          exportText += `\nTroops:\n`;
          regiment.troops.forEach(id => {
            const unit = unitDetails.find(u => u.id === id);
            if (unit) {
              exportText += `  - ${unit.name}`;
              if (unit.isReinforced) exportText += ` (Reinforced)`;
              exportText += `\n`;
            }
          });
        }
        
        // Regiment Ability
        if (regiment.regimentAbility) {
          const ability = customContent?.find(c => c.id === regiment.regimentAbility);
          if (ability) {
            exportText += `\nRegiment Ability: ${ability.name}\n`;
            if (ability.effectText) {
              exportText += `  ${ability.effectText}\n`;
            }
          }
        }
        
        exportText += '\n';
      });
    }

    // Auxiliary units (AoS)
    if (isAoS && army.auxiliaryUnits && army.auxiliaryUnits.length > 0) {
      exportText += '=== AUXILIARY UNITS ===\n\n';
      army.auxiliaryUnits.forEach(id => {
        const unit = unitDetails.find(u => u.id === id);
        if (unit) {
          exportText += `- ${unit.name}\n`;
        }
      });
      exportText += '\n';
    }
    
    // UNIT SUMMARY
    exportText += `UNIT SUMMARY:\n`;
    exportText += `--------------------------------------------\n`;
    
    const unitsByType = {};
    
    unitDetails.forEach(unit => {
      const TypeEnum = isAoS ? AoSUnitTypes : UnitTypes;
      const type = this.getTypeDisplayName(unit.type, customUnitTypes, TypeEnum);
      
      if (!unitsByType[type]) {
        unitsByType[type] = [];
      }
      
      unitsByType[type].push(unit);
    });
    
    Object.entries(unitsByType).forEach(([type, units]) => {
      exportText += `${type} (${units.length}):\n`;
      
      units.forEach(unit => {
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
    
    unitDetails.forEach((unit, index) => {
      const unitAbilities = [];
      if (unit.abilities?.length > 0) {
        unit.abilities.forEach(abilityId => {
          const ability = abilities.find(a => a.id === abilityId);
          if (ability) {
            unitAbilities.push(ability);
          }
        });
      }
      
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
      
      exportText += this.exportUnit(unit, customKeywords, unitUpgrades, unitAbilities, customUnitTypes);
      
      if (index < unitDetails.length - 1) {
        exportText += `\n\n============================================\n\n`;
      }
    });
    
    return exportText;
  }
  
  static getTypeDisplayName(type, customUnitTypes = [], TypeEnum = UnitTypes) {
    if (Object.values(TypeEnum).includes(type)) {
      return TypeEnum.getDisplayName(type);
    }
    const customType = customUnitTypes.find(t => t.name === type);
    return customType ? customType.displayName : type;
  }
  
  static getKeywordDisplayName(keyword, customKeywords = []) {
    if (keyword.startsWith('custom:')) {
      const customId = keyword.replace('custom:', '');
      const customKeyword = customKeywords.find(k => k.id === customId);
      return customKeyword ? customKeyword.name : customId;
    }
    return Keywords.getDisplayName(keyword);
  }
  
  static getAllKeywords(unit, customKeywords = [], upgrades = []) {
    if (!unit) return [];
    return KeywordUtils.getAllKeywords(unit, upgrades);
  }
  
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
  
  static downloadTextFile(content, fileName) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.download = fileName;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
  }
}