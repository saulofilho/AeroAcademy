export interface NavWaypoint {
  id: string;
  name: string;
  type: 'fix' | 'vor' | 'ndb' | 'airport' | 'rwy_threshold';
  freq?: string;
  lat: number;
  lon: number;
  elevationFt?: number;
  radial?: number;
}

export interface TerrainFeature {
  id: string;
  name: string;
  type: 'mountain_peak' | 'water_body' | 'coastline' | 'valley' | 'obstacle';
  elevationFt: number;
  lat: number;
  lon: number;
  radiusNm?: number;
  color?: string;
}

export interface AirportNavData {
  airportIcao: string;
  waypoints: NavWaypoint[];
  terrainFeatures: TerrainFeature[];
}

export const regionalNavData: Record<string, AirportNavData> = {
  SBGR: {
    airportIcao: 'SBGR',
    waypoints: [
      { id: 'OPERA', name: 'OPERA', type: 'fix', lat: -23.360, lon: -46.610 },
      { id: 'SURBO', name: 'SURBO', type: 'fix', lat: -23.490, lon: -46.320 },
      { id: 'VASPO', name: 'VASPO', type: 'fix', lat: -23.280, lon: -46.420 },
      { id: 'NIPID', name: 'NIPID', type: 'fix', lat: -23.510, lon: -46.600 },
      { id: 'UMBIX', name: 'UMBIX', type: 'fix', lat: -23.410, lon: -46.220 },
      { id: 'CGO', name: 'CONGONHAS VOR', type: 'vor', freq: '116.90', lat: -23.626, lon: -46.656, elevationFt: 2631 },
      { id: 'BCO', name: 'BRAGANÇA VOR', type: 'vor', freq: '115.70', lat: -22.951, lon: -46.536, elevationFt: 2900 },
      { id: 'SBSP', name: 'SBSP Congonhas', type: 'airport', lat: -23.627, lon: -46.656, elevationFt: 2631 },
      { id: 'SBMT', name: 'SBMT Campo de Marte', type: 'airport', lat: -23.509, lon: -46.637, elevationFt: 2369 },
    ],
    terrainFeatures: [
      { id: 'cantareira', name: 'Serra da Cantareira', type: 'mountain_peak', elevationFt: 3950, lat: -23.380, lon: -46.580, radiusNm: 4.5 },
      { id: 'jaragua', name: 'Pico do Jaraguá', type: 'mountain_peak', elevationFt: 3720, lat: -23.458, lon: -46.766, radiusNm: 2.0 },
      { id: 'itaquere', name: 'Represa Billings / Guarapiranga', type: 'water_body', elevationFt: 2400, lat: -23.720, lon: -46.650, radiusNm: 5.0 },
    ],
  },
  SBRJ: {
    airportIcao: 'SBRJ',
    waypoints: [
      { id: 'PAO', name: 'PÃO DE AÇÚCAR', type: 'fix', lat: -22.949, lon: -43.155 },
      { id: 'GIG', name: 'GALEÃO VOR', type: 'vor', freq: '114.60', lat: -22.810, lon: -43.250, elevationFt: 28 },
      { id: 'CAX', name: 'CAXIAS VOR', type: 'vor', freq: '113.80', lat: -22.750, lon: -43.300 },
      { id: 'SANTO', name: 'SANTO', type: 'fix', lat: -22.880, lon: -43.140 },
      { id: 'NIT', name: 'NITERÓI NDB', type: 'ndb', freq: '330.0', lat: -22.890, lon: -43.080 },
      { id: 'SBGL', name: 'SBGL Galeão Intl', type: 'airport', lat: -22.808, lon: -43.243, elevationFt: 28 },
    ],
    terrainFeatures: [
      { id: 'sugarloaf', name: 'Pão de Açúcar', type: 'mountain_peak', elevationFt: 1299, lat: -22.949, lon: -43.155, radiusNm: 1.2 },
      { id: 'corcovado', name: 'Corcovado / Cristo Redentor', type: 'mountain_peak', elevationFt: 2329, lat: -22.951, lon: -43.210, radiusNm: 1.8 },
      { id: 'tijuca', name: 'Pico da Tijuca', type: 'mountain_peak', elevationFt: 3350, lat: -22.950, lon: -43.285, radiusNm: 3.5 },
      { id: 'guanabara', name: 'Baía de Guanabara', type: 'water_body', elevationFt: 0, lat: -22.850, lon: -43.150, radiusNm: 6.0 },
    ],
  },
  KJFK: {
    airportIcao: 'KJFK',
    waypoints: [
      { id: 'CRI', name: 'CANARSIE VOR', type: 'vor', freq: '112.30', lat: 40.618, lon: -73.894, elevationFt: 10 },
      { id: 'JFK_VOR', name: 'KENNEDY VOR', type: 'vor', freq: '115.90', lat: 40.632, lon: -73.771, elevationFt: 12 },
      { id: 'LGA', name: 'LAGUARDIA VOR', type: 'vor', freq: '113.10', lat: 40.783, lon: -73.869 },
      { id: 'ASPER', name: 'ASPER', type: 'fix', lat: 40.540, lon: -73.910 },
      { id: 'CARN', name: 'CARN', type: 'fix', lat: 40.580, lon: -73.820 },
      { id: 'BETTE', name: 'BETTE', type: 'fix', lat: 40.480, lon: -73.680 },
      { id: 'KLGA', name: 'KLGA LaGuardia', type: 'airport', lat: 40.777, lon: -73.872, elevationFt: 21 },
      { id: 'KEWR', name: 'KEWR Newark Intl', type: 'airport', lat: 40.692, lon: -74.168, elevationFt: 18 },
    ],
    terrainFeatures: [
      { id: 'jamaica_bay', name: 'Jamaica Bay Wildlife Refuge', type: 'water_body', elevationFt: 0, lat: 40.615, lon: -73.835, radiusNm: 3.0 },
      { id: 'rockaway', name: 'Rockaway Peninsula', type: 'coastline', elevationFt: 10, lat: 40.585, lon: -73.815, radiusNm: 4.0 },
      { id: 'atlantic_ocean', name: 'Atlantic Ocean', type: 'water_body', elevationFt: 0, lat: 40.500, lon: -73.750, radiusNm: 10.0 },
    ],
  },
  LPMA: {
    airportIcao: 'LPMA',
    waypoints: [
      { id: 'FUN', name: 'FUNCHAL VOR', type: 'vor', freq: '112.20', lat: 32.748, lon: -16.708, elevationFt: 1400 },
      { id: 'ROSAR', name: 'ROSARIO NDB', type: 'ndb', freq: '334.0', lat: 32.730, lon: -16.800 },
      { id: 'SANTA', name: 'SANTA CRUZ', type: 'fix', lat: 32.680, lon: -16.790 },
      { id: 'GIRAO', name: 'CABO GIRÃO', type: 'fix', lat: 32.650, lon: -17.000 },
      { id: 'LPPS', name: 'LPPS Porto Santo', type: 'airport', lat: 33.070, lon: -16.350, elevationFt: 341 },
    ],
    terrainFeatures: [
      { id: 'pico_ruivo', name: 'Pico Ruivo', type: 'mountain_peak', elevationFt: 6109, lat: 32.759, lon: -16.943, radiusNm: 3.0 },
      { id: 'pico_arieiro', name: 'Pico do Arieiro', type: 'mountain_peak', elevationFt: 5965, lat: 32.735, lon: -16.928, radiusNm: 2.5 },
      { id: 'ponta_lourenco', name: 'Ponta de São Lourenço Cliffs', type: 'coastline', elevationFt: 450, lat: 32.745, lon: -16.700, radiusNm: 2.0 },
    ],
  },
  LOWI: {
    airportIcao: 'LOWI',
    waypoints: [
      { id: 'RTT', name: 'RATTENBERG NDB', type: 'ndb', freq: '303.0', lat: 47.433, lon: 11.900, elevationFt: 1800 },
      { id: 'KTI', name: 'KÜHTAI NDB', type: 'ndb', freq: '420.0', lat: 47.210, lon: 11.020, elevationFt: 6500 },
      { id: 'ABSAM', name: 'ABSAM FIX', type: 'fix', lat: 47.300, lon: 11.520 },
      { id: 'TELF', name: 'TELFS FIX', type: 'fix', lat: 47.310, lon: 11.070 },
      { id: 'INNS', name: 'INNSBRUCK LOC DME', type: 'vor', freq: '109.70', lat: 47.260, lon: 11.344, elevationFt: 1906 },
    ],
    terrainFeatures: [
      { id: 'nordkette', name: 'Nordkette / Karwendel Range', type: 'mountain_peak', elevationFt: 8652, lat: 47.310, lon: 11.380, radiusNm: 4.0 },
      { id: 'patscherkofel', name: 'Patscherkofel Peak', type: 'mountain_peak', elevationFt: 7370, lat: 47.208, lon: 11.458, radiusNm: 3.5 },
      { id: 'inn_valley', name: 'Inn River Valley', type: 'valley', elevationFt: 1900, lat: 47.260, lon: 11.340, radiusNm: 8.0 },
    ],
  },
  TNCM: {
    airportIcao: 'TNCM',
    waypoints: [
      { id: 'PJM', name: 'ST MAARTEN VOR', type: 'vor', freq: '113.00', lat: 18.040, lon: -63.110, elevationFt: 30 },
      { id: 'MAHO', name: 'MAHO BEACH FIX', type: 'fix', lat: 18.038, lon: -63.125 },
      { id: 'SIMPS', name: 'SIMPSON BAY', type: 'fix', lat: 18.035, lon: -63.090 },
      { id: 'JULIA', name: 'JULIA FIX', type: 'fix', lat: 18.050, lon: -63.180 },
      { id: 'TQPF', name: 'TQPF Clayton J. Lloyd', type: 'airport', lat: 18.204, lon: -63.055, elevationFt: 127 },
    ],
    terrainFeatures: [
      { id: 'pic_paradis', name: 'Pic Paradis (St. Martin Peak)', type: 'mountain_peak', elevationFt: 1391, lat: 18.077, lon: -63.050, radiusNm: 2.0 },
      { id: 'simpson_lagoon', name: 'Simpson Bay Lagoon', type: 'water_body', elevationFt: 0, lat: 18.050, lon: -63.100, radiusNm: 1.8 },
      { id: 'maho_bay', name: 'Maho Bay Caribbean Waters', type: 'water_body', elevationFt: 0, lat: 18.038, lon: -63.125, radiusNm: 3.0 },
    ],
  },
};
