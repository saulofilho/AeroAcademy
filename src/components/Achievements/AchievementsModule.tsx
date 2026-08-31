import React, { useState } from 'react';
import { PilotAchievement, SupportedLanguage } from '../../types';
import { initialAchievements } from '../../data/achievementsData';
import { translations } from '../../i18n/translations';
import { Award, Zap, CheckCircle2, Lock, Sparkles, Trophy, Star } from 'lucide-react';

interface AchievementsModuleProps {
  lang: SupportedLanguage;
  totalFlightHours: number;
}

export const AchievementsModule: React.FC<AchievementsModuleProps> = ({ lang, totalFlightHours }) => {
  const [achievements] = useState<PilotAchievement[]>(initialAchievements);

  const t = translations[lang].achievements;

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalXp = achievements.filter(a => a.isUnlocked).reduce((sum, a) => sum + a.xpValue, 0);

  // Pilot rank tier based on XP and Hours
  const pilotRank = totalXp >= 1500 ? 'Comandante de Linha Aérea' : totalXp >= 800 ? 'Piloto Comercial (CPL)' : totalXp >= 400 ? 'Piloto Privado Habilitado' : 'Aluno Piloto Solo';

  return (
    <div id="achievements-module-root" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-[#38BDF8] text-xs font-mono-avionics font-bold uppercase tracking-wider mb-2">
            <Trophy className="h-4 w-4" />
            {lang === 'pt' ? 'Conquistas & Sistema de Patentes' : 'Pilot Achievements & Rank Tiers'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white font-serif-display">
            {lang === 'pt' ? 'Galeria de Conquistas Aeronáuticas' : 'Aviation Badges & XP Mastery'}
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1.5 max-w-2xl font-sans leading-relaxed">
            {lang === 'pt'
              ? 'Complete desafios de voo, manobras de emergência, exames teóricos e acumule horas para desbloquear novas patentes.'
              : 'Complete flight challenges, emergency stalls, ground exams, and log hours to earn official pilot badges.'}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#1E293B] px-5 py-3.5 rounded-xl border border-[#334155] shrink-0">
          <div className="p-2.5 bg-[#0A0C10] text-[#FCD34D] rounded-xl border border-[#334155]">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] text-[#64748B] uppercase tracking-widest font-mono-avionics">Patente do Piloto</div>
            <div className="text-sm font-semibold text-white font-serif-display">{pilotRank}</div>
            <div className="text-[10px] text-[#38BDF8] font-mono-avionics mt-0.5">{totalXp} XP Acumulados</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-[#0F172A] border border-[#1E293B] p-5 rounded-xl space-y-2 shadow-lg">
        <div className="flex justify-between text-xs font-mono-avionics text-[#94A3B8]">
          <span className="uppercase text-[10px] tracking-wider text-[#64748B]">{lang === 'pt' ? 'PROGRESSO GERAL DE CONQUISTAS' : 'OVERALL BADGE PROGRESS'}</span>
          <strong className="text-[#38BDF8]">{unlockedCount} / {achievements.length} Desbloqueadas ({Math.round((unlockedCount / achievements.length) * 100)}%)</strong>
        </div>
        <div className="h-2.5 bg-[#0A0C10] rounded-full overflow-hidden border border-[#334155]">
          <div
            className="h-full bg-[#38BDF8] rounded-full transition-all duration-500"
            style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Achievement Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 shadow-xl ${
              ach.isUnlocked
                ? 'bg-[#0F172A] border-[#38BDF8]/40 shadow-sm shadow-[#38BDF8]/10'
                : 'bg-[#0F172A]/60 border-[#1E293B] opacity-70'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl border ${
                  ach.isUnlocked ? 'bg-[#0A0C10] border-[#38BDF8]/40 text-[#38BDF8]' : 'bg-[#0A0C10] border-[#334155] text-[#64748B]'
                }`}>
                  <Award className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono-avionics text-[#FCD34D] font-bold bg-[#0A0C10] px-2.5 py-1 rounded-full border border-[#334155]">
                  <Star className="h-3 w-3" />
                  <span>+{ach.xpValue} XP</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-medium text-white font-serif-display flex items-center gap-2">
                  <span>{ach.title}</span>
                  {ach.isUnlocked && <CheckCircle2 className="h-4 w-4 text-[#22C55E] shrink-0" />}
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed font-sans">{ach.description}</p>
              </div>
            </div>

            {/* Progress bar inside card */}
            <div className="space-y-1.5 pt-3 border-t border-[#1E293B]">
              <div className="flex justify-between text-[10px] font-mono-avionics text-[#64748B]">
                <span>{ach.isUnlocked ? 'CONCLUÍDO' : 'EM ANDAMENTO'}</span>
                <span>{ach.progress} / {ach.maxProgress}</span>
              </div>
              <div className="h-1.5 bg-[#0A0C10] rounded-full overflow-hidden border border-[#334155]/50">
                <div
                  className={`h-full rounded-full ${ach.isUnlocked ? 'bg-[#22C55E]' : 'bg-[#38BDF8]'}`}
                  style={{ width: `${Math.min(100, (ach.progress / ach.maxProgress) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
