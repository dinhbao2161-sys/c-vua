import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Language } from '../types/chess';
import { t } from '../translations';
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  Bot, 
  User, 
  Sparkles, 
  X, 
  Trash2, 
  RotateCcw,
  Headphones
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface VoiceDialogueModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Chess;
  lang: Language;
}

// Browser SpeechRecognition definition
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export const VoiceDialogueModal: React.FC<VoiceDialogueModalProps> = ({
  isOpen,
  onClose,
  game,
  lang
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      text: lang === 'vi'
        ? 'Xin chào! Tôi là Đại Kiện Tướng AI của bạn. Bạn có thể nhấn vào nút micro để nói chuyện trực tiếp, hoặc nhập câu hỏi về thế cờ hiện tại!'
        : 'Hello! I am your AI Grandmaster mentor. Click the microphone to speak with me directly or type any questions about your game!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Speech Recognition Setup
  useEffect(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang === 'vi' ? 'vi-VN' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Speech init failed:', err);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [lang]);

  // Stop text-to-speech when modal closes
  useEffect(() => {
    if (!isOpen) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    }
  }, [isOpen, isListening]);

  // Speak aloud using SpeechSynthesis
  const speakAloud = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'vi' ? 'vi-VN' : 'en-US';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Toggle Voice Recording
  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      setInputText('');
      try {
        recognitionRef.current.lang = lang === 'vi' ? 'vi-VN' : 'en-US';
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Cannot start recognition:', err);
      }
    }
  };

  // Submit User Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const fen = game.fen();
      const pgn = game.pgn();
      const turn = game.turn() === 'w' ? 'White' : 'Black';

      const res = await fetch('/api/dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: text,
          history: newMessages.map(m => ({ role: m.role, text: m.text })),
          fen,
          pgn,
          turn,
          lang
        })
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.reply || (lang === 'vi' ? 'Tôi đã nhận được ý kiến của bạn.' : 'I understand your move plan.');
        
        const assistantMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, assistantMsg]);

        if (autoSpeak) {
          speakAloud(reply);
        }
      }
    } catch (err) {
      console.error('Dialogue request failed:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: lang === 'vi'
          ? 'Xin lỗi, tôi gặp sự cố kết nối. Hãy tiếp tục tập trung kiểm soát trung tâm và an toàn vua!'
          : 'Sorry, I encountered a brief connection error. Keep focusing on center control and king safety!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-xl w-full h-[90vh] max-h-[680px] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-950/40 via-slate-900 to-purple-950/30 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
                <Bot className="w-5 h-5" />
              </div>
              {/* Online / Active Indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                {t(lang, 'voiceDialogue')}
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-normal border border-amber-500/30">
                  Live Voice
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[240px] sm:max-w-none">
                {t(lang, 'voiceDialogueDesc')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Auto-speak Toggle */}
            <button
              onClick={() => {
                if (isSpeaking) stopSpeaking();
                setAutoSpeak(!autoSpeak);
              }}
              title={t(lang, 'voiceAutoSpeak')}
              className={`p-2 rounded-xl transition-colors ${
                autoSpeak
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Clear conversation */}
            <button
              onClick={() => {
                stopSpeaking();
                setMessages([]);
              }}
              title={t(lang, 'clearChat')}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Audio Visualizer Banner (when speaking or listening) */}
        {(isListening || isSpeaking) && (
          <div className="bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 h-3">
                <span className="w-1 bg-amber-400 h-full animate-[pulse_0.4s_ease-in-out_infinite]" />
                <span className="w-1 bg-amber-400 h-2/3 animate-[pulse_0.5s_ease-in-out_infinite]" />
                <span className="w-1 bg-amber-400 h-full animate-[pulse_0.3s_ease-in-out_infinite]" />
                <span className="w-1 bg-amber-400 h-1/2 animate-[pulse_0.6s_ease-in-out_infinite]" />
              </div>
              <span className="font-semibold text-amber-300">
                {isListening ? t(lang, 'listening') : 'Đại Kiện Tướng đang nói...'}
              </span>
            </div>
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/30 hover:bg-amber-500/40 text-amber-200 transition-colors"
              >
                Dừng nói
              </button>
            )}
          </div>
        )}

        {/* Chat Messages Container */}
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map(msg => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm text-xs font-bold ${
                    isUser
                      ? 'bg-amber-600 text-white'
                      : 'bg-gradient-to-tr from-purple-700 to-indigo-700 text-purple-200'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className={`max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-xs md:text-sm leading-relaxed shadow-md ${
                      isUser
                        ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                        : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  
                  {/* Footer & Audio Replay */}
                  <div className="flex items-center gap-1.5 mt-1 px-1">
                    <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => speakAloud(msg.text)}
                        title="Nghe lại câu này"
                        className="text-slate-500 hover:text-amber-400 transition-colors p-0.5"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-700 text-purple-200 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-800/90 border border-slate-700/80 px-4 py-3 rounded-2xl rounded-tl-none shadow-md flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        {/* Quick Question Prompts */}
        <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {[
            { label: t(lang, 'quickPrompt1'), icon: Sparkles },
            { label: t(lang, 'quickPrompt2'), icon: Headphones },
            { label: t(lang, 'quickPrompt3'), icon: Bot },
            { label: t(lang, 'quickPrompt4'), icon: RotateCcw }
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt.label)}
              disabled={isLoading}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700/90 text-slate-300 hover:text-white border border-slate-700/60 text-[11px] font-medium transition-colors disabled:opacity-50"
            >
              <prompt.icon className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{prompt.label}</span>
            </button>
          ))}
        </div>

        {/* Voice & Input Controls Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 shrink-0">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Microphone Button */}
            <button
              type="button"
              onClick={toggleListening}
              disabled={!speechSupported}
              title={speechSupported ? (isListening ? 'Dừng lắng nghe' : 'Nói chuyện bằng giọng nói') : t(lang, 'voiceNotSupported')}
              className={`p-3 rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95 ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-red-500/40 ring-4 ring-red-500/20'
                  : speechSupported
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Input Box */}
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={isListening ? t(lang, 'listening') : t(lang, 'askGMPlaceholder')}
              className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-bold transition-all active:scale-95 shadow-md shadow-amber-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {!speechSupported && (
            <p className="text-[10px] text-slate-500 mt-1.5 text-center">
              {t(lang, 'voiceNotSupported')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
