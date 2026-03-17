const AoSFactionKeywords = {
  // Grand Alliances
  ORDER: 'ORDER',
  CHAOS: 'CHAOS',
  DEATH: 'DEATH',
  DESTRUCTION: 'DESTRUCTION',

  // Stormcast Eternals
  STORMCAST_ETERNALS: 'STORMCAST_ETERNALS',
  EXTREMIS_CHAMBER: 'EXTREMIS_CHAMBER',
  RUINATION_CHAMBER: 'RUINATION_CHAMBER',
  SACROSANCT_CHAMBER: 'SACROSANCT_CHAMBER',
  THE_BLACKTALONS: 'THE_BLACKTALONS',
  WARRIOR_CHAMBER: 'WARRIOR_CHAMBER',
  
  // Ossiarch Bonereapers
  OSSIARCH_BONEREAPERS: 'OSSIARCH_BONEREAPERS',
  MORTIS_PRAETORIANS: 'MORTIS_PRAETORIANS',
  PETRIFEX_ELITE: 'PETRIFEX_ELITE',
  STALLIARCH_LORDS: 'STALLIARCH_LORDS',
  IVORY_HOST: 'IVORY_HOST',
  NULL_MYRIAD: 'NULL_MYRIAD',
  CREMATORIANS: 'CREMATORIANS',

  getDisplayName: (keyword) => {
    const names = {
      ORDER: 'Order',
      CHAOS: 'Chaos',
      DEATH: 'Death',
      DESTRUCTION: 'Destruction',
      STORMCAST_ETERNALS: 'Stormcast Eternals',
      EXTREMIS_CHAMBER: 'Extremis Chamber',
      RUINATION_CHAMBER: 'Ruination Chamber',
      SACROSANCT_CHAMBER: 'Sacrosanct Chamber',
      THE_BLACKTALONS: 'The Blacktalons',
      WARRIOR_CHAMBER: 'Warrior Chamber',
      OSSIARCH_BONEREAPERS: 'Ossiarch Bonereapers',
      MORTIS_PRAETORIANS: 'Mortis Praetorians',
      PETRIFEX_ELITE: 'Petrifex Elite',
      STALLIARCH_LORDS: 'Stalliarch Lords',
      IVORY_HOST: 'Ivory Host',
      NULL_MYRIAD: 'Null Myriad',
      CREMATORIANS: 'Crematorians'
    };
    return names[keyword] || keyword.replace(/_/g, ' ');
  },

  getType: (keyword) => {
    const grandAlliances = ['ORDER', 'CHAOS', 'DEATH', 'DESTRUCTION'];
    const factions = ['STORMCAST_ETERNALS', 'OSSIARCH_BONEREAPERS'];

    if (grandAlliances.includes(keyword)) return 'GRAND_ALLIANCE';
    if (factions.includes(keyword)) return 'FACTION';
    return 'SUB_FACTION';
  },

  getColor: (keyword) => {
    const type = AoSFactionKeywords.getType(keyword);
    const colors = {
      GRAND_ALLIANCE: '#2c3e50',
      FACTION: '#3498db',
      SUB_FACTION: '#9b59b6',
      UNIVERSAL: '#95a5a6'
    };
    return colors[type] || '#6c757d';
  },

  getKeywordsByFaction: (faction) => {
    const stormcast = [
      'ORDER', 'STORMCAST_ETERNALS', 'EXTREMIS_CHAMBER', 'RUINATION_CHAMBER',
      'SACROSANCT_CHAMBER', 'THE_BLACKTALONS', 'WARRIOR_CHAMBER'
    ];
    const ossiarch = [
      'DEATH', 'OSSIARCH_BONEREAPERS', 'MORTIS_PRAETORIANS', 'PETRIFEX_ELITE',
      'STALLIARCH_LORDS', 'IVORY_HOST', 'NULL_MYRIAD', 'CREMATORIANS'
    ];

    if (faction === 'STORMCAST_ETERNALS') return stormcast;
    if (faction === 'OSSIARCH_BONEREAPERS') return ossiarch;
    return [];
  },

  getAllKeywords: () => {
    return Object.values(AoSFactionKeywords).filter(v => typeof v === 'string');
  }
};

export default AoSFactionKeywords;