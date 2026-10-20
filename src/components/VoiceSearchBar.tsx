import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Search,
  Sparkles,
  ArrowRight,
  X,
  Volume2,
  VolumeX,
  Compass,
  FileCheck2,
  HelpCircle,
  FileText,
  Brain,
  BarChart3,
  Network,
  Layers,
} from 'lucide-react';
import MathView from './MathView';
import { TabType } from '../types';
import { requestMicrophonePermission } from '../utils/audioPermissions';

interface VoiceSearchBarProps {
  onNavigateTab: (tab: TabType, topicId?: string) => void;
}

export const VoiceSearchBar: React.FC<VoiceSearchBarProps> = ({ onNavigateTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [spokenFeedback, setSpokenFeedback] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [voiceMuted, setVoiceMuted] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition (Web Speech API)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'vi-VN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
        executeSearch(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const speakText = (text: string) => {
    if (voiceMuted || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const cleanSpeech = text
      .replace(/\$([\s\S]*?)\$/g, 'công thức toán')
      .replace(/[#*`_]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find((v) => v.lang.includes('vi') || v.lang.includes('VN'));
    if (viVoice) utterance.voice = viVoice;

    window.speechSynthesis.speak(utterance);
  };

  const [micError, setMicError] = useState<string | null>(null);

  const startVoiceCapture = async () => {
    setIsOpen(true);
    setMicError(null);
    if (!recognitionRef.current) {
      alert('Trình duyệt chưa hỗ trợ Web Speech API. Bạn có thể gõ từ khóa vào thanh tìm kiếm.');
      return;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    // Trigger browser microphone prompt
    const perm = await requestMicrophonePermission();
    if (!perm.granted) {
      setMicError(perm.error || 'Vui lòng cấp quyền Micro trên trình duyệt để sử dụng.');
      return;
    }

    try {
      recognitionRef.current.start();
    } catch {
      // Ignored if already started
    }
  };

  const stopVoiceCapture = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const executeSearch = async (text: string) => {
    if (!text.trim()) return;
    setIsSearching(true);
    setSpokenFeedback(null);

    try {
      const res = await fetch('/api/ai/voice-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json();

      setSpokenFeedback(data.spokenResponse || `Đã tìm thấy kết quả cho "${text}".`);
      setSearchResults(data.results || []);

      if (data.spokenResponse) {
        speakText(data.spokenResponse);
      }
    } catch {
      const fallbackMsg = `Đã tìm thấy chuyên đề liên quan đến "${text}".`;
      setSpokenFeedback(fallbackMsg);
      setSearchResults([
        {
          title: `Chuyên đề: ${text}`,
          type: 'Học phần XSTK',
          tab: 'pipeline',
          description: 'Khám phá quy trình 4 bước và công thức toán liên quan.',
        },
      ]);
      speakText(fallbackMsg);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (tab: TabType, topicId?: string) => {
    onNavigateTab(tab, topicId);
    setIsOpen(false);
  };

  const quickVoicePrompts = [
    'Tìm công thức Bayes',
    'Định lý Giới hạn Trung tâm CLT',
    'Kiểm định giả thiết Z-test',
    'Mở ngân hàng bài tập Trắc nghiệm',
    'Bảng vẽ iPad đồ thị phân phối chuẩn',
    'Xem các lỗi sai tôi hay mắc phải',
  ];

  return (
    <>
      {/* Search trigger button placed in Navbar */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          startVoiceCapture();
        }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/90 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200/80 transition-all text-xs group"
        title="Tìm kiếm bằng giọng nói hoặc phím tắt Ctrl+K"
      >
        <div className="relative">
          <Mic className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
        </div>
        <span className="hidden sm:inline font-medium">Tìm kiếm bằng giọng nói...</span>
        <span className="sm:hidden font-medium">Tìm kiếm</span>
        <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-white border border-slate-300 rounded font-mono text-slate-400">
          ⌘K
        </kbd>
      </button>

      {/* Voice Search Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
            {/* Modal Search Input Header */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={isListening ? stopVoiceCapture : startVoiceCapture}
                className={`p-3 rounded-full transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-200'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
                title={isListening ? 'Dừng lắng nghe' : 'Nói để tìm kiếm'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && executeSearch(searchQuery)}
                  placeholder={
                    isListening
                      ? '🎤 Đang lắng nghe giọng bạn... Hãy nói điều bạn muốn tìm...'
                      : 'Nhập hoặc nói: "Công thức Bayes", "Kiểm định t-test", "Bản đồ tư duy"...'
                  }
                  autoFocus
                  className="w-full text-sm sm:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent font-medium"
                />
              </div>

              {/* Sound Mute Toggle */}
              <button
                type="button"
                onClick={() => setVoiceMuted(!voiceMuted)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                title={voiceMuted ? 'Bật giọng đọc kết quả' : 'Tắt giọng đọc'}
              >
                {voiceMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-blue-600" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  stopVoiceCapture();
                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mic Permission Guidance */}
            {micError && (
              <div className="p-3.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-start justify-between gap-3 animate-fadeIn">
                <div className="space-y-1">
                  <strong className="text-amber-800 block">Quyền sử dụng Micro:</strong>
                  <p className="leading-relaxed">{micError}</p>
                  <button
                    type="button"
                    onClick={startVoiceCapture}
                    className="mt-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
                  >
                    Bấm để thử cấp quyền lại
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setMicError(null)}
                  className="text-amber-500 hover:text-amber-700 p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Listening Waveform Bar */}
            {isListening && (
              <div className="flex items-center justify-between px-6 py-2.5 bg-blue-50 border-b border-blue-100 text-xs text-blue-900">
                <span className="font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  Đang ghi âm giọng nói tiếng Việt...
                </span>
                <div className="flex items-end gap-1 h-5">
                  {[6, 14, 20, 10, 24, 16, 18, 8, 15, 12].map((h, i) => (
                    <span
                      key={i}
                      style={{
                        height: `${h}px`,
                        animationDuration: `${0.3 + (i % 3) * 0.1}s`,
                      }}
                      className="w-1 bg-blue-600 rounded-full animate-bounce"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Body Content */}
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
              {/* Spoken AI feedback announcement */}
              {spokenFeedback && (
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs sm:text-sm text-blue-950 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-blue-900 block mb-0.5">Phản Hồi Giọng Nói AI:</span>
                    <p className="leading-relaxed">{spokenFeedback}</p>
                  </div>
                </div>
              )}

              {/* Search Results List */}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Kết Quả Khớp Với Lệnh Giọng Nói:
                  </span>
                  <div className="space-y-2">
                    {searchResults.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectResult(item.tab)}
                        className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {item.title}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              {item.type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {item.description}
                          </p>
                          {item.formula && (
                            <div className="text-xs font-mono text-blue-700">
                              <MathView content={`$${item.formula}$`} inline />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform ml-3 shrink-0">
                          <span>Mở ngay</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Spoken Prompts suggestions */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Gợi Ý Câu Lệnh Mẫu Bằng Giọng Nói:
                </span>
                <div className="flex flex-wrap gap-2">
                  {quickVoicePrompts.map((cmd, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSearchQuery(cmd);
                        executeSearch(cmd);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1.5"
                    >
                      <Mic className="w-3 h-3 text-slate-400" />
                      <span>{cmd}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Hỗ trợ nhận dạng giọng nói Tiếng Việt tự nhiên & Điều hướng tức thì</span>
              <span>Nhấn ESC để đóng</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceSearchBar;
