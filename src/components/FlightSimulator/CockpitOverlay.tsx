import React from 'react';
import { FlightTelemetry, AircraftSpecs, SupportedLanguage } from '../../types';
import { translations } from '../../i18n/translations';
import { Gauge, Compass, Activity, Navigation, Radio, AlertTriangle, ShieldCheck, Flame, Disc3 } from 'lucide-react';

interface CockpitOverlayProps {
  telemetry: FlightTelemetry;
  aircraft: AircraftSpecs;
  lang: SupportedLanguage;
  onControlChange: (key: keyof FlightTelemetry, value: any) => void;
  onThrottleChange: (val: number) => void;
  onFlapsToggle: () => void;
  onGearToggle: () => void;
  onBrakesToggle: () => void;
}

export const CockpitOverlay: React.FC<CockpitOverlayProps> = ({
  telemetry,
  aircraft,
  lang,
  onControlChange,
  onThrottleChange,
  onFlapsToggle,
  onGearToggle,
  onBrakesToggle,
}) => {
  const t = translations[lang].simulator;

  // Pitch ladder angle calculation
  const pitchOffsetPx = -telemetry.pitch * 3.5;
  const rollDeg = -telemetry.roll;

  return (
    <div id="cockpit-overlay-root" className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 select-none">
      {/* TOP BAR: Primary Navigation & System Status */}
      <div className="flex items-center justify-between pointer-events-auto">
        {/* Left: Aircraft & Transponder */}
        <div className="bg-[#0F172A]/90 backdrop-blur-md border border-[#334155] rounded-xl px-4 py-2 flex items-center gap-4 text-xs font-mono-avionics text-[#94A3B8] shadow-lg">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse"></span>
            <span className="font-semibold text-white font-serif-display">{aircraft.name}</span>
            <span className="text-[#38BDF8] bg-[#0A0C10] px-1.5 py-0.5 rounded border border-[#334155]">
              {aircraft.registration}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[#64748B] border-l border-[#334155] pl-3">
            <span>XPDR: <strong className="text-[#FCD34D]">1200</strong></span>
            <span>COM1: <strong className="text-[#22C55E]">118.40</strong></span>
            <span>NAV1: <strong className="text-[#38BDF8]">{telemetry.nav1Freq.toFixed(2)}</strong></span>
          </div>
        </div>

        {/* Center: Live Warnings & Alerts */}
        <div className="flex items-center gap-2">
          {telemetry.stallWarning && (
            <div className="bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 animate-bounce border-2 border-red-300 shadow-lg shadow-red-900/60 text-xs sm:text-sm font-mono-avionics">
              <AlertTriangle className="h-4 w-4" />
              <span>{t.stallWarning}</span>
            </div>
          )}
          {telemetry.terrainWarning && (
            <div className="bg-amber-600 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 animate-pulse text-xs sm:text-sm font-mono-avionics">
              <AlertTriangle className="h-4 w-4" />
              <span>{t.pullUpWarning}</span>
            </div>
          )}
          {telemetry.onGround && (
            <div className="bg-[#0A0C10]/90 text-[#22C55E] font-mono-avionics text-xs px-2.5 py-1 rounded-lg border border-[#22C55E]/40 font-bold">
              ON GROUND
            </div>
          )}
        </div>

        {/* Right: G-Force & Fuel */}
        <div className="bg-[#0F172A]/90 backdrop-blur-md border border-[#334155] rounded-xl px-4 py-2 flex items-center gap-4 text-xs font-mono-avionics text-[#94A3B8] shadow-lg">
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-[#38BDF8]" />
            <span>G-METER:</span>
            <strong className={`font-bold ${Math.abs(telemetry.gForce) > 2.5 ? 'text-red-400 font-bold' : 'text-white'}`}>
              {telemetry.gForce.toFixed(1)}G
            </strong>
          </div>
          <div className="flex items-center gap-1.5 border-l border-[#334155] pl-3">
            <Flame className="h-3.5 w-3.5 text-[#FCD34D]" />
            <span>FUEL:</span>
            <strong className="text-white">{telemetry.fuelPercent}%</strong>
          </div>
        </div>
      </div>

      {/* CENTER HUD: Primary Flight Display (PFD) Glass Horizon */}
      <div className="self-center relative flex items-center justify-center w-72 sm:w-96 h-56 pointer-events-none">
        {/* Pitch Ladder & Roll Arc Horizon */}
        <div className="relative w-64 h-48 rounded-xl overflow-hidden border border-[#334155] shadow-2xl flex items-center justify-center bg-[#0A0C10]">
          {/* Artificial Horizon Sky/Ground Split */}
          <div
            className="absolute w-96 h-96 transition-transform duration-75 ease-out"
            style={{
              transform: `rotate(${rollDeg}deg) translateY(${pitchOffsetPx}px)`,
            }}
          >
            {/* Sky (Blue) */}
            <div className="w-full h-48 bg-gradient-to-t from-sky-800/80 to-sky-950/90 border-b border-white/80" />
            {/* Ground (Brown/Dark) */}
            <div className="w-full h-48 bg-gradient-to-b from-amber-950/80 to-stone-950/90" />
            {/* Pitch Lines (-20°, -10°, 0°, +10°, +20°) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[10px] font-mono-avionics text-[#38BDF8] pointer-events-none">
              <div className="my-3 border-t border-[#38BDF8]/60 w-12 text-center">-20</div>
              <div className="my-3 border-t border-[#38BDF8]/60 w-8 text-center">-10</div>
              <div className="my-3 border-t-2 border-white w-20 text-center font-bold">0°</div>
              <div className="my-3 border-t border-[#38BDF8]/60 w-8 text-center">+10</div>
              <div className="my-3 border-t border-[#38BDF8]/60 w-12 text-center">+20</div>
            </div>
          </div>

          {/* Aircraft Fixed Reference Reticle */}
          <div className="absolute z-10 flex items-center justify-center pointer-events-none">
            <div className="w-6 h-0.5 bg-[#FCD34D] shadow-sm" />
            <div className="w-2.5 h-2.5 border-2 border-[#FCD34D] rounded-full mx-1" />
            <div className="w-6 h-0.5 bg-[#FCD34D] shadow-sm" />
          </div>

          {/* Airspeed Tape (Left) */}
          <div className="absolute left-1 top-2 bottom-2 w-14 bg-[#0A0C10]/85 border-r border-[#334155] flex flex-col justify-center items-center font-mono-avionics text-xs text-[#38BDF8] z-10">
            <span className="text-[9px] text-[#64748B] font-sans">IAS (KTS)</span>
            <span className="text-base font-bold text-white my-1">
              {Math.round(telemetry.indicatedAirspeed)}
            </span>
            <div className="text-[10px] text-[#94A3B8]">GS {Math.round(telemetry.groundSpeed)}</div>
          </div>

          {/* Altitude Tape (Right) */}
          <div className="absolute right-1 top-2 bottom-2 w-14 bg-[#0A0C10]/85 border-l border-[#334155] flex flex-col justify-center items-center font-mono-avionics text-xs text-[#38BDF8] z-10">
            <span className="text-[9px] text-[#64748B] font-sans">ALT (FT)</span>
            <span className="text-base font-bold text-white my-1">
              {telemetry.altitude}
            </span>
            <div className="text-[10px] text-[#22C55E]">
              {telemetry.verticalSpeed >= 0 ? `+${telemetry.verticalSpeed}` : telemetry.verticalSpeed}
            </div>
          </div>

          {/* Heading Rose (Bottom) */}
          <div className="absolute bottom-1 bg-[#0A0C10] px-2 py-0.5 rounded text-[11px] font-mono-avionics font-bold text-[#FCD34D] border border-[#334155] z-10">
            HDG {Math.round(telemetry.heading).toString().padStart(3, '0')}°
          </div>

          {/* ILS Localizer and Glideslope Indicators */}
          {telemetry.dmeDistanceNm < 15 && (
            <>
              {/* Localizer diamond */}
              <div
                className="absolute bottom-6 w-2.5 h-2.5 bg-[#38BDF8] border border-white rotate-45 z-20 transition-all duration-100"
                style={{
                  left: `calc(50% + ${telemetry.ilsLocalizerDev * 60}px - 5px)`,
                }}
              />
              {/* Glideslope diamond */}
              <div
                className="absolute right-16 w-2.5 h-2.5 bg-[#38BDF8] border border-white rotate-45 z-20 transition-all duration-100"
                style={{
                  top: `calc(50% - ${telemetry.ilsGlideslopeDev * 45}px - 5px)`,
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* BOTTOM CONTROLS BAR: Interactive Levers, Flaps, Trims, and Switches */}
      <div className="bg-[#0F172A]/90 backdrop-blur-md border border-[#334155] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 pointer-events-auto max-w-5xl mx-auto w-full shadow-2xl">
        {/* Throttle Lever Slider */}
        <div className="flex items-center gap-2 bg-[#0A0C10] px-3 py-2 rounded-xl border border-[#334155]">
          <Gauge className="h-4 w-4 text-[#FCD34D] shrink-0" />
          <div className="flex flex-col">
            <div className="flex justify-between text-[11px] font-mono-avionics text-[#94A3B8] mb-1">
              <span>{t.throttle}</span>
              <strong className="text-[#FCD34D]">{Math.round(telemetry.throttle * 100)}%</strong>
            </div>
            <input
              id="throttle-slider"
              type="range"
              min="0"
              max="100"
              value={Math.round(telemetry.throttle * 100)}
              onChange={(e) => onThrottleChange(Number(e.target.value) / 100)}
              className="w-28 sm:w-36 h-2 bg-[#1E293B] rounded-lg appearance-none cursor-pointer accent-[#FCD34D]"
            />
          </div>
        </div>

        {/* Flaps Control Button */}
        <button
          id="btn-flaps-toggle"
          onClick={onFlapsToggle}
          className="flex flex-col items-center justify-center bg-[#0A0C10] hover:bg-[#1E293B] border border-[#334155] px-3 py-1.5 rounded-xl transition-all cursor-pointer min-w-[72px]"
        >
          <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-mono-avionics">{t.flaps}</span>
          <span className="text-xs font-bold text-[#38BDF8] font-mono-avionics">
            {telemetry.flaps === 0 ? '0° (UP)' : telemetry.flaps === 1 ? '10°' : telemetry.flaps === 2 ? '20°' : '30° (FULL)'}
          </span>
        </button>

        {/* Landing Gear Toggle */}
        <button
          id="btn-gear-toggle"
          onClick={onGearToggle}
          className={`flex flex-col items-center justify-center border px-3 py-1.5 rounded-xl transition-all cursor-pointer min-w-[72px] ${
            telemetry.landingGear
              ? 'bg-[#0A0C10] border-[#22C55E]/60 text-[#22C55E]'
              : 'bg-[#0A0C10] border-[#334155] text-[#64748B]'
          }`}
        >
          <span className="text-[10px] uppercase tracking-wider font-mono-avionics">{t.gear}</span>
          <span className="text-xs font-bold font-mono-avionics">
            {telemetry.landingGear ? 'DOWN 3-GREEN' : 'RETRACTED'}
          </span>
        </button>

        {/* Wheel & Parking Brakes */}
        <div className="flex items-center gap-1.5">
          <button
            id="btn-wheel-brakes"
            onMouseDown={() => onControlChange('wheelBrakes', true)}
            onMouseUp={() => onControlChange('wheelBrakes', false)}
            onTouchStart={() => onControlChange('wheelBrakes', true)}
            onTouchEnd={() => onControlChange('wheelBrakes', false)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer uppercase tracking-wider font-mono-avionics ${
              telemetry.wheelBrakes
                ? 'bg-red-600 border-red-400 text-white'
                : 'bg-[#0A0C10] border-[#334155] text-[#94A3B8] hover:bg-[#1E293B]'
            }`}
          >
            {t.brakes}
          </button>
          <button
            id="btn-park-brake"
            onClick={onBrakesToggle}
            className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer uppercase tracking-wider font-mono-avionics ${
              telemetry.parkingBrakes
                ? 'bg-[#0A0C10] border-[#FCD34D] text-[#FCD34D]'
                : 'bg-[#0A0C10] border-[#334155] text-[#64748B]'
            }`}
          >
            P-BRAKE
          </button>
        </div>

        {/* Elevator Trim Wheel */}
        <div className="flex items-center gap-1 bg-[#0A0C10] px-2.5 py-1.5 rounded-xl border border-[#334155] text-xs font-mono-avionics text-[#94A3B8]">
          <span className="text-[10px] text-[#64748B] mr-1 uppercase">{t.trim}:</span>
          <button
            id="btn-trim-dn"
            onClick={() => onControlChange('elevatorTrim', Math.max(-1, telemetry.elevatorTrim - 0.1))}
            className="px-2 py-0.5 bg-[#1E293B] hover:bg-[#334155] rounded border border-[#334155] text-[#E2E8F0] transition-colors"
          >
            DN
          </button>
          <span className="w-8 text-center text-[#38BDF8] font-bold">{(telemetry.elevatorTrim * 10).toFixed(0)}</span>
          <button
            id="btn-trim-up"
            onClick={() => onControlChange('elevatorTrim', Math.min(1, telemetry.elevatorTrim + 0.1))}
            className="px-2 py-0.5 bg-[#1E293B] hover:bg-[#334155] rounded border border-[#334155] text-[#E2E8F0] transition-colors"
          >
            UP
          </button>
        </div>

        {/* Master Avionics & Battery Switches */}
        <div className="hidden md:flex items-center gap-1.5">
          <button
            id="btn-battery"
            onClick={() => onControlChange('batteryOn', !telemetry.batteryOn)}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider font-mono-avionics transition-colors ${
              telemetry.batteryOn ? 'bg-[#0A0C10] text-[#22C55E] border-[#22C55E]/50' : 'bg-[#0A0C10] text-[#64748B] border-[#334155]'
            }`}
          >
            BAT MASTER
          </button>
          <button
            id="btn-avionics"
            onClick={() => onControlChange('avionicsOn', !telemetry.avionicsOn)}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider font-mono-avionics transition-colors ${
              telemetry.avionicsOn ? 'bg-[#0A0C10] text-[#38BDF8] border-[#38BDF8]/50' : 'bg-[#0A0C10] text-[#64748B] border-[#334155]'
            }`}
          >
            AVIONICS
          </button>
        </div>
      </div>
    </div>
  );
};
