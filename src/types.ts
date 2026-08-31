/**
 * AeroAcademy Type Definitions
 */

export type SupportedLanguage = 'pt' | 'en' | 'es' | 'fr' | 'de';

export type TimeOfDay = 'dawn' | 'noon' | 'sunset' | 'night';
export type CloudCoverage = 'clear' | 'few' | 'scattered' | 'broken' | 'overcast';
export type TurbulenceLevel = 'none' | 'light' | 'moderate' | 'heavy' | 'severe';
export type CockpitViewMode = 'cockpit_hud' | 'cockpit_3d' | 'external_chase' | 'vr_stereoscopic';

export interface FlightTelemetry {
  altitude: number; // Feet (ft)
  altitudeMsl: number; // Feet (ft)
  altitudeAgl: number; // Feet (ft) above ground level
  indicatedAirspeed: number; // Knots (kts)
  trueAirspeed: number; // Knots (kts)
  groundSpeed: number; // Knots (kts)
  verticalSpeed: number; // Feet per minute (fpm)
  pitch: number; // Degrees (-90 to +90)
  roll: number; // Degrees (-180 to +180)
  heading: number; // Degrees (0 to 359)
  angleOfAttack: number; // Degrees
  gForce: number; // Gs (e.g. 1.0G)
  turnRate: number; // Deg/sec
  slipSkid: number; // Ball indicator (-1.0 to 1.0)
  
  // Controls & Systems
  throttle: number; // 0 to 100%
  elevatorPitchInput: number; // -1 to 1
  aileronRollInput: number; // -1 to 1
  rudderYawInput: number; // -1 to 1
  elevatorTrim: number; // -100% to +100%
  flaps: number; // 0, 10, 20, 30 degrees or 0..1
  landingGear: boolean; // true = down, false = retracted
  parkingBrakes: boolean;
  wheelBrakes: boolean;
  spoilersAirbrakes: boolean;
  
  // Engines & Avionics
  engineRpm: number;
  engineThrustPercent: number;
  fuelRemainingLbs: number;
  fuelPercent: number;
  batteryOn: boolean;
  avionicsOn: boolean;
  pitotHeat: boolean;
  beaconLight: boolean;
  navLight: boolean;
  strobeLight: boolean;
  landingLight: boolean;
  
  // Navigation & ILS
  nav1Freq: number; // MHz (e.g. 110.30)
  nav1Radial: number;
  ilsLocalizerDev: number; // -1 to 1 (left to right)
  ilsGlideslopeDev: number; // -1 to 1 (below to above)
  dmeDistanceNm: number; // Nautical miles to runway threshold
  
  // Warnings & Flight Safety
  stallWarning: boolean;
  overspeedWarning: boolean;
  terrainWarning: boolean;
  gearWarning: boolean;
  gpwsCallout: string | null;
  onGround: boolean;
  
  // Position in simulation world
  posX: number;
  posY: number;
  posZ: number;
}

export interface AircraftSpecs {
  id: string;
  name: string;
  category: 'single_engine_piston' | 'twin_turboprop' | 'commercial_jet' | 'aerobatic' | 'fighter_jet';
  manufacturer: string;
  registration: string;
  description: string;
  cruiseSpeedKts: number;
  maxSpeedKts: number;
  stallSpeedKts: number;
  climbRateFpm: number;
  serviceCeilingFt: number;
  emptyWeightLbs: number;
  maxTakeoffWeightLbs: number;
  fuelCapacityGal: number;
  engineHorsepower: number;
  cockpitStyle: 'steam_gauges' | 'glass_g1000' | 'airliner_efis';
  liveries: {
    id: string;
    name: string;
    primaryColor: string;
    secondaryColor: string;
    previewUrl?: string;
  }[];
  soundEngineType: 'piston_single' | 'turboprop' | 'jet_turbofan';
}

export interface RunwayInfo {
  ident: string; // e.g. "09L", "27R"
  heading: number; // Degrees magnetic
  lengthFt: number;
  widthFt: number;
  lengthMeters?: number;
  widthMeters?: number;
  surface: 'asphalt' | 'concrete' | 'grass';
  ilsFreq?: number;
  ilsCourse?: number;
  elevationFt: number;
  thresholdLat: number;
  thresholdLon: number;
}

export interface AirportInfo {
  id?: string;
  icao: string;
  iata: string;
  name: string;
  city: string;
  country: string;
  elevationFt: number;
  metarRaw?: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  runways: RunwayInfo[];
  atisFreq?: number;
  towerFreq?: number;
  groundFreq?: number;
  metarPreset: {
    windSpeedKts: number;
    windDirDeg: number;
    tempC: number;
    dewpointC: number;
    qnhHpa: number;
    clouds: CloudCoverage;
    visibilitySm: number;
    rawText: string;
  };
}

export interface DynamicWeatherConfig {
  windSpeedKts: number;
  windDirectionDeg: number;
  gustSpeedKts: number;
  clouds: CloudCoverage;
  cloudBaseFt: number;
  visibilityKm: number;
  temperatureC: number;
  qnhHpa: number;
  rainIntensity: number; // 0 to 1
  turbulence: TurbulenceLevel;
  timeOfDay: TimeOfDay;
}

export interface FlightManeuver {
  id: string;
  title: string;
  subtitle: string;
  category: 'basics' | 'takeoff_climb' | 'traffic_pattern' | 'stalls_emergencies' | 'instrument_ifr' | 'advanced_aerobatics';
  difficulty: 'student' | 'intermediate' | 'advanced' | 'commercial';
  targetAircraftId: string;
  briefing: string;
  objectives: {
    id: string;
    text: string;
    targetValue: string;
  }[];
  initialState: {
    airportIcao?: string;
    runwayIdent?: string;
    altitudeFt: number;
    airspeedKts: number;
    headingDeg: number;
    throttle: number;
    flaps: number;
    gearDown: boolean;
    onGround: boolean;
  };
  completionCriteria: {
    maintainAltitudeToleranceFt: number;
    maintainSpeedToleranceKts: number;
    maxTouchdownSinkRateFpm: number;
    maxCenterlineDevFt: number;
  };
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TheoryLesson {
  id: string;
  moduleCategory: 'aerodynamics' | 'instruments' | 'meteorology' | 'navigation' | 'regulations' | 'emergencies';
  title: string;
  estimatedMinutes: number;
  summary: string;
  contentSections: {
    heading: string;
    text: string;
    keyTakeaway?: string;
    diagramType?: 'forces_of_flight' | 'airspeed_indicator' | 'altimeter_qnh' | 'ils_glideslope' | 'stall_angle_curve' | 'standard_traffic_pattern';
  }[];
  checklistItems?: string[];
  quiz: QuizQuestion[];
}

export interface PilotCertificate {
  id: string;
  title: string;
  code: 'SPL' | 'PPL' | 'CPL' | 'IR' | 'ME' | 'CFI' | 'ATPL';
  level: string;
  authority: string;
  privileges: string;
  requirementsDescription?: string;
  requirements: {
    minHours: number;
    requiredLessonsCount: number;
    requiredManeuversCount: number;
    minScorePercent: number;
  };
  certificateNumber?: string;
  issueDate?: string;
  isUnlocked: boolean;
  verificationHash?: string;
  instructorName?: string;
}

export interface LogbookEntry {
  id: string;
  date: string;
  aircraftId: string;
  aircraftReg: string;
  departureIcao: string;
  arrivalIcao: string;
  durationMinutes: number;
  landingsDay: number;
  landingsNight: number;
  instrumentMinutes: number;
  crossCountryMinutes: number;
  soloMinutes: number;
  remarks: string;
  flightScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  telemetrySummary?: {
    maxAltitudeFt: number;
    maxSpeedKts: number;
    maxGForce: number;
    landingRateFpm: number;
    touchdownZoneAccuracyPct: number;
  };
}

export interface PilotAchievement {
  id: string;
  title: string;
  description: string;
  category: 'flight_hours' | 'landings' | 'mastery' | 'stalls_emergency' | 'weather_ifr' | 'theory';
  icon: string;
  xpValue: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorRank: string;
  authorAvatarUrl: string;
  title: string;
  content: string;
  category: 'flight_debrief' | 'maneuver_tips' | 'ifr_navigation' | 'hardware_setup' | 'general';
  timestamp: string;
  likesCount: number;
  userLiked: boolean;
  comments: {
    id: string;
    authorName: string;
    authorRank: string;
    text: string;
    timestamp: string;
  }[];
  flightAttachment?: {
    aircraftName: string;
    route: string;
    landingRateFpm: number;
    score: number;
  };
}

export interface HardwareInputConfig {
  deviceType: 'keyboard_mouse' | 'gamepad' | 'hotas_joystick' | 'yoke_rudder';
  deviceName?: string;
  axes: {
    pitchAxis: number;
    pitchInverted: boolean;
    rollAxis: number;
    rollInverted: boolean;
    yawAxis: number;
    yawInverted: boolean;
    throttleAxis: number;
    throttleInverted: boolean;
  };
  deadzone: number;
  sensitivity: number;
  buttonBindings: {
    flapsExtend: number;
    flapsRetract: number;
    gearToggle: number;
    brakes: number;
    trimUp: number;
    trimDown: number;
    resetView: number;
    toggleAutopilot: number;
  };
}

export interface ForumPost {
  id: string;
  author: {
    name: string;
    avatarUrl: string;
    pilotRank: string;
    totalHours: number;
  };
  title: string;
  category: string;
  content: string;
  timestamp: string;
  upvotes: number;
  repliesCount: number;
  isPinned: boolean;
  tags: string[];
}

export interface SupportChatMessage {
  id: string;
  sender: 'pilot' | 'instructor' | 'tech_support' | 'atc' | 'user' | 'agent';
  agentName?: string;
  text: string;
  timestamp: string;
  source?: string;
}

export interface PushNotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'challenge' | 'weather' | 'certificate' | 'community' | 'training' | 'flight_logged';
  actionTab?: string;
}

export interface FlightPathPoint {
  id: string;
  posX: number;
  posY: number;
  posZ: number;
  lat: number;
  lon: number;
  altitudeFt: number;
  groundSpeedKts: number;
  headingDeg: number;
  verticalSpeedFpm: number;
  timestamp: number;
}

export interface FlightPathMapConfig {
  trackUp: boolean;
  showTerrainShading: boolean;
  showWaypoints: boolean;
  showIlsApproach: boolean;
  showRangeRings: boolean;
  showAltitudeHeatmap: boolean;
  showWeatherRadar: boolean;
  zoomLevel: number;
}

export type FlightPhase =
  | 'preflight'
  | 'taxi'
  | 'lineup_and_wait'
  | 'takeoff_roll'
  | 'initial_climb'
  | 'en_route_cruise'
  | 'descent_approach'
  | 'final_approach'
  | 'short_final'
  | 'touchdown_rollout'
  | 'go_around'
  | 'emergency';

export interface AtcTransmission {
  id: string;
  sender: 'TOWER' | 'GROUND' | 'APPROACH' | 'CENTER' | 'ATIS' | 'PILOT' | 'RADAR';
  frequency: string;
  facilityName: string;
  text: string;
  phoneticText?: string;
  timestamp: number;
  phase: FlightPhase;
  isReadback?: boolean;
  requiresAck?: boolean;
  acknowledged?: boolean;
}

export interface AtcRadioState {
  activeComFreq: string;
  standbyComFreq: string;
  facility: 'TWR' | 'GND' | 'APP' | 'CTR' | 'ATIS';
  volume: number;
  isMuted: boolean;
  autoSpeak: boolean;
  isTransmitting: boolean;
  isReceiving: boolean;
  currentPhase: FlightPhase;
  clearedTakeoff: boolean;
  clearedLand: boolean;
  lastWaypoint?: string;
}
