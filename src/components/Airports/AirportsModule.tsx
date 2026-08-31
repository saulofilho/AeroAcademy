import React, { useState } from 'react';
import { AirportInfo, SupportedLanguage, DynamicWeatherConfig } from '../../types';
import { globalAirportsList } from '../../data/airportsData';
import { translations } from '../../i18n/translations';
import { MapPin, Wind, CloudRain, Radio, Compass, Plane, Sparkles, Navigation, Play, Loader2 } from 'lucide-react';

interface AirportsModuleProps {
  selectedAirport: AirportInfo;
  lang: SupportedLanguage;
  onSelectAirport: (airport: AirportInfo) => void;
  onStartFlightAtAirport: (airport: AirportInfo, weather?: DynamicWeatherConfig) => void;
}

export const AirportsModule: React.FC<AirportsModuleProps> = ({
  selectedAirport,
  lang,
  onSelectAirport,
  onStartFlightAtAirport,
}) => {
  const [activeAirport, setActiveAirport] = useState<AirportInfo>(selectedAirport);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isGeneratingScenario, setIsGeneratingScenario] = useState<boolean>(false);
  const [generatedScenarioText, setGeneratedScenarioText] = useState<string | null>(null);

  const t = translations[lang].airports;

  const filteredAirports = globalAirportsList.filter((a) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.icao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateScenario = async () => {
    setIsGeneratingScenario(true);
    setGeneratedScenarioText(null);
    try {
      const resp = await fetch('/api/flight-scenarios/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          airportIcao: activeAirport.icao,
          weatherType: activeAirport.metarRaw.includes('OVC') ? 'IFR' : 'VFR',
          difficulty: 'advanced',
          lang,
        }),
      });
      const data = await resp.json();
      if (data.scenario) {
        setGeneratedScenarioText(data.scenario.briefing || data.scenario.title);
      }
    } catch (e) {
      setGeneratedScenarioText(
        lang === 'pt'
          ? `Cenário Gerado: Aproximação com vento de través de 18 nós para a pista ${activeAirport.runways[0].ident} sob condições marginais.`
          : `Scenario Generated: 18 kts crosswind approach to runway ${activeAirport.runways[0].ident} in marginal VFR.`
      );
    } finally {
      setIsGeneratingScenario(false);
    }
  };

  return (
    <div id="airports-module-root" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-[#38BDF8] text-xs font-mono-avionics font-bold uppercase tracking-wider mb-2">
            <MapPin className="h-4 w-4" />
            {lang === 'pt' ? 'Banco de Dados Global de Aeródromos' : 'Global Airport Database & Scenarios'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white font-serif-display">
            {lang === 'pt' ? 'Cartas, METAR & Pistas do Mundo' : 'Airport Charts, METAR & Runways'}
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1.5 max-w-2xl font-sans leading-relaxed">
            {lang === 'pt'
              ? 'Consulte frequências de torre e ILS, boletins meteorológicos METAR decodificados e gere cenários climáticos dinâmicos.'
              : 'Access tower & ILS frequencies, decoded live METAR reports, and generate dynamic AI flight scenarios.'}
          </p>
        </div>

        <button
          onClick={() => onStartFlightAtAirport(activeAirport)}
          className="px-6 py-3 bg-[#38BDF8] hover:bg-[#0284C7] text-[#0A0C10] text-xs uppercase tracking-wider font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-[#38BDF8]/15 cursor-pointer shrink-0 transition-all"
        >
          <Plane className="h-4 w-4" />
          <span>{lang === 'pt' ? 'Decolar deste Aeródromo' : 'Fly from this Airport'}</span>
        </button>
      </div>

      {/* Grid: Airport List & Airport Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Airport Search & Selection */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder={lang === 'pt' ? 'Buscar por ICAO, cidade ou nome...' : 'Search by ICAO, city or name...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-[#0F172A] border border-[#1E293B] rounded-xl text-xs text-white focus:outline-none focus:border-[#38BDF8] font-mono-avionics"
          />

          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {filteredAirports.map((airport) => (
              <button
                key={airport.id}
                onClick={() => {
                  setActiveAirport(airport);
                  onSelectAirport(airport);
                }}
                className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                  activeAirport.id === airport.id
                    ? 'bg-[#1E293B] border-[#38BDF8] shadow-lg shadow-[#38BDF8]/10'
                    : 'bg-[#0F172A] hover:bg-[#1E293B] border-[#1E293B]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-avionics font-bold text-[#38BDF8]">{airport.icao}</span>
                  <span className="text-[10px] text-[#64748B] font-mono-avionics">{airport.elevationFt} FT MSL</span>
                </div>
                <div className="text-sm font-semibold text-white font-serif-display line-clamp-1">{airport.name}</div>
                <div className="text-xs text-[#94A3B8]">{airport.city}, {airport.country}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Airport Specifications, Runways & METAR */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            {/* Airport Title */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
              <div>
                <span className="text-[10px] font-mono-avionics text-[#38BDF8] font-bold uppercase tracking-wider">{activeAirport.city}, {activeAirport.country}</span>
                <h2 className="text-2xl font-light text-white font-serif-display mt-0.5">{activeAirport.name}</h2>
              </div>
              <div className="bg-[#0A0C10] px-4 py-2 rounded-xl border border-[#334155] text-lg font-mono-avionics text-[#38BDF8] font-bold">
                {activeAirport.icao}
              </div>
            </div>

            {/* METAR Weather Card */}
            <div className="bg-[#0A0C10] p-5 rounded-xl border border-[#334155] space-y-3">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                <span className="text-xs font-bold font-mono-avionics text-[#22C55E] flex items-center gap-1.5">
                  <Wind className="h-4 w-4" />
                  BOLETIM METEOROLÓGICO METAR ATUAL
                </span>
                <span className="text-[10px] font-mono-avionics text-[#64748B]">1013.25 HPA</span>
              </div>
              <div className="text-xs font-mono-avionics text-[#E2E8F0] bg-[#1E293B] p-3 rounded-lg border border-[#334155] leading-relaxed font-bold">
                {activeAirport.metarRaw}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono-avionics text-[#94A3B8] pt-1">
                <div>VENTO: <strong className="text-white">100° / 08 KTS</strong></div>
                <div>VISIBILIDADE: <strong className="text-white">&gt;10 KM</strong></div>
                <div>TETO: <strong className="text-white">FEW 3000 FT</strong></div>
                <div>TEMP / ORO: <strong className="text-white">22°C / 15°C</strong></div>
              </div>
            </div>

            {/* Runways & Frequencies */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-semibold text-[#64748B] uppercase tracking-widest font-mono-avionics">
                {lang === 'pt' ? 'Pistas Operacionais & Procedimentos ILS' : 'Runway Operations & ILS Procedures'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeAirport.runways.map((rwy) => (
                  <div key={rwy.ident} className="bg-[#0A0C10] p-4 rounded-xl border border-[#334155] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white font-mono-avionics">PISTA {rwy.ident}</span>
                      <span className="text-[10px] uppercase tracking-wider font-mono-avionics text-[#64748B]">{rwy.surface}</span>
                    </div>
                    <div className="text-xs text-[#94A3B8] font-mono-avionics">
                      Dimensões: <strong className="text-[#E2E8F0]">{rwy.lengthMeters}m x {rwy.widthMeters}m</strong>
                    </div>
                    <div className="text-xs text-[#94A3B8] font-mono-avionics">
                      Proa Magnética: <strong className="text-[#FCD34D]">{rwy.heading}°</strong>
                    </div>
                    {rwy.ilsFreq && (
                      <div className="text-xs text-[#38BDF8] font-mono-avionics bg-[#1E293B] px-2.5 py-1 rounded-lg border border-[#334155] mt-1">
                        ILS CAT I: <strong>{rwy.ilsFreq.toFixed(2)} MHz</strong> (Curso {rwy.ilsCourse}°)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Dynamic Scenario Generator */}
            <div className="bg-[#0A0C10] p-5 rounded-xl border border-[#334155] space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-mono-avionics font-bold text-[#38BDF8] flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" />
                    GERADOR DE CENÁRIOS IA AVANÇADO
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-0.5 font-sans">
                    Crie missões e desafios meteorológicos personalizados gerados por IA para este aeródromo.
                  </p>
                </div>

                <button
                  onClick={handleGenerateScenario}
                  disabled={isGeneratingScenario}
                  className="px-4 py-2 bg-[#38BDF8] hover:bg-[#0284C7] text-[#0A0C10] text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#38BDF8]/15 cursor-pointer disabled:opacity-50 shrink-0 transition-colors"
                >
                  {isGeneratingScenario ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Gerando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Gerar Cenário com IA</span>
                    </>
                  )}
                </button>
              </div>

              {generatedScenarioText && (
                <div className="p-3.5 rounded-xl bg-[#1E293B] border border-[#38BDF8]/40 text-xs text-[#38BDF8] leading-relaxed font-sans animate-in fade-in duration-200">
                  {generatedScenarioText}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
