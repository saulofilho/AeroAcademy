import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  FlightTelemetry,
  AircraftSpecs,
  AirportInfo,
  DynamicWeatherConfig,
  FlightManeuver,
  SupportedLanguage,
  HardwareInputConfig,
  LogbookEntry,
  CockpitViewMode,
} from '../../types';
import { FlightPhysicsEngine } from '../../services/flightPhysics';
import { audioEngine } from '../../services/audioEffects';
import { CockpitOverlay } from './CockpitOverlay';
import { HardwareCalibrationModal } from './HardwareCalibrationModal';
import { PostFlightDebriefModal } from './PostFlightDebriefModal';
import { translations } from '../../i18n/translations';
import {
  Play,
  Pause,
  RotateCcw,
  Camera,
  Glasses,
  Sliders,
  Flag,
  Radio,
  Volume2,
  VolumeX,
  Sparkles,
  Award,
  ChevronRight,
  Maximize2,
} from 'lucide-react';

interface FlightSimulator3DProps {
  currentAircraft: AircraftSpecs;
  currentAirport: AirportInfo;
  currentWeather: DynamicWeatherConfig;
  activeManeuver?: FlightManeuver;
  lang: SupportedLanguage;
  onSaveFlightLog: (entry: LogbookEntry) => void;
  onOpenShareModal: (entry: LogbookEntry) => void;
  onNavigateTab: (tab: string) => void;
}

export const FlightSimulator3D: React.FC<FlightSimulator3DProps> = ({
  currentAircraft,
  currentAirport,
  currentWeather,
  activeManeuver,
  lang,
  onSaveFlightLog,
  onOpenShareModal,
  onNavigateTab,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulation State
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<CockpitViewMode>('cockpit_hud');
  const [telemetry, setTelemetry] = useState<FlightTelemetry | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState<boolean>(false);
  const [isDebriefModalOpen, setIsDebriefModalOpen] = useState<boolean>(false);
  const [lastCompletedEntry, setLastCompletedEntry] = useState<LogbookEntry | null>(null);
  const [instructorFeedback, setInstructorFeedback] = useState<string>('Motor em marcha lenta, pronto para decolagem na pista.');
  const [instructorFeedbackType, setInstructorFeedbackType] = useState<'info' | 'good' | 'warning'>('info');

  // Flight session metrics
  const flightStartTimeRef = useRef<number>(Date.now());
  const maxAltitudeRef = useRef<number>(0);
  const maxSpeedRef = useRef<number>(0);
  const maxGForceRef = useRef<number>(1.0);
  const lastTouchdownFpmRef = useRef<number>(0);

  // Hardware Config
  const [hardwareConfig, setHardwareConfig] = useState<HardwareInputConfig>({
    deviceType: 'keyboard_mouse',
    axes: {
      pitchAxis: 1,
      pitchInverted: false,
      rollAxis: 0,
      rollInverted: false,
      yawAxis: 2,
      yawInverted: false,
      throttleAxis: 3,
      throttleInverted: true,
    },
    deadzone: 0.05,
    sensitivity: 1.0,
    buttonBindings: {
      flapsExtend: 0,
      flapsRetract: 1,
      gearToggle: 2,
      brakes: 3,
      trimUp: 4,
      trimDown: 5,
      resetView: 6,
      toggleAutopilot: 7,
    },
  });

  // Physics Engine Instance Reference
  const physicsRef = useRef<FlightPhysicsEngine | null>(null);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const aircraftMeshRef = useRef<THREE.Group | null>(null);
  const propMeshRef = useRef<THREE.Mesh | null>(null);
  const aileronLeftRef = useRef<THREE.Mesh | null>(null);
  const aileronRightRef = useRef<THREE.Mesh | null>(null);
  const elevatorMeshRef = useRef<THREE.Mesh | null>(null);
  const rudderMeshRef = useRef<THREE.Mesh | null>(null);
  const rainParticlesRef = useRef<THREE.Points | null>(null);
  const requestAnimationIdRef = useRef<number | null>(null);

  // Key map
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});

  // Initialize Physics Engine
  useEffect(() => {
    const engine = new FlightPhysicsEngine(currentAircraft, currentWeather, currentAirport);
    if (activeManeuver) {
      if (activeManeuver.initialState.onGround) {
        // Runway start
        engine.state = engine.getInitialState();
      } else {
        // Airborne start
        engine.resetToAirborne(
          activeManeuver.initialState.altitudeFt,
          activeManeuver.initialState.airspeedKts,
          activeManeuver.initialState.headingDeg
        );
      }
    }
    physicsRef.current = engine;
    setTelemetry({ ...engine.state });
    audioEngine.startEngine(currentAircraft.soundEngineType);

    flightStartTimeRef.current = Date.now();
    maxAltitudeRef.current = engine.state.altitude;
    maxSpeedRef.current = engine.state.indicatedAirspeed;
    maxGForceRef.current = 1.0;
  }, [currentAircraft, currentAirport, currentWeather, activeManeuver]);

  // Set up Three.js 3D Scene
  useEffect(() => {
    if (!canvasRef.current) return;

    const width = canvasRef.current.clientWidth || 800;
    const height = canvasRef.current.clientHeight || 500;

    // 1. Scene & Background
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.00015);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 50000);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 4. Lighting based on time of day
    const ambientLight = new THREE.AmbientLight(0xffffff, currentWeather.timeOfDay === 'night' ? 0.15 : 0.65);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(
      currentWeather.timeOfDay === 'sunset' ? 0xffaa66 : (currentWeather.timeOfDay === 'night' ? 0x334466 : 0xffffff),
      currentWeather.timeOfDay === 'night' ? 0.3 : 1.2
    );
    dirLight.position.set(2000, 4000, 2000);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // 5. Sky Dome
    const skyGeo = new THREE.SphereGeometry(30000, 32, 15);
    const skyMat = new THREE.MeshBasicMaterial({
      color: currentWeather.timeOfDay === 'night' ? 0x050b14 : (currentWeather.timeOfDay === 'sunset' ? 0xe07a5f : 0x38bdf8),
      side: THREE.BackSide,
    });
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyDome);

    // 6. Terrain Ground Mesh
    const groundGeo = new THREE.PlaneGeometry(60000, 60000, 64, 64);
    const groundMat = new THREE.MeshLambertMaterial({
      color: currentWeather.timeOfDay === 'night' ? 0x0a140d : 0x224c28,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Add surrounding mountain hills
    const hillGeo = new THREE.ConeGeometry(800, 1200, 16);
    const hillMat = new THREE.MeshLambertMaterial({ color: 0x2d4a22 });
    for (let i = 0; i < 16; i++) {
      const hill = new THREE.Mesh(hillGeo, hillMat);
      const angle = (i / 16) * Math.PI * 2;
      const dist = 6000 + Math.random() * 8000;
      hill.position.set(Math.cos(angle) * dist, 600, Math.sin(angle) * dist);
      scene.add(hill);
    }

    // 7. Airport Runway & Markings
    const runwayGroup = new THREE.Group();
    const rwyLength = 3500;
    const rwyWidth = 45;
    
    // Asphalt surface
    const rwyGeo = new THREE.PlaneGeometry(rwyWidth, rwyLength);
    const rwyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const rwyMesh = new THREE.Mesh(rwyGeo, rwyMat);
    rwyMesh.rotation.x = -Math.PI / 2;
    rwyMesh.position.y = 0.2;
    runwayGroup.add(rwyMesh);

    // Runway Centerline stripes
    for (let z = -rwyLength / 2 + 50; z < rwyLength / 2 - 50; z += 60) {
      const stripeGeo = new THREE.PlaneGeometry(1.5, 30);
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(0, 0.3, z);
      runwayGroup.add(stripe);
    }

    // Runway Edge & Threshold Lights
    const lightGeo = new THREE.SphereGeometry(1, 8, 8);
    const whiteLightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const greenLightMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const redLightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    for (let z = -rwyLength / 2; z <= rwyLength / 2; z += 80) {
      // Left edge
      const lightL = new THREE.Mesh(lightGeo, whiteLightMat);
      lightL.position.set(-rwyWidth / 2 - 2, 0.5, z);
      runwayGroup.add(lightL);

      // Right edge
      const lightR = new THREE.Mesh(lightGeo, whiteLightMat);
      lightR.position.set(rwyWidth / 2 + 2, 0.5, z);
      runwayGroup.add(lightR);
    }

    // Threshold green / red lights
    for (let x = -rwyWidth / 2; x <= rwyWidth / 2; x += 6) {
      const threshNorth = new THREE.Mesh(lightGeo, greenLightMat);
      threshNorth.position.set(x, 0.5, -rwyLength / 2);
      runwayGroup.add(threshNorth);

      const threshSouth = new THREE.Mesh(lightGeo, redLightMat);
      threshSouth.position.set(x, 0.5, rwyLength / 2);
      runwayGroup.add(threshSouth);
    }

    // PAPI 4-Light Glideslope Box (Left of runway)
    for (let p = 0; p < 4; p++) {
      const papiBox = new THREE.Mesh(lightGeo, p < 2 ? whiteLightMat : redLightMat);
      papiBox.position.set(-rwyWidth / 2 - 12 - (p * 4), 1.0, -rwyLength / 2 + 300);
      runwayGroup.add(papiBox);
    }

    scene.add(runwayGroup);

    // 8. 3D Aircraft Procedural Model
    const aircraftGroup = new THREE.Group();
    
    // Fuselage
    const primaryColorHex = parseInt(currentAircraft.liveries[0]?.primaryColor?.replace('#', '') || '2563eb', 16);
    const secondaryColorHex = parseInt(currentAircraft.liveries[0]?.secondaryColor?.replace('#', '') || 'e0e7ff', 16);

    const fuselageGeo = new THREE.CylinderGeometry(0.8, 0.4, 8, 16);
    fuselageGeo.rotateX(Math.PI / 2);
    const fuselageMat = new THREE.MeshStandardMaterial({
      color: secondaryColorHex,
      metalness: 0.2,
      roughness: 0.4,
    });
    const fuselage = new THREE.Mesh(fuselageGeo, fuselageMat);
    fuselage.castShadow = true;
    aircraftGroup.add(fuselage);

    // Wings
    const wingGeo = new THREE.BoxGeometry(11, 0.12, 1.6);
    const wingMat = new THREE.MeshStandardMaterial({
      color: primaryColorHex,
      metalness: 0.3,
      roughness: 0.3,
    });
    const wings = new THREE.Mesh(wingGeo, wingMat);
    wings.position.set(0, 0.4, 0.2);
    wings.castShadow = true;
    aircraftGroup.add(wings);

    // Aileron Left & Right
    const aileronGeo = new THREE.BoxGeometry(3.0, 0.08, 0.35);
    const aileronMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    
    const aileronL = new THREE.Mesh(aileronGeo, aileronMat);
    aileronL.position.set(-3.8, 0.4, 1.0);
    aircraftGroup.add(aileronL);
    aileronLeftRef.current = aileronL;

    const aileronR = new THREE.Mesh(aileronGeo, aileronMat);
    aileronR.position.set(3.8, 0.4, 1.0);
    aircraftGroup.add(aileronR);
    aileronRightRef.current = aileronR;

    // Horizontal Stabilizer & Elevator
    const horizStabGeo = new THREE.BoxGeometry(3.6, 0.08, 0.9);
    const horizStab = new THREE.Mesh(horizStabGeo, wingMat);
    horizStab.position.set(0, 0.3, -3.4);
    aircraftGroup.add(horizStab);

    const elevGeo = new THREE.BoxGeometry(3.4, 0.06, 0.3);
    const elevatorMesh = new THREE.Mesh(elevGeo, aileronMat);
    elevatorMesh.position.set(0, 0.3, -3.9);
    aircraftGroup.add(elevatorMesh);
    elevatorMeshRef.current = elevatorMesh;

    // Vertical Stabilizer & Rudder
    const vertStabGeo = new THREE.BoxGeometry(0.1, 1.6, 1.2);
    const vertStab = new THREE.Mesh(vertStabGeo, wingMat);
    vertStab.position.set(0, 1.1, -3.2);
    aircraftGroup.add(vertStab);

    const rudderGeo = new THREE.BoxGeometry(0.08, 1.5, 0.35);
    const rudderMesh = new THREE.Mesh(rudderGeo, aileronMat);
    rudderMesh.position.set(0, 1.1, -3.9);
    aircraftGroup.add(rudderMesh);
    rudderMeshRef.current = rudderMesh;

    // Propeller Disc / Nose Cone
    const propGeo = new THREE.BoxGeometry(2.0, 0.15, 0.05);
    const propMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
    const propMesh = new THREE.Mesh(propGeo, propMat);
    propMesh.position.set(0, 0, 4.05);
    aircraftGroup.add(propMesh);
    propMeshRef.current = propMesh;

    // Tricycle Landing Gear Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.15, 12);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111111 });

    const noseWheel = new THREE.Mesh(wheelGeo, wheelMat);
    noseWheel.position.set(0, -0.9, 2.8);
    aircraftGroup.add(noseWheel);

    const mainWheelL = new THREE.Mesh(wheelGeo, wheelMat);
    mainWheelL.position.set(-1.2, -0.9, -0.2);
    aircraftGroup.add(mainWheelL);

    const mainWheelR = new THREE.Mesh(wheelGeo, wheelMat);
    mainWheelR.position.set(1.2, -0.9, -0.2);
    aircraftGroup.add(mainWheelR);

    scene.add(aircraftGroup);
    aircraftMeshRef.current = aircraftGroup;

    // 9. Rain Particle System
    if (currentWeather.rainIntensity > 0) {
      const rainCount = 1500;
      const rainGeo = new THREE.BufferGeometry();
      const rainPositions = new Float32Array(rainCount * 3);
      for (let i = 0; i < rainCount * 3; i += 3) {
        rainPositions[i] = (Math.random() - 0.5) * 400;
        rainPositions[i + 1] = Math.random() * 200;
        rainPositions[i + 2] = (Math.random() - 0.5) * 400;
      }
      rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
      const rainMat = new THREE.PointsMaterial({
        color: 0x93c5fd,
        size: 0.8,
        transparent: true,
        opacity: 0.6,
      });
      const rainPoints = new THREE.Points(rainGeo, rainMat);
      scene.add(rainPoints);
      rainParticlesRef.current = rainPoints;
    }

    // Window resize observer
    const handleResize = () => {
      if (!canvasRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = canvasRef.current.clientWidth;
      const h = canvasRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      audioEngine.stopAll();
    };
  }, [currentAircraft, currentAirport, currentWeather]);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = true;

      // Handle direct toggles
      if (e.code === 'KeyF') {
        // Toggle Flaps
        if (physicsRef.current) {
          const nextFlaps = (physicsRef.current.state.flaps + 1) % 4;
          physicsRef.current.state.flaps = nextFlaps;
          audioEngine.playClickSwitch();
        }
      } else if (e.code === 'KeyG') {
        // Toggle Gear
        if (physicsRef.current) {
          physicsRef.current.state.landingGear = !physicsRef.current.state.landingGear;
          audioEngine.playClickSwitch();
        }
      } else if (e.code === 'KeyB') {
        // Wheel brakes
        if (physicsRef.current) physicsRef.current.state.wheelBrakes = true;
      } else if (e.code === 'Space') {
        // Parking brake toggle
        if (physicsRef.current) {
          physicsRef.current.state.parkingBrakes = !physicsRef.current.state.parkingBrakes;
          audioEngine.playClickSwitch();
        }
      } else if (e.code === 'KeyC') {
        // Cycle Camera
        setViewMode((prev) => (prev === 'cockpit_hud' ? 'chaseView' : prev === 'chaseView' ? 'vr_stereoscopic' : 'cockpit_hud'));
      } else if (e.code === 'KeyV') {
        // Toggle VR mode
        setViewMode((prev) => (prev === 'vr_stereoscopic' ? 'cockpit_hud' : 'vr_stereoscopic'));
      } else if (e.code === 'KeyR') {
        // Reset flight
        handleRestartFlight();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = false;
      if (e.code === 'KeyB') {
        if (physicsRef.current) physicsRef.current.state.wheelBrakes = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Live Simulation Frame Update Loop
  useEffect(() => {
    let lastTime = performance.now();

    const animateLoop = (time: number) => {
      const dt = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;

      const physics = physicsRef.current;
      if (physics && isRunning) {
        // 1. Process Keyboard / Gamepad Inputs
        const keys = keysPressedRef.current;
        let pitchCmd = 0;
        let rollCmd = 0;
        let yawCmd = 0;

        if (keys['KeyW'] || keys['ArrowDown']) pitchCmd -= 1; // Pull back yoke (climb)
        if (keys['KeyS'] || keys['ArrowUp']) pitchCmd += 1; // Push forward (dive)
        if (keys['KeyA'] || keys['ArrowLeft']) rollCmd -= 1; // Bank left
        if (keys['KeyD'] || keys['ArrowRight']) rollCmd += 1; // Bank right
        if (keys['KeyQ']) yawCmd -= 1; // Left rudder
        if (keys['KeyE']) yawCmd += 1; // Right rudder

        // Throttle +/-
        if (keys['ShiftLeft'] || keys['ShiftRight'] || keys['Equal']) {
          physics.state.throttle = Math.min(1.0, physics.state.throttle + dt * 0.4);
        }
        if (keys['ControlLeft'] || keys['ControlRight'] || keys['Minus']) {
          physics.state.throttle = Math.max(0.0, physics.state.throttle - dt * 0.4);
        }

        // Apply Gamepad inputs if connected
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        const gp = gamepads[0] || gamepads[1];
        if (gp) {
          const cfg = hardwareConfig;
          const rawPitch = gp.axes[cfg.axes.pitchAxis] || 0;
          const rawRoll = gp.axes[cfg.axes.rollAxis] || 0;
          const rawYaw = gp.axes[cfg.axes.yawAxis] || 0;

          if (Math.abs(rawPitch) > cfg.deadzone) {
            pitchCmd = rawPitch * (cfg.axes.pitchInverted ? -1 : 1) * cfg.sensitivity;
          }
          if (Math.abs(rawRoll) > cfg.deadzone) {
            rollCmd = rawRoll * (cfg.axes.rollInverted ? -1 : 1) * cfg.sensitivity;
          }
          if (Math.abs(rawYaw) > cfg.deadzone) {
            yawCmd = rawYaw * (cfg.axes.yawInverted ? -1 : 1) * cfg.sensitivity;
          }

          if (gp.axes[cfg.axes.throttleAxis] !== undefined) {
            const rawThr = (gp.axes[cfg.axes.throttleAxis] + 1) / 2;
            physics.state.throttle = cfg.axes.throttleInverted ? 1 - rawThr : rawThr;
          }
        }

        physics.state.elevatorPitchInput = pitchCmd;
        physics.state.aileronRollInput = rollCmd;
        physics.state.rudderYawInput = yawCmd;

        // 2. Physics Update Step
        physics.update(dt);

        // Update telemetry state
        const state = physics.state;
        setTelemetry({ ...state });

        // Update metric records
        if (state.altitude > maxAltitudeRef.current) maxAltitudeRef.current = state.altitude;
        if (state.indicatedAirspeed > maxSpeedRef.current) maxSpeedRef.current = Math.round(state.indicatedAirspeed);
        if (Math.abs(state.gForce) > maxGForceRef.current) maxGForceRef.current = Math.abs(state.gForce);
        if (state.onGround && state.verticalSpeed < 0) {
          lastTouchdownFpmRef.current = state.verticalSpeed;
        }

        // 3. Audio Update
        if (!isAudioMuted) {
          audioEngine.updateTelemetrySound(
            state.engineRpm,
            state.indicatedAirspeed,
            state.stallWarning,
            state.throttle
          );

          if (state.gpwsCallout) {
            audioEngine.speakCallout(state.gpwsCallout, lang);
          }
        }

        // 4. Update 3D Aircraft Model Position & Orientation in Three.js
        if (aircraftMeshRef.current) {
          aircraftMeshRef.current.position.set(state.posX, state.posY + 0.9, state.posZ);
          
          // Euler rotation: Heading (Y), Pitch (X), Roll (Z)
          aircraftMeshRef.current.rotation.set(
            (state.pitch * Math.PI) / 180,
            (-state.heading * Math.PI) / 180,
            (-state.roll * Math.PI) / 180,
            'YXZ'
          );

          // Animate propeller
          if (propMeshRef.current) {
            propMeshRef.current.rotation.z += (state.engineRpm / 60) * Math.PI * 2 * dt;
          }

          // Animate ailerons, elevator, rudder deflection
          if (aileronLeftRef.current) aileronLeftRef.current.rotation.x = -rollCmd * 0.4;
          if (aileronRightRef.current) aileronRightRef.current.rotation.x = rollCmd * 0.4;
          if (elevatorMeshRef.current) elevatorMeshRef.current.rotation.x = pitchCmd * 0.4;
          if (rudderMeshRef.current) rudderMeshRef.current.rotation.y = -yawCmd * 0.4;
        }

        // 5. Update Camera Position based on View Mode
        if (cameraRef.current) {
          const radHeading = (state.heading * Math.PI) / 180;
          const radPitch = (state.pitch * Math.PI) / 180;

          if (viewMode === 'cockpit_hud' || viewMode === 'cockpit_3d') {
            // Inside cockpit looking ahead
            const eyeOffset = new THREE.Vector3(0, 0.85, 0.4);
            eyeOffset.applyEuler(aircraftMeshRef.current?.rotation || new THREE.Euler());
            cameraRef.current.position.set(
              state.posX + eyeOffset.x,
              state.posY + 0.9 + eyeOffset.y,
              state.posZ + eyeOffset.z
            );

            const lookTarget = new THREE.Vector3(
              state.posX + Math.sin(radHeading) * 100,
              state.posY + 0.9 + Math.sin(radPitch) * 100,
              state.posZ - Math.cos(radHeading) * 100
            );
            cameraRef.current.lookAt(lookTarget);
          } else {
            // External chase camera behind and above
            const chaseDist = 18;
            const chaseHeight = 4.5;
            const camX = state.posX - Math.sin(radHeading) * chaseDist;
            const camY = state.posY + chaseHeight;
            const camZ = state.posZ + Math.cos(radHeading) * chaseDist;

            cameraRef.current.position.set(camX, camY, camZ);
            cameraRef.current.lookAt(state.posX, state.posY + 1.5, state.posZ);
          }
        }

        // 6. Rain particles animation
        if (rainParticlesRef.current) {
          const positions = rainParticlesRef.current.geometry.attributes.position.array as Float32Array;
          for (let i = 1; i < positions.length; i += 3) {
            positions[i] -= 150 * dt;
            if (positions[i] < 0) positions[i] = 180;
          }
          rainParticlesRef.current.geometry.attributes.position.needsUpdate = true;
        }

        // 7. Render Three.js Scene
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          if (viewMode === 'vr_stereoscopic') {
            // Dual viewport stereoscopic split-screen
            const width = canvasRef.current?.clientWidth || 800;
            const height = canvasRef.current?.clientHeight || 500;
            
            rendererRef.current.setScissorTest(true);

            // Left Eye
            rendererRef.current.setScissor(0, 0, width / 2, height);
            rendererRef.current.setViewport(0, 0, width / 2, height);
            cameraRef.current.aspect = (width / 2) / height;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.render(sceneRef.current, cameraRef.current);

            // Right Eye
            rendererRef.current.setScissor(width / 2, 0, width / 2, height);
            rendererRef.current.setViewport(width / 2, 0, width / 2, height);
            cameraRef.current.aspect = (width / 2) / height;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.render(sceneRef.current, cameraRef.current);

            rendererRef.current.setScissorTest(false);
          } else {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          }
        }

        // 8. Real-time AI Instructor Coach Telemetry Analysis
        if (state.stallWarning) {
          setInstructorFeedback(
            lang === 'pt'
              ? 'ATENÇÃO: ESTOL IMINENTE! Ceda o manche à frente para baixar o nariz e aplique 100% de potência!'
              : 'WARNING: IMMINENT STALL! Lower the nose immediately and advance throttle to full power!'
          );
          setInstructorFeedbackType('warning');
        } else if (state.altitudeAgl < 200 && state.verticalSpeed < -700 && !state.onGround) {
          setInstructorFeedback(
            lang === 'pt'
              ? 'Atenção: Razão de descida muito alta para o pouso! Suavize a descida com potência.'
              : 'Caution: High sink rate for landing! Add gentle power to arrest descent.'
          );
          setInstructorFeedbackType('warning');
        } else if (state.onGround && state.indicatedAirspeed > 55 && state.throttle > 0.8) {
          setInstructorFeedback(
            lang === 'pt'
              ? 'Velocidade de rotação atingida (55 kts). Puxe o manche suavemente para decolar.'
              : 'Rotate speed achieved (55 kts). Gently ease yoke back to lift off.'
          );
          setInstructorFeedbackType('good');
        } else if (!state.onGround && state.verticalSpeed > 400 && state.indicatedAirspeed > 70) {
          setInstructorFeedback(
            lang === 'pt'
              ? 'Excelente perfil de subida! Mantenha 74 nós e asas niveladas até a altitude de cruzeiro.'
              : 'Great climb profile! Maintain 74 knots and wings level to cruise altitude.'
          );
          setInstructorFeedbackType('good');
        }
      }

      requestAnimationIdRef.current = requestAnimationFrame(animateLoop);
    };

    requestAnimationIdRef.current = requestAnimationFrame(animateLoop);
    return () => {
      if (requestAnimationIdRef.current) cancelAnimationFrame(requestAnimationIdRef.current);
    };
  }, [isRunning, viewMode, isAudioMuted, hardwareConfig, lang]);

  // Restart Flight handler
  const handleRestartFlight = useCallback(() => {
    const physics = physicsRef.current;
    if (!physics) return;
    if (activeManeuver && !activeManeuver.initialState.onGround) {
      physics.resetToAirborne(
        activeManeuver.initialState.altitudeFt,
        activeManeuver.initialState.airspeedKts,
        activeManeuver.initialState.headingDeg
      );
    } else {
      physics.state = physics.getInitialState();
    }
    setTelemetry({ ...physics.state });
    setInstructorFeedback(lang === 'pt' ? 'Simulador reiniciado. Cheque pré-decolagem concluído.' : 'Simulator reset. Pre-flight check complete.');
    setInstructorFeedbackType('info');
    flightStartTimeRef.current = Date.now();
    maxAltitudeRef.current = physics.state.altitude;
    maxSpeedRef.current = physics.state.indicatedAirspeed;
    maxGForceRef.current = 1.0;
  }, [activeManeuver, lang]);

  // End Flight & Generate Debrief Report
  const handleEndFlight = useCallback(async () => {
    const durationMinutes = Math.max(1, Math.round((Date.now() - flightStartTimeRef.current) / 60000));
    const landingFpm = lastTouchdownFpmRef.current || (telemetry?.onGround ? telemetry.verticalSpeed : -150);
    
    // Calculate score
    const sinkPenalty = Math.min(40, Math.abs(landingFpm) / 15);
    const gPenalty = Math.max(0, (maxGForceRef.current - 1.5) * 10);
    const score = Math.max(50, Math.min(100, Math.round(100 - sinkPenalty - gPenalty)));
    const grade: 'A+' | 'A' | 'B' | 'C' | 'D' = score >= 95 ? 'A+' : score >= 85 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : 'D';

    let remarks = lang === 'pt'
      ? `Voo de treinamento realizado com sucesso na aeronave ${currentAircraft.name}. Razão de toque de ${landingFpm} fpm.`
      : `Training flight successfully completed on ${currentAircraft.name}. Touchdown sink rate of ${landingFpm} fpm.`;

    // Fetch AI Instructor evaluation from backend
    try {
      const resp = await fetch('/api/instructor/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maneuver: activeManeuver?.title || 'Voo Geral',
          telemetry: {
            maxAltitude: maxAltitudeRef.current,
            maxSpeed: maxSpeedRef.current,
            verticalSpeed: landingFpm,
            gForce: maxGForceRef.current,
          },
          lang,
        }),
      });
      const data = await resp.json();
      if (data.analysis) {
        remarks = data.analysis;
      }
    } catch (e) {
      console.warn('Backend evaluation fallback notice:', e);
    }

    const newLogEntry: LogbookEntry = {
      id: `log_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      aircraftId: currentAircraft.id,
      aircraftReg: currentAircraft.registration,
      departureIcao: currentAirport.icao,
      arrivalIcao: currentAirport.icao,
      durationMinutes,
      landingsDay: 1,
      landingsNight: currentWeather.timeOfDay === 'night' ? 1 : 0,
      instrumentMinutes: currentWeather.clouds === 'overcast' || currentWeather.visibilityKm < 5 ? durationMinutes : 0,
      crossCountryMinutes: 0,
      soloMinutes: durationMinutes,
      remarks,
      flightScore: score,
      grade,
      telemetrySummary: {
        maxAltitudeFt: maxAltitudeRef.current,
        maxSpeedKts: maxSpeedRef.current,
        maxGForce: maxGForceRef.current,
        landingRateFpm: landingFpm,
        touchdownZoneAccuracyPct: 94,
      },
    };

    onSaveFlightLog(newLogEntry);
    setLastCompletedEntry(newLogEntry);
    setIsDebriefModalOpen(true);
  }, [telemetry, currentAircraft, currentAirport, currentWeather, activeManeuver, lang, onSaveFlightLog]);

  const t = translations[lang].simulator;

  return (
    <div id="flight-simulator-container" className="relative w-full h-[78vh] sm:h-[82vh] bg-[#000000] rounded-2xl overflow-hidden border border-[#1E293B] shadow-2xl flex flex-col">
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block touch-none cursor-grab active:cursor-grabbing" />

      {/* Cockpit Overlay & Glass PFD HUD */}
      {telemetry && (
        <CockpitOverlay
          telemetry={telemetry}
          aircraft={currentAircraft}
          lang={lang}
          onControlChange={(key, val) => {
            if (physicsRef.current) (physicsRef.current.state as any)[key] = val;
          }}
          onThrottleChange={(val) => {
            if (physicsRef.current) physicsRef.current.state.throttle = val;
          }}
          onFlapsToggle={() => {
            if (physicsRef.current) {
              physicsRef.current.state.flaps = (physicsRef.current.state.flaps + 1) % 4;
              audioEngine.playClickSwitch();
            }
          }}
          onGearToggle={() => {
            if (physicsRef.current) {
              physicsRef.current.state.landingGear = !physicsRef.current.state.landingGear;
              audioEngine.playClickSwitch();
            }
          }}
          onBrakesToggle={() => {
            if (physicsRef.current) {
              physicsRef.current.state.parkingBrakes = !physicsRef.current.state.parkingBrakes;
              audioEngine.playClickSwitch();
            }
          }}
        />
      )}

      {/* AI Flight Instructor Live Feedback Bar (Top Center) */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 max-w-xl w-11/12 z-20 pointer-events-none">
        <div
          className={`px-4 py-2.5 rounded-xl flex items-center gap-3 text-xs sm:text-sm font-medium shadow-xl transition-all duration-300 backdrop-blur-md ${
            instructorFeedbackType === 'warning'
              ? 'border border-red-500/60 bg-red-950/85 text-red-100'
              : instructorFeedbackType === 'good'
              ? 'border border-[#22C55E]/60 bg-[#0F172A]/90 text-[#22C55E]'
              : 'border border-[#334155] bg-[#0F172A]/90 text-[#E2E8F0]'
          }`}
        >
          <div className="p-1.5 bg-[#1E293B] border border-[#334155] rounded-lg text-[#38BDF8] shrink-0">
            <Radio className="h-4 w-4 animate-pulse" />
          </div>
          <div className="flex-1 leading-snug">
            <span className="font-bold text-[#38BDF8] font-mono-avionics text-[10px] uppercase tracking-widest block">
              {lang === 'pt' ? 'Instrutor de Voo IA' : 'AI Flight Instructor'}
            </span>
            <span className="text-xs text-[#E2E8F0]">{instructorFeedback}</span>
          </div>
        </div>
      </div>

      {/* FLOATING ACTION TOOLBAR (Top Right) */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
        {/* Audio Mute Toggle */}
        <button
          id="btn-toggle-audio"
          onClick={() => setIsAudioMuted(!isAudioMuted)}
          className="p-2.5 rounded-xl bg-[#0F172A]/90 hover:bg-[#1E293B] border border-[#334155] text-[#94A3B8] hover:text-white cursor-pointer transition-colors backdrop-blur-md"
          title="Audio Engine"
        >
          {isAudioMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4 text-[#38BDF8]" />}
        </button>

        {/* Camera Cycle View */}
        <button
          id="btn-cycle-camera"
          onClick={() => setViewMode(viewMode === 'cockpit_hud' ? 'chaseView' : viewMode === 'chaseView' ? 'vr_stereoscopic' : 'cockpit_hud')}
          className="px-3 py-2 rounded-xl bg-[#0F172A]/90 hover:bg-[#1E293B] border border-[#334155] text-xs font-mono-avionics font-bold text-[#E2E8F0] flex items-center gap-1.5 cursor-pointer transition-colors backdrop-blur-md"
        >
          <Camera className="h-4 w-4 text-[#38BDF8]" />
          <span className="hidden sm:inline">
            {viewMode === 'cockpit_hud' ? t.cockpitHud : viewMode === 'chaseView' ? t.chaseView : t.vrMode}
          </span>
        </button>

        {/* VR Mode Button */}
        <button
          id="btn-vr-mode"
          onClick={() => setViewMode(viewMode === 'vr_stereoscopic' ? 'cockpit_hud' : 'vr_stereoscopic')}
          className={`px-3 py-2 rounded-xl text-xs font-mono-avionics font-bold flex items-center gap-1.5 cursor-pointer transition-all backdrop-blur-md ${
            viewMode === 'vr_stereoscopic'
              ? 'bg-[#1E293B] border border-[#FCD34D] text-[#FCD34D] shadow-lg'
              : 'bg-[#0F172A]/90 hover:bg-[#1E293B] border border-[#334155] text-[#94A3B8] hover:text-white'
          }`}
          title="Virtual Reality WebXR"
        >
          <Glasses className="h-4 w-4 text-[#FCD34D]" />
          <span className="hidden sm:inline">VR</span>
        </button>

        {/* Hardware Calibration */}
        <button
          id="btn-hardware-calib"
          onClick={() => setIsHardwareModalOpen(true)}
          className="p-2.5 rounded-xl bg-[#0F172A]/90 hover:bg-[#1E293B] border border-[#334155] text-[#94A3B8] hover:text-white cursor-pointer transition-colors backdrop-blur-md"
          title={t.hardwareConnect}
        >
          <Sliders className="h-4 w-4 text-[#FCD34D]" />
        </button>

        {/* Pause / Resume */}
        <button
          id="btn-pause-flight"
          onClick={() => setIsRunning(!isRunning)}
          className="p-2.5 rounded-xl bg-[#0F172A]/90 hover:bg-[#1E293B] border border-[#334155] text-[#94A3B8] hover:text-white cursor-pointer transition-colors backdrop-blur-md"
          title={isRunning ? t.pauseFlight : t.resumeFlight}
        >
          {isRunning ? <Pause className="h-4 w-4 text-[#FCD34D]" /> : <Play className="h-4 w-4 text-[#22C55E]" />}
        </button>

        {/* Restart */}
        <button
          id="btn-restart-flight"
          onClick={handleRestartFlight}
          className="p-2.5 rounded-xl bg-[#0F172A]/90 hover:bg-[#1E293B] border border-[#334155] text-[#94A3B8] hover:text-white cursor-pointer transition-colors backdrop-blur-md"
          title={t.restartFlight}
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        {/* End Flight */}
        <button
          id="btn-end-flight"
          onClick={handleEndFlight}
          className="px-4 py-2 rounded-xl bg-[#38BDF8] hover:bg-[#0284C7] text-[#0A0C10] text-xs uppercase tracking-wider font-bold shadow-lg shadow-[#38BDF8]/20 flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <Flag className="h-4 w-4" />
          <span>{lang === 'pt' ? 'Finalizar Voo' : 'End Flight'}</span>
        </button>
      </div>

      {/* ACTIVE MANEUVER OBJECTIVES CARD (Bottom Left floating) */}
      {activeManeuver && (
        <div className="hidden lg:block absolute bottom-20 left-4 z-20 max-w-xs w-full pointer-events-none">
          <div className="bg-[#0F172A]/90 backdrop-blur-md p-4 rounded-xl border border-[#334155] text-xs space-y-2 pointer-events-auto shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
              <span className="font-bold text-[#38BDF8] font-mono-avionics text-[11px] uppercase tracking-wider">
                {activeManeuver.title}
              </span>
            </div>
            <div className="space-y-1.5">
              {activeManeuver.objectives.map((obj) => (
                <div key={obj.id} className="flex items-center gap-2 text-[#94A3B8]">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#38BDF8] shrink-0" />
                  <span className="text-[11px] leading-tight text-[#E2E8F0]">{obj.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <HardwareCalibrationModal
        isOpen={isHardwareModalOpen}
        onClose={() => setIsHardwareModalOpen(false)}
        lang={lang}
        config={hardwareConfig}
        onSaveConfig={(cfg) => setHardwareConfig(cfg)}
      />

      {lastCompletedEntry && (
        <PostFlightDebriefModal
          isOpen={isDebriefModalOpen}
          onClose={() => setIsDebriefModalOpen(false)}
          lang={lang}
          entry={lastCompletedEntry}
          onShare={() => onOpenShareModal(lastCompletedEntry)}
          onGoToLogbook={() => onNavigateTab('logbook')}
        />
      )}
    </div>
  );
};
