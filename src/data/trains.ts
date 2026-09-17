import { Train } from '../types/Train';

/**
 * Mock train dataset with complete stop sequences for the Konkan corridor.
 * Each train contains its FULL route — not just source/destination.
 * The search engine generates multiple journey options from a single train's
 * actual stops[], so never duplicate a train entry for different destinations.
 *
 * Running days use JS Date.getDay() convention: 0 = Sunday, 1 = Monday … 6 = Saturday.
 *
 * Timetable reference: September 2026 monsoon schedule.
 */
export const TRAINS: Train[] = [
  // ─────────────────────────────────────────────
  // 1. Matsyagandha Express — LTT → Mangaluru
  //    Daily · Stops at KKW, SWV, THVM, KRMI, MAO on the way
  // ─────────────────────────────────────────────
  {
    id: '12619',
    trainNumber: '12619',
    name: 'Matsyagandha Express',
    sourceStationCode: 'LTT',
    destinationStationCode: 'MAQ',
    runningDays: [1, 2, 3, 4, 5, 6, 0], // Daily
    type: 'Express',
    stops: [
      { stationCode: 'LTT',  sequence: 1,  departureTime: '15:20', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2,  arrivalTime: '16:30', departureTime: '16:35', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 3,  arrivalTime: '17:55', departureTime: '18:00', dayOffset: 0 },
      { stationCode: 'CHI',  sequence: 4,  arrivalTime: '20:05', departureTime: '20:10', dayOffset: 0 },
      { stationCode: 'RN',   sequence: 5,  arrivalTime: '22:00', departureTime: '22:10', dayOffset: 0 },
      { stationCode: 'KKW',  sequence: 6,  arrivalTime: '01:30', departureTime: '01:32', dayOffset: 1 },
      // Note: 12619 does NOT stop at SWV per current timetable
      { stationCode: 'KUDL', sequence: 7,  arrivalTime: '02:15', departureTime: '02:17', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 8,  arrivalTime: '03:20', departureTime: '03:22', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 9,  arrivalTime: '03:45', departureTime: '03:47', dayOffset: 1 },
      { stationCode: 'MAO',  sequence: 10, arrivalTime: '04:10', departureTime: '04:20', dayOffset: 1 },
      { stationCode: 'CNO',  sequence: 11, arrivalTime: '05:10', departureTime: '05:12', dayOffset: 1 },
      { stationCode: 'KAWR', sequence: 12, arrivalTime: '06:00', departureTime: '06:05', dayOffset: 1 },
      { stationCode: 'MAQ',  sequence: 13, arrivalTime: '08:00', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 2. Mandovi Express — CSMT → Madgaon
  //    Daily · Stops at KKW, KUDL, SWV, PER, THVM, KRMI, MAO
  // ─────────────────────────────────────────────
  {
    id: '10103',
    trainNumber: '10103',
    name: 'Mandovi Express',
    sourceStationCode: 'CSMT',
    destinationStationCode: 'MAO',
    runningDays: [1, 2, 3, 4, 5, 6, 0],
    type: 'Express',
    stops: [
      { stationCode: 'CSMT', sequence: 1,  departureTime: '07:10', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2,  arrivalTime: '08:40', departureTime: '08:50', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 3,  arrivalTime: '10:05', departureTime: '10:07', dayOffset: 0 },
      { stationCode: 'CHI',  sequence: 4,  arrivalTime: '12:25', departureTime: '12:30', dayOffset: 0 },
      { stationCode: 'RN',   sequence: 5,  arrivalTime: '14:35', departureTime: '14:45', dayOffset: 0 },
      { stationCode: 'KKW',  sequence: 6,  arrivalTime: '17:35', departureTime: '17:37', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 7,  arrivalTime: '18:25', departureTime: '18:27', dayOffset: 0 },
      { stationCode: 'SWV',  sequence: 8,  arrivalTime: '19:10', departureTime: '19:12', dayOffset: 0 },
      { stationCode: 'PER',  sequence: 9,  arrivalTime: '20:00', departureTime: '20:02', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 10, arrivalTime: '20:40', departureTime: '20:45', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 11, arrivalTime: '21:15', departureTime: '21:17', dayOffset: 0 },
      { stationCode: 'MAO',  sequence: 12, arrivalTime: '21:50', dayOffset: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 3. Jan Shatabdi Express — CSMT → Madgaon
  //    CORRECTED: Daily (not Mon–Sat); added KUDL stop
  // ─────────────────────────────────────────────
  {
    id: '12051',
    trainNumber: '12051',
    name: 'Jan Shatabdi Express',
    sourceStationCode: 'CSMT',
    destinationStationCode: 'MAO',
    runningDays: [1, 2, 3, 4, 5, 6, 0], // CORRECTED: Daily
    type: 'Express',
    stops: [
      { stationCode: 'CSMT', sequence: 1,  departureTime: '05:25', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2,  arrivalTime: '06:42', departureTime: '06:44', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 3,  arrivalTime: '08:02', departureTime: '08:04', dayOffset: 0 },
      { stationCode: 'CHI',  sequence: 4,  arrivalTime: '10:00', departureTime: '10:02', dayOffset: 0 },
      { stationCode: 'RN',   sequence: 5,  arrivalTime: '11:50', departureTime: '11:55', dayOffset: 0 },
      { stationCode: 'KKW',  sequence: 6,  arrivalTime: '14:15', departureTime: '14:17', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 7,  arrivalTime: '15:05', departureTime: '15:07', dayOffset: 0 }, // CORRECTED: added KUDL
      { stationCode: 'SWV',  sequence: 8,  arrivalTime: '15:52', departureTime: '15:54', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 9,  arrivalTime: '16:45', departureTime: '16:47', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 10, arrivalTime: '17:15', departureTime: '17:17', dayOffset: 0 },
      { stationCode: 'MAO',  sequence: 11, arrivalTime: '17:50', dayOffset: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 4. Vande Bharat Express — CSMT → Madgaon
  //    CORRECTED: Mon/Wed/Fri only; 05:25 dep; no SWV stop
  // ─────────────────────────────────────────────
  {
    id: '22229',
    trainNumber: '22229',
    name: 'Vande Bharat Express',
    sourceStationCode: 'CSMT',
    destinationStationCode: 'MAO',
    runningDays: [1, 3, 5], // CORRECTED: Mon/Wed/Fri (monsoon 2026 schedule)
    type: 'VandeBharat',
    stops: [
      { stationCode: 'CSMT', sequence: 1, departureTime: '05:25', dayOffset: 0 }, // CORRECTED departure
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '06:25', departureTime: '06:27', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '07:28', departureTime: '07:30', dayOffset: 0 },
      { stationCode: 'RN',   sequence: 4, arrivalTime: '10:40', departureTime: '10:45', dayOffset: 0 },
      { stationCode: 'KKW',  sequence: 5, arrivalTime: '12:35', departureTime: '12:37', dayOffset: 0 },
      // Note: Vande Bharat does NOT stop at SWV per monsoon 2026 timetable
      { stationCode: 'THVM', sequence: 6, arrivalTime: '13:55', departureTime: '13:57', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 7, arrivalTime: '14:25', departureTime: '14:27', dayOffset: 0 },
      { stationCode: 'MAO',  sequence: 8, arrivalTime: '16:00', dayOffset: 0 }, // CORRECTED arrival
    ],
  },

  // ─────────────────────────────────────────────
  // 5. Goa Express — NZM → Vasco da Gama
  //    Daily · Stops at KKW, SWV, PER, THVM, KRMI, MAO, VSG
  // ─────────────────────────────────────────────
  {
    id: '12779',
    trainNumber: '12779',
    name: 'Goa Express',
    sourceStationCode: 'NZM',
    destinationStationCode: 'VSG',
    runningDays: [1, 2, 3, 4, 5, 6, 0],
    type: 'Express',
    stops: [
      { stationCode: 'NZM',  sequence: 1,  departureTime: '15:00', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2,  arrivalTime: '09:35', departureTime: '09:45', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 3,  arrivalTime: '11:00', departureTime: '11:02', dayOffset: 1 },
      { stationCode: 'CHI',  sequence: 4,  arrivalTime: '12:55', departureTime: '13:00', dayOffset: 1 },
      { stationCode: 'RN',   sequence: 5,  arrivalTime: '14:50', departureTime: '15:00', dayOffset: 1 },
      { stationCode: 'KKW',  sequence: 6,  arrivalTime: '17:40', departureTime: '17:42', dayOffset: 1 },
      { stationCode: 'SWV',  sequence: 7,  arrivalTime: '18:35', departureTime: '18:37', dayOffset: 1 },
      { stationCode: 'PER',  sequence: 8,  arrivalTime: '19:27', departureTime: '19:29', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 9,  arrivalTime: '20:05', departureTime: '20:10', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 10, arrivalTime: '20:40', departureTime: '20:42', dayOffset: 1 },
      { stationCode: 'MAO',  sequence: 11, arrivalTime: '21:15', departureTime: '21:30', dayOffset: 1 },
      { stationCode: 'SVDEM',sequence: 12, arrivalTime: '22:00', departureTime: '22:02', dayOffset: 1 },
      { stationCode: 'VSG',  sequence: 13, arrivalTime: '23:30', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 6. Netravati Express — LTT → Thiruvananthapuram
  //    Daily · Stops at KKW, THVM, KRMI, MAO (no SWV per timetable)
  // ─────────────────────────────────────────────
  {
    id: '16345',
    trainNumber: '16345',
    name: 'Netravati Express',
    sourceStationCode: 'LTT',
    destinationStationCode: 'TVC',
    runningDays: [1, 2, 3, 4, 5, 6, 0],
    type: 'Express',
    stops: [
      { stationCode: 'LTT',  sequence: 1,  departureTime: '11:25', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2,  arrivalTime: '12:27', departureTime: '12:30', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 3,  arrivalTime: '13:45', departureTime: '13:47', dayOffset: 0 },
      { stationCode: 'RN',   sequence: 4,  arrivalTime: '18:20', departureTime: '18:30', dayOffset: 0 },
      { stationCode: 'KKW',  sequence: 5,  arrivalTime: '21:05', departureTime: '21:07', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 6,  arrivalTime: '21:55', departureTime: '21:57', dayOffset: 0 },
      // Note: Netravati does NOT stop at SWV per timetable
      { stationCode: 'THVM', sequence: 7,  arrivalTime: '23:22', departureTime: '23:25', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 8,  arrivalTime: '23:55', departureTime: '23:57', dayOffset: 0 },
      { stationCode: 'MAO',  sequence: 9,  arrivalTime: '00:30', departureTime: '00:40', dayOffset: 1 },
      { stationCode: 'CNO',  sequence: 10, arrivalTime: '01:30', departureTime: '01:32', dayOffset: 1 },
      { stationCode: 'KAWR', sequence: 11, arrivalTime: '02:20', departureTime: '02:25', dayOffset: 1 },
      { stationCode: 'MAQ',  sequence: 12, arrivalTime: '05:30', departureTime: '05:35', dayOffset: 1 },
      { stationCode: 'TVC',  sequence: 13, arrivalTime: '18:00', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 7. Mangala Lakshadweep Express — NZM → Ernakulam
  //    Daily · Stops at KKW, SWV, PER, THVM, KRMI, MAO
  // ─────────────────────────────────────────────
  {
    id: '12617',
    trainNumber: '12617',
    name: 'Mangala Lakshadweep Express',
    sourceStationCode: 'NZM',
    destinationStationCode: 'ERS',
    runningDays: [1, 2, 3, 4, 5, 6, 0],
    type: 'Express',
    stops: [
      { stationCode: 'NZM',  sequence: 1,  departureTime: '08:10', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2,  arrivalTime: '01:50', departureTime: '01:55', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 3,  arrivalTime: '03:10', departureTime: '03:15', dayOffset: 1 },
      { stationCode: 'CHI',  sequence: 4,  arrivalTime: '05:00', departureTime: '05:05', dayOffset: 1 },
      { stationCode: 'RN',   sequence: 5,  arrivalTime: '07:05', departureTime: '07:20', dayOffset: 1 },
      { stationCode: 'KKW',  sequence: 6,  arrivalTime: '09:50', departureTime: '09:52', dayOffset: 1 },
      { stationCode: 'SWV',  sequence: 7,  arrivalTime: '10:45', departureTime: '10:47', dayOffset: 1 },
      { stationCode: 'PER',  sequence: 8,  arrivalTime: '11:35', departureTime: '11:37', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 9,  arrivalTime: '12:05', departureTime: '12:07', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 10, arrivalTime: '12:33', departureTime: '12:35', dayOffset: 1 },
      { stationCode: 'MAO',  sequence: 11, arrivalTime: '13:05', departureTime: '13:15', dayOffset: 1 },
      { stationCode: 'CNO',  sequence: 12, arrivalTime: '14:10', departureTime: '14:12', dayOffset: 1 },
      { stationCode: 'KAWR', sequence: 13, arrivalTime: '14:55', departureTime: '15:00', dayOffset: 1 },
      { stationCode: 'MAQ',  sequence: 14, arrivalTime: '17:45', departureTime: '17:50', dayOffset: 1 },
      { stationCode: 'ERS',  sequence: 15, arrivalTime: '05:00', dayOffset: 2 },
    ],
  },

  // ─────────────────────────────────────────────
  // 8. Goa Rajdhani Express — NZM → Madgaon
  //    Mon/Wed/Fri · Stops at KKW, SWV, THVM, KRMI, MAO
  // ─────────────────────────────────────────────
  {
    id: '12413',
    trainNumber: '12413',
    name: 'Goa Rajdhani Express',
    sourceStationCode: 'NZM',
    destinationStationCode: 'MAO',
    runningDays: [1, 3, 5], // Mon, Wed, Fri
    type: 'Rajdhani',
    stops: [
      { stationCode: 'NZM',  sequence: 1,  departureTime: '10:05', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2,  arrivalTime: '03:50', departureTime: '03:55', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 3,  arrivalTime: '05:10', departureTime: '05:12', dayOffset: 1 },
      { stationCode: 'RN',   sequence: 4,  arrivalTime: '08:55', departureTime: '09:05', dayOffset: 1 },
      { stationCode: 'KKW',  sequence: 5,  arrivalTime: '11:20', departureTime: '11:22', dayOffset: 1 },
      { stationCode: 'SWV',  sequence: 6,  arrivalTime: '12:10', departureTime: '12:12', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 7,  arrivalTime: '13:05', departureTime: '13:07', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 8,  arrivalTime: '13:32', departureTime: '13:34', dayOffset: 1 },
      { stationCode: 'MAO',  sequence: 9,  arrivalTime: '14:00', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 9. Konkan Kanya Express — CSMT → Madgaon
  //    CORRECTED: destination is MAO (not KUDL); full route through SWV, PER, THVM, KRMI, MAO
  // ─────────────────────────────────────────────
  {
    id: '20111',
    trainNumber: '20111',
    name: 'Konkan Kanya Express',
    sourceStationCode: 'CSMT',
    destinationStationCode: 'MAO', // CORRECTED: was KUDL
    runningDays: [1, 2, 3, 4, 5, 6, 0],
    type: 'Express',
    stops: [
      { stationCode: 'CSMT', sequence: 1,  departureTime: '22:10', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2,  arrivalTime: '23:30', departureTime: '23:35', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 3,  arrivalTime: '00:52', departureTime: '00:55', dayOffset: 1 },
      { stationCode: 'CHI',  sequence: 4,  arrivalTime: '02:55', departureTime: '03:00', dayOffset: 1 },
      { stationCode: 'RN',   sequence: 5,  arrivalTime: '04:55', departureTime: '05:05', dayOffset: 1 },
      { stationCode: 'KKW',  sequence: 6,  arrivalTime: '07:37', departureTime: '07:40', dayOffset: 1 },
      { stationCode: 'KUDL', sequence: 7,  arrivalTime: '08:30', departureTime: '08:32', dayOffset: 1 }, // CORRECTED: now intermediate
      { stationCode: 'SWV',  sequence: 8,  arrivalTime: '09:18', departureTime: '09:20', dayOffset: 1 },
      { stationCode: 'PER',  sequence: 9,  arrivalTime: '10:10', departureTime: '10:12', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 10, arrivalTime: '10:45', departureTime: '10:47', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 11, arrivalTime: '11:15', departureTime: '11:17', dayOffset: 1 },
      { stationCode: 'MAO',  sequence: 12, arrivalTime: '11:50', dayOffset: 1 }, // CORRECTED: actual terminus
    ],
  },

  // ─────────────────────────────────────────────
  // 10. Tejas Express — CSMT → Madgaon
  //     CORRECTED: Tue/Thu/Sat only; stops at KUDL (not SWV)
  // ─────────────────────────────────────────────
  {
    id: '22119',
    trainNumber: '22119',
    name: 'Tejas Express',
    sourceStationCode: 'CSMT',
    destinationStationCode: 'MAO',
    runningDays: [2, 4, 6], // CORRECTED: Tue/Thu/Sat (monsoon 2026)
    type: 'Tejas',
    stops: [
      { stationCode: 'CSMT', sequence: 1, departureTime: '05:45', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '06:52', departureTime: '06:57', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '08:10', departureTime: '08:12', dayOffset: 0 },
      { stationCode: 'CHI',  sequence: 4, arrivalTime: '10:00', departureTime: '10:02', dayOffset: 0 },
      { stationCode: 'RN',   sequence: 5, arrivalTime: '11:55', departureTime: '12:00', dayOffset: 0 },
      { stationCode: 'KKW',  sequence: 6, arrivalTime: '14:15', departureTime: '14:17', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 7, arrivalTime: '15:05', departureTime: '15:07', dayOffset: 0 }, // CORRECTED: KUDL not SWV
      { stationCode: 'THVM', sequence: 8, arrivalTime: '16:00', departureTime: '16:02', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 9, arrivalTime: '16:30', departureTime: '16:32', dayOffset: 0 },
      { stationCode: 'MAO',  sequence: 10, arrivalTime: '17:00', dayOffset: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 11. Tutari Express — Dadar → Sawantwadi Road
  //     Daily · Terminates at SWV
  // ─────────────────────────────────────────────
  {
    id: '11003',
    trainNumber: '11003',
    name: 'Tutari Express',
    sourceStationCode: 'DR',
    destinationStationCode: 'SWV',
    runningDays: [1, 2, 3, 4, 5, 6, 0],
    type: 'Express',
    stops: [
      { stationCode: 'DR',   sequence: 1, departureTime: '00:05', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '01:15', departureTime: '01:20', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '02:38', departureTime: '02:40', dayOffset: 0 },
      { stationCode: 'CHI',  sequence: 4, arrivalTime: '04:48', departureTime: '04:50', dayOffset: 0 },
      { stationCode: 'RN',   sequence: 5, arrivalTime: '06:50', departureTime: '07:00', dayOffset: 0 },
      { stationCode: 'KKW',  sequence: 6, arrivalTime: '09:50', departureTime: '09:52', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 7, arrivalTime: '10:40', departureTime: '10:42', dayOffset: 0 },
      { stationCode: 'SWV',  sequence: 8, arrivalTime: '12:50', dayOffset: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 12. Sindhudurg Express — Diva → Sawantwadi Road
  //     Daily · Terminates at SWV
  // ─────────────────────────────────────────────
  {
    id: '10105',
    trainNumber: '10105',
    name: 'Sindhudurg Express',
    sourceStationCode: 'DIV',
    destinationStationCode: 'SWV',
    runningDays: [1, 2, 3, 4, 5, 6, 0],
    type: 'Express',
    stops: [
      { stationCode: 'DIV',  sequence: 1, departureTime: '06:25', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '07:32', departureTime: '07:35', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '08:52', departureTime: '08:54', dayOffset: 0 },
      { stationCode: 'CHI',  sequence: 4, arrivalTime: '11:02', departureTime: '11:04', dayOffset: 0 },
      { stationCode: 'RN',   sequence: 5, arrivalTime: '13:00', departureTime: '13:10', dayOffset: 0 },
      { stationCode: 'KKW',  sequence: 6, arrivalTime: '16:00', departureTime: '16:02', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 7, arrivalTime: '16:50', departureTime: '16:52', dayOffset: 0 },
      { stationCode: 'SWV',  sequence: 8, arrivalTime: '18:45', dayOffset: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 13. CSMT–Sawantwadi Road Express — CSMT → Sawantwadi Road
  //     Daily · New service introduced September 2026 · Terminates at SWV
  //     From 21 Oct 2026, scheduled arrival changes to 14:15
  // ─────────────────────────────────────────────
  {
    id: '15087',
    trainNumber: '15087',
    name: 'CSMT–Sawantwadi Road Express',
    sourceStationCode: 'CSMT',
    destinationStationCode: 'SWV',
    runningDays: [1, 2, 3, 4, 5, 6, 0],
    type: 'Express',
    stops: [
      { stationCode: 'CSMT', sequence: 1, departureTime: '23:55', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '01:10', departureTime: '01:15', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '02:32', departureTime: '02:35', dayOffset: 1 },
      { stationCode: 'CHI',  sequence: 4, arrivalTime: '04:38', departureTime: '04:40', dayOffset: 1 },
      { stationCode: 'RN',   sequence: 5, arrivalTime: '06:40', departureTime: '06:50', dayOffset: 1 },
      { stationCode: 'KKW',  sequence: 6, arrivalTime: '09:45', departureTime: '09:47', dayOffset: 1 },
      { stationCode: 'KUDL', sequence: 7, arrivalTime: '10:35', departureTime: '10:37', dayOffset: 1 },
      { stationCode: 'SWV',  sequence: 8, arrivalTime: '13:50', dayOffset: 1 }, // From 21 Oct 2026: 14:15
    ],
  },

  // ═════════════════════════════════════════════════════════
  //  RETURN DIRECTION — GOA / KONKAN  →  MUMBAI / DELHI
  // ═════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────
  // 14. Mandovi Express — Madgaon → CSMT  (return of 10103)
  //     Daily · Dep MAO 07:15 → CSMT 21:50
  // ─────────────────────────────────────────────
  {
    id: '10104',
    trainNumber: '10104',
    name: 'Mandovi Express',
    sourceStationCode: 'MAO',
    destinationStationCode: 'CSMT',
    runningDays: [1, 2, 3, 4, 5, 6, 0],
    type: 'Express',
    stops: [
      { stationCode: 'MAO',  sequence: 1,  departureTime: '07:15', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 2,  arrivalTime: '07:50', departureTime: '07:52', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 3,  arrivalTime: '08:20', departureTime: '08:25', dayOffset: 0 },
      { stationCode: 'PER',  sequence: 4,  arrivalTime: '09:05', departureTime: '09:07', dayOffset: 0 },
      { stationCode: 'SWV',  sequence: 5,  arrivalTime: '09:55', departureTime: '09:57', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 6,  arrivalTime: '10:40', departureTime: '10:42', dayOffset: 0 },
      { stationCode: 'KKW',  sequence: 7,  arrivalTime: '11:30', departureTime: '11:32', dayOffset: 0 },
      { stationCode: 'RN',   sequence: 8,  arrivalTime: '14:25', departureTime: '14:35', dayOffset: 0 },
      { stationCode: 'CHI',  sequence: 9,  arrivalTime: '16:35', departureTime: '16:40', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 10, arrivalTime: '18:55', departureTime: '18:57', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 11, arrivalTime: '20:10', departureTime: '20:15', dayOffset: 0 },
      { stationCode: 'CSMT', sequence: 12, arrivalTime: '21:50', dayOffset: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 15. Jan Shatabdi Express — Madgaon → CSMT  (return of 12051)
  //     Daily · Dep MAO 06:50 → CSMT 19:25
  // ─────────────────────────────────────────────
  {
    id: '12052',
    trainNumber: '12052',
    name: 'Jan Shatabdi Express',
    sourceStationCode: 'MAO',
    destinationStationCode: 'CSMT',
    runningDays: [1, 2, 3, 4, 5, 6, 0],
    type: 'Express',
    stops: [
      { stationCode: 'MAO',  sequence: 1,  departureTime: '06:50', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 2,  arrivalTime: '07:25', departureTime: '07:27', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 3,  arrivalTime: '07:55', departureTime: '07:57', dayOffset: 0 },
      { stationCode: 'SWV',  sequence: 4,  arrivalTime: '08:50', departureTime: '08:52', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 5,  arrivalTime: '09:37', departureTime: '09:39', dayOffset: 0 },
      { stationCode: 'KKW',  sequence: 6,  arrivalTime: '10:25', departureTime: '10:27', dayOffset: 0 },
      { stationCode: 'RN',   sequence: 7,  arrivalTime: '12:45', departureTime: '12:50', dayOffset: 0 },
      { stationCode: 'CHI',  sequence: 8,  arrivalTime: '14:40', departureTime: '14:42', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 9,  arrivalTime: '16:38', departureTime: '16:40', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 10, arrivalTime: '17:58', departureTime: '18:00', dayOffset: 0 },
      { stationCode: 'CSMT', sequence: 11, arrivalTime: '19:25', dayOffset: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 16. Vande Bharat Express — Madgaon → CSMT  (return of 22229)
  //     Tue/Thu/Sat · Dep MAO 08:00 → CSMT 17:30
  // ─────────────────────────────────────────────
  {
    id: '22230',
    trainNumber: '22230',
    name: 'Vande Bharat Express',
    sourceStationCode: 'MAO',
    destinationStationCode: 'CSMT',
    runningDays: [2, 4, 6], // Tue/Thu/Sat (reverse of Mon/Wed/Fri outbound)
    type: 'VandeBharat',
    stops: [
      { stationCode: 'MAO',  sequence: 1, departureTime: '08:00', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 2, arrivalTime: '08:30', departureTime: '08:32', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 3, arrivalTime: '09:00', departureTime: '09:02', dayOffset: 0 },
      { stationCode: 'KKW',  sequence: 4, arrivalTime: '10:20', departureTime: '10:22', dayOffset: 0 },
      { stationCode: 'RN',   sequence: 5, arrivalTime: '12:10', departureTime: '12:15', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 6, arrivalTime: '15:25', departureTime: '15:27', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 7, arrivalTime: '16:28', departureTime: '16:30', dayOffset: 0 },
      { stationCode: 'CSMT', sequence: 8, arrivalTime: '17:30', dayOffset: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 17. Matsyagandha Express — Mangaluru → LTT  (return of 12619)
  //     Daily · Dep MAQ 20:45 → LTT +1 day 13:35
  // ─────────────────────────────────────────────
  {
    id: '12620',
    trainNumber: '12620',
    name: 'Matsyagandha Express',
    sourceStationCode: 'MAQ',
    destinationStationCode: 'LTT',
    runningDays: [1, 2, 3, 4, 5, 6, 0],
    type: 'Express',
    stops: [
      { stationCode: 'MAQ',  sequence: 1,  departureTime: '20:45', dayOffset: 0 },
      { stationCode: 'CNO',  sequence: 2,  arrivalTime: '23:10', departureTime: '23:12', dayOffset: 0 },
      { stationCode: 'MAO',  sequence: 3,  arrivalTime: '00:10', departureTime: '00:25', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 4,  arrivalTime: '00:58', departureTime: '01:00', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 5,  arrivalTime: '01:28', departureTime: '01:30', dayOffset: 1 },
      { stationCode: 'KUDL', sequence: 6,  arrivalTime: '02:48', departureTime: '02:50', dayOffset: 1 },
      { stationCode: 'KKW',  sequence: 7,  arrivalTime: '03:35', departureTime: '03:37', dayOffset: 1 },
      { stationCode: 'RN',   sequence: 8,  arrivalTime: '06:45', departureTime: '06:55', dayOffset: 1 },
      { stationCode: 'CHI',  sequence: 9,  arrivalTime: '08:45', departureTime: '08:50', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 10, arrivalTime: '11:00', departureTime: '11:02', dayOffset: 1 },
      { stationCode: 'PNVL', sequence: 11, arrivalTime: '12:20', departureTime: '12:25', dayOffset: 1 },
      { stationCode: 'LTT',  sequence: 12, arrivalTime: '13:35', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 18. Konkan Kanya Express — Madgaon → CSMT  (return of 20111)
  //     Daily · Dep MAO 14:05 → CSMT +1 day 03:50
  // ─────────────────────────────────────────────
  {
    id: '20112',
    trainNumber: '20112',
    name: 'Konkan Kanya Express',
    sourceStationCode: 'MAO',
    destinationStationCode: 'CSMT',
    runningDays: [1, 2, 3, 4, 5, 6, 0],
    type: 'Express',
    stops: [
      { stationCode: 'MAO',  sequence: 1,  departureTime: '14:05', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 2,  arrivalTime: '14:40', departureTime: '14:42', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 3,  arrivalTime: '15:10', departureTime: '15:12', dayOffset: 0 },
      { stationCode: 'PER',  sequence: 4,  arrivalTime: '15:50', departureTime: '15:52', dayOffset: 0 },
      { stationCode: 'SWV',  sequence: 5,  arrivalTime: '16:40', departureTime: '16:42', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 6,  arrivalTime: '17:25', departureTime: '17:27', dayOffset: 0 },
      { stationCode: 'KKW',  sequence: 7,  arrivalTime: '18:15', departureTime: '18:17', dayOffset: 0 },
      { stationCode: 'RN',   sequence: 8,  arrivalTime: '20:55', departureTime: '21:00', dayOffset: 0 },
      { stationCode: 'CHI',  sequence: 9,  arrivalTime: '23:05', departureTime: '23:10', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 10, arrivalTime: '01:10', departureTime: '01:12', dayOffset: 1 },
      { stationCode: 'PNVL', sequence: 11, arrivalTime: '02:25', departureTime: '02:30', dayOffset: 1 },
      { stationCode: 'CSMT', sequence: 12, arrivalTime: '03:50', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 19. Tejas Express — Madgaon → CSMT  (return of 22119)
  //     Mon/Wed/Fri · Dep MAO 10:35 → CSMT 22:05
  // ─────────────────────────────────────────────
  {
    id: '22120',
    trainNumber: '22120',
    name: 'Tejas Express',
    sourceStationCode: 'MAO',
    destinationStationCode: 'CSMT',
    runningDays: [1, 3, 5], // Mon/Wed/Fri (reverse of Tue/Thu/Sat outbound)
    type: 'Tejas',
    stops: [
      { stationCode: 'MAO',  sequence: 1,  departureTime: '10:35', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 2,  arrivalTime: '11:05', departureTime: '11:07', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 3,  arrivalTime: '11:35', departureTime: '11:37', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 4,  arrivalTime: '12:30', departureTime: '12:32', dayOffset: 0 },
      { stationCode: 'KKW',  sequence: 5,  arrivalTime: '13:20', departureTime: '13:22', dayOffset: 0 },
      { stationCode: 'RN',   sequence: 6,  arrivalTime: '15:35', departureTime: '15:40', dayOffset: 0 },
      { stationCode: 'CHI',  sequence: 7,  arrivalTime: '17:35', departureTime: '17:37', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 8,  arrivalTime: '19:25', departureTime: '19:27', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 9,  arrivalTime: '20:40', departureTime: '20:45', dayOffset: 0 },
      { stationCode: 'CSMT', sequence: 10, arrivalTime: '22:05', dayOffset: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 20. Goa Express — Vasco da Gama → NZM  (return of 12779)
  //     Daily · Dep VSG 07:15 → NZM +1 day 15:45
  // ─────────────────────────────────────────────
  {
    id: '12780',
    trainNumber: '12780',
    name: 'Goa Express',
    sourceStationCode: 'VSG',
    destinationStationCode: 'NZM',
    runningDays: [1, 2, 3, 4, 5, 6, 0],
    type: 'Express',
    stops: [
      { stationCode: 'VSG',  sequence: 1,  departureTime: '07:15', dayOffset: 0 },
      { stationCode: 'MAO',  sequence: 2,  arrivalTime: '08:40', departureTime: '09:00', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 3,  arrivalTime: '09:35', departureTime: '09:37', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 4,  arrivalTime: '10:05', departureTime: '10:10', dayOffset: 0 },
      { stationCode: 'PER',  sequence: 5,  arrivalTime: '10:50', departureTime: '10:52', dayOffset: 0 },
      { stationCode: 'SWV',  sequence: 6,  arrivalTime: '11:40', departureTime: '11:42', dayOffset: 0 },
      { stationCode: 'KKW',  sequence: 7,  arrivalTime: '12:35', departureTime: '12:37', dayOffset: 0 },
      { stationCode: 'RN',   sequence: 8,  arrivalTime: '15:20', departureTime: '15:30', dayOffset: 0 },
      { stationCode: 'CHI',  sequence: 9,  arrivalTime: '17:25', departureTime: '17:30', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 10, arrivalTime: '19:20', departureTime: '19:22', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 11, arrivalTime: '20:40', departureTime: '20:45', dayOffset: 0 },
      { stationCode: 'NZM',  sequence: 12, arrivalTime: '15:45', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 21. Goa Rajdhani Express — Madgaon → NZM  (return of 12413)
  //     Tue/Thu/Sat · Dep MAO 14:45 → NZM +1 day 19:55
  // ─────────────────────────────────────────────
  {
    id: '12414',
    trainNumber: '12414',
    name: 'Goa Rajdhani Express',
    sourceStationCode: 'MAO',
    destinationStationCode: 'NZM',
    runningDays: [2, 4, 6], // Tue/Thu/Sat
    type: 'Rajdhani',
    stops: [
      { stationCode: 'MAO',  sequence: 1,  departureTime: '14:45', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 2,  arrivalTime: '15:12', departureTime: '15:14', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 3,  arrivalTime: '15:40', departureTime: '15:42', dayOffset: 0 },
      { stationCode: 'SWV',  sequence: 4,  arrivalTime: '16:35', departureTime: '16:37', dayOffset: 0 },
      { stationCode: 'KKW',  sequence: 5,  arrivalTime: '17:25', departureTime: '17:27', dayOffset: 0 },
      { stationCode: 'RN',   sequence: 6,  arrivalTime: '20:10', departureTime: '20:20', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 7,  arrivalTime: '00:50', departureTime: '00:52', dayOffset: 1 },
      { stationCode: 'PNVL', sequence: 8,  arrivalTime: '02:05', departureTime: '02:10', dayOffset: 1 },
      { stationCode: 'NZM',  sequence: 9,  arrivalTime: '19:55', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 22. Netravati Express — Thiruvananthapuram → LTT  (return of 16345)
  //     Daily · Dep TVC 11:00 → LTT +1 day 17:20
  // ─────────────────────────────────────────────
  {
    id: '16346',
    trainNumber: '16346',
    name: 'Netravati Express',
    sourceStationCode: 'TVC',
    destinationStationCode: 'LTT',
    runningDays: [1, 2, 3, 4, 5, 6, 0],
    type: 'Express',
    stops: [
      { stationCode: 'TVC',  sequence: 1,  departureTime: '11:00', dayOffset: 0 },
      { stationCode: 'MAQ',  sequence: 2,  arrivalTime: '23:30', departureTime: '23:40', dayOffset: 0 },
      { stationCode: 'CNO',  sequence: 3,  arrivalTime: '02:50', departureTime: '02:52', dayOffset: 1 },
      { stationCode: 'MAO',  sequence: 4,  arrivalTime: '03:45', departureTime: '04:00', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 5,  arrivalTime: '04:33', departureTime: '04:35', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 6,  arrivalTime: '05:05', departureTime: '05:07', dayOffset: 1 },
      { stationCode: 'KUDL', sequence: 7,  arrivalTime: '06:30', departureTime: '06:32', dayOffset: 1 },
      { stationCode: 'KKW',  sequence: 8,  arrivalTime: '07:20', departureTime: '07:22', dayOffset: 1 },
      { stationCode: 'RN',   sequence: 9,  arrivalTime: '10:05', departureTime: '10:15', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 10, arrivalTime: '14:45', departureTime: '14:47', dayOffset: 1 },
      { stationCode: 'PNVL', sequence: 11, arrivalTime: '16:05', departureTime: '16:10', dayOffset: 1 },
      { stationCode: 'LTT',  sequence: 12, arrivalTime: '17:20', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 23. Mangala Lakshadweep Express — Ernakulam → NZM  (return of 12617)
  //     Daily · Dep ERS 18:30 → NZM +2 days 16:20
  // ─────────────────────────────────────────────
  {
    id: '12618',
    trainNumber: '12618',
    name: 'Mangala Lakshadweep Express',
    sourceStationCode: 'ERS',
    destinationStationCode: 'NZM',
    runningDays: [1, 2, 3, 4, 5, 6, 0],
    type: 'Express',
    stops: [
      { stationCode: 'ERS',  sequence: 1,  departureTime: '18:30', dayOffset: 0 },
      { stationCode: 'MAQ',  sequence: 2,  arrivalTime: '07:00', departureTime: '07:10', dayOffset: 1 },
      { stationCode: 'CNO',  sequence: 3,  arrivalTime: '10:05', departureTime: '10:07', dayOffset: 1 },
      { stationCode: 'MAO',  sequence: 4,  arrivalTime: '11:05', departureTime: '11:20', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 5,  arrivalTime: '11:55', departureTime: '11:57', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 6,  arrivalTime: '12:25', departureTime: '12:27', dayOffset: 1 },
      { stationCode: 'PER',  sequence: 7,  arrivalTime: '13:05', departureTime: '13:07', dayOffset: 1 },
      { stationCode: 'SWV',  sequence: 8,  arrivalTime: '13:55', departureTime: '13:57', dayOffset: 1 },
      { stationCode: 'KKW',  sequence: 9,  arrivalTime: '14:50', departureTime: '14:52', dayOffset: 1 },
      { stationCode: 'RN',   sequence: 10, arrivalTime: '17:25', departureTime: '17:40', dayOffset: 1 },
      { stationCode: 'CHI',  sequence: 11, arrivalTime: '19:30', departureTime: '19:35', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 12, arrivalTime: '21:25', departureTime: '21:27', dayOffset: 1 },
      { stationCode: 'PNVL', sequence: 13, arrivalTime: '22:45', departureTime: '22:50', dayOffset: 1 },
      { stationCode: 'NZM',  sequence: 14, arrivalTime: '16:20', dayOffset: 2 },
    ],
  },

  // ─────────────────────────────────────────────
  // 24. Tutari Express — Sawantwadi Road → Dadar  (return of 11003)
  //     Daily · Dep SWV 13:35 → DR +1 day 00:30
  // ─────────────────────────────────────────────
  {
    id: '11004',
    trainNumber: '11004',
    name: 'Tutari Express',
    sourceStationCode: 'SWV',
    destinationStationCode: 'DR',
    runningDays: [1, 2, 3, 4, 5, 6, 0],
    type: 'Express',
    stops: [
      { stationCode: 'SWV',  sequence: 1, departureTime: '13:35', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 2, arrivalTime: '14:05', departureTime: '14:07', dayOffset: 0 },
      { stationCode: 'KKW',  sequence: 3, arrivalTime: '14:55', departureTime: '14:57', dayOffset: 0 },
      { stationCode: 'RN',   sequence: 4, arrivalTime: '17:50', departureTime: '18:00', dayOffset: 0 },
      { stationCode: 'CHI',  sequence: 5, arrivalTime: '20:00', departureTime: '20:02', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 6, arrivalTime: '22:05', departureTime: '22:07', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 7, arrivalTime: '23:20', departureTime: '23:25', dayOffset: 0 },
      { stationCode: 'DR',   sequence: 8, arrivalTime: '00:30', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 25. Sindhudurg Express — Sawantwadi Road → Diva  (return of 10105)
  //     Daily · Dep SWV 19:45 → DIV +1 day 07:15
  // ─────────────────────────────────────────────
  {
    id: '10106',
    trainNumber: '10106',
    name: 'Sindhudurg Express',
    sourceStationCode: 'SWV',
    destinationStationCode: 'DIV',
    runningDays: [1, 2, 3, 4, 5, 6, 0],
    type: 'Express',
    stops: [
      { stationCode: 'SWV',  sequence: 1, departureTime: '19:45', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 2, arrivalTime: '20:40', departureTime: '20:42', dayOffset: 0 },
      { stationCode: 'KKW',  sequence: 3, arrivalTime: '21:30', departureTime: '21:32', dayOffset: 0 },
      { stationCode: 'RN',   sequence: 4, arrivalTime: '00:25', departureTime: '00:35', dayOffset: 1 },
      { stationCode: 'CHI',  sequence: 5, arrivalTime: '02:35', departureTime: '02:37', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 6, arrivalTime: '04:45', departureTime: '04:47', dayOffset: 1 },
      { stationCode: 'PNVL', sequence: 7, arrivalTime: '06:05', departureTime: '06:10', dayOffset: 1 },
      { stationCode: 'DIV',  sequence: 8, arrivalTime: '07:15', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 26. Sawantwadi–CSMT Express  (return of 15087)
  //     Daily · Dep SWV 15:00 → CSMT +1 day 02:30
  // ─────────────────────────────────────────────
  {
    id: '15088',
    trainNumber: '15088',
    name: 'Sawantwadi–CSMT Express',
    sourceStationCode: 'SWV',
    destinationStationCode: 'CSMT',
    runningDays: [1, 2, 3, 4, 5, 6, 0],
    type: 'Express',
    stops: [
      { stationCode: 'SWV',  sequence: 1, departureTime: '15:00', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 2, arrivalTime: '15:35', departureTime: '15:37', dayOffset: 0 },
      { stationCode: 'KKW',  sequence: 3, arrivalTime: '16:25', departureTime: '16:27', dayOffset: 0 },
      { stationCode: 'RN',   sequence: 4, arrivalTime: '19:20', departureTime: '19:30', dayOffset: 0 },
      { stationCode: 'CHI',  sequence: 5, arrivalTime: '21:30', departureTime: '21:32', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 6, arrivalTime: '23:40', departureTime: '23:42', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 7, arrivalTime: '01:00', departureTime: '01:05', dayOffset: 1 },
      { stationCode: 'CSMT', sequence: 8, arrivalTime: '02:30', dayOffset: 1 },
    ],
  },

];

/** Lookup map by trainNumber */
export const TRAIN_MAP: Record<string, Train> = Object.fromEntries(
  TRAINS.map(t => [t.trainNumber, t]),
);
