import {
  FlightTelemetry,
  AircraftSpecs,
  AirportInfo,
  DynamicWeatherConfig,
  FlightPhase,
  AtcTransmission,
  AtcRadioState,
  SupportedLanguage,
} from '../types';
import { regionalNavData, NavWaypoint } from '../data/navigationFixes';
import { audioEngine } from './audioEffects';

// Helper: NATO ICAO Phonetic Alphabet
const phoneticMap: Record<string, string> = {
  A: 'Alfa', B: 'Bravo', C: 'Charlie', D: 'Delta', E: 'Echo',
  F: 'Foxtrot', G: 'Golf', H: 'Hotel', I: 'India', J: 'Juliett',
  K: 'Kilo', L: 'Lima', M: 'Mike', N: 'November', O: 'Oscar',
  P: 'Papa', Q: 'Quebec', R: 'Romeo', S: 'Sierra', T: 'Tango',
  U: 'Uniform', V: 'Victor', W: 'Whiskey', X: 'X-ray', Y: 'Yankee', Z: 'Zulu',
  '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four',
  '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Niner',
  '-': ' ',
};

export class SimulatedAtcService {
  private state: AtcRadioState;
  private messageHistory: AtcTransmission[] = [];
  private listeners: Array<(state: AtcRadioState, messages: AtcTransmission[]) => void> = [];
  private lastPhase: FlightPhase = 'preflight';
  private phaseTriggerTimestamps: Record<string, number> = {};
  private activeAirportIcao = '';
  private passedWaypoints = new Set<string>();
  private isProcessingSpeech = false;
  private speechQueue: Array<{
    transmission: AtcTransmission;
    lang: SupportedLanguage;
    role: 'ATC' | 'PILOT';
  }> = [];

  constructor() {
    this.state = {
      activeComFreq: '118.40',
      standbyComFreq: '121.80',
      facility: 'TWR',
      volume: 1.0,
      isMuted: false,
      autoSpeak: true,
      isTransmitting: false,
      isReceiving: false,
      currentPhase: 'preflight',
      clearedTakeoff: false,
      clearedLand: false,
    };
  }

  public subscribe(listener: (state: AtcRadioState, messages: AtcTransmission[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.state, this.messageHistory);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.state }, [...this.messageHistory]));
  }

  public getState(): AtcRadioState {
    return { ...this.state };
  }

  public getMessages(): AtcTransmission[] {
    return [...this.messageHistory];
  }

  public setFrequency(active: string, standby?: string) {
    this.state.activeComFreq = active;
    if (standby) this.state.standbyComFreq = standby;
    this.notify();
  }

  public swapFrequencies() {
    const temp = this.state.activeComFreq;
    this.state.activeComFreq = this.state.standbyComFreq;
    this.state.standbyComFreq = temp;
    this.notify();
  }

  public toggleMute() {
    this.state.isMuted = !this.state.isMuted;
    this.notify();
  }

  public setVolume(vol: number) {
    this.state.volume = Math.max(0, Math.min(1, vol));
    this.notify();
  }

  public setAutoSpeak(enabled: boolean) {
    this.state.autoSpeak = enabled;
    this.notify();
  }

  public clearHistory() {
    this.messageHistory = [];
    this.notify();
  }

  // Format callsign for speech
  private getPhoneticCallsign(registration: string): string {
    return registration
      .toUpperCase()
      .split('')
      .map((c) => phoneticMap[c] || c)
      .join(' ');
  }

  private getShortCallsign(registration: string): string {
    const clean = registration.replace(/[^A-Za-z0-9]/g, '');
    if (clean.length >= 3) {
      const last3 = clean.slice(-3);
      return last3
        .toUpperCase()
        .split('')
        .map((c) => phoneticMap[c] || c)
        .join(' ');
    }
    return this.getPhoneticCallsign(registration);
  }

  // Add transmission to queue and history
  public addTransmission(
    transmission: Omit<AtcTransmission, 'id' | 'timestamp'>,
    lang: SupportedLanguage = 'en'
  ) {
    const fullTransmission: AtcTransmission = {
      ...transmission,
      id: `atc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
    };

    this.messageHistory = [fullTransmission, ...this.messageHistory].slice(0, 50);
    this.notify();

    if (this.state.autoSpeak && !this.state.isMuted) {
      this.speechQueue.push({
        transmission: fullTransmission,
        lang,
        role: fullTransmission.sender === 'PILOT' ? 'PILOT' : 'ATC',
      });
      this.processQueue();
    }
  }

  private processQueue() {
    if (this.isProcessingSpeech || this.speechQueue.length === 0) return;

    this.isProcessingSpeech = true;
    const item = this.speechQueue.shift();
    if (!item) {
      this.isProcessingSpeech = false;
      return;
    }

    if (item.role === 'ATC') {
      this.state.isReceiving = true;
    } else {
      this.state.isTransmitting = true;
    }
    this.notify();

    const spokenText = item.transmission.phoneticText || item.transmission.text;
    audioEngine.speakAtcTransmission(
      spokenText,
      item.lang,
      item.role,
      () => {
        // Started speaking
      },
      () => {
        // Finished speaking
        this.state.isReceiving = false;
        this.state.isTransmitting = false;
        this.notify();
        this.isProcessingSpeech = false;
        setTimeout(() => {
          this.processQueue();
        }, 400);
      }
    );
  }

  // Repeat an existing transmission
  public replayTransmission(id: string, lang: SupportedLanguage = 'en') {
    const msg = this.messageHistory.find((m) => m.id === id);
    if (!msg) return;

    this.speechQueue.push({
      transmission: msg,
      lang,
      role: msg.sender === 'PILOT' ? 'PILOT' : 'ATC',
    });
    this.processQueue();
  }

  // -------------------------------------------------------------
  // Flight Phase & Location Tracking Engine
  // -------------------------------------------------------------
  public updateFlightTelemetry(
    telemetry: FlightTelemetry,
    aircraft: AircraftSpecs,
    airport: AirportInfo,
    weather: DynamicWeatherConfig,
    lang: SupportedLanguage = 'en'
  ) {
    if (this.activeAirportIcao !== airport.icao) {
      this.activeAirportIcao = airport.icao;
      this.passedWaypoints.clear();
      this.phaseTriggerTimestamps = {};
      this.lastPhase = 'preflight';
      this.state.clearedTakeoff = false;
      this.state.clearedLand = false;

      // Welcome ATIS / Ground contact when switching airport
      this.triggerAirportWelcome(airport, weather, aircraft, lang);
    }

    // Distance to Airport Origin (NM)
    const distMeters = Math.sqrt(telemetry.posX * telemetry.posX + telemetry.posZ * telemetry.posZ);
    const distNm = distMeters / 1852;
    const aglFt = Math.max(0, telemetry.altitude - airport.elevationFt);
    const rwy = airport.runways[0] || { ident: '10L', heading: 100, ilsFreq: 110.3 };
    const rwyIdent = rwy.ident;
    const qnh = weather.qnhHpa || 1013;
    const windDir = weather.windDirectionDeg || 120;
    const windSpeed = weather.windSpeedKts || 8;
    const callsign = this.getShortCallsign(aircraft.registration);
    const primaryCallsign = `${aircraft.name.split(' ')[0]} ${callsign}`;

    // Determine current phase
    let currentPhase: FlightPhase = this.lastPhase;

    if (telemetry.stallWarning && aglFt > 100) {
      currentPhase = 'emergency';
    } else if (telemetry.onGround) {
      if (telemetry.indicatedAirspeed < 5) {
        if (this.lastPhase === 'touchdown_rollout') {
          currentPhase = 'taxi';
        } else if (distMeters < 800) {
          currentPhase = 'lineup_and_wait';
        } else {
          currentPhase = 'preflight';
        }
      } else if (telemetry.indicatedAirspeed >= 5 && telemetry.indicatedAirspeed < 40 && telemetry.throttle < 0.6) {
        currentPhase = 'taxi';
      } else if (telemetry.throttle >= 0.6 && telemetry.indicatedAirspeed >= 35) {
        currentPhase = 'takeoff_roll';
      }
    } else {
      // Airborne
      if (this.lastPhase === 'short_final' && telemetry.throttle > 0.85 && telemetry.verticalSpeed > 400) {
        currentPhase = 'go_around';
      } else if (aglFt < 1500 && distNm < 3.5 && this.lastPhase === 'takeoff_roll') {
        currentPhase = 'initial_climb';
      } else if (distNm <= 3.0 && aglFt < 900 && telemetry.verticalSpeed < 100) {
        currentPhase = 'short_final';
      } else if (distNm <= 7.0 && aglFt < 2500 && telemetry.verticalSpeed < 100) {
        currentPhase = 'final_approach';
      } else if (distNm <= 16.0 && telemetry.verticalSpeed < -200) {
        currentPhase = 'descent_approach';
      } else {
        currentPhase = 'en_route_cruise';
      }
    }

    // Check if phase changed or time threshold reached
    const now = Date.now();
    const phaseKey = `${currentPhase}`;
    const lastTrigger = this.phaseTriggerTimestamps[phaseKey] || 0;
    const phaseChanged = currentPhase !== this.lastPhase;

    if (phaseChanged || now - lastTrigger > 120000) {
      this.phaseTriggerTimestamps[phaseKey] = now;
      this.handlePhaseTransition(
        currentPhase,
        this.lastPhase,
        telemetry,
        aircraft,
        airport,
        weather,
        rwyIdent,
        qnh,
        windDir,
        windSpeed,
        primaryCallsign,
        distNm,
        aglFt,
        lang
      );
      this.lastPhase = currentPhase;
      this.state.currentPhase = currentPhase;
      this.notify();
    }

    // Waypoint Proximity Check (Center Radar Tracking)
    this.checkWaypointsProximity(telemetry, airport, primaryCallsign, lang);
  }

  private triggerAirportWelcome(
    airport: AirportInfo,
    weather: DynamicWeatherConfig,
    aircraft: AircraftSpecs,
    lang: SupportedLanguage
  ) {
    const callsign = this.getShortCallsign(aircraft.registration);
    const rwyIdent = airport.runways[0]?.ident || '10L';
    const atisInfo = String.fromCharCode(65 + Math.floor((Date.now() / 600000) % 26));

    if (lang === 'pt') {
      this.addTransmission({
        sender: 'ATIS',
        frequency: (airport.atisFreq || 127.15).toFixed(2),
        facilityName: `${airport.name} ATIS`,
        text: `Informação ${atisInfo}. Pista em uso ${rwyIdent}. Vento ${weather.windDirectionDeg}° com ${weather.windSpeedKts} nós. QNH ${weather.qnhHpa} hPa. Temperatura ${weather.temperatureC}°C.`,
        phoneticText: `Informação ${atisInfo}. Pista em uso ${rwyIdent}. Vento ${weather.windDirectionDeg} graus com ${weather.windSpeedKts} nós. Ajuste de altímetro QNH ${weather.qnhHpa}. Temperatura ${weather.temperatureC} graus. Contate o solo na frequência 121 ponto 80.`,
        phase: 'preflight',
      }, lang);
    } else {
      this.addTransmission({
        sender: 'ATIS',
        frequency: (airport.atisFreq || 127.15).toFixed(2),
        facilityName: `${airport.icao} ATIS`,
        text: `Information ${atisInfo}. Active runway ${rwyIdent}. Wind ${weather.windDirectionDeg}° at ${weather.windSpeedKts} knots. Altimeter ${weather.qnhHpa} hPa. Temperature ${weather.temperatureC}°C.`,
        phoneticText: `Information ${atisInfo}. Active runway ${rwyIdent}. Wind ${weather.windDirectionDeg} at ${weather.windSpeedKts} knots. Altimeter ${weather.qnhHpa}. Contact Ground on one two one decimal eight zero.`,
        phase: 'preflight',
      }, lang);
    }
  }

  private handlePhaseTransition(
    currentPhase: FlightPhase,
    previousPhase: FlightPhase,
    telemetry: FlightTelemetry,
    aircraft: AircraftSpecs,
    airport: AirportInfo,
    weather: DynamicWeatherConfig,
    rwyIdent: string,
    qnh: number,
    windDir: number,
    windSpeed: number,
    primaryCallsign: string,
    distNm: number,
    aglFt: number,
    lang: SupportedLanguage
  ) {
    const isPt = lang === 'pt';

    switch (currentPhase) {
      case 'preflight':
        if (previousPhase !== 'touchdown_rollout') {
          this.state.facility = 'GND';
          this.state.activeComFreq = (airport.groundFreq || 121.80).toFixed(2);
          this.addTransmission({
            sender: 'GROUND',
            frequency: this.state.activeComFreq,
            facilityName: `${airport.icao} Ground`,
            text: isPt
              ? `${primaryCallsign}, Solo ${airport.city}, rádio 5 por 5. QNH ${qnh}, pista ${rwyIdent} em uso. Acionamento e táxi autorizados.`
              : `${primaryCallsign}, ${airport.city} Ground, read you 5 by 5. Altimeter ${qnh}, active runway ${rwyIdent}. Start-up and taxi approved.`,
            phoneticText: isPt
              ? `${primaryCallsign}, Solo ${airport.city}. QNH ${qnh}. Pista ${rwyIdent}. Autorizado acionamento e táxi.`
              : `${primaryCallsign}, ${airport.city} Ground. Altimeter ${qnh}. Runway ${rwyIdent}. Taxi via Alpha.`,
            phase: 'preflight',
          }, lang);
        }
        break;

      case 'taxi':
        this.state.facility = 'GND';
        this.addTransmission({
          sender: 'GROUND',
          frequency: (airport.groundFreq || 121.80).toFixed(2),
          facilityName: `${airport.icao} Ground`,
          text: isPt
            ? `${primaryCallsign}, mantenha antes da pista ${rwyIdent}. Chame a Torre em ${(airport.towerFreq || 118.40).toFixed(2)} pronto para decolagem.`
            : `${primaryCallsign}, taxi and hold short of runway ${rwyIdent}. Contact Tower on ${(airport.towerFreq || 118.40).toFixed(2)} when ready.`,
          phase: 'taxi',
        }, lang);
        break;

      case 'lineup_and_wait':
        this.state.facility = 'TWR';
        this.state.activeComFreq = (airport.towerFreq || 118.40).toFixed(2);
        this.state.clearedTakeoff = true;
        this.addTransmission({
          sender: 'TOWER',
          frequency: this.state.activeComFreq,
          facilityName: `${airport.icao} Tower`,
          text: isPt
            ? `${primaryCallsign}, Torre ${airport.city}, vento ${windDir}° com ${windSpeed} nós. Pista ${rwyIdent}, autorizado decolagem!`
            : `${primaryCallsign}, ${airport.city} Tower, wind ${windDir} at ${windSpeed} knots. Runway ${rwyIdent}, cleared for takeoff!`,
          phoneticText: isPt
            ? `${primaryCallsign}, Torre ${airport.city}. Vento ${windDir} graus com ${windSpeed} nós. Pista ${rwyIdent}, autorizado decolagem, suba para 4000 pés.`
            : `${primaryCallsign}, ${airport.city} Tower, wind ${windDir} at ${windSpeed} knots. Runway ${rwyIdent}, cleared for takeoff, climb and maintain 4000 feet.`,
          phase: 'lineup_and_wait',
        }, lang);
        break;

      case 'takeoff_roll':
        // Brief copilot / tower observation
        break;

      case 'initial_climb':
        this.state.facility = 'APP';
        this.state.activeComFreq = '125.75';
        this.addTransmission({
          sender: 'APPROACH',
          frequency: '125.75',
          facilityName: `${airport.city} Departure / Radar`,
          text: isPt
            ? `${primaryCallsign}, contato radar a ${Math.round(aglFt)} pés. Prossiga na proa de pista, suba para 5.000 pés.`
            : `${primaryCallsign}, radar contact climbing out of ${Math.round(aglFt)} feet. Fly runway heading, climb and maintain 5,000 feet.`,
          phase: 'initial_climb',
        }, lang);
        break;

      case 'en_route_cruise':
        this.state.facility = 'CTR';
        this.state.activeComFreq = '132.50';
        this.addTransmission({
          sender: 'CENTER',
          frequency: '132.50',
          facilityName: `${airport.city} Air Route Center`,
          text: isPt
            ? `${primaryCallsign}, Centro ${airport.city}, identificado em voo de cruzeiro na altitude ${Math.round(telemetry.altitude)} pés. Voo livre para navegação.`
            : `${primaryCallsign}, ${airport.city} Center, radar identified in cruise at ${Math.round(telemetry.altitude)} feet. Cleared on flight plan route.`,
          phase: 'en_route_cruise',
        }, lang);
        break;

      case 'descent_approach':
        this.state.facility = 'APP';
        this.state.activeComFreq = '120.05';
        this.addTransmission({
          sender: 'APPROACH',
          frequency: '120.05',
          facilityName: `${airport.city} Approach Control`,
          text: isPt
            ? `${primaryCallsign}, Controle ${airport.city}, a ${Math.round(distNm)} milhas. Desça e mantenha 3.000 pés, prepare-se para aproximação ILS pista ${rwyIdent}.`
            : `${primaryCallsign}, ${airport.city} Approach, ${Math.round(distNm)} miles out. Descend and maintain 3,000 feet, expect ILS approach runway ${rwyIdent}.`,
          phase: 'descent_approach',
        }, lang);
        break;

      case 'final_approach':
        this.state.facility = 'TWR';
        this.state.activeComFreq = (airport.towerFreq || 118.40).toFixed(2);
        this.addTransmission({
          sender: 'TOWER',
          frequency: this.state.activeComFreq,
          facilityName: `${airport.icao} Tower`,
          text: isPt
            ? `${primaryCallsign}, Torre ${airport.city}, localizador capturado. Notifique estabelecido na final da pista ${rwyIdent}.`
            : `${primaryCallsign}, ${airport.city} Tower, localizer captured. Report established on final for runway ${rwyIdent}.`,
          phase: 'final_approach',
        }, lang);
        break;

      case 'short_final':
        this.state.facility = 'TWR';
        this.state.activeComFreq = (airport.towerFreq || 118.40).toFixed(2);
        this.state.clearedLand = true;
        this.addTransmission({
          sender: 'TOWER',
          frequency: this.state.activeComFreq,
          facilityName: `${airport.icao} Tower`,
          text: isPt
            ? `${primaryCallsign}, vento ${windDir}° com ${windSpeed} nós. Pista ${rwyIdent}, autorizado pouso!`
            : `${primaryCallsign}, wind ${windDir} at ${windSpeed} knots. Runway ${rwyIdent}, cleared to land!`,
          phoneticText: isPt
            ? `${primaryCallsign}, vento ${windDir} graus com ${windSpeed} nós. Pista ${rwyIdent}, autorizado pouso.`
            : `${primaryCallsign}, wind ${windDir} at ${windSpeed} knots. Runway ${rwyIdent}, cleared to land.`,
          phase: 'short_final',
        }, lang);
        break;

      case 'go_around':
        this.state.facility = 'TWR';
        this.state.clearedLand = false;
        this.addTransmission({
          sender: 'TOWER',
          frequency: (airport.towerFreq || 118.40).toFixed(2),
          facilityName: `${airport.icao} Tower`,
          text: isPt
            ? `${primaryCallsign}, arremetida ciente. Suba para 3.000 pés, mantenha proa de pista e chame o Controle em 120.05.`
            : `${primaryCallsign}, go-around acknowledged. Climb and maintain 3,000 feet, fly runway heading and contact Approach on 120.05.`,
          phase: 'go_around',
        }, lang);
        break;

      case 'emergency':
        this.addTransmission({
          sender: 'TOWER',
          frequency: this.state.activeComFreq,
          facilityName: `ATC Safety Alert`,
          text: isPt
            ? `ATENÇÃO ${primaryCallsign}! Alerta de estol/baixa altitude! Aumente potência e corrija atitude imediatamente!`
            : `LOW ALTITUDE / STALL WARNING ${primaryCallsign}! Add maximum power and recover attitude immediately!`,
          phase: 'emergency',
        }, lang);
        break;
    }
  }

  // Check proximity to navigation waypoints for realistic en-route callouts
  private checkWaypointsProximity(
    telemetry: FlightTelemetry,
    airport: AirportInfo,
    primaryCallsign: string,
    lang: SupportedLanguage
  ) {
    if (telemetry.onGround) return;

    const nav = regionalNavData[airport.icao];
    if (!nav || !nav.waypoints) return;

    // Convert aircraft world coords to lat/lon
    const latDelta = -telemetry.posZ / 111139;
    const lonDelta = telemetry.posX / (111139 * Math.cos((airport.coordinates.lat * Math.PI) / 180));
    const planeLat = airport.coordinates.lat + latDelta;
    const planeLon = airport.coordinates.lon + lonDelta;

    nav.waypoints.forEach((wp) => {
      if (this.passedWaypoints.has(wp.id)) return;

      const dLat = (wp.lat - planeLat) * 60; // NM
      const dLon = (wp.lon - planeLon) * 60 * Math.cos((planeLat * Math.PI) / 180); // NM
      const distToFixNm = Math.sqrt(dLat * dLat + dLon * dLon);

      if (distToFixNm < 1.8) {
        this.passedWaypoints.add(wp.id);
        this.state.lastWaypoint = wp.name;

        const isPt = lang === 'pt';
        this.addTransmission({
          sender: 'CENTER',
          frequency: '132.50',
          facilityName: `${airport.city} Center`,
          text: isPt
            ? `${primaryCallsign}, cruzando o fixo ${wp.name}. Mantenha nível de voo atual, proa livre.`
            : `${primaryCallsign}, radar confirms overhead fix ${wp.name}. Maintain current flight level, cleared en route.`,
          phoneticText: isPt
            ? `${primaryCallsign}, cruzando fixo ${wp.id}. Mantenha nível de voo.`
            : `${primaryCallsign}, crossing fix ${wp.id}. Maintain flight level.`,
          phase: 'en_route_cruise',
        }, lang);
      }
    });
  }

  // -------------------------------------------------------------
  // Pilot Radio Commands & Transmissions
  // -------------------------------------------------------------
  public pilotRequestTakeoff(aircraft: AircraftSpecs, airport: AirportInfo, lang: SupportedLanguage = 'en') {
    const callsign = this.getShortCallsign(aircraft.registration);
    const rwyIdent = airport.runways[0]?.ident || '10L';
    const isPt = lang === 'pt';

    // 1. Pilot transmission
    this.addTransmission({
      sender: 'PILOT',
      frequency: (airport.towerFreq || 118.40).toFixed(2),
      facilityName: `Cockpit COM1`,
      text: isPt
        ? `Torre ${airport.city}, ${aircraft.name} ${callsign}, pronto para decolagem na pista ${rwyIdent}.`
        : `${airport.city} Tower, ${aircraft.name} ${callsign}, ready for departure runway ${rwyIdent}.`,
      phase: 'lineup_and_wait',
    }, lang);

    // 2. Controller response after delay
    setTimeout(() => {
      this.state.clearedTakeoff = true;
      this.addTransmission({
        sender: 'TOWER',
        frequency: (airport.towerFreq || 118.40).toFixed(2),
        facilityName: `${airport.icao} Tower`,
        text: isPt
          ? `${aircraft.name} ${callsign}, vento calmo. Pista ${rwyIdent}, autorizado decolagem, após a saída suba para 4.000 pés.`
          : `${aircraft.name} ${callsign}, wind calm. Runway ${rwyIdent}, cleared for takeoff, climb and maintain 4,000 feet.`,
        phase: 'lineup_and_wait',
        requiresAck: true,
      }, lang);
    }, 1800);
  }

  public pilotRequestLanding(aircraft: AircraftSpecs, airport: AirportInfo, lang: SupportedLanguage = 'en') {
    const callsign = this.getShortCallsign(aircraft.registration);
    const rwyIdent = airport.runways[0]?.ident || '10L';
    const isPt = lang === 'pt';

    this.addTransmission({
      sender: 'PILOT',
      frequency: (airport.towerFreq || 118.40).toFixed(2),
      facilityName: `Cockpit COM1`,
      text: isPt
        ? `Torre ${airport.city}, ${aircraft.name} ${callsign}, estabelecido na aproximação final pista ${rwyIdent}, solicita autorização de pouso.`
        : `${airport.city} Tower, ${aircraft.name} ${callsign}, established on final runway ${rwyIdent}, requesting landing clearance.`,
      phase: 'final_approach',
    }, lang);

    setTimeout(() => {
      this.state.clearedLand = true;
      this.addTransmission({
        sender: 'TOWER',
        frequency: (airport.towerFreq || 118.40).toFixed(2),
        facilityName: `${airport.icao} Tower`,
        text: isPt
          ? `${aircraft.name} ${callsign}, Torre ciente. Pista ${rwyIdent}, livre para pouso, vento alinhado.`
          : `${aircraft.name} ${callsign}, ${airport.city} Tower. Runway ${rwyIdent}, cleared to land, wind aligned.`,
        phase: 'short_final',
        requiresAck: true,
      }, lang);
    }, 1800);
  }

  public pilotDeclareMissedApproach(aircraft: AircraftSpecs, airport: AirportInfo, lang: SupportedLanguage = 'en') {
    const callsign = this.getShortCallsign(aircraft.registration);
    const isPt = lang === 'pt';

    this.addTransmission({
      sender: 'PILOT',
      frequency: (airport.towerFreq || 118.40).toFixed(2),
      facilityName: `Cockpit COM1`,
      text: isPt
        ? `Torre ${airport.city}, ${aircraft.name} ${callsign}, arremetendo / descontinuando aproximação!`
        : `${airport.city} Tower, ${aircraft.name} ${callsign}, going around / missed approach!`,
      phase: 'go_around',
    }, lang);

    setTimeout(() => {
      this.state.clearedLand = false;
      this.addTransmission({
        sender: 'TOWER',
        frequency: (airport.towerFreq || 118.40).toFixed(2),
        facilityName: `${airport.icao} Tower`,
        text: isPt
          ? `${callsign}, arremetida ciente. Suba para 3.000 pés na proa de pista. Chame o Controle em 120.05 para novo circuito.`
          : `${callsign}, go-around acknowledged. Climb and maintain 3,000 feet on runway heading. Contact Approach on 120.05 for vectors.`,
        phase: 'go_around',
      }, lang);
    }, 1800);
  }

  public pilotRequestRadarVectors(aircraft: AircraftSpecs, airport: AirportInfo, lang: SupportedLanguage = 'en') {
    const callsign = this.getShortCallsign(aircraft.registration);
    const isPt = lang === 'pt';

    this.addTransmission({
      sender: 'PILOT',
      frequency: '125.75',
      facilityName: `Cockpit COM1`,
      text: isPt
        ? `Controle ${airport.city}, ${aircraft.name} ${callsign}, solicita vetoração radar para o aeroporto.`
        : `${airport.city} Approach, ${aircraft.name} ${callsign}, requesting radar vectors to the airport.`,
      phase: 'en_route_cruise',
    }, lang);

    setTimeout(() => {
      const rwy = airport.runways[0];
      const heading = rwy ? rwy.heading : 100;
      this.addTransmission({
        sender: 'APPROACH',
        frequency: '125.75',
        facilityName: `${airport.city} Approach`,
        text: isPt
          ? `${callsign}, curve à esquerda proa ${heading}°, desça e mantenha 3.000 pés, espere interceptar localizador da pista ${rwy?.ident || '10L'}.`
          : `${callsign}, fly heading ${heading}°, descend and maintain 3,000 feet, expect vectors for ILS runway ${rwy?.ident || '10L'}.`,
        phase: 'descent_approach',
      }, lang);
    }, 1800);
  }

  public pilotRequestAtis(airport: AirportInfo, weather: DynamicWeatherConfig, lang: SupportedLanguage = 'en') {
    this.triggerAirportWelcome(airport, weather, { registration: 'PT-AFM', name: 'Aircraft' } as any, lang);
  }

  public pilotReadback(aircraft: AircraftSpecs, lang: SupportedLanguage = 'en') {
    const lastAtc = this.messageHistory.find((m) => m.sender !== 'PILOT');
    if (!lastAtc) return;

    const callsign = this.getShortCallsign(aircraft.registration);
    const isPt = lang === 'pt';

    let ackText = '';
    if (lastAtc.phase === 'lineup_and_wait') {
      ackText = isPt ? `Autorizado decolagem, subindo para 4.000 pés, ${callsign}.` : `Cleared for takeoff, climb 4,000 feet, ${callsign}.`;
    } else if (lastAtc.phase === 'short_final' || lastAtc.phase === 'final_approach') {
      ackText = isPt ? `Autorizado pouso na pista, ${callsign}.` : `Cleared to land, ${callsign}.`;
    } else {
      ackText = isPt ? `Ciente e cumprindo instruções, ${callsign}.` : `Wilco / Roger, ${callsign}.`;
    }

    this.addTransmission({
      sender: 'PILOT',
      frequency: this.state.activeComFreq,
      facilityName: `Cockpit COM1`,
      text: ackText,
      phase: this.state.currentPhase,
      isReadback: true,
    }, lang);
  }
}

export const atcService = new SimulatedAtcService();
