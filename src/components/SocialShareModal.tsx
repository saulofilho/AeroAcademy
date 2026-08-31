import React, { useState } from 'react';
import { LogbookEntry, SupportedLanguage } from '../types';
import { Share2, X, Twitter, MessageSquare, Linkedin, Check, Copy, Award, ShieldCheck } from 'lucide-react';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: SupportedLanguage;
  entry?: LogbookEntry | null;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  lang,
  entry,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareText = entry
    ? `✈️ Acabei de completar uma missão de voo na AeroAcademy! Voo ${entry.departureIcao} ➔ ${entry.arrivalIcao} | Nota: ${entry.grade} (${entry.flightScore}/100) com toque suave a ${entry.telemetrySummary?.landingRateFpm || -100} FPM! #AeroAcademy #Aviation #PilotTraining`
    : `✈️ Estou treinando para minha licença de piloto na AeroAcademy com simulação 3D realista e suporte VR! #AeroAcademy #FlightSimulator`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  return (
    <div id="social-share-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 text-[#E2E8F0] shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0A0C10] text-[#38BDF8] rounded-xl border border-[#334155]">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white font-serif-display">
                {lang === 'pt' ? 'Compartilhar Marco Aeronáutico' : 'Share Aviation Milestone'}
              </h2>
              <p className="text-xs text-[#94A3B8] font-sans">
                {lang === 'pt' ? 'Mostre sua evolução de voo nas redes sociais' : 'Show off your flight achievements on social networks'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#1E293B] rounded-xl text-[#94A3B8] hover:text-white cursor-pointer transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Share Card Preview */}
        <div className="bg-[#0A0C10] p-4 rounded-xl border border-[#334155] space-y-2 text-xs font-mono-avionics text-[#38BDF8]">
          <div className="flex items-center gap-2 text-[10px] text-[#64748B] uppercase tracking-wider">
            <Award className="h-3.5 w-3.5 text-[#FCD34D]" />
            <span>PRÉVIA DA PUBLICAÇÃO</span>
          </div>
          <p className="text-[#E2E8F0] font-sans leading-relaxed">{shareText}</p>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={handleShareTwitter}
            className="p-3 bg-[#0A0C10] hover:bg-[#1E293B] border border-[#334155] rounded-xl flex flex-col items-center gap-1.5 text-xs font-semibold text-[#38BDF8] cursor-pointer transition-colors"
          >
            <Twitter className="h-5 w-5" />
            <span>X / Twitter</span>
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="p-3 bg-[#0A0C10] hover:bg-[#1E293B] border border-[#334155] rounded-xl flex flex-col items-center gap-1.5 text-xs font-semibold text-[#22C55E] cursor-pointer transition-colors"
          >
            <MessageSquare className="h-5 w-5" />
            <span>WhatsApp</span>
          </button>
          <button
            onClick={handleShareLinkedIn}
            className="p-3 bg-[#0A0C10] hover:bg-[#1E293B] border border-[#334155] rounded-xl flex flex-col items-center gap-1.5 text-xs font-semibold text-[#38BDF8] cursor-pointer transition-colors"
          >
            <Linkedin className="h-5 w-5" />
            <span>LinkedIn</span>
          </button>
        </div>

        {/* Copy Link Button */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={handleCopy}
            className="w-full px-5 py-2.5 bg-[#38BDF8] hover:bg-[#0284C7] text-[#0A0C10] text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#38BDF8]/15 cursor-pointer transition-all uppercase tracking-wider"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? (lang === 'pt' ? 'Copiado para Área de Transferência!' : 'Copied to Clipboard!') : (lang === 'pt' ? 'Copiar Texto da Publicação' : 'Copy Share Text')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
