import { PilotAchievement, PilotCertificate, FlightManeuver } from '../types';

export const initialCertificates: PilotCertificate[] = [
  {
    id: 'cert_spl',
    title: 'Autorização de Voo Solo (Student Pilot Solo Endorsement)',
    code: 'SPL',
    level: 'Aluno Piloto em Instrução',
    authority: 'AeroAcademy Flight Operations Division / ICAO Compliant',
    privileges: 'Autorizado a comandar aeronaves monomotoras a pistão sob supervisão de instrutor de voo credenciado em condições VMC diurnas.',
    requirements: {
      minHours: 5,
      requiredLessonsCount: 2,
      requiredManeuversCount: 2,
      minScorePercent: 80,
    },
    certificateNumber: 'AA-SOLO-2026-8841',
    issueDate: '2026-08-30',
    isUnlocked: true,
    verificationHash: '8f4c2b9a7e110d9e4c5b3a1f99c8e21a',
    instructorName: 'Cap. Carlos Silveira (CFI-ANAC/FAA #98421)'
  },
  {
    id: 'cert_ppl',
    title: 'Licença de Piloto Privado de Avião (Private Pilot License - PPL)',
    code: 'PPL',
    level: 'Piloto Privado Monomotor Terrestre (MNTE)',
    authority: 'AeroAcademy & Federal Aviation Standards Board',
    privileges: 'Voo como Piloto em Comando (PIC) em voos não remunerados transportando passageiros em condições meteorológicas visuais (VFR).',
    requirements: {
      minHours: 15,
      requiredLessonsCount: 4,
      requiredManeuversCount: 4,
      minScorePercent: 85,
    },
    certificateNumber: 'AA-PPL-2026-9021',
    issueDate: '2026-08-31',
    isUnlocked: true,
    verificationHash: '3a7d9f1e8b2c401569a8b1c4e7f290d1',
    instructorName: 'Cap. Carlos Silveira (CFI-ANAC/FAA #98421)'
  },
  {
    id: 'cert_ir',
    title: 'Habilitação de Voo por Instrumentos (Instrument Rating - IFR)',
    code: 'IR',
    level: 'Habilitação IFR Sob Regras de Voo por Instrumentos',
    authority: 'AeroAcademy Flight Standards Board',
    privileges: 'Operação de aeronaves sob Condições Meteorológicas de Instrumentos (IMC), procedimentos de saída SID, STAR e aproximações de precisão ILS/RNAV.',
    requirements: {
      minHours: 30,
      requiredLessonsCount: 5,
      requiredManeuversCount: 6,
      minScorePercent: 90,
    },
    certificateNumber: 'AA-IFR-2026-9418',
    isUnlocked: false,
    requirementsDescription: 'Requer 30 horas totais de voo, módulo de IFR aprovado e aproximação ILS estabilizada.',
    instructorName: 'Cap. Carlos Silveira'
  },
  {
    id: 'cert_cpl',
    title: 'Licença de Piloto Comercial (Commercial Pilot License - CPL)',
    code: 'CPL',
    level: 'Piloto Comercial & Multi-Motor (MLTE)',
    authority: 'AeroAcademy Aviation Training Board',
    privileges: 'Exercício da profissão de aviador remunerado em transporte de passageiros, carga aérea, táxi aéreo e linhas executivas.',
    requirements: {
      minHours: 50,
      requiredLessonsCount: 6,
      requiredManeuversCount: 8,
      minScorePercent: 90,
    },
    certificateNumber: 'AA-CPL-2026-9902',
    isUnlocked: false,
    instructorName: 'Cap. Carlos Silveira'
  }
];

export const initialAchievements: PilotAchievement[] = [
  {
    id: 'ach_first_flight',
    title: 'Asas da Estreia',
    description: 'Decole e complete seu primeiro voo no simulador 3D.',
    category: 'flight_hours',
    icon: 'PlaneTakeoff',
    xpValue: 100,
    isUnlocked: true,
    unlockedAt: '2026-08-30',
    progress: 1,
    maxProgress: 1
  },
  {
    id: 'ach_butter_landing',
    title: 'Toque de Manteiga (<100 FPM)',
    description: 'Realize um pouso ultra suave com razão de descida inferior a -100 pés/minuto.',
    category: 'landings',
    icon: 'Feather',
    xpValue: 350,
    isUnlocked: true,
    unlockedAt: '2026-08-31',
    progress: 1,
    maxProgress: 1
  },
  {
    id: 'ach_stall_recovery',
    title: 'Mestre do Estol',
    description: 'Identifique e recupere com sucesso um estol de potência reduzida em menos de 10 segundos.',
    category: 'stalls_emergency',
    icon: 'ShieldAlert',
    xpValue: 250,
    isUnlocked: true,
    unlockedAt: '2026-08-31',
    progress: 1,
    maxProgress: 1
  },
  {
    id: 'ach_crosswind_ace',
    title: 'Ás do Vento de Través',
    description: 'Aterrise com vento de través superior a 15 nós no eixo da pista.',
    category: 'weather_ifr',
    icon: 'Wind',
    xpValue: 400,
    isUnlocked: false,
    progress: 8,
    maxProgress: 15
  },
  {
    id: 'ach_ground_school_master',
    title: 'Enciclopédia de Solo',
    description: 'Obtenha 100% de aproveitamento em todos os exames teóricos da Escola de Solo.',
    category: 'theory',
    icon: 'BookOpenCheck',
    xpValue: 500,
    isUnlocked: false,
    progress: 3,
    maxProgress: 6
  },
  {
    id: 'ach_night_owl',
    title: 'Coruja da Noite',
    description: 'Acumule 5 horas de voo noturno e realize 3 pousos noturnos iluminados.',
    category: 'flight_hours',
    icon: 'Moon',
    xpValue: 300,
    isUnlocked: false,
    progress: 2,
    maxProgress: 5
  },
  {
    id: 'ach_vr_aviator',
    title: 'Piloto Imersivo (VR)',
    description: 'Complete uma missão de treinamento utilizando o modo de Realidade Virtual (VR/WebXR).',
    category: 'mastery',
    icon: 'Glasses',
    xpValue: 200,
    isUnlocked: false,
    progress: 0,
    maxProgress: 1
  }
];

export const flightManeuversList: FlightManeuver[] = [
  {
    id: 'man_straight_level',
    title: 'Voo Reto e Nivelado (Straight & Level)',
    subtitle: 'Manutenção rigorosa de altitude, proa e velocidade',
    category: 'basics',
    difficulty: 'student',
    targetAircraftId: 'c172',
    briefing: 'Mantenha altitude de 3.000 pés e proa 090° a 100 nós de velocidade indicada. Utilize pequenos toques no compensador.',
    objectives: [
      { id: 'obj1', text: 'Manter Altitude em 3.000 ft ± 50 ft', targetValue: '3.000 ft' },
      { id: 'obj2', text: 'Manter Proa 090° ± 5°', targetValue: '090°' },
      { id: 'obj3', text: 'Manter Velocidade Indicada em 100 kts', targetValue: '100 kts' },
    ],
    initialState: {
      altitudeFt: 3000,
      airspeedKts: 100,
      headingDeg: 90,
      throttle: 0.65,
      flaps: 0,
      gearDown: false,
      onGround: false,
    },
    completionCriteria: {
      maintainAltitudeToleranceFt: 50,
      maintainSpeedToleranceKts: 5,
      maxTouchdownSinkRateFpm: 0,
      maxCenterlineDevFt: 0,
    }
  },
  {
    id: 'man_takeoff_climb',
    title: 'Decolagem Normal & Subida Inicial',
    subtitle: 'Alinhamento na cabeceira, rotação a 55 nós e subida a 74 nós (Vy)',
    category: 'takeoff_climb',
    difficulty: 'student',
    targetAircraftId: 'c172',
    briefing: 'Aplique 100% de potência suavemente mantendo o leme no eixo central da pista. A 55 nós, execute a rotação (puxar o manche suavemente) e estabilize a subida em 74 nós.',
    objectives: [
      { id: 'obj1', text: 'Acelerar com 100% de potência mantendo o eixo', targetValue: '100% THR' },
      { id: 'obj2', text: 'Rotacionar a 55 nós de velocidade indicada', targetValue: '55 kts' },
      { id: 'obj3', text: 'Subir mantendo 74 kts (Vy) e razão +700 fpm', targetValue: '74 kts' },
      { id: 'obj4', text: 'Atingir 1.500 pés AGL', targetValue: '1.500 ft' },
    ],
    initialState: {
      airportIcao: 'SBGR',
      runwayIdent: '10R',
      altitudeFt: 2450,
      airspeedKts: 0,
      headingDeg: 96,
      throttle: 0,
      flaps: 0,
      gearDown: true,
      onGround: true,
    },
    completionCriteria: {
      maintainAltitudeToleranceFt: 100,
      maintainSpeedToleranceKts: 8,
      maxTouchdownSinkRateFpm: 0,
      maxCenterlineDevFt: 15,
    }
  },
  {
    id: 'man_stall_recovery',
    title: 'Reconhecimento & Recuperação de Estol (Power-Off Stall)',
    subtitle: 'Simulação de perda de sustentação na aproximação final',
    category: 'stalls_emergencies',
    difficulty: 'intermediate',
    targetAircraftId: 'c172',
    briefing: 'Em 3.500 pés, reduza a potência para marcha lenta, cabre o nariz mantendo a altitude até soar o alarme de estol e sentir o afundamento. Imediatamente: BAIXE O NARIZ e APLIQUE POTÊNCIA TOTAL.',
    objectives: [
      { id: 'obj1', text: 'Reduzir potência para marcha lenta e cabrar o nariz', targetValue: 'IDLE' },
      { id: 'obj2', text: 'Aguardar o alarme de estol (< 48 kts)', targetValue: 'STALL' },
      { id: 'obj3', text: 'Ceder manche à frente e aplicar 100% potência', targetValue: 'RECOVERY' },
      { id: 'obj4', text: 'Restabelecer voo nivelado com perda mínima de altitude', targetValue: 'LEVEL' },
    ],
    initialState: {
      altitudeFt: 3500,
      airspeedKts: 75,
      headingDeg: 180,
      throttle: 0.4,
      flaps: 1,
      gearDown: false,
      onGround: false,
    },
    completionCriteria: {
      maintainAltitudeToleranceFt: 200,
      maintainSpeedToleranceKts: 10,
      maxTouchdownSinkRateFpm: 0,
      maxCenterlineDevFt: 0,
    }
  },
  {
    id: 'man_ils_approach',
    title: 'Aproximação ILS de Precisão & Pouso Suave',
    subtitle: 'Interceptação do Localizer e Rampa de Glideslope até a pista 10R',
    category: 'instrument_ifr',
    difficulty: 'advanced',
    targetAircraftId: 'c172',
    briefing: 'A 8 milhas da cabeceira a 3.000 pés, intercepte o curso do Localizer 096°. Quando a barra horizontal do Glideslope começar a descer, reduza para 1.700 RPM, estenda Flaps 20° e mantenha razão de descida de -450 fpm a 65 kts.',
    objectives: [
      { id: 'obj1', text: 'Manter Localizer centralizado (desvio < 0.1)', targetValue: 'LOC 0' },
      { id: 'obj2', text: 'Seguir o Glideslope (razão de descida -450 fpm)', targetValue: 'GS 0' },
      { id: 'obj3', text: 'Estabilizar velocidade final em 65 nós com Flaps Full', targetValue: '65 kts' },
      { id: 'obj4', text: 'Toque suave na zona de contato (< -150 fpm)', targetValue: '< -150 fpm' },
    ],
    initialState: {
      airportIcao: 'SBGR',
      runwayIdent: '10R',
      altitudeFt: 3000,
      airspeedKts: 90,
      headingDeg: 96,
      throttle: 0.55,
      flaps: 0,
      gearDown: true,
      onGround: false,
    },
    completionCriteria: {
      maintainAltitudeToleranceFt: 50,
      maintainSpeedToleranceKts: 5,
      maxTouchdownSinkRateFpm: 200,
      maxCenterlineDevFt: 10,
    }
  },
  {
    id: 'man_crosswind_landing',
    title: 'Pouso com Vento de Través (18 nós em Santos Dumont)',
    subtitle: 'Técnica de asa baixa contra o vento e alinhamento do leme na curta final',
    category: 'traffic_pattern',
    difficulty: 'advanced',
    targetAircraftId: 'pa28',
    briefing: 'Aproximação para a pista 02R no SBRJ com vento de 190° a 18 nós (vento cruzado da esquerda). Mantenha ângulo de caranguejo na final e aplique técnica de asa baixa com leme no flare.',
    objectives: [
      { id: 'obj1', text: 'Compensar deriva de vento na aproximação', targetValue: 'CRAB' },
      { id: 'obj2', text: 'Alinhar fuselagem com o eixo da pista antes do toque', targetValue: 'ALIGN' },
      { id: 'obj3', text: 'Tocar primeiro a roda do lado do vento (asa baixa)', targetValue: 'WING LOW' },
    ],
    initialState: {
      airportIcao: 'SBRJ',
      runwayIdent: '02R',
      altitudeFt: 1000,
      airspeedKts: 75,
      headingDeg: 22,
      throttle: 0.45,
      flaps: 2,
      gearDown: true,
      onGround: false,
    },
    completionCriteria: {
      maintainAltitudeToleranceFt: 60,
      maintainSpeedToleranceKts: 6,
      maxTouchdownSinkRateFpm: 250,
      maxCenterlineDevFt: 12,
    }
  }
];
