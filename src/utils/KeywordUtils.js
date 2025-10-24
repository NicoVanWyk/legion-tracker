// src/utils/KeywordUtils.js
/**
 * Utility functions for handling keyword stacking and processing
 */
import Keywords from '../enums/Keywords';

const KeywordUtils = {
    /**
     * Process an array of keywords to combine stackable keywords
     * @param {Array} keywords - Array of keyword strings
     * @return {Array} - Processed array with stacked keywords combined
     */
    processStackableKeywords: (keywords = []) => {
        if (!keywords || keywords.length === 0) return [];

        // Create a map to track stackable keywords and their values
        const keywordMap = new Map();
        const nonStackableKeywords = [];

        // Regular expressions to match different keyword patterns:
        // 1. Keywords with numeric values: "guardian 1", "impact 2", etc.
        const numericPattern = /^([a-z_]+)\s+(\d+)$/i;

        // 2. Keywords with numeric values and colon: "guardian:1", "impact:2", etc.
        const colonNumericPattern = /^([a-z_]+):(\d+)$/i;

        // 3. Custom keywords
        const customPattern = /^custom:.+$/i;

        keywords.forEach(keyword => {
            // Skip custom keywords (they don't stack)
            if (customPattern.test(keyword)) {
                nonStackableKeywords.push(keyword);
                return;
            }

            // Check if keyword matches the numeric pattern (e.g., "guardian 1")
            let match = keyword.match(numericPattern);

            if (!match) {
                // If not, check if it matches the colon pattern (e.g., "guardian:1")
                match = keyword.match(colonNumericPattern);
            }

            if (match) {
                const [_, keywordBase, valueStr] = match;
                const value = parseInt(valueStr, 10);
                const normalizedBase = keywordBase.toLowerCase().trim();

                // Add the value to any existing value for this keyword
                const currentValue = keywordMap.get(normalizedBase) || 0;
                keywordMap.set(normalizedBase, currentValue + value);
            } else {
                // Keep non-stackable keywords
                nonStackableKeywords.push(keyword);
            }
        });

        // Build the final keyword array with stacked keywords
        const processedKeywords = [...nonStackableKeywords];

        // Add the stacked keywords using the space format (e.g., "Guardian 2")
        keywordMap.forEach((value, keywordBase) => {
            // Capitalize first letter for display
            const formattedBase = keywordBase.charAt(0).toUpperCase() + keywordBase.slice(1);
            processedKeywords.push(`${formattedBase} ${value}`);
        });

        return processedKeywords;
    },

    /**
     * Gets all keywords for a unit, including those from upgrades, with stacking applied
     * @param {Object} unit - The unit object
     * @param {Array} upgrades - Array of all available upgrade objects
     * @return {Array} - Combined and processed array of keywords
     */
    getAllKeywords: (unit, upgrades = []) => {
        if (!unit) return [];

        // Collect all keywords from unit and upgrades
        let allKeywords = [...(unit.keywords || [])];

        // Add keywords from equipped upgrades
        unit.upgradeSlots?.forEach(slot => {
            slot.equippedUpgrades?.forEach(upgradeId => {
                const upgrade = upgrades.find(u => u.id === upgradeId);
                if (upgrade?.effects?.addKeywords?.length > 0) {
                    allKeywords = [...allKeywords, ...upgrade.effects.addKeywords];
                }
            });
        });

        // Convert enum format keywords to display format before processing
        const convertedKeywords = allKeywords.map(keyword => {
            // Check if it's in WORD_NUMBER format
            const parts = keyword.split('_');
            if (parts.length === 2 && !isNaN(parts[1])) {
                // Use the display name function from Keywords enum
                return Keywords.getDisplayName(keyword);
            }
            return keyword;
        });

        // Apply stacking to converted keywords
        return KeywordUtils.processStackableKeywords(convertedKeywords);
    },

    /**
     * Checks if a keyword (possibly stacked) is from an upgrade
     * @param {String} keyword - The keyword to check
     * @param {Array} unitKeywords - The unit's base keywords
     * @return {Boolean} - True if keyword is from an upgrade
     */
    isKeywordFromUpgrade: (keyword, unitKeywords = []) => {
        if (!unitKeywords || unitKeywords.length === 0) return true;

        // Get base keyword (e.g., "guardian" from "Guardian 2")
        const baseKeyword = KeywordUtils.getKeywordBase(keyword);

        // Check if any of the unit keywords have the same base
        return !unitKeywords.some(unitKeyword => {
            return KeywordUtils.getKeywordBase(unitKeyword) === baseKeyword;
        });
    },

    /**
     * Extracts the base part of a keyword (without numeric value)
     * @param {String} keyword - Keyword to process
     * @return {String} - Base keyword or original if not stackable
     */
    getKeywordBase: (keyword) => {
        if (!keyword) return '';

        // Handle both formats: "Guardian 1" and "guardian:1"
        const spaceMatch = keyword.match(/^([a-z_]+)\s+\d+$/i);
        if (spaceMatch) {
            return spaceMatch[1].toLowerCase().trim();
        }

        const colonMatch = keyword.match(/^([a-z_]+):\d+$/i);
        if (colonMatch) {
            return colonMatch[1].toLowerCase().trim();
        }

        // Handle custom keywords
        if (keyword.startsWith('custom:')) {
            return keyword;
        }

        return keyword.toLowerCase().trim();
    },

    /**
     * Checks if two keywords have the same base (for stacking comparison)
     * @param {String} keyword1 - First keyword
     * @param {String} keyword2 - Second keyword
     * @return {Boolean} - True if keywords have the same base
     */
    hasSameBase: (keyword1, keyword2) => {
        return KeywordUtils.getKeywordBase(keyword1) === KeywordUtils.getKeywordBase(keyword2);
    }
};

export default KeywordUtils;