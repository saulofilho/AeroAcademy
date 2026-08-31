import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  BlackBoxRecording,
  BlackBoxTelemetryFrame,
  BlackBoxFlightEvent,
  SupportedLanguage,
} from '../../types';
import { blackBoxRecorder } from '../../services/blackBoxRecorder';
import {
  HardDrive,
  Download,
  Upload,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Rewind,
  Activity,
  Sliders,
  Compass,
  AlertTriangle,
  FileCode,
  Layers,
  Clock,
  Gauge,
  X,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Flame,
  Radio,
  Share2,
} from 'lucide-react';

interface BlackBoxAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: SupportedLanguage;
}

export const BlackBoxAnalysisModal: React.FC<BlackBoxAnalysisModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [recording, setRecording] = useState<BlackBoxRecording | null>(blackBoxRecorder.getRecording());
  const [isLiveRecording, setIsLiveRecording] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'telemetry' | 'controls' | 'events' | 'raw_json'>('telemetry');
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const playTimerRef = useRef<number | null>(null);

  // Subscribe to Black Box Recorder updates
  useEffect(() => {
    const unsubscribe = blackBoxRecorder.subscribe((rec, isRec) => {
      setRecording(rec);
      setIsLiveRecording(isRec);
      if (isRec && rec && !isPlaying && activeTab !== 'events') {
        // Track live latest frame when not playing historical replay
        setSelectedFrameIndex(Math.max(0, rec.frames.length - 1));
      }
    });
    return unsubscribe;
  }, [isPlaying, activeTab]);

  // Handle Playback Loop
  useEffect(() => {
    if (isPlaying && recording && recording.frames.length > 0) {
      const stepInterval = Math.max(20, Math.floor(100 / playbackSpeed));
      playTimerRef.current = window.setInterval(() => {
        setSelectedFrameIndex((prev) => {
          if (prev >= recording.frames.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, stepInterval);
    } else {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
        playTimerRef.current = null;
      }
    }

    return () => {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
        playTimerRef.current = null;
      }
    };
  }, [isPlaying, playbackSpeed, recording]);

  if (!isOpen) return null;

  const isPt = lang === 'pt';
  const frames = recording?.frames || [];
  const events = recording?.events || [];
  const currentFrame: BlackBoxTelemetryFrame | undefined = frames[selectedFrameIndex] || frames[frames.length - 1];

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${tenths}`;
  };

  const handleExportJson = () => {
    const result = blackBoxRecorder.exportToJson();
    if (result.success) {
      setExportFeedback(
        isPt
          ? `Arquivo exportado: ${result.filename} (${result.sizeKb} KB)`
          : `Exported: ${result.filename} (${result.sizeKb} KB)`
      );
      setTimeout(() => setExportFeedback(null), 5000);
    } else {
      setExportFeedback(isPt ? 'Nenhum dado gravado para exportar.' : 'No telemetry data to export.');
      setTimeout(() => setExportFeedback(null), 3000);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const res = blackBoxRecorder.importFromJson(content);
      if (res.success && res.recording) {
        setRecording(res.recording);
        setSelectedFrameIndex(0);
        setIsPlaying(false);
        setExportFeedback(
          isPt
            ? `Gravador carregado: ${res.recording.frames.length} quadros importados com sucesso!`
            : `FDR Loaded: ${res.recording.frames.length} frames imported successfully!`
        );
      } else {
        setExportFeedback(res.error || 'Erro ao carregar arquivo FDR.');
      }
      setTimeout(() => setExportFeedback(null), 5000);
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const handleJumpToEvent = (timeOffsetMs: number) => {
    if (!recording || recording.frames.length === 0) return;
    const targetIdx = recording.frames.findIndex((f) => f.timeOffsetMs >= timeOffsetMs);
    if (targetIdx !== -1) {
      setSelectedFrameIndex(targetIdx);
      setActiveTab('telemetry');
    }
  };

  // Telemetry Graph Canvas Renderer (Downsampled for smooth rendering)
  const chartPoints = useMemo(() => {
    if (frames.length === 0) return [];
    const maxSamples = 300;
    const step = Math.max(1, Math.floor(frames.length / maxSamples));
    const pts = [];
    for (let i = 0; i < frames.length; i += step) {
      pts.push({ ...frames[i], originalIndex: i });
    }
    return pts;
  }, [frames]);

  return (
    <div
      id="black-box-analysis-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200 font-sans"
    >
      <div
        className={`bg-[#0A0C10] border border-[#334155] rounded-2xl shadow-2xl flex flex-col text-[#E2E8F0] overflow-hidden transition-all duration-300 ${
          isExpanded ? 'w-full h-full' : 'max-w-6xl w-full max-h-[92vh] h-[850px]'
        }`}
      >
        {/* 1. TOP HEADER - AVIATION BLACK BOX BRANDING */}
        <div className="bg-[#0F172A] px-4 py-3 border-b border-[#1E293B] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Fluminescent Black Box Orange Icon */}
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <HardDrive className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-mono-avionics tracking-wide">
                  {isPt ? 'CAIXA PRETA • GRAVADOR DE VOO (FDR/QAR)' : 'BLACK BOX • FLIGHT DATA RECORDER (FDR)'}
                </h2>
                {isLiveRecording ? (
                  <span className="px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500 text-[10px] font-mono-avionics font-bold text-red-400 flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    REC LIVE
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-500 text-[10px] font-mono-avionics font-bold text-blue-400">
                    REPLAY / ANALYSIS
                  </span>
                )}
              </div>
              <div className="text-xs text-[#94A3B8] font-mono-avionics flex items-center gap-3 mt-0.5">
                <span>ACFT: <strong className="text-[#38BDF8]">{recording?.aircraft.registration || 'PT-AFM'}</strong> ({recording?.aircraft.name || 'Aircraft'})</span>
                <span>•</span>
                <span>BASE: <strong className="text-white">{recording?.airport.icao || 'SBGR'}</strong></span>
                <span>•</span>
                <span>FRAMES: <strong className="text-[#22C55E]">{frames.length}</strong> (10 Hz)</span>
                <span>•</span>
                <span>TEMPO: <strong className="text-amber-400">{formatTime(recording?.durationMs || 0)}</strong></span>
              </div>
            </div>
          </div>

          {/* Action Bar (Export, Import, Expand, Close) */}
          <div className="flex items-center gap-2">
            {/* Import JSON file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
            <button
              id="btn-fdr-import-json"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-lg bg-[#0A0C10] hover:bg-[#1E293B] border border-[#334155] text-xs font-mono-avionics text-[#94A3B8] hover:text-white cursor-pointer transition-colors flex items-center gap-1.5"
              title="Import previously saved FDR JSON file"
            >
              <Upload className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isPt ? 'Importar JSON' : 'Import JSON'}</span>
            </button>

            {/* Export JSON Button */}
            <button
              id="btn-fdr-export-json"
              onClick={handleExportJson}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-xs font-mono-avionics font-bold text-amber-300 hover:text-white cursor-pointer transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/10"
              title="Download high-frequency flight telemetry JSON"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isPt ? 'Exportar JSON (.json)' : 'Export JSON (.json)'}</span>
            </button>

            {/* Expand / Minimize */}
            <button
              id="btn-fdr-expand"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg bg-[#0A0C10] hover:bg-[#1E293B] border border-[#334155] text-[#94A3B8] hover:text-white cursor-pointer transition-colors"
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            {/* Close */}
            <button
              id="btn-fdr-close"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#0A0C10] hover:bg-red-950/60 border border-[#334155] hover:border-red-500/50 text-[#94A3B8] hover:text-red-300 cursor-pointer transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Feedback Alert Bar */}
        {exportFeedback && (
          <div className="bg-amber-950/40 border-b border-amber-500/40 px-4 py-1.5 text-xs font-mono-avionics text-amber-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
            <span>{exportFeedback}</span>
          </div>
        )}

        {/* 2. STATS & PEAK RECORDS SUMMARY BAR */}
        <div className="bg-[#060B12] px-4 py-2.5 border-b border-[#1E293B] grid grid-cols-2 sm:grid-cols-6 gap-2 shrink-0">
          <div className="bg-[#0F172A] p-2 rounded-lg border border-[#1E293B]">
            <div className="text-[9px] text-[#64748B] font-mono-avionics uppercase">ALTITUDE MÁXIMA</div>
            <div className="text-sm font-bold text-white font-mono-avionics">
              {recording?.statistics.maxAltitudeFt || 0} <span className="text-[10px] text-[#94A3B8]">FT</span>
            </div>
          </div>

          <div className="bg-[#0F172A] p-2 rounded-lg border border-[#1E293B]">
            <div className="text-[9px] text-[#64748B] font-mono-avionics uppercase">VELOCIDADE MÁXIMA</div>
            <div className="text-sm font-bold text-[#38BDF8] font-mono-avionics">
              {recording?.statistics.maxSpeedKts || 0} <span className="text-[10px] text-[#94A3B8]">KTS</span>
            </div>
          </div>

          <div className="bg-[#0F172A] p-2 rounded-lg border border-[#1E293B]">
            <div className="text-[9px] text-[#64748B] font-mono-avionics uppercase">CARGA G MÁXIMA</div>
            <div className="text-sm font-bold text-amber-400 font-mono-avionics">
              {(recording?.statistics.maxGForce || 1.0).toFixed(2)}G
            </div>
          </div>

          <div className="bg-[#0F172A] p-2 rounded-lg border border-[#1E293B]">
            <div className="text-[9px] text-[#64748B] font-mono-avionics uppercase">RAZÃO DE TOQUE</div>
            <div className={`text-sm font-bold font-mono-avionics ${Math.abs(recording?.statistics.landingRateFpm || 0) < 150 ? 'text-[#22C55E]' : 'text-amber-400'}`}>
              {recording?.statistics.landingRateFpm || 0} <span className="text-[10px] text-[#94A3B8]">FPM</span>
            </div>
          </div>

          <div className="bg-[#0F172A] p-2 rounded-lg border border-[#1E293B]">
            <div className="text-[9px] text-[#64748B] font-mono-avionics uppercase">DISTÂNCIA VOADA</div>
            <div className="text-sm font-bold text-white font-mono-avionics">
              {recording?.statistics.distanceFlownNm || 0} <span className="text-[10px] text-[#94A3B8]">NM</span>
            </div>
          </div>

          <div className="bg-[#0F172A] p-2 rounded-lg border border-[#1E293B]">
            <div className="text-[9px] text-[#64748B] font-mono-avionics uppercase">ALERTAS DE ESTOL</div>
            <div className="text-sm font-bold text-red-400 font-mono-avionics">
              {recording?.statistics.stallWarningCount || 0}
            </div>
          </div>
        </div>

        {/* 3. TIME SCRUBBER & PLAYBACK CONTROLS */}
        <div className="bg-[#0F172A] px-4 py-2.5 border-b border-[#1E293B] flex flex-col sm:flex-row items-center gap-3 shrink-0">
          {/* Play / Pause & Speed Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id="btn-fdr-restart"
              onClick={() => {
                setSelectedFrameIndex(0);
                setIsPlaying(false);
              }}
              className="p-1.5 rounded-lg bg-[#0A0C10] hover:bg-[#1E293B] border border-[#334155] text-[#94A3B8] hover:text-white cursor-pointer"
              title="Jump to flight start (00:00)"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            <button
              id="btn-fdr-step-back"
              onClick={() => setSelectedFrameIndex((prev) => Math.max(0, prev - 10))}
              className="p-1.5 rounded-lg bg-[#0A0C10] hover:bg-[#1E293B] border border-[#334155] text-[#94A3B8] hover:text-white cursor-pointer"
              title="Step back 1 second (-10 frames)"
            >
              <Rewind className="h-3.5 w-3.5" />
            </button>

            <button
              id="btn-fdr-play-toggle"
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 rounded-lg bg-[#38BDF8] hover:bg-[#0284C7] text-[#0A0C10] font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-lg shadow-[#38BDF8]/20"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>

            <button
              id="btn-fdr-step-forward"
              onClick={() => setSelectedFrameIndex((prev) => Math.min(frames.length - 1, prev + 10))}
              className="p-1.5 rounded-lg bg-[#0A0C10] hover:bg-[#1E293B] border border-[#334155] text-[#94A3B8] hover:text-white cursor-pointer"
              title="Step forward 1 second (+10 frames)"
            >
              <FastForward className="h-3.5 w-3.5" />
            </button>

            {/* Playback speed toggle */}
            <button
              id="btn-fdr-speed-toggle"
              onClick={() => setPlaybackSpeed((prev) => (prev === 1 ? 2 : prev === 2 ? 4 : prev === 4 ? 8 : 1))}
              className="px-2 py-1 rounded-lg bg-[#0A0C10] border border-[#334155] text-[10px] font-mono-avionics text-[#38BDF8] hover:border-[#38BDF8] cursor-pointer"
              title="Cycle replay speed (1x, 2x, 4x, 8x)"
            >
              {playbackSpeed}x SPEED
            </button>
          </div>

          {/* Scrub Slider */}
          <div className="flex-1 w-full flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-[#38BDF8] shrink-0">
              {formatTime(currentFrame?.timeOffsetMs || 0)}
            </span>
            <input
              id="input-fdr-timeline-scrubber"
              type="range"
              min={0}
              max={Math.max(0, frames.length - 1)}
              value={selectedFrameIndex}
              onChange={(e) => {
                setSelectedFrameIndex(Number(e.target.value));
                if (isPlaying) setIsPlaying(false);
              }}
              className="flex-1 h-2 bg-[#0A0C10] rounded-lg appearance-none cursor-pointer accent-[#38BDF8]"
            />
            <span className="text-xs font-mono text-[#64748B] shrink-0">
              {formatTime(recording?.durationMs || 0)}
            </span>
          </div>
        </div>

        {/* 4. NAVIGATION TABS */}
        <div className="bg-[#0A0C10] px-4 py-1.5 border-b border-[#1E293B] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1">
            <button
              id="tab-fdr-telemetry"
              onClick={() => setActiveTab('telemetry')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-avionics font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === 'telemetry'
                  ? 'bg-[#1E293B] text-[#38BDF8] border border-[#38BDF8]/40'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>{isPt ? 'Gráficos de Telemetria' : 'Telemetry Channels'}</span>
            </button>

            <button
              id="tab-fdr-controls"
              onClick={() => setActiveTab('controls')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-avionics font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === 'controls'
                  ? 'bg-[#1E293B] text-[#38BDF8] border border-[#38BDF8]/40'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>{isPt ? 'Comandos do Piloto' : 'Control Inputs'}</span>
            </button>

            <button
              id="tab-fdr-events"
              onClick={() => setActiveTab('events')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-avionics font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === 'events'
                  ? 'bg-[#1E293B] text-[#38BDF8] border border-[#38BDF8]/40'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              <span>{isPt ? `Eventos de Voo (${events.length})` : `Flight Events (${events.length})`}</span>
            </button>

            <button
              id="tab-fdr-raw-json"
              onClick={() => setActiveTab('raw_json')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-avionics font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === 'raw_json'
                  ? 'bg-[#1E293B] text-[#38BDF8] border border-[#38BDF8]/40'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>{isPt ? 'JSON Bruto' : 'Raw JSON'}</span>
            </button>
          </div>

          <div className="text-[11px] font-mono-avionics text-[#64748B]">
            FRAME <strong className="text-white">{selectedFrameIndex + 1}</strong> / {frames.length}
          </div>
        </div>

        {/* 5. MAIN CONTENT AREA */}
        <div className="flex-1 p-4 overflow-y-auto bg-[#060B12] space-y-4">
          {frames.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#64748B] text-center p-8">
              <HardDrive className="h-12 w-12 mb-3 text-amber-500/40 animate-pulse" />
              <h3 className="text-base font-bold text-white mb-1">
                {isPt ? 'Aguardando Dados de Telemetria' : 'Awaiting Flight Telemetry'}
              </h3>
              <p className="text-xs max-w-md">
                {isPt
                  ? 'A Caixa Preta está armada e gravando a 10 Hz. Inicie a decolagem para capturar dados em tempo real.'
                  : 'The Black Box is armed and capturing telemetry at 10 Hz. Begin flying to log high-frequency channels.'}
              </p>
            </div>
          ) : (
            <>
              {/* TAB 1: TELEMETRY CHANNELS & PROFILES */}
              {activeTab === 'telemetry' && (
                <div className="space-y-4">
                  {/* Real-Time Snapshot Gauges at Cursor Position */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    <div className="bg-[#0F172A] p-2.5 rounded-xl border border-[#1E293B]">
                      <div className="text-[10px] text-[#64748B] font-mono-avionics">ALTITUDE MSL</div>
                      <div className="text-lg font-bold text-white font-mono-avionics">
                        {currentFrame?.altitudeFt || 0} <span className="text-xs text-[#64748B]">FT</span>
                      </div>
                      <div className="text-[9px] text-[#38BDF8]">AGL: {currentFrame?.altitudeAglFt || 0} FT</div>
                    </div>

                    <div className="bg-[#0F172A] p-2.5 rounded-xl border border-[#1E293B]">
                      <div className="text-[10px] text-[#64748B] font-mono-avionics">AIRSPEED (IAS)</div>
                      <div className="text-lg font-bold text-[#38BDF8] font-mono-avionics">
                        {currentFrame?.indicatedAirspeedKts || 0} <span className="text-xs text-[#64748B]">KTS</span>
                      </div>
                      <div className="text-[9px] text-[#94A3B8]">GS: {currentFrame?.groundSpeedKts || 0} KTS</div>
                    </div>

                    <div className="bg-[#0F172A] p-2.5 rounded-xl border border-[#1E293B]">
                      <div className="text-[10px] text-[#64748B] font-mono-avionics">VERTICAL SPEED</div>
                      <div className={`text-lg font-bold font-mono-avionics ${(currentFrame?.verticalSpeedFpm || 0) >= 0 ? 'text-[#22C55E]' : 'text-amber-400'}`}>
                        {currentFrame?.verticalSpeedFpm || 0} <span className="text-xs text-[#64748B]">FPM</span>
                      </div>
                      <div className="text-[9px] text-[#64748B]">VARIO CLIMB/SINK</div>
                    </div>

                    <div className="bg-[#0F172A] p-2.5 rounded-xl border border-[#1E293B]">
                      <div className="text-[10px] text-[#64748B] font-mono-avionics">CARGA G / AOA</div>
                      <div className="text-lg font-bold text-amber-300 font-mono-avionics">
                        {(currentFrame?.gForce || 1.0).toFixed(2)}G
                      </div>
                      <div className="text-[9px] text-[#64748B]">AoA: {currentFrame?.angleOfAttackDeg || 0}°</div>
                    </div>

                    <div className="bg-[#0F172A] p-2.5 rounded-xl border border-[#1E293B]">
                      <div className="text-[10px] text-[#64748B] font-mono-avionics">ATTITUDE (PITCH/ROLL)</div>
                      <div className="text-sm font-bold text-white font-mono-avionics truncate">
                        P: {currentFrame?.pitchDeg || 0}° • R: {currentFrame?.rollDeg || 0}°
                      </div>
                      <div className="text-[9px] text-[#38BDF8]">HDG: {currentFrame?.headingDeg || 0}°</div>
                    </div>

                    <div className="bg-[#0F172A] p-2.5 rounded-xl border border-[#1E293B]">
                      <div className="text-[10px] text-[#64748B] font-mono-avionics">POTÊNCIA / RPM</div>
                      <div className="text-lg font-bold text-emerald-400 font-mono-avionics">
                        {currentFrame?.throttlePct || 0}%
                      </div>
                      <div className="text-[9px] text-[#94A3B8]">{currentFrame?.engineRpm || 0} RPM</div>
                    </div>
                  </div>

                  {/* Channel 1: Multi-Param SVG Flight Curve */}
                  <div className="bg-[#0F172A] p-4 rounded-xl border border-[#1E293B]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-[#38BDF8]" />
                        <span className="text-xs font-bold text-white font-mono-avionics">
                          {isPt ? 'PERFIL DE VOO SINCRONIZADO (ALTITUDE & VELOCIDADE)' : 'SYNCHRONIZED FLIGHT PROFILE (ALTITUDE & SPEED)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-mono-avionics">
                        <span className="flex items-center gap-1 text-[#22C55E]">
                          <span className="w-2.5 h-1 bg-[#22C55E] rounded"></span> Altitude (FT)
                        </span>
                        <span className="flex items-center gap-1 text-[#38BDF8]">
                          <span className="w-2.5 h-1 bg-[#38BDF8] rounded"></span> Airspeed (KTS)
                        </span>
                        <span className="flex items-center gap-1 text-amber-400">
                          <span className="w-2.5 h-1 bg-amber-400 rounded"></span> G-Force
                        </span>
                      </div>
                    </div>

                    {/* SVG Multi-Channel Graph */}
                    <div className="relative w-full h-56 bg-[#060B12] rounded-lg border border-[#1E293B] overflow-hidden">
                      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 200">
                        {/* Grid lines */}
                        <line x1="0" y1="50" x2="1000" y2="50" stroke="#1E293B" strokeDasharray="3 3" />
                        <line x1="0" y1="100" x2="1000" y2="100" stroke="#1E293B" strokeDasharray="3 3" />
                        <line x1="0" y1="150" x2="1000" y2="150" stroke="#1E293B" strokeDasharray="3 3" />

                        {/* Altitude Curve (Green) */}
                        {(() => {
                          const maxAlt = Math.max(1000, recording?.statistics.maxAltitudeFt || 3000);
                          const d = chartPoints
                            .map((p, idx) => {
                              const x = (idx / (chartPoints.length - 1)) * 1000;
                              const y = 190 - (p.altitudeFt / maxAlt) * 170;
                              return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                            })
                            .join(' ');
                          return <path d={d} fill="none" stroke="#22C55E" strokeWidth="2.2" />;
                        })()}

                        {/* Airspeed Curve (Blue) */}
                        {(() => {
                          const maxSpd = Math.max(100, recording?.statistics.maxSpeedKts || 160);
                          const d = chartPoints
                            .map((p, idx) => {
                              const x = (idx / (chartPoints.length - 1)) * 1000;
                              const y = 190 - (p.indicatedAirspeedKts / maxSpd) * 170;
                              return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                            })
                            .join(' ');
                          return <path d={d} fill="none" stroke="#38BDF8" strokeWidth="1.8" strokeDasharray="4 2" />;
                        })()}

                        {/* G-Force Curve (Amber) */}
                        {(() => {
                          const d = chartPoints
                            .map((p, idx) => {
                              const x = (idx / (chartPoints.length - 1)) * 1000;
                              const y = 190 - (Math.max(0, p.gForce) / 4.0) * 170;
                              return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                            })
                            .join(' ');
                          return <path d={d} fill="none" stroke="#FCD34D" strokeWidth="1.5" opacity="0.8" />;
                        })()}

                        {/* Current Cursor Scrubber Line */}
                        {frames.length > 0 && (
                          <line
                            x1={(selectedFrameIndex / (frames.length - 1)) * 1000}
                            y1="0"
                            x2={(selectedFrameIndex / (frames.length - 1)) * 1000}
                            y2="200"
                            stroke="#FF6B00"
                            strokeWidth="2.5"
                            strokeDasharray="2 1"
                          />
                        )}
                      </svg>

                      {/* Scrub Position Marker */}
                      {frames.length > 0 && (
                        <div
                          className="absolute top-2 -translate-x-1/2 px-2 py-0.5 rounded bg-amber-500 text-[10px] font-mono font-bold text-black pointer-events-none shadow"
                          style={{
                            left: `${(selectedFrameIndex / Math.max(1, frames.length - 1)) * 100}%`,
                          }}
                        >
                          {currentFrame?.altitudeFt} FT / {currentFrame?.indicatedAirspeedKts} KTS
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PILOT CONTROL INPUTS & DEFLECTION GAUGES */}
              {activeTab === 'controls' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Yoke / Stick Deflection Visualizer */}
                  <div className="bg-[#0F172A] p-4 rounded-xl border border-[#1E293B] flex flex-col items-center">
                    <div className="text-xs font-bold text-white font-mono-avionics mb-3 self-start flex items-center gap-1.5">
                      <Sliders className="h-4 w-4 text-[#38BDF8]" />
                      <span>{isPt ? 'MANCHE / DEFLEXÃO (ELEVATOR & AILERON)' : 'YOKE / STICK DEFLECTION'}</span>
                    </div>

                    <div className="relative w-48 h-48 bg-[#060B12] rounded-xl border border-[#334155] flex items-center justify-center">
                      {/* Crosshairs */}
                      <div className="absolute inset-x-0 top-1/2 h-px bg-[#1E293B]"></div>
                      <div className="absolute inset-y-0 left-1/2 w-px bg-[#1E293B]"></div>
                      <div className="absolute w-24 h-24 rounded-full border border-[#1E293B]/60 pointer-events-none"></div>

                      {/* Deflection Target Cursor */}
                      <div
                        className="absolute w-6 h-6 rounded-full bg-[#38BDF8]/20 border-2 border-[#38BDF8] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-75 shadow-lg shadow-[#38BDF8]/40"
                        style={{
                          left: `${50 + (currentFrame?.aileronRollInput || 0) * 40}%`,
                          top: `${50 + -(currentFrame?.elevatorPitchInput || 0) * 40}%`,
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]"></span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 w-full mt-3 text-center text-xs font-mono-avionics">
                      <div className="bg-[#060B12] p-2 rounded-lg border border-[#1E293B]">
                        <span className="text-[9px] text-[#64748B] block">PROFUNDOR (CABRAR/PICAR)</span>
                        <strong className="text-white">{Math.round((currentFrame?.elevatorPitchInput || 0) * 100)}%</strong>
                      </div>
                      <div className="bg-[#060B12] p-2 rounded-lg border border-[#1E293B]">
                        <span className="text-[9px] text-[#64748B] block">AILERONS (ROLAGEM)</span>
                        <strong className="text-[#38BDF8]">{Math.round((currentFrame?.aileronRollInput || 0) * 100)}%</strong>
                      </div>
                    </div>
                  </div>

                  {/* Throttle & Rudder Pedals */}
                  <div className="bg-[#0F172A] p-4 rounded-xl border border-[#1E293B] flex flex-col justify-between">
                    <div className="text-xs font-bold text-white font-mono-avionics mb-2 flex items-center gap-1.5">
                      <Gauge className="h-4 w-4 text-emerald-400" />
                      <span>{isPt ? 'MANETE DE POTÊNCIA & LEME' : 'THROTTLE & RUDDER PEDALS'}</span>
                    </div>

                    {/* Throttle Vertical Slider Graphic */}
                    <div className="flex items-center gap-4 bg-[#060B12] p-3 rounded-xl border border-[#1E293B]">
                      <div className="h-32 w-10 bg-[#0F172A] rounded-lg border border-[#334155] p-1 flex flex-col justify-end relative">
                        <div
                          className="w-full bg-emerald-500 rounded transition-all duration-75 shadow-lg shadow-emerald-500/20"
                          style={{ height: `${currentFrame?.throttlePct || 0}%` }}
                        ></div>
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] text-[#64748B] font-mono-avionics block">POTÊNCIA DO MOTOR</span>
                        <div className="text-2xl font-bold text-emerald-400 font-mono-avionics">
                          {currentFrame?.throttlePct || 0}%
                        </div>
                        <span className="text-[10px] text-[#94A3B8] font-mono-avionics">{currentFrame?.engineRpm || 0} RPM</span>
                      </div>
                    </div>

                    {/* Rudder Horizontal Bar */}
                    <div className="bg-[#060B12] p-3 rounded-xl border border-[#1E293B] mt-2">
                      <span className="text-[10px] text-[#64748B] font-mono-avionics block mb-1">PEDAIS DO LEME (YAW)</span>
                      <div className="h-4 bg-[#0F172A] rounded-full border border-[#334155] relative flex items-center">
                        <div className="absolute left-1/2 h-full w-0.5 bg-[#334155]"></div>
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-75"
                          style={{
                            width: `${Math.abs((currentFrame?.rudderYawInput || 0) * 50)}%`,
                            left: (currentFrame?.rudderYawInput || 0) >= 0 ? '50%' : `${50 - Math.abs((currentFrame?.rudderYawInput || 0) * 50)}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[9px] text-[#64748B] font-mono-avionics mt-1">
                        <span>ESQUERDA</span>
                        <strong className="text-white">{Math.round((currentFrame?.rudderYawInput || 0) * 100)}%</strong>
                        <span>DIREITA</span>
                      </div>
                    </div>
                  </div>

                  {/* Systems, Flaps, Gear, Brakes Configuration */}
                  <div className="bg-[#0F172A] p-4 rounded-xl border border-[#1E293B]">
                    <div className="text-xs font-bold text-white font-mono-avionics mb-3 flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-[#FCD34D]" />
                      <span>{isPt ? 'SUPERFÍCIES & CONFIGURAÇÃO' : 'FLIGHT CONFIGURATION & GEAR'}</span>
                    </div>

                    <div className="space-y-2 text-xs font-mono-avionics">
                      <div className="bg-[#060B12] p-2.5 rounded-lg border border-[#1E293B] flex items-center justify-between">
                        <span className="text-[#94A3B8]">POSIÇÃO DOS FLAPS:</span>
                        <strong className="text-[#38BDF8]">{currentFrame?.flapsDeg || 0}° GRAUS</strong>
                      </div>

                      <div className="bg-[#060B12] p-2.5 rounded-lg border border-[#1E293B] flex items-center justify-between">
                        <span className="text-[#94A3B8]">TREM DE POUSO:</span>
                        <strong className={currentFrame?.gearDown ? 'text-emerald-400' : 'text-[#64748B]'}>
                          {currentFrame?.gearDown ? 'BAIXADO E TRAVADO (DOWN)' : 'RECOLHIDO (UP)'}
                        </strong>
                      </div>

                      <div className="bg-[#060B12] p-2.5 rounded-lg border border-[#1E293B] flex items-center justify-between">
                        <span className="text-[#94A3B8]">FREIOS DE RODA / PARK:</span>
                        <strong className={currentFrame?.wheelBrakes || currentFrame?.parkingBrakes ? 'text-amber-400' : 'text-[#64748B]'}>
                          {currentFrame?.parkingBrakes ? 'FREIO DE ESTAC. ON' : currentFrame?.wheelBrakes ? 'FREIO ACIONADO' : 'LIBERADOS'}
                        </strong>
                      </div>

                      <div className="bg-[#060B12] p-2.5 rounded-lg border border-[#1E293B] flex items-center justify-between">
                        <span className="text-[#94A3B8]">COMPENSAÇÃO (TRIM):</span>
                        <strong className="text-white">{currentFrame?.elevatorTrimPct || 0}%</strong>
                      </div>

                      <div className="bg-[#060B12] p-2.5 rounded-lg border border-[#1E293B] flex items-center justify-between">
                        <span className="text-[#94A3B8]">DESVIO ILS LOCALIZER:</span>
                        <strong className="text-white">{(currentFrame?.ilsLocalizerDev || 0).toFixed(2)} DOTS</strong>
                      </div>

                      <div className="bg-[#060B12] p-2.5 rounded-lg border border-[#1E293B] flex items-center justify-between">
                        <span className="text-[#94A3B8]">DESVIO GLIDESLOPE:</span>
                        <strong className="text-white">{(currentFrame?.ilsGlideslopeDev || 0).toFixed(2)} DOTS</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: FLIGHT EVENTS & CRITICAL TIMELINE */}
              {activeTab === 'events' && (
                <div className="bg-[#0F172A] p-4 rounded-xl border border-[#1E293B]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-white font-mono-avionics">
                      {isPt ? 'HISTÓRICO CRONOLÓGICO DE EVENTOS DO VOO' : 'CHRONOLOGICAL FLIGHT EVENTS LOG'}
                    </span>
                    <span className="text-[10px] text-[#64748B] font-mono-avionics">
                      {isPt ? 'Clique em qualquer evento para pular a linha do tempo' : 'Click any event to scrub playback'}
                    </span>
                  </div>

                  {events.length === 0 ? (
                    <div className="text-center p-6 text-[#64748B] text-xs">
                      {isPt ? 'Nenhum evento crítico registrado ainda.' : 'No flight events triggered yet.'}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {events.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={() => handleJumpToEvent(evt.timeOffsetMs)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group hover:border-[#38BDF8] ${
                            evt.severity === 'critical'
                              ? 'bg-red-950/30 border-red-500/50'
                              : evt.severity === 'warning'
                              ? 'bg-amber-950/30 border-amber-500/50'
                              : 'bg-[#060B12] border-[#1E293B]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="px-2 py-1 rounded bg-[#0A0C10] border border-[#334155] font-mono text-xs text-[#38BDF8] font-bold">
                              {formatTime(evt.timeOffsetMs)}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white group-hover:text-[#38BDF8] transition-colors">
                                {evt.title}
                              </div>
                              <div className="text-[11px] text-[#94A3B8]">{evt.description}</div>
                            </div>
                          </div>

                          <div className="text-right text-[10px] font-mono-avionics text-[#64748B]">
                            <div>{evt.telemetrySnapshot.altitudeFt} FT • {evt.telemetrySnapshot.speedKts} KTS</div>
                            <div className="text-amber-400 font-bold">{evt.telemetrySnapshot.gForce.toFixed(2)}G</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: RAW JSON PREVIEW & EXPORT INSPECTOR */}
              {activeTab === 'raw_json' && (
                <div className="bg-[#0F172A] p-4 rounded-xl border border-[#1E293B]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono-avionics font-bold text-[#38BDF8]">
                      JSON PAYLOAD PREVIEW (FRAME #{selectedFrameIndex + 1})
                    </span>
                    <button
                      onClick={handleExportJson}
                      className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-mono-avionics font-bold border border-amber-500/40 cursor-pointer"
                    >
                      {isPt ? 'Baixar Arquivo Completo (.json)' : 'Download Full File (.json)'}
                    </button>
                  </div>

                  <pre className="bg-[#030712] p-4 rounded-lg border border-[#1E293B] text-[11px] font-mono text-[#22C55E] overflow-x-auto max-h-96">
                    {JSON.stringify(
                      {
                        frameIndex: selectedFrameIndex,
                        flightId: recording?.id,
                        aircraft: recording?.aircraft,
                        airport: recording?.airport,
                        currentFrame,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>

        {/* 6. MODAL FOOTER */}
        <div className="bg-[#0F172A] px-4 py-2.5 border-t border-[#1E293B] flex items-center justify-between shrink-0 text-xs font-mono-avionics text-[#64748B]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            <span className="text-[#94A3B8]">ICAO Annex 6 / FAA QAR Compliant Telemetry Logger</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportJson}
              className="text-amber-400 hover:text-white flex items-center gap-1 cursor-pointer font-bold transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isPt ? 'Exportar Caixa Preta (JSON)' : 'Export Black Box (JSON)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
