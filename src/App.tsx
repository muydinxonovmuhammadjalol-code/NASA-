/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { AppTab, Language, ChatMessage, GeneratedAsset } from './types';
import { Navbar } from './components/Navbar';
import { ChatInterface } from './components/ChatInterface';
import { CreativeStudio } from './components/CreativeStudio';
import { SmartTools } from './components/SmartTools';
import { Gallery } from './components/Gallery';
import { SpeechRecognitionService, playPcmAudio, speakBrowserVoice } from './utils/audio';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('chat');
  const [language, setLanguage] = useState<Language>('uz');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Generated Assets gallery state
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);

  // Speech and Audio refs
  const speechServiceRef = useRef<SpeechRecognitionService | null>(null);
  const currentAudioStopRef = useRef<(() => void) | null>(null);

  // Initialize SpeechRecognition on mount
  useEffect(() => {
    speechServiceRef.current = new SpeechRecognitionService();
  }, []);

  // Stop any active audio
  const stopAllAudio = () => {
    if (currentAudioStopRef.current) {
      currentAudioStopRef.current();
      currentAudioStopRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Speak AI response using Gemini TTS or browser voice
  const speakText = async (text: string) => {
    if (!soundEnabled) return;
    stopAllAudio();
    setIsSpeaking(true);

    try {
      // 1. Try server-side gemini-3.8-flash-lite-tts
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: 'Kore',
          language,
        }),
      });

      const data = await res.json();

      if (data.audioBase64) {
        currentAudioStopRef.current = playPcmAudio(data.audioBase64, () => {
          setIsSpeaking(false);
        });
        return;
      }
    } catch (err) {
      console.warn('TTS request fallback to SpeechSynthesis:', err);
    }

    // 2. Seamless fallback to browser speech synthesis
    currentAudioStopRef.current = speakBrowserVoice(text, language, () => {
      setIsSpeaking(false);
    });
  };

  // Send message to NASA AI
  const handleSendMessage = async (
    prompt: string,
    mediaBase64?: string,
    mediaMimeType?: string,
    mediaUrl?: string
  ) => {
    if (!prompt && !mediaBase64) return;
    stopAllAudio();

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt || (mediaBase64 ? 'Biriktirilgan faylni tahlil qiling' : ''),
      timestamp,
      mediaUrl,
      mediaType: mediaMimeType?.startsWith('image/')
        ? 'image'
        : mediaMimeType?.startsWith('video/')
        ? 'video'
        : mediaBase64
        ? 'document'
        : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      // Format history for context memory
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          conversationHistory: historyPayload,
          language,
          mediaBase64,
          mediaMimeType,
          useSearch: true,
        }),
      });

      const data = await res.json();
      const replyText = data.text || 'Kechirasiz, javob olishda xatolik yuz berdi.';

      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingSources: data.webSources,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Automatically speak the response if sound is enabled
      if (soundEnabled) {
        speakText(replyText);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: 'Server bilan bog\'lanishda xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle Voice Input (Speech-to-Text)
  const handleToggleVoiceInput = () => {
    if (isListening) {
      speechServiceRef.current?.stopListening();
      setIsListening(false);
      return;
    }

    if (!speechServiceRef.current?.isSupported()) {
      alert("Brauzeringizda ovozli tanish (SpeechRecognition) qo'llab-quvvatlanmaydi.");
      return;
    }

    stopAllAudio();
    setIsListening(true);

    speechServiceRef.current.startListening(
      language,
      (transcript: string, isFinal: boolean) => {
        if (isFinal && transcript.trim()) {
          setIsListening(false);
          handleSendMessage(transcript.trim());
        }
      },
      (error: any) => {
        console.warn('Speech recognition error:', error);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const handleClearChat = () => {
    stopAllAudio();
    setMessages([]);
  };

  const handleAddAsset = (asset: GeneratedAsset) => {
    setAssets((prev) => [asset, ...prev]);
  };

  const handleDeleteAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => {
          stopAllAudio();
          setCurrentTab(tab);
        }}
        language={language}
        onLanguageChange={(lang) => {
          setLanguage(lang);
        }}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          if (soundEnabled) stopAllAudio();
          setSoundEnabled(!soundEnabled);
        }}
        isProcessing={isProcessing}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative">
        {currentTab === 'chat' && (
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
            language={language}
            onNavigateTab={(tab) => {
              stopAllAudio();
              setCurrentTab(tab);
            }}
            isProcessing={isProcessing}
            isListening={isListening}
            isSpeaking={isSpeaking}
            onToggleVoiceInput={handleToggleVoiceInput}
            onSpeakMessage={speakText}
            onStopSpeaking={stopAllAudio}
          />
        )}

        {currentTab === 'studio' && (
          <CreativeStudio
            language={language}
            onAddAsset={handleAddAsset}
            onSpeakText={speakText}
          />
        )}

        {currentTab === 'tools' && (
          <SmartTools
            language={language}
            onSpeakText={speakText}
          />
        )}

        {currentTab === 'gallery' && (
          <Gallery
            assets={assets}
            onDeleteAsset={handleDeleteAsset}
            language={language}
          />
        )}
      </main>
    </div>
  );
}
