import { Language } from '../types';

export const TRANSLATIONS: Record<Language, {
  appName: string;
  tagline: string;
  subtitle: string;
  askPlaceholder: string;
  chatTab: string;
  studioTab: string;
  toolsTab: string;
  galleryTab: string;
  quickActionsTitle: string;
  quickActions: {
    askAi: string;
    createImage: string;
    createVideo: string;
    animatePhoto: string;
    voiceAi: string;
    analyzeDoc: string;
    code: string;
    translate: string;
  };
  voice: {
    listening: string;
    speaking: string;
    clickToSpeak: string;
    stopSpeaking: string;
    notSupported: string;
  };
  studio: {
    title: string;
    subtitle: string;
    imageGen: string;
    imageEdit: string;
    videoGen: string;
    photoAnimator: string;
    voiceGen: string;
    musicGen: string;
    storyWriter: string;
    promptPlaceholder: string;
    generateBtn: string;
    uploadPhoto: string;
    motionStyle: string;
    aspectRatio: string;
    duration: string;
    cinematicPrompt: string;
    animateSuccess: string;
  };
  tools: {
    title: string;
    subtitle: string;
    calculator: string;
    translator: string;
    summarizer: string;
    codeAssistant: string;
    docAnalyzer: string;
    studyAssistant: string;
    presentationCreator: string;
  };
  status: {
    online: string;
    processing: string;
    ready: string;
    searchGrounding: string;
  };
}> = {
  uz: {
    appName: "NASA AI",
    tagline: "Tasavvur qil. So'ra. Yarat.",
    subtitle: "Sizning Universal Sun'iy Intellektingiz",
    askPlaceholder: "NASA AI dan istalgan narsani so'rang...",
    chatTab: "Universal AI",
    studioTab: "Ijodiy Studiya",
    toolsTab: "Aqlli Vositalar",
    galleryTab: "Galereya",
    quickActionsTitle: "Tezkor Amallar",
    quickActions: {
      askAi: "🧠 AI dan So'rash",
      createImage: "📸 Rasm Yaratish",
      createVideo: "🎬 Video Yaratish",
      animatePhoto: "✨ Rasmni Jonlantirish",
      voiceAi: "🎤 Ovozli AI",
      analyzeDoc: "📄 Hujjat Tahlili",
      code: "💻 Dasturlash",
      translate: "🌐 Tarjimon",
    },
    voice: {
      listening: "NASA AI sizni tinglamoqda...",
      speaking: "NASA AI gapirmoqda...",
      clickToSpeak: "Ovoz bilan gapirish uchun bosing",
      stopSpeaking: "Ovozni to'xtatish",
      notSupported: "Brauzeringiz ovozli tanishni qo'llab-quvvatlamaydi",
    },
    studio: {
      title: "NASA AI Ijodiy Studiyasi",
      subtitle: "G'oyalaringizni professional surat, video va animatsiyalarga aylantiring",
      imageGen: "Rasm Generator",
      imageEdit: "Rasm Muharriri",
      videoGen: "Video Generator",
      photoAnimator: "Foto Animatsiya",
      voiceGen: "Ovoz Studiyasi",
      musicGen: "Musiqa & Atmosfera",
      storyWriter: "AI Ssenariy & Hikoya",
      promptPlaceholder: "Tasavvuringizdagi manzarani batafsil tasvirlang...",
      generateBtn: "Generatsiya Qilish",
      uploadPhoto: "Surat yuklash",
      motionStyle: "Harakat uslubi",
      aspectRatio: "Tomonlar nisbati",
      duration: "Davomiyligi",
      cinematicPrompt: "Ushbu qahramon kelajak shahri bo'ylab yurib ketsin...",
      animateSuccess: "Animatsiya tayyor bo'ldi!",
    },
    tools: {
      title: "Aqlli Vositalar To'plami",
      subtitle: "Matematika, fan, dasturlash va hujjatlar bo'yicha kuchli yordamchi",
      calculator: "Kalkulyator & Matematika",
      translator: "Universal Tarjimon",
      summarizer: "Xulosa Qiluvchi",
      codeAssistant: "Dasturlash Yordamchisi",
      docAnalyzer: "Hujjat & PDF Tahlili",
      studyAssistant: "O'qish & Test Yaratuvchi",
      presentationCreator: "Taqdimot Yaratuvchisi",
    },
    status: {
      online: "NASA AI Tizimi Faol",
      processing: "Qayta ishlanmoqda...",
      ready: "Buyruqqa tayyor",
      searchGrounding: "Google Qidiruv manbalari asosida",
    },
  },
  en: {
    appName: "NASA AI",
    tagline: "Imagine it. Ask it. Create it.",
    subtitle: "Your Universal Artificial Intelligence",
    askPlaceholder: "Ask NASA anything...",
    chatTab: "Universal AI",
    studioTab: "Creative Studio",
    toolsTab: "Smart Tools",
    galleryTab: "Gallery",
    quickActionsTitle: "Quick Actions",
    quickActions: {
      askAi: "🧠 Ask AI",
      createImage: "📸 Create Image",
      createVideo: "🎬 Create Video",
      animatePhoto: "✨ Animate Photo",
      voiceAi: "🎤 Voice AI",
      analyzeDoc: "📄 Analyze Document",
      code: "💻 Code Assistant",
      translate: "🌐 Translate",
    },
    voice: {
      listening: "NASA AI is listening...",
      speaking: "NASA AI is speaking...",
      clickToSpeak: "Click to speak to NASA AI",
      stopSpeaking: "Stop Speaking",
      notSupported: "Speech recognition is not supported in this browser",
    },
    studio: {
      title: "NASA AI Creative Studio",
      subtitle: "Turn concepts into high-fidelity visuals, cinematic videos, and animations",
      imageGen: "Image Generator",
      imageEdit: "Image Editor",
      videoGen: "Video Generator",
      photoAnimator: "Photo Animator",
      voiceGen: "Voice Generator",
      musicGen: "Music & Atmosphere",
      storyWriter: "AI Story Writer",
      promptPlaceholder: "Describe what should happen in detail...",
      generateBtn: "Generate Now",
      uploadPhoto: "Upload Photo",
      motionStyle: "Motion Style",
      aspectRatio: "Aspect Ratio",
      duration: "Duration",
      cinematicPrompt: "Make this person walk through a futuristic city...",
      animateSuccess: "Animation completed successfully!",
    },
    tools: {
      title: "NASA AI Smart Tools",
      subtitle: "Empower your workflow with high-precision STEM, code, and document analysis",
      calculator: "Calculator & Math",
      translator: "Translator",
      summarizer: "Summarizer",
      codeAssistant: "Code Assistant",
      docAnalyzer: "Document Analyzer",
      studyAssistant: "Study & Question Generator",
      presentationCreator: "Presentation Creator",
    },
    status: {
      online: "NASA AI Active",
      processing: "Processing neural request...",
      ready: "Ready for command",
      searchGrounding: "Verified with Google Search",
    },
  },
  ru: {
    appName: "NASA AI",
    tagline: "Воображай. Спрашивай. Создавай.",
    subtitle: "Ваш Универсальный Искусственный Интеллект",
    askPlaceholder: "Спросите у NASA AI что угодно...",
    chatTab: "Универсальный ИИ",
    studioTab: "Творческая Студия",
    toolsTab: "Умные Инструменты",
    galleryTab: "Галерея",
    quickActionsTitle: "Быстрые Действия",
    quickActions: {
      askAi: "🧠 Спросить ИИ",
      createImage: "📸 Создать Фото",
      createVideo: "🎬 Создать Видео",
      animatePhoto: "✨ Оживить Фото",
      voiceAi: "🎤 Голосовой ИИ",
      analyzeDoc: "📄 Анализ Документа",
      code: "💻 Программирование",
      translate: "🌐 Переводчик",
    },
    voice: {
      listening: "NASA AI слушает вас...",
      speaking: "NASA AI говорит...",
      clickToSpeak: "Нажмите, чтобы говорить с NASA AI",
      stopSpeaking: "Остановить голос",
      notSupported: "Распознавание речи не поддерживается",
    },
    studio: {
      title: "Творческая Студия NASA AI",
      subtitle: "Превращайте идеи в кинематографичные видео, изображения и анимации",
      imageGen: "Генератор Изображений",
      imageEdit: "Редактор Изображений",
      videoGen: "Генератор Видео",
      photoAnimator: "Анимация Фото",
      voiceGen: "Студия Голоса",
      musicGen: "Музыка & Атмосфера",
      storyWriter: "AI Сценарии & Истории",
      promptPlaceholder: "Опишите сцену во всех деталях...",
      generateBtn: "Сгенерировать",
      uploadPhoto: "Загрузить фото",
      motionStyle: "Стиль движения",
      aspectRatio: "Соотношение сторон",
      duration: "Длительность",
      cinematicPrompt: "Сделайте так, чтобы этот человек шел по футуристическому городу...",
      animateSuccess: "Анимация успешно создана!",
    },
    tools: {
      title: "Набор Умных Инструментов",
      subtitle: "Мощная помощь в математике, науке, коде и анализе документов",
      calculator: "Калькулятор & Математика",
      translator: "Переводчик",
      summarizer: "Суммаризатор",
      codeAssistant: "Ассистент по Коду",
      docAnalyzer: "Анализатор Документов",
      studyAssistant: "Обучение & Вопросы",
      presentationCreator: "Создатель Презентаций",
    },
    status: {
      online: "Система NASA AI Активна",
      processing: "Обработка запроса...",
      ready: "Готов к команде",
      searchGrounding: "Подтверждено поиском Google",
    },
  },
};
