import React from 'react';
import { Download, Film, Image as ImageIcon, Volume2, Trash2 } from 'lucide-react';
import { GeneratedAsset, Language } from '../types';

interface GalleryProps {
  assets: GeneratedAsset[];
  onDeleteAsset: (id: string) => void;
  language: Language;
}

export const Gallery: React.FC<GalleryProps> = ({
  assets,
  onDeleteAsset,
  language,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-cyan-500/20">
        <div>
          <h1 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300">
            {language === 'uz' ? 'NASA AI Galereyasi' : language === 'ru' ? 'Галерея NASA AI' : 'NASA AI Gallery'}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            {language === 'uz' 
              ? 'Siz yaratgan barcha video, surat va animatsiyalar to‘plami' 
              : language === 'ru' 
              ? 'Коллекция всех созданных вами видео, изображений и анимаций' 
              : 'Archive of all your generated videos, images, and neural creations'}
          </p>
        </div>
        <span className="font-mono text-xs text-cyan-300 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30">
          {assets.length} {language === 'uz' ? 'ta fayl' : 'items'}
        </span>
      </div>

      {assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
          <Film className="w-12 h-12 text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-300">
            {language === 'uz' ? 'Hozircha saqlangan fayllar yo\'q' : 'No generated files yet'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            {language === 'uz'
              ? 'Ijodiy studiyada rasm yoki video generatsiya qiling, ular avtomatik shu yerda saqlanadi.'
              : 'Generate an image or video in Creative Studio, and it will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="group relative rounded-2xl overflow-hidden bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 shadow-lg flex flex-col"
            >
              <div className="relative aspect-video sm:aspect-square bg-slate-950 flex items-center justify-center overflow-hidden">
                {asset.type === 'video' ? (
                  <video src={asset.url} controls className="w-full h-full object-cover" />
                ) : asset.type === 'image' ? (
                  <img src={asset.url} alt={asset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-cyan-400">
                    <Volume2 className="w-12 h-12 mb-2" />
                    <audio src={asset.url} controls className="w-48" />
                  </div>
                )}

                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 text-[10px] font-mono text-cyan-300 uppercase">
                  {asset.type}
                </div>
              </div>

              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-xs text-slate-200 line-clamp-1">{asset.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{asset.prompt}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(asset.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={asset.url}
                      download={`NASA_AI_${asset.title.replace(/\s+/g, '_')}.${asset.type === 'video' ? 'webm' : 'png'}`}
                      className="p-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-500/30 transition-colors"
                      title="Yuklab olish"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => onDeleteAsset(asset.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
