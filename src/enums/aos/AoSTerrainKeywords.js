// src/enums/aos/AoSTerrainKeywords.js
const AoSTerrainKeywords = {
    COVER: 'cover',
    OBSCURING: 'obscuring',
    IMPASSABLE: 'impassable',
    UNSTABLE: 'unstable',
    PLACE_OF_POWER: 'place_of_power'
};

AoSTerrainKeywords.getDisplayName = (keyword) => {
    const names = {
        [AoSTerrainKeywords.COVER]: 'Cover',
        [AoSTerrainKeywords.OBSCURING]: 'Obscuring',
        [AoSTerrainKeywords.IMPASSABLE]: 'Impassable',
        [AoSTerrainKeywords.UNSTABLE]: 'Unstable',
        [AoSTerrainKeywords.PLACE_OF_POWER]: 'Place of Power'
    };
    return names[keyword] || keyword;
};

AoSTerrainKeywords.getDescription = (keyword) => {
    const descriptions = {
        [AoSTerrainKeywords.COVER]: 'Subtract 1 from hit rolls for attacks made by shooting attacks that target a unit that is behind or on this terrain feature',
        [AoSTerrainKeywords.OBSCURING]: 'A unit cannot be targeted by shooting attacks if it is impossible to draw a straight line from a model in the attacking unit to a model in the target unit without that line passing across this terrain feature',
        [AoSTerrainKeywords.IMPASSABLE]: 'You cannot move a model over or through this terrain feature unless it can fly',
        [AoSTerrainKeywords.UNSTABLE]: 'Models cannot finish any type of move on this terrain feature',
        [AoSTerrainKeywords.PLACE_OF_POWER]: 'Heroes within 3" can activate this terrain to gain bonuses to casting and unbinding'
    };
    return descriptions[keyword] || '';
};

export default AoSTerrainKeywords;