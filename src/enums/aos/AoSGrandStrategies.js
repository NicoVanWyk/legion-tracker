const AoSGrandStrategies = {
    HOLD_THE_LINE: 'hold_the_line',
    SEVER_THE_HEAD: 'sever_the_head',
    DOMINATING_PRESENCE: 'dominating_presence',

    getDisplayName: (strategy) => {
        const names = {
            hold_the_line: 'Hold the Line',
            sever_the_head: 'Sever the Head',
            dominating_presence: 'Dominating Presence',
        };
        return names[strategy] || strategy;
    },

    getDescription: (strategy) => {
        const descriptions = {
            hold_the_line: 'At end of battle, have more units than your opponent',
            sever_the_head: 'Kill the Enemy General',
            dominating_presence: 'At the end of battle, control more objective tokens than your opponent',
        };
        return descriptions[strategy] || '';
    },

    getAllStrategies: () => {
        return Object.values(AoSGrandStrategies).filter(v => typeof v === 'string');
    }
};

export default AoSGrandStrategies;