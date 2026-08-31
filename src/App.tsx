import React, { useState, useEffect } from 'react';
import {
  AircraftSpecs,
  AirportInfo,
  DynamicWeatherConfig,
  FlightManeuver,
  LogbookEntry,
  SupportedLanguage,
  PushNotificationItem,
} from './types';
import { initialAircraftFleet } from './data/aircraftData';
import { globalAirportsList } from './data/airportsData';
import { flightManeuversList } from './data/achievementsData';
import { OfflineStorageService } from './services/offlineStorage';
import { HeaderNavbar } from './components/Navigation/HeaderNavbar';
import { FlightSimulator3D } from './components/FlightSimulator/FlightSimulator3D';
import { TheoryModule } from './components/TheoryGroundSchool/TheoryModule';
import { CertificationsModule } from './components/Certifications/CertificationsModule';
import { LogbookModule } from './components/Logbook/LogbookModule';
import { HangarModule } from './components/Hangar/HangarModule';
import { AirportsModule } from './components/Airports/AirportsModule';
import { CommunityModule } from './components/Community/CommunityModule';
import { AchievementsModule } from './components/Achievements/AchievementsModule';
import { SupportModule } from './components/Support247/SupportModule';
import { SocialShareModal } from './components/SocialShareModal';
import { PostFlightDebriefModal } from './components/FlightSimulator/PostFlightDebriefModal';
import { translations } from './i18n/translations';
import { Plane, Compass, Award, Shield, Wifi, WifiOff } from 'lucide-react';

export function App() {
  const [lang, setLang] = useState<SupportedLanguage>(OfflineStorageService.getLanguage());
  const [activeTab, setActiveTab] = useState<string>('simulator');
  const [logbook, setLogbook] = useState<LogbookEntry[]>(OfflineStorageService.getLogbook());
  const [notifications, setNotifications] = useState<PushNotificationItem[]>(OfflineStorageService.getNotifications());
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Flight Simulation Selection State
  const [fleet, setFleet] = useState<AircraftSpecs[]>(OfflineStorageService.getFleet());
  const [currentAircraft, setCurrentAircraft] = useState<AircraftSpecs>(fleet[0]);
  const [currentAirport, setCurrentAirport] = useState<AirportInfo>(globalAirportsList[0]);
  const [currentWeather, setCurrentWeather] = useState<DynamicWeatherConfig>({
    windSpeedKts: 8,
    windDirectionDeg: 100,
    gustsKts: 0,
    visibilityKm: 10,
    clouds: 'few',
    cloudBaseFt: 3000,
    temperatureC: 22,
    dewPointC: 15,
    qnhHpa: 1018,
    turbulence: 'none',
    rainIntensity: 0,
    timeOfDay: 'day',
  });
  const [activeManeuver, setActiveManeuver] = useState<FlightManeuver | undefined>(flightManeuversList[1]);

  // Modals
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareEntry, setShareEntry] = useState<LogbookEntry | null>(null);
  const [selectedDebriefEntry, setSelectedDebriefEntry] = useState<LogbookEntry | null>(null);

  // Online / Offline monitor
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleChangeLanguage = (newLang: SupportedLanguage) => {
    setLang(newLang);
    OfflineStorageService.setLanguage(newLang);
  };

  const handleSaveFlightLog = (entry: LogbookEntry) => {
    const updated = OfflineStorageService.addLogbookEntry(entry);
    setLogbook(updated);

    // Notify user
    const newNotif: PushNotificationItem = {
      id: `notif_${Date.now()}`,
      title: lang === 'pt' ? 'Voo Registrado na Caderneta' : 'Flight Logged to Logbook',
      message: `${entry.departureIcao} ➔ ${entry.arrivalIcao} (${entry.durationMinutes} min) - Grau ${entry.grade}`,
      timestamp: 'Agora',
      isRead: false,
      type: 'flight_logged',
      actionTab: 'logbook',
    };
    const updatedNotifs = OfflineStorageService.addNotification(newNotif);
    setNotifications(updatedNotifs);
  };

  const handleMarkNotificationsRead = () => {
    const updated = OfflineStorageService.markAllNotificationsRead();
    setNotifications(updated);
  };

  const totalFlightHours = logbook.reduce((sum, e) => sum + e.durationMinutes, 0) / 60;

  return (
    <div id="aeroacademy-app-root" className="min-h-screen bg-[#0A0C10] text-[#E2E8F0] flex flex-col selection:bg-[#38BDF8] selection:text-[#0A0C10]">
      {/* Top Aviation Navigation Header */}
      <HeaderNavbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        lang={lang}
        onChangeLang={handleChangeLanguage}
        notifications={notifications}
        onMarkNotificationsRead={handleMarkNotificationsRead}
        totalFlightHours={totalFlightHours}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Offline Status Badge Banner if offline */}
        {!isOnline && (
          <div className="bg-[#1E293B] border border-[#FCD34D]/40 text-[#FCD34D] px-4 py-2.5 rounded-xl flex items-center justify-between text-xs font-mono-avionics shadow-lg">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 text-[#FCD34D]" />
              <span>{lang === 'pt' ? 'MODO OFFLINE ATIVO - Todos os tutoriais, manuais e simulador disponíveis localmente' : 'OFFLINE MODE ACTIVE - All ground lessons and flight physics cached locally'}</span>
            </div>
            <span className="font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#0A0C10] border border-[#334155]">LOCAL CACHE READY</span>
          </div>
        )}

        {/* Tab 1: 3D Flight Simulator */}
        {activeTab === 'simulator' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <FlightSimulator3D
              currentAircraft={currentAircraft}
              currentAirport={currentAirport}
              currentWeather={currentWeather}
              activeManeuver={activeManeuver}
              lang={lang}
              onSaveFlightLog={handleSaveFlightLog}
              onOpenShareModal={(entry) => {
                setShareEntry(entry);
                setIsShareModalOpen(true);
              }}
              onNavigateTab={setActiveTab}
            />
          </div>
        )}

        {/* Tab 2: Theory Ground School */}
        {activeTab === 'theory' && (
          <div className="animate-in fade-in duration-200">
            <TheoryModule
              lang={lang}
              onStartPracticalManeuver={(lessonId) => {
                const matchedManeuver = flightManeuversList.find(m => m.id.includes('stall')) || flightManeuversList[0];
                setActiveManeuver(matchedManeuver);
                setActiveTab('simulator');
              }}
            />
          </div>
        )}

        {/* Tab 3: Official Certifications & Licenses */}
        {activeTab === 'certifications' && (
          <div className="animate-in fade-in duration-200">
            <CertificationsModule
              lang={lang}
              totalFlightHours={totalFlightHours}
              onOpenShareModal={() => {
                setShareEntry(logbook[0] || null);
                setIsShareModalOpen(true);
              }}
            />
          </div>
        )}

        {/* Tab 4: Flight Logbook */}
        {activeTab === 'logbook' && (
          <div className="animate-in fade-in duration-200">
            <LogbookModule
              logbook={logbook}
              lang={lang}
              onSelectEntry={(entry) => setSelectedDebriefEntry(entry)}
            />
          </div>
        )}

        {/* Tab 5: Executive Hangar & Fleet Customizer */}
        {activeTab === 'hangar' && (
          <div className="animate-in fade-in duration-200">
            <HangarModule
              selectedAircraftId={currentAircraft.id}
              lang={lang}
              onSelectAircraft={(plane) => setCurrentAircraft(plane)}
              onUpdateAircraft={(updated) => {
                const newFleet = fleet.map(p => p.id === updated.id ? updated : p);
                setFleet(newFleet);
                OfflineStorageService.updateFleet(newFleet);
                setCurrentAircraft(updated);
              }}
              onStartFlightWithPlane={(plane) => {
                setCurrentAircraft(plane);
                setActiveTab('simulator');
              }}
            />
          </div>
        )}

        {/* Tab 6: Global Airports & Scenarios */}
        {activeTab === 'airports' && (
          <div className="animate-in fade-in duration-200">
            <AirportsModule
              selectedAirport={currentAirport}
              lang={lang}
              onSelectAirport={(airport) => setCurrentAirport(airport)}
              onStartFlightAtAirport={(airport, weather) => {
                setCurrentAirport(airport);
                if (weather) setCurrentWeather(weather);
                setActiveTab('simulator');
              }}
            />
          </div>
        )}

        {/* Tab 7: Community Forum */}
        {activeTab === 'community' && (
          <div className="animate-in fade-in duration-200">
            <CommunityModule lang={lang} />
          </div>
        )}

        {/* Tab 8: Achievements & Rank Tiers */}
        {activeTab === 'achievements' && (
          <div className="animate-in fade-in duration-200">
            <AchievementsModule
              lang={lang}
              totalFlightHours={totalFlightHours}
            />
          </div>
        )}

        {/* Tab 9: 24/7 Dedicated Support */}
        {activeTab === 'support' && (
          <div className="animate-in fade-in duration-200">
            <SupportModule lang={lang} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1E293B] bg-[#0F172A] py-6 text-center text-xs font-mono-avionics text-[#64748B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] uppercase tracking-widest">
          <div className="flex items-center gap-2 text-[#94A3B8]">
            <Shield className="h-4 w-4 text-[#38BDF8]" />
            <span>AeroAcademy Pro • ICAO / FAA / ANAC Standards Compliant</span>
          </div>
          <div className="flex gap-4 text-[#64748B]">
            <span>Server: <strong className="text-[#22C55E]">🟢 Global-North-01</strong></span>
            <span>Support: <strong className="text-[#E2E8F0]">24/7 Dedicated</strong></span>
          </div>
        </div>
      </footer>

      {/* Global Share Modal */}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        lang={lang}
        entry={shareEntry}
      />

      {/* Global Selected Debrief Modal */}
      {selectedDebriefEntry && (
        <PostFlightDebriefModal
          isOpen={!!selectedDebriefEntry}
          onClose={() => setSelectedDebriefEntry(null)}
          lang={lang}
          entry={selectedDebriefEntry}
          onShare={() => {
            setShareEntry(selectedDebriefEntry);
            setIsShareModalOpen(true);
          }}
          onGoToLogbook={() => setSelectedDebriefEntry(null)}
        />
      )}
    </div>
  );
}

export default App;
