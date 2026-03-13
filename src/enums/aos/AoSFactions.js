// src/enums/aos/AoSFactions.js
const AoSFactions = {
    STORMCAST_ETERNALS: 'stormcast_eternals',
    NIGHTHAUNT: 'nighthaunt',
    DAUGHTERS_OF_KHAINE: 'daughters_of_khaine',
    IDONETH_DEEPKIN: 'idoneth_deepkin',
    LUMINETH_REALM_LORDS: 'lumineth_realm_lords',
    CITIES_OF_SIGMAR: 'cities_of_sigmar',
    FYRESLAYERS: 'fyreslayers',
    KHARADRON_OVERLORDS: 'kharadron_overlords',
    SERAPHON: 'seraphon',
    SYLVANETH: 'sylvaneth',
    GLOOMSPITE_GITZ: 'gloomspite_gitz',
    ORRUK_WARCLANS: 'orruk_warclans',
    SONS_OF_BEHEMAT: 'sons_of_behemat',
    OSSIARCH_BONEREAPERS: 'ossiarch_bonereapers',
    FLESH_EATER_COURTS: 'flesh_eater_courts',
    SOULBLIGHT_GRAVELORDS: 'soulblight_gravelords',
    BLADES_OF_KHORNE: 'blades_of_khorne',
    DISCIPLES_OF_TZEENTCH: 'disciples_of_tzeentch',
    HEDONITES_OF_SLAANESH: 'hedonites_of_slaanesh',
    MAGGOTKIN_OF_NURGLE: 'maggotkin_of_nurgle',
    SLAVES_TO_DARKNESS: 'slaves_to_darkness',
    BEASTS_OF_CHAOS: 'beasts_of_chaos',
    SKAVEN: 'skaven',
    HELSMITHS_OF_HASHUT: 'helsmiths_of_hashut'
};

AoSFactions.getDisplayName = (faction) => {
    const names = {
        [AoSFactions.STORMCAST_ETERNALS]: 'Stormcast Eternals',
        [AoSFactions.NIGHTHAUNT]: 'Nighthaunt',
        [AoSFactions.DAUGHTERS_OF_KHAINE]: 'Daughters of Khaine',
        [AoSFactions.IDONETH_DEEPKIN]: 'Idoneth Deepkin',
        [AoSFactions.LUMINETH_REALM_LORDS]: 'Lumineth Realm-lords',
        [AoSFactions.CITIES_OF_SIGMAR]: 'Cities of Sigmar',
        [AoSFactions.FYRESLAYERS]: 'Fyreslayers',
        [AoSFactions.KHARADRON_OVERLORDS]: 'Kharadron Overlords',
        [AoSFactions.SERAPHON]: 'Seraphon',
        [AoSFactions.SYLVANETH]: 'Sylvaneth',
        [AoSFactions.GLOOMSPITE_GITZ]: 'Gloomspite Gitz',
        [AoSFactions.ORRUK_WARCLANS]: 'Orruk Warclans',
        [AoSFactions.SONS_OF_BEHEMAT]: 'Sons of Behemat',
        [AoSFactions.OSSIARCH_BONEREAPERS]: 'Ossiarch Bonereapers',
        [AoSFactions.FLESH_EATER_COURTS]: 'Flesh-eater Courts',
        [AoSFactions.SOULBLIGHT_GRAVELORDS]: 'Soulblight Gravelords',
        [AoSFactions.BLADES_OF_KHORNE]: 'Blades of Khorne',
        [AoSFactions.DISCIPLES_OF_TZEENTCH]: 'Disciples of Tzeentch',
        [AoSFactions.HEDONITES_OF_SLAANESH]: 'Hedonites of Slaanesh',
        [AoSFactions.MAGGOTKIN_OF_NURGLE]: 'Maggotkin of Nurgle',
        [AoSFactions.SLAVES_TO_DARKNESS]: 'Slaves to Darkness',
        [AoSFactions.BEASTS_OF_CHAOS]: 'Beasts of Chaos',
        [AoSFactions.SKAVEN]: 'Skaven',
        [AoSFactions.HELSMITHS_OF_HASHUT]: 'Helsmiths of Hashut'
    };
    return names[faction] || faction;
};

AoSFactions.getColor = (faction) => {
    const colors = {
        [AoSFactions.STORMCAST_ETERNALS]: '#1e4d8b',
        [AoSFactions.OSSIARCH_BONEREAPERS]: '#8b8378',
        [AoSFactions.SKAVEN]: '#3a4a2d',
        [AoSFactions.NIGHTHAUNT]: '#2d3e50',
        [AoSFactions.DAUGHTERS_OF_KHAINE]: '#8b1e3f',
        [AoSFactions.IDONETH_DEEPKIN]: '#0d5e72',
        [AoSFactions.LUMINETH_REALM_LORDS]: '#c9a961',
        [AoSFactions.CITIES_OF_SIGMAR]: '#5a7d9a',
        [AoSFactions.FYRESLAYERS]: '#d4690f',
        [AoSFactions.KHARADRON_OVERLORDS]: '#6b8e9f',
        [AoSFactions.SERAPHON]: '#4a7c59',
        [AoSFactions.SYLVANETH]: '#3d5a3c',
        [AoSFactions.GLOOMSPITE_GITZ]: '#3d4d2c',
        [AoSFactions.ORRUK_WARCLANS]: '#4d5e3a',
        [AoSFactions.SONS_OF_BEHEMAT]: '#7a5c3d',
        [AoSFactions.FLESH_EATER_COURTS]: '#5c3d3d',
        [AoSFactions.SOULBLIGHT_GRAVELORDS]: '#3d1e1e',
        [AoSFactions.BLADES_OF_KHORNE]: '#8b1e1e',
        [AoSFactions.DISCIPLES_OF_TZEENTCH]: '#1e4d8b',
        [AoSFactions.HEDONITES_OF_SLAANESH]: '#8b1e8b',
        [AoSFactions.MAGGOTKIN_OF_NURGLE]: '#4d5e1e',
        [AoSFactions.SLAVES_TO_DARKNESS]: '#2d2d2d',
        [AoSFactions.BEASTS_OF_CHAOS]: '#5e3d1e',
        [AoSFactions.HELSMITHS_OF_HASHUT]: '#5e2d1e'
    };
    return colors[faction] || '#6c757d';
};

export default AoSFactions;