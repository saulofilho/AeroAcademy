import { TheoryLesson } from '../types';

export const theoreticalLessons: TheoryLesson[] = [
  {
    id: 'lesson_aerodynamics_101',
    moduleCategory: 'aerodynamics',
    title: 'Princípios Fundamentais do Voo & As 4 Forças',
    estimatedMinutes: 15,
    summary: 'Compreenda a geração de sustentação pela equação de Bernoulli e 3ª Lei de Newton, resistência ao avanço, tração e gravidade.',
    contentSections: [
      {
        heading: '1. O Equilíbrio das Quatro Forças',
        text: 'Em voo reto e nivelado a velocidade constante, quatro forças estão em perfeito equilíbrio: Sustentação (Lift) é igual ao Peso (Weight), e a Tração (Thrust) é igual ao Arrasto (Drag). Qualquer alteração no vetor de sustentação ou tração acelera o avião em um ou mais eixos tridimensionais.',
        keyTakeaway: 'L = W e T = D para voo não acelerado em altitude constante.',
        diagramType: 'forces_of_flight',
      },
      {
        heading: '2. Ângulo de Ataque (AoA) e Estol Aerodinâmico',
        text: 'O estol (stall) ocorre quando a asa atinge seu Ângulo Crítico de Ataque (geralmente entre 15° e 18°), causando o descolamento violento da camada limite de ar do extradorso da asa. O estol pode ocorrer em QUALQUER velocidade ou atitude de voo se o ângulo crítico for ultrapassado.',
        keyTakeaway: 'Para recuperar o estol: BAIXE O NARIZ IMEDIATAMENTE (reduza o AoA) e aplique potência máxima.',
        diagramType: 'stall_angle_curve',
      }
    ],
    checklistItems: [
      'Verificar velocidade indicada em relação à Vs (velocidade de estol)',
      'Monitorar ailerons e pedais para voo coordenado sem glissagem não intencional',
      'Confirmar que compensador está ajustado para alívio de esforço no manche',
    ],
    quiz: [
      {
        id: 'q1_aero',
        question: 'Em que condição ocorre o estol aerodinâmico?',
        options: [
          'Apenas quando a velocidade indicada atinge zero',
          'Quando o ângulo de ataque crítico é ultrapassado, independentemente da velocidade',
          'Apenas com o motor desligado',
          'Quando os flaps são recolhidos muito rapidamente'
        ],
        correctIndex: 1,
        explanation: 'O estol é um fenômeno puramente angular: ocorre quando o fluxo de ar se descola do extradorso da asa ao exceder o ângulo de ataque crítico.'
      },
      {
        id: 'q2_aero',
        question: 'Qual é a ação imediata primária para recuperar uma aeronave de uma condição de estol iminente?',
        options: [
          'Puxar o manche para trás com força para ganhar altitude',
          'Reduzir a potência e inclinar a asa em 60 graus',
          'Ceder o manche para frente reduzindo o ângulo de ataque e aplicar potência conforme necessário',
          'Puxar o freio de emergência'
        ],
        correctIndex: 2,
        explanation: 'Reduzir o ângulo de ataque cedendo a pressão no manche restabelece o fluxo de ar laminar sobre as asas.'
      }
    ]
  },
  {
    id: 'lesson_instruments_sixpack',
    moduleCategory: 'instruments',
    title: 'Painel Clássico de 6 Instrumentos & Sistema Pitot-Estático',
    estimatedMinutes: 20,
    summary: 'Domine a leitura cruzada (cross-check) do Velocímetro, Horizonte Artificial, Altímetro, Indicador de Curva, Giro Direcional e Variômetro.',
    contentSections: [
      {
        heading: '1. Sistema Pitot-Estático',
        text: 'O tubo de Pitot mede a pressão total de impacto do ar, enquanto a tomada estática mede a pressão ambiente ao redor da fuselagem. O velocímetro utiliza ambas as pressões (dinâmica = total - estática). O altímetro e o variômetro (VSI) utilizam exclusivamente a pressão estática.',
        keyTakeaway: 'Em caso de bloqueio do tubo de pitot por gelo, ligue o Pitot Heat e confie no horizonte e atitude.',
        diagramType: 'airspeed_indicator',
      },
      {
        heading: '2. Ajuste de Altímetro (QNH vs QNE)',
        text: 'O altímetro mede a altura da coluna de ar barométrica. Ao ajustar a subescala Kollsman com o QNH fornecido pela torre ou ATIS local, o altímetro indicará a altitude exata em relação ao nível médio do mar (MSL). Acima da altitude de transição, utiliza-se o padrão 1013,2 hPa / 29.92 inHg (QNE - Nível de Voo).',
        keyTakeaway: 'Ajuste de altímetro incorreto pode gerar erros de centenas de pés perto de obstáculos!',
        diagramType: 'altimeter_qnh',
      }
    ],
    quiz: [
      {
        id: 'q1_inst',
        question: 'Quais instrumentos do painel dependem exclusivamente da pressão estática para funcionar?',
        options: [
          'Velocímetro e Giro Direcional',
          'Altímetro e Variômetro (Vertical Speed Indicator)',
          'Tubo de Pitot e Horizonte Artificial',
          'Bússola Magnética e Tacômetro'
        ],
        correctIndex: 1,
        explanation: 'O altímetro e o variômetro operam através da variação da pressão estática da atmosfera conforme a altitude se altera.'
      },
      {
        id: 'q2_inst',
        question: 'O que o ajuste QNH representa no altímetro?',
        options: [
          'Pressão padrão ao nível do mar (1013.25 hPa fixa)',
          'Pressão atmosférica local corrigida para o nível médio do mar',
          'Altura em relação à pista apenas',
          'Velocidade do vento na cabeceira'
        ],
        correctIndex: 1,
        explanation: 'O QNH faz o altímetro indicar a altitude real em relação ao nível do mar (MSL) quando a aeronave está no aeródromo.'
      }
    ]
  },
  {
    id: 'lesson_traffic_pattern',
    moduleCategory: 'regulations',
    title: 'Circuito de Tráfego Padrão & Pousos Seguros',
    estimatedMinutes: 25,
    summary: 'Aprenda as 5 pernas do circuito de tráfego: Decolagem, Vento Cruzado, Vento em Cauda, Base e Final, além da técnica de arredondamento (flare).',
    contentSections: [
      {
        heading: '1. As 5 Pernas do Circuito de Tráfego VFR',
        text: 'O circuito de tráfego padrão é realizado com curvas à esquerda a 1.000 pés acima da elevação do aeródromo (TPA). É composto por: Perna Contra o Vento (Upwind), Perna de Vento Cruzado (Crosswind), Perna do Vento (Downwind), Perna Base (Base) e Reta Final (Final).',
        keyTakeaway: 'Mantenha a altitude do circuito na perna do vento e reduza potência com aplicação gradual de flaps.',
        diagramType: 'standard_traffic_pattern',
      },
      {
        heading: '2. Estabilização da Aproximação & Pouso Suave',
        text: 'Uma aproximação é dita estabilizada quando a aeronave está no perfil correto de descida (geralmente 3 graus), velocidade de aproximação Vref ±5 nós, alinhada com o eixo da pista e com potência estável. A 20-30 pés, inicie o flare suavemente olhando para o final da pista.',
        keyTakeaway: 'Se não estiver estabilizado a 500 pés AGL: ARLIQUE POTÊNCIA TOTAL E ARREMETA (Go-Around)!',
      }
    ],
    checklistItems: [
      'Perna do Vento: Mistura Rica, Farol Ligado, Bomba Ligada, Flap 10° a 80 kts',
      'Perna Base: Redução de potência para 1500 RPM, Flap 20°, velocidade 70 kts',
      'Reta Final: Flap Full (30°), velocidade de aproximação 65 kts, verificar pista livre',
    ],
    quiz: [
      {
        id: 'q1_traf',
        question: 'Qual é o sentido padrão de curva no circuito de tráfego aeronáutico, salvo instrução contrária da torre?',
        options: [
          'Curvas à direita',
          'Curvas à esquerda (padrão standard)',
          'Em linha reta alternada',
          'Livre escolha do piloto'
        ],
        correctIndex: 1,
        explanation: 'Por padrão internacional OACI/FAA/ANAC, o circuito de tráfego é padrão pela esquerda para garantir melhor visibilidade do piloto em comando.'
      },
      {
        id: 'q2_traf',
        question: 'O que o piloto deve fazer se a aproximação estiver desestabilizada a 300 pés do solo?',
        options: [
          'Forçar o nariz para baixo para tocar a qualquer custo',
          'Executar o procedimento de arremetida (Go-Around), aplicando potência máxima e subindo com segurança',
          'Desligar os motores e usar os freios',
          'Aguardar o toque e depois frear bruscamente'
        ],
        correctIndex: 1,
        explanation: 'A arremetida é a decisão de segurança mais importante na aviação quando a aproximação não está rigorosamente estabilizada.'
      }
    ]
  },
  {
    id: 'lesson_emergencies_engine_out',
    moduleCategory: 'emergencies',
    title: 'Procedimentos de Emergência: Pane de Motor & Pouso Forçado',
    estimatedMinutes: 25,
    summary: 'A regra de ouro do aviador: Aviate, Navigate, Communicate. Como planejar o melhor campo de pouso e gerenciar o planeio.',
    contentSections: [
      {
        heading: '1. A Regra Primária: Aviate, Navigate, Communicate',
        text: 'Em caso de emergência súbita: 1. VOE O AVIÃO: Estabeleça imediatamente a velocidade de melhor razão de planeio (Best Glide - 65 kts no C172). 2. NAVEGUE: Escolha o melhor terreno plano ou pista próxima favorável ao vento. 3. COMUNIQUE: Sintonize 121.5 MHz ou transponder 7700 (Mayday Mayday Mayday).',
        keyTakeaway: 'Nunca pare de voar a aeronave para procurar listas de verificação.',
      },
      {
        heading: '2. Tentativa de Reacionamento em Voo (Flow Checklist)',
        text: 'Se altitude permitir: Seletora de combustível em AMBOS, Mistura RICA, Aquecimento de Carburador LIGADO, Magnetos em AMBOS ou START, Bomba auxiliar LIGADA.',
        keyTakeaway: 'Se não reacionar abaixo de 1000 ft AGL: corte combustível e master antes do toque para evitar incêndio.',
      }
    ],
    checklistItems: [
      'Manter 65 kts de planeio (C172)',
      'Selecionar campo contra o vento',
      'Código Transponder 7700',
      'Desligar Master e Seletora de Combustível momentos antes do toque',
    ],
    quiz: [
      {
        id: 'q1_emerg',
        question: 'Qual é o código transponder internacional para emergência geral a bordo?',
        options: [
          '7500 (Interferência Ilícita)',
          '7600 (Falha de Comunicações)',
          '7700 (Emergência Geral)',
          '1200 (Voo VFR Padrão)'
        ],
        correctIndex: 2,
        explanation: 'O código 7700 alerta imediatamente todos os radares de controle de tráfego aéreo sobre uma situação de emergência a bordo.'
      }
    ]
  },
  {
    id: 'lesson_meteorology_metar',
    moduleCategory: 'meteorology',
    title: 'Meteorologia Aeronáutica & Decodificação de METAR/TAF',
    estimatedMinutes: 30,
    summary: 'Aprenda a ler boletins meteorológicos METAR, identificar tesouras de vento (windshear), nuvens convectivas Cumulonimbus (CB) e nevoeiros.',
    contentSections: [
      {
        heading: '1. Estrutura do METAR',
        text: 'Exemplo: SBGR 311200Z 11008KT 9999 FEW030 22/15 Q1018. SBGR = Localidade (Guarulhos), 311200Z = Dia 31 às 12:00 UTC, 11008KT = Vento de 110 graus com 8 nós, 9999 = Visibilidade 10km+, FEW030 = Poucas nuvens a 3.000 pés, 22/15 = Temperatura 22°C / Ponto de Orvalho 15°C, Q1018 = Ajuste altimétrico 1018 hPa.',
        keyTakeaway: 'Quanto mais próxima a temperatura do ponto de orvalho, maior o risco de formação de nevoeiro e baixa visibilidade.',
      }
    ],
    quiz: [
      {
        id: 'q1_met',
        question: 'No reporte "KJFK 24014G25KT", o que significa "G25KT"?',
        options: [
          'Visibilidade de 25 milhas terrestres',
          'Vento soprando a 240 graus com rajadas de até 25 nós (Gusts)',
          'Temperatura do ar de 25 graus Fahrenheit',
          'Teto de nuvens a 2.500 pés'
        ],
        correctIndex: 1,
        explanation: 'A letra "G" em um METAR representa Rajadas de vento (Gusts).'
      }
    ]
  },
  {
    id: 'lesson_ifr_ils',
    moduleCategory: 'navigation',
    title: 'Navegação por Instrumentos & Sistema de Pouso ILS',
    estimatedMinutes: 30,
    summary: 'Compreenda a interceptação do Localizer (eixo horizontal da pista) e do Glideslope (rampa de descida vertical de 3°).',
    contentSections: [
      {
        heading: '1. O Sistema ILS (Instrument Landing System)',
        text: 'O ILS emite dois sinais de rádio: o Localizer (LOC) na faixa VHF para guiar o piloto lateralmente em direção ao eixo central da pista, e o Glideslope (GS) na faixa UHF para indicar a rampa eletrônica de descida ideal de 3 graus até a cabeceira.',
        keyTakeaway: 'Mantenha as duas barras cruzadas centradas no instrumento (agulha vertical e agulha horizontal).',
        diagramType: 'ils_glideslope',
      }
    ],
    quiz: [
      {
        id: 'q1_ifr',
        question: 'Em uma aproximação ILS, qual sinal fornece a orientação de descida vertical?',
        options: [
          'Localizer (LOC)',
          'Glideslope (GS)',
          'DME (Distance Measuring Equipment)',
          'Transponder'
        ],
        correctIndex: 1,
        explanation: 'O Glideslope (rampa de planeio) orienta o perfil vertical de descida na aproximação ILS.'
      }
    ]
  }
];
