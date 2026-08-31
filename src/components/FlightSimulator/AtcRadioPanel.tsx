import React, { useState, useEffect, useRef } from 'react';
import {
  AtcRadioState,
  AtcTransmission,
  FlightTelemetry,
  AircraftSpecs,
  AirportInfo,
  DynamicWeatherConfig,
  SupportedLanguage,
} from '../../types';
import { atcService } from '../../services/atcService';
import {
  Radio,
  Volume2,
  VolumeX,
  Mic,
  Headphones,
  RotateCw,
  Send,
  Play,
  Trash2,
  X,
  Maximize2,
  Minimize2,
  RadioTower,
  PlaneTakeoff,
  PlaneLanding,
  Compass,
  CloudSun,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface AtcRadioPanelProps {
  telemetry: FlightTelemetry;
  aircraft: AircraftSpecs;
  airport: AirportInfo;
  weather: DynamicWeatherConfig;
  lang: SupportedLanguage;
  isOpen: boolean;
  onClose: () => void;
}

export const AtcRadioPanel: React.FC<AtcRadioPanelProps> = ({
  telemetry,
  aircraft,
  airport,
  weather,
  lang,
  isOpen,
  onClose,
}) => {
  const [atcState, setAtcState] = useState<AtcRadioState>(atcService.getState());
  const [messages, setMessages] = useState<AtcTransmission[]>(atcService.getMessages());
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedQuickFreq, setSelectedQuickFreq] = useState<string>('TWR');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Subscribe to simulated ATC engine updates
  useEffect(() => {
    const unsubscribe = atcService.subscribe((state, msgs) => {
      setAtcState(state);
      setMessages(msgs);
    });
    return unsubscribe;
  }, []);

  // Update telemetry continuously for flight phase triggers
  useEffect(() => {
    atcService.updateFlightTelemetry(telemetry, aircraft, airport, weather, lang);
  }, [telemetry, aircraft, airport, weather, lang]);

  // Auto scroll chat to top/latest
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = 0;
    }
  }, [messages.length]);

  if (!isOpen) return null;

  const isPt = lang === 'pt';

  // Frequency presets for active airport
  const freqPresets = [
    { label: 'GND', freq: (airport.groundFreq || 121.80).toFixed(2), name: 'Ground' },
    { label: 'TWR', freq: (airport.towerFreq || 118.40).toFixed(2), name: 'Tower' },
    { label: 'APP', freq: '125.75', name: 'Approach' },
    { label: 'CTR', freq: '132.50', name: 'Radar Center' },
    { label: 'ATIS', freq: (airport.atisFreq || 127.15).toFixed(2), name: 'ATIS Weather' },
  ];

  const handleTuneFreq = (freq: string, label: string) => {
    setSelectedQuickFreq(label);
    atcService.setFrequency(freq);
  };

  const formatPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'preflight':
        return isPt ? 'ESTACIONAMENTO / RAMPA' : 'PREFLIGHT / RAMP';
      case 'taxi':
        return isPt ? 'TÁXI PARA PISTA' : 'TAXIING';
      case 'lineup_and_wait':
        return isPt ? 'ALINHAR E MANTER' : 'LINE UP & WAIT';
      case 'takeoff_roll':
        return isPt ? 'CORRIDA DE DECOLAGEM' : 'TAKEOFF ROLL';
      case 'initial_climb':
        return isPt ? 'SUBIDA INICIAL' : 'INITIAL CLIMB';
      case 'en_route_cruise':
        return isPt ? 'CRUZEIRO EM ROTA' : 'EN ROUTE CRUISE';
      case 'descent_approach':
        return isPt ? 'DESCIDA & APROXIMAÇÃO' : 'DESCENT & VECTORS';
      case 'final_approach':
        return isPt ? 'APROXIMAÇÃO FINAL' : 'FINAL APPROACH';
      case 'short_final':
        return isPt ? 'RETA FINAL' : 'SHORT FINAL';
      case 'touchdown_rollout':
        return isPt ? 'POUSO / CORRIDA NA PISTA' : 'TOUCHDOWN ROLLOUT';
      case 'go_around':
        return isPt ? 'ARREMETIDA / MISSED APP' : 'MISSED APPROACH';
      case 'emergency':
        return isPt ? 'ALERTA DE EMERGÊNCIA' : 'SAFETY ALERT';
      default:
        return phase.toUpperCase();
    }
  };

  return (
    <div
      id="atc-radio-panel-root"
      className={`fixed z-40 transition-all duration-300 ${
        isExpanded
          ? 'inset-4 sm:inset-8 md:inset-12 bg-[#0A0C10]/95 backdrop-blur-xl border border-[#334155] rounded-2xl shadow-2xl flex flex-col overflow-hidden'
          : 'bottom-16 left-4 w-80 sm:w-[420px] h-[460px] bg-[#0A0C10]/90 backdrop-blur-md border border-[#334155] rounded-xl shadow-2xl flex flex-col overflow-hidden'
      }`}
    >
      {/* 1. TOP HEADER / TITLE BAR */}
      <div className="bg-[#0F172A] px-3.5 py-2.5 border-b border-[#1E293B] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#1E293B] text-[#38BDF8]">
            <RadioTower className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white font-mono-avionics">
                {isPt ? 'CONTROLE DE TRÁFEGO AÉREO (ATC)' : 'AIR TRAFFIC CONTROL (ATC)'}
              </span>
              <span className="text-[10px] text-[#38BDF8] bg-[#0A0C10] px-1.5 py-0.2 rounded border border-[#334155] font-mono-avionics font-bold">
                {airport.icao}
              </span>
            </div>
            <div className="text-[10px] text-[#94A3B8] font-mono-avionics flex items-center gap-2">
              <span>{airport.name}</span>
              <span>•</span>
              <span className="text-[#22C55E] font-bold">{formatPhaseLabel(atcState.currentPhase)}</span>
            </div>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-1.5">
          {/* Radio RX / TX Status Indicators */}
          {atcState.isReceiving && (
            <span className="animate-pulse px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500 text-[9px] font-mono-avionics font-bold text-emerald-400">
              RX
            </span>
          )}
          {atcState.isTransmitting && (
            <span className="animate-pulse px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500 text-[9px] font-mono-avionics font-bold text-amber-400">
              TX
            </span>
          )}

          {/* Auto Speak TTS Toggle */}
          <button
            id="btn-atc-auto-tts-toggle"
            onClick={() => atcService.setAutoSpeak(!atcState.autoSpeak)}
            className={`p-1.5 rounded text-[10px] font-mono-avionics border transition-colors cursor-pointer ${
              atcState.autoSpeak
                ? 'bg-[#1E293B] border-[#38BDF8] text-[#38BDF8]'
                : 'bg-[#0A0C10] border-[#334155] text-[#64748B]'
            }`}
            title="Auto Audio Voice (TTS)"
          >
            <Headphones className="h-3.5 w-3.5" />
          </button>

          {/* Mute Radio */}
          <button
            id="btn-atc-mute-toggle"
            onClick={() => atcService.toggleMute()}
            className={`p-1.5 rounded text-[10px] font-mono-avionics border transition-colors cursor-pointer ${
              atcState.isMuted
                ? 'bg-red-950/60 border-red-500/50 text-red-400'
                : 'bg-[#0A0C10] border-[#334155] text-[#94A3B8] hover:text-white'
            }`}
            title={atcState.isMuted ? 'Unmute Radio' : 'Mute Radio'}
          >
            {atcState.isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>

          {/* Expand / Minimize */}
          <button
            id="btn-atc-expand-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded bg-[#0A0C10] hover:bg-[#1E293B] border border-[#334155] text-[#94A3B8] hover:text-white cursor-pointer transition-colors"
            title={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>

          {/* Close */}
          <button
            id="btn-atc-close"
            onClick={onClose}
            className="p-1.5 rounded bg-[#0A0C10] hover:bg-red-950/60 border border-[#334155] hover:border-red-500/50 text-[#94A3B8] hover:text-red-300 cursor-pointer transition-colors"
            title="Close ATC Panel"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 2. AVIONICS COM1 / COM2 RADIO HEAD UNIT */}
      <div className="bg-[#060B12] p-3 border-b border-[#1E293B] shrink-0">
        <div className="flex items-center justify-between gap-2">
          {/* Active Frequency (Large LED Display) */}
          <div className="flex-1 bg-[#030712] p-2 rounded-lg border border-[#1E293B] flex items-center justify-between">
            <div>
              <span className="text-[9px] text-[#64748B] font-mono-avionics block">COM1 ACTIVE</span>
              <span className="text-xl font-bold font-mono text-[#22C55E] tracking-wider">
                {atcState.activeComFreq}
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#38BDF8] bg-[#0F172A] px-2 py-1 rounded border border-[#1E293B]">
              {atcState.facility}
            </span>
          </div>

          {/* Frequency Transfer / Swap Button */}
          <button
            id="btn-atc-freq-swap"
            onClick={() => atcService.swapFrequencies()}
            className="p-2.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-[#334155] hover:border-[#38BDF8] text-[#38BDF8] cursor-pointer transition-colors"
            title="Swap Active / Standby Frequency (⇄)"
          >
            <RotateCw className="h-4 w-4" />
          </button>

          {/* Standby Frequency */}
          <div className="flex-1 bg-[#030712] p-2 rounded-lg border border-[#1E293B] flex items-center justify-between">
            <div>
              <span className="text-[9px] text-[#64748B] font-mono-avionics block">COM1 STBY</span>
              <span className="text-xl font-bold font-mono text-[#38BDF8]/80 tracking-wider">
                {atcState.standbyComFreq}
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#64748B] bg-[#0F172A] px-2 py-1 rounded border border-[#1E293B]">
              STBY
            </span>
          </div>
        </div>

        {/* Quick Channel Presets */}
        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-0.5">
          <span className="text-[9px] text-[#64748B] font-mono-avionics uppercase mr-1">TUNE:</span>
          {freqPresets.map((preset) => (
            <button
              key={preset.label}
              id={`btn-tune-${preset.label.toLowerCase()}`}
              onClick={() => handleTuneFreq(preset.freq, preset.label)}
              className={`px-2 py-1 rounded text-[10px] font-mono-avionics font-bold border transition-colors cursor-pointer shrink-0 ${
                atcState.activeComFreq === preset.freq
                  ? 'bg-[#1E293B] border-[#38BDF8] text-[#38BDF8]'
                  : 'bg-[#0F172A] border-[#1E293B] text-[#94A3B8] hover:text-white hover:border-[#334155]'
              }`}
              title={`${preset.name} (${preset.freq} MHz)`}
            >
              {preset.label} <span className="text-[9px] text-[#64748B]">{preset.freq}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. INTERACTIVE PILOT TRANSMISSION BUTTONS */}
      <div className="bg-[#0F172A] p-2.5 border-b border-[#1E293B] shrink-0">
        <div className="text-[10px] text-[#64748B] font-mono-avionics uppercase font-bold mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Mic className="h-3 w-3 text-[#38BDF8]" />
            <span>{isPt ? 'TRANSMISSÕES DO PILOTO (PTT)' : 'PILOT TRANSMISSIONS (PTT)'}</span>
          </span>
          <span className="text-[#38BDF8] text-[9px]">{aircraft.registration}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {/* Request Takeoff */}
          <button
            id="btn-pilot-req-takeoff"
            onClick={() => atcService.pilotRequestTakeoff(aircraft, airport, lang)}
            className="p-1.5 bg-[#0A0C10] hover:bg-[#1E293B] border border-[#1E293B] hover:border-[#22C55E] rounded-lg text-left cursor-pointer transition-colors group flex items-center gap-2"
          >
            <PlaneTakeoff className="h-3.5 w-3.5 text-[#22C55E] shrink-0" />
            <div className="truncate">
              <div className="text-[10px] font-bold text-white group-hover:text-[#22C55E] truncate">
                {isPt ? 'Pedir Decolagem' : 'Req Takeoff'}
              </div>
              <div className="text-[8px] text-[#64748B] truncate">
                {isPt ? `Pista ${airport.runways[0]?.ident || '10L'}` : `Rwy ${airport.runways[0]?.ident || '10L'}`}
              </div>
            </div>
          </button>

          {/* Request Landing */}
          <button
            id="btn-pilot-req-landing"
            onClick={() => atcService.pilotRequestLanding(aircraft, airport, lang)}
            className="p-1.5 bg-[#0A0C10] hover:bg-[#1E293B] border border-[#1E293B] hover:border-[#38BDF8] rounded-lg text-left cursor-pointer transition-colors group flex items-center gap-2"
          >
            <PlaneLanding className="h-3.5 w-3.5 text-[#38BDF8] shrink-0" />
            <div className="truncate">
              <div className="text-[10px] font-bold text-white group-hover:text-[#38BDF8] truncate">
                {isPt ? 'Pedir Pouso' : 'Req Landing'}
              </div>
              <div className="text-[8px] text-[#64748B] truncate">
                {isPt ? 'Final de aproximação' : 'Final approach'}
              </div>
            </div>
          </button>

          {/* Radar Vectors / Flight Following */}
          <button
            id="btn-pilot-req-vectors"
            onClick={() => atcService.pilotRequestRadarVectors(aircraft, airport, lang)}
            className="p-1.5 bg-[#0A0C10] hover:bg-[#1E293B] border border-[#1E293B] hover:border-[#FCD34D] rounded-lg text-left cursor-pointer transition-colors group flex items-center gap-2"
          >
            <Compass className="h-3.5 w-3.5 text-[#FCD34D] shrink-0" />
            <div className="truncate">
              <div className="text-[10px] font-bold text-white group-hover:text-[#FCD34D] truncate">
                {isPt ? 'Vetores Radar' : 'Radar Vectors'}
              </div>
              <div className="text-[8px] text-[#64748B] truncate">
                {isPt ? 'Proa & Altitude' : 'Heading & Alt'}
              </div>
            </div>
          </button>

          {/* ATIS Weather */}
          <button
            id="btn-pilot-req-atis"
            onClick={() => atcService.pilotRequestAtis(airport, weather, lang)}
            className="p-1.5 bg-[#0A0C10] hover:bg-[#1E293B] border border-[#1E293B] hover:border-cyan-400 rounded-lg text-left cursor-pointer transition-colors group flex items-center gap-2"
          >
            <CloudSun className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <div className="truncate">
              <div className="text-[10px] font-bold text-white group-hover:text-cyan-400 truncate">
                {isPt ? 'Boletim ATIS' : 'Listen ATIS'}
              </div>
              <div className="text-[8px] text-[#64748B] truncate">
                {weather.windDirectionDeg}° / {weather.windSpeedKts} kts
              </div>
            </div>
          </button>

          {/* Declare Go-Around / Missed Approach */}
          <button
            id="btn-pilot-req-go-around"
            onClick={() => atcService.pilotDeclareMissedApproach(aircraft, airport, lang)}
            className="p-1.5 bg-[#0A0C10] hover:bg-amber-950/40 border border-[#1E293B] hover:border-amber-500 rounded-lg text-left cursor-pointer transition-colors group flex items-center gap-2"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <div className="truncate">
              <div className="text-[10px] font-bold text-white group-hover:text-amber-400 truncate">
                {isPt ? 'Arremeter (Go-Around)' : 'Missed App'}
              </div>
              <div className="text-[8px] text-[#64748B] truncate">
                {isPt ? 'Subir para 3.000ft' : 'Climb to 3,000ft'}
              </div>
            </div>
          </button>

          {/* Pilot Readback / Wilco */}
          <button
            id="btn-pilot-readback"
            onClick={() => atcService.pilotReadback(aircraft, lang)}
            className="p-1.5 bg-[#0A0C10] hover:bg-emerald-950/40 border border-[#1E293B] hover:border-emerald-500 rounded-lg text-left cursor-pointer transition-colors group flex items-center gap-2"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <div className="truncate">
              <div className="text-[10px] font-bold text-white group-hover:text-emerald-400 truncate">
                {isPt ? 'Colação (Roger / Ciente)' : 'Readback (Wilco)'}
              </div>
              <div className="text-[8px] text-[#64748B] truncate">
                {isPt ? 'Confirmar instrução' : 'Acknowledge order'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 4. LIVE RADIO TRANSCRIPT & CALLOUT FEED */}
      <div
        ref={chatScrollRef}
        className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-[#060B12] text-xs font-mono-avionics"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[#64748B] text-center p-4">
            <Radio className="h-8 w-8 mb-2 opacity-30 animate-pulse text-[#38BDF8]" />
            <p className="text-xs">
              {isPt
                ? 'Rádio COM1 sintonizado. Transmissões do controle aparecerão aqui automaticamente conforme você voa.'
                : 'COM1 Radio tuned. ATC transmissions and pilot communications will stream live as you fly.'}
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isPilot = msg.sender === 'PILOT';
            const isAtis = msg.sender === 'ATIS';
            const isAlert = msg.phase === 'emergency';

            return (
              <div
                key={msg.id}
                className={`p-2.5 rounded-xl border transition-all ${
                  isPilot
                    ? 'bg-[#0F172A]/90 border-[#334155] ml-4'
                    : isAlert
                    ? 'bg-red-950/40 border-red-500 mr-4'
                    : isAtis
                    ? 'bg-amber-950/20 border-amber-500/40 mr-4'
                    : 'bg-[#0B1528] border-[#1E3A5F] mr-4'
                }`}
              >
                {/* Transmission Header */}
                <div className="flex items-center justify-between mb-1 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                        isPilot
                          ? 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40'
                          : isAlert
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : isAtis
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {msg.sender}
                    </span>
                    <span className="text-[#64748B]">{msg.frequency} MHz</span>
                    <span className="text-[#475569]">•</span>
                    <span className="text-[#94A3B8]">{msg.facilityName}</span>
                  </div>

                  {/* Replay Audio Button */}
                  <button
                    id={`btn-replay-atc-${msg.id}`}
                    onClick={() => atcService.replayTransmission(msg.id, lang)}
                    className="p-1 rounded hover:bg-[#1E293B] text-[#64748B] hover:text-[#38BDF8] cursor-pointer transition-colors"
                    title="Replay Voice Audio"
                  >
                    <Play className="h-3 w-3" />
                  </button>
                </div>

                {/* Message Body */}
                <p className="text-[#E2E8F0] leading-relaxed text-[11px] font-sans">
                  {msg.text}
                </p>

                {/* Timestamp & Phase */}
                <div className="flex items-center justify-between mt-1 text-[9px] text-[#64748B]">
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  <span className="uppercase text-[#475569]">{msg.phase.replace('_', ' ')}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. FOOTER STATUS BAR */}
      <div className="bg-[#0F172A] px-3 py-2 border-t border-[#1E293B] flex items-center justify-between shrink-0 text-[10px] font-mono-avionics text-[#64748B]">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
            <span className="text-[#94A3B8]">VHF 118.00-136.975 MHz</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-atc-clear-history"
            onClick={() => atcService.clearHistory()}
            className="hover:text-red-400 flex items-center gap-1 cursor-pointer transition-colors"
            title="Clear Message Log"
          >
            <Trash2 className="h-3 w-3" />
            <span>{isPt ? 'Limpar Log' : 'Clear Log'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
