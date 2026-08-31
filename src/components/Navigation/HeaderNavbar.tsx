import React, { useState } from 'react';
import { SupportedLanguage, PushNotificationItem } from '../../types';
import { translations } from '../../i18n/translations';
import { NotificationsDropdown } from '../NotificationsDropdown';
import {
  Compass,
  Plane,
  BookOpen,
  Award,
  BookMarked,
  Warehouse,
  MapPin,
  MessageSquare,
  Trophy,
  Headphones,
  Bell,
  Globe,
  Radio,
  Sparkles,
} from 'lucide-react';

interface HeaderNavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  lang: SupportedLanguage;
  onChangeLang: (lang: SupportedLanguage) => void;
  notifications: PushNotificationItem[];
  onMarkNotificationsRead: () => void;
  totalFlightHours: number;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  activeTab,
  onSelectTab,
  lang,
  onChangeLang,
  notifications,
  onMarkNotificationsRead,
  totalFlightHours,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const t = translations[lang].nav;
  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;

  const navItems = [
    { id: 'simulator', label: t.simulator, icon: Plane },
    { id: 'theory', label: t.theory, icon: BookOpen },
    { id: 'certifications', label: t.certifications, icon: Award },
    { id: 'logbook', label: t.logbook, icon: BookMarked },
    { id: 'hangar', label: t.hangar, icon: Warehouse },
    { id: 'airports', label: t.airports, icon: MapPin },
    { id: 'community', label: t.community, icon: MessageSquare },
    { id: 'achievements', label: t.achievements, icon: Trophy },
    { id: 'support', label: t.support, icon: Headphones },
  ];

  return (
    <header id="aviation-header-navbar" className="sticky top-0 z-40 bg-[#0F172A] border-b border-[#1E293B] shadow-lg">
      {/* Top Ticker Bar: METAR & Quick Flight Ops Status */}
      <div className="bg-[#0A0C10] px-4 sm:px-8 py-1.5 border-b border-[#1E293B] flex items-center justify-between text-[11px] font-mono-avionics text-[#94A3B8]">
        <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap scrollbar-none">
          <span className="flex items-center gap-1.5 text-[#38BDF8] font-bold">
            <Radio className="h-3.5 w-3.5 animate-pulse text-[#38BDF8]" /> ATIS SBGR:
          </span>
          <span className="text-[#E2E8F0]">INFO B 10008KT 9999 FEW030 22/15 Q1018 NOSIG</span>
          <span className="text-[#334155]">|</span>
          <span className="text-[#22C55E] font-bold">ATIS SBRJ:</span>
          <span className="text-[#E2E8F0]">INFO C 19018KT 9999 SCT025 24/18 Q1016</span>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-[#64748B] shrink-0 text-[10px] uppercase tracking-widest font-medium">
          <span>XPDR: <strong className="text-[#FCD34D] font-mono-avionics">1200 VFR</strong></span>
          <span>TOTAL TIME: <strong className="text-[#38BDF8] font-mono-avionics">{totalFlightHours.toFixed(1)}h</strong></span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onSelectTab('simulator')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 bg-[#38BDF8] rounded-xl flex items-center justify-center text-[#0A0C10] font-bold text-xl shadow-md shadow-[#38BDF8]/10 group-hover:scale-105 transition-transform font-serif-display">
            A
          </div>
          <div className="border-l border-[#334155] pl-3.5">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg tracking-[0.18em] uppercase font-light text-white font-serif-display">
                AeroAcademy
              </span>
              <span className="text-[9px] uppercase tracking-widest font-mono-avionics px-2 py-0.5 rounded bg-[#1E293B] text-[#38BDF8] border border-[#334155] font-semibold">
                PRO
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono-avionics hidden sm:block">
              Flight Training & 3D WebXR Simulation
            </p>
          </div>
        </div>

        {/* Action Controls: VR Status, Notifications, Language */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 border border-[#334155] rounded-xl bg-[#0A0C10] text-[10px] uppercase tracking-wider font-bold text-[#FCD34D]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
            <span>VR & Hardware Ready</span>
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button
              id="btn-notifications-bell"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-[#94A3B8] hover:text-white cursor-pointer relative transition-colors"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#38BDF8] text-[9px] font-bold text-[#0A0C10] flex items-center justify-center animate-pulse font-mono-avionics">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            <NotificationsDropdown
              isOpen={isNotifOpen}
              onClose={() => setIsNotifOpen(false)}
              notifications={notifications}
              lang={lang}
              onMarkRead={onMarkNotificationsRead}
              onSelectAction={(tab) => {
                if (tab) onSelectTab(tab);
                setIsNotifOpen(false);
              }}
            />
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button
              id="btn-language-selector"
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="px-3 py-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-xs font-mono-avionics font-bold text-[#E2E8F0] flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Globe className="h-3.5 w-3.5 text-[#38BDF8]" />
              <span className="uppercase">{lang}</span>
            </button>

            {isLangOpen && (
              <div className="absolute right-0 top-12 bg-[#0F172A] border border-[#334155] rounded-2xl shadow-2xl p-1.5 space-y-1 z-50 min-w-[130px] text-xs font-mono-avionics">
                {[
                  { code: 'pt', label: 'Português' },
                  { code: 'en', label: 'English' },
                  { code: 'es', label: 'Español' },
                  { code: 'fr', label: 'Français' },
                  { code: 'de', label: 'Deutsch' },
                ].map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      onChangeLang(l.code as SupportedLanguage);
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                      lang === l.code ? 'bg-[#1E293B] text-[#38BDF8] font-bold border border-[#334155]' : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-3 overflow-x-auto scrollbar-none flex items-center gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`px-4 py-2 rounded-xl text-xs uppercase tracking-[0.14em] font-medium whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-[#1E293B] text-[#38BDF8] border border-[#38BDF8] shadow-md shadow-[#38BDF8]/10'
                  : 'bg-[#0A0C10] hover:bg-[#1E293B] border border-[#1E293B] text-[#94A3B8] hover:text-[#E2E8F0]'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#38BDF8]' : 'text-[#64748B]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
