// src/enums/GameSystems.js
const GameSystems = {
    LEGION: 'legion',
    AOS: 'aos'
};

GameSystems.getDisplayName = (system) => {
    const names = {
        [GameSystems.LEGION]: 'Star Wars: Legion',
        [GameSystems.AOS]: 'Warhammer: Age of Sigmar'
    };
    return names[system] || system;
};

GameSystems.getIcon = (system) => {
    const icons = {
        [GameSystems.LEGION]: 'bi-star-fill',
        [GameSystems.AOS]: 'bi-shield-fill'
    };
    return icons[system] || 'bi-controller';
};

export default GameSystems;