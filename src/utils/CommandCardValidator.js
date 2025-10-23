// src/utils/CommandCardValidator.js
import CommandCards from '../enums/CommandCards';

/**
 * Utility functions for validating command card selections
 */
const CommandCardValidator = {
    /**
     * Validates a complete set of command cards
     * @param {Array} cardIds - Array of card IDs
     * @param {Array} commanders - Array of commander names (for validation)
     * @param {String} faction - Faction of the army
     * @returns {Object} Validation result
     */
    validateCommandCards: (cardIds, commanders, faction) => {
        const result = {
            valid: true,
            errors: [],
            warnings: [],
            counts: {
                total: cardIds.length,
                onePip: 0,
                twoPip: 0,
                threePip: 0,
                fourPip: 0,
                system: 0,
                custom: 0
            }
        };

        // Check if we have the correct number of cards
        if (cardIds.length !== 7) {
            result.valid = false;
            result.errors.push(`Army must have exactly 7 command cards (currently has ${cardIds.length})`);
        }

        // Get pip counts
        const systemCards = [];

        cardIds.forEach(cardId => {
            // Check if it's a system card
            if (CommandCards.getAllSystemCards().includes(cardId)) {
                systemCards.push(cardId);

                // Check faction requirement
                const cardFaction = CommandCards.getFaction(cardId);
                if (cardFaction && cardFaction !== faction) {
                    result.valid = false;
                    result.errors.push(`Card '${CommandCards.getDisplayName(cardId)}' requires ${cardFaction} faction`);
                }

                // Check commander requirement
                const requiredCommander = CommandCards.getCommanderRequirement(cardId);
                if (requiredCommander && !commanders.includes(requiredCommander)) {
                    result.valid = false;
                    result.errors.push(`Card '${CommandCards.getDisplayName(cardId)}' requires ${requiredCommander}`);
                }

                // Count by pips
                const pips = CommandCards.getPips(cardId);
                switch (pips) {
                    case 1:
                        result.counts.onePip++;
                        break;
                    case 2:
                        result.counts.twoPip++;
                        break;
                    case 3:
                        result.counts.threePip++;
                        break;
                    case 4:
                        result.counts.fourPip++;
                        break;
                }

                result.counts.system++;
            } else {
                // This is a custom card - in actual implementation, you'd check the card details
                // from Firestore to validate its commander requirement and pip count
                result.counts.custom++;
            }
        });

        // Check card distribution for system cards
        if (result.counts.onePip > 2) {
            result.valid = false;
            result.errors.push(`Too many 1-pip cards (max 2, has ${result.counts.onePip})`);
        }

        if (result.counts.twoPip > 2) {
            result.valid = false;
            result.errors.push(`Too many 2-pip cards (max 2, has ${result.counts.twoPip})`);
        }

        if (result.counts.threePip > 2) {
            result.valid = false;
            result.errors.push(`Too many 3-pip cards (max 2, has ${result.counts.threePip})`);
        }

        if (result.counts.fourPip > 1) {
            result.valid = false;
            result.errors.push(`Too many 4-pip cards (max 1, has ${result.counts.fourPip})`);
        }

        // Check for Standing Orders (required)
        if (!cardIds.includes(CommandCards.STANDING_ORDERS)) {
            result.valid = false;
            result.errors.push('Army must include the Standing Orders command card');
        }

        // Check for missing card slots
        if (result.counts.onePip < 2) {
            result.warnings.push(`Missing ${2 - result.counts.onePip} 1-pip card(s)`);
        }

        if (result.counts.twoPip < 2) {
            result.warnings.push(`Missing ${2 - result.counts.twoPip} 2-pip card(s)`);
        }

        if (result.counts.threePip < 2) {
            result.warnings.push(`Missing ${2 - result.counts.threePip} 3-pip card(s)`);
        }

        return result;
    },

    /**
     * Check if a specific card can be added to a command hand
     * @param {String} cardId - Card ID to check
     * @param {Array} currentCards - Current cards in the command hand
     * @param {Array} commanders - Array of commander names (for validation)
     * @param {String} faction - Faction of the army
     * @returns {Object} Validation result
     */
    canAddCard: (cardId, currentCards, commanders, faction) => {
        const result = {
            valid: true,
            errors: []
        };

        // Check if card is already in the hand
        if (currentCards.includes(cardId)) {
            result.valid = false;
            result.errors.push('Card is already in command hand');
            return result;
        }

        // Check if hand is already full
        if (currentCards.length >= 7) {
            result.valid = false;
            result.errors.push('Command hand is already full (7 cards maximum)');
            return result;
        }

        // For system cards
        if (CommandCards.getAllSystemCards().includes(cardId)) {
            // Check faction requirement
            const cardFaction = CommandCards.getFaction(cardId);
            if (cardFaction && cardFaction !== faction) {
                result.valid = false;
                result.errors.push(`Card requires ${cardFaction} faction`);
            }

            // Check commander requirement
            const requiredCommander = CommandCards.getCommanderRequirement(cardId);
            if (requiredCommander && !commanders.includes(requiredCommander)) {
                result.valid = false;
                result.errors.push(`Card requires ${requiredCommander}`);
            }

            // Check pip count
            const pips = CommandCards.getPips(cardId);
            const pipCounts = currentCards.reduce((counts, id) => {
                if (CommandCards.getAllSystemCards().includes(id)) {
                    const p = CommandCards.getPips(id);
                    counts[p] = (counts[p] || 0) + 1;
                }
                return counts;
            }, {});

            if ((pipCounts[pips] || 0) >= (pips === 4 ? 1 : 2)) {
                result.valid = false;
                result.errors.push(`Already have maximum number of ${pips}-pip cards`);
            }
        }

        return result;
    }
};

export default CommandCardValidator;