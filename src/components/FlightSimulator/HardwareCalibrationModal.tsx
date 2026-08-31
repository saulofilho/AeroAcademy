import React, { useState, useEffect } from 'react';
import { HardwareInputConfig, SupportedLanguage } from '../../types';
import { translations } from '../../i18n/translations';
import { Gamepad2, Sliders, CheckCircle2, RefreshCw, X, HelpCircle } from 'lucide-react';

interface HardwareCalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: SupportedLanguage;
  config: HardwareInputConfig;
  onSaveConfig: (cfg: HardwareInputConfig) => void;
}

export const HardwareCalibrationModal: React.FC<HardwareCalibrationModalProps> = ({
  isOpen,
  onClose,
  lang,
  config,
  onSaveConfig,
}) => {
  const [activeGamepad, setActiveGamepad] = useState<Gamepad | null>(null);
  const [rawAxes, setRawAxes] = useState<number[]>([0, 0, 0, 0]);
  const [rawButtons, setRawButtons] = useState<boolean[]>([]);
  const [localConfig, setLocalConfig] = useState<HardwareInputConfig>(config);

  useEffect(() => {
    if (!isOpen) return;

    let animId: number;
    const pollGamepads = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];
      if (gp) {
        setActiveGamepad(gp);
        setRawAxes([...gp.axes]);
        setRawButtons(gp.buttons.map(b => b.pressed));
      } else {
        setActiveGamepad(null);
      }
      animId = requestAnimationFrame(pollGamepads);
    };

    animId = requestAnimationFrame(pollGamepads);
    return () => cancelAnimationFrame(animId);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div id="hardware-calibration-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 flex flex-col gap-6 text-[#E2E8F0]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0A0C10] border border-[#334155] rounded-xl text-[#38BDF8]">
              <Gamepad2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-medium font-serif-display text-white">
                {lang === 'pt' ? 'Calibração de Hardware & Joysticks HOTAS' : 'Hardware & HOTAS Joystick Calibration'}
              </h2>
              <p className="text-xs text-[#94A3B8] font-sans">
                {lang === 'pt'
                  ? 'Suporte nativo a manches, manetes de potência, pedais de leme e gamepads USB/Bluetooth'
                  : 'Native support for flight sticks, throttles, rudder pedals and USB/Bluetooth controllers'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1E293B] rounded-xl text-[#94A3B8] hover:text-white cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Device Status */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          activeGamepad ? 'bg-[#0A0C10] border-[#22C55E]/40 text-[#22C55E]' : 'bg-[#0A0C10] border-[#FCD34D]/40 text-[#FCD34D]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`h-2.5 w-2.5 rounded-full ${activeGamepad ? 'bg-[#22C55E] animate-pulse' : 'bg-[#FCD34D]'}`} />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider font-mono-avionics">
                {activeGamepad ? (lang === 'pt' ? 'Dispositivo Conectado' : 'Device Connected') : (lang === 'pt' ? 'Nenhum Joystick Detectado' : 'No Controller Detected')}
              </div>
              <div className="text-sm font-semibold text-white font-serif-display">
                {activeGamepad ? activeGamepad.id : (lang === 'pt' ? 'Conecte seu manche ou gamepad USB e mova os eixos' : 'Plug in your flight stick or controller and move axes')}
              </div>
            </div>
          </div>
          <button
            onClick={() => {}}
            className="px-3 py-1.5 bg-[#1E293B] hover:bg-[#334155] rounded-lg text-xs flex items-center gap-1.5 text-[#E2E8F0] border border-[#334155] transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {lang === 'pt' ? 'Detectar' : 'Detect'}
          </button>
        </div>

        {/* Live Axis Visualization */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#38BDF8] flex items-center gap-2 font-mono-avionics">
            <Sliders className="h-4 w-4" />
            {lang === 'pt' ? 'Leitura em Tempo Real dos Eixos' : 'Real-time Axis Feedback'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pitch (Elevator) */}
            <div className="bg-[#0A0C10] p-3.5 rounded-xl border border-[#334155] space-y-2">
              <div className="flex justify-between text-xs font-mono-avionics">
                <span className="text-[#94A3B8]">{lang === 'pt' ? 'Eixo de Cabeceio (Pitch)' : 'Pitch Axis'}</span>
                <span className="text-[#38BDF8] font-bold">{(rawAxes[localConfig.axes.pitchAxis] || 0).toFixed(2)}</span>
              </div>
              <div className="h-2.5 bg-[#1E293B] rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-[#38BDF8] rounded-full transition-all duration-75"
                  style={{
                    width: `${Math.max(0, Math.min(100, (((rawAxes[localConfig.axes.pitchAxis] || 0) + 1) / 2) * 100))}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#64748B] font-mono-avionics">
                <span>Eixo: #{localConfig.axes.pitchAxis}</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-[#94A3B8]">
                  <input
                    type="checkbox"
                    checked={localConfig.axes.pitchInverted}
                    onChange={(e) => setLocalConfig({
                      ...localConfig,
                      axes: { ...localConfig.axes, pitchInverted: e.target.checked }
                    })}
                    className="rounded bg-[#1E293B] text-[#38BDF8] focus:ring-0"
                  />
                  <span>{lang === 'pt' ? 'Inverter' : 'Invert'}</span>
                </label>
              </div>
            </div>

            {/* Roll (Aileron) */}
            <div className="bg-[#0A0C10] p-3.5 rounded-xl border border-[#334155] space-y-2">
              <div className="flex justify-between text-xs font-mono-avionics">
                <span className="text-[#94A3B8]">{lang === 'pt' ? 'Eixo de Alabeo (Roll)' : 'Roll Axis'}</span>
                <span className="text-[#38BDF8] font-bold">{(rawAxes[localConfig.axes.rollAxis] || 0).toFixed(2)}</span>
              </div>
              <div className="h-2.5 bg-[#1E293B] rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-[#38BDF8] rounded-full transition-all duration-75"
                  style={{
                    width: `${Math.max(0, Math.min(100, (((rawAxes[localConfig.axes.rollAxis] || 0) + 1) / 2) * 100))}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#64748B] font-mono-avionics">
                <span>Eixo: #{localConfig.axes.rollAxis}</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-[#94A3B8]">
                  <input
                    type="checkbox"
                    checked={localConfig.axes.rollInverted}
                    onChange={(e) => setLocalConfig({
                      ...localConfig,
                      axes: { ...localConfig.axes, rollInverted: e.target.checked }
                    })}
                    className="rounded bg-[#1E293B] text-[#38BDF8] focus:ring-0"
                  />
                  <span>{lang === 'pt' ? 'Inverter' : 'Invert'}</span>
                </label>
              </div>
            </div>

            {/* Rudder (Yaw) */}
            <div className="bg-[#0A0C10] p-3.5 rounded-xl border border-[#334155] space-y-2">
              <div className="flex justify-between text-xs font-mono-avionics">
                <span className="text-[#94A3B8]">{lang === 'pt' ? 'Pedal de Leme (Yaw)' : 'Rudder Axis'}</span>
                <span className="text-[#38BDF8] font-bold">{(rawAxes[localConfig.axes.yawAxis] || 0).toFixed(2)}</span>
              </div>
              <div className="h-2.5 bg-[#1E293B] rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-[#38BDF8] rounded-full transition-all duration-75"
                  style={{
                    width: `${Math.max(0, Math.min(100, (((rawAxes[localConfig.axes.yawAxis] || 0) + 1) / 2) * 100))}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#64748B] font-mono-avionics">
                <span>Eixo: #{localConfig.axes.yawAxis}</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-[#94A3B8]">
                  <input
                    type="checkbox"
                    checked={localConfig.axes.yawInverted}
                    onChange={(e) => setLocalConfig({
                      ...localConfig,
                      axes: { ...localConfig.axes, yawInverted: e.target.checked }
                    })}
                    className="rounded bg-[#1E293B] text-[#38BDF8] focus:ring-0"
                  />
                  <span>{lang === 'pt' ? 'Inverter' : 'Invert'}</span>
                </label>
              </div>
            </div>

            {/* Throttle */}
            <div className="bg-[#0A0C10] p-3.5 rounded-xl border border-[#334155] space-y-2">
              <div className="flex justify-between text-xs font-mono-avionics">
                <span className="text-[#94A3B8]">{lang === 'pt' ? 'Manete de Potência' : 'Throttle Axis'}</span>
                <span className="text-[#FCD34D] font-bold">{(rawAxes[localConfig.axes.throttleAxis] || 0).toFixed(2)}</span>
              </div>
              <div className="h-2.5 bg-[#1E293B] rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-[#FCD34D] rounded-full transition-all duration-75"
                  style={{
                    width: `${Math.max(0, Math.min(100, (((rawAxes[localConfig.axes.throttleAxis] || 0) + 1) / 2) * 100))}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#64748B] font-mono-avionics">
                <span>Eixo: #{localConfig.axes.throttleAxis}</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-[#94A3B8]">
                  <input
                    type="checkbox"
                    checked={localConfig.axes.throttleInverted}
                    onChange={(e) => setLocalConfig({
                      ...localConfig,
                      axes: { ...localConfig.axes, throttleInverted: e.target.checked }
                    })}
                    className="rounded bg-[#1E293B] text-[#FCD34D] focus:ring-0"
                  />
                  <span>{lang === 'pt' ? 'Inverter' : 'Invert'}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Deadzone & Sensitivity Sliders */}
        <div className="bg-[#0A0C10] p-4 rounded-xl border border-[#334155] grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs font-mono-avionics text-[#94A3B8] mb-1.5">
              <span>{lang === 'pt' ? 'Zona Morta (Deadzone)' : 'Deadzone'}</span>
              <strong className="text-[#38BDF8]">{Math.round(localConfig.deadzone * 100)}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              value={Math.round(localConfig.deadzone * 100)}
              onChange={(e) => setLocalConfig({ ...localConfig, deadzone: Number(e.target.value) / 100 })}
              className="w-full h-2 bg-[#1E293B] rounded-lg appearance-none cursor-pointer accent-[#38BDF8]"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs font-mono-avionics text-[#94A3B8] mb-1.5">
              <span>{lang === 'pt' ? 'Sensibilidade Linear' : 'Sensitivity'}</span>
              <strong className="text-[#38BDF8]">{localConfig.sensitivity.toFixed(1)}x</strong>
            </div>
            <input
              type="range"
              min="5"
              max="20"
              value={Math.round(localConfig.sensitivity * 10)}
              onChange={(e) => setLocalConfig({ ...localConfig, sensitivity: Number(e.target.value) / 10 })}
              className="w-full h-2 bg-[#1E293B] rounded-lg appearance-none cursor-pointer accent-[#38BDF8]"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E293B]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[#334155] text-[#94A3B8] hover:bg-[#1E293B] text-xs font-semibold cursor-pointer transition-colors"
          >
            {lang === 'pt' ? 'Cancelar' : 'Cancel'}
          </button>
          <button
            onClick={() => {
              onSaveConfig(localConfig);
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#0284C7] text-[#0A0C10] text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#38BDF8]/15 cursor-pointer transition-all"
          >
            <CheckCircle2 className="h-4 w-4" />
            {lang === 'pt' ? 'Salvar Configurações' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
};
