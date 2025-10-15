// src/utils/fileUtils.js

/**
 * Helper function to dynamically import all files from a given context
 * Works with webpack's require.context
 * @param {Object} context - The require.context object
 * @returns {Array} Array of objects with path and filename properties
 */
export function importAll(context) {
  // Extract faction from filename based on naming conventions
  // e.g., 'republic-officer.png' => 'republic'
  const getFaction = (filename) => {
    const factions = ['republic', 'separatist', 'rebel', 'empire'];
    for (const faction of factions) {
      if (filename.toLowerCase().startsWith(faction)) {
        return faction;
      }
    }
    return 'neutral';
  };

  // This transforms the require context into a useful array of objects
  const items = context.keys().map((key) => {
    // Get the full path to the image
    const path = context(key);
    
    // Extract filename without extension
    const filename = key.replace(/^.*[\\\/]/, '').replace(/\.\w+$/, '');
    
    // Create a formatted name (spaces instead of dashes, capitalized words)
    const name = filename
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    
    // Determine the faction based on filename
    const faction = getFaction(filename);
    
    return {
      path,
      filename,
      name,
      faction
    };
  });
  
  // Sort the items alphabetically by name
  return items.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Creates a placeholder array of image data for development
 * Use this function when require.context is not available (e.g., during testing)
 * @param {string} type - The type of placeholders to generate ('icons' or 'backgrounds')
 * @param {number} count - The number of placeholders to create
 * @returns {Array} Array of placeholder objects
 */
export function createPlaceholders(type, count = 12) {
  const factions = ['republic', 'separatist', 'rebel', 'empire', 'neutral'];
  
  return Array.from({ length: count }, (_, i) => {
    const faction = factions[i % factions.length];
    const index = Math.floor(i / factions.length) + 1;
    const name = `${faction.charAt(0).toUpperCase() + faction.slice(1)} ${type === 'icons' ? 'Icon' : 'Background'} ${index}`;
    
    return {
      path: `/${type}/${faction}-${index}.png`, // This is a fake path
      filename: `${faction}-${index}`,
      name,
      faction
    };
  });
}