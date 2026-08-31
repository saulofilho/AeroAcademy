import React, { useState } from 'react';
import { AircraftSpecs, SupportedLanguage } from '../../types';
import { initialAircraftFleet } from '../../data/aircraftData';
import { translations } from '../../i18n/translations';
import { Plane, Paintbrush, Gauge, Shield, Zap, Sparkles, Check, ArrowRight } from 'lucide-react';

interface HangarModuleProps {
  selectedAircraftId: string;
  lang: SupportedLanguage;
  onSelectAircraft: (aircraft: AircraftSpecs) => void;
  onUpdateAircraft: (aircraft: AircraftSpecs) => void;
  onStartFlightWithPlane: (aircraft: AircraftSpecs) => void;
}

export const HangarModule: React.FC<HangarModuleProps> = ({
  selectedAircraftId,
  lang,
  onSelectAircraft,
  onUpdateAircraft,
  onStartFlightWithPlane,
}) => {
  const [fleet, setFleet] = useState<AircraftSpecs[]>(initialAircraftFleet);
  const [activePlane, setActivePlane] = useState<AircraftSpecs>(
    initialAircraftFleet.find(p => p.id === selectedAircraftId) || initialAircraftFleet[0]
  );
  const [customTail, setCustomTail] = useState<string>(activePlane.registration);

  const t = translations[lang].hangar;

  const handleSelectLivery = (liveryId: string) => {
    const updated = {
      ...activePlane,
      selectedLiveryId: liveryId,
    };
    setActivePlane(updated);
    onUpdateAircraft(updated);
  };

  const handleApplyTailNumber = () => {
    const updated = {
      ...activePlane,
      registration: customTail.toUpperCase(),
    };
    setActivePlane(updated);
    onUpdateAircraft(updated);
  };

  return (
    <div id="hangar-module-root" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-[#38BDF8] text-xs font-mono-avionics font-bold uppercase tracking-wider mb-2">
            <Plane className="h-4 w-4" />
            {lang === 'pt' ? 'Hangar Executivo & Customização' : 'Executive Hangar & Customization'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white font-serif-display">
            {lang === 'pt' ? 'Frota de Treinamento & Pinturas' : 'Training Fleet & Aircraft Liveries'}
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1.5 max-w-2xl font-sans leading-relaxed">
            {lang === 'pt'
              ? 'Personalize esquemas de pintura, matrículas de cauda, aviônicos de cabine e consulte envelopes de peso e balanceamento.'
              : 'Customize paint liveries, registration tail numbers, cockpit avionics, and check weight & balance envelopes.'}
          </p>
        </div>

        <button
          onClick={() => onStartFlightWithPlane(activePlane)}
          className="px-6 py-3 bg-[#38BDF8] hover:bg-[#0284C7] text-[#0A0C10] text-xs uppercase tracking-wider font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-[#38BDF8]/15 cursor-pointer shrink-0 transition-all"
        >
          <Plane className="h-4 w-4" />
          <span>{lang === 'pt' ? 'Voar com esta Aeronave' : 'Fly with this Aircraft'}</span>
        </button>
      </div>

      {/* Fleet Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {fleet.map((plane) => (
          <button
            key={plane.id}
            onClick={() => {
              setActivePlane(plane);
              setCustomTail(plane.registration);
              onSelectAircraft(plane);
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
              activePlane.id === plane.id
                ? 'bg-[#1E293B] border-[#38BDF8] shadow-lg shadow-[#38BDF8]/10'
                : 'bg-[#0F172A] hover:bg-[#1E293B] border-[#1E293B]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-wider font-mono-avionics text-[#38BDF8] font-bold">{plane.category.replace('_', ' ').toUpperCase()}</span>
              {activePlane.id === plane.id && <span className="h-2 w-2 rounded-full bg-[#38BDF8]" />}
            </div>
            <div className="text-xs font-semibold text-white font-serif-display line-clamp-1">{plane.name}</div>
            <div className="text-[10px] text-[#94A3B8] font-mono-avionics">{plane.registration}</div>
          </button>
        ))}
      </div>

      {/* Aircraft Details & Livery Customizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Aircraft Showcase & Specifications */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            {/* Plane Title & Tag */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
              <div>
                <span className="text-[10px] font-mono-avionics text-[#38BDF8] font-bold uppercase tracking-wider">{activePlane.manufacturer}</span>
                <h2 className="text-2xl font-light text-white font-serif-display mt-0.5">{activePlane.name}</h2>
              </div>
              <div className="bg-[#0A0C10] px-3.5 py-1.5 rounded-xl border border-[#334155] text-xs font-mono-avionics text-[#FCD34D] font-bold">
                {activePlane.registration}
              </div>
            </div>

            {/* Performance Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-[#0A0C10] p-4 rounded-xl border border-[#334155]">
                <div className="text-[9px] text-[#64748B] font-mono-avionics uppercase tracking-wider">VELOCIDADE DE CRUZEIRO</div>
                <div className="text-lg font-light text-white font-serif-display mt-1">{activePlane.cruiseSpeedKts} <span className="text-xs font-bold text-[#38BDF8] font-mono-avionics">KTS</span></div>
              </div>
              <div className="bg-[#0A0C10] p-4 rounded-xl border border-[#334155]">
                <div className="text-[9px] text-[#64748B] font-mono-avionics uppercase tracking-wider">VELOCIDADE DE ESTOL (Vs)</div>
                <div className="text-lg font-light text-rose-400 font-serif-display mt-1">{activePlane.stallSpeedKts} <span className="text-xs font-bold text-rose-400 font-mono-avionics">KTS</span></div>
              </div>
              <div className="bg-[#0A0C10] p-4 rounded-xl border border-[#334155]">
                <div className="text-[9px] text-[#64748B] font-mono-avionics uppercase tracking-wider">TETO DE SERVIÇO</div>
                <div className="text-lg font-light text-[#38BDF8] font-serif-display mt-1">{activePlane.serviceCeilingFt.toLocaleString()} <span className="text-xs font-bold text-[#38BDF8] font-mono-avionics">FT</span></div>
              </div>
              <div className="bg-[#0A0C10] p-4 rounded-xl border border-[#334155]">
                <div className="text-[9px] text-[#64748B] font-mono-avionics uppercase tracking-wider">POTÊNCIA / MOTOR</div>
                <div className="text-lg font-light text-white font-serif-display mt-1">{activePlane.engineHorsepower} <span className="text-xs font-bold text-[#38BDF8] font-mono-avionics">HP</span></div>
              </div>
              <div className="bg-[#0A0C10] p-4 rounded-xl border border-[#334155]">
                <div className="text-[9px] text-[#64748B] font-mono-avionics uppercase tracking-wider">PESO MÁX DE DECOLAGEM</div>
                <div className="text-lg font-light text-white font-serif-display mt-1">{activePlane.maxTakeoffWeightLbs.toLocaleString()} <span className="text-xs font-bold text-[#38BDF8] font-mono-avionics">LBS</span></div>
              </div>
              <div className="bg-[#0A0C10] p-4 rounded-xl border border-[#334155]">
                <div className="text-[9px] text-[#64748B] font-mono-avionics uppercase tracking-wider">CAPACIDADE DE COMBUSTÍVEL</div>
                <div className="text-lg font-light text-[#FCD34D] font-serif-display mt-1">{activePlane.fuelCapacityGal} <span className="text-xs font-bold text-[#FCD34D] font-mono-avionics">GAL</span></div>
              </div>
            </div>

            {/* V-Speeds Chart */}
            <div className="bg-[#0A0C10] p-5 rounded-xl border border-[#334155] space-y-3">
              <h3 className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wider font-mono-avionics">
                {lang === 'pt' ? 'Tabela de Velocidades Críticas (V-Speeds)' : 'Critical V-Speeds'}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-avionics">
                <div className="bg-[#1E293B] p-2.5 rounded-lg border border-[#334155]">
                  <div className="text-[#64748B] text-[10px]">Vr (Rotação):</div>
                  <strong className="text-white">55 kts</strong>
                </div>
                <div className="bg-[#1E293B] p-2.5 rounded-lg border border-[#334155]">
                  <div className="text-[#64748B] text-[10px]">Vx (Melhor Ângulo):</div>
                  <strong className="text-white">62 kts</strong>
                </div>
                <div className="bg-[#1E293B] p-2.5 rounded-lg border border-[#334155]">
                  <div className="text-[#64748B] text-[10px]">Vy (Melhor Razão):</div>
                  <strong className="text-white">74 kts</strong>
                </div>
                <div className="bg-[#1E293B] p-2.5 rounded-lg border border-[#334155]">
                  <div className="text-[#64748B] text-[10px]">Vne (Nunca Exceder):</div>
                  <strong className="text-rose-400">{activePlane.maxSpeedKts} kts</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Custom Livery & Paint Shop */}
        <div className="space-y-6">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center gap-2 text-sm font-medium text-white font-serif-display border-b border-[#1E293B] pb-3">
              <Paintbrush className="h-4 w-4 text-[#38BDF8]" />
              <span>{lang === 'pt' ? 'Oficina de Pintura & Esquemas' : 'Paint Shop & Custom Liveries'}</span>
            </div>

            {/* Livery Selection */}
            <div className="space-y-3">
              <div className="text-[10px] font-mono-avionics text-[#64748B] uppercase tracking-wider">ESQUEMAS DE PINTURA:</div>
              <div className="space-y-2">
                {activePlane.liveries.map((livery) => (
                  <button
                    key={livery.id}
                    onClick={() => handleSelectLivery(livery.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      (activePlane.selectedLiveryId || activePlane.liveries[0].id) === livery.id
                        ? 'bg-[#1E293B] border-[#38BDF8] text-white shadow-sm shadow-[#38BDF8]/10'
                        : 'bg-[#0A0C10] border-[#334155] text-[#E2E8F0] hover:bg-[#1E293B]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center -space-x-1">
                        <span className="h-4 w-4 rounded-full border border-[#0A0C10]" style={{ backgroundColor: livery.primaryColor }} />
                        <span className="h-4 w-4 rounded-full border border-[#0A0C10]" style={{ backgroundColor: livery.secondaryColor }} />
                      </div>
                      <span className="text-xs font-semibold font-serif-display">{livery.name}</span>
                    </div>
                    {(activePlane.selectedLiveryId || activePlane.liveries[0].id) === livery.id && (
                      <Check className="h-4 w-4 text-[#38BDF8]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Registration Tail Number */}
            <div className="space-y-3 pt-3 border-t border-[#1E293B]">
              <div className="text-[10px] font-mono-avionics text-[#64748B] uppercase tracking-wider">MATRÍCULA / TAIL NUMBER:</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTail}
                  onChange={(e) => setCustomTail(e.target.value.toUpperCase())}
                  placeholder="EX: PR-AER"
                  maxLength={8}
                  className="w-full px-3.5 py-2.5 bg-[#0A0C10] border border-[#334155] rounded-xl text-xs font-mono-avionics text-white focus:outline-none focus:border-[#38BDF8] uppercase font-bold"
                />
                <button
                  onClick={handleApplyTailNumber}
                  className="px-4 py-2.5 bg-[#1E293B] hover:bg-[#334155] text-[#E2E8F0] text-xs font-bold rounded-xl border border-[#334155] cursor-pointer transition-colors"
                >
                  {lang === 'pt' ? 'Gravar' : 'Apply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
