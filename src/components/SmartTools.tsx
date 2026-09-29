import React, { useState } from 'react';
import { 
  Calculator, 
  Languages, 
  FileText, 
  Code2, 
  GraduationCap, 
  Presentation, 
  HelpCircle, 
  Send, 
  Copy, 
  Check, 
  Volume2, 
  Sparkles,
  ArrowRightLeft,
  FileCheck
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface SmartToolsProps {
  language: Language;
  onSpeakText: (text: string) => void;
}

type ToolType = 'calc' | 'translate' | 'summarize' | 'code' | 'doc' | 'study' | 'presentation';

export const SmartTools: React.FC<SmartToolsProps> = ({
  language,
  onSpeakText,
}) => {
  const t = TRANSLATIONS[language];
  const [activeTool, setActiveTool] = useState<ToolType>('calc');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);

  // 1. Calculator / Math Solver State
  const [mathInput, setMathInput] = useState('integral of x^2 * sin(x) dx');
  const [mathType, setMathType] = useState('solve_steps');

  // 2. Translator State
  const [transSourceLang, setTransSourceLang] = useState<'uz' | 'en' | 'ru'>('uz');
  const [transTargetLang, setTransTargetLang] = useState<'uz' | 'en' | 'ru'>('en');
  const [transInput, setTransInput] = useState(
    language === 'uz'
      ? "Sun'iy intellekt insoniyat kelajagini tubdan o'zgartirmoqda."
      : "Artificial intelligence is fundamentally reshaping humanity's future."
  );

  // 3. Summarizer State
  const [sumInput, setSumInput] = useState(
    'NASA James Webb Space Telescope has detected water vapor and complex organic molecules in the habitable zone of an exoplanet located 120 light years away. The spectroscopic analysis shows an atmosphere rich in methane and carbon dioxide, providing new insights into planet formation outside our solar system.'
  );
  const [sumFormat, setSumFormat] = useState('bullets');

  // 4. Code Assistant State
  const [codeLang, setCodeLang] = useState('python');
  const [codePrompt, setCodePrompt] = useState('Write an efficient async function to fetch data concurrently with exponential backoff retry');
  const [codeTask, setCodeTask] = useState('generate');

  // 5. Document / PDF Analyzer State
  const [docContent, setDocContent] = useState('NASA AI Project Overview:\nNASA AI is an autonomous, multimodal assistant capable of analyzing satellite imagery, telemetry, code, and astronomical datasets. It combines speech recognition, neural vision, and search grounding.');
  const [docAction, setDocAction] = useState('qa');

  // 6. Study & Question Generator
  const [studySubject, setStudySubject] = useState('Quantum Physics & Quantum Entanglement');
  const [questionCount, setQuestionCount] = useState(5);

  // 7. Presentation Creator
  const [presTopic, setPresTopic] = useState('The Next Decade of Human Spaceflight to Mars');
  const [slideCount, setSlideCount] = useState(5);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const executeToolAction = async (promptToSend: string) => {
    setIsProcessing(true);
    setResultText(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          language,
          useSearch: true,
        }),
      });

      const data = await res.json();
      setResultText(data.text || 'Xatolik yuz berdi');
    } catch (err) {
      console.error('Tool processing error:', err);
      setResultText('Server bilan aloqa uzildi. Iltimos qaytadan urinib ko\'ring.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Math Solver Trigger
  const handleSolveMath = () => {
    const prompt = `Act as an advanced mathematical and scientific reasoning engine.
Problem: "${mathInput}"
Action: Provide a comprehensive, rigorous step-by-step solution with all intermediate equations, formulas, and an intuitive final summary. Explain clearly so a student can grasp the foundational concepts.
Language: ${language === 'uz' ? 'Uzbek' : language === 'ru' ? 'Russian' : 'English'}.`;
    executeToolAction(prompt);
  };

  // Translator Trigger
  const handleTranslate = () => {
    const prompt = `Translate the following text accurately from ${transSourceLang.toUpperCase()} to ${transTargetLang.toUpperCase()}.
Text: "${transInput}"
Provide:
1. Direct, natural, and idiomatic translation.
2. Key terminology / vocabulary breakdown if applicable.
Output strictly formatted.`;
    executeToolAction(prompt);
  };

  // Swap translation languages
  const swapLanguages = () => {
    const temp = transSourceLang;
    setTransSourceLang(transTargetLang);
    setTransTargetLang(temp);
  };

  // Summarizer Trigger
  const handleSummarize = () => {
    const prompt = `Summarize the following text.
Format requested: ${sumFormat === 'bullets' ? 'Key bullet points with bold highlights' : 'Executive brief paragraph followed by 3 takeaways'}.
Text:
${sumInput}
Language: ${language === 'uz' ? 'Uzbek' : language === 'ru' ? 'Russian' : 'English'}.`;
    executeToolAction(prompt);
  };

  // Code Assistant Trigger
  const handleCodeAssistant = () => {
    const prompt = `You are NASA AI Lead Systems Architect & Senior Software Engineer.
Programming Language: ${codeLang}
Task Type: ${codeTask}
Request: ${codePrompt}
Provide high-performance, clean, modular, production-ready code with complete type annotations, docstrings, algorithmic time/space complexity analysis (Big-O), and edge cases considered.
Language for explanations: ${language === 'uz' ? 'Uzbek' : language === 'ru' ? 'Russian' : 'English'}.`;
    executeToolAction(prompt);
  };

  // Document Analyzer Trigger
  const handleDocAnalysis = () => {
    const prompt = `Analyze this document/text content:
Task: ${docAction === 'qa' ? 'Generate 5 high-yield study questions with detailed answers' : docAction === 'summary' ? 'Extract core thesis, facts, and conclusions' : 'Extract flashcards (Term <-> Definition)'}
Content:
${docContent}
Language: ${language === 'uz' ? 'Uzbek' : language === 'ru' ? 'Russian' : 'English'}.`;
    executeToolAction(prompt);
  };

  // Study Assistant Trigger
  const handleStudyGen = () => {
    const prompt = `Create an interactive study guide and ${questionCount} exam-style questions with detailed explanations for:
Subject: "${studySubject}"
Include multiple choice questions, thought-provoking conceptual problems, and memory flashcards.
Language: ${language === 'uz' ? 'Uzbek' : language === 'ru' ? 'Russian' : 'English'}.`;
    executeToolAction(prompt);
  };

  // Presentation Creator Trigger
  const handlePresentationGen = () => {
    const prompt = `Generate a structured, professional ${slideCount}-slide presentation deck outline for:
Topic: "${presTopic}"
For each slide provide:
1. Slide Title (Catchy, high-impact)
2. 3-4 Visual bullet points
3. Speaker Notes / Transcript (what the presenter should say)
4. Recommended slide visual / diagram idea.
Language: ${language === 'uz' ? 'Uzbek' : language === 'ru' ? 'Russian' : 'English'}.`;
    executeToolAction(prompt);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-cyan-500/20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/40 text-blue-300 text-xs font-mono mb-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>NASA SCIENTIFIC & COMPUTATIONAL SUITE</span>
        </div>
        <h1 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-indigo-300">
          {t.tools.title}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          {t.tools.subtitle}
        </p>
      </div>

      {/* Main Grid: Tool Selector + Active Tool Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Tool Selector */}
        <div className="lg:col-span-4 space-y-2">
          <p className="text-xs font-mono uppercase tracking-wider text-slate-500 px-2 mb-2">
            Asboblar (Tools):
          </p>
          {[
            { id: 'calc', label: t.tools.calculator, icon: Calculator, desc: 'Tenglamalar, integral, fizika formulalari' },
            { id: 'translate', label: t.tools.translator, icon: Languages, desc: 'O\'zbek, ingliz, rus tillarida aniq tarjima' },
            { id: 'summarize', label: t.tools.summarizer, icon: FileText, desc: 'Katta matnlardan asosiy xulosalar' },
            { id: 'code', label: t.tools.codeAssistant, icon: Code2, desc: 'Kod yozish, tekshirish va tushuntirish' },
            { id: 'doc', label: t.tools.docAnalyzer, icon: FileCheck, desc: 'Hujjat va PDF dan savol-javoblar' },
            { id: 'study', label: t.tools.studyAssistant, icon: GraduationCap, desc: 'Imtihon savollari va konspektlar' },
            { id: 'presentation', label: t.tools.presentationCreator, icon: Presentation, desc: 'Slaydlar rejasi va taqdimot nutqi' },
          ].map((tool) => {
            const Icon = tool.icon;
            const active = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id as ToolType);
                  setResultText(null);
                }}
                className={`w-full flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                  active
                    ? 'bg-gradient-to-r from-blue-950/70 to-slate-900 border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.25)] text-blue-200'
                    : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className={`p-2 rounded-xl border ${active ? 'bg-blue-500/20 border-blue-400/40 text-blue-300' : 'bg-slate-800/40 border-slate-700/40 text-slate-400'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-slate-200">{tool.label}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{tool.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Area: Active Tool Configuration & Output */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tool Card Inputs */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-blue-500/25 backdrop-blur-xl shadow-[0_0_25px_rgba(59,130,246,0.1)]">
            {/* 1. Calculator / Math */}
            {activeTool === 'calc' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-orbitron font-bold text-base text-blue-300 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-blue-400" />
                    <span>{t.tools.calculator}</span>
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30">
                    STEM & MATH SOLVER
                  </span>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1.5">
                    Matematik, Fizika yoki Ilmiy Masala:
                  </label>
                  <textarea
                    value={mathInput}
                    onChange={(e) => setMathInput(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950/80 border border-slate-700 focus:border-blue-400 rounded-xl p-3 text-sm text-slate-200 focus:outline-none font-mono"
                    placeholder="Masalan: 3x^2 + 5x - 8 = 0 yoki E = mc^2 hisoblash..."
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    'integral of x^2 * sin(x) dx',
                    'Solve: 2x^2 + 7x - 15 = 0',
                    'Derive gravitational escape velocity from Mars',
                    'Calculate radioactive decay half-life',
                  ].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setMathInput(preset)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700 text-[11px] text-slate-300 hover:border-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleSolveMath}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl font-orbitron font-bold text-xs sm:text-sm tracking-wide bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-all disabled:opacity-50"
                >
                  {isProcessing ? 'Qadamma-qadam hisoblanmoqda...' : 'Masalani Yechish & Tushuntirish'}
                </button>
              </div>
            )}

            {/* 2. Translator */}
            {activeTool === 'translate' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-orbitron font-bold text-base text-cyan-300 flex items-center gap-2">
                    <Languages className="w-5 h-5 text-cyan-400" />
                    <span>{t.tools.translator}</span>
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    NEURAL TRANSLATE
                  </span>
                </div>

                {/* Source & Target language switch bar */}
                <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <select
                    value={transSourceLang}
                    onChange={(e) => setTransSourceLang(e.target.value as any)}
                    className="bg-transparent text-xs font-semibold text-cyan-300 p-1 cursor-pointer focus:outline-none"
                  >
                    <option value="uz" className="bg-slate-900">O'zbekcha (UZ)</option>
                    <option value="en" className="bg-slate-900">English (EN)</option>
                    <option value="ru" className="bg-slate-900">Русский (RU)</option>
                  </select>

                  <button
                    onClick={swapLanguages}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>

                  <select
                    value={transTargetLang}
                    onChange={(e) => setTransTargetLang(e.target.value as any)}
                    className="bg-transparent text-xs font-semibold text-cyan-300 p-1 cursor-pointer focus:outline-none"
                  >
                    <option value="en" className="bg-slate-900">English (EN)</option>
                    <option value="uz" className="bg-slate-900">O'zbekcha (UZ)</option>
                    <option value="ru" className="bg-slate-900">Русский (RU)</option>
                  </select>
                </div>

                <div>
                  <textarea
                    value={transInput}
                    onChange={(e) => setTransInput(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-400 rounded-xl p-3 text-sm text-slate-200 focus:outline-none"
                    placeholder="Tarjima qilinadigan matnni kiriting..."
                  />
                </div>

                <button
                  onClick={handleTranslate}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl font-orbitron font-bold text-xs sm:text-sm tracking-wide bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all disabled:opacity-50"
                >
                  {isProcessing ? 'Tarjima qilinmoqda...' : 'Tarjima Qilish'}
                </button>
              </div>
            )}

            {/* 3. Summarizer */}
            {activeTool === 'summarize' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-orbitron font-bold text-base text-purple-300 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    <span>{t.tools.summarizer}</span>
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSumFormat('bullets')}
                      className={`px-2.5 py-1 rounded text-xs font-medium ${
                        sumFormat === 'bullets' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Asosiy Bandlar
                    </button>
                    <button
                      onClick={() => setSumFormat('brief')}
                      className={`px-2.5 py-1 rounded text-xs font-medium ${
                        sumFormat === 'brief' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Qisqa Xulosa
                    </button>
                  </div>
                </div>

                <div>
                  <textarea
                    value={sumInput}
                    onChange={(e) => setSumInput(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950/80 border border-slate-700 focus:border-purple-400 rounded-xl p-3 text-sm text-slate-200 focus:outline-none"
                    placeholder="Qisqartiriladigan maqola yoki matnni joylang..."
                  />
                </div>

                <button
                  onClick={handleSummarize}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl font-orbitron font-bold text-xs sm:text-sm tracking-wide bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-all disabled:opacity-50"
                >
                  {isProcessing ? 'Xulosa tayyorlanmoqda...' : 'Xulosani Chiqarish'}
                </button>
              </div>
            )}

            {/* 4. Code Assistant */}
            {activeTool === 'code' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-orbitron font-bold text-base text-emerald-300 flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-emerald-400" />
                    <span>{t.tools.codeAssistant}</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <select
                      value={codeLang}
                      onChange={(e) => setCodeLang(e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-xs text-emerald-300 rounded-lg p-1.5"
                    >
                      <option value="python">Python</option>
                      <option value="typescript">TypeScript / React</option>
                      <option value="javascript">JavaScript</option>
                      <option value="rust">Rust</option>
                      <option value="cpp">C++</option>
                      <option value="sql">SQL / Postgres</option>
                    </select>

                    <select
                      value={codeTask}
                      onChange={(e) => setCodeTask(e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-lg p-1.5"
                    >
                      <option value="generate">Kod Yozish</option>
                      <option value="explain">Tushuntirish</option>
                      <option value="debug">Xatolarni Tuzatish</option>
                      <option value="optimize">Tezlashtirish</option>
                    </select>
                  </div>
                </div>

                <div>
                  <textarea
                    value={codePrompt}
                    onChange={(e) => setCodePrompt(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950/80 border border-slate-700 focus:border-emerald-400 rounded-xl p-3 text-sm text-slate-200 focus:outline-none font-mono"
                    placeholder="Dasturlash vazifasini yozing..."
                  />
                </div>

                <button
                  onClick={handleCodeAssistant}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl font-orbitron font-bold text-xs sm:text-sm tracking-wide bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] transition-all disabled:opacity-50"
                >
                  {isProcessing ? 'Kod tahlil qilinmoqda...' : 'Kodni Bajarish'}
                </button>
              </div>
            )}

            {/* 5. Document Analyzer */}
            {activeTool === 'doc' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-orbitron font-bold text-base text-amber-300 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-amber-400" />
                    <span>{t.tools.docAnalyzer}</span>
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDocAction('qa')}
                      className={`px-2.5 py-1 rounded text-xs font-medium ${
                        docAction === 'qa' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Savol-Javob
                    </button>
                    <button
                      onClick={() => setDocAction('summary')}
                      className={`px-2.5 py-1 rounded text-xs font-medium ${
                        docAction === 'summary' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Tezislar
                    </button>
                  </div>
                </div>

                <div>
                  <textarea
                    value={docContent}
                    onChange={(e) => setDocContent(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950/80 border border-slate-700 focus:border-amber-400 rounded-xl p-3 text-sm text-slate-200 focus:outline-none"
                    placeholder="Hujjat matnini joylang..."
                  />
                </div>

                <button
                  onClick={handleDocAnalysis}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl font-orbitron font-bold text-xs sm:text-sm tracking-wide bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] transition-all disabled:opacity-50"
                >
                  {isProcessing ? 'Hujjat tahlil qilinmoqda...' : 'Hujjatni Tahlil Qilish'}
                </button>
              </div>
            )}

            {/* 6. Study & Exam Question Generator */}
            {activeTool === 'study' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-orbitron font-bold text-base text-indigo-300 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-400" />
                    <span>{t.tools.studyAssistant}</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Savollar soni:</span>
                    <select
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="bg-slate-950 border border-slate-700 text-xs text-indigo-300 rounded p-1"
                    >
                      <option value={3}>3 ta</option>
                      <option value={5}>5 ta</option>
                      <option value={10}>10 ta</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Fan yoki Mavzu:</label>
                  <input
                    type="text"
                    value={studySubject}
                    onChange={(e) => setStudySubject(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700 focus:border-indigo-400 rounded-xl p-3 text-sm text-slate-200 focus:outline-none"
                    placeholder="Mavzuni kiriting..."
                  />
                </div>

                <button
                  onClick={handleStudyGen}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl font-orbitron font-bold text-xs sm:text-sm tracking-wide bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] transition-all disabled:opacity-50"
                >
                  {isProcessing ? 'Savollar tuzilmoqda...' : 'Imtihon Savollarini Yaratish'}
                </button>
              </div>
            )}

            {/* 7. Presentation Creator */}
            {activeTool === 'presentation' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-orbitron font-bold text-base text-teal-300 flex items-center gap-2">
                    <Presentation className="w-5 h-5 text-teal-400" />
                    <span>{t.tools.presentationCreator}</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Slaydlar:</span>
                    <select
                      value={slideCount}
                      onChange={(e) => setSlideCount(Number(e.target.value))}
                      className="bg-slate-950 border border-slate-700 text-xs text-teal-300 rounded p-1"
                    >
                      <option value={5}>5 ta slayd</option>
                      <option value={8}>8 ta slayd</option>
                      <option value={10}>10 ta slayd</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Taqdimot Mavzusi:</label>
                  <input
                    type="text"
                    value={presTopic}
                    onChange={(e) => setPresTopic(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700 focus:border-teal-400 rounded-xl p-3 text-sm text-slate-200 focus:outline-none"
                    placeholder="Mavzuni kiriting..."
                  />
                </div>

                <button
                  onClick={handlePresentationGen}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl font-orbitron font-bold text-xs sm:text-sm tracking-wide bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:shadow-[0_0_25px_rgba(20,184,166,0.6)] transition-all disabled:opacity-50"
                >
                  {isProcessing ? 'Taqdimot tayyorlanmoqda...' : 'Slaydlar Rejasini Shakllantirish'}
                </button>
              </div>
            )}
          </div>

          {/* Results Display Window */}
          {resultText && (
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.15)] animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="font-orbitron text-xs font-bold text-cyan-300">
                    NASA AI COMPUTED RESULT
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSpeakText(resultText)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-cyan-300 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Ovozda</span>
                  </button>

                  <button
                    onClick={() => handleCopy(resultText)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-cyan-300 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Nusxalandi' : 'Nusxa'}</span>
                  </button>
                </div>
              </div>

              <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-200 leading-relaxed max-h-[500px] overflow-y-auto pr-2 selection:bg-cyan-500/30">
                {resultText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
