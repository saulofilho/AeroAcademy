import { FlightTelemetry, AircraftSpecs, DynamicWeatherConfig, AirportInfo } from '../types';

export class FlightPhysicsEngine {
  public state: FlightTelemetry;
  public aircraft: AircraftSpecs;
  public weather: DynamicWeatherConfig;
  public targetAirport?: AirportInfo;
  
  // Internal velocity and angular vectors in simulation world (X = East, Y = Altitude, Z = South)
  private vx = 0; // m/s
  private vy = 0; // m/s
  private vz = 0; // m/s
  private pitchRate = 0; // deg/s
  private rollRate = 0; // deg/s
  private yawRate = 0; // deg/s
  
  constructor(initialAircraft: AircraftSpecs, initialWeather: DynamicWeatherConfig, airport?: AirportInfo) {
    this.aircraft = initialAircraft;
    this.weather = initialWeather;
    this.targetAirport = airport;
    this.state = this.getInitialState();
  }

  public getInitialState(): FlightTelemetry {
    const isGround = true;
    const initialAlt = this.targetAirport?.elevationFt || 0;
    return {
      altitude: initialAlt,
      altitudeMsl: initialAlt,
      altitudeAgl: 0,
      indicatedAirspeed: 0,
      trueAirspeed: 0,
      groundSpeed: 0,
      verticalSpeed: 0,
      pitch: 0,
      roll: 0,
      heading: this.targetAirport?.runways[0]?.heading || 96,
      angleOfAttack: 0,
      gForce: 1.0,
      turnRate: 0,
      slipSkid: 0,
      
      throttle: 0,
      elevatorPitchInput: 0,
      aileronRollInput: 0,
      rudderYawInput: 0,
      elevatorTrim: 0,
      flaps: 0, // 0, 1, 2, 3
      landingGear: true,
      parkingBrakes: true,
      wheelBrakes: false,
      spoilersAirbrakes: false,
      
      engineRpm: 750,
      engineThrustPercent: 0,
      fuelRemainingLbs: 300,
      fuelPercent: 100,
      batteryOn: true,
      avionicsOn: true,
      pitotHeat: false,
      beaconLight: true,
      navLight: true,
      strobeLight: false,
      landingLight: false,
      
      nav1Freq: this.targetAirport?.runways[0]?.ilsFreq || 110.30,
      nav1Radial: this.targetAirport?.runways[0]?.ilsCourse || 96,
      ilsLocalizerDev: 0,
      ilsGlideslopeDev: 0,
      dmeDistanceNm: 0,
      
      stallWarning: false,
      overspeedWarning: false,
      terrainWarning: false,
      gearWarning: false,
      gpwsCallout: null,
      onGround: isGround,
      
      posX: 0,
      posY: initialAlt * 0.3048,
      posZ: 0,
    };
  }

  public resetToAirborne(altFt = 3000, speedKts = 100, headingDeg = 90) {
    this.state.onGround = false;
    this.state.parkingBrakes = false;
    this.state.altitude = altFt;
    this.state.altitudeMsl = altFt;
    this.state.altitudeAgl = Math.max(0, altFt - (this.targetAirport?.elevationFt || 0));
    this.state.indicatedAirspeed = speedKts;
    this.state.trueAirspeed = speedKts;
    this.state.groundSpeed = speedKts;
    this.state.pitch = 2.0;
    this.state.roll = 0;
    this.state.heading = headingDeg;
    this.state.throttle = 0.65;
    this.state.flaps = 0;
    this.state.posY = altFt * 0.3048;
    this.state.posZ = -2000;
    this.state.posX = 0;
    
    const speedMs = speedKts * 0.514444;
    const radHeading = (headingDeg * Math.PI) / 180;
    this.vx = Math.sin(radHeading) * speedMs;
    this.vz = -Math.cos(radHeading) * speedMs;
    this.vy = 0;
  }

  public setAirport(airport: AirportInfo) {
    this.targetAirport = airport;
    this.state.nav1Freq = airport.runways[0]?.ilsFreq || 110.30;
    this.state.nav1Radial = airport.runways[0]?.ilsCourse || airport.runways[0]?.heading || 96;
  }

  public setAircraft(aircraft: AircraftSpecs) {
    this.aircraft = aircraft;
  }

  public update(dt: number) {
    if (dt <= 0 || dt > 0.1) dt = 0.016; // Clamp time step for numerical stability

    // 1. Atmosphere & Air Density (Standard ISA atmosphere approximation)
    const altitudeMeters = Math.max(0, this.state.posY);
    const altitudeFt = altitudeMeters * 3.28084;
    const rho0 = 1.225; // kg/m^3
    const rho = rho0 * Math.exp(-altitudeMeters / 8500);
    
    // 2. Control Inputs with Trim
    const elevatorEff = Math.max(-1, Math.min(1, this.state.elevatorPitchInput + (this.state.elevatorTrim * 0.2)));
    const aileronEff = Math.max(-1, Math.min(1, this.state.aileronRollInput));
    const rudderEff = Math.max(-1, Math.min(1, this.state.rudderYawInput));
    const throttle = Math.max(0, Math.min(1, this.state.throttle));
    const flapsFraction = this.state.flaps / 3; // 0, 0.33, 0.66, 1.0

    // 3. Engine Thrust Model
    const isJet = this.aircraft.category === 'commercial_jet';
    const isTurboprop = this.aircraft.category === 'twin_turboprop';
    const maxThrustN = isJet ? 110000 : (isTurboprop ? 18000 : this.aircraft.engineHorsepower * 16.5);
    const targetRpm = 700 + (throttle * (this.aircraft.category === 'single_engine_piston' ? 2000 : 8000));
    this.state.engineRpm += (targetRpm - this.state.engineRpm) * Math.min(1, dt * 3.5);
    this.state.engineThrustPercent = Math.round(throttle * 100);
    
    const thrustN = this.state.batteryOn ? (throttle * maxThrustN * (rho / rho0)) : 0;

    // 4. Airspeed & Angle of Attack (AoA)
    const currentSpeedMs = Math.sqrt(this.vx * this.vx + this.vy * this.vy + this.vz * this.vz);
    const speedKts = currentSpeedMs * 1.94384;
    this.state.trueAirspeed = speedKts;
    this.state.indicatedAirspeed = speedKts * Math.sqrt(rho / rho0);
    this.state.groundSpeed = Math.sqrt(this.vx * this.vx + this.vz * this.vz) * 1.94384;

    // Dynamic Pressure q = 0.5 * rho * V^2
    const dynamicPressure = 0.5 * rho * Math.max(1, currentSpeedMs * currentSpeedMs);
    const wingArea = isJet ? 125 : (isTurboprop ? 28.8 : 16.2); // m^2
    const massKg = (this.aircraft.emptyWeightLbs + this.state.fuelRemainingLbs + 350) * 0.453592;

    // Calculate flight path angle vs pitch attitude -> AoA
    const flightPathAngleDeg = currentSpeedMs > 2 ? (Math.asin(Math.max(-1, Math.min(1, this.vy / currentSpeedMs))) * 180 / Math.PI) : 0;
    let aoa = this.state.pitch - flightPathAngleDeg;
    this.state.angleOfAttack = Math.round(aoa * 10) / 10;

    // 5. Aerodynamic Coefficients CL and CD
    const criticalAoA = 16.0 - (flapsFraction * 2.0);
    let cl = 0;
    const isStalled = aoa > criticalAoA || aoa < -criticalAoA;
    this.state.stallWarning = isStalled && currentSpeedMs > 5;

    if (!isStalled) {
      cl = 0.25 + (aoa * 0.09) + (flapsFraction * 0.55);
    } else {
      // Post-stall lift breakdown with severe drag penalty
      cl = (criticalAoA * 0.09 * 0.5) * Math.sin((aoa * Math.PI) / 180);
    }

    const cd0 = 0.027 + (this.state.landingGear ? 0.018 : 0) + (flapsFraction * 0.045) + (this.state.spoilersAirbrakes ? 0.06 : 0);
    const inducedDrag = (cl * cl) / (Math.PI * 7.5 * 0.82);
    const cd = cd0 + inducedDrag;

    // Lift and Drag Forces
    let liftN = cl * dynamicPressure * wingArea;
    let dragN = cd * dynamicPressure * wingArea;

    // Ground Effect (below 1 wingspan, lift increases and induced drag drops up to 40%)
    const wingSpan = isJet ? 34 : 11;
    const heightAboveGroundM = Math.max(0, altitudeMeters - ((this.targetAirport?.elevationFt || 0) * 0.3048));
    if (heightAboveGroundM < wingSpan && heightAboveGroundM > 0) {
      const hRatio = heightAboveGroundM / wingSpan;
      const groundEffectFactor = 1 + (0.35 * (1 - Math.min(1, hRatio)));
      liftN *= groundEffectFactor;
      dragN *= (1 - 0.3 * (1 - Math.min(1, hRatio)));
    }

    // 6. Angular Dynamics (Pitch, Roll, Yaw)
    const controlAuthority = Math.min(1.5, Math.max(0.1, dynamicPressure / 500));
    
    // Pitch rate acceleration and aerodynamic stability
    const pitchCommand = elevatorEff * 28.0 * controlAuthority;
    const pitchDamping = this.pitchRate * 4.0;
    const pitchStability = -aoa * 0.8;
    this.pitchRate += (pitchCommand + pitchStability - pitchDamping) * dt;
    this.state.pitch += this.pitchRate * dt;
    this.state.pitch = Math.max(-85, Math.min(85, this.state.pitch));

    // Roll rate
    const rollCommand = -aileronEff * 45.0 * controlAuthority;
    const rollDamping = this.rollRate * 5.0;
    this.rollRate += (rollCommand - rollDamping) * dt;
    this.state.roll += this.rollRate * dt;
    if (this.state.roll > 180) this.state.roll -= 360;
    if (this.state.roll < -180) this.state.roll += 360;

    // Yaw rate (Rudder & adverse yaw)
    const yawCommand = -rudderEff * 20.0 * controlAuthority;
    const yawDamping = this.yawRate * 4.0;
    this.yawRate += (yawCommand - yawDamping) * dt;
    this.state.heading += (this.yawRate + (Math.tan((this.state.roll * Math.PI) / 180) * 9.81 / Math.max(5, currentSpeedMs) * 180 / Math.PI)) * dt;
    if (this.state.heading >= 360) this.state.heading -= 360;
    if (this.state.heading < 0) this.state.heading += 360;

    // 7. World Vector Equations of Motion
    const radHeading = (this.state.heading * Math.PI) / 180;
    const radPitch = (this.state.pitch * Math.PI) / 180;
    const radRoll = (this.state.roll * Math.PI) / 180;

    // Forward direction unit vector
    const fwdX = Math.sin(radHeading) * Math.cos(radPitch);
    const fwdY = Math.sin(radPitch);
    const fwdZ = -Math.cos(radHeading) * Math.cos(radPitch);

    // Upward lift unit vector (perpendicular to wings)
    const upX = -Math.sin(radRoll) * Math.cos(radHeading) + Math.sin(radPitch) * Math.sin(radHeading) * Math.cos(radRoll);
    const upY = Math.cos(radPitch) * Math.cos(radRoll);
    const upZ = -Math.sin(radRoll) * Math.sin(radHeading) - Math.sin(radPitch) * Math.cos(radHeading) * Math.cos(radRoll);

    // Total Forces
    const totalFx = (fwdX * thrustN) + (upX * liftN) - (this.vx > 0 ? 1 : -1) * Math.abs(fwdX) * dragN;
    const totalFy = (fwdY * thrustN) + (upY * liftN) - (massKg * 9.81);
    const totalFz = (fwdZ * thrustN) + (upZ * liftN) - (this.vz > 0 ? 1 : -1) * Math.abs(fwdZ) * dragN;

    // Accelerations
    const ax = totalFx / massKg;
    const ay = totalFy / massKg;
    const az = totalFz / massKg;

    // G-Force Calculation
    const normalAcc = (upY * liftN) / massKg;
    this.state.gForce = Math.max(-3, Math.min(9, Math.round((normalAcc / 9.81) * 10) / 10));

    // Integrate Velocities
    this.vx += ax * dt;
    this.vy += ay * dt;
    this.vz += az * dt;

    // 8. Ground Interaction & Friction
    const airportGroundElevM = (this.targetAirport?.elevationFt || 0) * 0.3048;
    if (this.state.posY <= airportGroundElevM) {
      this.state.posY = airportGroundElevM;
      this.state.onGround = true;
      
      // Calculate landing impact
      if (this.vy < -0.5) {
        const impactRateFpm = Math.round(this.vy * 196.85); // m/s to fpm
        this.state.verticalSpeed = impactRateFpm;
      }
      this.vy = 0;
      this.state.pitch = Math.max(0, Math.min(10, this.state.pitch));
      this.state.roll = 0;
      this.pitchRate = 0;
      this.rollRate = 0;

      // Ground rolling resistance and wheel brakes
      let frictionCoeff = 0.03;
      if (this.state.parkingBrakes) frictionCoeff = 0.85;
      if (this.state.wheelBrakes) frictionCoeff = 0.45;

      const groundSpeed = Math.sqrt(this.vx * this.vx + this.vz * this.vz);
      if (groundSpeed > 0.05) {
        const brakeDecel = frictionCoeff * 9.81 * dt;
        const speedScale = Math.max(0, (groundSpeed - brakeDecel) / groundSpeed);
        this.vx *= speedScale;
        this.vz *= speedScale;
      } else {
        this.vx = 0;
        this.vz = 0;
      }
    } else {
      this.state.onGround = false;
    }

    // Integrate Positions
    this.state.posX += this.vx * dt;
    this.state.posY += this.vy * dt;
    this.state.posZ += this.vz * dt;

    // 9. Telemetry Updates
    this.state.altitude = Math.round(this.state.posY * 3.28084);
    this.state.altitudeMsl = this.state.altitude;
    this.state.altitudeAgl = Math.max(0, Math.round((this.state.posY - airportGroundElevM) * 3.28084));
    this.state.verticalSpeed = Math.round(this.vy * 196.85); // ft/min
    this.state.turnRate = Math.round(this.yawRate * 10) / 10;
    this.state.slipSkid = Math.max(-1, Math.min(1, -rudderEff * 0.5 + (this.rollRate * 0.05)));

    // 10. ILS Guidance Geometry (Relative to runway threshold)
    const distToThresholdMeters = Math.sqrt(this.state.posX * this.state.posX + this.state.posZ * this.state.posZ);
    this.state.dmeDistanceNm = Math.round((distToThresholdMeters / 1852) * 10) / 10;

    const rwyHeading = this.targetAirport?.runways[0]?.heading || 96;
    const rwyRad = (rwyHeading * Math.PI) / 180;
    const crossTrackErrorM = (this.state.posX * Math.cos(rwyRad)) - (this.state.posZ * Math.sin(rwyRad));
    this.state.ilsLocalizerDev = Math.max(-1, Math.min(1, -crossTrackErrorM / 150));

    const expectedAltAtDistFt = (this.state.dmeDistanceNm * 318) + (this.targetAirport?.elevationFt || 0); // 3° glide path ~318 ft/nm
    const altErrorFt = this.state.altitude - expectedAltAtDistFt;
    this.state.ilsGlideslopeDev = Math.max(-1, Math.min(1, altErrorFt / 250));

    // 11. GPWS & Warnings
    if (this.state.altitudeAgl < 500 && !this.state.onGround && this.state.verticalSpeed < -1200) {
      this.state.terrainWarning = true;
      this.state.gpwsCallout = "PULL UP";
    } else if (this.state.altitudeAgl < 200 && !this.state.landingGear && !this.state.onGround) {
      this.state.gearWarning = true;
      this.state.gpwsCallout = "TOO LOW, GEAR";
    } else if (this.state.stallWarning) {
      this.state.gpwsCallout = "STALL";
    } else {
      this.state.terrainWarning = false;
      this.state.gearWarning = false;
      this.state.gpwsCallout = null;
    }

    // Fuel Burn
    const fuelFlowLbsPerHour = (this.aircraft.category === 'commercial_jet' ? 5200 : 60) * (throttle * 0.8 + 0.2);
    this.state.fuelRemainingLbs = Math.max(0, this.state.fuelRemainingLbs - ((fuelFlowLbsPerHour / 3600) * dt));
    this.state.fuelPercent = Math.round((this.state.fuelRemainingLbs / (this.aircraft.fuelCapacityGal * 6)) * 100);
  }
}
