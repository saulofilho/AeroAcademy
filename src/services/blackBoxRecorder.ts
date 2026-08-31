import {
  FlightTelemetry,
  AircraftSpecs,
  AirportInfo,
  DynamicWeatherConfig,
  BlackBoxTelemetryFrame,
  BlackBoxFlightEvent,
  BlackBoxRecording,
} from '../types';

export class BlackBoxRecorderService {
  private currentRecording: BlackBoxRecording | null = null;
  private isRecording = true;
  private lastSampleTime = 0;
  private sampleIntervalMs = 100; // 10 Hz high-frequency sampling
  private listeners: Array<(recording: BlackBoxRecording | null, isRecording: boolean) => void> = [];
  private previousOnGround = true;
  private hasTakenOff = false;
  private maxRecordedAltitude = 0;
  private maxRecordedSpeed = 0;
  private maxRecordedG = 1.0;
  private minRecordedG = 1.0;
  private stallEventsLogged = 0;
  private lastPos: { x: number; z: number } | null = null;
  private accumulatedDistanceNm = 0;

  constructor() {
    // Initialized empty, ready for simulator start
  }

  public subscribe(listener: (recording: BlackBoxRecording | null, isRecording: boolean) => void): () => void {
    this.listeners.push(listener);
    listener(this.currentRecording, this.isRecording);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.currentRecording ? { ...this.currentRecording } : null, this.isRecording));
  }

  public startNewSession(
    aircraft: AircraftSpecs,
    airport: AirportInfo,
    weather: DynamicWeatherConfig,
    sampleRateHz = 10
  ) {
    this.sampleIntervalMs = Math.max(20, Math.floor(1000 / sampleRateHz));
    const now = Date.now();

    this.currentRecording = {
      id: `fdr_${now}_${aircraft.registration.replace(/[^A-Za-z0-9]/g, '')}`,
      sessionStartTime: now,
      durationMs: 0,
      sampleIntervalMs: this.sampleIntervalMs,
      aircraft: {
        id: aircraft.id,
        name: aircraft.name,
        registration: aircraft.registration,
        category: aircraft.category,
        maxGrossWeightLbs: aircraft.maxTakeoffWeightLbs || 2550,
      },
      airport: {
        icao: airport.icao,
        iata: airport.iata,
        name: airport.name,
        elevationFt: airport.elevationFt,
        activeRunway: airport.runways[0]?.ident || '10L',
      },
      weather: {
        windDirectionDeg: weather.windDirectionDeg,
        windSpeedKts: weather.windSpeedKts,
        qnhHpa: weather.qnhHpa,
        temperatureC: weather.temperatureC,
        visibilityKm: weather.visibilityKm,
        turbulence: weather.turbulence,
      },
      statistics: {
        totalFrames: 0,
        maxAltitudeFt: 0,
        maxSpeedKts: 0,
        maxGForce: 1.0,
        minGForce: 1.0,
        landingRateFpm: 0,
        touchdownGForce: 1.0,
        distanceFlownNm: 0,
        stallWarningCount: 0,
      },
      events: [],
      frames: [],
    };

    this.previousOnGround = true;
    this.hasTakenOff = false;
    this.maxRecordedAltitude = 0;
    this.maxRecordedSpeed = 0;
    this.maxRecordedG = 1.0;
    this.minRecordedG = 1.0;
    this.stallEventsLogged = 0;
    this.lastPos = null;
    this.accumulatedDistanceNm = 0;
    this.isRecording = true;

    // Log initialization event
    this.logEvent({
      type: 'ENGINE_START',
      title: 'FDR Session Started',
      description: `Black Box flight data recording initialized at ${airport.icao} (${airport.name})`,
      severity: 'info',
      telemetrySnapshot: {
        altitudeFt: airport.elevationFt,
        speedKts: 0,
        gForce: 1.0,
        verticalSpeedFpm: 0,
      },
    });

    this.notify();
  }

  public recordTelemetry(
    telemetry: FlightTelemetry,
    aircraft: AircraftSpecs,
    airport: AirportInfo,
    weather: DynamicWeatherConfig
  ) {
    if (!this.isRecording) return;

    const now = Date.now();

    if (!this.currentRecording) {
      this.startNewSession(aircraft, airport, weather);
    }

    if (!this.currentRecording) return;

    if (now - this.lastSampleTime < this.sampleIntervalMs) {
      return;
    }
    this.lastSampleTime = now;

    const timeOffsetMs = now - this.currentRecording.sessionStartTime;
    this.currentRecording.durationMs = timeOffsetMs;

    // Convert coordinates
    const latM = -telemetry.posZ;
    const lonM = telemetry.posX;
    const latDelta = latM / 111139;
    const lonDelta = lonM / (111139 * Math.cos((airport.coordinates.lat * Math.PI) / 180));
    const lat = airport.coordinates.lat + latDelta;
    const lon = airport.coordinates.lon + lonDelta;

    // Calculate distance
    if (this.lastPos) {
      const dx = telemetry.posX - this.lastPos.x;
      const dz = telemetry.posZ - this.lastPos.z;
      const stepDistM = Math.sqrt(dx * dx + dz * dz);
      this.accumulatedDistanceNm += stepDistM / 1852;
    }
    this.lastPos = { x: telemetry.posX, z: telemetry.posZ };

    const frame: BlackBoxTelemetryFrame = {
      timeOffsetMs,
      timestamp: now,
      altitudeFt: Math.round(telemetry.altitude),
      altitudeAglFt: Math.round(telemetry.altitudeAgl || Math.max(0, telemetry.altitude - airport.elevationFt)),
      indicatedAirspeedKts: Math.round(telemetry.indicatedAirspeed * 10) / 10,
      groundSpeedKts: Math.round(telemetry.groundSpeed * 10) / 10,
      verticalSpeedFpm: Math.round(telemetry.verticalSpeed),
      pitchDeg: Math.round(telemetry.pitch * 10) / 10,
      rollDeg: Math.round(telemetry.roll * 10) / 10,
      headingDeg: Math.round(telemetry.heading),
      angleOfAttackDeg: Math.round((telemetry.angleOfAttack || 0) * 10) / 10,
      gForce: Math.round(telemetry.gForce * 100) / 100,
      slipSkid: Math.round((telemetry.slipSkid || 0) * 100) / 100,

      // Controls
      throttlePct: Math.round(telemetry.throttle * 100),
      elevatorPitchInput: Math.round((telemetry.elevatorPitchInput || 0) * 100) / 100,
      aileronRollInput: Math.round((telemetry.aileronRollInput || 0) * 100) / 100,
      rudderYawInput: Math.round((telemetry.rudderYawInput || 0) * 100) / 100,
      elevatorTrimPct: Math.round((telemetry.elevatorTrim || 0) * 100),
      flapsDeg: Math.round(telemetry.flaps || 0),
      gearDown: telemetry.landingGear !== false,
      wheelBrakes: !!telemetry.wheelBrakes,
      parkingBrakes: !!telemetry.parkingBrakes,

      // Position
      posX: Math.round(telemetry.posX * 10) / 10,
      posY: Math.round(telemetry.posY * 10) / 10,
      posZ: Math.round(telemetry.posZ * 10) / 10,
      lat: Number(lat.toFixed(6)),
      lon: Number(lon.toFixed(6)),

      // Systems
      engineRpm: Math.round(telemetry.engineRpm),
      ilsLocalizerDev: Math.round((telemetry.ilsLocalizerDev || 0) * 100) / 100,
      ilsGlideslopeDev: Math.round((telemetry.ilsGlideslopeDev || 0) * 100) / 100,
      dmeDistanceNm: Math.round((telemetry.dmeDistanceNm || 0) * 10) / 10,
      onGround: telemetry.onGround,
      stallWarning: !!telemetry.stallWarning,
      terrainWarning: !!telemetry.terrainWarning,
    };

    // Buffer management (limit to 18,000 frames = ~30 minutes at 10Hz to prevent memory exhaustion)
    if (this.currentRecording.frames.length >= 18000) {
      this.currentRecording.frames.shift();
    }
    this.currentRecording.frames.push(frame);

    // Update Statistics
    if (frame.altitudeFt > this.maxRecordedAltitude) {
      this.maxRecordedAltitude = frame.altitudeFt;
      this.currentRecording.statistics.maxAltitudeFt = this.maxRecordedAltitude;
    }
    if (frame.indicatedAirspeedKts > this.maxRecordedSpeed) {
      this.maxRecordedSpeed = frame.indicatedAirspeedKts;
      this.currentRecording.statistics.maxSpeedKts = this.maxRecordedSpeed;
    }
    if (frame.gForce > this.maxRecordedG) {
      this.maxRecordedG = frame.gForce;
      this.currentRecording.statistics.maxGForce = this.maxRecordedG;
      if (this.maxRecordedG > 2.5) {
        this.logEvent({
          type: 'MAX_G_FORCE',
          title: 'High G-Load Exceedance',
          description: `Aircraft pulled ${this.maxRecordedG.toFixed(2)}G during dynamic maneuver`,
          severity: 'warning',
          telemetrySnapshot: {
            altitudeFt: frame.altitudeFt,
            speedKts: frame.indicatedAirspeedKts,
            gForce: frame.gForce,
            verticalSpeedFpm: frame.verticalSpeedFpm,
          },
        });
      }
    }
    if (frame.gForce < this.minRecordedG) {
      this.minRecordedG = frame.gForce;
      this.currentRecording.statistics.minGForce = this.minRecordedG;
    }

    this.currentRecording.statistics.totalFrames = this.currentRecording.frames.length;
    this.currentRecording.statistics.distanceFlownNm = Math.round(this.accumulatedDistanceNm * 10) / 10;

    // Detect Critical Events
    // 1. Liftoff / Takeoff
    if (this.previousOnGround && !telemetry.onGround && !this.hasTakenOff) {
      this.hasTakenOff = true;
      this.logEvent({
        type: 'ROTATION_LIFTOFF',
        title: 'Takeoff & Liftoff',
        description: `Main gear airborne at ${frame.indicatedAirspeedKts} kts, climbing at ${frame.verticalSpeedFpm} FPM`,
        severity: 'info',
        telemetrySnapshot: {
          altitudeFt: frame.altitudeFt,
          speedKts: frame.indicatedAirspeedKts,
          gForce: frame.gForce,
          verticalSpeedFpm: frame.verticalSpeedFpm,
        },
      });
    }

    // 2. Touchdown / Landing
    if (!this.previousOnGround && telemetry.onGround && this.hasTakenOff) {
      this.currentRecording.statistics.landingRateFpm = frame.verticalSpeedFpm;
      this.currentRecording.statistics.touchdownGForce = frame.gForce;

      const rate = Math.abs(frame.verticalSpeedFpm);
      const isButter = rate < 150;
      const isFirm = rate >= 150 && rate < 350;
      const severity = isButter ? 'info' : isFirm ? 'warning' : 'critical';

      this.logEvent({
        type: 'TOUCHDOWN',
        title: isButter ? 'Smooth Touchdown ("Butter")' : isFirm ? 'Firm Touchdown' : 'Hard Landing Impact',
        description: `Touchdown sink rate: ${frame.verticalSpeedFpm} FPM at ${frame.indicatedAirspeedKts} kts (${frame.gForce}G)`,
        severity,
        telemetrySnapshot: {
          altitudeFt: frame.altitudeFt,
          speedKts: frame.indicatedAirspeedKts,
          gForce: frame.gForce,
          verticalSpeedFpm: frame.verticalSpeedFpm,
        },
      });
    }

    // 3. Stall Warning
    if (telemetry.stallWarning && frame.altitudeAglFt > 100) {
      this.stallEventsLogged++;
      if (this.stallEventsLogged % 30 === 1) {
        this.currentRecording.statistics.stallWarningCount++;
        this.logEvent({
          type: 'STALL_WARNING',
          title: 'Aerodynamic Stall Warning',
          description: `Critical AoA (${frame.angleOfAttackDeg}°) exceeded at ${frame.indicatedAirspeedKts} kts, altitude ${frame.altitudeFt} ft`,
          severity: 'critical',
          telemetrySnapshot: {
            altitudeFt: frame.altitudeFt,
            speedKts: frame.indicatedAirspeedKts,
            gForce: frame.gForce,
            verticalSpeedFpm: frame.verticalSpeedFpm,
          },
        });
      }
    }

    // 4. Glideslope Capture
    if (
      Math.abs(frame.ilsLocalizerDev) < 0.15 &&
      Math.abs(frame.ilsGlideslopeDev) < 0.15 &&
      frame.dmeDistanceNm > 1 &&
      frame.dmeDistanceNm < 8 &&
      !telemetry.onGround
    ) {
      const existing = this.currentRecording.events.some((e) => e.type === 'GLIDESLOPE_CAPTURE');
      if (!existing) {
        this.logEvent({
          type: 'GLIDESLOPE_CAPTURE',
          title: 'ILS 3° Glideslope Captured',
          description: `Established on final approach beam at ${frame.dmeDistanceNm} NM DME`,
          severity: 'info',
          telemetrySnapshot: {
            altitudeFt: frame.altitudeFt,
            speedKts: frame.indicatedAirspeedKts,
            gForce: frame.gForce,
            verticalSpeedFpm: frame.verticalSpeedFpm,
          },
        });
      }
    }

    this.previousOnGround = telemetry.onGround;

    // Periodically notify listeners (every 500ms)
    if (timeOffsetMs % 500 < this.sampleIntervalMs) {
      this.notify();
    }
  }

  public logEvent(event: Omit<BlackBoxFlightEvent, 'id' | 'timeOffsetMs'>) {
    if (!this.currentRecording) return;
    const now = Date.now();
    const timeOffsetMs = now - this.currentRecording.sessionStartTime;

    const fullEvent: BlackBoxFlightEvent = {
      ...event,
      id: `evt_${now}_${Math.random().toString(36).substr(2, 5)}`,
      timeOffsetMs,
    };

    this.currentRecording.events.push(fullEvent);
    this.notify();
  }

  public pauseRecording() {
    this.isRecording = false;
    this.notify();
  }

  public resumeRecording() {
    this.isRecording = true;
    this.notify();
  }

  public getRecording(): BlackBoxRecording | null {
    return this.currentRecording ? { ...this.currentRecording } : null;
  }

  public setRecording(rec: BlackBoxRecording) {
    this.currentRecording = rec;
    this.notify();
  }

  /**
   * Generates and triggers download of a standardized Flight Data Recorder (FDR) JSON file
   */
  public exportToJson(): { success: boolean; filename: string; sizeKb: number } {
    if (!this.currentRecording || this.currentRecording.frames.length === 0) {
      return { success: false, filename: '', sizeKb: 0 };
    }

    const payload = {
      format: 'AERO_ACADEMY_BLACK_BOX_FDR',
      version: '1.2.0',
      exportTimestamp: new Date().toISOString(),
      metadata: {
        flightId: this.currentRecording.id,
        sessionStartTime: new Date(this.currentRecording.sessionStartTime).toISOString(),
        durationFormatted: this.formatDuration(this.currentRecording.durationMs),
        durationSeconds: Math.round(this.currentRecording.durationMs / 1000),
        sampleIntervalMs: this.currentRecording.sampleIntervalMs,
        sampleRateHz: Math.round(1000 / this.currentRecording.sampleIntervalMs),
        aircraft: this.currentRecording.aircraft,
        airport: this.currentRecording.airport,
        weather: this.currentRecording.weather,
      },
      statistics: this.currentRecording.statistics,
      flightEventsCount: this.currentRecording.events.length,
      flightEvents: this.currentRecording.events,
      totalTelemetryFrames: this.currentRecording.frames.length,
      telemetryFrames: this.currentRecording.frames,
    };

    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const sizeKb = Math.round((blob.size / 1024) * 10) / 10;

    const dateStr = new Date(this.currentRecording.sessionStartTime)
      .toISOString()
      .slice(0, 19)
      .replace(/[-:]/g, '')
      .replace('T', '_');
    const filename = `BlackBox_FDR_${this.currentRecording.aircraft.registration}_${this.currentRecording.airport.icao}_${dateStr}.json`;

    // Trigger browser download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, filename, sizeKb };
  }

  /**
   * Import and parse a previously exported Black Box JSON file
   */
  public importFromJson(jsonString: string): { success: boolean; error?: string; recording?: BlackBoxRecording } {
    try {
      const data = JSON.parse(jsonString);

      if (!data.telemetryFrames || !Array.isArray(data.telemetryFrames)) {
        return { success: false, error: 'Invalid Black Box format: Missing telemetry frames.' };
      }

      const imported: BlackBoxRecording = {
        id: data.metadata?.flightId || `fdr_imported_${Date.now()}`,
        sessionStartTime: data.metadata?.sessionStartTime ? new Date(data.metadata.sessionStartTime).getTime() : Date.now(),
        durationMs: data.metadata?.durationSeconds ? data.metadata.durationSeconds * 1000 : data.telemetryFrames[data.telemetryFrames.length - 1]?.timeOffsetMs || 60000,
        sampleIntervalMs: data.metadata?.sampleIntervalMs || 100,
        aircraft: data.metadata?.aircraft || {
          id: 'imported_aircraft',
          name: 'Recorded Aircraft',
          registration: 'N-REC',
          category: 'single_engine_piston',
          maxGrossWeightLbs: 2550,
        },
        airport: data.metadata?.airport || {
          icao: 'SBGR',
          iata: 'GRU',
          name: 'Guarulhos Intl',
          elevationFt: 2459,
          activeRunway: '10L',
        },
        weather: data.metadata?.weather || {
          windDirectionDeg: 120,
          windSpeedKts: 8,
          qnhHpa: 1013,
          temperatureC: 22,
          visibilityKm: 10,
          turbulence: 'light',
        },
        statistics: data.statistics || {
          totalFrames: data.telemetryFrames.length,
          maxAltitudeFt: Math.max(...data.telemetryFrames.map((f: any) => f.altitudeFt || 0)),
          maxSpeedKts: Math.max(...data.telemetryFrames.map((f: any) => f.indicatedAirspeedKts || 0)),
          maxGForce: Math.max(...data.telemetryFrames.map((f: any) => f.gForce || 1.0)),
          minGForce: Math.min(...data.telemetryFrames.map((f: any) => f.gForce || 1.0)),
          landingRateFpm: -140,
          touchdownGForce: 1.1,
          distanceFlownNm: 12.5,
          stallWarningCount: 0,
        },
        events: data.flightEvents || [],
        frames: data.telemetryFrames,
      };

      this.currentRecording = imported;
      this.isRecording = false; // Set to replay/inspection mode
      this.notify();

      return { success: true, recording: imported };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to parse JSON file.' };
    }
  }

  private formatDuration(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}m ${sec}s`;
  }
}

export const blackBoxRecorder = new BlackBoxRecorderService();
