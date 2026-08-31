import React from 'react';
import { LogbookEntry, SupportedLanguage } from '../../types';
import { translations } from '../../i18n/translations';
import { Award, CheckCircle, Share2, ArrowRight, Activity, PlaneLanding, Flame, Compass, Sparkles, HardDrive } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PostFlightDebriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: SupportedLanguage;
  entry: LogbookEntry;
  onShare: () => void;
  onGoToLogbook: () => void;
  onOpenBlackBox?: () => void;
}

export const PostFlightDebriefModal: React.FC<PostFlightDebriefModalProps> = ({
  isOpen,
  onClose,
  lang,
  entry,
  onShare,
  onGoToLogbook,
  onOpenBlackBox,
}) => {
  React.useEffect(() => {
    if (isOpen && entry.flightScore >= 85) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#3b82f6', '#10b981', '#fbbf24']
      });
    }
  }, [isOpen, entry.flightScore]);

  if (!isOpen) return null;

  const t = translations[lang].logbook;
  const isButterLanding = entry.telemetrySummary && Math.abs(entry.telemetrySummary.landingRateFpm) < 150;

  return (
    <div id="post-flight-debrief-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 flex flex-col gap-6 text-[#E2E8F0] relative">
        {/* Glow Header */}
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-5">
          <div>
            <div className="flex items-center gap-2 text-[#38BDF8] text-xs font-mono-avionics font-bold uppercase tracking-wider mb-1">
              <Sparkles className="h-4 w-4" />
              {lang === 'pt' ? 'Relatório de Telemetria Pós-Voo' : 'Post-Flight Telemetry Debrief'}
            </div>
            <h2 className="text-2xl font-light font-serif-display text-white">
              {lang === 'pt' ? 'Análise de Desempenho do Piloto' : 'Pilot Performance Analysis'}
            </h2>
          </div>
          {/* Grade Badge */}
          <div className="flex flex-col items-center justify-center bg-[#0A0C10] border border-[#38BDF8]/40 rounded-xl w-16 h-16 shadow-lg shadow-[#38BDF8]/10">
            <span className="text-[9px] text-[#64748B] uppercase font-mono-avionics">GRAU</span>
            <span className="text-2xl font-bold text-[#38BDF8] font-serif-display">{entry.grade}</span>
          </div>
        </div>

        {/* Flight Score & Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#0A0C10] p-3.5 rounded-xl border border-[#334155] text-center">
            <div className="text-[10px] text-[#64748B] uppercase font-mono-avionics mb-1">PONTUAÇÃO</div>
            <div className="text-xl font-bold text-[#22C55E] font-serif-display">{entry.flightScore}/100</div>
          </div>
          <div className="bg-[#0A0C10] p-3.5 rounded-xl border border-[#334155] text-center">
            <div className="text-[10px] text-[#64748B] uppercase font-mono-avionics mb-1">RAZÃO DE TOQUE</div>
            <div className={`text-xl font-bold font-mono-avionics ${isButterLanding ? 'text-[#38BDF8]' : 'text-[#FCD34D]'}`}>
              {entry.telemetrySummary?.landingRateFpm || 0} <span className="text-xs">FPM</span>
            </div>
          </div>
          <div className="bg-[#0A0C10] p-3.5 rounded-xl border border-[#334155] text-center">
            <div className="text-[10px] text-[#64748B] uppercase font-mono-avionics mb-1">ALTITUDE MÁX</div>
            <div className="text-xl font-bold text-white font-mono-avionics">
              {entry.telemetrySummary?.maxAltitudeFt || 0} <span className="text-xs">FT</span>
            </div>
          </div>
          <div className="bg-[#0A0C10] p-3.5 rounded-xl border border-[#334155] text-center">
            <div className="text-[10px] text-[#64748B] uppercase font-mono-avionics mb-1">CARGA G MÁX</div>
            <div className="text-xl font-bold text-white font-mono-avionics">
              {entry.telemetrySummary?.maxGForce.toFixed(1) || 1.0}G
            </div>
          </div>
        </div>

        {/* AI Chief Flight Instructor Evaluation */}
        <div className="bg-[#0A0C10] p-5 rounded-xl border border-[#334155] relative overflow-hidden">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-[#1E293B] rounded-xl text-[#38BDF8] border border-[#334155]">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white font-serif-display">Cap. Carlos Silveira</div>
              <div className="text-[10px] text-[#38BDF8] font-mono-avionics">Instrutor Chefe de Voo Credenciado</div>
            </div>
          </div>
          <p className="text-sm text-[#E2E8F0] leading-relaxed italic border-l-2 border-[#38BDF8] pl-3 py-1 font-serif-display">
            "{entry.remarks}"
          </p>
        </div>

        {/* Flight Details Log */}
        <div className="bg-[#0A0C10] p-4 rounded-xl border border-[#334155] flex flex-wrap items-center justify-between gap-4 text-xs font-mono-avionics text-[#94A3B8]">
          <div>
            <span className="text-[#64748B]">ROTA: </span>
            <strong className="text-white">{entry.departureIcao} ➔ {entry.arrivalIcao}</strong>
          </div>
          <div>
            <span className="text-[#64748B]">AERONAVE: </span>
            <strong className="text-[#38BDF8]">{entry.aircraftReg} ({entry.aircraftId.toUpperCase()})</strong>
          </div>
          <div>
            <span className="text-[#64748B]">DURAÇÃO: </span>
            <strong className="text-[#FCD34D]">{entry.durationMinutes} min</strong>
          </div>
          <div>
            <span className="text-[#64748B]">POUSOS: </span>
            <strong className="text-[#22C55E]">{entry.landingsDay} Diurno</strong>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#1E293B]">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onShare}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-[#E2E8F0] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Share2 className="h-4 w-4 text-[#38BDF8]" />
              {lang === 'pt' ? 'Compartilhar' : 'Share'}
            </button>
            {onOpenBlackBox && (
              <button
                id="btn-debrief-open-blackbox"
                onClick={onOpenBlackBox}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-300 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-amber-950/30"
              >
                <HardDrive className="h-4 w-4 text-amber-400" />
                {lang === 'pt' ? 'Caixa Preta (FDR)' : 'Black Box FDR'}
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#334155] text-[#94A3B8] hover:bg-[#1E293B] text-xs font-semibold cursor-pointer transition-colors"
            >
              {lang === 'pt' ? 'Fechar' : 'Close'}
            </button>
            <button
              onClick={() => {
                onClose();
                onGoToLogbook();
              }}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#0284C7] text-[#0A0C10] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#38BDF8]/15 cursor-pointer transition-all"
            >
              <span>{lang === 'pt' ? 'Ver Caderneta' : 'Logbook'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
