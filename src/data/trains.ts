import { Train } from '../types/Train';

/**
 * Mock train dataset with complete stop sequences for the Konkan corridor.
 * Each train contains its FULL route — not just source/destination.
 * This structure supports future Tatkal booking, availability analysis, and
 * break-journey recommendations without any schema changes.
 */
export const TRAINS: Train[] = [
  // ─────────────────────────────────────────────
  // 1. Matsyagandha Express — LTT → Mangaluru
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
      { stationCode: 'SWV',  sequence: 7,  arrivalTime: '02:10', departureTime: '02:12', dayOffset: 1 },
      { stationCode: 'THVM', sequence: 8,  arrivalTime: '03:20', departureTime: '03:22', dayOffset: 1 },
      { stationCode: 'KRMI', sequence: 9,  arrivalTime: '03:45', departureTime: '03:47', dayOffset: 1 },
      { stationCode: 'MAO',  sequence: 10, arrivalTime: '04:10', departureTime: '04:20', dayOffset: 1 },
      { stationCode: 'CNO',  sequence: 11, arrivalTime: '05:10', departureTime: '05:12', dayOffset: 1 },
      { stationCode: 'KARW', sequence: 12, arrivalTime: '06:00', departureTime: '06:05', dayOffset: 1 },
      { stationCode: 'MAQ',  sequence: 13, arrivalTime: '08:00', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 2. Mandovi Express — CSMT → Madgaon
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
  // ─────────────────────────────────────────────
  {
    id: '12051',
    trainNumber: '12051',
    name: 'Jan Shatabdi Express',
    sourceStationCode: 'CSMT',
    destinationStationCode: 'MAO',
    runningDays: [1, 2, 3, 4, 5, 6], // Mon–Sat
    type: 'Express',
    stops: [
      { stationCode: 'CSMT', sequence: 1,  departureTime: '05:25', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2,  arrivalTime: '06:42', departureTime: '06:44', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 3,  arrivalTime: '08:02', departureTime: '08:04', dayOffset: 0 },
      { stationCode: 'CHI',  sequence: 4,  arrivalTime: '10:00', departureTime: '10:02', dayOffset: 0 },
      { stationCode: 'RN',   sequence: 5,  arrivalTime: '11:50', departureTime: '11:55', dayOffset: 0 },
      { stationCode: 'KKW',  sequence: 6,  arrivalTime: '14:15', departureTime: '14:17', dayOffset: 0 },
      { stationCode: 'SWV',  sequence: 7,  arrivalTime: '15:12', departureTime: '15:14', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 8,  arrivalTime: '16:30', departureTime: '16:32', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 9,  arrivalTime: '17:02', departureTime: '17:04', dayOffset: 0 },
      { stationCode: 'MAO',  sequence: 10, arrivalTime: '17:35', dayOffset: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 4. Vande Bharat Express — CSMT → Madgaon
  // ─────────────────────────────────────────────
  {
    id: '22229',
    trainNumber: '22229',
    name: 'Vande Bharat Express',
    sourceStationCode: 'CSMT',
    destinationStationCode: 'MAO',
    runningDays: [1, 2, 3, 4, 5, 6], // Mon–Sat
    type: 'VandeBharat',
    stops: [
      { stationCode: 'CSMT', sequence: 1,  departureTime: '06:10', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2,  arrivalTime: '07:10', departureTime: '07:12', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 3,  arrivalTime: '08:13', departureTime: '08:15', dayOffset: 0 },
      { stationCode: 'RN',   sequence: 4,  arrivalTime: '11:25', departureTime: '11:30', dayOffset: 0 },
      { stationCode: 'KKW',  sequence: 5,  arrivalTime: '13:18', departureTime: '13:20', dayOffset: 0 },
      { stationCode: 'SWV',  sequence: 6,  arrivalTime: '14:09', departureTime: '14:11', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 7,  arrivalTime: '15:05', departureTime: '15:07', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 8,  arrivalTime: '15:34', departureTime: '15:36', dayOffset: 0 },
      { stationCode: 'MAO',  sequence: 9,  arrivalTime: '16:05', dayOffset: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 5. Goa Express — NZM → Vasco da Gama
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
      { stationCode: 'SWV',  sequence: 6,  arrivalTime: '21:58', departureTime: '22:00', dayOffset: 0 },
      { stationCode: 'PER',  sequence: 7,  arrivalTime: '22:50', departureTime: '22:52', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 8,  arrivalTime: '23:22', departureTime: '23:25', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 9,  arrivalTime: '23:55', departureTime: '23:57', dayOffset: 0 },
      { stationCode: 'MAO',  sequence: 10, arrivalTime: '00:30', departureTime: '00:40', dayOffset: 1 },
      { stationCode: 'CNO',  sequence: 11, arrivalTime: '01:30', departureTime: '01:32', dayOffset: 1 },
      { stationCode: 'KARW', sequence: 12, arrivalTime: '02:20', departureTime: '02:25', dayOffset: 1 },
      { stationCode: 'MAQ',  sequence: 13, arrivalTime: '05:30', departureTime: '05:35', dayOffset: 1 },
      { stationCode: 'TVC',  sequence: 14, arrivalTime: '18:00', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 7. Mangala Lakshadweep Express — NZM → Ernakulam
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
      { stationCode: 'KARW', sequence: 13, arrivalTime: '14:55', departureTime: '15:00', dayOffset: 1 },
      { stationCode: 'MAQ',  sequence: 14, arrivalTime: '17:45', departureTime: '17:50', dayOffset: 1 },
      { stationCode: 'ERS',  sequence: 15, arrivalTime: '05:00', dayOffset: 2 },
    ],
  },

  // ─────────────────────────────────────────────
  // 8. Rajdhani Express — NZM → Madgaon
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
  // 9. Konkan Kanya Express — CSMT → Kudal
  // ─────────────────────────────────────────────
  {
    id: '20111',
    trainNumber: '20111',
    name: 'Konkan Kanya Express',
    sourceStationCode: 'CSMT',
    destinationStationCode: 'KUDL',
    runningDays: [1, 2, 3, 4, 5, 6, 0],
    type: 'Express',
    stops: [
      { stationCode: 'CSMT', sequence: 1,  departureTime: '22:10', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2,  arrivalTime: '23:30', departureTime: '23:35', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 3,  arrivalTime: '00:52', departureTime: '00:55', dayOffset: 1 },
      { stationCode: 'CHI',  sequence: 4,  arrivalTime: '02:55', departureTime: '03:00', dayOffset: 1 },
      { stationCode: 'RN',   sequence: 5,  arrivalTime: '04:55', departureTime: '05:05', dayOffset: 1 },
      { stationCode: 'KKW',  sequence: 6,  arrivalTime: '07:37', departureTime: '07:40', dayOffset: 1 },
      { stationCode: 'KUDL', sequence: 7,  arrivalTime: '08:30', dayOffset: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 10. Tejas Express — CSMT → Madgaon
  // ─────────────────────────────────────────────
  {
    id: '22119',
    trainNumber: '22119',
    name: 'Tejas Express',
    sourceStationCode: 'CSMT',
    destinationStationCode: 'MAO',
    runningDays: [1, 2, 4, 5, 6], // Mon, Tue, Thu, Fri, Sat
    type: 'Tejas',
    stops: [
      { stationCode: 'CSMT', sequence: 1,  departureTime: '05:45', dayOffset: 0 },
      { stationCode: 'PNVL', sequence: 2,  arrivalTime: '06:52', departureTime: '06:57', dayOffset: 0 },
      { stationCode: 'ROHA', sequence: 3,  arrivalTime: '08:10', departureTime: '08:12', dayOffset: 0 },
      { stationCode: 'CHI',  sequence: 4,  arrivalTime: '10:00', departureTime: '10:02', dayOffset: 0 },
      { stationCode: 'RN',   sequence: 5,  arrivalTime: '11:55', departureTime: '12:00', dayOffset: 0 },
      { stationCode: 'KKW',  sequence: 6,  arrivalTime: '14:15', departureTime: '14:17', dayOffset: 0 },
      { stationCode: 'SWV',  sequence: 7,  arrivalTime: '15:08', departureTime: '15:10', dayOffset: 0 },
      { stationCode: 'THVM', sequence: 8,  arrivalTime: '16:05', departureTime: '16:07', dayOffset: 0 },
      { stationCode: 'KRMI', sequence: 9,  arrivalTime: '16:35', departureTime: '16:37', dayOffset: 0 },
      { stationCode: 'MAO',  sequence: 10, arrivalTime: '17:05', dayOffset: 0 },
    ],
  },
];

/** Lookup map by trainNumber */
export const TRAIN_MAP: Record<string, Train> = Object.fromEntries(
  TRAINS.map(t => [t.trainNumber, t]),
);
