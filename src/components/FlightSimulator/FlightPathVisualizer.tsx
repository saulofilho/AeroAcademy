import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
  FlightTelemetry,
  AircraftSpecs,
  AirportInfo,
  DynamicWeatherConfig,
  FlightPathPoint,
  FlightPathMapConfig,
  SupportedLanguage,
} from '../../types';
import { regionalNavData, NavWaypoint, TerrainFeature } from '../../data/navigationFixes';
import {
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Locate,
  Navigation,
  CloudRain,
  Mountain,
  MapPin,
  Trash2,
  Download,
  Share2,
  X,
  Gauge,
  Clock,
  Ruler,
  Radio,
  Eye,
  EyeOff,
} from 'lucide-react';

interface FlightPathVisualizerProps {
  telemetry: FlightTelemetry;
  aircraft: AircraftSpecs;
  airport: AirportInfo;
  weather: DynamicWeatherConfig;
  trajectory: FlightPathPoint[];
  lang: SupportedLanguage;
  isOpen: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
  onClearTrajectory: () => void;
}

export const FlightPathVisualizer: React.FC<FlightPathVisualizerProps> = ({
  telemetry,
  aircraft,
  airport,
  weather,
  trajectory,
  lang,
  isOpen,
  isExpanded,
  onToggleExpand,
  onClose,
  onClearTrajectory,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Map Navigation Configuration State
  const [config, setConfig] = useState<FlightPathMapConfig>({
    trackUp: false,
    showTerrainShading: true,
    showWaypoints: true,
    showIlsApproach: true,
    showRangeRings: true,
    showAltitudeHeatmap: true,
    showWeatherRadar: weather.rainIntensity > 0 || weather.clouds === 'broken' || weather.clouds === 'overcast',
    zoomLevel: 10, // Nautical Miles view radius
  });

  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredPoint, setHoveredPoint] = useState<FlightPathPoint | null>(null);
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);

  // Nav data for the active airport
  const navData = useMemo(() => {
    return regionalNavData[airport.icao] || {
      airportIcao: airport.icao,
      waypoints: [
        {
          id: `${airport.icao}_CTR`,
          name: `${airport.icao} TOWER`,
          type: 'airport' as const,
          lat: airport.coordinates.lat,
          lon: airport.coordinates.lon,
        },
      ],
      terrainFeatures: [],
    };
  }, [airport.icao, airport.coordinates]);

  // Current real-time calculated coordinates from flight physics
  const currentCoords = useMemo(() => {
    const latMeters = -telemetry.posZ; // -Z is North in standard aviation
    const lonMeters = telemetry.posX;  // +X is East

    const latDelta = latMeters / 111139;
    const lonDelta = lonMeters / (111139 * Math.cos((airport.coordinates.lat * Math.PI) / 180));

    return {
      lat: airport.coordinates.lat + latDelta,
      lon: airport.coordinates.lon + lonDelta,
    };
  }, [telemetry.posX, telemetry.posZ, airport.coordinates]);

  // Distance flown calculation
  const totalDistanceNm = useMemo(() => {
    if (trajectory.length < 2) return 0;
    let distMeters = 0;
    for (let i = 1; i < trajectory.length; i++) {
      const p1 = trajectory[i - 1];
      const p2 = trajectory[i];
      const dx = p2.posX - p1.posX;
      const dz = p2.posZ - p1.posZ;
      distMeters += Math.sqrt(dx * dx + dz * dz);
    }
    return Math.round((distMeters / 1852) * 10) / 10;
  }, [trajectory]);

  // Bearing & Distance to Destination Runway Threshold
  const navBearingDistance = useMemo(() => {
    const rwy = airport.runways[0];
    const dx = -telemetry.posX;
    const dz = -telemetry.posZ;
    const distM = Math.sqrt(dx * dx + dz * dz);
    const distNm = Math.round((distM / 1852) * 10) / 10;

    let rad = Math.atan2(dx, -dz);
    let deg = (rad * 180) / Math.PI;
    if (deg < 0) deg += 360;

    return {
      distNm,
      bearingDeg: Math.round(deg),
      rwyCourse: rwy?.ilsCourse || rwy?.heading || 0,
    };
  }, [telemetry.posX, telemetry.posZ, airport.runways]);

  // Handle Pan Dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? 1.5 : -1.5;
    setConfig((prev) => ({
      ...prev,
      zoomLevel: Math.max(2, Math.min(60, prev.zoomLevel + zoomDelta)),
    }));
  };

  // Touch Support
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - panOffset.x,
        y: e.touches[0].clientY - panOffset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isDragging && e.touches.length === 1) {
      setPanOffset({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Reset View to Aircraft Center
  const handleRecenter = () => {
    setPanOffset({ x: 0, y: 0 });
  };

  // Export Trajectory to GeoJSON / GPX
  const handleExportTrajectory = () => {
    const geoData = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            aircraft: aircraft.name,
            registration: aircraft.registration,
            airport: airport.icao,
            totalDistanceNm,
            recordedPoints: trajectory.length,
            date: new Date().toISOString(),
          },
          geometry: {
            type: 'LineString',
            coordinates: trajectory.map((p) => [p.lon, p.lat, p.altitudeFt]),
          },
        },
      ],
    };

    const blob = new Blob([JSON.stringify(geoData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FlightPath_${airport.icao}_${aircraft.registration}_${Date.now()}.geojson`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Copy GPS Coordinates
  const handleCopyCoords = () => {
    const text = `${currentCoords.lat.toFixed(6)}, ${currentCoords.lon.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // -------------------------------------------------------------
  // Canvas Map Rendering Loop
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isOpen) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // Center coordinates
    const centerX = width / 2 + panOffset.x;
    const centerY = height / 2 + panOffset.y;

    // Scale calculation: pixels per meter based on zoom radius in NM
    const radiusMeters = config.zoomLevel * 1852;
    const maxDimension = Math.min(width, height) / 2;
    const scale = maxDimension / radiusMeters; // px per meter

    // Save initial state for Track-Up / North-Up rotation
    ctx.save();
    ctx.translate(centerX, centerY);

    const rotationRad = config.trackUp ? -(telemetry.heading * Math.PI) / 180 : 0;
    if (config.trackUp) {
      ctx.rotate(rotationRad);
    }

    // Helper: convert (posX, posZ) relative to aircraft to canvas coords
    // In physics: posX = +East, posZ = +South (so North = -posZ, East = +posX)
    // Canvas: +X = East, -Y = North
    const worldToScreen = (wx: number, wz: number) => {
      // relative to current aircraft posX, posZ
      const relX = wx - telemetry.posX;
      const relZ = wz - telemetry.posZ;
      const screenX = relX * scale;
      const screenY = relZ * scale; // +Z is South, which is down (+Y) in screen space
      return { x: screenX, y: screenY };
    };

    // Helper: convert Lat/Lon to world relative meters
    const latLonToWorld = (lat: number, lon: number) => {
      const latDelta = lat - airport.coordinates.lat;
      const lonDelta = lon - airport.coordinates.lon;
      const wz = -latDelta * 111139; // North is -Z
      const wx = lonDelta * 111139 * Math.cos((airport.coordinates.lat * Math.PI) / 180);
      return { wx, wz };
    };

    // 1. Background Grid & Radar Sweep Base
    ctx.fillStyle = '#060B12';
    ctx.fillRect(-width * 2, -height * 2, width * 4, height * 4);

    // 2. Terrain Topography Shading & Elevation Features
    if (config.showTerrainShading) {
      // Draw background terrain contour bands
      const terrainFeatures = navData.terrainFeatures || [];
      terrainFeatures.forEach((feat) => {
        const { wx, wz } = latLonToWorld(feat.lat, feat.lon);
        const pt = worldToScreen(wx, wz);
        const radiusPx = (feat.radiusNm || 2.5) * 1852 * scale;

        if (feat.type === 'water_body') {
          const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, radiusPx);
          grad.addColorStop(0, 'rgba(12, 74, 110, 0.45)');
          grad.addColorStop(0.8, 'rgba(8, 47, 73, 0.25)');
          grad.addColorStop(1, 'rgba(8, 47, 73, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radiusPx, 0, Math.PI * 2);
          ctx.fill();

          // Water body border
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radiusPx * 0.9, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (feat.type === 'mountain_peak' || feat.type === 'valley') {
          // Mountain topo shading with contour rings
          const elevation = feat.elevationFt;
          const peakColor =
            elevation > 6000
              ? 'rgba(168, 85, 247, 0.35)' // Alpine purple/snow
              : elevation > 3500
              ? 'rgba(217, 119, 6, 0.35)'  // Highland brown/amber
              : 'rgba(22, 101, 52, 0.35)';  // Lowland green

          const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, radiusPx);
          grad.addColorStop(0, peakColor);
          grad.addColorStop(0.5, 'rgba(51, 65, 85, 0.2)');
          grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radiusPx, 0, Math.PI * 2);
          ctx.fill();

          // Contour rings
          for (let r = 0.3; r <= 0.8; r += 0.25) {
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, radiusPx * r, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Mountain peak text label
          ctx.fillStyle = '#CBD5E1';
          ctx.font = 'bold 9px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`▲ ${feat.name}`, pt.x, pt.y - 8);
          ctx.fillStyle = '#94A3B8';
          ctx.font = '8px JetBrains Mono, monospace';
          ctx.fillText(`${feat.elevationFt} FT`, pt.x, pt.y + 4);
        }
      });
    }

    // 3. Simulated Doppler Weather Radar Cells
    if (config.showWeatherRadar && (weather.rainIntensity > 0 || weather.clouds === 'broken' || weather.clouds === 'overcast')) {
      const rainIntensity = weather.rainIntensity || 0.4;
      const cellCount = 5;
      for (let i = 0; i < cellCount; i++) {
        const angle = (i * 72 + weather.windDirectionDeg) * (Math.PI / 180);
        const distM = 6000 + (i % 3) * 4500;
        const cellX = Math.cos(angle) * distM;
        const cellZ = Math.sin(angle) * distM;
        const pt = worldToScreen(cellX, cellZ);
        const cellRadius = (3500 + i * 800) * scale;

        const radarGrad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, cellRadius);
        if (rainIntensity > 0.6) {
          radarGrad.addColorStop(0, 'rgba(239, 68, 68, 0.4)'); // Heavy Red
          radarGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.3)'); // Amber
          radarGrad.addColorStop(0.8, 'rgba(34, 197, 94, 0.2)'); // Green
        } else {
          radarGrad.addColorStop(0, 'rgba(245, 158, 11, 0.3)'); // Amber
          radarGrad.addColorStop(0.5, 'rgba(34, 197, 94, 0.25)'); // Green
          radarGrad.addColorStop(1, 'rgba(6, 182, 212, 0.1)'); // Cyan
        }
        radarGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');

        ctx.fillStyle = radarGrad;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, cellRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 4. Range Rings & Distance Markers
    if (config.showRangeRings) {
      const ringIntervalsNm = config.zoomLevel <= 6 ? [1, 2, 4, 6] : config.zoomLevel <= 15 ? [2, 5, 10, 15] : [5, 10, 20, 30, 40];
      ringIntervalsNm.forEach((nm) => {
        const radiusPx = nm * 1852 * scale;
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, radiusPx, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label ring
        ctx.fillStyle = '#64748B';
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${nm} NM`, 5, -radiusPx + 10);
      });

      // Compass Crosshairs at aircraft center
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-15, 0);
      ctx.lineTo(15, 0);
      ctx.moveTo(0, -15);
      ctx.lineTo(0, 15);
      ctx.stroke();
    }

    // 5. Airport Runway Footprint & Extended Centerline (ILS Cone)
    airport.runways.forEach((rwy) => {
      const rwyLengthM = rwy.lengthMeters || (rwy.lengthFt * 0.3048);
      const rwyWidthM = rwy.widthMeters || (rwy.widthFt * 0.3048);
      const rwyHdgRad = (rwy.heading * Math.PI) / 180;

      // Runway center relative to airport origin (0, 0)
      const rwyCenterScreen = worldToScreen(0, 0);

      // Draw Runway surface rectangle
      ctx.save();
      ctx.translate(rwyCenterScreen.x, rwyCenterScreen.y);
      ctx.rotate(rwyHdgRad);

      const rwyW = Math.max(3, rwyWidthM * scale);
      const rwyL = Math.max(12, rwyLengthM * scale);

      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.5;
      ctx.fillRect(-rwyW / 2, -rwyL / 2, rwyW, rwyL);
      ctx.strokeRect(-rwyW / 2, -rwyL / 2, rwyW, rwyL);

      // Runway threshold designation numbers
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 8px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(rwy.ident, 0, -rwyL / 2 + 10);

      // ILS Approach Cone & Extended Centerline
      if (config.showIlsApproach) {
        const approachLengthPx = 10 * 1852 * scale; // 10 NM approach

        // Extended centerline
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, rwyL / 2);
        ctx.lineTo(0, rwyL / 2 + approachLengthPx);
        ctx.stroke();
        ctx.setLineDash([]);

        // Approach Fan / Funnel Cone
        const coneHalfWidthPx = Math.tan((3.5 * Math.PI) / 180) * approachLengthPx;
        ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, rwyL / 2);
        ctx.lineTo(-coneHalfWidthPx, rwyL / 2 + approachLengthPx);
        ctx.lineTo(coneHalfWidthPx, rwyL / 2 + approachLengthPx);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 3 NM, 5 NM, 10 NM Touchdown markers on glidepath
        const markersNm = [3, 5, 10];
        markersNm.forEach((distNm) => {
          const yPos = rwyL / 2 + distNm * 1852 * scale;
          ctx.strokeStyle = '#FCD34D';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-6, yPos);
          ctx.lineTo(6, yPos);
          ctx.stroke();

          ctx.fillStyle = '#FCD34D';
          ctx.font = '7px JetBrains Mono, monospace';
          ctx.fillText(`${distNm}NM (3° GS)`, 18, yPos + 2);
        });
      }

      ctx.restore();
    });

    // 6. Navigation Fixes & VORs / NDBs
    if (config.showWaypoints && navData.waypoints) {
      navData.waypoints.forEach((wp) => {
        const { wx, wz } = latLonToWorld(wp.lat, wp.lon);
        const pt = worldToScreen(wx, wz);

        if (wp.type === 'vor') {
          // VOR Symbol: Hexagon with center dot & frequency
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = (i * 60 * Math.PI) / 180;
            const hx = pt.x + Math.cos(a) * 6;
            const hy = pt.y + Math.sin(a) * 6;
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.stroke();

          ctx.fillStyle = '#38BDF8';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
          ctx.fill();

          // Label
          ctx.fillStyle = '#38BDF8';
          ctx.font = 'bold 9px JetBrains Mono, monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`${wp.id}`, pt.x + 9, pt.y - 2);
          if (wp.freq) {
            ctx.fillStyle = '#94A3B8';
            ctx.font = '8px JetBrains Mono, monospace';
            ctx.fillText(`${wp.freq}`, pt.x + 9, pt.y + 7);
          }
        } else if (wp.type === 'ndb') {
          // NDB Symbol: Dashed circle
          ctx.strokeStyle = '#FCD34D';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#FCD34D';
          ctx.font = 'bold 9px JetBrains Mono, monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`${wp.id}`, pt.x + 8, pt.y + 3);
        } else {
          // Standard Fix Symbol: Triangle
          ctx.fillStyle = '#E2E8F0';
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y - 5);
          ctx.lineTo(pt.x + 4, pt.y + 3);
          ctx.lineTo(pt.x - 4, pt.y + 3);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#E2E8F0';
          ctx.font = '8px JetBrains Mono, monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`${wp.name}`, pt.x + 6, pt.y + 3);
        }
      });
    }

    // 7. Recorded Flight Trajectory Path (Breadcrumbs & Altitude Gradient Ribbon)
    if (trajectory.length > 1) {
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 1; i < trajectory.length; i++) {
        const p1 = trajectory[i - 1];
        const p2 = trajectory[i];
        const scr1 = worldToScreen(p1.posX, p1.posZ);
        const scr2 = worldToScreen(p2.posX, p2.posZ);

        if (config.showAltitudeHeatmap) {
          // Color based on altitude (Green = Low, Sky = Mid, Purple/Amber = High)
          const alt = p2.altitudeFt;
          let strokeColor = '#22C55E'; // Low altitude (< 1000 ft)
          if (alt > 10000) strokeColor = '#C084FC'; // Purple High Flight Level
          else if (alt > 5000) strokeColor = '#FCD34D'; // Amber Mid Flight Level
          else if (alt > 2500) strokeColor = '#38BDF8'; // Sky Blue Cruise
          else if (alt > 1000) strokeColor = '#06B6D4'; // Cyan Climb

          ctx.strokeStyle = strokeColor;
        } else {
          ctx.strokeStyle = '#38BDF8';
        }

        ctx.beginPath();
        ctx.moveTo(scr1.x, scr1.y);
        ctx.lineTo(scr2.x, scr2.y);
        ctx.stroke();
      }

      // Start Takeoff Marker
      const startPt = worldToScreen(trajectory[0].posX, trajectory[0].posZ);
      ctx.fillStyle = '#22C55E';
      ctx.beginPath();
      ctx.arc(startPt.x, startPt.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#22C55E';
      ctx.font = 'bold 8px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText('DEP', startPt.x - 6, startPt.y + 3);
    }

    // 8. Dynamic Aircraft Center Marker & Predictor Vector
    // Aircraft is centered at (0, 0) on screen
    const planeHeadingRad = (telemetry.heading * Math.PI) / 180;
    const visualHeading = config.trackUp ? 0 : planeHeadingRad; // If Track-Up, heading points straight UP (0 rad)

    ctx.save();
    ctx.rotate(visualHeading);

    // Predictor Vector line (30s & 60s ahead based on groundspeed)
    const speedMs = telemetry.groundSpeed * 0.514444;
    const vector30sPx = speedMs * 30 * scale;
    if (vector30sPx > 8) {
      ctx.strokeStyle = '#22C55E';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -vector30sPx);
      ctx.stroke();
      ctx.setLineDash([]);

      // 30s predictor tick
      ctx.fillStyle = '#22C55E';
      ctx.beginPath();
      ctx.arc(0, -vector30sPx, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pulsing Radar Ring
    const pulseRadius = (Date.now() % 2000) / 2000;
    ctx.strokeStyle = `rgba(56, 189, 248, ${1 - pulseRadius})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 10 + pulseRadius * 25, 0, Math.PI * 2);
    ctx.stroke();

    // Aircraft Silhouette Icon (High-Precision Jet Chevron)
    ctx.fillStyle = '#38BDF8';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -14);        // Nose
    ctx.lineTo(10, 8);         // Right wingtip
    ctx.lineTo(3, 4);          // Wing body joint
    ctx.lineTo(3, 11);         // Right elevator
    ctx.lineTo(0, 8);          // Tail center
    ctx.lineTo(-3, 11);        // Left elevator
    ctx.lineTo(-3, 4);         // Wing body joint
    ctx.lineTo(-10, 8);        // Left wingtip
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    ctx.restore(); // Restore base transform

    // 9. North Arrow Indicator & Compass Ribbon
    ctx.save();
    ctx.translate(width - 32, 36);
    const compassRotation = config.trackUp ? -(telemetry.heading * Math.PI) / 180 : 0;
    ctx.rotate(compassRotation);

    // North Pointer
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(6, 4);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    // South Pointer
    ctx.fillStyle = '#94A3B8';
    ctx.beginPath();
    ctx.moveTo(0, 14);
    ctx.lineTo(6, 4);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#EF4444';
    ctx.font = 'bold 9px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('N', 0, -16);

    ctx.restore();

    // 10. Map Scale Legend (Bottom Left)
    const legendNm = config.zoomLevel <= 5 ? 1 : config.zoomLevel <= 15 ? 2 : 5;
    const legendWidthPx = legendNm * 1852 * scale;
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, height - 20);
    ctx.lineTo(20 + legendWidthPx, height - 20);
    ctx.moveTo(20, height - 25);
    ctx.lineTo(20, height - 15);
    ctx.moveTo(20 + legendWidthPx, height - 25);
    ctx.lineTo(20 + legendWidthPx, height - 15);
    ctx.stroke();

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${legendNm} NM`, 20 + legendWidthPx / 2, height - 8);
  }, [
    isOpen,
    telemetry,
    airport,
    weather,
    aircraft,
    trajectory,
    config,
    panOffset,
    navData,
  ]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      id="flight-path-visualizer-root"
      className={`fixed z-40 transition-all duration-300 ${
        isExpanded
          ? 'inset-4 sm:inset-6 md:inset-10 bg-[#0A0C10]/95 backdrop-blur-xl border border-[#334155] rounded-2xl shadow-2xl flex flex-col overflow-hidden'
          : 'bottom-16 right-4 w-80 sm:w-96 h-72 sm:h-80 bg-[#0A0C10]/90 backdrop-blur-md border border-[#334155] rounded-xl shadow-2xl flex flex-col overflow-hidden'
      }`}
    >
      {/* MAP HEADER / TITLE BAR */}
      <div className="bg-[#0F172A] px-3 py-2 border-b border-[#1E293B] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#1E293B] text-[#38BDF8]">
            <Navigation className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white font-mono-avionics flex items-center gap-2">
              <span>{lang === 'pt' ? 'TRAJETÓRIA DE VOO & MAPA' : 'FLIGHT PATH & MOVING MAP'}</span>
              <span className="text-[10px] text-[#38BDF8] bg-[#0A0C10] px-1.5 py-0.5 rounded border border-[#334155]">
                {airport.icao}
              </span>
            </span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Orientation Mode Toggle (Track-Up / North-Up) */}
          <button
            id="btn-map-track-up"
            onClick={() => setConfig((prev) => ({ ...prev, trackUp: !prev.trackUp }))}
            className={`px-2 py-1 rounded text-[10px] font-mono-avionics font-bold border transition-colors cursor-pointer ${
              config.trackUp
                ? 'bg-[#1E293B] border-[#38BDF8] text-[#38BDF8]'
                : 'bg-[#0A0C10] border-[#334155] text-[#94A3B8] hover:text-white'
            }`}
            title="Toggle Track-Up / North-Up"
          >
            {config.trackUp ? 'TRK-UP' : 'NORTH-UP'}
          </button>

          {/* Layer Menu Toggle */}
          <button
            id="btn-map-layers"
            onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
            className="p-1 rounded bg-[#0A0C10] hover:bg-[#1E293B] border border-[#334155] text-[#94A3B8] hover:text-white cursor-pointer transition-colors"
            title="Map Layers"
          >
            <Layers className="h-3.5 w-3.5" />
          </button>

          {/* Recenter Button */}
          <button
            id="btn-map-recenter"
            onClick={handleRecenter}
            className="p-1 rounded bg-[#0A0C10] hover:bg-[#1E293B] border border-[#334155] text-[#94A3B8] hover:text-white cursor-pointer transition-colors"
            title="Center on Aircraft"
          >
            <Locate className="h-3.5 w-3.5" />
          </button>

          {/* Expand / Minimize Toggle */}
          <button
            id="btn-map-expand-toggle"
            onClick={onToggleExpand}
            className="p-1 rounded bg-[#0A0C10] hover:bg-[#1E293B] border border-[#334155] text-[#94A3B8] hover:text-white cursor-pointer transition-colors"
            title={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>

          {/* Close Button */}
          <button
            id="btn-map-close"
            onClick={onClose}
            className="p-1 rounded bg-[#0A0C10] hover:bg-red-950/60 border border-[#334155] hover:border-red-500/50 text-[#94A3B8] hover:text-red-300 cursor-pointer transition-colors"
            title="Close Map"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* LAYER SELECTION POPUP DRAWER */}
      {isLayerMenuOpen && (
        <div className="absolute top-10 right-2 z-50 bg-[#0F172A] border border-[#334155] p-3 rounded-xl shadow-2xl text-xs space-y-2 w-56">
          <div className="font-bold text-[#38BDF8] font-mono-avionics text-[10px] uppercase tracking-wider border-b border-[#1E293B] pb-1">
            {lang === 'pt' ? 'Camadas do Mapa' : 'Map Layers'}
          </div>

          <label className="flex items-center justify-between text-[#E2E8F0] cursor-pointer hover:text-white">
            <span className="flex items-center gap-2">
              <Mountain className="h-3.5 w-3.5 text-[#22C55E]" />
              <span>{lang === 'pt' ? 'Topografia & Relevo' : 'Terrain Contours'}</span>
            </span>
            <input
              type="checkbox"
              checked={config.showTerrainShading}
              onChange={(e) => setConfig((prev) => ({ ...prev, showTerrainShading: e.target.checked }))}
              className="accent-[#38BDF8]"
            />
          </label>

          <label className="flex items-center justify-between text-[#E2E8F0] cursor-pointer hover:text-white">
            <span className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-[#38BDF8]" />
              <span>{lang === 'pt' ? 'Waypoints & VORs' : 'Waypoints & VORs'}</span>
            </span>
            <input
              type="checkbox"
              checked={config.showWaypoints}
              onChange={(e) => setConfig((prev) => ({ ...prev, showWaypoints: e.target.checked }))}
              className="accent-[#38BDF8]"
            />
          </label>

          <label className="flex items-center justify-between text-[#E2E8F0] cursor-pointer hover:text-white">
            <span className="flex items-center gap-2">
              <Navigation className="h-3.5 w-3.5 text-[#FCD34D]" />
              <span>{lang === 'pt' ? 'Funil ILS & Pistas' : 'ILS Approach Funnel'}</span>
            </span>
            <input
              type="checkbox"
              checked={config.showIlsApproach}
              onChange={(e) => setConfig((prev) => ({ ...prev, showIlsApproach: e.target.checked }))}
              className="accent-[#38BDF8]"
            />
          </label>

          <label className="flex items-center justify-between text-[#E2E8F0] cursor-pointer hover:text-white">
            <span className="flex items-center gap-2">
              <CloudRain className="h-3.5 w-3.5 text-cyan-400" />
              <span>{lang === 'pt' ? 'Radar Meteorológico' : 'Weather Radar'}</span>
            </span>
            <input
              type="checkbox"
              checked={config.showWeatherRadar}
              onChange={(e) => setConfig((prev) => ({ ...prev, showWeatherRadar: e.target.checked }))}
              className="accent-[#38BDF8]"
            />
          </label>

          <label className="flex items-center justify-between text-[#E2E8F0] cursor-pointer hover:text-white">
            <span className="flex items-center gap-2">
              <Gauge className="h-3.5 w-3.5 text-purple-400" />
              <span>{lang === 'pt' ? 'Gradiente de Altitude' : 'Altitude Heatmap'}</span>
            </span>
            <input
              type="checkbox"
              checked={config.showAltitudeHeatmap}
              onChange={(e) => setConfig((prev) => ({ ...prev, showAltitudeHeatmap: e.target.checked }))}
              className="accent-[#38BDF8]"
            />
          </label>
        </div>
      )}

      {/* INTERACTIVE CANVAS MAP STAGE */}
      <div className="relative flex-1 bg-[#060B12] overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full h-full block touch-none"
        />

        {/* FLOATING ZOOM CONTROLS (Top Left Overlay) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
          <button
            id="btn-map-zoom-in"
            onClick={() => setConfig((prev) => ({ ...prev, zoomLevel: Math.max(2, prev.zoomLevel - 2) }))}
            className="p-1.5 rounded-lg bg-[#0F172A]/90 hover:bg-[#1E293B] border border-[#334155] text-white cursor-pointer shadow transition-colors"
            title="Zoom In (+)"
          >
            <ZoomIn className="h-3.5 w-3.5 text-[#38BDF8]" />
          </button>
          <button
            id="btn-map-zoom-out"
            onClick={() => setConfig((prev) => ({ ...prev, zoomLevel: Math.min(60, prev.zoomLevel + 2) }))}
            className="p-1.5 rounded-lg bg-[#0F172A]/90 hover:bg-[#1E293B] border border-[#334155] text-white cursor-pointer shadow transition-colors"
            title="Zoom Out (-)"
          >
            <ZoomOut className="h-3.5 w-3.5 text-[#38BDF8]" />
          </button>
        </div>

        {/* ALTITUDE COLOR KEY BAR (Bottom Right) */}
        {config.showAltitudeHeatmap && (
          <div className="absolute bottom-2 right-2 bg-[#0F172A]/90 backdrop-blur-md px-2 py-1.5 rounded-lg border border-[#334155] text-[9px] font-mono-avionics flex items-center gap-2 z-20">
            <span className="text-[#64748B]">ALT:</span>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
              <span className="text-[#94A3B8]">&lt;1k</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#38BDF8]"></span>
              <span className="text-[#94A3B8]">2.5k</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#FCD34D]"></span>
              <span className="text-[#94A3B8]">5k</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#C084FC]"></span>
              <span className="text-[#94A3B8]">10k+</span>
            </div>
          </div>
        )}
      </div>

      {/* TELEMETRY & NAVIGATION STRIP (Bottom Footer) */}
      <div className="bg-[#0F172A] p-2.5 border-t border-[#1E293B] shrink-0 text-xs font-mono-avionics text-[#94A3B8]">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {/* GPS Coordinates */}
          <div
            onClick={handleCopyCoords}
            className="flex flex-col bg-[#0A0C10] p-1.5 rounded border border-[#1E293B] cursor-pointer hover:border-[#38BDF8] transition-colors"
            title="Click to copy GPS coordinates"
          >
            <span className="text-[9px] text-[#64748B] uppercase">GPS POS {copyFeedback ? '✓ COPIED' : ''}</span>
            <span className="text-white font-bold truncate">
              {currentCoords.lat.toFixed(4)}°, {currentCoords.lon.toFixed(4)}°
            </span>
          </div>

          {/* Total Track Distance */}
          <div className="flex flex-col bg-[#0A0C10] p-1.5 rounded border border-[#1E293B]">
            <span className="text-[9px] text-[#64748B] uppercase">DIST FLOWN</span>
            <span className="text-[#38BDF8] font-bold">
              {totalDistanceNm} NM <span className="text-[10px] text-[#64748B]">({Math.round(totalDistanceNm * 1.852)} km)</span>
            </span>
          </div>

          {/* Distance to Threshold */}
          <div className="flex flex-col bg-[#0A0C10] p-1.5 rounded border border-[#1E293B]">
            <span className="text-[9px] text-[#64748B] uppercase">DME RWY</span>
            <span className="text-[#FCD34D] font-bold">
              {navBearingDistance.distNm} NM
            </span>
          </div>

          {/* Bearing to Runway */}
          <div className="flex flex-col bg-[#0A0C10] p-1.5 rounded border border-[#1E293B]">
            <span className="text-[9px] text-[#64748B] uppercase">BEARING (BRG)</span>
            <span className="text-[#22C55E] font-bold">
              {navBearingDistance.bearingDeg.toString().padStart(3, '0')}°
            </span>
          </div>

          {/* Heading & Groundspeed */}
          <div className="hidden sm:flex flex-col bg-[#0A0C10] p-1.5 rounded border border-[#1E293B]">
            <span className="text-[9px] text-[#64748B] uppercase">HDG / GS</span>
            <span className="text-white font-bold">
              {Math.round(telemetry.heading)}° / {Math.round(telemetry.groundSpeed)} KTS
            </span>
          </div>

          {/* Clear & Export Trajectory Action */}
          <div className="flex items-center gap-1">
            <button
              id="btn-map-clear-trail"
              onClick={onClearTrajectory}
              className="flex-1 py-2 px-1.5 bg-[#0A0C10] hover:bg-red-950/40 border border-[#334155] hover:border-red-500/40 rounded text-[10px] font-bold text-[#94A3B8] hover:text-red-300 flex items-center justify-center gap-1 cursor-pointer transition-colors"
              title="Clear Recorded Trail"
            >
              <Trash2 className="h-3 w-3" />
              <span>CLEAR</span>
            </button>
            <button
              id="btn-map-export-geojson"
              onClick={handleExportTrajectory}
              className="flex-1 py-2 px-1.5 bg-[#0A0C10] hover:bg-[#1E293B] border border-[#334155] hover:border-[#38BDF8] rounded text-[10px] font-bold text-[#38BDF8] flex items-center justify-center gap-1 cursor-pointer transition-colors"
              title="Export GeoJSON / Trajectory"
            >
              <Download className="h-3 w-3" />
              <span>EXPORT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
