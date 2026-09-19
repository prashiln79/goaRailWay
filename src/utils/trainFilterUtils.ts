import { Train } from '../types/Train';
import { STATION_MAP } from '../data/stations';
import {
  CorridorHubId,
  GOA_STATION_CODES,
  SWV_STATION_CODES,
  RN_STATION_CODES,
  MUMBAI_STATION_CODES,
  KONKAN_CODES,
} from '../data/corridorHubs';
import { TrainCardSegment } from '../components/TrainCard';

export type TimingFilter = 'All' | 'Early Morning' | 'Morning' | 'Afternoon' | 'Evening' | 'Night';
export type SortType = 'Night journeys first' | 'Departure time' | 'Journey duration' | 'Arrival time';

export const TIMING_FILTER_OPTIONS: { id: TimingFilter; label: string }[] = [
  { id: 'All', label: 'All Times' },
  { id: 'Early Morning', label: '🌅 04:00 - 08:00' },
  { id: 'Morning', label: '☀️ 08:00 - 12:00' },
  { id: 'Afternoon', label: '🌤️ 12:00 - 17:00' },
  { id: 'Evening', label: '🌙 17:00 - 21:00' },
  { id: 'Night', label: '🌌 21:00 - 04:00' },
];

export const SORT_OPTIONS: SortType[] = [
  'Night journeys first',
  'Departure time',
  'Arrival time',
  'Journey duration',
];

/**
 * Returns the sequence index of the first stop matching any code in the set, or -1.
 */
export function firstMatchIndex(train: Train, codeSet: Set<string>): number {
  return train.stops.findIndex(s => codeSet.has(s.stationCode));
}

/**
 * Returns the stop index for a specific station code, or -1.
 */
export function stopIndex(train: Train, code: string): number {
  return train.stops.findIndex(s => s.stationCode === code);
}

/**
 * Returns departure time of the first stop.
 */
export function getDepTime(train: Train): string {
  return train.stops[0]?.departureTime ?? '00:00';
}

interface FilterAndSortOptions {
  selectedHub: CorridorHubId;
  selectedStationCode: string | null;
  timingFilter: TimingFilter;
  sortOption: SortType;
}

/**
 * Filters and sorts trains according to hub, station, departure time, and sort criteria.
 */
export function filterAndSortTrains(
  allTrains: Train[],
  { selectedHub, selectedStationCode, timingFilter, sortOption }: FilterAndSortOptions,
): Train[] {
  let list = [...allTrains];

  // 1. Hub / Station Selection Filter — with directional logic for terminal hubs
  if (selectedHub === 'Goa') {
    if (selectedStationCode && selectedStationCode !== 'ALL_GOA') {
      // Filter trains that stop at the specific Goa station AND are traveling TOWARD Goa
      // (i.e., a Mumbai/Konkan stop appears before the Goa stop in the stops sequence)
      list = list.filter(t => {
        const goaIdx = stopIndex(t, selectedStationCode);
        if (goaIdx === -1) return false;
        const northBeforeGoa = t.stops
          .slice(0, goaIdx)
          .some(
            s =>
              MUMBAI_STATION_CODES.has(s.stationCode) ||
              SWV_STATION_CODES.has(s.stationCode) ||
              RN_STATION_CODES.has(s.stationCode),
          );
        return (
          northBeforeGoa ||
          MUMBAI_STATION_CODES.has(t.sourceStationCode) ||
          RN_STATION_CODES.has(t.sourceStationCode)
        );
      });
    } else {
      // All Goa — trains that are heading toward or terminating in Goa (from Mumbai/Konkan)
      list = list.filter(t => {
        const firstGoaIdx = firstMatchIndex(t, GOA_STATION_CODES);
        if (firstGoaIdx === -1) return false;
        const northBeforeGoa = t.stops
          .slice(0, firstGoaIdx)
          .some(
            s =>
              MUMBAI_STATION_CODES.has(s.stationCode) ||
              SWV_STATION_CODES.has(s.stationCode) ||
              RN_STATION_CODES.has(s.stationCode),
          );
        const originatesNorth =
          MUMBAI_STATION_CODES.has(t.sourceStationCode) ||
          RN_STATION_CODES.has(t.sourceStationCode);
        return northBeforeGoa || originatesNorth;
      });
    }
  } else if (selectedHub === 'Sawantwadi') {
    // Bidirectional — show all trains passing through Sindhudurg region
    if (selectedStationCode && selectedStationCode !== 'ALL_SWV') {
      list = list.filter(t => t.stops.some(s => s.stationCode === selectedStationCode));
    } else {
      list = list.filter(t => t.stops.some(s => SWV_STATION_CODES.has(s.stationCode)));
    }
  } else if (selectedHub === 'Ratnagiri') {
    // Bidirectional — show all trains passing through Central Konkan
    if (selectedStationCode && selectedStationCode !== 'ALL_RN') {
      list = list.filter(t => t.stops.some(s => s.stationCode === selectedStationCode));
    } else {
      list = list.filter(t => t.stops.some(s => RN_STATION_CODES.has(s.stationCode)));
    }
  } else if (selectedHub === 'Mumbai') {
    if (selectedStationCode && selectedStationCode !== 'ALL_MUMBAI') {
      // Filter trains that stop at the specific Mumbai station AND are traveling TOWARD Mumbai
      // (i.e., the Mumbai stop appears after a Goa/Konkan stop)
      list = list.filter(t => {
        const mumbaiIdx = stopIndex(t, selectedStationCode);
        if (mumbaiIdx === -1) return false;
        return t.stops.slice(0, mumbaiIdx).some(s => KONKAN_CODES.has(s.stationCode));
      });
    } else {
      // All Mumbai hubs — trains heading FROM Goa/Konkan TO Mumbai
      list = list.filter(t => {
        const firstMumbaiIdx = firstMatchIndex(t, MUMBAI_STATION_CODES);
        if (firstMumbaiIdx === -1) return false;
        return t.stops.slice(0, firstMumbaiIdx).some(s => KONKAN_CODES.has(s.stationCode));
      });
    }
  }

  // 2. Timing Filter
  if (timingFilter !== 'All') {
    list = list.filter(t => {
      const depTime = getDepTime(t);
      const hour = parseInt(depTime.split(':')[0] || '12', 10);

      if (timingFilter === 'Early Morning') return hour >= 4 && hour < 8;
      if (timingFilter === 'Morning') return hour >= 8 && hour < 12;
      if (timingFilter === 'Afternoon') return hour >= 12 && hour < 17;
      if (timingFilter === 'Evening') return hour >= 17 && hour < 21;
      if (timingFilter === 'Night') return hour >= 21 || hour < 4;
      return true;
    });
  }

  // 3. Sorting
  return list.sort((a, b) => {
    const aSeg = getContextualSegment(a, selectedHub, selectedStationCode);
    const bSeg = getContextualSegment(b, selectedHub, selectedStationCode);

    const aDepTime = aSeg?.fromTime || getDepTime(a);
    const bDepTime = bSeg?.fromTime || getDepTime(b);
    const aArrTime = aSeg?.toTime || (a.stops[a.stops.length - 1]?.arrivalTime ?? '00:00');
    const bArrTime = bSeg?.toTime || (b.stops[b.stops.length - 1]?.arrivalTime ?? '00:00');

    if (sortOption === 'Night journeys first') {
      const aNight = isNightJourney(a, selectedHub, selectedStationCode);
      const bNight = isNightJourney(b, selectedHub, selectedStationCode);

      // Night journeys take precedence
      if (aNight && !bNight) return -1;
      if (!aNight && bNight) return 1;

      // Both are night journeys: order by evening -> late night sequence
      if (aNight && bNight) {
        return getNightSortMinutes(aDepTime) - getNightSortMinutes(bDepTime);
      }

      // Both are daytime journeys: order by departure time
      return aDepTime.localeCompare(bDepTime);
    }

    if (sortOption === 'Departure time') return aDepTime.localeCompare(bDepTime);
    if (sortOption === 'Arrival time') return aArrTime.localeCompare(bArrTime);
    if (sortOption === 'Journey duration') {
      const dur = (t: Train, seg: TrainCardSegment | null) => {
        if (seg) {
          const [dh, dm] = (seg.fromTime || '00:00').split(':').map(Number);
          const [ah, am] = (seg.toTime || '00:00').split(':').map(Number);
          return (seg.toDay - seg.fromDay) * 1440 + (ah * 60 + am) - (dh * 60 + dm);
        }
        const f = t.stops[0];
        const l = t.stops[t.stops.length - 1];
        const [dh, dm] = (f?.departureTime ?? '00:00').split(':').map(Number);
        const [ah, am] = (l?.arrivalTime ?? l?.departureTime ?? '00:00').split(':').map(Number);
        return (
          ((l?.dayOffset ?? 0) - (f?.dayOffset ?? 0)) * 1440 +
          (ah * 60 + am) -
          (dh * 60 + dm)
        );
      };
      return dur(a, aSeg) - dur(b, bSeg);
    }
    return 0;
  });
}

/**
 * Computes a contextual journey segment for a selected hub/station.
 * Returns the from-stop and to-stop relevant to the user's selected context.
 */
export function getContextualSegment(
  train: Train,
  selectedHub: CorridorHubId,
  selectedStationCode: string | null,
): TrainCardSegment | null {
  if (!selectedHub) return null;

  // When Mumbai is selected: show the Goa/Konkan start → Mumbai end segment
  if (selectedHub === 'Mumbai') {
    const targetCodes =
      selectedStationCode && selectedStationCode !== 'ALL_MUMBAI'
        ? new Set([selectedStationCode])
        : MUMBAI_STATION_CODES;
    const firstMumbaiIdx = firstMatchIndex(train, targetCodes);
    if (firstMumbaiIdx === -1) return null;

    // Find the first Konkan/Goa stop as the segment origin
    const firstKonkanIdx = firstMatchIndex(train, KONKAN_CODES);
    const segFromIdx =
      firstKonkanIdx !== -1 && firstKonkanIdx < firstMumbaiIdx ? firstKonkanIdx : 0;
    const fromStop = train.stops[segFromIdx];
    const toStop = train.stops[firstMumbaiIdx];
    if (!fromStop || !toStop) return null;

    return {
      fromCode: fromStop.stationCode,
      fromName: STATION_MAP[fromStop.stationCode]?.name ?? fromStop.stationCode,
      fromTime: fromStop.departureTime ?? fromStop.arrivalTime ?? '',
      fromDay: fromStop.dayOffset ?? 0,
      toCode: toStop.stationCode,
      toName: STATION_MAP[toStop.stationCode]?.name ?? toStop.stationCode,
      toTime: toStop.arrivalTime ?? toStop.departureTime ?? '',
      toDay: toStop.dayOffset ?? 0,
      direction: '→ Mumbai',
      directionColor: '#1565C0',
      directionBg: '#E3F2FD',
    };
  }

  // When Goa is selected: show the Mumbai/Konkan start → Goa end segment
  if (selectedHub === 'Goa') {
    let toStop: (typeof train.stops)[0] | undefined;

    if (selectedStationCode && selectedStationCode !== 'ALL_GOA') {
      toStop = train.stops.find(s => s.stationCode === selectedStationCode);
    } else {
      // For ALL_GOA: if train terminates in Goa, use its destination stop (e.g. MAO or VSG)
      if (GOA_STATION_CODES.has(train.destinationStationCode)) {
        toStop = train.stops.find(s => s.stationCode === train.destinationStationCode);
      } else {
        // Otherwise prefer MAO (Madgaon Jn) or the last Goa stop on this train
        toStop =
          train.stops.find(s => s.stationCode === 'MAO') ??
          [...train.stops].reverse().find(s => GOA_STATION_CODES.has(s.stationCode));
      }
    }

    if (!toStop) return null;

    // The segment starts from train's origin stop (Mumbai/Konkan side)
    const fromStop = train.stops[0];
    if (!fromStop || fromStop.stationCode === toStop.stationCode) return null;

    return {
      fromCode: fromStop.stationCode,
      fromName: STATION_MAP[fromStop.stationCode]?.name ?? fromStop.stationCode,
      fromTime: fromStop.departureTime ?? '',
      fromDay: fromStop.dayOffset ?? 0,
      toCode: toStop.stationCode,
      toName: STATION_MAP[toStop.stationCode]?.name ?? toStop.stationCode,
      toTime: toStop.arrivalTime ?? toStop.departureTime ?? '',
      toDay: toStop.dayOffset ?? 0,
      direction: '→ Goa',
      directionColor: '#2E7D32',
      directionBg: '#EBF5EB',
    };
  }

  // For Sawantwadi / Ratnagiri: just highlight the halt
  if (selectedStationCode && !selectedStationCode.startsWith('ALL_')) {
    const haltStop = train.stops.find(s => s.stationCode === selectedStationCode);
    if (!haltStop) return null;

    return {
      fromCode: haltStop.stationCode,
      fromName: STATION_MAP[haltStop.stationCode]?.name ?? haltStop.stationCode,
      fromTime: haltStop.arrivalTime ?? haltStop.departureTime ?? '',
      fromDay: haltStop.dayOffset ?? 0,
      toCode: '',
      toName: '',
      toTime: haltStop.departureTime ?? '',
      toDay: haltStop.dayOffset ?? 0,
      direction: 'Halt',
      directionColor: '#7B5E52',
      directionBg: '#F5EDE8',
    };
  }

  return null;
}

/**
 * Determines if a train journey is a night / overnight journey.
 * Overnight journeys (crossing midnight or departing evening/night) are highly preferred
 * by passengers on the Konkan railway corridor.
 */
export function isNightJourney(
  train: Train,
  selectedHub: CorridorHubId,
  selectedStationCode: string | null,
): boolean {
  const seg = getContextualSegment(train, selectedHub, selectedStationCode);
  if (seg) {
    // 1. Crosses midnight to next day (overnight)
    if (seg.toDay > seg.fromDay) return true;

    // 2. Evening / night departure (17:00 onwards or late night < 04:00)
    const depHour = parseInt(seg.fromTime.split(':')[0] || '12', 10);
    if (depHour >= 17 || depHour < 4) return true;

    // 3. Arrives early morning after long travel
    const arrHour = parseInt(seg.toTime.split(':')[0] || '12', 10);
    if (arrHour < 8 && (depHour >= 14 || seg.toDay > 0)) return true;

    return false;
  }

  // Fallback if no contextual segment available
  const depTime = getDepTime(train);
  const depHour = parseInt(depTime.split(':')[0] || '12', 10);
  const first = train.stops[0];
  const last = train.stops[train.stops.length - 1];
  const crossesMidnight = (last?.dayOffset ?? 0) > (first?.dayOffset ?? 0);

  if (crossesMidnight && (depHour >= 14 || depHour < 4)) return true;
  if (depHour >= 17 || depHour < 4) return true;

  return false;
}

/**
 * Returns minute offset from noon (12:00) for night journeys so that evening trains
 * (15:00, 18:00, 22:00, 23:00) appear in natural chronological sequence followed by
 * post-midnight departures (00:00, 01:00, 02:00).
 */
export function getNightSortMinutes(timeStr: string): number {
  const [h, m] = (timeStr || '00:00').split(':').map(Number);
  return h >= 12 ? h * 60 + m : (h + 24) * 60 + m;
}
