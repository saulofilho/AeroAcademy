# ✈️ AeroAcademy — Simulador de Voo & Formação Aeronáutica 3D / WebXR

[![GitHub Pages Deployment](https://img.shields.io/badge/GitHub%20Pages-Live%20Ready-38bdf8?style=flat&logo=github)](https://pages.github.com/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL%20%2F%20WebXR-black?logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-06b6d4?logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript)](https://www.typescriptlang.org/)

Plataforma avançada de simulação de voo e treinamento aerodesportivo para navegadores modernos (Desktop, Mobile e Realidade Virtual WebXR), integrando física aerodinâmica de 6 graus de liberdade, telemetria em tempo real com **Caixa Preta (Black Box FDR)**, instrumentos de cabine digital (Glass Cockpit EFIS/PFD), escola de solo teórica, caderneta digital e suporte a manetes HOTAS / pedais de leme.

---

## 📌 Sumário
- [Recursos Principais](#-recursos-principais)
- [Caminhos dos Ícones e Assets](#-caminhos-dos-ícones-e-assets)
- [Caixa Preta & Gravador de Telemetria (Black Box FDR)](#-caixa-preta--gravador-de-telemetria-black-box-fdr)
- [Como Executar Localmente](#-como-executar-localmente)
- [Versão para GitHub Pages](#-versão-para-github-pages)
- [Comandos e Controles do Simulador](#-comandos-e-controles-do-simulador)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Licença](#-licença)

---

## 🌟 Recursos Principais

1. **Simulador de Voo 3D & WebXR**:
   - Modelos de aeronaves (Cessna 172 Skyhawk, Embraer EMB-312 Tucano, Boeing 737-800, Cirrus SR22 e planadores).
   - Cockpit virtual 3D com Glass Cockpit / PFD (velocímetro, horizonte artificial, altímetro com baro subscale, variômetro vertical, bússola giroscópica e indicador de curvas).
   - Física de voo realista com sustentação ($C_L$), arrasto induzido ($C_D$), efeito de solo (*ground effect*), estol aerodinâmico e cálculo de G-force dinâmico.

2. **Gravador de Dados de Voo (Black Box / FDR)**:
   - Amostragem em alta frequência (10 Hz / 100 ms).
   - Gravação instantânea de atitude (Pitch/Roll/Yaw), acelerações G, controles do piloto (manche, pedal, manete e compensador/trim) e coordenadas.
   - Modal interativo de análise pós-voo com gráficos SVG de perfil de altitude, velocidade, curva de envelope G e player com scrubber de linha do tempo.
   - Exportação completa em **JSON** e **CSV**.

3. **Ground School (Escola de Solo) & Certificações**:
   - Módulos teóricos interativos: Teoria de Voo, Conhecimentos Técnicos, Regulamentos de Tráfego Aéreo, Meteorologia e Navegação Aérea.
   - Testes práticos com emissão de brevês e certificados digitais comemorativos.

4. **Caderneta de Voo Digital (Pilot Logbook)**:
   - Registro automático de horas totais, pousos diurnos e noturnos, condições de voo e notas do instrutor.
   - Compartilhamento social de realizações.

5. **Clima Dinâmico e Aeroportos Globais**:
   - Condições meteorológicas customizáveis (vento, rajadas, turbulência, chuva, visibilidade, nuvens e horário: amanhecer, dia, pôr do sol, noite).
   - Informações e cartas de aeroportos brasileiros e internacionais (SBGR, SBRJ, SBKP, KJFK, EGLL, LPMA Madeira, entre outros) com frequências ATIS e torres de controle.

6. **Hardware e Controles**:
   - Suporte nativo à Gamepad API para calibração de Joysticks, Yokes, manetes de aceleração e pedais de leme USB/Bluetooth.

---

## 🎨 Caminhos dos Ícones e Assets

Os ícones vetoriais de alta fidelidade e resolução independente estão localizados em:

| Asset | Caminho Relativo | Descrição |
|---|---|---|
| **Ícone Principal do App** | [`/public/icon.svg`](./public/icon.svg) | Ícone vetorial com gradiente azul/ouro do jato supersônico, anéis de bússola e horizonte artificial (512x512). |
| **Favicon do Navegador** | [`/public/favicon.svg`](./public/favicon.svg) | Favicon leve SVG exibido na aba do navegador e marcadores. |
| **Web App Manifest / Apple Touch** | `<link rel="apple-touch-icon" href="/icon.svg">` | Configurado diretamente no `index.html` para instalação PWA e telas retina. |

---

## 📼 Caixa Preta & Gravador de Telemetria (Black Box FDR)

O sistema de gravação de dados de voo (FDR) pode ser ativado a qualquer instante pressionando a tecla **`X`** ou clicando no botão **"REC FDR"** no painel superior do simulador:

- **Dados Coletados a 10 Hz**:
  - `altitudeFt`, `groundSpeedKts`, `indicatedAirspeedKts`, `verticalSpeedFpm`
  - `pitchDeg`, `rollDeg`, `headingDeg`, `gForce`
  - Entradas de comando: `pitchInput` (profundor), `rollInput` (aileron), `yawInput` (leme), `throttle` (potência), `flaps`, `brakes`
  - Registro de eventos: `Takeoff`, `Touchdown`, `Stall Warning`, `Extreme G`, `Overspeed`
- **Exportação JSON**:
  O arquivo gerado contém o cabeçalho com metadados do voo, modelo da aeronave, prefixo, aeroporto de partida/chegada e o vetor cronológico com todas as medições de telemetria.

---

## 💻 Como Executar Localmente

### Pré-requisitos
- **Node.js** 18+ (recomendado Node.js 20 LTS)
- **npm**, **pnpm** ou **yarn**

### Instalação

```bash
# Clone o repositório
git clone https://github.com/SEU-USUARIO/aeroacademy.git
cd aeroacademy

# Instale as dependências
npm install
```

### Executar em Desenvolvimento

```bash
# Inicia o servidor fullstack (Express + Vite)
npm run dev
```

Acesse em seu navegador: [http://localhost:3000](http://localhost:3000)

### Compilação de Produção

```bash
npm run build
npm start
```

---

## 🚀 Versão para GitHub Pages

O projeto foi configurado com paths relativos (`base: './'`) e empacotamento estático otimizado, permitindo hospedagem 100% gratuita no **GitHub Pages**.

### Método 1: GitHub Actions (Automático - Recomendado)
O repositório já inclui o arquivo de workflow pronto:
`.github/workflows/deploy-gh-pages.yml`

1. Envie o código para o GitHub:
   ```bash
   git add .
   git commit -m "feat: setup AeroAcademy with GitHub Pages support"
   git push origin main
   ```
2. No seu repositório no GitHub, vá em:
   **Settings** ➔ **Pages** ➔ **Build and deployment**.
3. Em **Source**, selecione **GitHub Actions**.
4. A cada novo commit na branch `main`, a compilação e publicação acontecerão automaticamente!

### Método 2: Build Manual e Deploy

```bash
# Executa a compilação específica para GitHub Pages
npm run build:gh-pages

# Os arquivos estáticos estarão prontos na pasta /dist
# Você pode publicar a pasta dist na branch gh-pages usando ferramentas como gh-pages:
# npx gh-pages -d dist
```

---

## 🎮 Comandos e Controles do Simulador

| Ação | Teclado | Gamepad / Manche |
|---|---|---|
| **Arfagem (Subir / Descer)** | `W` (Cabrar) / `S` (Picar) ou Setas `↓` / `↑` | Eixo Y do Joystick |
| **Rolamento (Curvas)** | `A` (Esquerda) / `D` (Direita) ou Setas `←` / `→` | Eixo X do Joystick |
| **Guinada (Leme de Direção)** | `Q` (Esquerda) / `E` (Direita) | Eixo de Torção / Pedais |
| **Potência da Manete** | `Shift` (+Potência) / `Ctrl` (-Potência) | Throttle Slider / Gatilho |
| **Freios de Trem de Pouso** | `Espaço` (Brakes) | Botão A / Trigger |
| **Flaps** | `F` (Avançar Flaps) / `V` (Recolher Flaps) | Botão configurado |
| **Compensador (Trim)** | `T` (Cabrar) / `G` (Picar) | Hat Switch |
| **Gravador Caixa Preta (FDR)** | `X` (Iniciar / Parar Gravação) | — |
| **Alternar Câmera (Cockpit/Externa)** | `C` | Botão de Câmera |
| **Reiniciar / Reset de Voo** | `R` | — |
| **Pausa** | `P` ou `Esc` | Botão Start |

---

## 📂 Estrutura do Projeto

```
aeroacademy/
├── .github/
│   └── workflows/
│       └── deploy-gh-pages.yml     # Workflow automático para GitHub Pages
├── public/
│   ├── icon.svg                    # Ícone vetorial da AeroAcademy (512x512)
│   └── favicon.svg                 # Favicon SVG do navegador
├── src/
│   ├── components/
│   │   ├── FlightSimulator/        # Simulador 3D Three.js, HUD, FDR Modal e Debrief
│   │   ├── Navigation/             # Barra de navegação e ATIS METAR Ticker
│   │   ├── TheoryGroundSchool/     # Aulas de solo interativas e simulados
│   │   ├── Certifications/         # Exames práticos e brevês digitais
│   │   ├── Hangar/                 # Escolha e customização de aeronaves
│   │   ├── Airports/               # Navegação de aeroportos globais e frequências
│   │   └── Logbook/                # Caderneta digital de voo
│   ├── services/
│   │   ├── blackBoxRecorder.ts     # Gravador FDR de 10Hz e gerador JSON/CSV
│   │   ├── flightPhysics.ts        # Equações de sustentação e aerodinâmica
│   │   ├── audioEffects.ts         # Sintetizador de áudio de turbinas e motores Web Audio
│   │   └── offlineStorage.ts       # Armazenamento offline de histórico e preferências
│   ├── types.ts                    # Definições TypeScript
│   └── App.tsx                     # Componente principal
├── index.html                      # Entry point HTML com metatags e ícone
├── server.ts                       # Servidor Node.js Express / Gemini AI API
├── vite.config.ts                  # Configuração Vite com suporte a caminhos relativos
├── package.json                    # Dependências e scripts
└── tsconfig.json                   # Configurações do TypeScript
```

---

## 📄 Licença

Este projeto é disponibilizado sob a licença [MIT](LICENSE). Bons voos e asas abertas! 🛩️
