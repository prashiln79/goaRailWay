import { Train } from '../types/Train';
import { GOA_STATION_CODES, MUMBAI_STATION_CODES } from '../data/corridorHubs';
import { STATION_MAP } from '../data/stations';
import { getBusAndRoadTransit, RoadTransitDetails } from '../data/busTimetable';

export type JourneyDirection = 'TO_GOA' | 'TO_MUMBAI';

export interface GoaConnectingStop {
  stationCode: string;
  stationName: string;
  time: string; // departureTime (if feeder to SWV) or arrivalTime (if onward to Goa)
}

export interface GoaConnectingTrain {
  train: Train;
  transferStationCode: string;
  transferStationName: string;
  transferTime: string; // SWV arrival time (feeder) or SWV departure time (onward)
  layoverMinutes: number;
  layoverFormatted: string;
  goaStops: GoaConnectingStop[];
  ticketTip: string;
  direction: JourneyDirection;
  isPassengerShuttle?: boolean;
}

export interface ConnectionAnalysis {
  direction: JourneyDirection;
  isDirect: boolean;
  isDirectToGoa?: boolean;
  transferStationCode: string;
  transferStationName: string;
  transferTime: string; // SWV arrival time (if TO_GOA) or SWV departure time (if TO_MUMBAI)
  connectingTrains: GoaConnectingTrain[];
  roadTransitAdvice?: {
    title: string;
    description: string;
  };
  roadTransitDetails?: RoadTransitDetails;
}

/**
 * Parses "HH:mm" time string into minutes from 00:00.
 */
function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Formats minutes duration into "Xh Ym" or "Xm".
 */
function formatMinutes(totalMins: number): string {
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/**
 * Analyzes connecting train options for a train on the Goa ⇄ Mumbai corridor.
 * Handles both directions:
 * 1. TO_GOA: Train terminates at Sawantwadi -> finds onward trains from Sawantwadi into Goa.
 * 2. TO_MUMBAI: Train starts at Sawantwadi -> finds feeder trains from Goa to Sawantwadi.
 */
export function getConnectingGoaTrains(currentTrain: Train, allTrains: Train[] = []): ConnectionAnalysis {
  const stops = currentTrain.stops;
  if (!stops || stops.length === 0) {
    return {
      direction: 'TO_GOA',
      isDirect: true,
      transferStationCode: '',
      transferStationName: '',
      transferTime: '',
      connectingTrains: [],
    };
  }

  const lastStop = stops[stops.length - 1];
  const firstStop = stops[0];

  // Determine train direction:
  // If destination is in Mumbai (or stops end in Mumbai), it's heading TO_MUMBAI (Northbound).
  // Otherwise, it's heading TO_GOA (Southbound).
  const isHeadingToMumbai =
    MUMBAI_STATION_CODES.has(currentTrain.destinationStationCode) ||
    MUMBAI_STATION_CODES.has(lastStop.stationCode);

  const direction: JourneyDirection = isHeadingToMumbai ? 'TO_MUMBAI' : 'TO_GOA';

  // ════════════════════════════════════════════════════════════════════
  // DIRECTION: TO_MUMBAI (Goa → Mumbai)
  // ════════════════════════════════════════════════════════════════════
  if (direction === 'TO_MUMBAI') {
    // Check if train starts inside Goa
    const hasGoaStop = stops.some(s => GOA_STATION_CODES.has(s.stationCode));
    const isDirect = hasGoaStop;

    // Transfer station is where the Mumbai train begins (e.g. Sawantwadi Road SWV)
    const transferStationCode = firstStop.stationCode;
    const transferStationName = STATION_MAP[transferStationCode]?.name ?? transferStationCode;
    const transferDepTime = firstStop.departureTime ?? '00:00';
    const transferDepMins = timeToMinutes(transferDepTime);

    const connectingTrains: GoaConnectingTrain[] = [];

    if (!isDirect) {
      // Find feeder trains departing from Goa that arrive at transferStationCode BEFORE transferDepTime
      for (const t of allTrains) {
        if (t.trainNumber === currentTrain.trainNumber) continue;

        // Must have a stop in Goa
        const firstGoaIdx = t.stops.findIndex(s => GOA_STATION_CODES.has(s.stationCode));
        if (firstGoaIdx === -1) continue;

        // Must have a stop at transferStationCode AFTER the Goa stop
        const transferIdx = t.stops.findIndex(
          (s, idx) => idx > firstGoaIdx && s.stationCode === transferStationCode,
        );
        if (transferIdx === -1) continue;

        const feederArrTime = t.stops[transferIdx].arrivalTime ?? t.stops[transferIdx].departureTime ?? '00:00';
        const feederArrMins = timeToMinutes(feederArrTime);

        // Layover = time to wait at transfer station before Mumbai train departs
        let layover = transferDepMins - feederArrMins;
        if (layover < 0) {
          layover += 1440;
        }

        // Reasonable layover: 10 mins to 6 hours (360 mins)
        if (layover < 10 || layover > 360) continue;

        // Collect all Goa stations where passengers can board this feeder train
        const goaBoardingStops = t.stops
          .slice(firstGoaIdx, transferIdx)
          .filter(s => GOA_STATION_CODES.has(s.stationCode))
          .map(s => ({
            stationCode: s.stationCode,
            stationName: STATION_MAP[s.stationCode]?.name ?? s.stationCode,
            time: s.departureTime ?? s.arrivalTime ?? '',
          }));

        const isPassenger = t.type === 'Passenger' || t.type === 'DEMU';
        const ticketTip = isPassenger
          ? 'Feeder from Goa: Board at any Goa station with an unreserved counter ticket (~₹15–30). Arrives at Sawantwadi Road on time to board your Mumbai train.'
          : 'Feeder from Goa: Board general / 2S coach at any Goa station to reach Sawantwadi Road, then transfer to your booked Mumbai train.';

        connectingTrains.push({
          train: t,
          transferStationCode,
          transferStationName,
          transferTime: feederArrTime,
          layoverMinutes: layover,
          layoverFormatted: formatMinutes(layover),
          goaStops: goaBoardingStops,
          ticketTip,
          direction: 'TO_MUMBAI',
          isPassengerShuttle: isPassenger,
        });
      }

      // Sort by shortest layover first
      connectingTrains.sort((a, b) => a.layoverMinutes - b.layoverMinutes);
    }

    const roadTransitAdvice = !isDirect
      ? {
          title: 'Local Bus & Taxi from North Goa to Sawantwadi Road (38 km)',
          description:
            'If traveling from North Goa (Mapusa, Pernem, Arambol), Kadamba & MSRTC state buses run regularly to Sawantwadi Road station (~35–50 min) so you can easily board your Mumbai train.',
        }
      : undefined;

    const roadTransitDetails = !isDirect
      ? getBusAndRoadTransit(transferStationCode, 'TO_MUMBAI')
      : undefined;

    return {
      direction: 'TO_MUMBAI',
      isDirect,
      isDirectToGoa: isDirect,
      transferStationCode,
      transferStationName,
      transferTime: transferDepTime,
      connectingTrains,
      roadTransitAdvice,
      roadTransitDetails,
    };
  }

  // ════════════════════════════════════════════════════════════════════
  // DIRECTION: TO_GOA (Mumbai → Goa)
  // ════════════════════════════════════════════════════════════════════
  const directGoaStops = stops.filter(s => GOA_STATION_CODES.has(s.stationCode));
  const isDirect = directGoaStops.length > 0;

  const transferStationCode = lastStop.stationCode;
  const transferStationName = STATION_MAP[transferStationCode]?.name ?? transferStationCode;
  const transferArrivalTime = lastStop.arrivalTime ?? lastStop.departureTime ?? '00:00';
  const arrivalMins = timeToMinutes(transferArrivalTime);

  const connectingTrains: GoaConnectingTrain[] = [];

  if (!isDirect) {
    // Train ends short of Goa (e.g. at Sawantwadi Road) -> find onward trains into Goa
    for (const t of allTrains) {
      if (t.trainNumber === currentTrain.trainNumber) continue;

      const stopIdx = t.stops.findIndex(s => s.stationCode === transferStationCode);
      if (stopIdx === -1) continue;

      const subsequentGoaStops = t.stops
        .slice(stopIdx + 1)
        .filter(s => GOA_STATION_CODES.has(s.stationCode));

      if (subsequentGoaStops.length === 0) continue;

      const depTime = t.stops[stopIdx].departureTime ?? t.stops[stopIdx].arrivalTime ?? '00:00';
      const depMins = timeToMinutes(depTime);

      let layover = depMins - arrivalMins;
      if (layover < 0) {
        layover += 1440;
      }

      if (layover < 10 || layover > 420) continue;

      const isPassenger = t.type === 'Passenger' || t.type === 'DEMU';
      const ticketTip = isPassenger
        ? 'General / Unreserved: Purchase counter ticket (~₹15–30) at station. No advance booking required. Board general coach on same track.'
        : 'General / 2S Coach: Unreserved coaches available at front & rear of train. Counter ticket valid for same-day boarding into Goa.';

        connectingTrains.push({
          train: t,
          transferStationCode,
          transferStationName,
          transferTime: depTime,
          layoverMinutes: layover,
          layoverFormatted: formatMinutes(layover),
          goaStops: subsequentGoaStops.map(s => ({
            stationCode: s.stationCode,
            stationName: STATION_MAP[s.stationCode]?.name ?? s.stationCode,
            time: s.arrivalTime ?? s.departureTime ?? '',
          })),
          ticketTip,
          direction: 'TO_GOA',
          isPassengerShuttle: isPassenger,
        });
      }

      connectingTrains.sort((a, b) => a.layoverMinutes - b.layoverMinutes);
    }

    const roadTransitAdvice = !isDirect
      ? {
          title: 'Local Bus & Taxi into North Goa (38 km)',
          description:
            'Kadamba and MSRTC state buses depart every 15–20 minutes outside Sawantwadi station to Pernem (22 km · ~30 min) and Mapusa / North Goa (38 km · ~50 min). Pre-paid cabs and shared rickshaws are also stationed at the exit.',
        }
      : undefined;

    const roadTransitDetails = !isDirect
      ? getBusAndRoadTransit(transferStationCode, 'TO_GOA')
      : undefined;

    return {
      direction: 'TO_GOA',
      isDirect,
      isDirectToGoa: isDirect,
      transferStationCode,
      transferStationName,
      transferTime: transferArrivalTime,
      connectingTrains,
      roadTransitAdvice,
      roadTransitDetails,
    };
}
