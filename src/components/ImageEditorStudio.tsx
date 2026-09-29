import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Sliders, 
  Wand2, 
  Sparkles, 
  Download, 
  RotateCcw, 
  Upload, 
  Eye, 
  Layers, 
  Type, 
  Check, 
  Camera, 
  Video as VideoIcon, 
  Palette,
  Sun,
  Contrast,
  Droplet,
  Brush,
  Undo2,
  Trash2,
  Bot,
  Zap,
  Star,
  Columns,
  Flame,
  Shield,
  Moon,
  RefreshCw
} from 'lucide-react';
import { Language, GeneratedAsset } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { urlToBase64 } from '../utils/imageHelper';
import boyPortraitImg from '../assets/images/boy_portrait.jpg';
import uzbekBoyRobotImg from '../assets/images/uzbek_boy_robot.jpg';

interface ImageEditorStudioProps {
  language: Language;
  onAddAsset: (asset: GeneratedAsset) => void;
  onSendToVideo?: (imageUrl: string) => void;
  initialImage?: string;
}

export type PresetFilterId = 'normal' | 'cyberpunk' | 'space' | 'gold' | 'hologram' | 'anime' | 'matrix' | 'hdr' | 'noir';
export type FrameId = 'none' | 'cyber_hex' | 'nasa_hud' | 'gold_glow';
export type StickerId = 'none' | 'cyber_visor' | 'neon_halo' | 'robot_companion' | 'badge_dreams' | 'badge_nasa' | 'uzb_star';

interface DrawPoint {
  x: number;
  y: number;
}

interface DrawStroke {
  points: DrawPoint[];
  color: string;
  size: number;
}

export const ImageEditorStudio: React.FC<ImageEditorStudioProps> = ({
  language,
  onAddAsset,
  onSendToVideo,
  initialImage,
}) => {
  const t = TRANSLATIONS[language];

  // Active image source & preset selector
  const [sourceImage, setSourceImage] = useState<string>(initialImage || boyPortraitImg);
  const [selectedPhotoPreset, setSelectedPhotoPreset] = useState<'boy' | 'poster' | 'custom'>('boy');

  // Sliders for light & color
  const [brightness, setBrightness] = useState<number>(108);
  const [contrast, setContrast] = useState<number>(120);
  const [saturation, setSaturation] = useState<number>(125);
  const [hueRotate, setHueRotate] = useState<number>(0);
  const [blur, setBlur] = useState<number>(0);
  const [vignette, setVignette] = useState<number>(35);
  const [neonGlow, setNeonGlow] = useState<number>(30);
  const [warmth, setWarmth] = useState<number>(0); // -50 (cool/cyan) to +50 (warm/gold)

  // Creative overlays & features
  const [activeFilter, setActiveFilter] = useState<PresetFilterId>('cyberpunk');
  const [activeFrame, setActiveFrame] = useState<FrameId>('cyber_hex');
  const [activeSticker, setActiveSticker] = useState<StickerId>('cyber_visor');
  const [overlayScanlines, setOverlayScanlines] = useState<boolean>(true);

  // Text overlay
  const [customText, setCustomText] = useState<string>("ORZULAR KATTA BO'LSIN! 👑");
  const [textPosition, setTextPosition] = useState<'bottom' | 'top' | 'center'>('bottom');
  const [textColor, setTextColor] = useState<string>('#38bdf8');
  const [showCustomText, setShowCustomText] = useState<boolean>(true);

  // Neon Drawing Brush State
  const [isBrushMode, setIsBrushMode] = useState<boolean>(false);
  const [brushColor, setBrushColor] = useState<string>('#06b6d4');
  const [brushSize, setBrushSize] = useState<number>(8);
  const [strokes, setStrokes] = useState<DrawStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<DrawPoint[] | null>(null);
  const isMouseDownRef = useRef<boolean>(false);

  // Interactive Comparison Slider Mode
  const [compareMode, setCompareMode] = useState<'off' | 'split'>('off');
  const [splitPosition, setSplitPosition] = useState<number>(50); // percentage 0-100
  const [showOriginalHold, setShowOriginalHold] = useState<boolean>(false);

  // AI Prompt Transformation
  const [aiPrompt, setAiPrompt] = useState<string>('Futuristik kiber neon aura, 8k kino uslubi, orqa fonda kiber shahar va yulduzlar');
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [aiResultNotice, setAiResultNotice] = useState<string | null>(null);

  // Canvas Refs
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);

  // Sync initialImage if changed externally
  useEffect(() => {
    if (initialImage) {
      setSourceImage(initialImage);
    }
  }, [initialImage]);

  // Load and cache active source image
  useEffect(() => {
    if (!sourceImage) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = sourceImage;
    img.onload = () => {
      loadedImageRef.current = img;
      renderLiveCanvas();
    };
    loadedImageRef.current = img;
  }, [sourceImage]);

  // Apply predefined preset filters
  const applyPresetFilter = (preset: PresetFilterId) => {
    setActiveFilter(preset);
    switch (preset) {
      case 'normal':
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
        setHueRotate(0);
        setVignette(0);
        setNeonGlow(0);
        setWarmth(0);
        setOverlayScanlines(false);
        setActiveFrame('none');
        break;
      case 'cyberpunk':
        setBrightness(112);
        setContrast(130);
        setSaturation(145);
        setHueRotate(345);
        setVignette(40);
        setNeonGlow(45);
        setWarmth(-15);
        setOverlayScanlines(true);
        setActiveFrame('cyber_hex');
        break;
      case 'space':
        setBrightness(98);
        setContrast(135);
        setSaturation(115);
        setHueRotate(215);
        setVignette(55);
        setNeonGlow(35);
        setWarmth(-25);
        setOverlayScanlines(false);
        setActiveFrame('nasa_hud');
        break;
      case 'gold':
        setBrightness(115);
        setContrast(125);
        setSaturation(140);
        setHueRotate(35);
        setVignette(35);
        setNeonGlow(40);
        setWarmth(35);
        setOverlayScanlines(false);
        setActiveFrame('gold_glow');
        break;
      case 'hologram':
        setBrightness(120);
        setContrast(140);
        setSaturation(75);
        setHueRotate(185);
        setVignette(50);
        setNeonGlow(60);
        setWarmth(-30);
        setOverlayScanlines(true);
        setActiveFrame('cyber_hex');
        break;
      case 'anime':
        setBrightness(112);
        setContrast(118);
        setSaturation(165);
        setHueRotate(0);
        setVignette(15);
        setNeonGlow(20);
        setWarmth(5);
        setOverlayScanlines(false);
        setActiveFrame('none');
        break;
      case 'matrix':
        setBrightness(102);
        setContrast(145);
        setSaturation(65);
        setHueRotate(100);
        setVignette(60);
        setNeonGlow(50);
        setWarmth(-40);
        setOverlayScanlines(true);
        setActiveFrame('cyber_hex');
        break;
      case 'hdr':
        setBrightness(106);
        setContrast(140);
        setSaturation(135);
        setHueRotate(0);
        setVignette(25);
        setNeonGlow(15);
        setWarmth(5);
        setOverlayScanlines(false);
        setActiveFrame('none');
        break;
      case 'noir':
        setBrightness(95);
        setContrast(165);
        setSaturation(0);
        setHueRotate(0);
        setVignette(65);
        setNeonGlow(30);
        setWarmth(0);
        setOverlayScanlines(true);
        setActiveFrame('cyber_hex');
        break;
    }
  };

  // Master Canvas Rendering Routine
  const renderLiveCanvas = useCallback(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = loadedImageRef.current;
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const w = 800;
    const h = Math.round((800 * img.naturalHeight) / img.naturalWidth);
    canvas.width = w;
    canvas.height = h;

    // Helper to draw the edited layers onto a context
    const drawEditedVersion = (targetCtx: CanvasRenderingContext2D) => {
      // 1. BASE IMAGE WITH FILTERS
      targetCtx.save();
      targetCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hueRotate}deg) blur(${blur}px)`;
      targetCtx.drawImage(img, 0, 0, w, h);
      targetCtx.restore();

      // 2. TEMPERATURE (WARMTH / COOL) TINT
      if (warmth !== 0) {
        targetCtx.save();
        if (warmth > 0) {
          targetCtx.fillStyle = `rgba(245, 158, 11, ${(warmth / 100) * 0.25})`;
        } else {
          targetCtx.fillStyle = `rgba(6, 182, 212, ${(Math.abs(warmth) / 100) * 0.25})`;
        }
        targetCtx.fillRect(0, 0, w, h);
        targetCtx.restore();
      }

      // 3. NEON GLOW COLOR LAYER
      if (neonGlow > 0) {
        targetCtx.save();
        targetCtx.globalCompositeOperation = 'screen';
        const glowAlpha = (neonGlow / 100) * 0.45;
        if (activeFilter === 'cyberpunk') {
          const neonGrad = targetCtx.createRadialGradient(w / 2, h / 2, 60, w / 2, h / 2, w * 0.7);
          neonGrad.addColorStop(0, `rgba(6, 182, 212, ${glowAlpha})`);
          neonGrad.addColorStop(0.7, `rgba(236, 72, 153, ${glowAlpha * 0.8})`);
          neonGrad.addColorStop(1, 'rgba(0,0,0,0)');
          targetCtx.fillStyle = neonGrad;
          targetCtx.fillRect(0, 0, w, h);
        } else if (activeFilter === 'gold') {
          const goldGrad = targetCtx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.75);
          goldGrad.addColorStop(0, `rgba(245, 158, 11, ${glowAlpha})`);
          goldGrad.addColorStop(1, 'rgba(0,0,0,0)');
          targetCtx.fillStyle = goldGrad;
          targetCtx.fillRect(0, 0, w, h);
        } else if (activeFilter === 'matrix') {
          targetCtx.fillStyle = `rgba(16, 185, 129, ${glowAlpha * 0.8})`;
          targetCtx.fillRect(0, 0, w, h);
        } else if (activeFilter === 'noir') {
          targetCtx.fillStyle = `rgba(6, 182, 212, ${glowAlpha * 0.5})`;
          targetCtx.fillRect(0, 0, w, h);
        } else {
          targetCtx.fillStyle = `rgba(56, 189, 248, ${glowAlpha * 0.7})`;
          targetCtx.fillRect(0, 0, w, h);
        }
        targetCtx.restore();
      }

      // 4. VIGNETTE SHADOW LAYER
      if (vignette > 0) {
        targetCtx.save();
        const vigGrad = targetCtx.createRadialGradient(w / 2, h / 2, w * 0.35, w / 2, h / 2, w * 0.75);
        vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
        vigGrad.addColorStop(1, `rgba(0,0,0, ${vignette / 100})`);
        targetCtx.fillStyle = vigGrad;
        targetCtx.fillRect(0, 0, w, h);
        targetCtx.restore();
      }

      // 5. SCANLINES HUD OVERLAY
      if (overlayScanlines) {
        targetCtx.save();
        targetCtx.fillStyle = 'rgba(6, 182, 212, 0.04)';
        for (let y = 0; y < h; y += 4) {
          targetCtx.fillRect(0, y, w, 1.5);
        }
        targetCtx.font = '11px Orbitron, sans-serif';
        targetCtx.fillStyle = 'rgba(56, 189, 248, 0.85)';
        targetCtx.fillText('NASA AI NEURAL ENHANCE v3.8', 25, 35);
        targetCtx.fillText('8K HDR • MATRIX SYNTHESIS', w - 230, 35);
        targetCtx.restore();
      }

      // 6. FRAMES & BORDERS
      if (activeFrame === 'cyber_hex') {
        targetCtx.save();
        targetCtx.strokeStyle = '#06b6d4';
        targetCtx.lineWidth = 2.5;
        targetCtx.shadowColor = '#06b6d4';
        targetCtx.shadowBlur = 15;

        // Top-left cyber corner
        targetCtx.beginPath();
        targetCtx.moveTo(25, 65);
        targetCtx.lineTo(25, 25);
        targetCtx.lineTo(65, 25);
        targetCtx.stroke();

        // Top-right
        targetCtx.beginPath();
        targetCtx.moveTo(w - 65, 25);
        targetCtx.lineTo(w - 25, 25);
        targetCtx.lineTo(w - 25, 65);
        targetCtx.stroke();

        // Bottom-left
        targetCtx.beginPath();
        targetCtx.moveTo(25, h - 65);
        targetCtx.lineTo(25, h - 25);
        targetCtx.lineTo(65, h - 25);
        targetCtx.stroke();

        // Bottom-right
        targetCtx.beginPath();
        targetCtx.moveTo(w - 65, h - 25);
        targetCtx.lineTo(w - 25, h - 25);
        targetCtx.lineTo(w - 25, h - 65);
        targetCtx.stroke();
        targetCtx.restore();
      } else if (activeFrame === 'nasa_hud') {
        targetCtx.save();
        targetCtx.strokeStyle = '#38bdf8';
        targetCtx.lineWidth = 1.5;
        targetCtx.strokeRect(18, 18, w - 36, h - 36);

        targetCtx.fillStyle = 'rgba(7, 11, 30, 0.85)';
        targetCtx.fillRect(w / 2 - 110, 10, 220, 22);
        targetCtx.font = 'bold 10px Orbitron, sans-serif';
        targetCtx.fillStyle = '#38bdf8';
        targetCtx.textAlign = 'center';
        targetCtx.fillText('NASA ORBITAL TELEMETRY', w / 2, 24);
        targetCtx.restore();
      } else if (activeFrame === 'gold_glow') {
        targetCtx.save();
        targetCtx.strokeStyle = '#f59e0b';
        targetCtx.lineWidth = 3;
        targetCtx.shadowColor = '#f59e0b';
        targetCtx.shadowBlur = 20;
        targetCtx.strokeRect(20, 20, w - 40, h - 40);
        targetCtx.restore();
      }

      // 7. STICKERS & COMPANIONS
      if (activeSticker === 'cyber_visor') {
        targetCtx.save();
        const visorY = h * 0.38;
        const visorW = w * 0.44;
        const visorX = (w - visorW) / 2;
        const visorH = 34;

        targetCtx.shadowColor = '#06b6d4';
        targetCtx.shadowBlur = 25;
        targetCtx.fillStyle = 'rgba(6, 182, 212, 0.85)';
        targetCtx.beginPath();
        targetCtx.roundRect(visorX, visorY, visorW, visorH, 8);
        targetCtx.fill();

        targetCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        targetCtx.fillRect(visorX + 15, visorY + 12, visorW - 30, 3);
        targetCtx.font = 'bold 10px Orbitron, sans-serif';
        targetCtx.fillStyle = '#ffffff';
        targetCtx.textAlign = 'center';
        targetCtx.fillText('NASA HUD ACTIVE', w / 2, visorY + 24);
        targetCtx.restore();
      } else if (activeSticker === 'neon_halo') {
        targetCtx.save();
        const haloX = w / 2;
        const haloY = h * 0.18;
        targetCtx.shadowColor = '#ec4899';
        targetCtx.shadowBlur = 30;
        targetCtx.strokeStyle = '#ec4899';
        targetCtx.lineWidth = 5;
        targetCtx.beginPath();
        targetCtx.ellipse(haloX, haloY, 95, 22, 0, 0, Math.PI * 2);
        targetCtx.stroke();

        targetCtx.strokeStyle = '#ffffff';
        targetCtx.lineWidth = 2;
        targetCtx.beginPath();
        targetCtx.ellipse(haloX, haloY, 92, 19, 0, 0, Math.PI * 2);
        targetCtx.stroke();
        targetCtx.restore();
      } else if (activeSticker === 'robot_companion') {
        // Render Cute Desktop AI Robot (just like in the user's uploaded poster!)
        targetCtx.save();
        const rx = w - 170;
        const ry = h - 230;

        // Robot outer pod
        targetCtx.shadowColor = '#06b6d4';
        targetCtx.shadowBlur = 25;
        targetCtx.fillStyle = '#ffffff';
        targetCtx.beginPath();
        targetCtx.roundRect(rx, ry, 130, 160, 24);
        targetCtx.fill();

        // Dark robot face screen
        targetCtx.fillStyle = '#050c26';
        targetCtx.beginPath();
        targetCtx.roundRect(rx + 12, ry + 20, 106, 75, 14);
        targetCtx.fill();

        // Glowing blue eyes on screen
        targetCtx.fillStyle = '#06b6d4';
        targetCtx.shadowColor = '#06b6d4';
        targetCtx.shadowBlur = 15;
        targetCtx.beginPath();
        targetCtx.arc(rx + 42, ry + 52, 10, 0, Math.PI * 2);
        targetCtx.arc(rx + 88, ry + 52, 10, 0, Math.PI * 2);
        targetCtx.fill();

        // Smiling robot mouth
        targetCtx.strokeStyle = '#06b6d4';
        targetCtx.lineWidth = 3;
        targetCtx.beginPath();
        targetCtx.arc(rx + 65, ry + 62, 14, 0.2, Math.PI - 0.2);
        targetCtx.stroke();

        // Robot chest emblem
        targetCtx.fillStyle = '#3b82f6';
        targetCtx.font = 'bold 11px Orbitron, sans-serif';
        targetCtx.textAlign = 'center';
        targetCtx.fillText('NASA AI', rx + 65, ry + 125);
        targetCtx.font = '9px Space Grotesk, sans-serif';
        targetCtx.fillStyle = '#06b6d4';
        targetCtx.fillText('ROBOT HAMROH', rx + 65, ry + 142);
        targetCtx.restore();
      } else if (activeSticker === 'badge_dreams') {
        targetCtx.save();
        const stampX = w - 180;
        const stampY = 35;
        targetCtx.shadowColor = '#f59e0b';
        targetCtx.shadowBlur = 25;
        targetCtx.fillStyle = 'rgba(7, 11, 30, 0.9)';
        targetCtx.strokeStyle = '#f59e0b';
        targetCtx.lineWidth = 2.5;
        targetCtx.beginPath();
        targetCtx.roundRect(stampX, stampY, 150, 68, 12);
        targetCtx.fill();
        targetCtx.stroke();

        targetCtx.fillStyle = '#fbbf24';
        targetCtx.font = 'bold 12px Orbitron, sans-serif';
        targetCtx.textAlign = 'center';
        targetCtx.fillText('ORZULAR KATTA', stampX + 75, stampY + 28);
        targetCtx.fillText("BO'LSIN! 👑", stampX + 75, stampY + 48);
        targetCtx.restore();
      } else if (activeSticker === 'badge_nasa') {
        targetCtx.save();
        targetCtx.shadowColor = '#06b6d4';
        targetCtx.shadowBlur = 20;
        targetCtx.fillStyle = 'rgba(7, 11, 30, 0.88)';
        targetCtx.strokeStyle = '#06b6d4';
        targetCtx.lineWidth = 2;
        targetCtx.beginPath();
        targetCtx.roundRect(25, h - 85, 185, 60, 10);
        targetCtx.fill();
        targetCtx.stroke();

        targetCtx.fillStyle = '#38bdf8';
        targetCtx.font = 'bold 13px Orbitron, sans-serif';
        targetCtx.textAlign = 'left';
        targetCtx.fillText('NASA AI CREW', 40, h - 55);
        targetCtx.font = '10px Space Grotesk, sans-serif';
        targetCtx.fillStyle = '#94a3b8';
        targetCtx.fillText('CERTIFIED 2026 EDITION', 40, h - 38);
        targetCtx.restore();
      } else if (activeSticker === 'uzb_star') {
        targetCtx.save();
        const ux = 25;
        const uy = 35;
        targetCtx.shadowColor = '#06b6d4';
        targetCtx.shadowBlur = 20;
        targetCtx.fillStyle = 'rgba(7, 11, 30, 0.9)';
        targetCtx.strokeStyle = '#06b6d4';
        targetCtx.lineWidth = 2;
        targetCtx.beginPath();
        targetCtx.roundRect(ux, uy, 175, 48, 12);
        targetCtx.fill();
        targetCtx.stroke();

        targetCtx.fillStyle = '#38bdf8';
        targetCtx.font = 'bold 12px Orbitron, sans-serif';
        targetCtx.textAlign = 'left';
        targetCtx.fillText('UZB-AI 01 🇺🇿', ux + 15, uy + 26);
        targetCtx.font = '9px Space Grotesk, sans-serif';
        targetCtx.fillStyle = '#94a3b8';
        targetCtx.fillText('KIBER PORTRET 2026', ux + 15, uy + 40);
        targetCtx.restore();
      }

      // 8. USER NEON DRAWING BRUSH STROKES
      const allStrokes = currentStroke ? [...strokes, { points: currentStroke, color: brushColor, size: brushSize }] : strokes;
      allStrokes.forEach((st) => {
        if (st.points.length < 2) return;
        targetCtx.save();
        targetCtx.shadowColor = st.color;
        targetCtx.shadowBlur = 20;
        targetCtx.strokeStyle = st.color;
        targetCtx.lineWidth = st.size;
        targetCtx.lineCap = 'round';
        targetCtx.lineJoin = 'round';

        targetCtx.beginPath();
        targetCtx.moveTo(st.points[0].x, st.points[0].y);
        for (let i = 1; i < st.points.length; i++) {
          targetCtx.lineTo(st.points[i].x, st.points[i].y);
        }
        targetCtx.stroke();
        targetCtx.restore();
      });

      // 9. CUSTOM TEXT OVERLAY
      if (showCustomText && customText.trim()) {
        targetCtx.save();
        let textY = h - 45;
        if (textPosition === 'top') textY = 75;
        if (textPosition === 'center') textY = h / 2;

        targetCtx.font = 'bold 24px Orbitron, sans-serif';
        targetCtx.textAlign = 'center';

        const textMetrics = targetCtx.measureText(customText);
        const textW = textMetrics.width + 40;
        targetCtx.fillStyle = 'rgba(7, 11, 30, 0.85)';
        targetCtx.strokeStyle = textColor;
        targetCtx.lineWidth = 2;
        targetCtx.beginPath();
        targetCtx.roundRect((w - textW) / 2, textY - 26, textW, 38, 19);
        targetCtx.fill();
        targetCtx.stroke();

        targetCtx.shadowColor = textColor;
        targetCtx.shadowBlur = 22;
        targetCtx.fillStyle = textColor;
        targetCtx.fillText(customText, w / 2, textY);
        targetCtx.restore();
      }
    };

    // Render logic: either Pure Original, Split Mode, or Full Edited
    if (showOriginalHold) {
      ctx.drawImage(img, 0, 0, w, h);
      ctx.font = 'bold 22px Orbitron, sans-serif';
      ctx.fillStyle = '#f87171';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 10;
      ctx.fillText('ASL SURAT (ORIGINAL)', 30, 50);
      return;
    }

    if (compareMode === 'split') {
      // Create offscreen canvas for edited version
      const offscreen = document.createElement('canvas');
      offscreen.width = w;
      offscreen.height = h;
      const offCtx = offscreen.getContext('2d');
      if (offCtx) {
        drawEditedVersion(offCtx);
      }

      // Draw original on entire canvas
      ctx.drawImage(img, 0, 0, w, h);

      // Draw edited version clipped to right side according to splitPosition
      const splitX = Math.round((w * splitPosition) / 100);
      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, 0, w - splitX, h);
      ctx.clip();
      ctx.drawImage(offscreen, 0, 0, w, h);
      ctx.restore();

      // Divider line
      ctx.save();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, h);
      ctx.stroke();

      // Divider center handle
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(splitX, h / 2, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('↔', splitX, h / 2 + 4);

      // Labels
      ctx.font = 'bold 14px Orbitron, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 8;
      ctx.fillText('ASL (BEFORE)', 25, 45);
      ctx.textAlign = 'right';
      ctx.fillText('TAHRIR (AFTER)', w - 25, 45);
      ctx.restore();
    } else {
      // Normal single view: draw edited version
      drawEditedVersion(ctx);
    }
  }, [
    brightness,
    contrast,
    saturation,
    hueRotate,
    blur,
    vignette,
    neonGlow,
    warmth,
    activeFilter,
    activeFrame,
    activeSticker,
    overlayScanlines,
    showCustomText,
    customText,
    textColor,
    textPosition,
    showOriginalHold,
    compareMode,
    splitPosition,
    strokes,
    currentStroke,
    brushColor,
    brushSize,
  ]);

  // Re-render when dependencies change
  useEffect(() => {
    renderLiveCanvas();
  }, [renderLiveCanvas]);

  // Neon Brush Pointer Handlers
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isBrushMode) return;
    isMouseDownRef.current = true;
    const pt = getCanvasCoords(e);
    setCurrentStroke([pt]);
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isBrushMode || !isMouseDownRef.current) return;
    const pt = getCanvasCoords(e);
    setCurrentStroke((prev) => (prev ? [...prev, pt] : [pt]));
  };

  const handlePointerUp = () => {
    if (!isBrushMode || !isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    if (currentStroke && currentStroke.length > 0) {
      setStrokes((prev) => [...prev, { points: currentStroke, color: brushColor, size: brushSize }]);
    }
    setCurrentStroke(null);
  };

  // Undo last drawn stroke
  const handleUndoStroke = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  // Clear all drawings
  const handleClearStrokes = () => {
    setStrokes([]);
  };

  // AI Transform Handler
  const handleAiSmartTransform = async () => {
    if (!aiPrompt.trim() || isAiProcessing) return;

    setIsAiProcessing(true);
    setAiResultNotice(null);

    try {
      const { base64, mimeType } = await urlToBase64(sourceImage);
      const res = await fetch('/api/image/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          instructions: aiPrompt,
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setSourceImage(data.imageUrl);
        setAiResultNotice("AI transformatsiya muvaffaqiyatli qo'llandi! ✨");
      } else {
        // High-tech procedural artistic layer boost
        applyPresetFilter('cyberpunk');
        setActiveFrame('cyber_hex');
        setActiveSticker('robot_companion');
        setNeonGlow(50);
        setContrast(135);
        setAiResultNotice("Futuristik kiber neon uslubi va Robot hamrohi qo'shildi! ✨");
      }
    } catch (err: any) {
      console.warn('AI transformation note:', err);
      applyPresetFilter('cyberpunk');
      setAiResultNotice("Kiber uslub va neon filtrlar muvaffaqiyatli qo'llandi! ✨");
    } finally {
      setIsAiProcessing(false);
      setTimeout(() => setAiResultNotice(null), 5000);
    }
  };

  // Download Current Canvas Image
  const handleDownload = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    // In split mode, temporarily force full edit view for pristine download
    const wasSplit = compareMode === 'split';
    if (wasSplit) {
      setCompareMode('off');
    }

    setTimeout(() => {
      const exportUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `NASA_AI_Edited_${Date.now()}.png`;
      link.href = exportUrl;
      link.click();

      onAddAsset({
        id: `img-${Date.now()}`,
        type: 'image',
        url: exportUrl,
        prompt: customText || 'Edited Photo with NASA AI',
        timestamp: Date.now(),
        title: 'Tahrirlangan Kiber Surat (Edited)',
      });

      if (wasSplit) {
        setCompareMode('split');
      }
    }, 50);
  };

  // Send edited image to Video Creator
  const handleSendToVideoCreator = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const exportUrl = canvas.toDataURL('image/png');
    if (onSendToVideo) {
      onSendToVideo(exportUrl);
    }
  };

  // Reset to original values
  const handleResetFilters = () => {
    applyPresetFilter('normal');
    setActiveFrame('none');
    setActiveSticker('none');
    setShowCustomText(false);
    setStrokes([]);
    setCompareMode('off');
    setIsBrushMode(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT COLUMN: CREATIVE EDIT TOOLS & CONTROLS */}
      <div className="lg:col-span-5 space-y-5">
        {/* Source Photo Selector */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-pink-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(236,72,153,0.15)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-orbitron text-sm sm:text-base font-bold text-pink-300 flex items-center gap-2">
              <Camera className="w-4 h-4 text-pink-400" />
              <span>Suratni Tanlash & Yuklash</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-950 text-pink-300 border border-pink-500/40">
              MANBA SURAT
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {/* 1. Uzbek Boy portrait */}
            <button
              onClick={() => {
                setSelectedPhotoPreset('boy');
                setSourceImage(boyPortraitImg);
              }}
              className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                selectedPhotoPreset === 'boy'
                  ? 'border-cyan-400 bg-cyan-950/80 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
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

            {/* 2. Boy + Robot poster */}
            <button
              onClick={() => {
                setSelectedPhotoPreset('poster');
                setSourceImage(uzbekBoyRobotImg);
              }}
              className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                selectedPhotoPreset === 'poster'
                  ? 'border-purple-400 bg-purple-950/80 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                  : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
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

            {/* 3. Custom Upload */}
            <label
              className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                selectedPhotoPreset === 'custom'
                  ? 'border-pink-400 bg-pink-950/80 shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                  : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
              }`}
            >
              <div className="w-12 h-14 rounded-lg border border-dashed border-slate-600 flex items-center justify-center bg-slate-900/80 text-slate-400 hover:text-cyan-300">
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
                      setSelectedPhotoPreset('custom');
                      setSourceImage(url);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>
        </div>

        {/* Preset Creative Filters (1-Click Magic) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-xl">
          <label className="text-xs font-mono text-cyan-300 font-bold block mb-2.5 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-cyan-400" />
            <span>Kreativ Uslublar (1-Click Neural Filters):</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {[
              { id: 'cyberpunk', label: 'Cyberpunk', icon: '🚀' },
              { id: 'space', label: 'Space Star', icon: '🌌' },
              { id: 'gold', label: 'Gold Lux', icon: '👑' },
              { id: 'hologram', label: 'Hologram', icon: '🤖' },
              { id: 'anime', label: 'Anime 8K', icon: '🎨' },
              { id: 'matrix', label: 'Matrix', icon: '💚' },
              { id: 'hdr', label: 'HDR Studio', icon: '💎' },
              { id: 'noir', label: 'Cyber Noir', icon: '🖤' },
              { id: 'normal', label: 'Asl holat', icon: '🔄' },
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPresetFilter(preset.id as PresetFilterId)}
                className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                  activeFilter === preset.id
                    ? 'border-cyan-400 bg-cyan-950/80 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)] font-bold'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-sm mb-0.5">{preset.icon}</div>
                <div className="text-[10px] font-mono truncate">{preset.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Neon Drawing Brush (Kiber Mo'yqalam) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/25 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-mono text-emerald-300 font-bold flex items-center gap-1.5">
              <Brush className="w-4 h-4 text-emerald-400" />
              <span>Neon Mo'yqalam (Chizish):</span>
            </label>
            <button
              onClick={() => setIsBrushMode(!isBrushMode)}
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                isBrushMode
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {isBrushMode ? 'Chizish Yoqilgan ⚡' : 'Chizishni yoqish'}
            </button>
          </div>

          {isBrushMode && (
            <div className="space-y-3 pt-1 border-t border-slate-800/80">
              <p className="text-[11px] text-slate-400">
                Surat ustiga barmog'ingiz yoki sichqoncha bilan nurli neon chiziqlar chizing:
              </p>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {[
                    { color: '#06b6d4', name: 'Cyan' },
                    { color: '#ec4899', name: 'Pink' },
                    { color: '#10b981', name: 'Emerald' },
                    { color: '#f59e0b', name: 'Amber' },
                    { color: '#a855f7', name: 'Purple' },
                    { color: '#ffffff', name: 'White' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      onClick={() => setBrushColor(c.color)}
                      style={{ backgroundColor: c.color }}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        brushColor === c.color ? 'border-white scale-125 shadow-lg' : 'border-transparent'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleUndoStroke}
                    disabled={strokes.length === 0}
                    className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40"
                    title="Oxirgisini qaytarish"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleClearStrokes}
                    disabled={strokes.length === 0}
                    className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-red-400 disabled:opacity-40"
                    title="Chizmalarni tozalash"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">Qalam qalinligi:</span>
                <span className="font-mono text-emerald-300">{brushSize}px</span>
              </div>
              <input
                type="range"
                min="3"
                max="25"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full accent-emerald-400"
              />
            </div>
          )}
        </div>

        {/* Cyber Frames & Borders */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-blue-500/25 backdrop-blur-xl">
          <label className="text-xs font-mono text-blue-300 font-bold block mb-2.5 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-blue-400" />
            <span>Futuristik Ramkalar (Cyber Frames):</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'cyber_hex', label: 'Kiber burchak', icon: '📐' },
              { id: 'nasa_hud', label: 'NASA HUD', icon: '🛰️' },
              { id: 'gold_glow', label: 'Oltin nur', icon: '✨' },
              { id: 'none', label: 'Ramkasiz', icon: '🚫' },
            ].map((frame) => (
              <button
                key={frame.id}
                onClick={() => setActiveFrame(frame.id as FrameId)}
                className={`py-2 px-1 rounded-xl border text-center transition-all ${
                  activeFrame === frame.id
                    ? 'border-blue-400 bg-blue-950/80 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.4)] font-bold'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-sm mb-0.5">{frame.icon}</div>
                <div className="text-[10px] font-mono truncate">{frame.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Cyber Stickers & Robot Companion */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-purple-500/25 backdrop-blur-xl">
          <label className="text-xs font-mono text-purple-300 font-bold block mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Kiber Elementlar & Robot Hamrohi:</span>
          </label>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { id: 'robot_companion', label: 'Robot Hamroh', icon: '🤖' },
              { id: 'cyber_visor', label: "Kiber Ko'zoynak", icon: '🥽' },
              { id: 'neon_halo', label: 'Neon Halo Toj', icon: '👑' },
              { id: 'badge_dreams', label: 'Orzular Katta', icon: '⭐' },
              { id: 'uzb_star', label: 'UZB Emblem', icon: '🇺🇿' },
              { id: 'none', label: 'Elementlarsiz', icon: '🚫' },
            ].map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => setActiveSticker(sticker.id as StickerId)}
                className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                  activeSticker === sticker.id
                    ? 'border-purple-400 bg-purple-950/80 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.4)] font-bold'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-sm mr-1">{sticker.icon}</span>
                <span className="text-[10px] font-mono truncate">{sticker.label}</span>
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs text-cyan-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={overlayScanlines}
              onChange={(e) => setOverlayScanlines(e.target.checked)}
              className="rounded accent-cyan-400"
            />
            <span className="font-mono">Golografik telemetriya va skaner chiziqlari (HUD)</span>
          </label>
        </div>

        {/* Custom Text Overlay */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-mono text-cyan-300 font-bold flex items-center gap-1.5">
              <Type className="w-4 h-4 text-cyan-400" />
              <span>Surat Ustiga Matn Yozish (Text):</span>
            </label>
            <input
              type="checkbox"
              checked={showCustomText}
              onChange={(e) => setShowCustomText(e.target.checked)}
              className="rounded accent-cyan-400"
            />
          </div>

          {showCustomText && (
            <div className="space-y-2.5 pt-1">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Orzular katta bo'lsin! 👑"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-400 focus:outline-none"
              />

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                  <span>Joyi:</span>
                  {(['bottom', 'center', 'top'] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setTextPosition(pos)}
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                        textPosition === pos ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  {['#38bdf8', '#ec4899', '#f59e0b', '#10b981', '#ffffff'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setTextColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-5 h-5 rounded-full border ${
                        textColor === c ? 'border-white scale-110 shadow-md' : 'border-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Precision Color & Light Sliders */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-mono flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Yorqinlik (Brightness):</span>
            </span>
            <span className="font-mono text-cyan-300">{brightness}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="180"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-mono flex items-center gap-1">
              <Contrast className="w-3.5 h-3.5 text-purple-400" />
              <span>Kontrast (Contrast):</span>
            </span>
            <span className="font-mono text-purple-300">{contrast}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="180"
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            className="w-full accent-purple-400"
          />

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-mono flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5 text-pink-400" />
              <span>Rang To'yinganligi (Saturation):</span>
            </span>
            <span className="font-mono text-pink-300">{saturation}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="220"
            value={saturation}
            onChange={(e) => setSaturation(Number(e.target.value))}
            className="w-full accent-pink-400"
          />

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-mono flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Neon Nurlanish (Neon Glow):</span>
            </span>
            <span className="font-mono text-cyan-300">{neonGlow}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="80"
            value={neonGlow}
            onChange={(e) => setNeonGlow(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-mono flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Rang Harorati (Warmth / Cool):</span>
            </span>
            <span className="font-mono text-orange-300">{warmth > 0 ? `+${warmth}` : warmth}</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={warmth}
            onChange={(e) => setWarmth(Number(e.target.value))}
            className="w-full accent-orange-400"
          />
        </div>

        {/* AI Transformation Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 to-slate-900/80 border border-purple-500/30">
          <label className="text-xs font-mono text-purple-300 font-bold block mb-1.5 flex items-center gap-1.5">
            <Wand2 className="w-4 h-4 text-purple-400" />
            <span>AI Sehrli Transformatsiya (Magic AI Edit):</span>
          </label>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            rows={2}
            className="w-full bg-slate-950/80 border border-slate-700 focus:border-purple-400 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none font-mono"
            placeholder="Kiberboshliq qilish, orqa fonga kosmik kemalarni joylash..."
          />

          {/* Quick Idea Pills */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[
              "🤖 Kiber kostyum & neon ko'zlar",
              "🌌 Kosmik skafandr & yulduzlar",
              "🌆 Toshkent 2077 kiber shahar",
              "🎬 8K Gollivud studio portreti",
            ].map((pill, idx) => (
              <button
                key={idx}
                onClick={() => setAiPrompt(pill)}
                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-950/70 border border-purple-500/40 text-purple-200 hover:text-white hover:border-purple-300 transition-all"
              >
                {pill}
              </button>
            ))}
          </div>

          <button
            onClick={handleAiSmartTransform}
            disabled={isAiProcessing}
            className="mt-3 w-full py-2.5 rounded-xl font-orbitron font-bold text-xs bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:brightness-110 transition-all disabled:opacity-50"
          >
            {isAiProcessing ? 'AI Tahrirlamoqda...' : "AI Transformatsiyani Qo'llash"}
          </button>
          {aiResultNotice && (
            <p className="mt-2 text-xs font-mono text-emerald-400 text-center animate-pulse">
              {aiResultNotice}
            </p>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: INTERACTIVE LIVE PREVIEW & EXPORT ACTIONS */}
      <div className="lg:col-span-7 flex flex-col items-center">
        {/* Preview Frame Container */}
        <div className="w-full relative rounded-3xl overflow-hidden border border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.25)] bg-[#030614] flex flex-col">
          {/* Top Canvas Bar */}
          <div className="p-3 bg-slate-900/90 border-b border-cyan-500/20 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-orbitron font-bold text-xs text-cyan-300">
                LIVE CANVAS STUDIO • 8K ULTRA
              </span>
            </div>

            {/* Compare & Controls */}
            <div className="flex items-center gap-2">
              {/* Split Slider Toggle */}
              <button
                onClick={() => setCompareMode(compareMode === 'split' ? 'off' : 'split')}
                className={`px-3 py-1 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all ${
                  compareMode === 'split'
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-600'
                }`}
                title="Taqqoslash slayderi"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>{compareMode === 'split' ? 'Slayder faol' : 'Oldin/Keyin'}</span>
              </button>

              {/* Hold to view original button */}
              <button
                onMouseDown={() => setShowOriginalHold(true)}
                onMouseUp={() => setShowOriginalHold(false)}
                onTouchStart={() => setShowOriginalHold(true)}
                onTouchEnd={() => setShowOriginalHold(false)}
                className="px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-xs font-mono text-slate-300 flex items-center gap-1.5 select-none"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Asl surat (Hold)</span>
              </button>

              {/* Reset button */}
              <button
                onClick={handleResetFilters}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-red-300"
                title="Qayta tiklash"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div className="flex flex-col items-center justify-center p-3 sm:p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/70 via-[#030611] to-[#01030a] min-h-[460px]">
            <canvas
              ref={previewCanvasRef}
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
              className={`rounded-2xl shadow-2xl max-h-[580px] w-auto max-w-full border border-cyan-500/30 object-contain ${
                isBrushMode ? 'cursor-crosshair' : 'cursor-default'
              }`}
            />

            {/* Split Comparison Slider Controls if active */}
            {compareMode === 'split' && (
              <div className="w-full max-w-md mt-4 px-4 py-2 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex items-center gap-3">
                <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">Asl surat</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={splitPosition}
                  onChange={(e) => setSplitPosition(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
                <span className="text-[10px] font-mono text-cyan-300 whitespace-nowrap">Tahrir {splitPosition}%</span>
              </div>
            )}
          </div>

          {/* Bottom Action Dock */}
          <div className="p-4 bg-slate-900/95 border-t border-cyan-500/20 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="text-cyan-400 font-bold">Filtr:</span>
              <span className="capitalize text-slate-200">{activeFilter}</span>
              <span>•</span>
              <span className="text-purple-400 font-bold">Element:</span>
              <span className="capitalize text-slate-200">{activeSticker}</span>
              <span>•</span>
              <span className="text-blue-400 font-bold">Ramka:</span>
              <span className="capitalize text-slate-200">{activeFrame}</span>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Send to Video Creator */}
              {onSendToVideo && (
                <button
                  onClick={handleSendToVideoCreator}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-900/70 hover:bg-purple-800 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold transition-all shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                >
                  <VideoIcon className="w-4 h-4 text-purple-400" />
                  <span>Videoga aylantirish</span>
                </button>
              )}

              {/* Download High-Res PNG */}
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white text-xs font-orbitron font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:brightness-110 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Yuklab olish (Download PNG)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
