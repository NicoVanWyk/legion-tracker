import AoSKeywords from '../enums/aos/AoSKeywords';
import AoSUnitTypes from '../enums/aos/AoSUnitTypes';

class RegimentRecommendationEngine {
    static scoreUnit(unit, commander, existingUnits = []) {
        let score = 0;
        const reasons = [];

        // Required keywords check (highest priority)
        if (commander.battleProfile?.allowedKeywords?.length > 0) {
            const hasRequired = commander.battleProfile.allowedKeywords.some(req =>
                unit.keywords?.includes(req) || unit.subfaction?.includes(req)
            );

            if (!hasRequired) {
                return {score: 0, reasons: ['Missing required keywords'], compatible: false};
            }

            score += 100;
            reasons.push('Meets regiment requirements');
        }

        // Subfaction synergy
        if (commander.subfaction && unit.subfaction) {
            const commanderSubs = Array.isArray(commander.subfaction) ? commander.subfaction : [commander.subfaction];
            const unitSubs = Array.isArray(unit.subfaction) ? unit.subfaction : [unit.subfaction];

            const hasMatch = commanderSubs.some(cs => unitSubs.includes(cs));
            if (hasMatch) {
                score += 50;
                reasons.push('Matching subfaction');
            }
        }

        // Speed compatibility (within 1" is good synergy)
        const speedDiff = Math.abs((unit.move || 0) - (commander.move || 0));
        if (speedDiff === 0) {
            score += 30;
            reasons.push('Perfect speed match');
        } else if (speedDiff <= 1) {
            score += 20;
            reasons.push('Similar speed');
        } else if (speedDiff <= 2) {
            score += 10;
            reasons.push('Compatible speed');
        } else if (speedDiff > 4) {
            score -= 10;
            reasons.push('Speed mismatch');
        }

        // Keyword synergies
        const commanderKeywords = commander.keywords || [];
        const unitKeywords = unit.keywords || [];

        if (commanderKeywords.includes(AoSKeywords.WIZARD) && unitKeywords.includes(AoSKeywords.WIZARD)) {
            score += 20;
            reasons.push('Wizard synergy');
        }

        if (commanderKeywords.includes(AoSKeywords.PRIEST) && unitKeywords.includes(AoSKeywords.PRIEST)) {
            score += 20;
            reasons.push('Priest synergy');
        }

        if (unitKeywords.includes(AoSKeywords.FLY) && commanderKeywords.includes(AoSKeywords.FLY)) {
            score += 15;
            reasons.push('Flying synergy');
        }

        // Role diversity bonus
        const hasBattleline = existingUnits.some(u => u.type === AoSUnitTypes.BATTLELINE);
        if (!hasBattleline && unit.type === AoSUnitTypes.BATTLELINE) {
            score += 40;
            reasons.push('Adds Battleline');
        }

        const hasOtherUnits = existingUnits.some(u => u.type === AoSUnitTypes.OTHER_UNITS);
        if (!hasOtherUnits && unit.type === AoSUnitTypes.OTHER_UNITS) {
            score += 25;
            reasons.push('Adds specialist unit');
        }

        // Point efficiency (prefer 100-300 pt units)
        const points = unit.points || 0;
        if (points >= 100 && points <= 300) {
            score += 15;
            reasons.push('Well-priced');
        } else if (points > 500) {
            score -= 10;
            reasons.push('High cost');
        }

        // Reinforceable units bonus
        if (unit.reinforceable) {
            score += 10;
            reasons.push('Can be reinforced');
        }

        return {score, reasons, compatible: score > 0};
    }

    static recommendUnits(commander, availableUnits, existingUnitIds = [], maxResults = 10) {
        if (!commander) return [];

        const existingUnits = availableUnits.filter(u => existingUnitIds.includes(u.id));

        const recommendations = availableUnits
            .filter(u => !u.keywords?.includes(AoSKeywords.HERO)) // No heroes as regular units
            .map(unit => ({
                unit,
                ...this.scoreUnit(unit, commander, existingUnits)
            }))
            .filter(rec => rec.compatible)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults);

        return recommendations;
    }

    static recommendSubCommanders(commander, availableHeroes) {
        if (!commander?.battleProfile?.allowsSubCommanders) {
            return [];
        }

        return availableHeroes
            .filter(hero =>
                hero.keywords?.includes(AoSKeywords.HERO) &&
                hero.battleProfile?.canSubCommander &&
                hero.id !== commander.id
            )
            .map(hero => {
                let score = 50; // Base score for being eligible
                const reasons = ['Can sub-command'];

                // Check keyword compatibility
                if (commander.battleProfile?.allowedKeywords?.length > 0) {
                    const hasRequired = commander.battleProfile.allowedKeywords.some(req =>
                        hero.keywords?.includes(req)
                    );

                    if (hasRequired) {
                        score += 50;
                        reasons.push('Meets requirements');
                    } else {
                        return null; // Ineligible
                    }
                }

                // Speed match
                if (hero.move === commander.move) {
                    score += 20;
                    reasons.push('Matching speed');
                }

                return {unit: hero, score, reasons, compatible: true};
            })
            .filter(Boolean)
            .sort((a, b) => b.score - a.score);
    }
}

export default RegimentRecommendationEngine;