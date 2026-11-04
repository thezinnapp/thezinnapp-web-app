import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useHaptic } from '@/hooks/useHaptic';
import { useLanguage } from '@/hooks/useLanguage';
import { Capacitor } from '@capacitor/core';

// Speech recognition is built into Chrome, Edge and Safari, so voice input
// costs nothing and the audio never leaves the device's speech service.
const SPEECH_LOCALES = {
  en: 'en-US', es: 'es-ES', fr: 'fr-FR', pt: 'pt-BR', ru: 'ru-RU', zh: 'zh-CN', hi: 'hi-IN',
  ar: 'ar-SA', bn: 'bn-BD', ur: 'ur-PK', ja: 'ja-JP', af: 'af-ZA', zu: 'zu-ZA', xh: 'xh-ZA',
};

const getRecognition = () =>
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

// Android's in-app web view has no built-in speech recognition, so the Android app
// uses the phone's own speech service instead (Google's "Speak now" dialog).
const isAndroidApp = Capacitor.getPlatform() === 'android';

async function nativeListen(lang) {
  const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
  const { available } = await SpeechRecognition.available();
  if (!available) throw Object.assign(new Error('unavailable'), { code: 'unavailable' });
  const perm = await SpeechRecognition.requestPermissions();
  if (perm.speechRecognition !== 'granted') throw Object.assign(new Error('denied'), { code: 'denied' });
  const result = await SpeechRecognition.start({ language: lang, maxResults: 1, popup: true, partialResults: false });
  return (result?.matches?.[0] || '').trim();
}

export default function VoiceInput({ onTranscript, className = '' }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const { tap, success, error } = useHaptic();
  const { language } = useLanguage();

  useEffect(() => () => recognitionRef.current?.abort?.(), []);

  const startNativeRecording = async () => {
    setIsRecording(true);
    try {
      const text = await nativeListen(SPEECH_LOCALES[language] || 'en-US');
      if (text) {
        onTranscript(text);
        success();
      }
    } catch (err) {
      if (err?.code === 'denied') {
        toast.error('Microphone access is off. Allow it for The ZINN App in your phone settings.');
      } else if (err?.code === 'unavailable') {
        toast.error("Voice input isn't available on this phone.");
      }
      // Anything else is usually "nothing was heard" or a cancelled dialog: stay quiet.
    } finally {
      setIsRecording(false);
    }
  };

  const startRecording = () => {
    if (isAndroidApp) {
      startNativeRecording();
      return;
    }
    const Recognition = getRecognition();
    if (!Recognition) {
      toast.error("Voice input isn't supported in this browser. Try Chrome or Safari.");
      error();
      return;
    }

    const recognition = new Recognition();
    recognition.lang = SPEECH_LOCALES[language] || 'en-US';
    recognition.continuous = true;
    recognition.interimResults = false;
    transcriptRef.current = '';

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcriptRef.current += `${event.results[i][0].transcript} `;
        }
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        toast.error('Microphone access is blocked. Allow it in your browser settings.');
      } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
        toast.error('Could not transcribe audio. Please try again.');
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      setIsProcessing(false);
      recognitionRef.current = null;
      const text = transcriptRef.current.trim();
      if (text) {
        onTranscript(text);
        success();
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    } catch {
      toast.error('Could not start voice input. Please try again.');
      error();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      setIsProcessing(true);
      recognitionRef.current.stop();
    }
  };

  const handleClick = () => {
    tap();
    if (isProcessing) return;
    // On Android the phone's own dialog handles stopping.
    if (isAndroidApp && isRecording) return;
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Button
      type="button"
      variant={isRecording ? 'destructive' : 'outline'}
      size="icon"
      onClick={handleClick}
      disabled={isProcessing}
      className={`relative shrink-0 h-10 w-10 ${isRecording ? 'animate-pulse' : ''} ${className}`}
      title={isRecording ? 'Stop recording' : 'Start voice input'}
    >
      {isProcessing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isRecording ? (
        <MicOff className="w-4 h-4" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
      {isRecording && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-ping" />
      )}
    </Button>
  );
}
