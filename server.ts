import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client lazily / securely on server side
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API: AI Flight Instructor Maneuver & Telemetry Evaluation
app.post("/api/instructor/evaluate", async (req, res) => {
  try {
    const { maneuver, telemetry, lang = "pt" } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Return smart localized fallback if key is not yet set
      const defaultFeedback = {
        score: Math.min(100, Math.max(60, Math.round(100 - (Math.abs(telemetry?.verticalSpeed || 0) / 30) - (Math.abs(telemetry?.bankAngle || 0) * 0.5)))),
        analysis: lang === "pt"
          ? "Voo executado com boa estabilidade longitudinal. Mantenha a velocidade de aproximação constante e faça o flare suavemente a 20 pés da pista."
          : "Flight executed with good longitudinal stability. Maintain constant approach speed and perform flare gently at 20 ft above threshold.",
        corrections: [
          lang === "pt" ? "Coordene pedal e aileron nas curvas" : "Coordinate rudder and aileron during turns",
          lang === "pt" ? "Monitore o variômetro na aproximação final" : "Monitor VSI during final approach",
          lang === "pt" ? "Atente ao ângulo de ataque para prevenir estol" : "Watch angle of attack to prevent aerodynamic stall"
        ],
        grade: "A",
        instructorName: "Cap. Carlos Silveira (Instrutor Chefe ANAC/FAA)"
      };
      return res.json(defaultFeedback);
    }

    const systemPrompt = `Você é o Cap. Carlos Silveira, Instrutor Chefe de Voo certificado ANAC e FAA com mais de 15.000 horas de voo.
Analise a telemetria do aluno piloto para a manobra "${maneuver || 'Voo Geral'}".
Responda no idioma indicado: "${lang}" (ex: pt = português, en = english, es = español, fr = français, de = deutsch).
Retorne SEMPRE um JSON válido com a seguinte estrutura:
{
  "score": number (0 a 100),
  "analysis": "análise técnica detalhada da manobra em 2 a 3 frases",
  "corrections": ["dica prática 1", "dica prática 2", "dica prática 3"],
  "grade": "A+" | "A" | "B" | "C" | "D",
  "instructorName": "Cap. Carlos Silveira (Instrutor Chefe)"
}`;

    const telemetrySummary = JSON.stringify(telemetry || {}, null, 2);

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Telemetria do Voo:\n${telemetrySummary}\n\nAvalie a manobra e forneça o feedback JSON:`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Instructor evaluation error:", error);
    res.status(500).json({
      error: "Falha na avaliação do instrutor",
      details: error?.message || String(error),
      fallback: {
        score: 85,
        analysis: "Voo com boa manutenção de altitude e atitude. Continue praticando a coordenação de curvas.",
        corrections: ["Monitore o variômetro", "Mantenha velocidade de cruzeiro"],
        grade: "B+",
        instructorName: "Cap. Carlos Silveira"
      }
    });
  }
});

// API: 24/7 Dedicated Technical & Flight Theory Support Chat
app.post("/api/support/chat", async (req, res) => {
  try {
    const { message, history = [], lang = "pt" } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      const fallbackResponses: Record<string, string> = {
        pt: "Olá, Comandante! Estou à disposição 24/7 para esclarecer dúvidas sobre aerodinâmica, meteorologia aeronáutica, regulamentos de tráfego aéreo, cartas de aproximação IFR/VFR, procedimentos de emergência e calibração de manche/joysticks HOTAS. Como posso ajudar em seu voo hoje?",
        en: "Greetings, Captain! I am available 24/7 to assist with aerodynamics, aviation weather, ATC procedures, IFR/VFR approach plates, emergency checklists, and flight simulator hardware calibration. How can I assist your flight training today?",
        es: "¡Hola, Comandante! Estoy disponible 24/7 para resolver dudas sobre aerodinámica, meteorología aeronáutica, regulaciones de tráfico aéreo, cartas IFR/VFR y calibración de hardware de simulación. ¿Cómo puedo ayudarte hoy?",
        fr: "Bonjour, Commandant ! Je suis disponible 24/7 pour vous aider avec l'aérodynamique, la météo aéronautique, les procédures ATC et la calibration de vos manettes. Comment puis-je vous aider ?",
        de: "Hallo, Flugkapitän! Ich stehe Ihnen rund um die Uhr für Fragen zu Aerodynamik, Flugmeteorologie, IFR/VFR-Verfahren und Hardware-Kalibrierung zur Verfügung. Wie kann ich heute helfen?"
      };
      return res.json({
        reply: fallbackResponses[lang] || fallbackResponses.pt,
        source: "offline_expert_kb",
      });
    }

    const systemPrompt = `Você é o Assistente Técnico & Especialista em Aviação 24/7 da AeroAcademy.
Você possui conhecimento profundo em:
1. Teoria de voo: aerodinâmica, sustentação, estol, peso e balanceamento, navegação aérea, meteorologia (METAR/TAF), regulamentação ICAO/FAA/ANAC/EASA.
2. Manobras no simulador: Voo reto e nivelado, subida, descida, curvas coordenadas, aproximações de precisão ILS, pouso com vento de través, falhas de motor.
3. Hardware de simulador: Thrustmaster, Logitech Flight Yoke/Rudder, Honeycomb Alpha/Bravo, Realidade Virtual (VR/WebXR), calibração de eixos e sensibilidade.
Seja técnico, preciso, encorajador e conciso. Responda no idioma: "${lang}".`;

    const chatHistory = Array.isArray(history)
      ? history.map((msg: any) => `${msg.role === 'user' ? 'Piloto' : 'Especialista'}: ${msg.content}`).join('\n')
      : '';

    const fullPrompt = `${chatHistory ? `Histórico prévio:\n${chatHistory}\n\n` : ''}Pergunta do Piloto: ${message}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: fullPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.6,
      },
    });

    res.json({ reply: response.text, source: "gemini_aviation_expert" });
  } catch (error: any) {
    console.error("Support chat error:", error);
    res.status(500).json({
      error: "Erro no atendimento de suporte",
      details: error?.message || String(error),
      reply: "Para calibrar seu joystick ou manete, acesse a aba 'Hardware' no simulador. Para dúvidas sobre manobras de pouso, mantenha a velocidade de aproximação em 65 nós com flaps full."
    });
  }
});

// API: Dynamic Flight Scenario Generator
app.post("/api/flight-scenarios/generate", async (req, res) => {
  try {
    const { category, difficulty, lang = "pt" } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        title: "Aproximação Crítica em Madeira (FNC/LPMA)",
        description: "Ventos cruzados de 28 nós com rajadas e turbulência orográfica na aproximação da cabeceira 05 sobre a baía.",
        location: "Funchal, Madeira (LPMA)",
        windSpeed: 28,
        windDirection: 310,
        turbulence: "heavy",
        weatherType: "stormy",
        timeOfDay: "sunset",
        targetManeuver: "Crosswind Landing",
        objectives: [
          "Interceptar a curva base visual a 1.200 pés",
          "Manter ângulo de caranguejo compensando o vento de través",
          "Tocar na zona de toque com razão de descida inferior a -300 fpm"
        ]
      });
    }

    const systemPrompt = `Gere um cenário de voo realista para simulador aeronáutico na categoria "${category || 'Emergência'}" e nível "${difficulty || 'Avançado'}".
Idioma: "${lang}".
Retorne um objeto JSON no formato:
{
  "title": "Título empolgante do cenário",
  "description": "Descrição imersiva da missão e contexto",
  "location": "Nome do Aeroporto e Código ICAO",
  "windSpeed": number (0 a 45),
  "windDirection": number (0 a 360),
  "turbulence": "none" | "light" | "moderate" | "heavy",
  "weatherType": "clear" | "cloudy" | "rainy" | "foggy" | "stormy",
  "timeOfDay": "dawn" | "noon" | "sunset" | "night",
  "targetManeuver": "Nome da Manobra",
  "objectives": ["Objetivo 1", "Objetivo 2", "Objetivo 3"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: "Gere o cenário de voo especificado:",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Scenario generation error:", error);
    res.status(500).json({ error: "Falha ao gerar cenário", details: error?.message });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✈️ AeroAcademy Server running on http://localhost:${PORT}`);
  });
}

startServer();
