// Audio utility for NASA AI voice processing

// Decode PCM 24000Hz 1-channel audio returned by gemini-3.8-flash-lite-tts
export function playPcmAudio(base64Pcm: string, onEnded?: () => void): () => void {
  try {
    const binaryString = atob(base64Pcm);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const sampleCount = Math.floor(bytes.byteLength / 2);
    const int16Array = new Int16Array(bytes.buffer, bytes.byteOffset, sampleCount);
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 24000,
    });

    const buffer = audioCtx.createBuffer(1, sampleCount, 24000);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < sampleCount; i++) {
      channelData[i] = int16Array[i] / 32768.0;
    }

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);

    source.onended = () => {
      if (onEnded) onEnded();
      audioCtx.close().catch(() => {});
    };

    source.start(0);

    return () => {
      try {
        source.stop();
        audioCtx.close().catch(() => {});
      } catch (e) {}
    };
  } catch (err) {
    console.warn('Failed to play PCM audio via AudioContext, falling back:', err);
    if (onEnded) onEnded();
    return () => {};
  }
}

// Speak via browser speech synthesis fallback
export function speakBrowserVoice(text: string, lang: 'uz' | 'en' | 'ru' = 'uz', onEnded?: () => void): () => void {
  if (!('speechSynthesis' in window)) {
    if (onEnded) onEnded();
    return () => {};
  }

  window.speechSynthesis.cancel();

  // Strip markdown, clean text
  const clean = text
    .replace(/[#*`_~]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .slice(0, 600);

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US';
  utterance.rate = 1.05;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.lang.startsWith(utterance.lang.slice(0, 2)));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onend = () => {
    if (onEnded) onEnded();
  };

  utterance.onerror = () => {
    if (onEnded) onEnded();
  };

  window.speechSynthesis.speak(utterance);

  return () => {
    window.speechSynthesis.cancel();
  };
}

// Speech recognition helper
export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public startListening(
    lang: 'uz' | 'en' | 'ru',
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (err: any) => void,
    onEnd: () => void
  ) {
    if (!this.recognition) {
      onError('Speech recognition not supported in browser');
      return;
    }

    try {
      this.recognition.lang = lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US';
      
      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          onResult(finalTranscript, true);
        } else if (interimTranscript) {
          onResult(interimTranscript, false);
        }
      };

      this.recognition.onerror = (event: any) => {
        onError(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      this.isListening = true;
      this.recognition.start();
    } catch (e) {
      onError(e);
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }
}
