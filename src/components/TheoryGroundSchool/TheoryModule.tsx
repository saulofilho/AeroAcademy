import React, { useState } from 'react';
import { TheoryLesson, SupportedLanguage } from '../../types';
import { theoreticalLessons } from '../../data/lessonsData';
import { translations } from '../../i18n/translations';
import { BookOpen, CheckCircle, HelpCircle, Award, ArrowRight, Play, CheckSquare, Sparkles } from 'lucide-react';

interface TheoryModuleProps {
  lang: SupportedLanguage;
  onStartPracticalManeuver: (lessonId: string) => void;
}

export const TheoryModule: React.FC<TheoryModuleProps> = ({ lang, onStartPracticalManeuver }) => {
  const [selectedLesson, setSelectedLesson] = useState<TheoryLesson>(theoreticalLessons[0]);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<{ [quizId: string]: number }>({});
  const [showQuizResults, setShowQuizResults] = useState<boolean>(false);
  const [completedChecklist, setCompletedChecklist] = useState<{ [key: string]: boolean }>({});

  const t = translations[lang].theory;

  const handleSelectAnswer = (quizId: string, optionIndex: number) => {
    setSelectedQuizAnswers(prev => ({ ...prev, [quizId]: optionIndex }));
  };

  const handleToggleChecklistItem = (item: string) => {
    setCompletedChecklist(prev => ({ ...prev, [item]: !prev[item] }));
  };

  return (
    <div id="theory-ground-school-module" className="space-y-6">
      {/* Module Title Banner */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-[#38BDF8] text-xs font-mono-avionics font-bold uppercase tracking-wider mb-2">
            <BookOpen className="h-4 w-4" />
            {lang === 'pt' ? 'Escola de Solo & Instrução Teórica' : 'Ground School & Theoretical Lessons'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white font-serif-display">
            {lang === 'pt' ? 'Fundamentos Aeronáuticos & Procedimentos' : 'Aviation Fundamentals & Flight Procedures'}
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1.5 max-w-2xl font-sans leading-relaxed">
            {lang === 'pt'
              ? 'Aprenda aerodinâmica, meteorologia, instrumentos de voo e regras de tráfego aéreo com exames de solo interativos.'
              : 'Master aerodynamics, meteorology, flight instruments, and air traffic rules with interactive ground exams.'}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#1E293B] px-5 py-3.5 rounded-xl border border-[#334155] shrink-0">
          <div className="p-2.5 bg-[#0A0C10] text-[#22C55E] rounded-xl border border-[#334155]">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] text-[#64748B] uppercase tracking-widest font-mono-avionics">Progresso Teórico</div>
            <div className="text-sm font-bold text-white font-mono-avionics">6 / 6 Módulos Prontos</div>
          </div>
        </div>
      </div>

      {/* Lesson Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Navigation: Lesson List */}
        <div className="space-y-3">
          <h2 className="text-[10px] uppercase tracking-widest font-mono-avionics text-[#64748B] px-1 font-semibold">
            {lang === 'pt' ? 'Matérias do Curso de Piloto' : 'Syllabus Modules'}
          </h2>
          {theoreticalLessons.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => {
                setSelectedLesson(lesson);
                setShowQuizResults(false);
              }}
              className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                selectedLesson.id === lesson.id
                  ? 'bg-[#1E293B] border-[#38BDF8] shadow-lg shadow-[#38BDF8]/10'
                  : 'bg-[#0F172A] hover:bg-[#1E293B] border-[#1E293B]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-wider font-mono-avionics px-2 py-0.5 rounded bg-[#0A0C10] text-[#38BDF8] border border-[#334155]">
                  {lesson.moduleCategory.toUpperCase()}
                </span>
                <span className="text-[11px] font-mono-avionics text-[#64748B]">{lesson.estimatedMinutes} min</span>
              </div>
              <div className="text-sm font-semibold text-white font-serif-display line-clamp-1">{lesson.title}</div>
              <p className="text-xs text-[#94A3B8] line-clamp-2">{lesson.summary}</p>
            </button>
          ))}
        </div>

        {/* Right Area: Selected Lesson Content & Interactive Exam */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            {/* Header */}
            <div className="border-b border-[#1E293B] pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-mono-avionics text-[#38BDF8]">
                  MÓDULO: {selectedLesson.moduleCategory.toUpperCase()}
                </span>
                <h2 className="text-xl sm:text-2xl font-light text-white font-serif-display mt-1">
                  {selectedLesson.title}
                </h2>
              </div>

              <button
                onClick={() => onStartPracticalManeuver(selectedLesson.id)}
                className="px-4 py-2 bg-[#38BDF8] hover:bg-[#0284C7] text-[#0A0C10] text-xs uppercase tracking-wider font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-[#38BDF8]/15 cursor-pointer shrink-0 transition-all"
              >
                <Play className="h-3.5 w-3.5" />
                <span>{lang === 'pt' ? 'Praticar no Simulador 3D' : 'Practice in Simulator'}</span>
              </button>
            </div>

            {/* Content Sections */}
            <div className="space-y-4">
              {selectedLesson.contentSections.map((section, idx) => (
                <div key={idx} className="space-y-3 bg-[#0A0C10] p-5 rounded-xl border border-[#1E293B]">
                  <h3 className="text-base font-medium text-white font-serif-display flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#38BDF8]" />
                    {section.heading}
                  </h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">{section.text}</p>
                  
                  {section.keyTakeaway && (
                    <div className="bg-[#1E293B] border-l-2 border-[#38BDF8] p-3 rounded-r-xl text-xs text-[#E2E8F0]">
                      <strong className="text-[#38BDF8]">Dica de Segurança:</strong> {section.keyTakeaway}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Checklist Items if present */}
            {selectedLesson.checklistItems && selectedLesson.checklistItems.length > 0 && (
              <div className="bg-[#0A0C10] p-5 rounded-xl border border-[#1E293B] space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#FCD34D] font-mono-avionics flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  <span>{lang === 'pt' ? 'Lista de Verificação (Checklist Obrigatório)' : 'Flight Checklist'}</span>
                </div>
                <div className="space-y-2">
                  {selectedLesson.checklistItems.map((item, idx) => (
                    <label
                      key={idx}
                      onClick={() => handleToggleChecklistItem(item)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#1E293B]/60 hover:bg-[#1E293B] border border-[#334155] text-xs text-[#94A3B8] cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={!!completedChecklist[item]}
                        readOnly
                        className="rounded bg-[#0A0C10] text-[#38BDF8] focus:ring-0 cursor-pointer"
                      />
                      <span className={completedChecklist[item] ? 'line-through text-[#64748B]' : 'text-[#E2E8F0]'}>
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Ground School Quiz */}
            {selectedLesson.quiz && (
              <div className="bg-[#0A0C10] p-6 rounded-xl border border-[#334155] space-y-5">
                <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white font-serif-display">
                    <HelpCircle className="h-4 w-4 text-[#38BDF8]" />
                    <span>{lang === 'pt' ? 'Avaliação Teórica de Conhecimento' : 'Theoretical Knowledge Exam'}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-mono-avionics text-[#64748B]">
                    {selectedLesson.quiz.length} Questões
                  </span>
                </div>

                <div className="space-y-5">
                  {selectedLesson.quiz.map((q, qIndex) => {
                    const selectedIdx = selectedQuizAnswers[q.id];
                    const isCorrect = selectedIdx === q.correctIndex;

                    return (
                      <div key={q.id} className="space-y-3">
                        <div className="text-sm font-medium text-[#E2E8F0] flex gap-2">
                          <span className="text-[#38BDF8] font-mono-avionics font-bold">{qIndex + 1}.</span>
                          <span>{q.question}</span>
                        </div>

                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            let optionClass = 'bg-[#1E293B]/60 border-[#334155] text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#E2E8F0]';
                            if (showQuizResults) {
                              if (optIdx === q.correctIndex) {
                                optionClass = 'bg-[#1E293B] border-[#22C55E] text-[#22C55E] font-bold';
                              } else if (selectedIdx === optIdx && !isCorrect) {
                                optionClass = 'bg-red-950/70 border-red-500/80 text-red-200';
                              }
                            } else if (selectedIdx === optIdx) {
                              optionClass = 'bg-[#1E293B] border-[#38BDF8] text-[#38BDF8] font-medium';
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleSelectAnswer(q.id, optIdx)}
                                className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${optionClass}`}
                              >
                                <span>{opt}</span>
                                {showQuizResults && optIdx === q.correctIndex && (
                                  <CheckCircle className="h-4 w-4 text-[#22C55E] shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {showQuizResults && (
                          <div className="p-3.5 rounded-xl bg-[#1E293B] border border-[#334155] text-xs text-[#94A3B8]">
                            <strong className="text-[#E2E8F0]">Explicação da Banca: </strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    onClick={() => setShowQuizResults(true)}
                    className="px-5 py-2.5 bg-[#38BDF8] hover:bg-[#0284C7] text-[#0A0C10] text-xs uppercase tracking-wider font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-[#38BDF8]/15 cursor-pointer transition-all"
                  >
                    <span>{lang === 'pt' ? 'Verificar Respostas' : 'Check Answers'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
