import React, { useState } from 'react';
import { SupportChatMessage, SupportedLanguage } from '../../types';
import { translations } from '../../i18n/translations';
import { Headphones, Send, Bot, User, Sparkles, Shield, Clock, PhoneCall, Loader2 } from 'lucide-react';

interface SupportModuleProps {
  lang: SupportedLanguage;
}

const initialMessages: SupportChatMessage[] = [
  {
    id: 'msg_0',
    sender: 'agent',
    agentName: 'Eng. Mateus & Cap. Carlos (Suporte Técnico 24/7)',
    text: 'Olá Comandante! Bem-vindo ao Suporte Técnico e Operacional Dedicado 24/7 da AeroAcademy. Como posso te auxiliar hoje? Podemos solucionar dúvidas de hardware (joysticks/pedais), manobras de voo, aerodinâmica, meteorologia ou certificações.',
    timestamp: 'Agora',
  },
];

export const SupportModule: React.FC<SupportModuleProps> = ({ lang }) => {
  const [messages, setMessages] = useState<SupportChatMessage[]>(initialMessages);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const t = translations[lang].support;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;

    const userMsg: SupportChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: inputQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const resp = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputQuery, lang }),
      });
      const data = await resp.json();

      const botReply: SupportChatMessage = {
        id: `agent_${Date.now()}`,
        sender: 'agent',
        agentName: 'Engenharia de Voo & Instrução 24/7',
        text: data.reply || 'Recebido! Para mais detalhes, verifique o manual operacional da aeronave.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, botReply]);
    } catch (err) {
      const fallbackReply: SupportChatMessage = {
        id: `agent_${Date.now()}`,
        sender: 'agent',
        agentName: 'Suporte Técnico 24/7',
        text: 'Nossos engenheiros e instrutores de plantão recomendam verificar a calibração de eixos do joystick e a lista de verificação de bordo.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackReply]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="support-module-root" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-[#38BDF8] text-xs font-mono-avionics font-bold uppercase tracking-wider mb-2">
            <Headphones className="h-4 w-4" />
            {lang === 'pt' ? 'Suporte Técnico & Operacional 24 Horas' : '24/7 Technical & Flight Operations Support'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white font-serif-display">
            {lang === 'pt' ? 'Centro de Atendimento Aeronáutico' : 'Aviation Helpdesk & Flight Dispatch'}
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1.5 max-w-2xl font-sans leading-relaxed">
            {lang === 'pt'
              ? 'Tire dúvidas técnicas em tempo real sobre configuração de HOTAS, simulação aerodinâmica, meteorologia e regulamentos.'
              : 'Real-time 24/7 technical support for joystick setup, flight physics, avionics, and license regulations.'}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#1E293B] px-4 py-3 rounded-xl border border-[#334155] shrink-0">
          <div className="h-2.5 w-2.5 rounded-full bg-[#22C55E] animate-pulse" />
          <div>
            <div className="text-[10px] text-[#22C55E] font-mono-avionics font-bold uppercase tracking-wider">Central Ativa</div>
            <div className="text-xs font-medium text-white font-sans">Tempo Médio: Instantâneo</div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
        {/* Messages Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'agent' && (
                <div className="w-9 h-9 rounded-xl bg-[#0A0C10] border border-[#334155] text-[#38BDF8] flex items-center justify-center shrink-0">
                  <Bot className="h-5 w-5" />
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-1 ${
                  msg.sender === 'user'
                    ? 'bg-[#38BDF8] text-[#0A0C10] font-medium rounded-br-none shadow-md shadow-[#38BDF8]/20'
                    : 'bg-[#0A0C10] border border-[#334155] text-[#E2E8F0] rounded-bl-none'
                }`}
              >
                {msg.sender === 'agent' && (
                  <div className="text-[10px] font-mono-avionics text-[#38BDF8] font-bold mb-1">
                    {msg.agentName}
                  </div>
                )}
                <p className="font-sans">{msg.text}</p>
                <div className={`text-[9px] text-right font-mono-avionics ${msg.sender === 'user' ? 'text-[#0A0C10]/70' : 'text-[#64748B]'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-9 h-9 rounded-xl bg-[#1E293B] border border-[#334155] text-[#94A3B8] flex items-center justify-center shrink-0">
                  <User className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center text-xs text-[#38BDF8] font-mono-avionics">
              <div className="w-9 h-9 rounded-xl bg-[#0A0C10] border border-[#334155] text-[#38BDF8] flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <span>Instrutor Chefe digitando resposta...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 bg-[#0A0C10] border-t border-[#1E293B] flex gap-3">
          <input
            type="text"
            placeholder={lang === 'pt' ? 'Digite sua dúvida técnica de voo, joystick ou regulamento...' : 'Type your technical flight or hardware question...'}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#38BDF8] font-sans"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="px-6 py-3 bg-[#38BDF8] hover:bg-[#0284C7] text-[#0A0C10] text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg shadow-[#38BDF8]/15 cursor-pointer disabled:opacity-50 transition-all shrink-0"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">{lang === 'pt' ? 'Enviar' : 'Send'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
