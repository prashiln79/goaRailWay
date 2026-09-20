export interface BusDepartureSlot {
  period: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  times: string[];
}

export interface BusRouteSchedule {
  id: string;
  from: string;
  to: string;
  operator: string;
  busType: string;
  frequency: string;
  duration: string;
  fare: string;
  distance: string;
  pickupPoint: string;
  dropPoint: string;
  scheduleSlots: BusDepartureSlot[];
  keyStops: string[];
  travelTip: string;
}

export interface StationShuttleGuide {
  title: string;
  stationName: string;
  busStandName: string;
  distance: string;
  duration: string;
  sharedAutoFare: string;
  privateAutoFare: string;
  description: string;
}

export interface DirectCabGuide {
  title: string;
  options: {
    destination: string;
    distance: string;
    duration: string;
    estimatedFare: string;
  }[];
  tip: string;
}

export interface RoadTransitDetails {
  direction: 'TO_MUMBAI' | 'TO_GOA';
  hubStationCode: string;
  hubStationName: string;
  summaryTitle: string;
  summarySubtitle: string;
  shuttleGuide: StationShuttleGuide;
  busRoutes: BusRouteSchedule[];
  cabGuide: DirectCabGuide;
}

/**
 * Returns detailed bus timetable and road transit options for Goa ⇄ Sawantwadi / Border corridor.
 */
export function getBusAndRoadTransit(
  stationCode: string,
  direction: 'TO_MUMBAI' | 'TO_GOA',
): RoadTransitDetails {
  const isToMumbai = direction === 'TO_MUMBAI';

  if (isToMumbai) {
    // TRAVELER IS IN GOA -> TRAVELING TO SAWANTWADI ROAD TO BOARD TRAIN TO MUMBAI
    return {
      direction: 'TO_MUMBAI',
      hubStationCode: stationCode,
      hubStationName: 'Sawantwadi Road (SWV)',
      summaryTitle: 'Bus Timetable: Goa → Sawantwadi Station',
      summarySubtitle:
        'Frequent Kadamba (KTCL) & MSRTC state buses connect North Goa to Sawantwadi. Take a bus to Sawantwadi Bus Stand, then a quick 10-minute auto to the railway station.',
      shuttleGuide: {
        title: 'Last-Mile Transfer: Sawantwadi Bus Stand ⇄ Railway Station',
        stationName: 'Sawantwadi Road Railway Station (SWV)',
        busStandName: 'Sawantwadi Central Bus Stand (ST Stand)',
        distance: '6.2 km',
        duration: '10–12 mins',
        sharedAutoFare: '₹25–₹30 / seat',
        privateAutoFare: '₹120–₹150',
        description:
          'Shared 6-seater auto rickshaws & private autos wait outside Sawantwadi Bus Stand exit to drop passengers directly at Sawantwadi Road Railway Station platform entrance.',
      },
      busRoutes: [
        {
          id: 'route-mapusa-swv',
          from: 'Mapusa KTC Bus Stand',
          to: 'Sawantwadi Bus Stand',
          operator: 'Kadamba (KTCL) & MSRTC',
          busType: 'Ordinary & Semi-Luxury Express',
          frequency: 'Every 20–30 mins',
          duration: '~45–55 min',
          fare: '₹55–₹70',
          distance: '38 km',
          pickupPoint: 'Mapusa New KTC Bus Stand (Inter-state Bay 4 & 5)',
          dropPoint: 'Sawantwadi Central ST Bus Stand',
          scheduleSlots: [
            {
              period: 'Morning',
              times: ['06:15', '06:45', '07:15', '07:45', '08:15', '08:45', '09:15', '09:45', '10:30', '11:15'],
            },
            {
              period: 'Afternoon',
              times: ['12:00', '12:45', '13:30', '14:15', '15:00', '15:45', '16:30'],
            },
            {
              period: 'Evening',
              times: ['17:15', '18:00', '18:45', '19:30', '20:15'],
            },
          ],
          keyStops: ['Mapusa KTC', 'Colvale Bridge', 'Pernem (NH66)', 'Patradevi / Banda Border', 'Sawantwadi Bus Stand'],
          travelTip:
            'Plan to leave Mapusa at least 2 hours before your train departs from Sawantwadi Road to give yourself a relaxed buffer.',
        },
        {
          id: 'route-panaji-swv',
          from: 'Panaji KTC Bus Stand',
          to: 'Sawantwadi Bus Stand',
          operator: 'Kadamba (KTCL) Semi-Luxury / MSRTC',
          busType: 'Inter-State Semi-Luxury Express',
          frequency: 'Every 60–75 mins',
          duration: '~1h 15m – 1h 30m',
          fare: '₹85–₹110',
          distance: '52 km',
          pickupPoint: 'Panaji KTC Central Bus Stand (Platform 7/8)',
          dropPoint: 'Sawantwadi Central ST Bus Stand',
          scheduleSlots: [
            {
              period: 'Morning',
              times: ['06:45', '07:30', '08:30', '09:45', '11:00'],
            },
            {
              period: 'Afternoon',
              times: ['12:15', '13:30', '14:45', '16:00'],
            },
            {
              period: 'Evening',
              times: ['17:15', '18:30', '19:45'],
            },
          ],
          keyStops: ['Panaji KTC', 'Porvorim', 'Guirim', 'Mapusa KTC', 'Banda', 'Sawantwadi Bus Stand'],
          travelTip:
            'Direct tickets are issued onboard the bus or at the Kadamba inter-state ticketing counter at Panaji bus terminal.',
        },
        {
          id: 'route-pernem-swv',
          from: 'Pernem Highway Junction',
          to: 'Sawantwadi Bus Stand',
          operator: 'MSRTC & Kadamba Shuttle',
          busType: 'Local Inter-state Shuttle',
          frequency: 'Every 15–20 mins',
          duration: '~25–30 min',
          fare: '₹35–₹45',
          distance: '22 km',
          pickupPoint: 'Pernem NH66 Junction / Pernem Police Outpost',
          dropPoint: 'Sawantwadi Central ST Bus Stand',
          scheduleSlots: [
            {
              period: 'Morning',
              times: ['06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:45', '10:30', '11:15'],
            },
            {
              period: 'Afternoon',
              times: ['12:00', '12:45', '13:30', '14:15', '15:00', '15:45', '16:30'],
            },
            {
              period: 'Evening',
              times: ['17:15', '18:00', '18:45', '19:30', '20:15'],
            },
          ],
          keyStops: ['Pernem NH66', 'Torxem Checkpost', 'Banda Market', 'Sawantwadi'],
          travelTip:
            'Fastest road crossing into Maharashtra. Ideal if staying near Arambol, Mandrem, Morjim, or Mopa Airport.',
        },
      ],
      cabGuide: {
        title: 'Direct Taxi / Cab from Goa to Sawantwadi Station',
        options: [
          {
            destination: 'From Pernem / Mopa Airport',
            distance: '24 km',
            duration: '~30–35 min',
            estimatedFare: '₹700–₹900',
          },
          {
            destination: 'From Mapusa Town',
            distance: '38 km',
            duration: '~45–50 min',
            estimatedFare: '₹850–₹1,100',
          },
          {
            destination: 'From Arambol / Mandrem',
            distance: '32 km',
            duration: '~40–45 min',
            estimatedFare: '₹800–₹1,050',
          },
          {
            destination: 'From Calangute / Candolim / Baga',
            distance: '48 km',
            duration: '~1h 05m',
            estimatedFare: '₹1,200–₹1,500',
          },
          {
            destination: 'From Panaji (Capital)',
            distance: '54 km',
            duration: '~1h 15m',
            estimatedFare: '₹1,300–₹1,600',
          },
        ],
        tip: 'Prepaid taxis, GoaMiles cabs, and private autos can drop you directly at the Sawantwadi Road Railway Station porch without changing vehicles.',
      },
    };
  } else {
    // TRAVELER ARRIVES AT SAWANTWADI ON TRAIN FROM MUMBAI -> HEADING INTO GOA
    return {
      direction: 'TO_GOA',
      hubStationCode: stationCode,
      hubStationName: 'Sawantwadi Road (SWV)',
      summaryTitle: 'Bus Timetable: Sawantwadi Station → Goa',
      summarySubtitle:
        'Regular Kadamba & MSRTC buses depart every 20–30 mins from Sawantwadi into North Goa (Pernem, Mapusa, Panaji). Shared autos outside the station take you to the bus stand in 10 mins.',
      shuttleGuide: {
        title: 'First-Mile Transfer: Railway Station ⇄ Sawantwadi Bus Stand',
        stationName: 'Sawantwadi Road Railway Station (SWV)',
        busStandName: 'Sawantwadi Central Bus Stand (ST Stand)',
        distance: '6.2 km',
        duration: '10–12 mins',
        sharedAutoFare: '₹25–₹30 / seat',
        privateAutoFare: '₹120–₹150',
        description:
          'When you alight at Sawantwadi Road, walk out of the platform exit gate where shared autos (₹25/seat) and private autos are queued for the Sawantwadi Bus Stand.',
      },
      busRoutes: [
        {
          id: 'route-swv-mapusa',
          from: 'Sawantwadi Bus Stand',
          to: 'Mapusa KTC Bus Stand (North Goa)',
          operator: 'Kadamba (KTCL) & MSRTC',
          busType: 'Ordinary & Semi-Luxury Express',
          frequency: 'Every 20–30 mins',
          duration: '~45–55 min',
          fare: '₹55–₹70',
          distance: '38 km',
          pickupPoint: 'Sawantwadi Central Bus Stand (Goa Bay)',
          dropPoint: 'Mapusa New KTC Bus Stand',
          scheduleSlots: [
            {
              period: 'Morning',
              times: ['06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:15', '11:00'],
            },
            {
              period: 'Afternoon',
              times: ['11:45', '12:30', '13:15', '14:00', '14:45', '15:30', '16:15'],
            },
            {
              period: 'Evening',
              times: ['17:00', '17:45', '18:30', '19:15', '20:00', '20:45'],
            },
          ],
          keyStops: ['Sawantwadi', 'Banda Border', 'Pernem (NH66)', 'Colvale', 'Mapusa KTC'],
          travelTip:
            'From Mapusa KTC Bus Stand, local connecting buses leave every 10–15 mins to Calangute, Baga, Candolim, Anjuna, and Vagator.',
        },
        {
          id: 'route-swv-panaji',
          from: 'Sawantwadi Bus Stand',
          to: 'Panaji KTC Bus Stand (Capital)',
          operator: 'Kadamba (KTCL) & MSRTC',
          busType: 'Semi-Luxury Inter-State Express',
          frequency: 'Every 60–75 mins',
          duration: '~1h 15m – 1h 30m',
          fare: '₹85–₹110',
          distance: '52 km',
          pickupPoint: 'Sawantwadi Central Bus Stand (Bay 2)',
          dropPoint: 'Panaji KTC Central Bus Stand',
          scheduleSlots: [
            {
              period: 'Morning',
              times: ['07:15', '08:15', '09:30', '10:45'],
            },
            {
              period: 'Afternoon',
              times: ['12:00', '13:15', '14:30', '15:45'],
            },
            {
              period: 'Evening',
              times: ['17:00', '18:15', '19:30'],
            },
          ],
          keyStops: ['Sawantwadi', 'Banda', 'Mapusa KTC', 'Porvorim', 'Panaji KTC'],
          travelTip:
            'Stops inside Panaji central city. Great choice for central Goa, Old Goa, and Miramar.',
        },
        {
          id: 'route-swv-pernem',
          from: 'Sawantwadi Bus Stand',
          to: 'Pernem (North Goa Border)',
          operator: 'MSRTC & Kadamba Local',
          busType: 'Frequent Inter-state Shuttle',
          frequency: 'Every 15–20 mins',
          duration: '~25–30 min',
          fare: '₹35–₹45',
          distance: '22 km',
          pickupPoint: 'Sawantwadi Central Bus Stand',
          dropPoint: 'Pernem NH66 Junction',
          scheduleSlots: [
            {
              period: 'Morning',
              times: ['06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00'],
            },
            {
              period: 'Afternoon',
              times: ['11:30', '12:15', '13:00', '13:45', '14:30', '15:15', '16:00'],
            },
            {
              period: 'Evening',
              times: ['16:45', '17:30', '18:15', '19:00', '19:45', '20:30'],
            },
          ],
          keyStops: ['Sawantwadi', 'Banda', 'Torxem', 'Pernem NH66'],
          travelTip:
            'Quickest transit into North Goa. You can hire an auto/taxi from Pernem directly to Mandrem, Morjim, or Arambol beach.',
        },
      ],
      cabGuide: {
        title: 'Direct Prepaid Taxis from Sawantwadi Station into Goa',
        options: [
          {
            destination: 'To Pernem / Torxem',
            distance: '24 km',
            duration: '~30–35 min',
            estimatedFare: '₹700–₹900',
          },
          {
            destination: 'To Arambol / Mandrem / Morjim',
            distance: '34 km',
            duration: '~45–50 min',
            estimatedFare: '₹850–₹1,100',
          },
          {
            destination: 'To Mapusa Town',
            distance: '38 km',
            duration: '~45–50 min',
            estimatedFare: '₹850–₹1,100',
          },
          {
            destination: 'To Calangute / Baga / Anjuna',
            distance: '48 km',
            duration: '~1h 05m',
            estimatedFare: '₹1,200–₹1,500',
          },
          {
            destination: 'To Panaji / Candolim',
            distance: '54 km',
            duration: '~1h 15m',
            estimatedFare: '₹1,300–₹1,600',
          },
        ],
        tip: 'Local Maharashtra & Goa tourist taxis are parked right outside Platform 1 exit. Rates are standard union rates; confirm the fare before departing.',
      },
    };
  }
}
