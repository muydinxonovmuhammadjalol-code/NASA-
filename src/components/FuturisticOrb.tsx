import React from 'react';
import { Mic, Volume2 } from 'lucide-react';

interface FuturisticOrbProps {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const FuturisticOrb: React.FC<FuturisticOrbProps> = ({
  isListening,
  isSpeaking,
  isProcessing,
  onClick,
  size = 'lg',
}) => {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-36 h-36',
    lg: 'w-48 h-48 sm:w-56 sm:h-56',
  }[size];

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-6">
      {/* Outer ambient glow */}
      <div 
        className={`absolute rounded-full transition-all duration-700 blur-3xl pointer-events-none ${
          isListening 
            ? 'w-72 h-72 bg-emerald-500/30 scale-125' 
            : isSpeaking 
            ? 'w-72 h-72 bg-cyan-500/40 scale-125 animate-pulse'
            : isProcessing
            ? 'w-72 h-72 bg-purple-500/30 animate-ping'
            : 'w-64 h-64 bg-cyan-500/20 group-hover:bg-purple-500/30'
        }`}
      />

      {/* Main Orb Container */}
      <div 
        onClick={onClick}
        title={isListening ? "Tinglashni to'xtatish" : "Ovoz bilan gapirish uchun bosing"}
        className={`relative ${sizeClasses} rounded-full cursor-pointer flex items-center justify-center transition-transform duration-300 hover:scale-105 active:scale-95 group`}
      >
        {/* Orbital Ring 1 - Fast Clockwise */}
        <div 
          className="absolute inset-[-12px] rounded-full border border-cyan-400/30 border-dashed animate-orb-spin pointer-events-none"
          style={{ animationDuration: isListening ? '6s' : isSpeaking ? '8s' : '22s' }}
        />

        {/* Orbital Ring 2 - Slow Counter-Clockwise */}
        <div 
          className="absolute inset-[-24px] rounded-full border border-purple-500/25 border-dotted animate-orb-spin-rev pointer-events-none"
          style={{ animationDuration: isListening ? '8s' : isSpeaking ? '10s' : '30s' }}
        />

        {/* Pulsing energy coronal halo */}
        <div 
          className={`absolute inset-0 rounded-full transition-all duration-500 ${
            isListening
              ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 opacity-90 blur-md'
              : isSpeaking
              ? 'bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-500 opacity-90 blur-md'
              : isProcessing
              ? 'bg-gradient-to-r from-amber-400 via-purple-500 to-pink-500 opacity-80 blur-md'
              : 'bg-gradient-to-tr from-cyan-600 via-blue-600 to-purple-700 opacity-70 blur-md group-hover:opacity-100'
          }`}
        />

        {/* Inner Solid Orb Surface */}
        <div className="relative w-full h-full rounded-full bg-gradient-to-b from-[#0a122e] via-[#050819] to-[#02040c] border border-cyan-300/40 shadow-[inset_0_0_30px_rgba(56,189,248,0.5),0_0_35px_rgba(56,189,248,0.3)] flex items-center justify-center overflow-hidden">
          {/* Internal holographic energy lines */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-400/25 via-transparent to-transparent pointer-events-none" />
          
          {/* Animated Waveform Overlay when speaking or listening */}
          {(isListening || isSpeaking) ? (
            <div className="flex items-center gap-1.5 z-10">
              {[0.4, 0.9, 0.6, 1, 0.7, 0.8, 0.5, 0.9, 0.4].map((heightMul, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 rounded-full transition-all duration-150 ${
                    isListening ? 'bg-emerald-300' : 'bg-cyan-300'
                  }`}
                  style={{
                    height: `${20 + heightMul * 40}px`,
                    animation: 'pulse 0.6s ease-in-out infinite alternate',
                    animationDelay: `${idx * 0.08}s`,
                  }}
                />
              ))}
            </div>
          ) : isProcessing ? (
            <div className="flex flex-col items-center justify-center gap-1 z-10">
              <div className="w-8 h-8 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
              <span className="text-[10px] font-mono text-purple-300 tracking-widest uppercase">NASA AI</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center z-10 text-cyan-300 group-hover:text-cyan-100 transition-colors">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center mb-1 group-hover:border-cyan-300/70 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                <Mic className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-orbitron text-[11px] font-bold tracking-widest text-cyan-300 uppercase">
                NASA
              </span>
            </div>
          )}

          {/* Hologram scanline */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent w-full h-8 animate-scanline pointer-events-none" />
        </div>
      </div>

      {/* Voice Status Text */}
      <div className="mt-4 flex items-center gap-2 text-xs font-mono">
        {isListening ? (
          <span className="flex items-center gap-2 text-emerald-400 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Tinglamoqda... (Listening...)
          </span>
        ) : isSpeaking ? (
          <span className="flex items-center gap-2 text-cyan-300 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 animate-pulse">
            <Volume2 className="w-3.5 h-3.5" />
            Gapirmoqda... (Speaking...)
          </span>
        ) : isProcessing ? (
          <span className="flex items-center gap-2 text-purple-300 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/40">
            Fikrlamoqda... (Thinking...)
          </span>
        ) : (
          <span className="text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5" onClick={onClick}>
            <Mic className="w-3.5 h-3.5 text-cyan-400" />
            Ovoz bilan so'rash uchun bosing
          </span>
        )}
      </div>
    </div>
  );
};
