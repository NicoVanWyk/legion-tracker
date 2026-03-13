// src/enums/aos/AoSPhases.js
const AoSPhases = {
    START_OF_TURN: 'start_of_turn',
    HERO: 'hero',
    MOVEMENT: 'movement',
    SHOOTING: 'shooting',
    CHARGE: 'charge',
    COMBAT: 'combat',
    END_OF_TURN: 'end_of_turn',
    ANY: 'any',
    DEPLOYMENT: 'deployment'
};

AoSPhases.getDisplayName = (phase) => {
    const names = {
        [AoSPhases.START_OF_TURN]: 'Start of Turn',
        [AoSPhases.HERO]: 'Hero Phase',
        [AoSPhases.MOVEMENT]: 'Movement Phase',
        [AoSPhases.SHOOTING]: 'Shooting Phase',
        [AoSPhases.CHARGE]: 'Charge Phase',
        [AoSPhases.COMBAT]: 'Combat Phase',
        [AoSPhases.END_OF_TURN]: 'End of Turn',
        [AoSPhases.ANY]: 'Any Phase',
        [AoSPhases.DEPLOYMENT]: 'Deployment'
    };
    return names[phase] || phase;
};

AoSPhases.getColor = (phase) => {
    const colors = {
        [AoSPhases.START_OF_TURN]: '#17a2b8',
        [AoSPhases.HERO]: '#6f42c1',
        [AoSPhases.MOVEMENT]: '#28a745',
        [AoSPhases.SHOOTING]: '#dc3545',
        [AoSPhases.CHARGE]: '#fd7e14',
        [AoSPhases.COMBAT]: '#e83e8c',
        [AoSPhases.END_OF_TURN]: '#20c997',
        [AoSPhases.ANY]: '#6c757d',
        [AoSPhases.DEPLOYMENT]: '#007bff'
    };
    return colors[phase] || '#6c757d';
};

export default AoSPhases;