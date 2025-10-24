// src/utils/ArmyPointsCalculator.js
/**
 * Utility class for army points calculations
 */
class ArmyPointsCalculator {
    /**
     * Calculate the total points for an army including all units and their upgrades
     * 
     * @param {Array} unitDetails - Array of unit objects with full details
     * @param {Array} upgrades - Array of all upgrades in the system
     * @returns {number} - Total points for the army
     */
    static calculateArmyPoints(unitDetails, upgrades) {
        if (!unitDetails || unitDetails.length === 0) return 0;
        
        return unitDetails.reduce((total, unit) => {
            // Start with base unit points
            let unitPoints = unit.points || 0;
            
            // Add points from all equipped upgrades
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

    /**
     * Calculate the points for a single unit including all its upgrades
     * 
     * @param {Object} unit - The unit object
     * @param {Array} upgrades - Array of all upgrades in the system
     * @returns {number} - Total points for the unit including upgrades
     */
    static calculateUnitPoints(unit, upgrades) {
        if (!unit) return 0;
        
        // Start with base unit points
        let total = unit.points || 0;
        
        // Add points from all equipped upgrades
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
}

export default ArmyPointsCalculator;