import React, { useState } from 'react';
import { LogbookEntry, SupportedLanguage } from '../../types';
import { translations } from '../../i18n/translations';
import { BookOpen, Plane, Clock, Award, Filter, Calendar, MapPin, Activity, Sparkles, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface LogbookModuleProps {
  logbook: LogbookEntry[];
  lang: SupportedLanguage;
  onSelectEntry: (entry: LogbookEntry) => void;
}

export const LogbookModule: React.FC<LogbookModuleProps> = ({ logbook, lang, onSelectEntry }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const t = translations[lang].logbook;

  // Aggregate Hours
  const totalMinutes = logbook.reduce((sum, e) => sum + e.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const soloMinutes = logbook.reduce((sum, e) => sum + e.soloMinutes, 0);
  const soloHours = (soloMinutes / 60).toFixed(1);

  const ifrMinutes = logbook.reduce((sum, e) => sum + e.instrumentMinutes, 0);
  const ifrHours = (ifrMinutes / 60).toFixed(1);

  const totalLandings = logbook.reduce((sum, e) => sum + e.landingsDay + e.landingsNight, 0);

  // Chart data
  const chartData = logbook.slice().reverse().map((entry, idx) => ({
    name: entry.date.substring(5),
    duration: entry.durationMinutes,
    score: entry.flightScore,
    sinkRate: Math.abs(entry.telemetrySummary?.landingRateFpm || 100),
  }));

  const filteredEntries = logbook.filter((entry) =>
    entry.departureIcao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.arrivalIcao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.aircraftReg.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.remarks.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="logbook-module-root" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-[#38BDF8] text-xs font-mono-avionics font-bold uppercase tracking-wider mb-2">
            <BookOpen className="h-4 w-4" />
            {lang === 'pt' ? 'Caderneta de Voo Digital & Histórico' : 'Digital Pilot Logbook & Flight History'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white font-serif-display">
            {lang === 'pt' ? 'Registro de Horas & Telemetria de Pousos' : 'Flight Hours & Touchdown Telemetry'}
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1.5 max-w-2xl font-sans leading-relaxed">
            {lang === 'pt'
              ? 'Acompanhamento rigoroso de horas de voo diurnas, noturnas, IFR, solo e médias de taxa de afundamento.'
              : 'Official pilot logbook tracking total hours, solo PIC, instrument time, and sink rate averages.'}
          </p>
        </div>
      </div>

      {/* Flight Hours KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Hours */}
        <div className="bg-[#0F172A] border border-[#1E293B] p-5 rounded-xl relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest font-mono-avionics text-[#64748B] font-medium">{t.totalHours}</span>
            <Clock className="h-4 w-4 text-[#38BDF8]" />
          </div>
          <div className="text-2xl sm:text-3xl font-light text-white font-serif-display">{totalHours} <span className="text-xs font-bold text-[#38BDF8] font-mono-avionics">HRS</span></div>
          <div className="text-[10px] uppercase tracking-wider font-mono-avionics text-[#94A3B8] mt-2">{totalMinutes} min voados</div>
        </div>

        {/* Solo Hours */}
        <div className="bg-[#0F172A] border border-[#1E293B] p-5 rounded-xl relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest font-mono-avionics text-[#64748B] font-medium">{t.soloHours}</span>
            <Plane className="h-4 w-4 text-[#22C55E]" />
          </div>
          <div className="text-2xl sm:text-3xl font-light text-white font-serif-display">{soloHours} <span className="text-xs font-bold text-[#22C55E] font-mono-avionics">HRS</span></div>
          <div className="text-[10px] uppercase tracking-wider font-mono-avionics text-[#94A3B8] mt-2">Piloto em Comando (PIC)</div>
        </div>

        {/* Instrument Hours */}
        <div className="bg-[#0F172A] border border-[#1E293B] p-5 rounded-xl relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest font-mono-avionics text-[#64748B] font-medium">{t.instrumentHours}</span>
            <Activity className="h-4 w-4 text-[#38BDF8]" />
          </div>
          <div className="text-2xl sm:text-3xl font-light text-white font-serif-display">{ifrHours} <span className="text-xs font-bold text-[#38BDF8] font-mono-avionics">HRS</span></div>
          <div className="text-[10px] uppercase tracking-wider font-mono-avionics text-[#94A3B8] mt-2">Sob Regras de IFR</div>
        </div>

        {/* Landings Count */}
        <div className="bg-[#0F172A] border border-[#1E293B] p-5 rounded-xl relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest font-mono-avionics text-[#64748B] font-medium">{t.landings}</span>
            <Award className="h-4 w-4 text-[#FCD34D]" />
          </div>
          <div className="text-2xl sm:text-3xl font-light text-white font-serif-display">{totalLandings} <span className="text-xs font-bold text-[#FCD34D] font-mono-avionics">POUSOS</span></div>
          <div className="text-[10px] uppercase tracking-wider font-mono-avionics text-[#94A3B8] mt-2">100% no eixo da pista</div>
        </div>
      </div>

      {/* Recharts Telemetry Progression Graph */}
      {chartData.length > 0 && (
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <h2 className="text-sm font-medium text-white font-serif-display flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#38BDF8]" />
              <span>{lang === 'pt' ? 'Evolução de Desempenho & Duração dos Voos' : 'Flight Duration & Performance Trend'}</span>
            </h2>
            <span className="text-[10px] uppercase tracking-widest font-mono-avionics text-[#64748B]">Últimos Voos</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} fontStyle="italic" />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#E2E8F0' }}
                  labelStyle={{ color: '#94A3B8' }}
                />
                <Area type="monotone" dataKey="score" stroke="#38BDF8" strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" name="Pontuação (0-100)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Logbook Entries Table */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-base font-medium text-white font-serif-display">
            {lang === 'pt' ? 'Histórico Detalhado de Missões de Voo' : 'Detailed Flight Mission Entries'}
          </h2>

          <input
            type="text"
            placeholder={lang === 'pt' ? 'Buscar por aeroporto, matrícula...' : 'Search airport, registration...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3.5 py-2 bg-[#0A0C10] border border-[#334155] rounded-xl text-xs text-white focus:outline-none focus:border-[#38BDF8] w-full sm:w-64 font-mono-avionics"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-avionics text-[#E2E8F0]">
            <thead>
              <tr className="border-b border-[#1E293B] text-[#64748B] uppercase text-[10px] tracking-wider">
                <th className="pb-3 px-3">DATA</th>
                <th className="pb-3 px-3">AERONAVE</th>
                <th className="pb-3 px-3">ROTA</th>
                <th className="pb-3 px-3 text-center">TEMPO</th>
                <th className="pb-3 px-3 text-center">POUSO (FPM)</th>
                <th className="pb-3 px-3 text-center">GRAU</th>
                <th className="pb-3 px-3 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-[#1E293B]/50 transition-colors">
                  <td className="py-3.5 px-3 text-white font-medium">{entry.date}</td>
                  <td className="py-3.5 px-3">
                    <span className="text-[#38BDF8] font-bold">{entry.aircraftReg}</span>
                    <span className="text-[#64748B] text-[10px] ml-1">({entry.aircraftId.toUpperCase()})</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="bg-[#0A0C10] px-2.5 py-1 rounded-lg border border-[#334155] text-[#E2E8F0]">
                      {entry.departureIcao} ➔ {entry.arrivalIcao}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center font-bold text-[#FCD34D]">{entry.durationMinutes} min</td>
                  <td className="py-3.5 px-3 text-center">
                    <span className={Math.abs(entry.telemetrySummary?.landingRateFpm || 100) < 150 ? 'text-[#22C55E] font-bold' : 'text-[#FCD34D]'}>
                      {entry.telemetrySummary?.landingRateFpm || -120} FPM
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#1E293B] text-[#38BDF8] font-bold border border-[#334155]">
                      {entry.grade}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => onSelectEntry(entry)}
                      className="px-3 py-1.5 bg-[#1E293B] hover:bg-[#38BDF8] hover:text-[#0A0C10] border border-[#334155] rounded-lg text-[#E2E8F0] font-semibold transition-all cursor-pointer"
                    >
                      {lang === 'pt' ? 'Ver Debrief' : 'Debrief'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
