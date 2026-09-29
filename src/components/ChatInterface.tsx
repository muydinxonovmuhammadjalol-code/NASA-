import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Paperclip, 
  X, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Film,
  Sliders
} from 'lucide-react';
import { ChatMessage, Language, AppTab } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { FuturisticOrb } from './FuturisticOrb';
import boyPortraitImg from '../assets/images/boy_portrait.jpg';
import uzbekBoyRobotImg from '../assets/images/uzbek_boy_robot.jpg';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, mediaBase64?: string, mediaMimeType?: string, mediaUrl?: string) => void;
  onClearChat: () => void;
  language: Language;
  onNavigateTab: (tab: AppTab) => void;
  isProcessing: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  onToggleVoiceInput: () => void;
  onSpeakMessage: (text: string) => void;
  onStopSpeaking: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onClearChat,
  language,
  onNavigateTab,
  isProcessing,
  isListening,
  isSpeaking,
  onToggleVoiceInput,
  onSpeakMessage,
  onStopSpeaking,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachedFile, setAttachedFile] = useState<{
    dataUrl: string;
    base64: string;
    mimeType: string;
    name: string;
    type: 'image' | 'document' | 'video';
  } | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const t = TRANSLATIONS[language];

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSend = () => {
    if ((!inputText.trim() && !attachedFile) || isProcessing) return;

    onSendMessage(
      inputText.trim(),
      attachedFile?.base64,
      attachedFile?.mimeType,
      attachedFile?.dataUrl
    );

    setInputText('');
    setAttachedFile(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const base64 = dataUrl.split(',')[1];
      const mimeType = file.type || 'application/octet-stream';
      const isImg = mimeType.startsWith('image/');
      const isVid = mimeType.startsWith('video/');

      setAttachedFile({
        dataUrl,
        base64,
        mimeType,
        name: file.name,
        type: isImg ? 'image' : isVid ? 'video' : 'document',
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickAction = (actionKey: string) => {
    switch (actionKey) {
      case 'createImage':
        onNavigateTab('studio');
        break;
      case 'createVideo':
      case 'animatePhoto':
        onNavigateTab('studio');
        break;
      case 'voiceAi':
        onToggleVoiceInput();
        break;
      case 'analyzeDoc':
      case 'code':
      case 'translate':
        onNavigateTab('tools');
        break;
      case 'askAi':
      default:
        textareaRef.current?.focus();
        break;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] max-w-5xl mx-auto px-3 sm:px-6 relative">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-6">
        {/* If no messages yet, show prominent Futuristic Center Hero */}
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
            {/* Top Titles */}
            <div className="space-y-1 mb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>NEXT-GEN MULTIMODAL INTELLIGENCE</span>
              </div>
              <h1 className="font-orbitron font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-100 to-purple-400 neon-glow-cyan">
                NASA AI
              </h1>
              <p className="text-slate-300 text-sm sm:text-base font-space max-w-lg mx-auto font-medium">
                {t.subtitle}
              </p>
            </div>

            {/* Glowing animated AI orb */}
            <FuturisticOrb
              isListening={isListening}
              isSpeaking={isSpeaking}
              isProcessing={isProcessing}
              onClick={onToggleVoiceInput}
              size="lg"
            />

            {/* Below the orb prompt */}
            <p className="text-slate-400 text-xs sm:text-sm font-mono mt-1 mb-4 tracking-wide">
              {t.askPlaceholder}
            </p>

            {/* Special Feature Showcase Card: "Rasmingizdan video yaratib beraman!" */}
            <div className="w-full max-w-3xl mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#070e28]/95 to-slate-900/90 border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.18)] backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative z-10">
                {/* Person Portrait ("Sizning rasmingiz") */}
                <div className="relative flex-shrink-0 group cursor-pointer" onClick={() => onNavigateTab('studio')}>
                  <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)] group-hover:scale-105 transition-transform bg-slate-950">
                    <img 
                      src={boyPortraitImg} 
                      alt="Ushbu odam rasmi (Sizning rasmingiz)" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -left-1 -right-1 py-0.5 px-1.5 rounded-full bg-cyan-500 text-slate-950 font-bold text-[10px] text-center font-mono shadow-md uppercase tracking-wider">
                    Sizning rasmingiz
                  </div>
                </div>

                {/* Content & Action Buttons */}
                <div className="flex-1 text-center sm:text-left space-y-2.5">
                  {/* Glowing Speech Bubble */}
                  <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-400/40 relative">
                    <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start">
                      <Bot className="w-4 h-4 text-cyan-300 animate-pulse" />
                      <span className="font-orbitron font-bold text-xs text-cyan-300">NASA AI Hamrohi:</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/60 text-pink-300 border border-pink-500/40 font-mono">
                        Endi siz bilan video qilaman! ❤️
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                      "Salom! Men sun'iy intellektman! Sizning rasmingizdan videolar yaratib, siz bilan gaplashaman!"
                    </p>
                  </div>

                  {/* 4 Feature Badges (matching reference poster) */}
                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start pt-1">
                    <button
                      onClick={() => onNavigateTab('studio')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold font-orbitron shadow-[0_0_12px_rgba(6,182,212,0.4)] hover:brightness-110 transition-all"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Rasm orqali video yaratish</span>
                    </button>

                    <button
                      onClick={() => onSpeakMessage("Salom! Men sun'iy intellektman! Sizning rasmingizdan videolar yaratib, siz bilan gaplashaman!")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 border border-purple-400/40 text-purple-200 text-xs font-medium transition-all"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                      <span>Ovoz bilan gapirish</span>
                    </button>

                    <button
                      onClick={() => onNavigateTab('studio')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-900/60 hover:bg-pink-800/80 border border-pink-400/50 text-pink-200 text-xs font-medium transition-all shadow-[0_0_10px_rgba(236,72,153,0.3)]"
                    >
                      <Sliders className="w-3.5 h-3.5 text-pink-400" />
                      <span>Suratni Tahrirlash</span>
                    </button>

                    <button
                      onClick={() => onNavigateTab('studio')}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 text-cyan-300 text-xs transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>AI animatsiya</span>
                    </button>

                    <span className="text-[11px] font-mono text-amber-300 flex items-center gap-1 px-2 py-1 rounded bg-amber-950/40 border border-amber-500/30">
                      ⭐ Barcha g'oyalar uchun tayyor!
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom callout strip */}
              <div className="mt-3 pt-2.5 border-t border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between text-[11px] text-cyan-300/90 font-mono gap-1">
                <span className="font-bold tracking-wide">
                  ✨ RASMINGIZDAN VIDEO YARATIB BERAMAN! ❤️
                </span>
                <span className="text-slate-400">
                  Rasm ➔ Video ➔ Ovozli Suhbat
                </span>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="w-full max-w-3xl">
              <p className="text-[11px] font-mono uppercase tracking-widest text-slate-500 mb-3">
                {t.quickActionsTitle}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { key: 'askAi', label: t.quickActions.askAi, icon: '🧠', color: 'hover:border-cyan-400/50' },
                  { key: 'createImage', label: t.quickActions.createImage, icon: '📸', color: 'hover:border-purple-400/50' },
                  { key: 'createVideo', label: t.quickActions.createVideo, icon: '🎬', color: 'hover:border-blue-400/50' },
                  { key: 'animatePhoto', label: t.quickActions.animatePhoto, icon: '✨', color: 'hover:border-pink-400/50' },
                  { key: 'voiceAi', label: t.quickActions.voiceAi, icon: '🎤', color: 'hover:border-emerald-400/50' },
                  { key: 'analyzeDoc', label: t.quickActions.analyzeDoc, icon: '📄', color: 'hover:border-amber-400/50' },
                  { key: 'code', label: t.quickActions.code, icon: '💻', color: 'hover:border-indigo-400/50' },
                  { key: 'translate', label: t.quickActions.translate, icon: '🌐', color: 'hover:border-teal-400/50' },
                ].map((action) => (
                  <button
                    key={action.key}
                    onClick={() => handleQuickAction(action.key)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md text-left text-xs font-medium text-slate-300 hover:text-white transition-all duration-200 glass-panel-hover ${action.color}`}
                  >
                    <span className="text-base">{action.icon}</span>
                    <span className="truncate">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Conversation Message List */
          <div className="space-y-5 pb-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 px-1">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>NASA AI SESSION ACTIVE</span>
              </div>
              <button
                onClick={onClearChat}
                className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-slate-800/40"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Yangi suhbat</span>
              </button>
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Assistant Avatar */}
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-purple-600 p-[1.5px] shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                    <div className="w-full h-full bg-[#070b1e] rounded-[10px] flex items-center justify-center">
                      <Bot className="w-5 h-5 text-cyan-300" />
                    </div>
                  </div>
                )}

                {/* Bubble Container */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm sm:text-[15px] leading-relaxed relative group ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none shadow-[0_0_20px_rgba(37,99,235,0.25)]'
                      : 'bg-slate-900/80 backdrop-blur-xl border border-cyan-500/25 text-slate-200 rounded-tl-none shadow-[0_0_25px_rgba(6,182,212,0.1)]'
                  }`}
                >
                  {/* Media attached to message */}
                  {msg.mediaUrl && (
                    <div className="mb-3 rounded-lg overflow-hidden border border-cyan-500/30 max-h-72">
                      {msg.mediaType === 'image' ? (
                        <img 
                          src={msg.mediaUrl} 
                          alt="Media input" 
                          className="w-full h-auto object-cover max-h-72 hover:scale-105 transition-transform"
                        />
                      ) : msg.mediaType === 'video' ? (
                        <video src={msg.mediaUrl} controls className="w-full max-h-72" />
                      ) : (
                        <div className="p-3 bg-slate-950/80 flex items-center gap-2 text-xs font-mono text-cyan-300">
                          <Paperclip className="w-4 h-4" />
                          <span>Biriktirilgan Hujjat</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Text Content */}
                  <div className="whitespace-pre-wrap font-sans selection:bg-cyan-500/30">
                    {msg.content}
                  </div>

                  {/* Google Search Grounding Citations */}
                  {msg.groundingSources && msg.groundingSources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-700/60 space-y-1.5">
                      <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block">
                        {t.status.searchGrounding}:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.groundingSources.map((source, idx) => (
                          <a
                            key={idx}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-slate-950/80 hover:bg-cyan-950 border border-cyan-500/30 text-cyan-300 transition-colors"
                          >
                            <span className="max-w-[180px] truncate">{source.title || source.uri}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message Bottom Toolbar (for Assistant) */}
                  {msg.role === 'assistant' && (
                    <div className="mt-3 pt-2 flex items-center justify-between text-xs text-slate-400 font-mono border-t border-slate-800/60">
                      <span>{msg.timestamp}</span>
                      <div className="flex items-center gap-2">
                        {/* Audio Speak button */}
                        <button
                          onClick={() => {
                            if (isSpeaking) {
                              onStopSpeaking();
                            } else {
                              onSpeakMessage(msg.content);
                            }
                          }}
                          title={isSpeaking ? "Ovozni to'xtatish" : "Ovozda o'qib berish"}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
                        >
                          {isSpeaking ? (
                            <VolumeX className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Copy button */}
                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
                          title="Nusxa olish"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* User Timestamp */}
                  {msg.role === 'user' && (
                    <div className="mt-1 text-right text-[10px] text-blue-200/80 font-mono">
                      {msg.timestamp}
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {msg.role === 'user' && (
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-300" />
                  </div>
                )}
              </div>
            ))}

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="flex gap-3 sm:gap-4 justify-start">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-purple-600 p-[1.5px]">
                  <div className="w-full h-full bg-[#070b1e] rounded-[10px] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-cyan-300 animate-spin" />
                  </div>
                </div>
                <div className="rounded-2xl rounded-tl-none p-4 bg-slate-900/80 border border-cyan-500/25 text-slate-300 text-xs font-mono flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="text-cyan-300">{t.status.processing}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area (Bottom Floating Glass Panel) */}
      <div className="pb-4 pt-2">
        {/* Attachment preview if selected */}
        {attachedFile && (
          <div className="mb-2 p-2 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2 truncate">
              {attachedFile.type === 'image' && (
                <img src={attachedFile.dataUrl} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-cyan-500/40" />
              )}
              {attachedFile.type === 'video' && <VideoIcon className="w-5 h-5 text-purple-400" />}
              {attachedFile.type === 'document' && <Paperclip className="w-5 h-5 text-cyan-400" />}
              <div className="truncate">
                <p className="font-medium text-slate-200 truncate max-w-xs">{attachedFile.name}</p>
                <p className="text-[10px] text-cyan-400 uppercase font-mono">{attachedFile.type}</p>
              </div>
            </div>
            <button
              onClick={() => setAttachedFile(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Live speech dictation indicator */}
        {isListening && (
          <div className="mb-2 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-300 font-mono animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{t.voice.listening}</span>
            </div>
            <button 
              onClick={onToggleVoiceInput}
              className="text-xs text-emerald-400 hover:underline"
            >
              To'xtatish
            </button>
          </div>
        )}

        {/* The Input Card */}
        <div className="relative rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] focus-within:border-cyan-400 focus-within:shadow-[0_0_35px_rgba(6,182,212,0.25)] transition-all">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.askPlaceholder}
            rows={2}
            className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 text-sm sm:text-base px-4 pt-3 pb-1 focus:outline-none resize-none font-sans"
          />

          {/* Bottom Action Controls: [🎤 Voice] [📷 Image] [🎬 Video] [＋ Attach] [Send] */}
          <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Voice Button */}
              <button
                type="button"
                onClick={onToggleVoiceInput}
                title={isListening ? "Tinglashni to'xtatish" : "Ovoz bilan gapirish"}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isListening
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse'
                    : 'bg-slate-800/80 text-cyan-300 hover:bg-cyan-950/80 border border-cyan-500/30 hover:border-cyan-400'
                }`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span className="hidden xs:inline">Voice</span>
              </button>

              {/* Image Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Rasm yuklash yoki tahlil qilish"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 text-purple-300 hover:bg-purple-950/80 border border-purple-500/30 hover:border-purple-400 transition-all"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Image</span>
              </button>

              {/* Video Shortcut Button */}
              <button
                type="button"
                onClick={() => onNavigateTab('studio')}
                title="Video va animatsiya yaratish"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 text-blue-300 hover:bg-blue-950/80 border border-blue-500/30 hover:border-blue-400 transition-all"
              >
                <VideoIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Video</span>
              </button>

              {/* Attach File Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Hujjat yoki fayl biriktirish"
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium bg-slate-800/60 text-slate-300 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-500 transition-all"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Attach</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,.pdf,.txt,.md,.json,.py,.js,.ts"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Send Button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={(!inputText.trim() && !attachedFile) || isProcessing}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 ${
                (!inputText.trim() && !attachedFile) || isProcessing
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
                  : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-semibold shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:scale-105 active:scale-95'
              }`}
            >
              <span>Yuborish</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
