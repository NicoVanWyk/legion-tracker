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
  VANGUARD_CHAMBER: 'VANGUARD_CHAMBER',
  IDONETH_DEEPKIN: 'IDONETH_DEEPKIN',
  
  // Ossiarch Bonereapers
  OSSIARCH_BONEREAPERS: 'OSSIARCH_BONEREAPERS',
  MORTISAN: 'MORTISAN',
  MORTIS_PRAETORIANS: 'MORTIS_PRAETORIANS',
  KAINANS_REAPERS: 'KAINANS_REAPERS',
  PETRIFEX_ELITE: 'PETRIFEX_ELITE',
  STALLIARCH_LORDS: 'STALLIARCH_LORDS',
  IVORY_HOST: 'IVORY_HOST',
  NULL_MYRIAD: 'NULL_MYRIAD',
  CREMATORIANS: 'CREMATORIANS',

  // Daughters Of Khaine
  DAUGHTERS_OF_KHAINE: 'DAUGHTERS_OF_KHAINE',
  MELUSAI: 'MELUSAI',
  AELF: 'AELF',
  CAULDRON_OF_BLOOD: 'CAULDRON_OF_BLOOD',

  // Daughters Of Khaine
  SKAVEN: 'SKAVEN',
  MASTERCLAN: 'MASTERCLAN',
  SKRYRE: 'SKRYRE',
  VERMINUS: 'VERMINUS',
  MOULDER: 'MOULDER',

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
      VANGUARD_CHAMBER: 'Vanguard Chamber',
      IDONETH_DEEPKIN: 'Idoneth Deepkin',
      OSSIARCH_BONEREAPERS: 'Ossiarch Bonereapers',
      MORTISAN: 'Mortisan',
      MORTIS_PRAETORIANS: 'Mortis Praetorians',
      PETRIFEX_ELITE: 'Petrifex Elite',
      KAINANS_REAPERS: "Kainan's Reapers",
      STALLIARCH_LORDS: 'Stalliarch Lords',
      IVORY_HOST: 'Ivory Host',
      NULL_MYRIAD: 'Null Myriad',
      CREMATORIANS: 'Crematorians',
      DAUGHTERS_OF_KHAINE: 'Daughters Of Khaine',
      MELUSAI: 'Melusai',
      AELF: 'Aelf',
      CAULDRON_OF_BLOOD: 'Cauldron Of Blood',
      SKAVEN: 'Skaven',
      MASTERCLAN: 'Masterclan',
      SKRYRE: 'Skryre',
      VERMINUS: 'Verminus',
      MOULDER: 'Moulder',
    };
    return names[keyword] || keyword.replace(/_/g, ' ');
  },

  getType: (keyword) => {
    const grandAlliances = ['ORDER', 'CHAOS', 'DEATH', 'DESTRUCTION'];
    const factions = ['STORMCAST_ETERNALS', 'OSSIARCH_BONEREAPERS', 'DAUGHTERS_OF_KHAINE', 'SKAVEN'];

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
      'SACROSANCT_CHAMBER', 'THE_BLACKTALONS', 'WARRIOR_CHAMBER', 'VANGUARD_CHAMBER',
      'IDONETH_DEEPKIN'
    ];
    const ossiarch = [
      'DEATH', 'OSSIARCH_BONEREAPERS', 'MORTISAN', 'MORTIS_PRAETORIANS', 'PETRIFEX_ELITE',
      'STALLIARCH_LORDS', 'IVORY_HOST', 'NULL_MYRIAD', 'CREMATORIANS', 'KAINANS_REAPERS',
    ];
    const daughtersOfKhaine = [
      'ORDER', 'DAUGHTERS_OF_KHAINE', 'MELUSAI', 'AELF', 'CAULDRON_OF_BLOOD',
    ];
    const skaven = [
      'CHAOS', 'SKAVEN', 'MASTERCLAN', 'SKRYRE', 'VERMINUS', 'MOULDER',
    ];

    // AoSFactions values are lowercase (e.g. 'daughters_of_khaine') —
    // normalise to uppercase so both formats match.
    const key = String(faction).toUpperCase();

    if (key === 'STORMCAST_ETERNALS') return stormcast;
    if (key === 'OSSIARCH_BONEREAPERS') return ossiarch;
    if (key === 'DAUGHTERS_OF_KHAINE') return daughtersOfKhaine;
    if (key === 'SKAVEN') return skaven;
    return [];
  },

  getAllKeywords: () => {
    return Object.values(AoSFactionKeywords).filter(v => typeof v === 'string');
  }
};

export default AoSFactionKeywords;