import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Palette, 
  Video as VideoIcon, 
  Wand2, 
  Volume2, 
  Music, 
  BookOpen, 
  Download, 
  Play, 
  Pause, 
  Upload, 
  Sliders, 
  Layers, 
  RefreshCw, 
  Check, 
  Film,
  Camera,
  Bot,
  UserCheck,
  Zap,
  Heart
} from 'lucide-react';
import { Language, GeneratedAsset } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { playPcmAudio, speakBrowserVoice } from '../utils/audio';
import { urlToBase64 } from '../utils/imageHelper';
import boyPortraitImg from '../assets/images/boy_portrait.jpg';
import uzbekBoyRobotImg from '../assets/images/uzbek_boy_robot.jpg';
import { ImageEditorStudio } from './ImageEditorStudio';

interface CreativeStudioProps {
  language: Language;
  onAddAsset: (asset: GeneratedAsset) => void;
  onSpeakText: (text: string) => void;
}

type StudioSection = 'imageGen' | 'imageEdit' | 'videoGen' | 'photoAnim' | 'voiceGen' | 'musicGen' | 'storyWriter';

export const CreativeStudio: React.FC<CreativeStudioProps> = ({
  language,
  onAddAsset,
  onSpeakText,
}) => {
  const t = TRANSLATIONS[language];
  const [activeSection, setActiveSection] = useState<StudioSection>('photoAnim');

  // Selected photo preset
  const [selectedPhotoType, setSelectedPhotoType] = useState<'boy' | 'poster' | 'custom'>('boy');

  // 1. IMAGE GENERATOR STATE
  const [imagePrompt, setImagePrompt] = useState('Futuristic neon city at night with floating holographic cars and NASA AI robot');
  const [imageAspectRatio, setImageAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('1:1');
  const [imageStyle, setImageStyle] = useState('Cyberpunk Neon');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // 2. IMAGE EDITOR STATE - default to the Uzbek boy portrait
  const [editImageFile, setEditImageFile] = useState<string | null>(boyPortraitImg);
  const [editInstruction, setEditInstruction] = useState('Transform into a futuristic cyberpunk character with glowing neon blue aura and high-tech visor');
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [editFilter, setEditFilter] = useState<{
    brightness: number;
    contrast: number;
    neonGlow: number;
    cyberTint: boolean;
  }>({
    brightness: 100,
    contrast: 110,
    neonGlow: 30,
    cyberTint: false,
  });

  // 3. VIDEO GENERATOR / IMAGE-TO-VIDEO STATE - default to the Uzbek boy portrait
  const [videoPrompt, setVideoPrompt] = useState('Make this person walk through a futuristic city with glowing holographic signs');
  const [videoSourceImage, setVideoSourceImage] = useState<string | null>(boyPortraitImg);
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('9:16');
  const [videoDuration, setVideoDuration] = useState<number>(5);
  const [videoMotion, setVideoMotion] = useState<'pan' | 'zoom' | 'cinematic' | 'orbit'>('cinematic');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  // 4. PHOTO ANIMATOR (Neural Canvas Engine & Recorder) - default to the Uzbek boy portrait
  const [animPhoto, setAnimPhoto] = useState<string | null>(boyPortraitImg);
  const [animStyle, setAnimStyle] = useState<'cyber' | 'space' | 'hologram'>('cyber');
  const [animMode, setAnimMode] = useState<'talking' | 'cinematic' | 'matrix'>('talking');
  const [speechPhrase, setSpeechPhrase] = useState<string>("Salom! Men sun'iy intellektman! Sizning rasmingizdan videolar yaratib, siz bilan gaplashaman!");
  const [isSpeakingPhrase, setIsSpeakingPhrase] = useState<boolean>(false);
  const [isRecordingAnim, setIsRecordingAnim] = useState(false);
  const [animVideoResult, setAnimVideoResult] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const animImageElementRef = useRef<HTMLImageElement | null>(null);

  // Preload and cache image for smooth 60fps canvas rendering
  useEffect(() => {
    if (!animPhoto) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = animPhoto;
    img.onload = () => {
      animImageElementRef.current = img;
    };
    animImageElementRef.current = img;
  }, [animPhoto]);

  // 5. VOICE GENERATOR
  const [voiceText, setVoiceText] = useState(
    language === 'uz' 
      ? "Salom! Men NASA AI sun'iy intellektman. Sizning rasmingizdan videolar yaratib, siz bilan gaplashaman!"
      : language === 'ru'
      ? "Привет! Я NASA AI — универсальный искусственный интеллект. Я создаю видео из ваших фото и общаюсь с вами!"
      : "Hello! I am NASA AI. I create videos from your photos and assist you with anything in the universe!"
  );
  const [voiceName, setVoiceName] = useState<'Kore' | 'Puck' | 'Fenrir' | 'Zephyr'>('Kore');
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);

  // 6. MUSIC / SOUND ATMOSPHERE GENERATOR
  const [musicMood, setMusicMood] = useState<'space' | 'cyber' | 'ambient' | 'pulsar'>('space');
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeOscillatorsRef = useRef<any[]>([]);

  // 7. STORY WRITER
  const [storyGenre, setStoryGenre] = useState('Space Sci-Fi');
  const [storyTopic, setStoryTopic] = useState('First human contact with an ancient quantum civilization on Jupiter\'s moon Europa');
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<string | null>(null);

  // Neural Cinema Engine: 60 FPS Animation Loop for Photo Animator
  useEffect(() => {
    let active = true;
    let startTime = performance.now();

    const renderAnimFrame = (time: number) => {
      if (!active) return;
      const canvas = canvasRef.current;
      if (!canvas) {
        animFrameRef.current = requestAnimationFrame(renderAnimFrame);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const elapsed = (time - startTime) / 1000;
      const w = canvas.width;
      const h = canvas.height;

      // Clear with deep space canvas
      ctx.fillStyle = '#040714';
      ctx.fillRect(0, 0, w, h);

      // Render Subject Photo with smooth cinematic motion & parallax zoom
      const img = animImageElementRef.current;
      if (img && img.complete && img.naturalWidth > 0) {
        // Camera gentle breathing zoom & cinematic pan
        const zoom = 1.04 + Math.sin(elapsed * 0.8) * 0.03;
        const panX = Math.cos(elapsed * 0.5) * 8;
        const panY = Math.sin(elapsed * 0.6) * 6;

        ctx.save();
        ctx.translate(w / 2 + panX, h / 2 + panY);
        ctx.scale(zoom, zoom);

        // Aspect-ratio cover calculation
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = w / h;
        let renderW = w;
        let renderH = h;
        if (imgRatio > canvasRatio) {
          renderW = h * imgRatio;
        } else {
          renderH = w / imgRatio;
        }

        ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH);
        ctx.restore();
      }

      // Draw futuristic cyberpunk / space holographic overlays
      // 1. Moving neon grid at bottom
      ctx.save();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.lineWidth = 1;
      const gridOffset = (elapsed * 40) % 30;
      for (let y = h * 0.65; y < h; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y + gridOffset);
        ctx.lineTo(w, y + gridOffset);
        ctx.stroke();
      }
      ctx.restore();

      // 2. NASA AI Hologram Companion Widget in upper corner (inspired by the friendly robot in the uploaded image!)
      ctx.save();
      const botX = w - 100;
      const botY = 100 + Math.sin(elapsed * 2) * 8;

      // Bot glow halo
      ctx.beginPath();
      ctx.arc(botX, botY, 40, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.fill();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Bot face screen
      ctx.fillStyle = '#070b1e';
      ctx.fillRect(botX - 25, botY - 18, 50, 36);

      // Bot happy blue glowing eyes (^^)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(botX - 12, botY - 2, 7, Math.PI, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(botX + 12, botY - 2, 7, Math.PI, 0);
      ctx.stroke();

      // Holographic Speech Bubble from robot
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(botX - 190, botY - 60, 160, 42, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 10px Rajdhani, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("NASA AI VIDEO CREATOR", botX - 110, botY - 42);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '9px Space Grotesk, sans-serif';
      ctx.fillText(language === 'uz' ? "Rasm -> Video -> Gap ✨" : "Photo -> Video -> Voice ✨", botX - 110, botY - 26);

      ctx.restore();

      // 3. Mode-Specific Creative Overlays
      if (animMode === 'talking') {
        ctx.save();
        const waveX = w / 2;
        const waveY = h * 0.65;
        const barCount = 14;
        const barW = 4;
        const gap = 5;
        const totalW = barCount * (barW + gap);
        const startX = waveX - totalW / 2;

        // Background neon capsule
        ctx.fillStyle = 'rgba(7, 11, 30, 0.8)';
        ctx.strokeStyle = isSpeakingPhrase ? '#ec4899' : '#06b6d4';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(startX - 15, waveY - 22, totalW + 30, 44, 14);
        ctx.fill();
        ctx.stroke();

        // Animated voice frequency bars
        for (let b = 0; b < barCount; b++) {
          const pulseFactor = isSpeakingPhrase ? 1.8 : 0.8;
          const barH = Math.max(6, (Math.sin(elapsed * 7 + b * 0.7) * 10 + 14) * pulseFactor);
          const bx = startX + b * (barW + gap);
          const by = waveY - barH / 2;

          const barGrad = ctx.createLinearGradient(0, by, 0, by + barH);
          barGrad.addColorStop(0, '#38bdf8');
          barGrad.addColorStop(1, '#ec4899');
          ctx.fillStyle = barGrad;
          ctx.beginPath();
          ctx.roundRect(bx, by, barW, barH, 2);
          ctx.fill();
        }

        // Subtitle caption matching smartphone video from uploaded poster
        ctx.font = 'bold 12px Rajdhani, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(
          isSpeakingPhrase ? "«Salom do'stlar! Bugun biz birga...»" : "«Orzular katta bo'lsin! 👑»",
          w / 2,
          waveY + 40
        );
        ctx.restore();
      } else if (animMode === 'matrix') {
        // Digital Matrix code overlay
        ctx.save();
        ctx.font = '10px monospace';
        ctx.fillStyle = 'rgba(16, 185, 129, 0.65)';
        for (let c = 0; c < 8; c++) {
          const mx = 30 + c * 60;
          const my = ((elapsed * 50 + c * 35) % (h * 0.7)) + 50;
          ctx.fillText(Math.random() > 0.5 ? '10110' : '01001', mx, my);
        }
        ctx.restore();
      }

      // 4. Floating particle vortex
      ctx.save();
      for (let i = 0; i < 20; i++) {
        const pAngle = elapsed * 0.4 + (i * Math.PI) / 10;
        const pDist = 120 + Math.sin(elapsed + i) * 60;
        const px = w / 2 + Math.cos(pAngle) * pDist;
        const py = h / 2 + Math.sin(pAngle) * (pDist * 0.8);
        ctx.fillStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.7)' : 'rgba(168, 85, 247, 0.7)';
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 5. Bottom HUD banner
      ctx.save();
      ctx.fillStyle = 'rgba(5, 7, 19, 0.75)';
      ctx.fillRect(0, h - 60, w, 60);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("NASA AI NEURAL CINEMA • 60 FPS", w / 2, h - 35);
      ctx.font = '10px Space Grotesk, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText("Tasavvur qil. So'ra. Yarat. (Imagine it. Ask it. Create it.)", w / 2, h - 18);
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(renderAnimFrame);
    };

    animFrameRef.current = requestAnimationFrame(renderAnimFrame);

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [animPhoto, animStyle, animMode, isSpeakingPhrase, language]);

  // Record Canvas Animation to actual Video file (.webm / .mp4)
  const handleRecordAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isRecordingAnim) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecordingAnim(false);
      return;
    }

    try {
      recordedChunksRef.current = [];
      const stream = canvas.captureStream(30); // 30 FPS
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        setAnimVideoResult(videoUrl);
        onAddAsset({
          id: `vid-${Date.now()}`,
          type: 'video',
          url: videoUrl,
          prompt: 'NASA AI Animated Character Video',
          timestamp: Date.now(),
          title: 'Animated Character Video',
        });
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecordingAnim(true);

      // Auto stop after 6 seconds if user doesn't press stop
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          setIsRecordingAnim(false);
        }
      }, 6000);
    } catch (err) {
      console.error('Failed to record canvas:', err);
    }
  };

  // Image Generation Handler
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || isGeneratingImage) return;

    setIsGeneratingImage(true);
    setGeneratedImageUrl(null);

    try {
      const res = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio: imageAspectRatio,
          style: imageStyle,
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        onAddAsset({
          id: `img-${Date.now()}`,
          type: 'image',
          url: data.imageUrl,
          prompt: imagePrompt,
          timestamp: Date.now(),
          title: `${imageStyle} Image`,
        });
      } else {
        // Fallback: create high-tech procedural artwork on canvas
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = imageAspectRatio === '16:9' ? 576 : imageAspectRatio === '9:16' ? 1440 : 1024;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          const grad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w * 0.7);
          grad.addColorStop(0, '#0c1b44');
          grad.addColorStop(0.5, '#060a1e');
          grad.addColorStop(1, '#02030a');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);

          // Neon geometric grid
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
          ctx.lineWidth = 2;
          for (let i = 0; i < w; i += 60) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, h);
            ctx.stroke();
          }

          // Glowing NASA AI Orb center
          ctx.fillStyle = '#06b6d4';
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 40;
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, 160, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = 'bold 36px Orbitron, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText('NASA AI SYNTHESIS', w / 2, h / 2 - 20);
          ctx.font = '24px Space Grotesk, sans-serif';
          ctx.fillText(imagePrompt.slice(0, 40) + '...', w / 2, h / 2 + 40);

          const fallbackUrl = canvas.toDataURL('image/png');
          setGeneratedImageUrl(fallbackUrl);
        }
      }
    } catch (err) {
      console.error('Image gen error:', err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Image Editing / Transformation
  const handleEditImage = async () => {
    if (!editImageFile || !editInstruction.trim() || isEditingImage) return;

    setIsEditingImage(true);
    setEditedImageUrl(null);

    try {
      const { base64, mimeType } = await urlToBase64(editImageFile);
      const res = await fetch('/api/image/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          instructions: editInstruction,
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setEditedImageUrl(data.imageUrl);
      } else {
        // Apply procedural canvas filters (HDR, Neon glow, tint)
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = editImageFile;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width || 800;
          canvas.height = img.height || 1000;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.filter = `brightness(${editFilter.brightness}%) contrast(${editFilter.contrast}%)`;
            ctx.drawImage(img, 0, 0);

            // Overlay neon cyberpunk tint
            if (editFilter.cyberTint) {
              ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            const processedUrl = canvas.toDataURL('image/png');
            setEditedImageUrl(processedUrl);
          }
        };
      }
    } catch (err) {
      console.error('Image edit error:', err);
    } finally {
      setIsEditingImage(false);
    }
  };

  // Video Generation Handler (Veo 3-step or Neural Cinema)
  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim() || isGeneratingVideo) return;

    setIsGeneratingVideo(true);
    setVideoProgress(15);
    setGeneratedVideoUrl(null);

    try {
      let base64Img: string | undefined = undefined;
      let mimeType = 'image/jpeg';
      if (videoSourceImage) {
        const converted = await urlToBase64(videoSourceImage);
        base64Img = converted.base64;
        mimeType = converted.mimeType;
      }

      // 1. Start generation
      const startRes = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          imageBase64: base64Img,
          mimeType,
          aspectRatio: videoAspectRatio,
          resolution: '720p',
        }),
      });

      const startData = await startRes.json();

      if (startData.operationName) {
        // Poll status
        setVideoProgress(45);
        let done = false;
        let attempts = 0;

        while (!done && attempts < 8) {
          await new Promise((r) => setTimeout(r, 4000));
          attempts++;
          setVideoProgress(Math.min(90, 45 + attempts * 6));

          const statusRes = await fetch('/api/video-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName: startData.operationName }),
          });
          const statusData = await statusRes.json();
          if (statusData.done) {
            done = true;
            break;
          }
        }

        if (done) {
          // Download video
          const downloadRes = await fetch('/api/video-download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName: startData.operationName }),
          });
          const blob = await downloadRes.blob();
          const vUrl = URL.createObjectURL(blob);
          setGeneratedVideoUrl(vUrl);
          setVideoProgress(100);
          return;
        }
      }

      // If Veo is queuing or requires paid key, use NASA AI's Neural Cinema Engine recording
      setVideoProgress(60);
      const canvas = canvasRef.current;
      if (canvas) {
        const stream = canvas.captureStream(30);
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          setGeneratedVideoUrl(url);
          setVideoProgress(100);
          onAddAsset({
            id: `vid-${Date.now()}`,
            type: 'video',
            url,
            prompt: videoPrompt,
            timestamp: Date.now(),
            title: 'Neural Cinema Video',
          });
        };

        recorder.start();
        setTimeout(() => recorder.stop(), 5000);
      }
    } catch (err) {
      console.error('Video gen error:', err);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // Voice Generator (Gemini TTS or browser voice)
  const handleGenerateVoice = async () => {
    if (!voiceText.trim() || isGeneratingVoice) return;
    setIsGeneratingVoice(true);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: voiceText,
          voice: voiceName,
          language,
        }),
      });

      const data = await res.json();
      if (data.audioBase64) {
        playPcmAudio(data.audioBase64, () => setIsGeneratingVoice(false));
      } else {
        // Fallback to browser voice synthesis
        speakBrowserVoice(voiceText, language, () => setIsGeneratingVoice(false));
      }
    } catch (err) {
      speakBrowserVoice(voiceText, language, () => setIsGeneratingVoice(false));
    }
  };

  // Music Atmosphere Synthesizer (Web Audio API Synth)
  const toggleMusicSynth = () => {
    if (isPlayingMusic) {
      activeOscillatorsRef.current.forEach((node) => {
        try { node.stop(); } catch (e) {}
      });
      activeOscillatorsRef.current = [];
      audioContextRef.current?.close().catch(() => {});
      audioContextRef.current = null;
      setIsPlayingMusic(false);
      return;
    }

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);

      // Sci-fi drone chords (Space / Cyber ambiance)
      const baseFreq = musicMood === 'space' ? 110 : musicMood === 'cyber' ? 130.81 : 82.41;
      const freqs = [baseFreq, baseFreq * 1.5, baseFreq * 2, baseFreq * 2.5];

      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const oscGain = audioCtx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        // Slow subtle LFO frequency drift
        osc.frequency.setTargetAtTime(freq * (1 + (idx * 0.01)), audioCtx.currentTime + 2, 4);

        oscGain.gain.setValueAtTime(0.2 / (idx + 1), audioCtx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start();
        activeOscillatorsRef.current.push(osc);
      });

      setIsPlayingMusic(true);
    } catch (err) {
      console.warn('Audio synth error:', err);
    }
  };

  // Story Writer Handler
  const handleGenerateStory = async () => {
    if (!storyTopic.trim() || isGeneratingStory) return;
    setIsGeneratingStory(true);
    setGeneratedStory(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Write a compelling, cinematic futuristic story or screenplay scene based on: "${storyTopic}". Genre: ${storyGenre}. Make it thrilling, vivid, with memorable futuristic technology and characters. Language: ${language === 'uz' ? 'Uzbek' : language === 'ru' ? 'Russian' : 'English'}.`,
          language,
        }),
      });
      const data = await res.json();
      setGeneratedStory(data.text);
    } catch (err) {
      console.error('Story gen error:', err);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-cyan-500/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-mono mb-2">
            <Wand2 className="w-3.5 h-3.5" />
            <span>NEURAL MULTIMODAL PRODUCTION</span>
          </div>
          <h1 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-400">
            {t.studio.title}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            {t.studio.subtitle}
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-cyan-500/20 backdrop-blur-md">
          {[
            { id: 'photoAnim', label: t.studio.photoAnimator, icon: Film },
            { id: 'videoGen', label: t.studio.videoGen, icon: VideoIcon },
            { id: 'imageGen', label: t.studio.imageGen, icon: Palette },
            { id: 'imageEdit', label: t.studio.imageEdit, icon: Sliders },
            { id: 'voiceGen', label: t.studio.voiceGen, icon: Volume2 },
            { id: 'musicGen', label: t.studio.musicGen, icon: Music },
            { id: 'storyWriter', label: t.studio.storyWriter, icon: BookOpen },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as StudioSection)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? 'bg-gradient-to-r from-cyan-500/30 to-purple-600/40 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Hero Showcase Banner matching user uploaded poster */}
      <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#070e28]/95 via-[#0b1640]/90 to-[#0e0c2e]/95 border border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.2)] backdrop-blur-2xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center gap-6 relative z-10">
          {/* Person photo ("Sizning rasmingiz") thumbnail with neon frame */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="relative group cursor-pointer" onClick={() => {
              setSelectedPhotoType('boy');
              setAnimPhoto(boyPortraitImg);
              setVideoSourceImage(boyPortraitImg);
              setEditImageFile(boyPortraitImg);
            }}>
              <div className="w-28 h-36 sm:w-32 sm:h-40 rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)] group-hover:scale-105 transition-transform bg-slate-950">
                <img 
                  src={boyPortraitImg} 
                  alt="Ushbu odam rasmi" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="absolute -bottom-2 -left-2 -right-2 py-0.5 px-2 rounded-full bg-cyan-500 text-slate-950 font-bold text-[10px] text-center font-mono shadow-lg uppercase tracking-wider">
                Sizning rasmingiz
              </div>
            </div>

            {/* Neon Arrow pointing to video generation */}
            <div className="hidden sm:flex flex-col items-center text-cyan-400">
              <span className="text-2xl animate-pulse">➔</span>
              <span className="text-[10px] font-mono text-cyan-300 whitespace-nowrap">AI Video</span>
            </div>
          </div>

          {/* Speech Bubble & Robot Info */}
          <div className="flex-1 space-y-3 text-center lg:text-left">
            {/* Robot message bubble */}
            <div className="p-4 rounded-2xl bg-cyan-950/50 border border-cyan-400/50 shadow-inner">
              <div className="flex items-center gap-2 mb-1 justify-center lg:justify-start">
                <Bot className="w-5 h-5 text-cyan-300 animate-bounce" />
                <span className="font-orbitron font-bold text-xs sm:text-sm text-cyan-300">
                  NASA AI Robot Hamrohi:
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-950/80 text-pink-300 border border-pink-500/50 font-mono font-bold">
                  Endi siz bilan video qilaman! ❤️
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-100 font-semibold leading-relaxed">
                "Salom! Men sun'iy intellektman! Sizning rasmingizdan videolar yaratib, siz bilan gaplashaman!"
              </p>
            </div>

            {/* Feature Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 justify-center lg:justify-start">
              <button
                onClick={() => {
                  setActiveSection('photoAnim');
                  setSelectedPhotoType('boy');
                  setAnimPhoto(boyPortraitImg);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold font-orbitron shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:brightness-110 transition-all"
              >
                <Film className="w-4 h-4" />
                <span>Rasm orqali video yaratish</span>
              </button>

              <button
                onClick={() => onSpeakText("Salom! Men sun'iy intellektman! Sizning rasmingizdan videolar yaratib, siz bilan gaplashaman!")}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 border border-purple-400/40 text-purple-200 text-xs font-medium transition-all"
              >
                <Volume2 className="w-4 h-4 text-purple-400" />
                <span>Ovoz bilan gapirish</span>
              </button>

              <button
                onClick={() => {
                  setActiveSection('imageEdit');
                  setEditImageFile(boyPortraitImg);
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-pink-900/60 hover:bg-pink-800/80 border border-pink-400/50 text-pink-200 text-xs font-medium transition-all shadow-[0_0_12px_rgba(236,72,153,0.3)]"
              >
                <Sliders className="w-4 h-4 text-pink-400" />
                <span>Suratni Chiroyli Tahrirlash</span>
              </button>

              <button
                onClick={() => {
                  setActiveSection('photoAnim');
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-cyan-300 text-xs transition-all"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>AI animatsiya</span>
              </button>

              <span className="text-xs font-mono text-amber-300 flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-950/40 border border-amber-500/40 font-semibold">
                ⭐ Barcha g'oyalar uchun tayyor!
              </span>
            </div>
          </div>
        </div>

        {/* Bottom banner highlight */}
        <div className="mt-4 pt-3 border-t border-cyan-500/25 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-cyan-300 gap-2">
          <div className="font-bold flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">RASMINGIZDAN VIDEO YARATIB BERAMAN! ❤️</span>
            <span className="text-slate-400 hidden sm:inline">• Orzular katta bo'lsin! 👑</span>
          </div>
          <span className="text-slate-400">
            Rasm ➔ Video ➔ Gap (AI Video Creator)
          </span>
        </div>
      </div>

      {/* 1. PHOTO ANIMATOR (Neural Canvas Engine & Direct Video Export) */}
      {activeSection === 'photoAnim' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-xl shadow-[0_0_25px_rgba(6,182,212,0.1)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-orbitron text-base font-bold text-cyan-300 flex items-center gap-2">
                  <Film className="w-4 h-4 text-cyan-400" />
                  <span>{t.studio.photoAnimator}</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  REAL-TIME 60 FPS
                </span>
              </div>

              {/* Photo Preset Selector (Boy / Poster / Custom) */}
              <div className="space-y-2 mb-4">
                <label className="text-xs font-mono text-cyan-300 block font-bold">
                  Surat manbasi (Tanlang yoki yuklang):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Option 1: The Boy's Portrait */}
                  <button
                    onClick={() => {
                      setSelectedPhotoType('boy');
                      setAnimPhoto(boyPortraitImg);
                      setVideoSourceImage(boyPortraitImg);
                      setEditImageFile(boyPortraitImg);
                    }}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      selectedPhotoType === 'boy'
                        ? 'border-cyan-400 bg-cyan-950/80 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-12 h-14 rounded-lg overflow-hidden border border-cyan-400/50">
                      <img src={boyPortraitImg} alt="Ushbu bola surati" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-200 font-bold truncate max-w-full">
                      Bola surati
                    </span>
                    <span className="text-[9px] text-cyan-400 font-mono">Namuna</span>
                  </button>

                  {/* Option 2: Full Boy + Robot Poster */}
                  <button
                    onClick={() => {
                      setSelectedPhotoType('poster');
                      setAnimPhoto(uzbekBoyRobotImg);
                      setVideoSourceImage(uzbekBoyRobotImg);
                      setEditImageFile(uzbekBoyRobotImg);
                    }}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      selectedPhotoType === 'poster'
                        ? 'border-purple-400 bg-purple-950/80 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-12 h-14 rounded-lg overflow-hidden border border-purple-400/50">
                      <img src={uzbekBoyRobotImg} alt="NASA AI & Robot" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-200 font-bold truncate max-w-full">
                      Robot studiya
                    </span>
                    <span className="text-[9px] text-purple-400 font-mono">Poster</span>
                  </button>

                  {/* Option 3: Custom Upload */}
                  <label
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      selectedPhotoType === 'custom'
                        ? 'border-pink-400 bg-pink-950/80 shadow-[0_0_12px_rgba(236,72,153,0.4)]'
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-12 h-14 rounded-lg border border-dashed border-slate-600 flex items-center justify-center bg-slate-900/60 text-slate-400 hover:text-cyan-300">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-200 font-bold">
                      O'z rasmingiz
                    </span>
                    <span className="text-[9px] text-pink-400 font-mono">Yuklash</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const url = ev.target?.result as string;
                            setSelectedPhotoType('custom');
                            setAnimPhoto(url);
                            setVideoSourceImage(url);
                            setEditImageFile(url);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Cinematic Scene Prompt */}
              <div className="space-y-2 mb-4">
                <label className="text-xs font-mono text-slate-400 block">
                  Harakat & Sahna Tavsifi (Prompt):
                </label>
                <textarea
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-400 rounded-xl p-3 text-xs text-slate-200 focus:outline-none font-sans"
                  placeholder={t.studio.cinematicPrompt}
                />
              </div>

              {/* Visual Aura & HUD style */}
              <div className="space-y-2 mb-4">
                <label className="text-xs font-mono text-slate-400 block">
                  Animatsiya & Hologram Uslubi:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cyber', label: 'Cyberpunk Neon' },
                    { id: 'space', label: 'Space Odyssey' },
                    { id: 'hologram', label: 'Hologram HUD' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setAnimStyle(s.id as any)}
                      className={`p-2 rounded-xl text-xs font-medium border text-center transition-all ${
                        animStyle === s.id
                          ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Record Animation to Video */}
              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  onClick={handleRecordAnimation}
                  className={`w-full py-3 rounded-xl font-orbitron font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 transition-all ${
                    isRecordingAnim
                      ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse'
                      : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]'
                  }`}
                >
                  {isRecordingAnim ? (
                    <>
                      <span className="w-3 h-3 rounded-full bg-white animate-ping" />
                      <span>Yozib olinmoqda... To'xtatish (Stop)</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      <span>Rasmdan Video Yaratish & Yozish (Record Video)</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-400 text-center font-mono">
                  ✨ Suratdan 3D harakat, NASA AI robot hamrohi va neon animatsiyali video yaratadi
                </p>
              </div>
            </div>

            {/* Generated Video Output Box */}
            {animVideoResult && (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 backdrop-blur-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-emerald-300 font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    {t.studio.animateSuccess}
                  </span>
                  <a
                    href={animVideoResult}
                    download="NASA_AI_Animated_Video.webm"
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Yuklab olish (Download)</span>
                  </a>
                </div>
                <video src={animVideoResult} controls autoPlay loop className="w-full rounded-xl border border-emerald-500/30" />
              </div>
            )}
          </div>

          {/* Interactive 60 FPS Canvas Screen */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div className="w-full relative rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_35px_rgba(6,182,212,0.2)] bg-[#040714]">
              {/* Top overlay badge */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md border border-cyan-500/40 text-[11px] font-mono text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>LIVE PREVIEW • 9:16 VERTICAL REEL</span>
              </div>

              {/* Canvas viewport */}
              <div className="flex justify-center p-2 sm:p-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/60 via-[#030611] to-[#01030a]">
                <canvas
                  ref={canvasRef}
                  width={540}
                  height={800}
                  className="rounded-xl shadow-2xl max-h-[640px] w-auto border border-cyan-400/20 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. VIDEO GENERATOR (Text-to-Video & Veo 3-step Pipeline) */}
      {activeSection === 'videoGen' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-purple-500/25 backdrop-blur-xl">
              <h3 className="font-orbitron text-base font-bold text-purple-300 mb-3 flex items-center gap-2">
                <VideoIcon className="w-4 h-4 text-purple-400" />
                <span>{t.studio.videoGen}</span>
              </h3>

              <div className="space-y-4">
                {/* Source Image for Image-to-Video */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-purple-300 font-bold flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Image-to-Video Manbasi (Surat):</span>
                    </span>
                    {videoSourceImage && (
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                        Surat faol
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-16 rounded-lg overflow-hidden border border-purple-500/50 bg-slate-900 flex-shrink-0">
                      {videoSourceImage ? (
                        <img src={videoSourceImage} alt="Source" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Camera className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setVideoSourceImage(boyPortraitImg)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all ${
                          videoSourceImage === boyPortraitImg
                            ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 font-bold'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        👦 Bola surati (Namuna)
                      </button>
                      <button
                        onClick={() => setVideoSourceImage(uzbekBoyRobotImg)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all ${
                          videoSourceImage === uzbekBoyRobotImg
                            ? 'bg-purple-950/80 border-purple-400 text-purple-300 font-bold'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        🤖 Robot poster
                      </button>
                      <label className="cursor-pointer px-2.5 py-1 rounded-lg text-[11px] font-mono bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        <span>Boshqa rasm</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              const r = new FileReader();
                              r.onload = (ev) => setVideoSourceImage(ev.target?.result as string);
                              r.readAsDataURL(f);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1.5">
                    Sahna / Video Prompt:
                  </label>
                  <textarea
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950/80 border border-slate-700 focus:border-purple-400 rounded-xl p-3 text-xs text-slate-200 focus:outline-none"
                    placeholder="Describe what should happen in the video..."
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-1">
                      {t.studio.aspectRatio}:
                    </label>
                    <select
                      value={videoAspectRatio}
                      onChange={(e) => setVideoAspectRatio(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                    >
                      <option value="16:9">16:9 (Landscape)</option>
                      <option value="9:16">9:16 (Portrait Reel)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-1">
                      {t.studio.duration}:
                    </label>
                    <select
                      value={videoDuration}
                      onChange={(e) => setVideoDuration(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                    >
                      <option value={5}>5 soniya</option>
                      <option value={10}>10 soniya</option>
                      <option value={15}>15 soniya</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-1">
                      {t.studio.motionStyle}:
                    </label>
                    <select
                      value={videoMotion}
                      onChange={(e) => setVideoMotion(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                    >
                      <option value="cinematic">Cinematic Walk</option>
                      <option value="pan">Camera Pan</option>
                      <option value="zoom">Dynamic Zoom</option>
                      <option value="orbit">Orbital Rotation</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerateVideo}
                  disabled={isGeneratingVideo}
                  className="w-full py-3 rounded-xl font-orbitron font-bold text-xs sm:text-sm tracking-wide bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-all disabled:opacity-50"
                >
                  {isGeneratingVideo ? `Generatsiya jarayoni (${videoProgress}%)...` : t.studio.generateBtn}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            {generatedVideoUrl ? (
              <div className="w-full p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30">
                <video src={generatedVideoUrl} controls autoPlay loop className="w-full rounded-xl max-h-96 object-contain" />
                <div className="mt-3 flex justify-end">
                  <a
                    href={generatedVideoUrl}
                    download="NASA_AI_Video.webm"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-500 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Yuklab olish</span>
                  </a>
                </div>
              </div>
            ) : isGeneratingVideo ? (
              <div className="w-full h-80 rounded-2xl bg-slate-900/60 border border-purple-500/30 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-full border-2 border-purple-400 border-t-transparent animate-spin mb-4" />
                <p className="font-orbitron text-purple-300 text-sm font-bold mb-1">
                  NASA AI NEURAL VIDEO GENERATOR
                </p>
                <p className="text-slate-400 text-xs max-w-sm mb-4">
                  Veo 3.1 va Neural Cinema harakat kadrlari sintez qilinmoqda...
                </p>
                <div className="w-64 bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full transition-all duration-300" style={{ width: `${videoProgress}%` }} />
                </div>
              </div>
            ) : (
              <div className="w-full h-80 rounded-2xl border border-dashed border-slate-800 flex flex-col items-center justify-center p-6 text-center text-slate-500">
                <Film className="w-12 h-12 mb-3 text-slate-600" />
                <p className="text-sm font-medium text-slate-400">Video generatsiya qilish uchun prompt yozing va tugmani bosing</p>
                <p className="text-xs text-slate-500 mt-1">Matndan video yoki yuklangan rasmdan harakatli video yaratadi</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. IMAGE GENERATOR */}
      {activeSection === 'imageGen' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-xl">
              <h3 className="font-orbitron text-base font-bold text-cyan-300 mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4 text-cyan-400" />
                <span>{t.studio.imageGen}</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1.5">
                    Rasm Tavsifi (Prompt):
                  </label>
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-400 rounded-xl p-3 text-xs text-slate-200 focus:outline-none"
                    placeholder={t.studio.promptPlaceholder}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-1">
                      {t.studio.aspectRatio}:
                    </label>
                    <select
                      value={imageAspectRatio}
                      onChange={(e) => setImageAspectRatio(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                    >
                      <option value="1:1">1:1 (Kvadrat)</option>
                      <option value="16:9">16:9 (Keng ekran)</option>
                      <option value="9:16">9:16 (Vertikal)</option>
                      <option value="4:3">4:3 (Standart)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-1">
                      Uslub (Style):
                    </label>
                    <select
                      value={imageStyle}
                      onChange={(e) => setImageStyle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                    >
                      <option value="Cyberpunk Neon">Cyberpunk Neon</option>
                      <option value="Hyper-Realistic 8K">Hyper-Realistic 8K</option>
                      <option value="Space Odyssey Sci-Fi">Space Odyssey Sci-Fi</option>
                      <option value="3D Pixar Style">Futuristic 3D Render</option>
                      <option value="Anime Cyber">Anime Cyber</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage}
                  className="w-full py-3 rounded-xl font-orbitron font-bold text-xs sm:text-sm tracking-wide bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all disabled:opacity-50"
                >
                  {isGeneratingImage ? 'Rasm generatsiya qilinmoqda...' : t.studio.generateBtn}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex items-center justify-center">
            {generatedImageUrl ? (
              <div className="w-full p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30">
                <img src={generatedImageUrl} alt="Generated" className="w-full max-h-[500px] object-contain rounded-xl" />
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 truncate max-w-md">{imagePrompt}</span>
                  <a
                    href={generatedImageUrl}
                    download="NASA_AI_Image.png"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-medium hover:bg-cyan-500 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Yuklab olish</span>
                  </a>
                </div>
              </div>
            ) : isGeneratingImage ? (
              <div className="w-full h-80 rounded-2xl bg-slate-900/60 border border-cyan-500/30 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-4" />
                <p className="font-orbitron text-cyan-300 text-sm font-bold">NASA AI PIXEL RECONSTRUCTION</p>
                <p className="text-slate-400 text-xs mt-1">Neyron tarmoq tasvirni shakllantirmoqda...</p>
              </div>
            ) : (
              <div className="w-full h-80 rounded-2xl border border-dashed border-slate-800 flex flex-col items-center justify-center p-6 text-center text-slate-500">
                <Palette className="w-12 h-12 mb-3 text-slate-600" />
                <p className="text-sm font-medium text-slate-400">Generatsiya qilingan surat shu yerda ko'rinadi</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. IMAGE EDITOR & ENHANCER */}
      {/* 4. IMAGE EDITOR & ENHANCER */}
      {activeSection === 'imageEdit' && (
        <ImageEditorStudio
          language={language}
          onAddAsset={onAddAsset}
          initialImage={editImageFile || boyPortraitImg}
          onSendToVideo={(imgUrl) => {
            setAnimPhoto(imgUrl);
            setVideoSourceImage(imgUrl);
            setActiveSection('photoAnim');
          }}
        />
      )}

      {/* 5. VOICE GENERATOR */}
      {activeSection === 'voiceGen' && (
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-xl">
            <h3 className="font-orbitron text-lg font-bold text-cyan-300 mb-4 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-cyan-400" />
              <span>{t.studio.voiceGen}</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1.5">
                  Nutq Matni:
                </label>
                <textarea
                  value={voiceText}
                  onChange={(e) => setVoiceText(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-400 rounded-xl p-3 text-xs sm:text-sm text-slate-200 focus:outline-none"
                  placeholder="Talaffuz qilish uchun matn kiriting..."
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-2">
                  NASA AI Ovoz Modeli:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'Kore', label: 'Kore (Aniq & Mayin)', desc: 'Tabiiy ovoz' },
                    { id: 'Puck', label: 'Puck (Quvnoq Robot)', desc: 'Do‘stona AI' },
                    { id: 'Fenrir', label: 'Fenrir (Vazmin)', desc: 'Chuqur tembr' },
                    { id: 'Zephyr', label: 'Zephyr (Futuristik)', desc: 'Kiber yordamchi' },
                  ].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVoiceName(v.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        voiceName === v.id
                          ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <p className="font-medium text-xs">{v.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{v.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateVoice}
                disabled={isGeneratingVoice}
                className="w-full py-3 rounded-xl font-orbitron font-bold text-xs sm:text-sm tracking-wide bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all flex items-center justify-center gap-2"
              >
                {isGeneratingVoice ? (
                  <>
                    <span className="w-3 h-3 rounded-full bg-cyan-300 animate-ping" />
                    <span>Ovozda aytilmoqda...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Ovozni Eshitish & Sinash</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MUSIC / SOUND ATMOSPHERE GENERATOR */}
      {activeSection === 'musicGen' && (
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-500/25 backdrop-blur-xl">
            <h3 className="font-orbitron text-lg font-bold text-emerald-300 mb-4 flex items-center gap-2">
              <Music className="w-5 h-5 text-emerald-400" />
              <span>{t.studio.musicGen}</span>
            </h3>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-2">
                  Atmosfera Kayfiyati:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'space', label: 'Space Deep Drone', desc: 'Galaktik sokinlik' },
                    { id: 'cyber', label: 'Cyber Synth Pulse', desc: 'Kelajak ritmi' },
                    { id: 'ambient', label: 'Quantum Ambient', desc: 'Gipnotik to‘lqin' },
                    { id: 'pulsar', label: 'Pulsar Star Waves', desc: 'Kosmik nurlanish' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMusicMood(m.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        musicMood === m.id
                          ? 'border-emerald-400 bg-emerald-950/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <p className="font-medium text-xs">{m.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-950/60 border border-slate-800">
                <button
                  onClick={toggleMusicSynth}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                    isPlayingMusic
                      ? 'bg-emerald-500 text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.8)] scale-105 animate-pulse'
                      : 'bg-slate-800 text-emerald-400 hover:bg-emerald-950 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  }`}
                >
                  {isPlayingMusic ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </button>
                <p className="text-xs font-mono text-slate-300 mt-4">
                  {isPlayingMusic ? 'Atmosferik ovoz yangramoqda...' : 'Musiqa sintezini boshlash uchun bosing'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. AI STORY WRITER */}
      {activeSection === 'storyWriter' && (
        <div className="max-w-3xl mx-auto space-y-5">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-blue-500/25 backdrop-blur-xl">
            <h3 className="font-orbitron text-lg font-bold text-blue-300 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <span>{t.studio.storyWriter}</span>
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Janr:</label>
                  <select
                    value={storyGenre}
                    onChange={(e) => setStoryGenre(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                  >
                    <option value="Space Sci-Fi">Kosmik Ilmiy Fantastika</option>
                    <option value="Cyberpunk Adventure">Kiberpank Sarguzasht</option>
                    <option value="AI Awakening">Sun'iy Intellekt Uyg'onishi</option>
                    <option value="Time Travel Paradox">Vaqt Sayohatchisi</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Mavzu / G'oya:</label>
                  <input
                    type="text"
                    value={storyTopic}
                    onChange={(e) => setStoryTopic(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                    placeholder="Hikoya yoki ssenariy g'oyasi..."
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateStory}
                disabled={isGeneratingStory}
                className="w-full py-3 rounded-xl font-orbitron font-bold text-xs sm:text-sm tracking-wide bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-all disabled:opacity-50"
              >
                {isGeneratingStory ? 'Ssenariy yozilmoqda...' : 'Ssenariy Yaratish'}
              </button>

              {generatedStory && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-blue-500/30 text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800">
                    <span className="font-mono text-xs text-blue-400">NASA AI CINEMATIC SCRIPT</span>
                    <button
                      onClick={() => onSpeakText(generatedStory)}
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Ovozda eshitish</span>
                    </button>
                  </div>
                  {generatedStory}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
