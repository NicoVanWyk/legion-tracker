// src/enums/WeaponRanges.js
const WeaponRanges = Object.freeze({
  MELEE: 'melee',
  RANGE_1: 'range_1',
  RANGE_1_2: 'range_1_2',
  RANGE_1_3: 'range_1_3',
  RANGE_2_3: 'range_2_3',
  RANGE_2_4: 'range_2_4',
  RANGE_3_5: 'range_3_5',
  RANGE_1_4: 'range_1_4',
  RANGE_1_5: 'range_1_5',
  RANGE_3_4: 'range_3_4',
  RANGE_4_5: 'range_4_5',
  
  // For display purposes
  getDisplayName: function(range) {
    switch(range) {
      case this.MELEE: return 'Melee';
      case this.RANGE_1: return 'Range 1';
      case this.RANGE_1_2: return 'Range 1-2';
      case this.RANGE_1_3: return 'Range 1-3';
      case this.RANGE_2_3: return 'Range 2-3';
      case this.RANGE_2_4: return 'Range 2-4';
      case this.RANGE_3_5: return 'Range 3-5';
      case this.RANGE_1_4: return 'Range 1-4';
      case this.RANGE_1_5: return 'Range 1-5';
      case this.RANGE_3_4: return 'Range 3-4';
      case this.RANGE_4_5: return 'Range 4-5';
      default: return 'Unknown Range';
    }
  }
});

export default WeaponRanges;