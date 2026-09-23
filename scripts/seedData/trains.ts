import { Train } from '../../src/types/Train';

/**
 * Konkan Corridor train dataset — September 2026 timetable reference.
 *
 * Each train contains its FULL corridor route with all halts.
 * The search engine generates journey options from a single train's stops[],
 * so never duplicate a train entry for different destinations.
 *
 * Running days: JS Date.getDay() — 0=Sunday, 1=Monday … 6=Saturday.
 * dayOffset: 0 = same calendar day as departure date, 1 = next day, etc.
 * Times marked "// approx" are derived from ministry station boards and may
 * differ slightly from the printed timetable. Verify before production use.
 *
 * Sources:
 *   - Ministry of Railways – Panvel–Chiplun sector list (July 2026)
 *   - Konkan Railway station timetable boards (September 2026 monsoon schedule)
 */
export const TRAINS: Train[] = [

  // ═══════════════════════════════════════════════════════════
  //  OUTBOUND  MUMBAI / DELHI / NORTH  →  GOA / KONKAN / SOUTH
  // ═══════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────
  // 1. Matsyagandha Express — LTT → MAQ
  // ─────────────────────────────────────────────
  {
    id: '12619',
    trainNumber: '12619',
    name: 'Matsyagandha Express',
    sourceStationCode: 'LTT',
    destinationStationCode: 'MAQ',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    type: 'Express',
    stops: [
      { stationCode: 'LTT', sequence: 1, departureTime: '15:20', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '16:30', departureTime: '16:35', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '17:55', departureTime: '18:00', dayOffset: 0 },
      { stationCode: 'CHI', sequence: 4, arrivalTime: '20:05', departureTime: '20:10', dayOffset: 0 },
      { stationCode: 'RN', sequence: 5, arrivalTime: '22:00', departureTime: '22:10', dayOffset: 0 },
      { stationCode: 'KKW', sequence: 6, arrivalTime: '01:30', departureTime: '01:32', dayOffset: 1 },
      { stationCode: 'KUDL', sequence: 7, arrivalTime: '02:15', departureTime: '02:17', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 8, arrivalTime: '03:20', departureTime: '03:22', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 9, arrivalTime: '03:45', departureTime: '03:47', dayOffset: 1 },
      { stationCode: 'MAO', sequence: 10, arrivalTime: '04:10', departureTime: '04:20', dayOffset: 1 },
      { stationCode: 'CNO', sequence: 11, arrivalTime: '05:10', departureTime: '05:12', dayOffset: 1 },
      { stationCode: 'KAWR', sequence: 12, arrivalTime: '06:00', departureTime: '06:05', dayOffset: 1 },
      { stationCode: 'MAQ', sequence: 13, arrivalTime: '08:00', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 2. Mandovi Express — CSMT → MAO
  // ─────────────────────────────────────────────
  {
    id: '10103',
    trainNumber: '10103',
    name: 'Mandovi Express',
    sourceStationCode: 'CSMT',
    destinationStationCode: 'MAO',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    type: 'Express',
    stops: [
      { stationCode: 'CSMT', sequence: 1, departureTime: '07:10', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '08:40', departureTime: '08:50', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '10:05', departureTime: '10:07', dayOffset: 0 },
      { stationCode: 'CHI', sequence: 4, arrivalTime: '12:25', departureTime: '12:30', dayOffset: 0 },
      { stationCode: 'RN', sequence: 5, arrivalTime: '14:35', departureTime: '14:45', dayOffset: 0 },
      { stationCode: 'KKW', sequence: 6, arrivalTime: '17:35', departureTime: '17:37', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 7, arrivalTime: '18:25', departureTime: '18:27', dayOffset: 0 },
      { stationCode: 'SWV', sequence: 8, arrivalTime: '19:10', departureTime: '19:12', dayOffset: 0 },
      { stationCode: 'PER', sequence: 9, arrivalTime: '20:00', departureTime: '20:02', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 10, arrivalTime: '20:40', departureTime: '20:45', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 11, arrivalTime: '21:15', departureTime: '21:17', dayOffset: 0 },
      { stationCode: 'MAO', sequence: 12, arrivalTime: '21:50', dayOffset: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 3. Jan Shatabdi Express — CSMT → MAO
  // ─────────────────────────────────────────────
  {
    id: '12051',
    trainNumber: '12051',
    name: 'Jan Shatabdi Express',
    sourceStationCode: 'CSMT',
    destinationStationCode: 'MAO',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    type: 'Express',
    stops: [
      { stationCode: 'CSMT', sequence: 1, departureTime: '05:25', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '06:42', departureTime: '06:44', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '08:02', departureTime: '08:04', dayOffset: 0 },
      { stationCode: 'CHI', sequence: 4, arrivalTime: '10:00', departureTime: '10:02', dayOffset: 0 },
      { stationCode: 'RN', sequence: 5, arrivalTime: '11:50', departureTime: '11:55', dayOffset: 0 },
      { stationCode: 'KKW', sequence: 6, arrivalTime: '14:15', departureTime: '14:17', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 7, arrivalTime: '15:05', departureTime: '15:07', dayOffset: 0 },
      { stationCode: 'SWV', sequence: 8, arrivalTime: '15:52', departureTime: '15:54', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 9, arrivalTime: '16:45', departureTime: '16:47', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 10, arrivalTime: '17:15', departureTime: '17:17', dayOffset: 0 },
      { stationCode: 'MAO', sequence: 11, arrivalTime: '17:50', dayOffset: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 4. Vande Bharat Express — CSMT → MAO
  // ─────────────────────────────────────────────
  {
    id: '22229',
    trainNumber: '22229',
    name: 'Vande Bharat Express',
    sourceStationCode: 'CSMT',
    destinationStationCode: 'MAO',
    runningDays: [1, 3, 5],
    type: 'VandeBharat',
    stops: [
      { stationCode: 'CSMT', sequence: 1, departureTime: '05:25', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '06:25', departureTime: '06:27', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '07:28', departureTime: '07:30', dayOffset: 0 },
      { stationCode: 'RN', sequence: 4, arrivalTime: '10:40', departureTime: '10:45', dayOffset: 0 },
      { stationCode: 'KKW', sequence: 5, arrivalTime: '12:35', departureTime: '12:37', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 6, arrivalTime: '13:55', departureTime: '13:57', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 7, arrivalTime: '14:25', departureTime: '14:27', dayOffset: 0 },
      { stationCode: 'MAO', sequence: 8, arrivalTime: '16:00', dayOffset: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 5. Goa Express — NZM → VSG
  // ─────────────────────────────────────────────
  {
    id: '12779',
    trainNumber: '12779',
    name: 'Goa Express',
    sourceStationCode: 'NZM',
    destinationStationCode: 'VSG',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    type: 'Express',
    stops: [
      { stationCode: 'NZM', sequence: 1, departureTime: '15:00', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '09:35', departureTime: '09:45', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '11:00', departureTime: '11:02', dayOffset: 1 },
      { stationCode: 'CHI', sequence: 4, arrivalTime: '12:55', departureTime: '13:00', dayOffset: 1 },
      { stationCode: 'RN', sequence: 5, arrivalTime: '14:50', departureTime: '15:00', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 6, arrivalTime: '17:40', departureTime: '17:42', dayOffset: 1 },
      { stationCode: 'SWV', sequence: 7, arrivalTime: '18:35', departureTime: '18:37', dayOffset: 1 },
      { stationCode: 'PER', sequence: 8, arrivalTime: '19:27', departureTime: '19:29', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 9, arrivalTime: '20:05', departureTime: '20:10', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 10, arrivalTime: '20:40', departureTime: '20:42', dayOffset: 1 },
      { stationCode: 'MAO', sequence: 11, arrivalTime: '21:15', departureTime: '21:30', dayOffset: 1 },
      { stationCode: 'VSG', sequence: 12, arrivalTime: '23:30', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 6. Netravati Express — LTT → TVC
  // ─────────────────────────────────────────────
  {
    id: '16345',
    trainNumber: '16345',
    name: 'Netravati Express',
    sourceStationCode: 'LTT',
    destinationStationCode: 'TVC',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    type: 'Express',
    stops: [
      { stationCode: 'LTT', sequence: 1, departureTime: '11:25', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '12:27', departureTime: '12:30', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '13:45', departureTime: '13:47', dayOffset: 0 },
      { stationCode: 'RN', sequence: 4, arrivalTime: '18:20', departureTime: '18:30', dayOffset: 0 },
      { stationCode: 'KKW', sequence: 5, arrivalTime: '21:05', departureTime: '21:07', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 6, arrivalTime: '21:55', departureTime: '21:57', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 7, arrivalTime: '23:22', departureTime: '23:25', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 8, arrivalTime: '23:55', departureTime: '23:57', dayOffset: 0 },
      { stationCode: 'MAO', sequence: 9, arrivalTime: '00:30', departureTime: '00:40', dayOffset: 1 },
      { stationCode: 'CNO', sequence: 10, arrivalTime: '01:30', departureTime: '01:32', dayOffset: 1 },
      { stationCode: 'KAWR', sequence: 11, arrivalTime: '02:20', departureTime: '02:25', dayOffset: 1 },
      { stationCode: 'MAQ', sequence: 12, arrivalTime: '05:30', departureTime: '05:35', dayOffset: 1 },
      { stationCode: 'TVC', sequence: 13, arrivalTime: '18:00', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 7. Mangala Lakshadweep Express — NZM → ERS
  // ─────────────────────────────────────────────
  {
    id: '12617',
    trainNumber: '12617',
    name: 'Mangala Lakshadweep Express',
    sourceStationCode: 'NZM',
    destinationStationCode: 'ERS',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    type: 'Express',
    stops: [
      { stationCode: 'NZM', sequence: 1, departureTime: '08:10', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '01:50', departureTime: '01:55', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '03:10', departureTime: '03:15', dayOffset: 1 },
      { stationCode: 'CHI', sequence: 4, arrivalTime: '05:00', departureTime: '05:05', dayOffset: 1 },
      { stationCode: 'RN', sequence: 5, arrivalTime: '07:05', departureTime: '07:20', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 6, arrivalTime: '09:50', departureTime: '09:52', dayOffset: 1 },
      { stationCode: 'SWV', sequence: 7, arrivalTime: '10:45', departureTime: '10:47', dayOffset: 1 },
      { stationCode: 'PER', sequence: 8, arrivalTime: '11:35', departureTime: '11:37', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 9, arrivalTime: '12:05', departureTime: '12:07', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 10, arrivalTime: '12:33', departureTime: '12:35', dayOffset: 1 },
      { stationCode: 'MAO', sequence: 11, arrivalTime: '13:05', departureTime: '13:15', dayOffset: 1 },
      { stationCode: 'CNO', sequence: 12, arrivalTime: '14:10', departureTime: '14:12', dayOffset: 1 },
      { stationCode: 'KAWR', sequence: 13, arrivalTime: '14:55', departureTime: '15:00', dayOffset: 1 },
      { stationCode: 'MAQ', sequence: 14, arrivalTime: '17:45', departureTime: '17:50', dayOffset: 1 },
      { stationCode: 'ERS', sequence: 15, arrivalTime: '05:00', dayOffset: 2 },
    ],
  },

  // ─────────────────────────────────────────────
  // 8. Goa Rajdhani Express — NZM → MAO
  // ─────────────────────────────────────────────
  {
    id: '22414',
    trainNumber: '22414',
    name: 'Goa Rajdhani Express',
    sourceStationCode: 'NZM',
    destinationStationCode: 'MAO',
    runningDays: [5, 6],
    type: 'Rajdhani',
    stops: [
      { stationCode: 'NZM', sequence: 1, departureTime: '10:05', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '03:50', departureTime: '03:55', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '05:10', departureTime: '05:12', dayOffset: 1 },
      { stationCode: 'RN', sequence: 4, arrivalTime: '08:55', departureTime: '09:05', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 5, arrivalTime: '11:20', departureTime: '11:22', dayOffset: 1 },
      { stationCode: 'SWV', sequence: 6, arrivalTime: '12:10', departureTime: '12:12', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 7, arrivalTime: '13:05', departureTime: '13:07', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 8, arrivalTime: '13:32', departureTime: '13:34', dayOffset: 1 },
      { stationCode: 'MAO', sequence: 9, arrivalTime: '14:00', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 9. Konkan Kanya Express — CSMT → MAO
  // ─────────────────────────────────────────────
  {
    id: '20111',
    trainNumber: '20111',
    name: 'Konkan Kanya Express',
    sourceStationCode: 'CSMT',
    destinationStationCode: 'MAO',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    type: 'Express',
    stops: [
      { stationCode: 'CSMT', sequence: 1, departureTime: '22:10', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '23:30', departureTime: '23:35', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '00:52', departureTime: '00:55', dayOffset: 1 },
      { stationCode: 'CHI', sequence: 4, arrivalTime: '02:55', departureTime: '03:00', dayOffset: 1 },
      { stationCode: 'RN', sequence: 5, arrivalTime: '04:55', departureTime: '05:05', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 6, arrivalTime: '07:37', departureTime: '07:40', dayOffset: 1 },
      { stationCode: 'KUDL', sequence: 7, arrivalTime: '08:30', departureTime: '08:32', dayOffset: 1 },
      { stationCode: 'SWV', sequence: 8, arrivalTime: '09:18', departureTime: '09:20', dayOffset: 1 },
      { stationCode: 'PER', sequence: 9, arrivalTime: '10:10', departureTime: '10:12', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 10, arrivalTime: '10:45', departureTime: '10:47', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 11, arrivalTime: '11:15', departureTime: '11:17', dayOffset: 1 },
      { stationCode: 'MAO', sequence: 12, arrivalTime: '11:50', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 10. Tejas Express — CSMT → MAO
  // ─────────────────────────────────────────────
  {
    id: '22119',
    trainNumber: '22119',
    name: 'Tejas Express',
    sourceStationCode: 'CSMT',
    destinationStationCode: 'MAO',
    runningDays: [2, 4, 6],
    type: 'Tejas',
    stops: [
      { stationCode: 'CSMT', sequence: 1, departureTime: '05:45', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '06:52', departureTime: '06:57', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '08:10', departureTime: '08:12', dayOffset: 0 },
      { stationCode: 'CHI', sequence: 4, arrivalTime: '10:00', departureTime: '10:02', dayOffset: 0 },
      { stationCode: 'RN', sequence: 5, arrivalTime: '11:55', departureTime: '12:00', dayOffset: 0 },
      { stationCode: 'KKW', sequence: 6, arrivalTime: '14:15', departureTime: '14:17', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 7, arrivalTime: '15:05', departureTime: '15:07', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 8, arrivalTime: '16:00', departureTime: '16:02', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 9, arrivalTime: '16:30', departureTime: '16:32', dayOffset: 0 },
      { stationCode: 'MAO', sequence: 10, arrivalTime: '17:00', dayOffset: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 11. Tutari Express — DR → SWV
  // ─────────────────────────────────────────────
  {
    id: '11003',
    trainNumber: '11003',
    name: 'Tutari Express',
    sourceStationCode: 'DR',
    destinationStationCode: 'SWV',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    type: 'Express',
    stops: [
      { stationCode: 'DR', sequence: 1, departureTime: '00:05', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '01:15', departureTime: '01:20', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '02:38', departureTime: '02:40', dayOffset: 0 },
      { stationCode: 'CHI', sequence: 4, arrivalTime: '04:48', departureTime: '04:50', dayOffset: 0 },
      { stationCode: 'RN', sequence: 5, arrivalTime: '06:50', departureTime: '07:00', dayOffset: 0 },
      { stationCode: 'KKW', sequence: 6, arrivalTime: '09:50', departureTime: '09:52', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 7, arrivalTime: '10:40', departureTime: '10:42', dayOffset: 0 },
      { stationCode: 'SWV', sequence: 8, arrivalTime: '12:50', dayOffset: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 12. Sindhudurg Express — DIV → SWV
  // ─────────────────────────────────────────────
  {
    id: '10105',
    trainNumber: '10105',
    name: 'Sindhudurg Express',
    sourceStationCode: 'DIV',
    destinationStationCode: 'SWV',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    type: 'Express',
    stops: [
      { stationCode: 'DIV', sequence: 1, departureTime: '06:25', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '07:32', departureTime: '07:35', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '08:52', departureTime: '08:54', dayOffset: 0 },
      { stationCode: 'CHI', sequence: 4, arrivalTime: '11:02', departureTime: '11:04', dayOffset: 0 },
      { stationCode: 'RN', sequence: 5, arrivalTime: '13:00', departureTime: '13:10', dayOffset: 0 },
      { stationCode: 'KKW', sequence: 6, arrivalTime: '16:00', departureTime: '16:02', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 7, arrivalTime: '16:50', departureTime: '16:52', dayOffset: 0 },
      { stationCode: 'SWV', sequence: 8, arrivalTime: '18:45', dayOffset: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 13. Bandra–Madgaon Express — BDTS → MAO
  // ─────────────────────────────────────────────
  {
    id: '10115',
    trainNumber: '10115',
    name: 'Bandra–Madgaon Express',
    sourceStationCode: 'BDTS',
    destinationStationCode: 'MAO',
    runningDays: [3, 5],
    type: 'Express',
    stops: [
      { stationCode: 'BDTS', sequence: 1, departureTime: '07:10', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '08:35', departureTime: '08:40', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '10:00', departureTime: '10:02', dayOffset: 0 },
      { stationCode: 'RN', sequence: 4, arrivalTime: '14:10', departureTime: '14:20', dayOffset: 0 },
      { stationCode: 'KKW', sequence: 5, arrivalTime: '17:10', departureTime: '17:12', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 6, arrivalTime: '18:00', departureTime: '18:02', dayOffset: 0 },
      { stationCode: 'SWV', sequence: 7, arrivalTime: '18:50', departureTime: '18:52', dayOffset: 0 },
      { stationCode: 'PER', sequence: 8, arrivalTime: '19:45', departureTime: '19:47', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 9, arrivalTime: '20:22', departureTime: '20:25', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 10, arrivalTime: '20:55', departureTime: '20:57', dayOffset: 0 },
      { stationCode: 'MAO', sequence: 11, arrivalTime: '21:30', dayOffset: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 14. LTT–Madgaon Express — LTT → MAO
  // ─────────────────────────────────────────────
  {
    id: '11099',
    trainNumber: '11099',
    name: 'LTT–Madgaon Express',
    sourceStationCode: 'LTT',
    destinationStationCode: 'MAO',
    runningDays: [5, 0],
    type: 'Express',
    stops: [
      { stationCode: 'LTT', sequence: 1, departureTime: '16:40', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '17:45', departureTime: '17:50', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '19:10', departureTime: '19:12', dayOffset: 0 },
      { stationCode: 'RN', sequence: 4, arrivalTime: '23:10', departureTime: '23:20', dayOffset: 0 },
      { stationCode: 'KKW', sequence: 5, arrivalTime: '02:15', departureTime: '02:17', dayOffset: 1 },
      { stationCode: 'KUDL', sequence: 6, arrivalTime: '03:05', departureTime: '03:07', dayOffset: 1 },
      { stationCode: 'SWV', sequence: 7, arrivalTime: '03:50', departureTime: '03:52', dayOffset: 1 },
      { stationCode: 'PER', sequence: 8, arrivalTime: '04:45', departureTime: '04:47', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 9, arrivalTime: '05:22', departureTime: '05:25', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 10, arrivalTime: '05:55', departureTime: '05:57', dayOffset: 1 },
      { stationCode: 'MAO', sequence: 11, arrivalTime: '06:30', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 15. CSMT–Mangaluru Express — CSMT → MAQ
  // ─────────────────────────────────────────────
  {
    id: '12133',
    trainNumber: '12133',
    name: 'CSMT–Mangaluru Express',
    sourceStationCode: 'CSMT',
    destinationStationCode: 'MAQ',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    type: 'Express',
    stops: [
      { stationCode: 'CSMT', sequence: 1, departureTime: '09:05', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '10:30', departureTime: '10:32', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '11:50', departureTime: '11:52', dayOffset: 0 },
      { stationCode: 'CHI', sequence: 4, arrivalTime: '14:00', departureTime: '14:05', dayOffset: 0 },
      { stationCode: 'RN', sequence: 5, arrivalTime: '16:00', departureTime: '16:10', dayOffset: 0 },
      { stationCode: 'KKW', sequence: 6, arrivalTime: '18:55', departureTime: '18:57', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 7, arrivalTime: '19:45', departureTime: '19:47', dayOffset: 0 },
      { stationCode: 'SWV', sequence: 8, arrivalTime: '20:30', departureTime: '20:32', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 9, arrivalTime: '21:25', departureTime: '21:27', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 10, arrivalTime: '21:55', departureTime: '21:57', dayOffset: 0 },
      { stationCode: 'MAO', sequence: 11, arrivalTime: '22:30', departureTime: '22:40', dayOffset: 0 },
      { stationCode: 'CNO', sequence: 12, arrivalTime: '23:35', departureTime: '23:37', dayOffset: 0 },
      { stationCode: 'KAWR', sequence: 13, arrivalTime: '00:20', departureTime: '00:25', dayOffset: 1 },
      { stationCode: 'MAQ', sequence: 14, arrivalTime: '03:00', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 16. Amritsar–Kochuveli SF Express — ASR → KCVL
  // ─────────────────────────────────────────────
  {
    id: '12484',
    trainNumber: '12484',
    name: 'Amritsar–Kochuveli SF Express',
    sourceStationCode: 'ASR',
    destinationStationCode: 'KCVL',
    runningDays: [0],
    type: 'Express',
    stops: [
      { stationCode: 'ASR', sequence: 1, departureTime: '04:10', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '13:45', departureTime: '13:55', dayOffset: 1 },
      { stationCode: 'RN', sequence: 3, arrivalTime: '19:20', departureTime: '19:30', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 4, arrivalTime: '22:15', departureTime: '22:17', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 5, arrivalTime: '23:40', departureTime: '23:42', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 6, arrivalTime: '00:10', departureTime: '00:12', dayOffset: 2 },
      { stationCode: 'MAO', sequence: 7, arrivalTime: '00:50', departureTime: '01:00', dayOffset: 2 },
      { stationCode: 'KCVL', sequence: 8, arrivalTime: '18:00', dayOffset: 2 },
    ],
  },

  // ─────────────────────────────────────────────
  // 17. Patna–Vasco Express — PNBE → VSG
  // ─────────────────────────────────────────────
  {
    id: '12742',
    trainNumber: '12742',
    name: 'Patna–Vasco Express',
    sourceStationCode: 'PNBE',
    destinationStationCode: 'VSG',
    runningDays: [6],
    type: 'Express',
    stops: [
      { stationCode: 'PNBE', sequence: 1, departureTime: '20:55', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '13:30', departureTime: '13:40', dayOffset: 2 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '15:00', departureTime: '15:02', dayOffset: 2 },
      { stationCode: 'RN', sequence: 4, arrivalTime: '19:00', departureTime: '19:10', dayOffset: 2 },
      { stationCode: 'KKW', sequence: 5, arrivalTime: '21:50', departureTime: '21:52', dayOffset: 2 },
      { stationCode: 'SWV', sequence: 6, arrivalTime: '22:45', departureTime: '22:47', dayOffset: 2 },
      { stationCode: 'PER', sequence: 7, arrivalTime: '23:35', departureTime: '23:37', dayOffset: 2 },
      { stationCode: 'THVM', sequence: 8, arrivalTime: '00:10', departureTime: '00:15', dayOffset: 3 },
      { stationCode: 'KRMI', sequence: 9, arrivalTime: '00:42', departureTime: '00:44', dayOffset: 3 },
      { stationCode: 'MAO', sequence: 10, arrivalTime: '01:20', departureTime: '01:35', dayOffset: 3 },
      { stationCode: 'VSG', sequence: 11, arrivalTime: '03:00', dayOffset: 3 },
    ],
  },

  // ─────────────────────────────────────────────
  // 18. Gandhidham–Nagercoil Express — GIMB → NCJ
  // ─────────────────────────────────────────────
  {
    id: '16335',
    trainNumber: '16335',
    name: 'Gandhidham–Nagercoil Express',
    sourceStationCode: 'GIMB',
    destinationStationCode: 'NCJ',
    runningDays: [5],
    type: 'Express',
    stops: [
      { stationCode: 'GIMB', sequence: 1, departureTime: '10:10', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '09:50', departureTime: '10:00', dayOffset: 1 },
      { stationCode: 'RN', sequence: 3, arrivalTime: '15:10', departureTime: '15:20', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 4, arrivalTime: '18:05', departureTime: '18:07', dayOffset: 1 },
      { stationCode: 'SWV', sequence: 5, arrivalTime: '19:00', departureTime: '19:02', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 6, arrivalTime: '19:55', departureTime: '19:57', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 7, arrivalTime: '20:25', departureTime: '20:27', dayOffset: 1 },
      { stationCode: 'MAO', sequence: 8, arrivalTime: '21:05', departureTime: '21:15', dayOffset: 1 },
      { stationCode: 'NCJ', sequence: 9, arrivalTime: '22:00', dayOffset: 2 },
    ],
  },

  // ─────────────────────────────────────────────
  // 19. Bhavnagar–Kochuveli Express — BVC → KCVL
  // ─────────────────────────────────────────────
  {
    id: '19260',
    trainNumber: '19260',
    name: 'Bhavnagar–Kochuveli Express',
    sourceStationCode: 'BVC',
    destinationStationCode: 'KCVL',
    runningDays: [2],
    type: 'Express',
    stops: [
      { stationCode: 'BVC', sequence: 1, departureTime: '13:35', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '00:45', departureTime: '00:50', dayOffset: 1 },
      { stationCode: 'RN', sequence: 3, arrivalTime: '06:15', departureTime: '06:25', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 4, arrivalTime: '09:10', departureTime: '09:12', dayOffset: 1 },
      { stationCode: 'SNS', sequence: 5, arrivalTime: '10:00', departureTime: '10:02', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 6, arrivalTime: '11:05', departureTime: '11:07', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 7, arrivalTime: '11:35', departureTime: '11:37', dayOffset: 1 },
      { stationCode: 'MAO', sequence: 8, arrivalTime: '12:15', departureTime: '12:25', dayOffset: 1 },
      { stationCode: 'KCVL', sequence: 9, arrivalTime: '06:00', dayOffset: 2 },
    ],
  },

  // ─────────────────────────────────────────────
  // 20. LTT–Thiruvananthapuram Express — LTT → TVC
  // ─────────────────────────────────────────────
  {
    id: '22113',
    trainNumber: '22113',
    name: 'LTT–Thiruvananthapuram Express',
    sourceStationCode: 'LTT',
    destinationStationCode: 'TVC',
    runningDays: [2, 6],
    type: 'Express',
    stops: [
      { stationCode: 'LTT', sequence: 1, departureTime: '17:50', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '18:55', departureTime: '18:58', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '20:15', departureTime: '20:17', dayOffset: 0 },
      { stationCode: 'RN', sequence: 4, arrivalTime: '23:15', departureTime: '23:25', dayOffset: 0 },
      { stationCode: 'KKW', sequence: 5, arrivalTime: '02:20', departureTime: '02:22', dayOffset: 1 },
      { stationCode: 'SNS', sequence: 6, arrivalTime: '03:10', departureTime: '03:12', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 7, arrivalTime: '04:15', departureTime: '04:17', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 8, arrivalTime: '04:45', departureTime: '04:47', dayOffset: 1 },
      { stationCode: 'MAO', sequence: 9, arrivalTime: '05:25', departureTime: '05:35', dayOffset: 1 },
      { stationCode: 'TVC', sequence: 10, arrivalTime: '07:00', dayOffset: 2 },
    ],
  },

  // ─────────────────────────────────────────────
  // 21. LTT–Karmali AC Express — LTT → KRMI
  // ─────────────────────────────────────────────
  {
    id: '22115',
    trainNumber: '22115',
    name: 'LTT–Karmali AC Express',
    sourceStationCode: 'LTT',
    destinationStationCode: 'KRMI',
    runningDays: [4],
    type: 'Express',
    stops: [
      { stationCode: 'LTT', sequence: 1, departureTime: '08:30', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '09:35', departureTime: '09:38', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '10:55', departureTime: '10:57', dayOffset: 0 },
      { stationCode: 'RN', sequence: 4, arrivalTime: '13:55', departureTime: '14:05', dayOffset: 0 },
      { stationCode: 'KKW', sequence: 5, arrivalTime: '16:40', departureTime: '16:42', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 6, arrivalTime: '17:30', departureTime: '17:32', dayOffset: 0 },
      { stationCode: 'SWV', sequence: 7, arrivalTime: '18:15', departureTime: '18:17', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 8, arrivalTime: '19:15', departureTime: '19:17', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 9, arrivalTime: '19:45', dayOffset: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 22. Pune–Ernakulam SF Express — PUNE → ERS
  // ─────────────────────────────────────────────
  {
    id: '22150',
    trainNumber: '22150',
    name: 'Pune–Ernakulam SF Express',
    sourceStationCode: 'PUNE',
    destinationStationCode: 'ERS',
    runningDays: [3, 0],
    type: 'Express',
    stops: [
      { stationCode: 'PUNE', sequence: 1, departureTime: '22:45', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '00:35', departureTime: '00:38', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '02:00', departureTime: '02:02', dayOffset: 1 },
      { stationCode: 'RN', sequence: 4, arrivalTime: '05:00', departureTime: '05:10', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 5, arrivalTime: '07:55', departureTime: '07:57', dayOffset: 1 },
      { stationCode: 'SWV', sequence: 6, arrivalTime: '08:50', departureTime: '08:52', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 7, arrivalTime: '09:47', departureTime: '09:49', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 8, arrivalTime: '10:17', departureTime: '10:19', dayOffset: 1 },
      { stationCode: 'MAO', sequence: 9, arrivalTime: '10:55', departureTime: '11:05', dayOffset: 1 },
      { stationCode: 'ERS', sequence: 10, arrivalTime: '06:00', dayOffset: 2 },
    ],
  },

  // ─────────────────────────────────────────────
  // 23. Hisar–Coimbatore Express — HSR → CBE
  // ─────────────────────────────────────────────
  {
    id: '22475',
    trainNumber: '22475',
    name: 'Hisar–Coimbatore Express',
    sourceStationCode: 'HSR',
    destinationStationCode: 'CBE',
    runningDays: [4],
    type: 'Express',
    stops: [
      { stationCode: 'HSR', sequence: 1, departureTime: '10:55', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '07:15', departureTime: '07:20', dayOffset: 1 },
      { stationCode: 'RN', sequence: 3, arrivalTime: '12:35', departureTime: '12:45', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 4, arrivalTime: '15:30', departureTime: '15:32', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 5, arrivalTime: '16:55', departureTime: '16:57', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 6, arrivalTime: '17:25', departureTime: '17:27', dayOffset: 1 },
      { stationCode: 'MAO', sequence: 7, arrivalTime: '18:05', departureTime: '18:15', dayOffset: 1 },
      { stationCode: 'CBE', sequence: 8, arrivalTime: '12:00', dayOffset: 2 },
    ],
  },

  // ─────────────────────────────────────────────
  // 24. Dadar–Tirunelveli Express — DR → TEN
  // ─────────────────────────────────────────────
  {
    id: '22629',
    trainNumber: '22629',
    name: 'Dadar–Tirunelveli Express',
    sourceStationCode: 'DR',
    destinationStationCode: 'TEN',
    runningDays: [4],
    type: 'Express',
    stops: [
      { stationCode: 'DR', sequence: 1, departureTime: '23:10', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '00:20', departureTime: '00:25', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '01:45', departureTime: '01:47', dayOffset: 1 },
      { stationCode: 'RN', sequence: 4, arrivalTime: '04:40', departureTime: '04:50', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 5, arrivalTime: '07:30', departureTime: '07:32', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 6, arrivalTime: '08:55', departureTime: '08:57', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 7, arrivalTime: '09:25', departureTime: '09:27', dayOffset: 1 },
      { stationCode: 'MAO', sequence: 8, arrivalTime: '10:05', departureTime: '10:15', dayOffset: 1 },
      { stationCode: 'TEN', sequence: 9, arrivalTime: '08:00', dayOffset: 2 },
    ],
  },

  // ─────────────────────────────────────────────
  // 25. NZM–Thiruvananthapuram SF Express — NZM → TVC
  // ─────────────────────────────────────────────
  {
    id: '22634',
    trainNumber: '22634',
    name: 'NZM–Thiruvananthapuram SF Express',
    sourceStationCode: 'NZM',
    destinationStationCode: 'TVC',
    runningDays: [5],
    type: 'Express',
    stops: [
      { stationCode: 'NZM', sequence: 1, departureTime: '06:25', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '06:25', departureTime: '06:30', dayOffset: 1 },
      { stationCode: 'RN', sequence: 3, arrivalTime: '11:45', departureTime: '11:55', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 4, arrivalTime: '14:40', departureTime: '14:42', dayOffset: 1 },
      { stationCode: 'SNS', sequence: 5, arrivalTime: '15:30', departureTime: '15:32', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 6, arrivalTime: '16:35', departureTime: '16:37', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 7, arrivalTime: '17:05', departureTime: '17:07', dayOffset: 1 },
      { stationCode: 'MAO', sequence: 8, arrivalTime: '17:45', departureTime: '17:55', dayOffset: 1 },
      { stationCode: 'TVC', sequence: 9, arrivalTime: '11:00', dayOffset: 2 },
    ],
  },

  // ─────────────────────────────────────────────
  // 26. Diva–Ratnagiri Passenger — DIV → RN
  // ─────────────────────────────────────────────
  {
    id: '50103',
    trainNumber: '50103',
    name: 'Diva–Ratnagiri Passenger',
    sourceStationCode: 'DIV',
    destinationStationCode: 'RN',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    type: 'Passenger',
    stops: [
      { stationCode: 'DIV', sequence: 1, departureTime: '06:40', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '07:50', departureTime: '07:55', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '09:25', departureTime: '09:30', dayOffset: 0 },
      { stationCode: 'RN', sequence: 4, arrivalTime: '14:35', dayOffset: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 27. Nagpur–Madgaon Express — NGP → MAO
  // ─────────────────────────────────────────────
  {
    id: '11203',
    trainNumber: '11203',
    name: 'Nagpur–Madgaon Express',
    sourceStationCode: 'NGP',
    destinationStationCode: 'MAO',
    runningDays: [3, 6],
    type: 'Express',
    stops: [
      { stationCode: 'NGP', sequence: 1, departureTime: '18:10', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '07:25', departureTime: '07:30', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '08:50', departureTime: '08:52', dayOffset: 1 },
      { stationCode: 'RN', sequence: 4, arrivalTime: '12:55', departureTime: '13:05', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 5, arrivalTime: '15:55', departureTime: '15:57', dayOffset: 1 },
      { stationCode: 'SWV', sequence: 6, arrivalTime: '16:50', departureTime: '16:52', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 7, arrivalTime: '17:45', departureTime: '17:47', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 8, arrivalTime: '18:15', departureTime: '18:17', dayOffset: 1 },
      { stationCode: 'MAO', sequence: 9, arrivalTime: '18:55', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 28. Surat–Mangaluru Express — ST → MAQ
  // ─────────────────────────────────────────────
  {
    id: '19057',
    trainNumber: '19057',
    name: 'Surat–Mangaluru Express',
    sourceStationCode: 'ST',
    destinationStationCode: 'MAQ',
    runningDays: [3, 0],
    type: 'Express',
    stops: [
      { stationCode: 'ST', sequence: 1, departureTime: '17:25', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '04:55', departureTime: '05:00', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '06:20', departureTime: '06:22', dayOffset: 1 },
      { stationCode: 'RN', sequence: 4, arrivalTime: '10:30', departureTime: '10:40', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 5, arrivalTime: '13:25', departureTime: '13:27', dayOffset: 1 },
      { stationCode: 'SWV', sequence: 6, arrivalTime: '14:20', departureTime: '14:22', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 7, arrivalTime: '15:15', departureTime: '15:17', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 8, arrivalTime: '15:45', departureTime: '15:47', dayOffset: 1 },
      { stationCode: 'MAO', sequence: 9, arrivalTime: '16:25', departureTime: '16:35', dayOffset: 1 },
      { stationCode: 'CNO', sequence: 10, arrivalTime: '17:35', departureTime: '17:37', dayOffset: 1 },
      { stationCode: 'KAWR', sequence: 11, arrivalTime: '18:25', departureTime: '18:30', dayOffset: 1 },
      { stationCode: 'MAQ', sequence: 12, arrivalTime: '21:05', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 29. Hapa–Madgaon Express — HAPA → MAO
  // ─────────────────────────────────────────────
  {
    id: '22908',
    trainNumber: '22908',
    name: 'Hapa–Madgaon Express',
    sourceStationCode: 'HAPA',
    destinationStationCode: 'MAO',
    runningDays: [3],
    type: 'Express',
    stops: [
      { stationCode: 'HAPA', sequence: 1, departureTime: '09:35', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '12:55', departureTime: '13:00', dayOffset: 1 },
      { stationCode: 'RN', sequence: 3, arrivalTime: '18:15', departureTime: '18:25', dayOffset: 1 },
      { stationCode: 'KUDL', sequence: 4, arrivalTime: '21:55', departureTime: '21:57', dayOffset: 1 },
      { stationCode: 'SWV', sequence: 5, arrivalTime: '22:45', departureTime: '22:47', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 6, arrivalTime: '23:40', departureTime: '23:42', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 7, arrivalTime: '00:10', departureTime: '00:12', dayOffset: 2 },
      { stationCode: 'MAO', sequence: 8, arrivalTime: '00:45', dayOffset: 2 },
    ],
  },

  // ─────────────────────────────────────────────
  // 30. Shri Ganganagar–Kochuveli Express — SGNR → KCVL
  // ─────────────────────────────────────────────
  {
    id: '16311',
    trainNumber: '16311',
    name: 'Shri Ganganagar–Kochuveli Express',
    sourceStationCode: 'SGNR',
    destinationStationCode: 'KCVL',
    runningDays: [2],
    type: 'Express',
    stops: [
      { stationCode: 'SGNR', sequence: 1, departureTime: '14:10', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '22:35', departureTime: '22:40', dayOffset: 1 },
      { stationCode: 'RN', sequence: 3, arrivalTime: '03:55', departureTime: '04:05', dayOffset: 2 },
      { stationCode: 'KKW', sequence: 4, arrivalTime: '06:50', departureTime: '06:52', dayOffset: 2 },
      { stationCode: 'KUDL', sequence: 5, arrivalTime: '07:40', departureTime: '07:42', dayOffset: 2 },
      { stationCode: 'THVM', sequence: 6, arrivalTime: '08:55', departureTime: '08:57', dayOffset: 2 },
      { stationCode: 'KRMI', sequence: 7, arrivalTime: '09:25', departureTime: '09:27', dayOffset: 2 },
      { stationCode: 'MAO', sequence: 8, arrivalTime: '10:05', departureTime: '10:15', dayOffset: 2 },
      { stationCode: 'KCVL', sequence: 9, arrivalTime: '22:45', dayOffset: 3 },
    ],
  },

  // ─────────────────────────────────────────────
  // 31. Veraval–TVC Express — VRL → TVC
  // ─────────────────────────────────────────────
  {
    id: '16333',
    trainNumber: '16333',
    name: 'Veraval–TVC Express',
    sourceStationCode: 'VRL',
    destinationStationCode: 'TVC',
    runningDays: [4],
    type: 'Express',
    stops: [
      { stationCode: 'VRL', sequence: 1, departureTime: '06:55', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '23:52', departureTime: '23:55', dayOffset: 0 },
      { stationCode: 'RN', sequence: 3, arrivalTime: '05:10', departureTime: '05:15', dayOffset: 1 },
      { stationCode: 'KUDL', sequence: 4, arrivalTime: '08:00', departureTime: '08:02', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 5, arrivalTime: '09:38', departureTime: '09:40', dayOffset: 1 },
      { stationCode: 'MAO', sequence: 6, arrivalTime: '10:40', departureTime: '10:50', dayOffset: 1 },
      { stationCode: 'TVC', sequence: 7, arrivalTime: '07:15', dayOffset: 2 },
    ],
  },

  // ─────────────────────────────────────────────
  // 32. Indore–Kochuveli Express — INDB → KCVL
  // ─────────────────────────────────────────────
  {
    id: '20932',
    trainNumber: '20932',
    name: 'Indore–Kochuveli Express',
    sourceStationCode: 'INDB',
    destinationStationCode: 'KCVL',
    runningDays: [2],
    type: 'Express',
    stops: [
      { stationCode: 'INDB', sequence: 1, departureTime: '08:40', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '06:50', departureTime: '06:55', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '08:15', departureTime: '08:17', dayOffset: 1 },
      { stationCode: 'RN', sequence: 4, arrivalTime: '12:15', departureTime: '12:25', dayOffset: 1 },
      { stationCode: 'KUDL', sequence: 5, arrivalTime: '16:40', departureTime: '16:42', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 6, arrivalTime: '17:40', departureTime: '17:42', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 7, arrivalTime: '18:10', departureTime: '18:12', dayOffset: 1 },
      { stationCode: 'MAO', sequence: 8, arrivalTime: '18:50', departureTime: '19:00', dayOffset: 1 },
      { stationCode: 'KCVL', sequence: 9, arrivalTime: '12:00', dayOffset: 2 },
    ],
  },

  // ─────────────────────────────────────────────
  // 33. Marusagar Express — JP → ERS
  // ─────────────────────────────────────────────
  {
    id: '12978',
    trainNumber: '12978',
    name: 'Marusagar Express',
    sourceStationCode: 'JP',
    destinationStationCode: 'ERS',
    runningDays: [1],
    type: 'Express',
    stops: [
      { stationCode: 'JP', sequence: 1, departureTime: '18:10', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '04:45', departureTime: '04:50', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '06:15', departureTime: '06:17', dayOffset: 1 },
      { stationCode: 'RN', sequence: 4, arrivalTime: '10:25', departureTime: '10:35', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 5, arrivalTime: '13:15', departureTime: '13:17', dayOffset: 1 },
      { stationCode: 'SNS', sequence: 6, arrivalTime: '14:05', departureTime: '14:07', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 7, arrivalTime: '15:10', departureTime: '15:12', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 8, arrivalTime: '15:40', departureTime: '15:42', dayOffset: 1 },
      { stationCode: 'MAO', sequence: 9, arrivalTime: '16:20', departureTime: '16:30', dayOffset: 1 },
      { stationCode: 'ERS', sequence: 10, arrivalTime: '10:00', dayOffset: 2 },
    ],
  },

  // ─────────────────────────────────────────────
  // 34. NZM–Ernakulam Express — NZM → ERS
  // ─────────────────────────────────────────────
  {
    id: '22656',
    trainNumber: '22656',
    name: 'NZM–Ernakulam Express',
    sourceStationCode: 'NZM',
    destinationStationCode: 'ERS',
    runningDays: [5],
    type: 'Express',
    stops: [
      { stationCode: 'NZM', sequence: 1, departureTime: '20:10', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '08:30', departureTime: '08:35', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 3, arrivalTime: '09:55', departureTime: '09:57', dayOffset: 1 },
      { stationCode: 'RN', sequence: 4, arrivalTime: '14:05', departureTime: '14:15', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 5, arrivalTime: '17:00', departureTime: '17:02', dayOffset: 1 },
      { stationCode: 'SNS', sequence: 6, arrivalTime: '17:50', departureTime: '17:52', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 7, arrivalTime: '18:55', departureTime: '18:57', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 8, arrivalTime: '19:25', departureTime: '19:27', dayOffset: 1 },
      { stationCode: 'MAO', sequence: 9, arrivalTime: '20:05', departureTime: '20:15', dayOffset: 1 },
      { stationCode: 'ERS', sequence: 10, arrivalTime: '14:00', dayOffset: 2 },
    ],
  },

  // ─────────────────────────────────────────────
  // 35. Okha–Ernakulam Express — OKHA → ERS
  // ─────────────────────────────────────────────
  {
    id: '16337',
    trainNumber: '16337',
    name: 'Okha–Ernakulam Express',
    sourceStationCode: 'OKHA',
    destinationStationCode: 'ERS',
    runningDays: [1, 6],
    type: 'Express',
    stops: [
      { stationCode: 'OKHA', sequence: 1, departureTime: '06:45', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2, arrivalTime: '22:00', departureTime: '22:05', dayOffset: 1 },
      { stationCode: 'RN', sequence: 3, arrivalTime: '03:25', departureTime: '03:35', dayOffset: 2 },
      { stationCode: 'KKW', sequence: 4, arrivalTime: '06:25', departureTime: '06:27', dayOffset: 2 },
      { stationCode: 'THVM', sequence: 5, arrivalTime: '07:45', departureTime: '07:47', dayOffset: 2 },
      { stationCode: 'KRMI', sequence: 6, arrivalTime: '08:15', departureTime: '08:17', dayOffset: 2 },
      { stationCode: 'MAO', sequence: 7, arrivalTime: '08:55', departureTime: '09:05', dayOffset: 2 },
      { stationCode: 'ERS', sequence: 8, arrivalTime: '23:55', dayOffset: 2 },
    ],
  },

  // ─────────────────────────────────────────────
  // 36. Mandovi Express — MAO → CSMT
  // ─────────────────────────────────────────────
  {
    id: '10104',
    trainNumber: '10104',
    name: 'Mandovi Express',
    sourceStationCode: 'MAO',
    destinationStationCode: 'CSMT',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    type: 'Express',
    stops: [
      { stationCode: 'MAO', sequence: 1, departureTime: '07:15', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 2, arrivalTime: '07:50', departureTime: '07:52', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 3, arrivalTime: '08:20', departureTime: '08:25', dayOffset: 0 },
      { stationCode: 'PER', sequence: 4, arrivalTime: '09:05', departureTime: '09:07', dayOffset: 0 },
      { stationCode: 'SWV', sequence: 5, arrivalTime: '09:55', departureTime: '09:57', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 6, arrivalTime: '10:40', departureTime: '10:42', dayOffset: 0 },
      { stationCode: 'KKW', sequence: 7, arrivalTime: '11:30', departureTime: '11:32', dayOffset: 0 },
      { stationCode: 'RN', sequence: 8, arrivalTime: '14:25', departureTime: '14:35', dayOffset: 0 },
      { stationCode: 'CHI', sequence: 9, arrivalTime: '16:35', departureTime: '16:40', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 10, arrivalTime: '18:55', departureTime: '18:57', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 11, arrivalTime: '20:10', departureTime: '20:15', dayOffset: 0 },
      { stationCode: 'CSMT', sequence: 12, arrivalTime: '21:50', dayOffset: 0 },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  //  RETURN DIRECTION — GOA / KONKAN / SOUTH → MUMBAI / DELHI / NORTH
  // ═══════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────
  // 37. Jan Shatabdi Express — MAO → CSMT
  // ─────────────────────────────────────────────
  {
    id: '12052',
    trainNumber: '12052',
    name: 'Jan Shatabdi Express',
    sourceStationCode: 'MAO',
    destinationStationCode: 'CSMT',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    type: 'Express',
    stops: [
      { stationCode: 'MAO', sequence: 1, departureTime: '06:50', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 2, arrivalTime: '07:25', departureTime: '07:27', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 3, arrivalTime: '07:55', departureTime: '07:57', dayOffset: 0 },
      { stationCode: 'SWV', sequence: 4, arrivalTime: '08:50', departureTime: '08:52', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 5, arrivalTime: '09:37', departureTime: '09:39', dayOffset: 0 },
      { stationCode: 'KKW', sequence: 6, arrivalTime: '10:25', departureTime: '10:27', dayOffset: 0 },
      { stationCode: 'RN', sequence: 7, arrivalTime: '12:45', departureTime: '12:50', dayOffset: 0 },
      { stationCode: 'CHI', sequence: 8, arrivalTime: '14:40', departureTime: '14:42', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 9, arrivalTime: '16:38', departureTime: '16:40', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 10, arrivalTime: '17:58', departureTime: '18:00', dayOffset: 0 },
      { stationCode: 'CSMT', sequence: 11, arrivalTime: '19:25', dayOffset: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 38. Vande Bharat Express — MAO → CSMT
  // ─────────────────────────────────────────────
  {
    id: '22230',
    trainNumber: '22230',
    name: 'Vande Bharat Express',
    sourceStationCode: 'MAO',
    destinationStationCode: 'CSMT',
    runningDays: [2, 4, 6],
    type: 'VandeBharat',
    stops: [
      { stationCode: 'MAO', sequence: 1, departureTime: '08:00', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 2, arrivalTime: '08:30', departureTime: '08:32', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 3, arrivalTime: '09:00', departureTime: '09:02', dayOffset: 0 },
      { stationCode: 'KKW', sequence: 4, arrivalTime: '10:20', departureTime: '10:22', dayOffset: 0 },
      { stationCode: 'RN', sequence: 5, arrivalTime: '12:10', departureTime: '12:15', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 6, arrivalTime: '15:25', departureTime: '15:27', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 7, arrivalTime: '16:28', departureTime: '16:30', dayOffset: 0 },
      { stationCode: 'CSMT', sequence: 8, arrivalTime: '17:30', dayOffset: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 39. Matsyagandha Express — MAQ → LTT
  // ─────────────────────────────────────────────
  {
    id: '12620',
    trainNumber: '12620',
    name: 'Matsyagandha Express',
    sourceStationCode: 'MAQ',
    destinationStationCode: 'LTT',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    type: 'Express',
    stops: [
      { stationCode: 'MAQ', sequence: 1, departureTime: '20:45', dayOffset: 0 },
      { stationCode: 'CNO', sequence: 2, arrivalTime: '23:10', departureTime: '23:12', dayOffset: 0 },
      { stationCode: 'MAO', sequence: 3, arrivalTime: '00:10', departureTime: '00:25', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 4, arrivalTime: '00:58', departureTime: '01:00', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 5, arrivalTime: '01:28', departureTime: '01:30', dayOffset: 1 },
      { stationCode: 'KUDL', sequence: 6, arrivalTime: '02:48', departureTime: '02:50', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 7, arrivalTime: '03:35', departureTime: '03:37', dayOffset: 1 },
      { stationCode: 'RN', sequence: 8, arrivalTime: '06:45', departureTime: '06:55', dayOffset: 1 },
      { stationCode: 'CHI', sequence: 9, arrivalTime: '08:45', departureTime: '08:50', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 10, arrivalTime: '11:00', departureTime: '11:02', dayOffset: 1 },
      { stationCode: 'PNVL', sequence: 11, arrivalTime: '12:20', departureTime: '12:25', dayOffset: 1 },
      { stationCode: 'LTT', sequence: 12, arrivalTime: '13:35', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 40. Konkan Kanya Express — MAO → CSMT
  // ─────────────────────────────────────────────
  {
    id: '20112',
    trainNumber: '20112',
    name: 'Konkan Kanya Express',
    sourceStationCode: 'MAO',
    destinationStationCode: 'CSMT',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    type: 'Express',
    stops: [
      { stationCode: 'MAO', sequence: 1, departureTime: '14:05', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 2, arrivalTime: '14:40', departureTime: '14:42', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 3, arrivalTime: '15:10', departureTime: '15:12', dayOffset: 0 },
      { stationCode: 'PER', sequence: 4, arrivalTime: '15:50', departureTime: '15:52', dayOffset: 0 },
      { stationCode: 'SWV', sequence: 5, arrivalTime: '16:40', departureTime: '16:42', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 6, arrivalTime: '17:25', departureTime: '17:27', dayOffset: 0 },
      { stationCode: 'KKW', sequence: 7, arrivalTime: '18:15', departureTime: '18:17', dayOffset: 0 },
      { stationCode: 'RN', sequence: 8, arrivalTime: '20:55', departureTime: '21:00', dayOffset: 0 },
      { stationCode: 'CHI', sequence: 9, arrivalTime: '23:05', departureTime: '23:10', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 10, arrivalTime: '01:10', departureTime: '01:12', dayOffset: 1 },
      { stationCode: 'PNVL', sequence: 11, arrivalTime: '02:25', departureTime: '02:30', dayOffset: 1 },
      { stationCode: 'CSMT', sequence: 12, arrivalTime: '03:50', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 41. Tejas Express — MAO → CSMT
  // ─────────────────────────────────────────────
  {
    id: '22120',
    trainNumber: '22120',
    name: 'Tejas Express',
    sourceStationCode: 'MAO',
    destinationStationCode: 'CSMT',
    runningDays: [3, 5, 0],
    type: 'Tejas',
    stops: [
      { stationCode: 'MAO', sequence: 1, departureTime: '10:35', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 2, arrivalTime: '11:05', departureTime: '11:07', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 3, arrivalTime: '11:35', departureTime: '11:37', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 4, arrivalTime: '12:30', departureTime: '12:32', dayOffset: 0 },
      { stationCode: 'KKW', sequence: 5, arrivalTime: '13:20', departureTime: '13:22', dayOffset: 0 },
      { stationCode: 'RN', sequence: 6, arrivalTime: '15:35', departureTime: '15:40', dayOffset: 0 },
      { stationCode: 'CHI', sequence: 7, arrivalTime: '17:35', departureTime: '17:37', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 8, arrivalTime: '19:25', departureTime: '19:27', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 9, arrivalTime: '20:40', departureTime: '20:45', dayOffset: 0 },
      { stationCode: 'CSMT', sequence: 10, arrivalTime: '22:05', dayOffset: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 42. Goa Express — VSG → NZM
  // ─────────────────────────────────────────────
  {
    id: '12780',
    trainNumber: '12780',
    name: 'Goa Express',
    sourceStationCode: 'VSG',
    destinationStationCode: 'NZM',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    type: 'Express',
    stops: [
      { stationCode: 'VSG', sequence: 1, departureTime: '07:15', dayOffset: 0 },
      { stationCode: 'MAO', sequence: 2, arrivalTime: '08:40', departureTime: '09:00', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 3, arrivalTime: '09:35', departureTime: '09:37', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 4, arrivalTime: '10:05', departureTime: '10:10', dayOffset: 0 },
      { stationCode: 'PER', sequence: 5, arrivalTime: '10:50', departureTime: '10:52', dayOffset: 0 },
      { stationCode: 'SWV', sequence: 6, arrivalTime: '11:40', departureTime: '11:42', dayOffset: 0 },
      { stationCode: 'KKW', sequence: 7, arrivalTime: '12:35', departureTime: '12:37', dayOffset: 0 },
      { stationCode: 'RN', sequence: 8, arrivalTime: '15:20', departureTime: '15:30', dayOffset: 0 },
      { stationCode: 'CHI', sequence: 9, arrivalTime: '17:25', departureTime: '17:30', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 10, arrivalTime: '19:20', departureTime: '19:22', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 11, arrivalTime: '20:40', departureTime: '20:45', dayOffset: 0 },
      { stationCode: 'NZM', sequence: 12, arrivalTime: '15:45', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 43. Goa Rajdhani Express — MAO → NZM
  // ─────────────────────────────────────────────
  {
    id: '22413',
    trainNumber: '22413',
    name: 'Goa Rajdhani Express',
    sourceStationCode: 'MAO',
    destinationStationCode: 'NZM',
    runningDays: [2, 3],
    type: 'Rajdhani',
    stops: [
      { stationCode: 'MAO', sequence: 1, departureTime: '14:45', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 2, arrivalTime: '15:12', departureTime: '15:14', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 3, arrivalTime: '15:40', departureTime: '15:42', dayOffset: 0 },
      { stationCode: 'SWV', sequence: 4, arrivalTime: '16:35', departureTime: '16:37', dayOffset: 0 },
      { stationCode: 'KKW', sequence: 5, arrivalTime: '17:25', departureTime: '17:27', dayOffset: 0 },
      { stationCode: 'RN', sequence: 6, arrivalTime: '20:10', departureTime: '20:20', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 7, arrivalTime: '00:50', departureTime: '00:52', dayOffset: 1 },
      { stationCode: 'PNVL', sequence: 8, arrivalTime: '02:05', departureTime: '02:10', dayOffset: 1 },
      { stationCode: 'NZM', sequence: 9, arrivalTime: '19:55', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 44. Netravati Express — TVC → LTT
  // ─────────────────────────────────────────────
  {
    id: '16346',
    trainNumber: '16346',
    name: 'Netravati Express',
    sourceStationCode: 'TVC',
    destinationStationCode: 'LTT',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    type: 'Express',
    stops: [
      { stationCode: 'TVC', sequence: 1, departureTime: '11:00', dayOffset: 0 },
      { stationCode: 'MAQ', sequence: 2, arrivalTime: '23:30', departureTime: '23:40', dayOffset: 0 },
      { stationCode: 'CNO', sequence: 3, arrivalTime: '02:50', departureTime: '02:52', dayOffset: 1 },
      { stationCode: 'MAO', sequence: 4, arrivalTime: '03:45', departureTime: '04:00', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 5, arrivalTime: '04:33', departureTime: '04:35', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 6, arrivalTime: '05:05', departureTime: '05:07', dayOffset: 1 },
      { stationCode: 'KUDL', sequence: 7, arrivalTime: '06:30', departureTime: '06:32', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 8, arrivalTime: '07:20', departureTime: '07:22', dayOffset: 1 },
      { stationCode: 'RN', sequence: 9, arrivalTime: '10:05', departureTime: '10:15', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 10, arrivalTime: '14:45', departureTime: '14:47', dayOffset: 1 },
      { stationCode: 'PNVL', sequence: 11, arrivalTime: '16:05', departureTime: '16:10', dayOffset: 1 },
      { stationCode: 'LTT', sequence: 12, arrivalTime: '17:20', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 45. Mangala Lakshadweep Express — ERS → NZM
  // ─────────────────────────────────────────────
  {
    id: '12618',
    trainNumber: '12618',
    name: 'Mangala Lakshadweep Express',
    sourceStationCode: 'ERS',
    destinationStationCode: 'NZM',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    type: 'Express',
    stops: [
      { stationCode: 'ERS', sequence: 1, departureTime: '18:30', dayOffset: 0 },
      { stationCode: 'MAQ', sequence: 2, arrivalTime: '07:00', departureTime: '07:10', dayOffset: 1 },
      { stationCode: 'CNO', sequence: 3, arrivalTime: '10:05', departureTime: '10:07', dayOffset: 1 },
      { stationCode: 'MAO', sequence: 4, arrivalTime: '11:05', departureTime: '11:20', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 5, arrivalTime: '11:55', departureTime: '11:57', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 6, arrivalTime: '12:25', departureTime: '12:27', dayOffset: 1 },
      { stationCode: 'PER', sequence: 7, arrivalTime: '13:05', departureTime: '13:07', dayOffset: 1 },
      { stationCode: 'SWV', sequence: 8, arrivalTime: '13:55', departureTime: '13:57', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 9, arrivalTime: '14:50', departureTime: '14:52', dayOffset: 1 },
      { stationCode: 'RN', sequence: 10, arrivalTime: '17:25', departureTime: '17:40', dayOffset: 1 },
      { stationCode: 'CHI', sequence: 11, arrivalTime: '19:30', departureTime: '19:35', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 12, arrivalTime: '21:25', departureTime: '21:27', dayOffset: 1 },
      { stationCode: 'PNVL', sequence: 13, arrivalTime: '22:45', departureTime: '22:50', dayOffset: 1 },
      { stationCode: 'NZM', sequence: 14, arrivalTime: '16:20', dayOffset: 2 },
    ],
  },

  // ─────────────────────────────────────────────
  // 46. Tutari Express — SWV → DR
  // ─────────────────────────────────────────────
  {
    id: '11004',
    trainNumber: '11004',
    name: 'Tutari Express',
    sourceStationCode: 'SWV',
    destinationStationCode: 'DR',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    type: 'Express',
    stops: [
      { stationCode: 'SWV', sequence: 1, departureTime: '13:35', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 2, arrivalTime: '14:05', departureTime: '14:07', dayOffset: 0 },
      { stationCode: 'KKW', sequence: 3, arrivalTime: '14:55', departureTime: '14:57', dayOffset: 0 },
      { stationCode: 'RN', sequence: 4, arrivalTime: '17:50', departureTime: '18:00', dayOffset: 0 },
      { stationCode: 'CHI', sequence: 5, arrivalTime: '20:00', departureTime: '20:02', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 6, arrivalTime: '22:05', departureTime: '22:07', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 7, arrivalTime: '23:20', departureTime: '23:25', dayOffset: 0 },
      { stationCode: 'DR', sequence: 8, arrivalTime: '00:30', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 47. Sindhudurg Express — SWV → DIV
  // ─────────────────────────────────────────────
  {
    id: '10106',
    trainNumber: '10106',
    name: 'Sindhudurg Express',
    sourceStationCode: 'SWV',
    destinationStationCode: 'DIV',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    type: 'Express',
    stops: [
      { stationCode: 'SWV', sequence: 1, departureTime: '19:45', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 2, arrivalTime: '20:40', departureTime: '20:42', dayOffset: 0 },
      { stationCode: 'KKW', sequence: 3, arrivalTime: '21:30', departureTime: '21:32', dayOffset: 0 },
      { stationCode: 'RN', sequence: 4, arrivalTime: '00:25', departureTime: '00:35', dayOffset: 1 },
      { stationCode: 'CHI', sequence: 5, arrivalTime: '02:35', departureTime: '02:37', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 6, arrivalTime: '04:45', departureTime: '04:47', dayOffset: 1 },
      { stationCode: 'PNVL', sequence: 7, arrivalTime: '06:05', departureTime: '06:10', dayOffset: 1 },
      { stationCode: 'DIV', sequence: 8, arrivalTime: '07:15', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 48. Bandra–Madgaon Express — MAO → BDTS
  // ─────────────────────────────────────────────
  {
    id: '10116',
    trainNumber: '10116',
    name: 'Bandra–Madgaon Express',
    sourceStationCode: 'MAO',
    destinationStationCode: 'BDTS',
    runningDays: [2, 4],
    type: 'Express',
    stops: [
      { stationCode: 'MAO', sequence: 1, departureTime: '08:25', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 2, arrivalTime: '09:00', departureTime: '09:02', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 3, arrivalTime: '09:30', departureTime: '09:32', dayOffset: 0 },
      { stationCode: 'PER', sequence: 4, arrivalTime: '10:08', departureTime: '10:10', dayOffset: 0 },
      { stationCode: 'SWV', sequence: 5, arrivalTime: '11:00', departureTime: '11:02', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 6, arrivalTime: '11:50', departureTime: '11:52', dayOffset: 0 },
      { stationCode: 'KKW', sequence: 7, arrivalTime: '12:38', departureTime: '12:40', dayOffset: 0 },
      { stationCode: 'RN', sequence: 8, arrivalTime: '15:25', departureTime: '15:35', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 9, arrivalTime: '19:40', departureTime: '19:42', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 10, arrivalTime: '21:00', departureTime: '21:05', dayOffset: 0 },
      { stationCode: 'BDTS', sequence: 11, arrivalTime: '22:30', dayOffset: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 49. LTT–Madgaon Express — MAO → LTT
  // ─────────────────────────────────────────────
  {
    id: '11100',
    trainNumber: '11100',
    name: 'LTT–Madgaon Express',
    sourceStationCode: 'MAO',
    destinationStationCode: 'LTT',
    runningDays: [6, 1],
    type: 'Express',
    stops: [
      { stationCode: 'MAO', sequence: 1, departureTime: '19:10', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 2, arrivalTime: '19:45', departureTime: '19:47', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 3, arrivalTime: '20:15', departureTime: '20:17', dayOffset: 0 },
      { stationCode: 'PER', sequence: 4, arrivalTime: '20:52', departureTime: '20:54', dayOffset: 0 },
      { stationCode: 'SWV', sequence: 5, arrivalTime: '21:45', departureTime: '21:47', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 6, arrivalTime: '22:30', departureTime: '22:32', dayOffset: 0 },
      { stationCode: 'KKW', sequence: 7, arrivalTime: '23:20', departureTime: '23:22', dayOffset: 0 },
      { stationCode: 'RN', sequence: 8, arrivalTime: '02:10', departureTime: '02:20', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 9, arrivalTime: '06:00', departureTime: '06:02', dayOffset: 1 },
      { stationCode: 'PNVL', sequence: 10, arrivalTime: '07:20', departureTime: '07:25', dayOffset: 1 },
      { stationCode: 'LTT', sequence: 11, arrivalTime: '08:30', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 50. CSMT–Mangaluru Express — MAQ → CSMT
  // ─────────────────────────────────────────────
  {
    id: '12134',
    trainNumber: '12134',
    name: 'CSMT–Mangaluru Express',
    sourceStationCode: 'MAQ',
    destinationStationCode: 'CSMT',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    type: 'Express',
    stops: [
      { stationCode: 'MAQ', sequence: 1, departureTime: '18:00', dayOffset: 0 },
      { stationCode: 'KAWR', sequence: 2, arrivalTime: '20:30', departureTime: '20:35', dayOffset: 0 },
      { stationCode: 'CNO', sequence: 3, arrivalTime: '21:20', departureTime: '21:22', dayOffset: 0 },
      { stationCode: 'MAO', sequence: 4, arrivalTime: '22:25', departureTime: '22:40', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 5, arrivalTime: '23:15', departureTime: '23:17', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 6, arrivalTime: '23:45', departureTime: '23:47', dayOffset: 0 },
      { stationCode: 'SWV', sequence: 7, arrivalTime: '00:40', departureTime: '00:42', dayOffset: 1 },
      { stationCode: 'KUDL', sequence: 8, arrivalTime: '01:27', departureTime: '01:29', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 9, arrivalTime: '02:15', departureTime: '02:17', dayOffset: 1 },
      { stationCode: 'RN', sequence: 10, arrivalTime: '05:10', departureTime: '05:20', dayOffset: 1 },
      { stationCode: 'CHI', sequence: 11, arrivalTime: '07:20', departureTime: '07:22', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 12, arrivalTime: '09:20', departureTime: '09:22', dayOffset: 1 },
      { stationCode: 'PNVL', sequence: 13, arrivalTime: '10:45', departureTime: '10:50', dayOffset: 1 },
      { stationCode: 'CSMT', sequence: 14, arrivalTime: '12:15', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 51. Kochuveli–Amritsar SF Express — KCVL → ASR
  // ─────────────────────────────────────────────
  {
    id: '12483',
    trainNumber: '12483',
    name: 'Kochuveli–Amritsar SF Express',
    sourceStationCode: 'KCVL',
    destinationStationCode: 'ASR',
    runningDays: [3],
    type: 'Express',
    stops: [
      { stationCode: 'KCVL', sequence: 1, departureTime: '14:30', dayOffset: 0 },
      { stationCode: 'MAO', sequence: 2, arrivalTime: '04:30', departureTime: '04:45', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 3, arrivalTime: '05:20', departureTime: '05:22', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 4, arrivalTime: '05:50', departureTime: '05:52', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 5, arrivalTime: '07:10', departureTime: '07:12', dayOffset: 1 },
      { stationCode: 'RN', sequence: 6, arrivalTime: '10:05', departureTime: '10:15', dayOffset: 1 },
      { stationCode: 'PNVL', sequence: 7, arrivalTime: '15:35', departureTime: '15:45', dayOffset: 1 },
      { stationCode: 'ASR', sequence: 8, arrivalTime: '12:00', dayOffset: 2 },
    ],
  },

  // ─────────────────────────────────────────────
  // 52. Vasco–Patna Express — VSG → PNBE
  // ─────────────────────────────────────────────
  {
    id: '12741',
    trainNumber: '12741',
    name: 'Vasco–Patna Express',
    sourceStationCode: 'VSG',
    destinationStationCode: 'PNBE',
    runningDays: [3],
    type: 'Express',
    stops: [
      { stationCode: 'VSG', sequence: 1, departureTime: '11:15', dayOffset: 0 },
      { stationCode: 'MAO', sequence: 2, arrivalTime: '12:45', departureTime: '13:00', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 3, arrivalTime: '13:35', departureTime: '13:37', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 4, arrivalTime: '14:05', departureTime: '14:07', dayOffset: 0 },
      { stationCode: 'PER', sequence: 5, arrivalTime: '14:45', departureTime: '14:47', dayOffset: 0 },
      { stationCode: 'SWV', sequence: 6, arrivalTime: '15:35', departureTime: '15:37', dayOffset: 0 },
      { stationCode: 'KKW', sequence: 7, arrivalTime: '16:30', departureTime: '16:32', dayOffset: 0 },
      { stationCode: 'RN', sequence: 8, arrivalTime: '19:15', departureTime: '19:25', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 9, arrivalTime: '21:20', departureTime: '21:22', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 10, arrivalTime: '22:40', departureTime: '22:45', dayOffset: 0 },
      { stationCode: 'PNBE', sequence: 11, arrivalTime: '18:00', dayOffset: 2 },
    ],
  },

  // ─────────────────────────────────────────────
  // 53. Gandhidham–Nagercoil Express — NCJ → GIMB
  // ─────────────────────────────────────────────
  {
    id: '16336',
    trainNumber: '16336',
    name: 'Gandhidham–Nagercoil Express',
    sourceStationCode: 'NCJ',
    destinationStationCode: 'GIMB',
    runningDays: [2],
    type: 'Express',
    stops: [
      { stationCode: 'NCJ', sequence: 1, departureTime: '15:00', dayOffset: 0 },
      { stationCode: 'MAO', sequence: 2, arrivalTime: '06:15', departureTime: '06:25', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 3, arrivalTime: '07:00', departureTime: '07:02', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 4, arrivalTime: '07:30', departureTime: '07:32', dayOffset: 1 },
      { stationCode: 'SWV', sequence: 5, arrivalTime: '08:25', departureTime: '08:27', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 6, arrivalTime: '09:20', departureTime: '09:22', dayOffset: 1 },
      { stationCode: 'RN', sequence: 7, arrivalTime: '12:15', departureTime: '12:25', dayOffset: 1 },
      { stationCode: 'PNVL', sequence: 8, arrivalTime: '17:40', departureTime: '17:50', dayOffset: 1 },
      { stationCode: 'GIMB', sequence: 9, arrivalTime: '16:00', dayOffset: 2 },
    ],
  },

  // ─────────────────────────────────────────────
  // 54. Bhavnagar–Kochuveli Express — KCVL → BVC
  // ─────────────────────────────────────────────
  {
    id: '19259',
    trainNumber: '19259',
    name: 'Bhavnagar–Kochuveli Express',
    sourceStationCode: 'KCVL',
    destinationStationCode: 'BVC',
    runningDays: [4],
    type: 'Express',
    stops: [
      { stationCode: 'KCVL', sequence: 1, departureTime: '11:00', dayOffset: 0 },
      { stationCode: 'MAO', sequence: 2, arrivalTime: '01:30', departureTime: '01:45', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 3, arrivalTime: '02:20', departureTime: '02:22', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 4, arrivalTime: '02:50', departureTime: '02:52', dayOffset: 1 },
      { stationCode: 'SNS', sequence: 5, arrivalTime: '03:50', departureTime: '03:52', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 6, arrivalTime: '04:45', departureTime: '04:47', dayOffset: 1 },
      { stationCode: 'RN', sequence: 7, arrivalTime: '07:40', departureTime: '07:50', dayOffset: 1 },
      { stationCode: 'PNVL', sequence: 8, arrivalTime: '13:00', departureTime: '13:05', dayOffset: 1 },
      { stationCode: 'BVC', sequence: 9, arrivalTime: '12:00', dayOffset: 2 },
    ],
  },

  // ─────────────────────────────────────────────
  // 55. LTT–Thiruvananthapuram Express — TVC → LTT
  // ─────────────────────────────────────────────
  {
    id: '22114',
    trainNumber: '22114',
    name: 'LTT–Thiruvananthapuram Express',
    sourceStationCode: 'TVC',
    destinationStationCode: 'LTT',
    runningDays: [1, 4],
    type: 'Express',
    stops: [
      { stationCode: 'TVC', sequence: 1, departureTime: '08:00', dayOffset: 0 },
      { stationCode: 'MAO', sequence: 2, arrivalTime: '10:45', departureTime: '11:00', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 3, arrivalTime: '11:35', departureTime: '11:37', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 4, arrivalTime: '12:05', departureTime: '12:07', dayOffset: 1 },
      { stationCode: 'SNS', sequence: 5, arrivalTime: '13:05', departureTime: '13:07', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 6, arrivalTime: '14:00', departureTime: '14:02', dayOffset: 1 },
      { stationCode: 'RN', sequence: 7, arrivalTime: '16:55', departureTime: '17:05', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 8, arrivalTime: '21:00', departureTime: '21:02', dayOffset: 1 },
      { stationCode: 'PNVL', sequence: 9, arrivalTime: '22:20', departureTime: '22:25', dayOffset: 1 },
      { stationCode: 'LTT', sequence: 10, arrivalTime: '23:35', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 56. LTT–Karmali AC Express — KRMI → LTT
  // ─────────────────────────────────────────────
  {
    id: '22116',
    trainNumber: '22116',
    name: 'LTT–Karmali AC Express',
    sourceStationCode: 'KRMI',
    destinationStationCode: 'LTT',
    runningDays: [4],
    type: 'Express',
    stops: [
      { stationCode: 'KRMI', sequence: 1, departureTime: '06:00', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 2, arrivalTime: '06:30', departureTime: '06:32', dayOffset: 0 },
      { stationCode: 'SWV', sequence: 3, arrivalTime: '07:30', departureTime: '07:32', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 4, arrivalTime: '08:15', departureTime: '08:17', dayOffset: 0 },
      { stationCode: 'KKW', sequence: 5, arrivalTime: '09:02', departureTime: '09:04', dayOffset: 0 },
      { stationCode: 'RN', sequence: 6, arrivalTime: '11:55', departureTime: '12:05', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 7, arrivalTime: '15:05', departureTime: '15:07', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 8, arrivalTime: '16:25', departureTime: '16:30', dayOffset: 0 },
      { stationCode: 'LTT', sequence: 9, arrivalTime: '17:35', dayOffset: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 57. Pune–Ernakulam SF Express — ERS → PUNE
  // ─────────────────────────────────────────────
  {
    id: '22149',
    trainNumber: '22149',
    name: 'Pune–Ernakulam SF Express',
    sourceStationCode: 'ERS',
    destinationStationCode: 'PUNE',
    runningDays: [2, 5],
    type: 'Express',
    stops: [
      { stationCode: 'ERS', sequence: 1, departureTime: '12:30', dayOffset: 0 },
      { stationCode: 'MAO', sequence: 2, arrivalTime: '09:00', departureTime: '09:15', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 3, arrivalTime: '09:50', departureTime: '09:52', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 4, arrivalTime: '10:20', departureTime: '10:22', dayOffset: 1 },
      { stationCode: 'SWV', sequence: 5, arrivalTime: '11:15', departureTime: '11:17', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 6, arrivalTime: '12:10', departureTime: '12:12', dayOffset: 1 },
      { stationCode: 'RN', sequence: 7, arrivalTime: '15:00', departureTime: '15:10', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 8, arrivalTime: '19:10', departureTime: '19:12', dayOffset: 1 },
      { stationCode: 'PNVL', sequence: 9, arrivalTime: '20:30', departureTime: '20:35', dayOffset: 1 },
      { stationCode: 'PUNE', sequence: 10, arrivalTime: '22:20', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 58. Hisar–Coimbatore Express — CBE → HSR
  // ─────────────────────────────────────────────
  {
    id: '22476',
    trainNumber: '22476',
    name: 'Hisar–Coimbatore Express',
    sourceStationCode: 'CBE',
    destinationStationCode: 'HSR',
    runningDays: [6],
    type: 'Express',
    stops: [
      { stationCode: 'CBE', sequence: 1, departureTime: '16:00', dayOffset: 0 },
      { stationCode: 'MAO', sequence: 2, arrivalTime: '21:15', departureTime: '21:30', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 3, arrivalTime: '22:05', departureTime: '22:07', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 4, arrivalTime: '22:35', departureTime: '22:37', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 5, arrivalTime: '00:00', departureTime: '00:02', dayOffset: 2 },
      { stationCode: 'RN', sequence: 6, arrivalTime: '02:55', departureTime: '03:05', dayOffset: 2 },
      { stationCode: 'PNVL', sequence: 7, arrivalTime: '08:20', departureTime: '08:25', dayOffset: 2 },
      { stationCode: 'HSR', sequence: 8, arrivalTime: '07:00', dayOffset: 3 },
    ],
  },

  // ─────────────────────────────────────────────
  // 59. Dadar–Tirunelveli Express — TEN → DR
  // ─────────────────────────────────────────────
  {
    id: '22630',
    trainNumber: '22630',
    name: 'Dadar–Tirunelveli Express',
    sourceStationCode: 'TEN',
    destinationStationCode: 'DR',
    runningDays: [3],
    type: 'Express',
    stops: [
      { stationCode: 'TEN', sequence: 1, departureTime: '12:30', dayOffset: 0 },
      { stationCode: 'MAO', sequence: 2, arrivalTime: '20:35', departureTime: '20:50', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 3, arrivalTime: '21:25', departureTime: '21:27', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 4, arrivalTime: '21:55', departureTime: '21:57', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 5, arrivalTime: '23:20', departureTime: '23:22', dayOffset: 1 },
      { stationCode: 'RN', sequence: 6, arrivalTime: '02:15', departureTime: '02:25', dayOffset: 2 },
      { stationCode: 'ROHA', sequence: 7, arrivalTime: '06:25', departureTime: '06:27', dayOffset: 2 },
      { stationCode: 'PNVL', sequence: 8, arrivalTime: '07:45', departureTime: '07:50', dayOffset: 2 },
      { stationCode: 'DR', sequence: 9, arrivalTime: '09:00', dayOffset: 2 },
    ],
  },

  // ─────────────────────────────────────────────
  // 60. NZM–Thiruvananthapuram SF Express — TVC → NZM
  // ─────────────────────────────────────────────
  {
    id: '22633',
    trainNumber: '22633',
    name: 'NZM–Thiruvananthapuram SF Express',
    sourceStationCode: 'TVC',
    destinationStationCode: 'NZM',
    runningDays: [3],
    type: 'Express',
    stops: [
      { stationCode: 'TVC', sequence: 1, departureTime: '10:00', dayOffset: 0 },
      { stationCode: 'MAO', sequence: 2, arrivalTime: '11:00', departureTime: '11:15', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 3, arrivalTime: '11:50', departureTime: '11:52', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 4, arrivalTime: '12:20', departureTime: '12:22', dayOffset: 1 },
      { stationCode: 'SNS', sequence: 5, arrivalTime: '13:20', departureTime: '13:22', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 6, arrivalTime: '14:15', departureTime: '14:17', dayOffset: 1 },
      { stationCode: 'RN', sequence: 7, arrivalTime: '17:10', departureTime: '17:20', dayOffset: 1 },
      { stationCode: 'PNVL', sequence: 8, arrivalTime: '22:30', departureTime: '22:35', dayOffset: 1 },
      { stationCode: 'NZM', sequence: 9, arrivalTime: '16:00', dayOffset: 2 },
    ],
  },

  // ─────────────────────────────────────────────
  // 61. Madgaon–Sawantwadi Passenger — MAO → SWV
  // ─────────────────────────────────────────────
  {
    id: '50107',
    trainNumber: '50107',
    name: 'Madgaon–Sawantwadi Passenger',
    sourceStationCode: 'MAO',
    destinationStationCode: 'SWV',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    type: 'Passenger',
    stops: [
      { stationCode: 'MAO', sequence: 1, departureTime: '07:30', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 2, arrivalTime: '08:05', departureTime: '08:07', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 3, arrivalTime: '08:35', departureTime: '08:37', dayOffset: 0 },
      { stationCode: 'PER', sequence: 4, arrivalTime: '09:10', departureTime: '09:12', dayOffset: 0 },
      { stationCode: 'SWV', sequence: 5, arrivalTime: '10:25', dayOffset: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 62. Madgaon–Sawantwadi Passenger — SWV → MAO
  // ─────────────────────────────────────────────
  {
    id: '50108',
    trainNumber: '50108',
    name: 'Madgaon–Sawantwadi Passenger',
    sourceStationCode: 'SWV',
    destinationStationCode: 'MAO',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    type: 'Passenger',
    stops: [
      { stationCode: 'SWV', sequence: 1, departureTime: '11:30', dayOffset: 0 },
      { stationCode: 'PER', sequence: 2, arrivalTime: '12:45', departureTime: '12:47', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 3, arrivalTime: '13:22', departureTime: '13:25', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 4, arrivalTime: '13:55', departureTime: '13:57', dayOffset: 0 },
      { stationCode: 'MAO', sequence: 5, arrivalTime: '14:35', dayOffset: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 63. Diva–Ratnagiri Passenger — RN → DIV
  // ─────────────────────────────────────────────
  {
    id: '50104',
    trainNumber: '50104',
    name: 'Diva–Ratnagiri Passenger',
    sourceStationCode: 'RN',
    destinationStationCode: 'DIV',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    type: 'Passenger',
    stops: [
      { stationCode: 'RN', sequence: 1, departureTime: '05:30', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 2, arrivalTime: '10:35', departureTime: '10:40', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 3, arrivalTime: '12:15', departureTime: '12:20', dayOffset: 0 },
      { stationCode: 'DIV', sequence: 4, arrivalTime: '13:25', dayOffset: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 64. Nagpur–Madgaon Express — MAO → NGP
  // ─────────────────────────────────────────────
  {
    id: '11204',
    trainNumber: '11204',
    name: 'Nagpur–Madgaon Express',
    sourceStationCode: 'MAO',
    destinationStationCode: 'NGP',
    runningDays: [4, 0],
    type: 'Express',
    stops: [
      { stationCode: 'MAO', sequence: 1, departureTime: '08:00', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 2, arrivalTime: '08:35', departureTime: '08:37', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 3, arrivalTime: '09:05', departureTime: '09:07', dayOffset: 0 },
      { stationCode: 'SWV', sequence: 4, arrivalTime: '10:00', departureTime: '10:02', dayOffset: 0 },
      { stationCode: 'KKW', sequence: 5, arrivalTime: '10:55', departureTime: '10:57', dayOffset: 0 },
      { stationCode: 'RN', sequence: 6, arrivalTime: '13:50', departureTime: '14:00', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 7, arrivalTime: '18:05', departureTime: '18:07', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 8, arrivalTime: '19:25', departureTime: '19:30', dayOffset: 0 },
      { stationCode: 'NGP', sequence: 9, arrivalTime: '07:00', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 65. Surat–Mangaluru Express — MAQ → ST
  // ─────────────────────────────────────────────
  {
    id: '19058',
    trainNumber: '19058',
    name: 'Surat–Mangaluru Express',
    sourceStationCode: 'MAQ',
    destinationStationCode: 'ST',
    runningDays: [1, 4],
    type: 'Express',
    stops: [
      { stationCode: 'MAQ', sequence: 1, departureTime: '19:30', dayOffset: 0 },
      { stationCode: 'KAWR', sequence: 2, arrivalTime: '22:00', departureTime: '22:05', dayOffset: 0 },
      { stationCode: 'CNO', sequence: 3, arrivalTime: '22:50', departureTime: '22:52', dayOffset: 0 },
      { stationCode: 'MAO', sequence: 4, arrivalTime: '00:05', departureTime: '00:15', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 5, arrivalTime: '00:45', departureTime: '00:47', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 6, arrivalTime: '01:15', departureTime: '01:17', dayOffset: 1 },
      { stationCode: 'SWV', sequence: 7, arrivalTime: '02:10', departureTime: '02:12', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 8, arrivalTime: '03:05', departureTime: '03:07', dayOffset: 1 },
      { stationCode: 'RN', sequence: 9, arrivalTime: '05:55', departureTime: '06:05', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 10, arrivalTime: '10:10', departureTime: '10:12', dayOffset: 1 },
      { stationCode: 'PNVL', sequence: 11, arrivalTime: '11:30', departureTime: '11:35', dayOffset: 1 },
      { stationCode: 'ST', sequence: 12, arrivalTime: '22:00', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 66. Hapa–Madgaon Express — MAO → HAPA
  // ─────────────────────────────────────────────
  {
    id: '22907',
    trainNumber: '22907',
    name: 'Hapa–Madgaon Express',
    sourceStationCode: 'MAO',
    destinationStationCode: 'HAPA',
    runningDays: [5],
    type: 'Express',
    stops: [
      { stationCode: 'MAO', sequence: 1, departureTime: '10:45', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 2, arrivalTime: '11:15', departureTime: '11:17', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 3, arrivalTime: '11:45', departureTime: '11:47', dayOffset: 0 },
      { stationCode: 'SWV', sequence: 4, arrivalTime: '12:40', departureTime: '12:42', dayOffset: 0 },
      { stationCode: 'KUDL', sequence: 5, arrivalTime: '13:30', departureTime: '13:32', dayOffset: 0 },
      { stationCode: 'RN', sequence: 6, arrivalTime: '17:15', departureTime: '17:25', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 7, arrivalTime: '22:35', departureTime: '22:40', dayOffset: 0 },
      { stationCode: 'HAPA', sequence: 8, arrivalTime: '22:00', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 67. Kochuveli–Shri Ganganagar Express — KCVL → SGNR
  // ─────────────────────────────────────────────
  {
    id: '16312',
    trainNumber: '16312',
    name: 'Kochuveli–Shri Ganganagar Express',
    sourceStationCode: 'KCVL',
    destinationStationCode: 'SGNR',
    runningDays: [6],
    type: 'Express',
    stops: [
      { stationCode: 'KCVL', sequence: 1, departureTime: '15:45', dayOffset: 0 },
      { stationCode: 'MAO', sequence: 2, arrivalTime: '08:45', departureTime: '09:00', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 3, arrivalTime: '09:35', departureTime: '09:37', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 4, arrivalTime: '10:05', departureTime: '10:07', dayOffset: 1 },
      { stationCode: 'KUDL', sequence: 5, arrivalTime: '11:20', departureTime: '11:22', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 6, arrivalTime: '12:10', departureTime: '12:12', dayOffset: 1 },
      { stationCode: 'RN', sequence: 7, arrivalTime: '15:00', departureTime: '15:10', dayOffset: 1 },
      { stationCode: 'PNVL', sequence: 8, arrivalTime: '20:25', departureTime: '20:30', dayOffset: 1 },
      { stationCode: 'SGNR', sequence: 9, arrivalTime: '02:05', dayOffset: 4 },
    ],
  },

  // ─────────────────────────────────────────────
  // 68. Veraval Express — TVC → VRL
  // ─────────────────────────────────────────────
  {
    id: '16334',
    trainNumber: '16334',
    name: 'Veraval Express',
    sourceStationCode: 'TVC',
    destinationStationCode: 'VRL',
    runningDays: [1],
    type: 'Express',
    stops: [
      { stationCode: 'TVC', sequence: 1, departureTime: '15:45', dayOffset: 0 },
      { stationCode: 'MAO', sequence: 2, arrivalTime: '10:40', departureTime: '10:50', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 3, arrivalTime: '11:30', departureTime: '11:32', dayOffset: 1 },
      { stationCode: 'KUDL', sequence: 4, arrivalTime: '12:36', departureTime: '12:38', dayOffset: 1 },
      { stationCode: 'RN', sequence: 5, arrivalTime: '16:05', departureTime: '16:10', dayOffset: 1 },
      { stationCode: 'PNVL', sequence: 6, arrivalTime: '21:02', departureTime: '21:05', dayOffset: 1 },
      { stationCode: 'VRL', sequence: 7, arrivalTime: '15:35', dayOffset: 2 },
    ],
  },

  // ─────────────────────────────────────────────
  // 69. Indore–Kochuveli Express — KCVL → INDB
  // ─────────────────────────────────────────────
  {
    id: '20931',
    trainNumber: '20931',
    name: 'Indore–Kochuveli Express',
    sourceStationCode: 'KCVL',
    destinationStationCode: 'INDB',
    runningDays: [5],
    type: 'Express',
    stops: [
      { stationCode: 'KCVL', sequence: 1, departureTime: '06:00', dayOffset: 0 },
      { stationCode: 'MAO', sequence: 2, arrivalTime: '07:55', departureTime: '08:10', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 3, arrivalTime: '08:45', departureTime: '08:47', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 4, arrivalTime: '09:15', departureTime: '09:17', dayOffset: 1 },
      { stationCode: 'KUDL', sequence: 5, arrivalTime: '10:30', departureTime: '10:32', dayOffset: 1 },
      { stationCode: 'RN', sequence: 6, arrivalTime: '14:35', departureTime: '14:45', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 7, arrivalTime: '18:40', departureTime: '18:42', dayOffset: 1 },
      { stationCode: 'PNVL', sequence: 8, arrivalTime: '20:00', departureTime: '20:05', dayOffset: 1 },
      { stationCode: 'INDB', sequence: 9, arrivalTime: '16:00', dayOffset: 2 },
    ],
  },

  // ─────────────────────────────────────────────
  // 70. Marusagar Express — ERS → JP
  // ─────────────────────────────────────────────
  {
    id: '12977',
    trainNumber: '12977',
    name: 'Marusagar Express',
    sourceStationCode: 'ERS',
    destinationStationCode: 'JP',
    runningDays: [0],
    type: 'Express',
    stops: [
      { stationCode: 'ERS', sequence: 1, departureTime: '07:00', dayOffset: 0 },
      { stationCode: 'MAO', sequence: 2, arrivalTime: '07:00', departureTime: '07:15', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 3, arrivalTime: '07:50', departureTime: '07:52', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 4, arrivalTime: '08:20', departureTime: '08:22', dayOffset: 1 },
      { stationCode: 'SNS', sequence: 5, arrivalTime: '09:15', departureTime: '09:17', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 6, arrivalTime: '10:10', departureTime: '10:12', dayOffset: 1 },
      { stationCode: 'RN', sequence: 7, arrivalTime: '13:05', departureTime: '13:15', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 8, arrivalTime: '17:20', departureTime: '17:22', dayOffset: 1 },
      { stationCode: 'PNVL', sequence: 9, arrivalTime: '18:40', departureTime: '18:45', dayOffset: 1 },
      { stationCode: 'JP', sequence: 10, arrivalTime: '12:00', dayOffset: 2 },
    ],
  },

  // ─────────────────────────────────────────────
  // 71. NZM–Ernakulam Express — ERS → NZM
  // ─────────────────────────────────────────────
  {
    id: '22655',
    trainNumber: '22655',
    name: 'NZM–Ernakulam Express',
    sourceStationCode: 'ERS',
    destinationStationCode: 'NZM',
    runningDays: [3],
    type: 'Express',
    stops: [
      { stationCode: 'ERS', sequence: 1, departureTime: '09:00', dayOffset: 0 },
      { stationCode: 'MAO', sequence: 2, arrivalTime: '12:15', departureTime: '12:30', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 3, arrivalTime: '13:05', departureTime: '13:07', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 4, arrivalTime: '13:35', departureTime: '13:37', dayOffset: 1 },
      { stationCode: 'SNS', sequence: 5, arrivalTime: '14:30', departureTime: '14:32', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 6, arrivalTime: '15:25', departureTime: '15:27', dayOffset: 1 },
      { stationCode: 'RN', sequence: 7, arrivalTime: '18:20', departureTime: '18:30', dayOffset: 1 },
      { stationCode: 'ROHA', sequence: 8, arrivalTime: '22:35', departureTime: '22:37', dayOffset: 1 },
      { stationCode: 'PNVL', sequence: 9, arrivalTime: '02:37', departureTime: '02:40', dayOffset: 2 },
      { stationCode: 'NZM', sequence: 10, arrivalTime: '18:00', dayOffset: 2 },
    ],
  },

  // ─────────────────────────────────────────────
  // 72. Ernakulam–Okha Express — ERS → OKHA
  // ─────────────────────────────────────────────
  {
    id: '16338',
    trainNumber: '16338',
    name: 'Ernakulam–Okha Express',
    sourceStationCode: 'ERS',
    destinationStationCode: 'OKHA',
    runningDays: [3, 5],
    type: 'Express',
    stops: [
      { stationCode: 'ERS', sequence: 1, departureTime: '20:25', dayOffset: 0 },
      { stationCode: 'MAO', sequence: 2, arrivalTime: '09:30', departureTime: '09:40', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 3, arrivalTime: '10:10', departureTime: '10:12', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 4, arrivalTime: '10:40', departureTime: '10:42', dayOffset: 1 },
      { stationCode: 'KKW', sequence: 5, arrivalTime: '12:00', departureTime: '12:02', dayOffset: 1 },
      { stationCode: 'RN', sequence: 6, arrivalTime: '14:55', departureTime: '15:05', dayOffset: 1 },
      { stationCode: 'PNVL', sequence: 7, arrivalTime: '20:20', departureTime: '20:25', dayOffset: 1 },
      { stationCode: 'OKHA', sequence: 8, arrivalTime: '16:40', dayOffset: 2 },
    ],
  },

];

/** Lookup map by trainNumber */
export const TRAIN_MAP: Record<string, Train> = Object.fromEntries(
  TRAINS.map(t => [t.trainNumber, t]),
);
