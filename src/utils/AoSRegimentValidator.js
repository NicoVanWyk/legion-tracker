import AoSFactionKeywords from '../enums/aos/AoSFactionKeywords';

const AoSRegimentValidator = {
  validateRegiment: (regiment, units, content = []) => {
    const errors = [];
    const warnings = [];
    
    // Commander validation
    if (!regiment.commander) {
      errors.push('Regiment must have a commander');
    } else {
      const commander = units.find(u => u.id === regiment.commander);
      if (!commander) {
        errors.push('Commander unit not found');
      } else if (!commander.factionKeywords?.includes(AoSFactionKeywords.HERO)) {
        errors.push('Commander must have HERO keyword');
      }
    }
    
    // Sub-commanders validation
    if (regiment.subCommanders?.length > 2) {
      errors.push('Maximum 2 sub-commanders allowed');
    }
    
    regiment.subCommanders?.forEach(id => {
      const unit = units.find(u => u.id === id);
      if (!unit) {
        errors.push(`Sub-commander unit not found: ${id}`);
      } else if (!unit.factionKeywords?.includes(AoSFactionKeywords.HERO)) {
        errors.push(`${unit.name} must have HERO keyword to be a sub-commander`);
      }
    });
    
    // Troops validation
    const troopSlots = regiment.troops?.reduce((total, id) => {
      const unit = units.find(u => u.id === id);
      return total + (unit?.isReinforced ? 2 : 1);
    }, 0) || 0;
    
    if (troopSlots < 2) errors.push('Minimum 2 troop slots required');
    if (troopSlots > 5) errors.push('Maximum 5 troop slots allowed');
    
    // Hero equipment validation
    Object.entries(regiment.heroEquipment || {}).forEach(([unitId, equipment]) => {
      const unit = units.find(u => u.id === unitId);
      
      if (equipment.artefact) {
        const artefact = content.find(c => c.id === equipment.artefact);
        if (artefact?.restrictions) {
          artefact.restrictions.forEach(req => {
            if (!unit?.factionKeywords?.includes(req)) {
              errors.push(`${unit?.name} needs ${req} keyword for ${artefact.name}`);
            }
          });
        }
      }
      
      if (equipment.heroicTrait) {
        const trait = content.find(c => c.id === equipment.heroicTrait);
        if (trait?.restrictions) {
          trait.restrictions.forEach(req => {
            if (!unit?.factionKeywords?.includes(req)) {
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
    
    army.regiments?.forEach((regiment, index) => {
      const validation = AoSRegimentValidator.validateRegiment(regiment, units, content);
      validation.errors.forEach(err => errors.push(`Regiment ${index + 1}: ${err}`));
      validation.warnings.forEach(warn => warnings.push(`Regiment ${index + 1}: ${warn}`));
    });
    
    return { valid: errors.length === 0, errors, warnings };
  }
};

export default AoSRegimentValidator;