export interface Holiday {
  date: string; // 'YYYY-MM-DD'
  name: string;
  type: 'national' | 'festival' | 'goa' | 'regional';
  description?: string;
}

export const HOLIDAYS: Record<string, Holiday> = {
  // ── 2026 Holidays ──────────────────────────────────────────────────────────
  '2026-01-01': { date: '2026-01-01', name: "New Year's Day", type: 'festival' },
  '2026-01-14': { date: '2026-01-14', name: 'Makar Sankranti / Pongal', type: 'festival' },
  '2026-01-26': { date: '2026-01-26', name: 'Republic Day', type: 'national' },
  '2026-02-15': { date: '2026-02-15', name: 'Maha Shivratri', type: 'festival' },
  '2026-02-19': { date: '2026-02-19', name: 'Shivaji Maharaj Jayanti', type: 'regional' },
  '2026-03-03': { date: '2026-03-03', name: 'Holi / Shigmo (Goa)', type: 'festival', description: 'Goa spring festival & Holi celebration' },
  '2026-03-20': { date: '2026-03-20', name: 'Eid-ul-Fitr (Ramzan Eid)', type: 'festival' },
  '2026-03-21': { date: '2026-03-21', name: 'Gudi Padwa', type: 'regional', description: 'Maharashtra New Year' },
  '2026-04-03': { date: '2026-04-03', name: 'Good Friday', type: 'national', description: 'Long weekend travel peak' },
  '2026-04-05': { date: '2026-04-05', name: 'Easter Sunday', type: 'festival' },
  '2026-04-14': { date: '2026-04-14', name: 'Dr. Ambedkar Jayanti', type: 'national' },
  '2026-05-01': { date: '2026-05-01', name: 'Maharashtra Day / May Day', type: 'regional' },
  '2026-05-27': { date: '2026-05-27', name: 'Bakrid / Eid al-Adha', type: 'festival' },
  '2026-08-15': { date: '2026-08-15', name: 'Independence Day', type: 'national' },
  '2026-08-28': { date: '2026-08-28', name: 'Raksha Bandhan', type: 'festival' },
  '2026-09-14': { date: '2026-09-14', name: 'Ganesh Chaturthi', type: 'regional', description: 'Peak Konkan Railway travel period' },
  '2026-09-15': { date: '2026-09-15', name: 'Ganesh Festival (Day 2)', type: 'regional' },
  '2026-09-24': { date: '2026-09-24', name: 'Anant Chaturdashi', type: 'regional', description: 'Ganesh Visarjan celebration' },
  '2026-10-02': { date: '2026-10-02', name: 'Mahatma Gandhi Jayanti', type: 'national', description: 'National holiday · 3-day long weekend' },
  '2026-10-20': { date: '2026-10-20', name: 'Dussehra / Vijayadashami', type: 'national', description: 'Festive peak travel rush' },
  '2026-11-08': { date: '2026-11-08', name: 'Diwali (Lakshmi Puja)', type: 'national', description: 'Deepavali festival · massive railway rush' },
  '2026-11-09': { date: '2026-11-09', name: 'Diwali Padwa / Govardhan Puja', type: 'festival' },
  '2026-11-10': { date: '2026-11-10', name: 'Bhai Dooj / Bhaubeej', type: 'festival' },
  '2026-11-24': { date: '2026-11-24', name: 'Guru Nanak Jayanti', type: 'national' },
  '2026-12-03': { date: '2026-12-03', name: 'Feast of St. Francis Xavier', type: 'goa', description: 'Major Goa state feast at Old Goa' },
  '2026-12-19': { date: '2026-12-19', name: 'Goa Liberation Day', type: 'goa', description: 'Goa state public holiday' },
  '2026-12-25': { date: '2026-12-25', name: 'Christmas Day', type: 'national', description: 'Super peak tourist season in Goa' },
  '2026-12-31': { date: '2026-12-31', name: "New Year's Eve", type: 'festival', description: 'Highest seasonal demand on Konkan corridor' },

  // ── 2027 Holidays ──────────────────────────────────────────────────────────
  '2027-01-01': { date: '2027-01-01', name: "New Year's Day", type: 'festival' },
  '2027-01-14': { date: '2027-01-14', name: 'Makar Sankranti / Pongal', type: 'festival' },
  '2027-01-26': { date: '2027-01-26', name: 'Republic Day', type: 'national' },
  '2027-02-19': { date: '2027-02-19', name: 'Shivaji Maharaj Jayanti', type: 'regional' },
  '2027-03-08': { date: '2027-03-08', name: 'Maha Shivratri', type: 'festival' },
  '2027-03-22': { date: '2027-03-22', name: 'Holi / Shigmo (Goa)', type: 'festival' },
  '2027-03-26': { date: '2027-03-26', name: 'Good Friday', type: 'national' },
  '2027-04-14': { date: '2027-04-14', name: 'Dr. Ambedkar Jayanti', type: 'national' },
  '2027-05-01': { date: '2027-05-01', name: 'Maharashtra Day', type: 'regional' },
  '2027-08-15': { date: '2027-08-15', name: 'Independence Day', type: 'national' },
  '2027-09-04': { date: '2027-09-04', name: 'Ganesh Chaturthi', type: 'regional' },
  '2027-10-02': { date: '2027-10-02', name: 'Mahatma Gandhi Jayanti', type: 'national' },
  '2027-10-09': { date: '2027-10-09', name: 'Dussehra', type: 'national' },
  '2027-10-29': { date: '2027-10-29', name: 'Diwali', type: 'national' },
  '2027-12-03': { date: '2027-12-03', name: 'Feast of St. Francis Xavier', type: 'goa' },
  '2027-12-19': { date: '2027-12-19', name: 'Goa Liberation Day', type: 'goa' },
  '2027-12-25': { date: '2027-12-25', name: 'Christmas Day', type: 'national' },
};

export const getHolidayForDate = (date: Date): Holiday | undefined => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const key = `${year}-${month}-${day}`;
  return HOLIDAYS[key];
};

export const getUpcomingHolidaysInRange = (startDate: Date, endDate: Date): Holiday[] => {
  const result: Holiday[] = [];
  const startKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
  const endKey = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

  Object.keys(HOLIDAYS)
    .sort()
    .forEach(key => {
      if (key >= startKey && key <= endKey) {
        result.push(HOLIDAYS[key]);
      }
    });

  return result;
};
