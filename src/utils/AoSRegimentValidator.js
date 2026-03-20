import AoSKeywords from '../enums/aos/AoSKeywords';

const AoSRegimentValidator = {
    validateRegiment: (regiment, units, content = [], isGeneralRegiment = false) => {
        const errors = [];
        const warnings = [];

        if (!regiment.commander) {
            errors.push('Regiment must have a commander');
        } else {
            const commander = units.find(u => u.id === regiment.commander);
            if (!commander) {
                errors.push('Commander unit not found');
            } else {
                if (!commander.keywords?.includes(AoSKeywords.HERO)) {
                    errors.push('Commander must have HERO keyword');
                }

                // Regiment of Renown validation
                if (commander.battleProfile?.isRegimentOfRenown) {
                    const requiredUnits = commander.battleProfile.requiredUnits || [];
                    const requiredAbility = commander.battleProfile.requiredRegimentAbility;

                    requiredUnits.forEach(requiredId => {
                        const isIncluded = regiment.units?.some(u => u.unitId === requiredId);
                        if (!isIncluded) {
                            const unit = units.find(u => u.id === requiredId);
                            errors.push(`Regiment of Renown missing required unit: ${unit?.name || requiredId}`);
                        }
                    });

                    if (requiredAbility && regiment.regimentAbility !== requiredAbility) {
                        const ability = content.find(c => c.id === requiredAbility);
                        errors.push(`Regiment of Renown missing required ability: ${ability?.name || 'specific ability'}`);
                    }
                }
            }
        }

        const maxSlots = isGeneralRegiment ? 4 : 3;
        const unitCount = (regiment.units || []).length;

        if (unitCount > maxSlots) {
            errors.push(`Maximum ${maxSlots} unit slots allowed`);
        }

        const commander = units.find(u => u.id === regiment.commander);
        const subCommanderCount = (regiment.units || []).filter(u => u.isSubCommander).length;

        if (subCommanderCount > 0) {
            if (!commander?.battleProfile?.allowsSubCommanders) {
                errors.push(`${commander?.name || 'Commander'} does not allow sub-commanders`);
            } else {
                const maxAllowed = commander.battleProfile.maxSubCommanders || 1;
                if (subCommanderCount > maxAllowed) {
                    errors.push(`${commander.name} allows max ${maxAllowed} sub-commander(s), has ${subCommanderCount}`);
                }
            }
        }

        (regiment.units || []).forEach(({unitId, isSubCommander}) => {
            const unit = units.find(u => u.id === unitId);

            if (!unit) {
                errors.push(`Unit not found: ${unitId}`);
                return;
            }

            if (isSubCommander) {
                if (!unit.keywords?.includes(AoSKeywords.HERO)) {
                    errors.push(`${unit.name} must be HERO to be sub-commander`);
                }
                if (!unit.battleProfile?.canSubCommander) {
                    errors.push(`${unit.name} cannot join as sub-commander`);
                }
            }

            if (commander?.battleProfile?.allowedKeywords?.length > 0) {
                // Derive faction keywords from existing unit fields
                const derivedFactionKeywords = [];

                // Add faction as keyword (e.g., "ossiarch_bonereapers" -> "OSSIARCH_BONEREAPERS")
                if (unit.faction) {
                    derivedFactionKeywords.push(unit.faction.toUpperCase().replace(/-/g, '_'));
                }

                // Add grand alliance
                if (unit.grandAlliance) {
                    derivedFactionKeywords.push(unit.grandAlliance);
                }

                // Add subfaction(s)
                if (Array.isArray(unit.subfaction)) {
                    derivedFactionKeywords.push(...unit.subfaction);
                } else if (unit.subfaction) {
                    derivedFactionKeywords.push(unit.subfaction);
                }

                // Combine all keywords for matching
                const unitKeywords = [
                    ...(unit.keywords || []),
                    ...derivedFactionKeywords
                ];

                const hasMatchingKeyword = unitKeywords.some(kw =>
                    commander.battleProfile.allowedKeywords.includes(kw)
                );

                if (!hasMatchingKeyword) {
                    errors.push(`${unit.name} not allowed in ${commander.name}'s regiment`);
                }
            } else {
                if (unit.keywords?.includes(AoSKeywords.HERO) && !isSubCommander) {
                    errors.push(`${unit.name} is a HERO but not marked as sub-commander`);
                }
            }
        });

        Object.entries(regiment.heroEquipment || {}).forEach(([unitId, equipment]) => {
            const unit = units.find(u => u.id === unitId);

            if (unit?.keywords?.includes(AoSKeywords.UNIQUE)) {
                if (equipment.artefact || equipment.heroicTrait) {
                    errors.push(`${unit.name} is UNIQUE and cannot receive enhancements`);
                }
            }

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

        return {valid: errors.length === 0, errors, warnings};
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

        const warmasterHeroes = units.filter(u =>
            u.keywords?.includes(AoSKeywords.WARMASTER)
        );
        if (warmasterHeroes.length > 0) {
            const general = units.find(u => u.id === army.generalUnitId);
            if (!general?.keywords?.includes(AoSKeywords.WARMASTER)) {
                errors.push('Army with WARMASTER heroes must have WARMASTER as general');
            }
        }

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

        const auxiliaryCount = army.auxiliaryUnits?.length || 0;
        if (auxiliaryCount > 0) {
            warnings.push(
                `${auxiliaryCount} auxiliary units - opponent gains +1 CP per round`
            );
        }

        return {valid: errors.length === 0, errors, warnings};
    }
};

export default AoSRegimentValidator;