// src/enums/aos/AoSGrandAlliances.js
const AoSGrandAlliances = {
    ORDER: 'order',
    CHAOS: 'chaos',
    DEATH: 'death',
    DESTRUCTION: 'destruction'
};

AoSGrandAlliances.getDisplayName = (alliance) => {
    const names = {
        [AoSGrandAlliances.ORDER]: 'Order',
        [AoSGrandAlliances.CHAOS]: 'Chaos',
        [AoSGrandAlliances.DEATH]: 'Death',
        [AoSGrandAlliances.DESTRUCTION]: 'Destruction'
    };
    return names[alliance] || alliance;
};

AoSGrandAlliances.getColor = (alliance) => {
    const colors = {
        [AoSGrandAlliances.ORDER]: '#3498db',
        [AoSGrandAlliances.CHAOS]: '#e74c3c',
        [AoSGrandAlliances.DEATH]: '#8e44ad',
        [AoSGrandAlliances.DESTRUCTION]: '#27ae60'
    };
    return colors[alliance] || '#95a5a6';
};

export default AoSGrandAlliances;