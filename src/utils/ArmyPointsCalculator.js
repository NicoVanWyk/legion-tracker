// src/utils/ArmyPointsCalculator.js
class ArmyPointsCalculator {
    static calculateArmyPoints(unitDetails, upgrades) {
        if (!unitDetails || unitDetails.length === 0) return 0;
        
        return unitDetails.reduce((total, unit) => {
            let unitPoints = unit.points || 0;
            
            if (unit.upgradeSlots) {
                unit.upgradeSlots.forEach(slot => {
                    if (slot.equippedUpgrades) {
                        slot.equippedUpgrades.forEach(upgradeId => {
                            const upgrade = upgrades.find(u => u.id === upgradeId);
                            if (upgrade) {
                                unitPoints += upgrade.pointsCost || 0;
                            }
                        });
                    }
                });
            }
            
            return total + unitPoints;
        }, 0);
    }

    static calculateUnitPoints(unit, upgrades) {
        if (!unit) return 0;
        
        let total = unit.points || 0;
        
        if (unit.upgradeSlots) {
            unit.upgradeSlots.forEach(slot => {
                if (slot.equippedUpgrades) {
                    slot.equippedUpgrades.forEach(upgradeId => {
                        const upgrade = upgrades.find(u => u.id === upgradeId);
                        if (upgrade) {
                            total += upgrade.pointsCost || 0;
                        }
                    });
                }
            });
        }
        
        return total;
    }

    static calculateRegimentPoints(regiment, units, content = []) {
        let total = 0;
        
        // Commander
        if (regiment.commander) {
            const unit = units.find(u => u.id === regiment.commander);
            if (unit) total += unit.points || 0;
        }
        
        // Sub-commanders
        (regiment.subCommanders || []).forEach(id => {
            const unit = units.find(u => u.id === id);
            if (unit) total += unit.points || 0;
        });
        
        // Troops
        (regiment.troops || []).forEach(id => {
            const unit = units.find(u => u.id === id);
            if (unit) total += unit.points || 0;
        });
        
        // Artefact costs from hero equipment
        Object.values(regiment.heroEquipment || {}).forEach(equipment => {
            if (equipment.artefact) {
                const artefact = content.find(c => c.id === equipment.artefact);
                if (artefact && artefact.pointsCost) {
                    total += artefact.pointsCost;
                }
            }
        });
        
        return total;
    }

    static calculateArmyPointsWithRegiments(army, units, content = []) {
        let total = 0;
        
        // Regiment points
        (army.regiments || []).forEach(regiment => {
            total += ArmyPointsCalculator.calculateRegimentPoints(regiment, units, content);
        });
        
        // Auxiliary unit points
        (army.auxiliaryUnits || []).forEach(id => {
            const unit = units.find(u => u.id === id);
            if (unit) total += unit.points || 0;
        });
        
        return total;
    }
}

export default ArmyPointsCalculator;