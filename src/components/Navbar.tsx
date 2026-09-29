import React from 'react';
import { 
  Sparkles, 
  Palette, 
  Wrench, 
  Image as ImageIcon, 
  Volume2, 
  VolumeX, 
  Globe, 
  Cpu
} from 'lucide-react';
import { AppTab, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import boyPortraitImg from '../assets/images/boy_portrait.jpg';

interface NavbarProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isProcessing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  language,
  onLanguageChange,
  soundEnabled,
  onToggleSound,
  isProcessing,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#050713]/80 border-b border-cyan-500/20 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo and Tagline */}
        <div 
          onClick={() => onTabChange('chat')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-[1.5px] shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-all duration-300">
            <div className="w-full h-full bg-[#070b1e] rounded-[10px] flex items-center justify-center relative overflow-hidden">
              <img src={boyPortraitImg} alt="NASA AI" className="w-full h-full object-cover rounded-[9px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/70 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-orbitron font-extrabold text-lg sm:text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-purple-400">
                NASA AI
              </span>
              <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono tracking-tight bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                v3.8
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide hidden sm:block">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2 bg-slate-900/60 p-1 rounded-xl border border-cyan-500/20 backdrop-blur-md">
          <button
            onClick={() => onTabChange('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
              currentTab === 'chat'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/30 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">{t.chatTab}</span>
          </button>

          <button
            onClick={() => onTabChange('studio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
              currentTab === 'studio'
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-600/30 text-purple-300 border border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Palette className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">{t.studioTab}</span>
          </button>

          <button
            onClick={() => onTabChange('tools')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
              currentTab === 'tools'
                ? 'bg-gradient-to-r from-blue-500/20 to-indigo-600/30 text-blue-300 border border-blue-400/40 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Wrench className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">{t.toolsTab}</span>
          </button>

          <button
            onClick={() => onTabChange('gallery')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
              currentTab === 'gallery'
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-600/30 text-emerald-300 border border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">{t.galleryTab}</span>
          </button>
        </nav>

        {/* Right side controls: Language, Sound, Status */}
        <div className="flex items-center gap-2">
          {/* Status Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-300">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isProcessing ? 'bg-amber-400' : 'bg-cyan-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isProcessing ? 'bg-amber-500' : 'bg-cyan-500'}`}></span>
            </span>
            <span className="font-mono">
              {isProcessing ? t.status.processing : t.status.online}
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? "Ovoz yoqilgan (Mute)" : "Ovoz o'chirilgan (Unmute)"}
            className={`p-2 rounded-lg border transition-all ${
              soundEnabled
                ? 'border-cyan-500/40 bg-cyan-950/40 text-cyan-400 hover:bg-cyan-900/50'
                : 'border-slate-800 bg-slate-900/40 text-slate-500 hover:text-slate-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Language Selector */}
          <div className="relative flex items-center bg-slate-900/80 border border-cyan-500/30 rounded-lg p-0.5 text-xs font-mono">
            <Globe className="w-3.5 h-3.5 ml-2 mr-1 text-cyan-400 hidden xs:block" />
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="bg-transparent text-slate-200 text-xs px-2 py-1 focus:outline-none cursor-pointer rounded"
            >
              <option value="uz" className="bg-slate-900 text-slate-200">UZ (O'zbek)</option>
              <option value="en" className="bg-slate-900 text-slate-200">EN (English)</option>
              <option value="ru" className="bg-slate-900 text-slate-200">RU (Русский)</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
