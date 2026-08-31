import { LogbookEntry, PilotCertificate, PilotAchievement, AircraftSpecs, PushNotificationItem, SupportedLanguage } from '../types';
import { initialCertificates, initialAchievements } from '../data/achievementsData';
import { initialAircraftFleet } from '../data/aircraftData';

const LOGBOOK_KEY = 'aeroacademy_logbook_v1';
const CERTS_KEY = 'aeroacademy_certs_v1';
const ACHIEVEMENTS_KEY = 'aeroacademy_achievements_v1';
const AIRCRAFT_KEY = 'aeroacademy_aircraft_v1';
const SELECTED_PLANE_KEY = 'aeroacademy_selected_plane_v1';
const NOTIFICATIONS_KEY = 'aeroacademy_notifications_v1';
const LANG_KEY = 'aeroacademy_language_v1';

const defaultLogbookEntries: LogbookEntry[] = [
  {
    id: 'log_001',
    date: '2026-08-28',
    aircraftId: 'c172',
    aircraftReg: 'PR-AER',
    departureIcao: 'SBGR',
    arrivalIcao: 'SBGR',
    durationMinutes: 45,
    landingsDay: 3,
    landingsNight: 0,
    instrumentMinutes: 0,
    crossCountryMinutes: 0,
    soloMinutes: 0,
    remarks: 'Instrução de decolagem, subida para o nível do circuito (3.500 ft) e toques e arremetidas na pista 10R.',
    flightScore: 92,
    grade: 'A',
    telemetrySummary: {
      maxAltitudeFt: 3500,
      maxSpeedKts: 110,
      maxGForce: 1.4,
      landingRateFpm: -120,
      touchdownZoneAccuracyPct: 95
    }
  },
  {
    id: 'log_002',
    date: '2026-08-30',
    aircraftId: 'c172',
    aircraftReg: 'PR-AER',
    departureIcao: 'SBGR',
    arrivalIcao: 'SBRJ',
    durationMinutes: 75,
    landingsDay: 1,
    landingsNight: 0,
    instrumentMinutes: 30,
    crossCountryMinutes: 75,
    soloMinutes: 75,
    remarks: 'Primeiro voo solo de navegação estimada São Paulo - Rio de Janeiro. Aproximação visual na Baía de Guanabara.',
    flightScore: 96,
    grade: 'A+',
    telemetrySummary: {
      maxAltitudeFt: 8500,
      maxSpeedKts: 125,
      maxGForce: 1.2,
      landingRateFpm: -85,
      touchdownZoneAccuracyPct: 98
    }
  }
];

const defaultNotifications: PushNotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Desafio Semanal de Voo: Pouso em Madeira',
    message: 'Novo desafio meteorológico ativo: Pouso com vento de través de 25 nós na cabeceira 05 da Ilha da Madeira.',
    timestamp: 'Há 2 horas',
    isRead: false,
    type: 'challenge',
    actionTab: 'simulator'
  },
  {
    id: 'notif_2',
    title: 'Certificado de Voo Solo Emitido!',
    message: 'Parabéns! Sua autorização de Aluno Piloto Solo foi deferida e autenticada com sucesso.',
    timestamp: 'Ontem',
    isRead: true,
    type: 'certificate',
    actionTab: 'certifications'
  }
];

export const OfflineStorageService = {
  getLanguage(): SupportedLanguage {
    return (localStorage.getItem(LANG_KEY) as SupportedLanguage) || 'pt';
  },

  setLanguage(lang: SupportedLanguage) {
    localStorage.setItem(LANG_KEY, lang);
  },

  getLogbook(): LogbookEntry[] {
    try {
      const data = localStorage.getItem(LOGBOOK_KEY);
      return data ? JSON.parse(data) : defaultLogbookEntries;
    } catch (e) {
      return defaultLogbookEntries;
    }
  },

  addLogbookEntry(entry: LogbookEntry) {
    const current = this.getLogbook();
    const updated = [entry, ...current];
    localStorage.setItem(LOGBOOK_KEY, JSON.stringify(updated));
    return updated;
  },

  getCertificates(): PilotCertificate[] {
    try {
      const data = localStorage.getItem(CERTS_KEY);
      return data ? JSON.parse(data) : initialCertificates;
    } catch (e) {
      return initialCertificates;
    }
  },

  updateCertificates(certs: PilotCertificate[]) {
    localStorage.setItem(CERTS_KEY, JSON.stringify(certs));
  },

  getAchievements(): PilotAchievement[] {
    try {
      const data = localStorage.getItem(ACHIEVEMENTS_KEY);
      return data ? JSON.parse(data) : initialAchievements;
    } catch (e) {
      return initialAchievements;
    }
  },

  updateAchievements(achievements: PilotAchievement[]) {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
  },

  getFleet(): AircraftSpecs[] {
    try {
      const data = localStorage.getItem(AIRCRAFT_KEY);
      return data ? JSON.parse(data) : initialAircraftFleet;
    } catch (e) {
      return initialAircraftFleet;
    }
  },

  updateFleet(fleet: AircraftSpecs[]) {
    localStorage.setItem(AIRCRAFT_KEY, JSON.stringify(fleet));
  },

  getSelectedAircraftId(): string {
    return localStorage.getItem(SELECTED_PLANE_KEY) || 'c172';
  },

  setSelectedAircraftId(id: string) {
    localStorage.setItem(SELECTED_PLANE_KEY, id);
  },

  getNotifications(): PushNotificationItem[] {
    try {
      const data = localStorage.getItem(NOTIFICATIONS_KEY);
      return data ? JSON.parse(data) : defaultNotifications;
    } catch (e) {
      return defaultNotifications;
    }
  },

  addNotification(notif: PushNotificationItem) {
    const list = this.getNotifications();
    const updated = [notif, ...list];
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    return updated;
  },

  markAllNotificationsRead() {
    const list = this.getNotifications().map(n => ({ ...n, isRead: true }));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
    return list;
  }
};
