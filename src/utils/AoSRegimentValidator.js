// src/utils/AoSRegimentValidator.js
import AoSKeywords from '../enums/aos/AoSKeywords';

const AoSRegimentValidator = {
  validateRegiment: (regiment, units, content = [], isGeneralRegiment = false) => {
    const errors = [];
    const warnings = [];
    
    // 1. Commander validation - FIX: use AoSKeywords.HERO
    if (!regiment.commander) {
      errors.push('Regiment must have a commander');
    } else {
      const commander = units.find(u => u.id === regiment.commander);
      if (!commander) {
        errors.push('Commander unit not found');
      } else if (!commander.keywords?.includes(AoSKeywords.HERO)) {
        errors.push('Commander must have HERO keyword');
      }
    }
    
    // 2. Unit slot validation - FIX: 0-3 (or 0-4), reinforced = 1 slot
    const maxSlots = isGeneralRegiment ? 4 : 3;
    const unitCount = (regiment.units || []).length;
    
    if (unitCount > maxSlots) {
      errors.push(`Maximum ${maxSlots} unit slots allowed`);
    }
    // No minimum check - 0 units is legal
    
    // 3. Unit eligibility validation
    const commander = units.find(u => u.id === regiment.commander);
    (regiment.units || []).forEach(({unitId, isSubCommander}) => {
      const unit = units.find(u => u.id === unitId);
      
      if (!unit) {
        errors.push(`Unit not found: ${unitId}`);
        return;
      }
      
      // Sub-commander checks
      if (isSubCommander) {
        if (!unit.keywords?.includes(AoSKeywords.HERO)) {
          errors.push(`${unit.name} must be HERO to be sub-commander`);
        }
        if (!unit.battleProfile?.canSubCommander) {
          errors.push(`${unit.name} cannot join as sub-commander`);
        }
      }
      
      // Check against commander's battle profile
      if (commander?.battleProfile?.allowedKeywords?.length > 0) {
        const hasMatchingKeyword = unit.keywords?.some(kw =>
          commander.battleProfile.allowedKeywords.includes(kw)
        );
        if (!hasMatchingKeyword) {
          errors.push(`${unit.name} not allowed in ${commander.name}'s regiment`);
        }
      } else {
        // No battle profile - allow any non-HERO from same faction
        if (unit.keywords?.includes(AoSKeywords.HERO) && !isSubCommander) {
          errors.push(`${unit.name} is a HERO but not marked as sub-commander`);
        }
      }
    });
    
    // 4. Hero equipment validation
    Object.entries(regiment.heroEquipment || {}).forEach(([unitId, equipment]) => {
      const unit = units.find(u => u.id === unitId);
      
      // UNIQUE heroes cannot receive enhancements
      if (unit?.keywords?.includes(AoSKeywords.UNIQUE)) {
        if (equipment.artefact || equipment.heroicTrait) {
          errors.push(`${unit.name} is UNIQUE and cannot receive enhancements`);
        }
      }
      
      // Check keyword requirements
      if (equipment.artefact) {
        const artefact = content.find(c => c.id === equipment.artefact);
        if (artefact?.requiredKeywords) {
          artefact.requiredKeywords.forEach(req => {
            if (!unit?.keywords?.includes(req)) {
              errors.push(`${unit?.name} needs ${req} keyword for ${artefact.name}`);
            }
          });
        }
      }
      
      if (equipment.heroicTrait) {
        const trait = content.find(c => c.id === equipment.heroicTrait);
        if (trait?.requiredKeywords) {
          trait.requiredKeywords.forEach(req => {
            if (!unit?.keywords?.includes(req)) {
              warnings.push(`${unit?.name} may need ${req} keyword for ${trait.name}`);
            }
          });
        }
      }
    });
    
    return { valid: errors.length === 0, errors, warnings };
  },
  
  validateArmy: (army, units, content = []) => {
    const errors = [];
    const warnings = [];
    
    if (!army.regiments || army.regiments.length === 0) {
      warnings.push('Army has no regiments');
    }
    if (army.regiments?.length > 5) {
      errors.push('Maximum 5 regiments allowed');
    }
    
    // Enhancement limits
    const usedArtefacts = new Set();
    const usedTraits = new Set();
    let artefactCount = 0;
    let traitCount = 0;
    
    army.regiments?.forEach(regiment => {
      Object.values(regiment.heroEquipment || {}).forEach(equipment => {
        if (equipment.artefact) {
          if (usedArtefacts.has(equipment.artefact)) {
            errors.push('Same artefact used multiple times');
          }
          usedArtefacts.add(equipment.artefact);
          artefactCount++;
        }
        if (equipment.heroicTrait) {
          if (usedTraits.has(equipment.heroicTrait)) {
            errors.push('Same heroic trait used multiple times');
          }
          usedTraits.add(equipment.heroicTrait);
          traitCount++;
        }
      });
    });
    
    if (artefactCount > 1) {
      errors.push('Maximum 1 artefact per army');
    }
    if (traitCount > 1) {
      errors.push('Maximum 1 heroic trait per army');
    }
    
    // WARMASTER validation
    const warmasterHeroes = units.filter(u => 
      u.keywords?.includes(AoSKeywords.WARMASTER)
    );
    if (warmasterHeroes.length > 0) {
      const general = units.find(u => u.id === army.generalUnitId);
      if (!general?.keywords?.includes(AoSKeywords.WARMASTER)) {
        errors.push('Army with WARMASTER heroes must have WARMASTER as general');
      }
    }
    
    // Validate each regiment
    army.regiments?.forEach((regiment, index) => {
      const isGeneralRegiment = regiment.commander === army.generalUnitId;
      const validation = AoSRegimentValidator.validateRegiment(
        regiment, 
        units, 
        content,
        isGeneralRegiment
      );
      validation.errors.forEach(err => 
        errors.push(`Regiment ${index + 1}: ${err}`)
      );
      validation.warnings.forEach(warn => 
        warnings.push(`Regiment ${index + 1}: ${warn}`)
      );
    });
    
    // Auxiliary units
    const auxiliaryCount = army.auxiliaryUnits?.length || 0;
    if (auxiliaryCount > 0) {
      warnings.push(
        `${auxiliaryCount} auxiliary units - opponent gains +1 CP per round`
      );
    }
    
    return { valid: errors.length === 0, errors, warnings };
  }
};

export default AoSRegimentValidator;