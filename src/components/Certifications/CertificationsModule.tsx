import React, { useState } from 'react';
import { PilotCertificate, SupportedLanguage } from '../../types';
import { initialCertificates } from '../../data/achievementsData';
import { translations } from '../../i18n/translations';
import { Award, ShieldCheck, Lock, CheckCircle2, QrCode, Download, Share2, Printer, Check } from 'lucide-react';

interface CertificationsModuleProps {
  lang: SupportedLanguage;
  totalFlightHours: number;
  onOpenShareModal: () => void;
}

export const CertificationsModule: React.FC<CertificationsModuleProps> = ({
  lang,
  totalFlightHours,
  onOpenShareModal,
}) => {
  const [certificates] = useState<PilotCertificate[]>(initialCertificates);
  const [selectedCert, setSelectedCert] = useState<PilotCertificate>(initialCertificates[1]);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const t = translations[lang].certifications;

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div id="certifications-module-root" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-[#38BDF8] text-xs font-mono-avionics font-bold uppercase tracking-wider mb-2">
            <Award className="h-4 w-4" />
            {lang === 'pt' ? 'Certificações Oficiais de Treinamento' : 'Official Flight Certifications'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white font-serif-display">
            {lang === 'pt' ? 'Licenças & Habilitações Aeronáuticas' : 'Pilot Licenses & Ratings'}
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1.5 max-w-2xl font-sans leading-relaxed">
            {lang === 'pt'
              ? 'Certificados emitidos segundo as diretrizes de instrução de voo com autenticação criptográfica e registro de horas auditado.'
              : 'Certificates issued under aviation training standards with cryptographic verification and audited flight hours.'}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#1E293B] px-5 py-3.5 rounded-xl border border-[#334155] shrink-0">
          <div className="p-2.5 bg-[#0A0C10] text-[#38BDF8] rounded-xl border border-[#334155]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] text-[#64748B] uppercase tracking-widest font-mono-avionics">Horas Registradas</div>
            <div className="text-sm font-bold text-white font-mono-avionics">{totalFlightHours.toFixed(1)} Horas Totais</div>
          </div>
        </div>
      </div>

      {/* Grid: Certificate Cards and Certificate Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Certificate List */}
        <div className="space-y-3">
          <h2 className="text-[10px] uppercase tracking-widest font-mono-avionics text-[#64748B] px-1 font-semibold">
            {lang === 'pt' ? 'Progresso de Habilitações' : 'Rating Milestones'}
          </h2>

          {certificates.map((cert) => (
            <button
              key={cert.id}
              onClick={() => setSelectedCert(cert)}
              className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                selectedCert.id === cert.id
                  ? 'bg-[#1E293B] border-[#38BDF8] shadow-lg shadow-[#38BDF8]/10'
                  : 'bg-[#0F172A] hover:bg-[#1E293B] border-[#1E293B]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-wider font-mono-avionics px-2 py-0.5 rounded bg-[#0A0C10] text-[#38BDF8] border border-[#334155]">
                  {cert.code}
                </span>
                {cert.isUnlocked ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#22C55E] font-mono-avionics">
                    <CheckCircle2 className="h-3.5 w-3.5" /> EMITIDO
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#64748B] font-mono-avionics">
                    <Lock className="h-3.5 w-3.5" /> BLOQUEADO
                  </span>
                )}
              </div>
              <div className="text-sm font-semibold text-white font-serif-display line-clamp-1">{cert.title}</div>
              <div className="text-xs text-[#94A3B8]">{cert.level}</div>
            </button>
          ))}
        </div>

        {/* Certificate Display Diploma */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            {/* Diploma Paper Card */}
            <div className="relative bg-[#0A0C10] border border-[#334155] rounded-xl p-6 sm:p-10 shadow-2xl space-y-6 overflow-hidden">
              {/* Watermark Logo */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <Award className="w-96 h-96 text-[#FCD34D]" />
              </div>

              {/* Diploma Header */}
              <div className="text-center space-y-2 relative z-10 border-b border-[#334155] pb-6">
                <div className="text-[10px] font-mono-avionics uppercase tracking-widest text-[#FCD34D]">
                  AEROACADEMY INTERNATIONAL FLIGHT TRAINING
                </div>
                <h2 className="text-2xl sm:text-3xl font-light text-white font-serif-display tracking-wide">
                  CERTIFICADO OFICIAL DE PILOTO
                </h2>
                <div className="text-xs text-[#94A3B8]">
                  Departamento de Instrução Aérea e Padrões de Voo
                </div>
              </div>

              {/* Recipient & Award Statement */}
              <div className="text-center space-y-4 relative z-10 py-2">
                <p className="text-xs text-[#64748B] uppercase tracking-wider font-mono-avionics">
                  Certificamos formalmente que o aviador(a)
                </p>
                <div className="text-2xl sm:text-3xl font-normal text-white font-serif-display tracking-wide border-b border-dashed border-[#334155] pb-2 inline-block px-8">
                  Comandante Piloto Aluno
                </div>
                <p className="text-xs text-[#94A3B8] max-w-lg mx-auto leading-relaxed">
                  cumpriu rigorosamente todos os requisitos práticos de manobras de voo, navegação estimada, solo e exames de proficiência para a concessão de:
                </p>
                <div className="text-lg sm:text-xl font-normal text-[#FCD34D] font-serif-display uppercase tracking-widest">
                  {selectedCert.title}
                </div>
                <p className="text-[11px] text-[#94A3B8] italic max-w-md mx-auto">
                  "{selectedCert.privileges}"
                </p>
              </div>

              {/* Signatures & Security Hash */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-[#334155] relative z-10 text-xs font-mono-avionics">
                {/* Left: Signatures */}
                <div className="space-y-3">
                  <div>
                    <div className="text-[10px] text-[#64748B]">INSTRUTOR CHEFE:</div>
                    <div className="text-[#E2E8F0] font-serif-display italic text-sm">{selectedCert.instructorName}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#64748B]">REGISTRO / MATRÍCULA:</div>
                    <div className="text-[#38BDF8] font-bold">{selectedCert.certificateNumber}</div>
                  </div>
                </div>

                {/* Right: Verification Hash & QR Code */}
                <div className="space-y-2 bg-[#1E293B]/70 p-3.5 rounded-xl border border-[#334155]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#94A3B8] uppercase">Hash Criptográfico SHA-256</span>
                    <button
                      onClick={() => handleCopyHash(selectedCert.verificationHash || '8f4c2b9a7e110d9e4c5b3a1f99c8e21a')}
                      className="text-[10px] text-[#38BDF8] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {isCopied ? <Check className="h-3 w-3 text-[#22C55E]" /> : <ShieldCheck className="h-3 w-3" />}
                      <span>{isCopied ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                  <div className="text-[10px] text-[#94A3B8] font-mono-avionics break-all">
                    {selectedCert.verificationHash || '8f4c2b9a7e110d9e4c5b3a1f99c8e21a'}
                  </div>
                  <div className="text-[10px] text-[#22C55E] font-bold flex items-center gap-1 pt-1">
                    <CheckCircle2 className="h-3 w-3" /> Assinatura Digital Verificada
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-[#1E293B] hover:bg-[#334155] text-[#E2E8F0] text-xs font-semibold rounded-xl flex items-center gap-2 border border-[#334155] cursor-pointer transition-colors"
              >
                <Printer className="h-4 w-4 text-[#38BDF8]" />
                <span>{lang === 'pt' ? 'Imprimir Certificado' : 'Print Certificate'}</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenShareModal}
                  className="px-5 py-2.5 bg-[#38BDF8] hover:bg-[#0284C7] text-[#0A0C10] text-xs uppercase tracking-wider font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-[#38BDF8]/15 cursor-pointer transition-all"
                >
                  <Share2 className="h-4 w-4" />
                  <span>{lang === 'pt' ? 'Compartilhar Conquista' : 'Share Achievement'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
