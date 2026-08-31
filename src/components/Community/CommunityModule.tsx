import React, { useState } from 'react';
import { ForumPost, SupportedLanguage } from '../../types';
import { translations } from '../../i18n/translations';
import { MessageSquare, ThumbsUp, MessageCircle, Send, Award, Sparkles, Filter, Pin } from 'lucide-react';

interface CommunityModuleProps {
  lang: SupportedLanguage;
}

const initialPosts: ForumPost[] = [
  {
    id: 'post_1',
    author: {
      name: 'Cap. Roberto Mendes',
      avatarUrl: '',
      pilotRank: 'Instrutor Sênior (CFI)',
      totalHours: 1420,
    },
    title: 'Dicas fundamentais para arredondamento (flare) suave no Cessna 172',
    category: 'debriefs',
    content: 'Muitos alunos tendem a puxar o manche bruscamente ao ouvir o aviso de estol perto da pista. O segredo é fixar o olhar no terço final da pista, mantendo a atitude de nariz ligeiramente elevada enquanto a velocidade drena naturalmente.',
    timestamp: 'Há 3 horas',
    upvotes: 42,
    repliesCount: 12,
    isPinned: true,
    tags: ['C172', 'Pouso', 'Instrução', 'Segurança'],
  },
  {
    id: 'post_2',
    author: {
      name: 'Mariana Duarte',
      avatarUrl: '',
      pilotRank: 'Piloto Privado (PPL)',
      totalHours: 48,
    },
    title: 'Meu primeiro voo solo em Santos Dumont (SBRJ) - Relatório de Telemetria',
    category: 'general_aviation',
    content: 'Acabei de completar meu primeiro voo solo em SBRJ! Vento de 12 nós alinhado com a pista 02R. Toquei a -95 FPM na zona de contato. Obrigado à comunidade pelos conselhos de alinhamento visual com o Pão de Açúcar!',
    timestamp: 'Ontem',
    upvotes: 28,
    repliesCount: 7,
    isPinned: false,
    tags: ['SBRJ', 'Voo Solo', 'Conquista'],
  },
  {
    id: 'post_3',
    author: {
      name: 'Lucas Antunes',
      avatarUrl: '',
      pilotRank: 'Aluno Piloto',
      totalHours: 12,
    },
    title: 'Dúvida: Como evitar a guinada adversa em curvas coordenadas?',
    category: 'student_questions',
    content: 'Estou praticando curvas de 30 graus de inclinação no simulador e a bolinha do indicador de curva sai frequentemente do centro. Qual a quantidade ideal de pedal de leme a aplicar?',
    timestamp: 'Há 2 dias',
    upvotes: 15,
    repliesCount: 9,
    isPinned: false,
    tags: ['Aerodinâmica', 'Iniciantes', 'Dúvidas'],
  },
];

export const CommunityModule: React.FC<CommunityModuleProps> = ({ lang }) => {
  const [posts, setPosts] = useState<ForumPost[]>(initialPosts);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [isPosting, setIsPosting] = useState<boolean>(false);

  const t = translations[lang].community;

  const handleUpvote = (id: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newPost: ForumPost = {
      id: `post_${Date.now()}`,
      author: {
        name: 'Piloto Cadete AeroAcademy',
        avatarUrl: '',
        pilotRank: 'Aluno em Instrução',
        totalHours: 18,
      },
      title: newTitle,
      category: 'general_aviation',
      content: newContent,
      timestamp: 'Agora mesmo',
      upvotes: 1,
      repliesCount: 0,
      isPinned: false,
      tags: ['Experiência', 'Simulador'],
    };

    setPosts([newPost, ...posts]);
    setNewTitle('');
    setNewContent('');
    setIsPosting(false);
  };

  return (
    <div id="community-module-root" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-[#38BDF8] text-xs font-mono-avionics font-bold uppercase tracking-wider mb-2">
            <MessageSquare className="h-4 w-4" />
            {lang === 'pt' ? 'Hangar Comunitário & Troca de Experiências' : 'Community Hangar & Pilot Debriefs'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white font-serif-display">
            {lang === 'pt' ? 'Fórum de Aviadores & Alunos Pilotos' : 'Aviators & Student Pilot Forum'}
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1.5 max-w-2xl font-sans leading-relaxed">
            {lang === 'pt'
              ? 'Compartilhe relatórios de voo, tire dúvidas técnicas com instrutores e troque experiências de pilotagem.'
              : 'Share flight debriefs, ask certified instructors technical questions, and connect with fellow pilots.'}
          </p>
        </div>

        <button
          onClick={() => setIsPosting(!isPosting)}
          className="px-6 py-3 bg-[#38BDF8] hover:bg-[#0284C7] text-[#0A0C10] text-xs uppercase tracking-wider font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-[#38BDF8]/15 cursor-pointer shrink-0 transition-all"
        >
          <MessageSquare className="h-4 w-4" />
          <span>{lang === 'pt' ? 'Criar Nova Publicação' : 'New Discussion Post'}</span>
        </button>
      </div>

      {/* New Post Form Drawer */}
      {isPosting && (
        <form onSubmit={handleCreatePost} className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 space-y-4 animate-in fade-in duration-200 shadow-xl">
          <h2 className="text-base font-medium text-white font-serif-display">
            {lang === 'pt' ? 'Compartilhar com a Comunidade Aeronáutica' : 'Share with the Aviation Community'}
          </h2>
          <input
            type="text"
            placeholder={lang === 'pt' ? 'Título do tópico (ex: Dúvidas sobre o circuito VFR em SBGR)' : 'Topic title...'}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-4 py-3 bg-[#0A0C10] border border-[#334155] rounded-xl text-xs text-white focus:outline-none focus:border-[#38BDF8] font-mono-avionics"
            required
          />
          <textarea
            placeholder={lang === 'pt' ? 'Descreva sua experiência, telemetria de voo ou pergunta...' : 'Write your flight debrief or question...'}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-[#0A0C10] border border-[#334155] rounded-xl text-xs text-white focus:outline-none focus:border-[#38BDF8] font-sans"
            required
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsPosting(false)}
              className="px-4 py-2 border border-[#334155] text-[#94A3B8] text-xs font-semibold rounded-xl hover:bg-[#1E293B] cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#38BDF8] hover:bg-[#0284C7] text-[#0A0C10] text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#38BDF8]/15 transition-all"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Publicar</span>
            </button>
          </div>
        </form>
      )}

      {/* Forum Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-[#0F172A] border border-[#1E293B] hover:border-[#334155] rounded-2xl p-6 space-y-4 transition-all shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-center font-bold text-[#38BDF8] text-sm">
                  {post.author.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <span>{post.author.name}</span>
                    {post.isPinned && (
                      <span className="flex items-center gap-1 text-[9px] bg-[#FCD34D]/15 text-[#FCD34D] border border-[#FCD34D]/30 px-2 py-0.5 rounded font-mono-avionics">
                        <Pin className="h-3 w-3" /> FIXADO
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#38BDF8] font-mono-avionics">
                    {post.author.pilotRank} • {post.author.totalHours} hrs voadas
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-[#64748B] font-mono-avionics">{post.timestamp}</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-medium text-white font-serif-display">{post.title}</h2>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed font-sans">{post.content}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.tags.map((tag) => (
                <span key={tag} className="text-[10px] font-mono-avionics px-2.5 py-1 rounded-lg bg-[#0A0C10] border border-[#334155] text-[#94A3B8]">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Action Footer */}
            <div className="flex items-center gap-4 pt-3 border-t border-[#1E293B] text-xs font-mono-avionics text-[#64748B]">
              <button
                onClick={() => handleUpvote(post.id)}
                className="flex items-center gap-1.5 hover:text-[#38BDF8] transition-colors cursor-pointer"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>{post.upvotes} {t.upvotes}</span>
              </button>
              <div className="flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5" />
                <span>{post.repliesCount} {t.replies}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
