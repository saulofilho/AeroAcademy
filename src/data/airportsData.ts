import { AirportInfo } from '../types';

export const globalAirportsList: AirportInfo[] = [
  {
    id: 'sbgr',
    icao: 'SBGR',
    iata: 'GRU',
    name: 'Aeroporto Internacional de São Paulo / Guarulhos',
    city: 'São Paulo',
    country: 'Brasil',
    elevationFt: 2459,
    metarRaw: 'SBGR 311200Z 11008KT 9999 FEW030 22/15 Q1018 NOSIG',
    coordinates: { lat: -23.4356, lon: -46.4731 },
    atisFreq: 127.75,
    towerFreq: 118.40,
    groundFreq: 121.90,
    runways: [
      {
        ident: '10R',
        heading: 96,
        lengthFt: 12139,
        widthFt: 148,
        lengthMeters: 3700,
        widthMeters: 45,
        surface: 'asphalt',
        ilsFreq: 110.30,
        ilsCourse: 96,
        elevationFt: 2450,
        thresholdLat: -23.431,
        thresholdLon: -46.495
      },
      {
        ident: '28L',
        heading: 276,
        lengthFt: 12139,
        widthFt: 148,
        lengthMeters: 3700,
        widthMeters: 45,
        surface: 'asphalt',
        ilsFreq: 109.90,
        ilsCourse: 276,
        elevationFt: 2459,
        thresholdLat: -23.438,
        thresholdLon: -46.452
      }
    ],
    metarPreset: {
      windSpeedKts: 8,
      windDirDeg: 110,
      tempC: 22,
      dewpointC: 15,
      qnhHpa: 1018,
      clouds: 'few',
      visibilitySm: 10,
      rawText: 'SBGR 311200Z 11008KT 9999 FEW030 22/15 Q1018 NOSIG'
    }
  },
  {
    id: 'sbrj',
    icao: 'SBRJ',
    iata: 'SDU',
    name: 'Aeroporto Santos Dumont (Pão de Açúcar)',
    city: 'Rio de Janeiro',
    country: 'Brasil',
    elevationFt: 9,
    metarRaw: 'SBRJ 311200Z 19012KT 9999 SCT025 26/20 Q1014',
    coordinates: { lat: -22.9104, lon: -43.1631 },
    atisFreq: 127.60,
    towerFreq: 118.00,
    groundFreq: 121.70,
    runways: [
      {
        ident: '02R',
        heading: 22,
        lengthFt: 4341,
        widthFt: 138,
        lengthMeters: 1323,
        widthMeters: 42,
        surface: 'asphalt',
        elevationFt: 9,
        thresholdLat: -22.915,
        thresholdLon: -43.167
      },
      {
        ident: '20L',
        heading: 202,
        lengthFt: 4341,
        widthFt: 138,
        lengthMeters: 1323,
        widthMeters: 42,
        surface: 'asphalt',
        elevationFt: 9,
        thresholdLat: -22.905,
        thresholdLon: -43.160
      }
    ],
    metarPreset: {
      windSpeedKts: 12,
      windDirDeg: 190,
      tempC: 26,
      dewpointC: 20,
      qnhHpa: 1014,
      clouds: 'scattered',
      visibilitySm: 8,
      rawText: 'SBRJ 311200Z 19012KT 9999 SCT025 26/20 Q1014'
    }
  },
  {
    id: 'kjfk',
    icao: 'KJFK',
    iata: 'JFK',
    name: 'John F. Kennedy International Airport',
    city: 'New York',
    country: 'United States',
    elevationFt: 13,
    metarRaw: 'KJFK 311200Z 24014KT 10SM BKN040 18/10 A3000 RMK AO2',
    coordinates: { lat: 40.6413, lon: -73.7781 },
    atisFreq: 128.72,
    towerFreq: 119.10,
    groundFreq: 121.90,
    runways: [
      {
        ident: '04L',
        heading: 44,
        lengthFt: 12079,
        widthFt: 150,
        lengthMeters: 3682,
        widthMeters: 46,
        surface: 'concrete',
        ilsFreq: 110.90,
        ilsCourse: 44,
        elevationFt: 12,
        thresholdLat: 40.630,
        thresholdLon: -73.790
      },
      {
        ident: '22R',
        heading: 224,
        lengthFt: 8400,
        widthFt: 150,
        lengthMeters: 2560,
        widthMeters: 46,
        surface: 'concrete',
        ilsFreq: 110.90,
        ilsCourse: 224,
        elevationFt: 13,
        thresholdLat: 40.655,
        thresholdLon: -73.765
      }
    ],
    metarPreset: {
      windSpeedKts: 14,
      windDirDeg: 240,
      tempC: 18,
      dewpointC: 10,
      qnhHpa: 1016,
      clouds: 'broken',
      visibilitySm: 10,
      rawText: 'KJFK 311200Z 24014KT 10SM BKN040 18/10 A3000 RMK AO2'
    }
  },
  {
    id: 'lpma',
    icao: 'LPMA',
    iata: 'FNC',
    name: 'Cristiano Ronaldo Madeira Airport (Pista sobre Pilares)',
    city: 'Funchal, Madeira',
    country: 'Portugal',
    elevationFt: 192,
    metarRaw: 'LPMA 311200Z 34022G32KT 9999 FEW018 SCT030 21/16 Q1020 WS ALL RWY',
    coordinates: { lat: 32.6961, lon: -16.7744 },
    atisFreq: 124.35,
    towerFreq: 118.35,
    groundFreq: 121.75,
    runways: [
      {
        ident: '05',
        heading: 50,
        lengthFt: 9124,
        widthFt: 148,
        lengthMeters: 2781,
        widthMeters: 45,
        surface: 'concrete',
        elevationFt: 192,
        thresholdLat: 32.690,
        thresholdLon: -16.782
      },
      {
        ident: '23',
        heading: 230,
        lengthFt: 9124,
        widthFt: 148,
        lengthMeters: 2781,
        widthMeters: 45,
        surface: 'concrete',
        elevationFt: 185,
        thresholdLat: 32.702,
        thresholdLon: -16.765
      }
    ],
    metarPreset: {
      windSpeedKts: 22,
      windDirDeg: 340,
      tempC: 21,
      dewpointC: 16,
      qnhHpa: 1020,
      clouds: 'scattered',
      visibilitySm: 9,
      rawText: 'LPMA 311200Z 34022G32KT 9999 FEW018 SCT030 21/16 Q1020 WS ALL RWY'
    }
  },
  {
    id: 'lowi',
    icao: 'LOWI',
    iata: 'INN',
    name: 'Innsbruck Kranebitten Airport (Vale dos Alpes)',
    city: 'Innsbruck',
    country: 'Austria',
    elevationFt: 1906,
    metarRaw: 'LOWI 311200Z 26006KT 9999 FEW060 12/04 Q1022 NOSIG',
    coordinates: { lat: 47.2603, lon: 11.3440 },
    atisFreq: 126.02,
    towerFreq: 120.10,
    groundFreq: 121.70,
    runways: [
      {
        ident: '08',
        heading: 79,
        lengthFt: 6562,
        widthFt: 148,
        lengthMeters: 2000,
        widthMeters: 45,
        surface: 'asphalt',
        ilsFreq: 109.70,
        ilsCourse: 79,
        elevationFt: 1906,
        thresholdLat: 47.258,
        thresholdLon: 11.330
      },
      {
        ident: '26',
        heading: 259,
        lengthFt: 6562,
        widthFt: 148,
        lengthMeters: 2000,
        widthMeters: 45,
        surface: 'asphalt',
        elevationFt: 1895,
        thresholdLat: 47.262,
        thresholdLon: 11.358
      }
    ],
    metarPreset: {
      windSpeedKts: 6,
      windDirDeg: 260,
      tempC: 12,
      dewpointC: 4,
      qnhHpa: 1022,
      clouds: 'few',
      visibilitySm: 10,
      rawText: 'LOWI 311200Z 26006KT 9999 FEW060 12/04 Q1022 NOSIG'
    }
  },
  {
    id: 'tncm',
    icao: 'TNCM',
    iata: 'SXM',
    name: 'Princess Juliana International Airport (Maho Beach)',
    city: 'Philipsburg, Saint Martin',
    country: 'Sint Maarten',
    elevationFt: 14,
    metarRaw: 'TNCM 311200Z 09015KT 9999 FEW022 29/23 Q1013',
    coordinates: { lat: 18.0410, lon: -63.1089 },
    atisFreq: 127.85,
    towerFreq: 118.70,
    groundFreq: 121.90,
    runways: [
      {
        ident: '10',
        heading: 96,
        lengthFt: 7546,
        widthFt: 148,
        lengthMeters: 2300,
        widthMeters: 45,
        surface: 'asphalt',
        elevationFt: 14,
        thresholdLat: 18.040,
        thresholdLon: -63.120
      }
    ],
    metarPreset: {
      windSpeedKts: 15,
      windDirDeg: 90,
      tempC: 29,
      dewpointC: 23,
      qnhHpa: 1013,
      clouds: 'few',
      visibilitySm: 10,
      rawText: 'TNCM 311200Z 09015KT 9999 FEW022 29/23 Q1013'
    }
  }
];

export const globalAirports = globalAirportsList;
