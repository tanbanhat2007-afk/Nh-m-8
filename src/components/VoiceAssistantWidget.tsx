import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Maximize2,
  Minimize2,
  Send,
  X,
  Bot,
  Search,
  ArrowRight,
  Compass,
  FileCheck2,
  HelpCircle,
  FileText,
  Brain,
  BarChart3,
  Network,
  MessageSquare,
  User,
} from 'lucide-react';
import MathView from './MathView';
import { requestMicrophonePermission } from '../utils/audioPermissions';

interface SearchResultItem {
  title: string;
  type: string;
  tab: string;
  description: string;
  formula?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  whiteboardData?: any;
  searchResults?: SearchResultItem[];
  targetTab?: string;
  timestamp: string;
}

interface VoiceAssistantWidgetProps {
  onAiDrawCommand?: (diagramType: 'normal_curve' | 'binomial_bars' | 'bayes_tree' | 'hypothesis_test') => void;
  onNavigateTab?: (tab: string) => void;
  currentTopic?: string;
}

export const VoiceAssistantWidget: React.FC<VoiceAssistantWidgetProps> = ({
  onAiDrawCommand,
  onNavigateTab,
  currentTopic = 'Xác suất Thống kê',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [chatMode, setChatMode] = useState<'all' | 'search'>('all');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-welcome',
      sender: 'ai',
      text: 'Xin chào! Tôi là Trợ lý AI Xác suất Thống kê. Bạn có thể **nói để hỏi đáp**, **yêu cầu vẽ bảng iPad**, hoặc **tìm kiếm bằng giọng nói** bất kỳ chuyên đề, công thức hay bài tập nào!',
      timestamp: 'Vừa xong',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
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
        setInputText(transcript);
        setIsListening(false);
        // Automatically process after voice capture
        handleSendMessage(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [chatMode]);

  // Text to Speech playback
  const speakText = (text: string) => {
    if (voiceMuted || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const cleanSpeech = text
      .replace(/\$([\s\S]*?)\$/g, 'công thức toán')
      .replace(/[#*`_]/g, '')
      .replace(/https?:\/\/\S+/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find((v) => v.lang.includes('vi') || v.lang.includes('VN'));
    if (viVoice) utterance.voice = viVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);

  const toggleMic = async () => {
    setMicPermissionError(null);
    if (!recognitionRef.current) {
      alert('Trình duyệt của bạn chưa hỗ trợ nhận dạng giọng nói Web Speech. Vui lòng nhập văn bản qua khung chat.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setIsSpeaking(false);

      // Explicitly trigger browser microphone permission dialog
      const perm = await requestMicrophonePermission();
      if (!perm.granted) {
        setMicPermissionError(perm.error || 'Vui lòng cho phép quyền truy cập Micro trên trình duyệt để sử dụng.');
        return;
      }

      try {
        recognitionRef.current.start();
      } catch (err: any) {
        console.error('Speech recognition start failed:', err);
        setMicPermissionError('Lỗi khởi động Micro. Vui lòng kiểm tra lại quyền truy cập Micro trên trình duyệt.');
      }
    }
  };

  // Helper to detect if user query is a search / navigation request
  const isSearchIntent = (text: string) => {
    if (chatMode === 'search') return true;
    const lower = text.toLowerCase();
    const searchKeywords = [
      'tìm',
      'kiếm',
      'tra cứu',
      'mở',
      'xem',
      'chuyển đến',
      'ở đâu',
      'bài tập',
      'trắc nghiệm',
      'tự luận',
      'lỗi sai',
      'bản đồ',
      'vấn đáp',
      'hồ sơ',
      'diễn đàn',
    ];
    return searchKeywords.some((kw) => lower.includes(kw));
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    const wantsSearch = isSearchIntent(textToSend);

    if (wantsSearch) {
      // Execute Voice Search within Chatbot
      try {
        const res = await fetch('/api/ai/voice-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: textToSend }),
        });
        const data = await res.json();

        const spokenReply =
          data.spokenResponse || `Tôi đã tìm kiếm nội dung liên quan đến "${textToSend}".`;

        const aiMsg: Message = {
          id: `msg-${Date.now() + 1}`,
          sender: 'ai',
          text: spokenReply,
          searchResults: data.results || [],
          targetTab: data.targetTab,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, aiMsg]);
        speakText(spokenReply);
      } catch {
        const fallbackText = `Tôi đã tìm thấy chuyên mục liên quan đến "${textToSend}". Bạn có thể chọn mở bên dưới:`;
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now() + 1}`,
            sender: 'ai',
            text: fallbackText,
            searchResults: [
              {
                title: `Chuyên đề: ${textToSend}`,
                type: 'Chuyên đề chính',
                tab: 'pipeline',
                description: 'Khám phá quy trình 4 bước, công thức KaTeX và ví dụ tương ứng.',
              },
            ],
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        speakText(fallbackText);
      } finally {
        setLoading(false);
      }
    } else {
      // Standard Voice Tutor Q&A + Whiteboard drawing
      try {
        const res = await fetch('/api/ai/voice-tutor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: textToSend, currentTopic }),
        });
        const data = await res.json();

        const aiReply = data.speechText || 'Đã nhận câu hỏi của bạn. Đang phân tích...';
        const aiMsg: Message = {
          id: `msg-${Date.now() + 1}`,
          sender: 'ai',
          text: aiReply,
          whiteboardData: data.whiteboard,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, aiMsg]);
        speakText(aiReply);

        if (data.whiteboard?.shouldDraw && onAiDrawCommand && data.whiteboard.diagramType) {
          onAiDrawCommand(data.whiteboard.diagramType);
        }
      } catch {
        const fallbackText =
          'Hiện tại tôi đã phân tích yêu cầu của bạn. Trong Xác suất Thống kê, việc lập mô hình biến ngẫu nhiên và kiểm tra điều kiện áp dụng là bước quyết định!';
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now() + 1}`,
            sender: 'ai',
            text: fallbackText,
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        speakText(fallbackText);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Quick prompt presets including both Q&A and Voice Search queries
  const quickPrompts = [
    { label: '🔍 Tìm công thức Bayes', prompt: 'Tìm kiếm công thức xác suất Bayes' },
    { label: '🔍 Tìm bài kiểm định Z', prompt: 'Tìm bài tập kiểm định giả thiết Z-test' },
    { label: '🔍 Mở bài trắc nghiệm', prompt: 'Mở ngân hàng bài tập trắc nghiệm có giải thích tại sao' },
    { label: '🔍 Xem phân tích lỗi sai', prompt: 'Mở bảng phân tích lỗi sai của tôi' },
    { label: '🎨 Vẽ phân phối Gauss', prompt: 'Hãy giải thích và vẽ đồ thị phân phối chuẩn Gauss lên bảng iPad' },
    { label: '💡 Z vs t-test', prompt: 'Khi nào dùng kiểm định Z và khi nào dùng kiểm định t-Student?' },
  ];

  const handleNavigateFromResult = (tab: string) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    }
  };

  return (
    <>
      {/* Floating Action Trigger Button when closed */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-full shadow-lg shadow-blue-500/30 hover:scale-105 transition-all"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full animate-pulse" />
          </div>
          <span className="text-sm font-semibold">Trợ lý AI & Tìm kiếm Giọng nói</span>
        </button>
      )}

      {/* Floating Dialog / Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-200 bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden ${
            isMinimized
              ? 'bottom-6 right-6 w-80 h-16'
              : 'bottom-6 right-6 w-[390px] sm:w-[460px] h-[600px] max-h-[88vh]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white select-none">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-semibold leading-tight flex items-center gap-1.5">
                  <span>Trợ Lý AI XSTK</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-white/20 rounded">
                    Tìm kiếm giọng nói
                  </span>
                </h4>
                <p className="text-[11px] text-blue-100 flex items-center gap-1">
                  <span>Hỏi đáp · Tìm kiếm bài học · Bảng vẽ iPad</span>
                  {(isListening || isSpeaking) && (
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-white/90">
              {/* Sound Mute Toggle */}
              <button
                type="button"
                onClick={() => {
                  setVoiceMuted(!voiceMuted);
                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                }}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title={voiceMuted ? 'Bật âm thanh giọng nói' : 'Tắt âm thanh'}
              >
                {voiceMuted ? <VolumeX className="w-4 h-4 text-white/70" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Minimize Toggle */}
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title={isMinimized ? 'Phóng to' : 'Thu nhỏ'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                  if (isListening && recognitionRef.current) recognitionRef.current.stop();
                }}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title="Đóng cửa sổ"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Mode Bar (Q&A vs Voice Search Filter) */}
              <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200 text-xs">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setChatMode('all')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                      chatMode === 'all'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Hỏi đáp & Bảng vẽ
                  </button>
                  <button
                    type="button"
                    onClick={() => setChatMode('search')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-colors ${
                      chatMode === 'search'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Search className="w-3 h-3" />
                    <span>Tìm kiếm giọng nói</span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-500">
                  {chatMode === 'search' ? '🔍 Đang ở chế độ Tìm kiếm' : '💡 Nhận diện cả câu hỏi & lệnh tìm'}
                </span>
              </div>

              {/* Microphone Permission Guidance Alert */}
              {micPermissionError && (
                <div className="p-3 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-start justify-between gap-2 animate-fadeIn">
                  <div className="space-y-1">
                    <strong className="text-amber-800 block">Quyền sử dụng Micro:</strong>
                    <p className="leading-relaxed text-[11px]">{micPermissionError}</p>
                    <button
                      type="button"
                      onClick={toggleMic}
                      className="mt-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-[11px] font-semibold shadow-sm transition-colors"
                    >
                      Thử cấp quyền lại
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMicPermissionError(null)}
                    className="text-amber-500 hover:text-amber-700 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Voice Soundwave Indicator Bar */}
              {(isListening || isSpeaking) && (
                <div className="flex items-center justify-between px-4 py-2 bg-blue-50 border-b border-blue-100 text-xs text-blue-800">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {isListening
                        ? chatMode === 'search'
                          ? '🎤 Đang nghe lệnh tìm kiếm của bạn...'
                          : '🎤 Đang lắng nghe giọng bạn nói...'
                        : '🔊 AI đang phát âm phản hồi...'}
                    </span>
                  </div>
                  {/* Animated Waveform Bars */}
                  <div className="flex items-end gap-0.5 h-4">
                    {[6, 14, 18, 10, 20, 12, 16, 8, 15, 11].map((h, i) => (
                      <span
                        key={i}
                        style={{
                          height: `${Math.max(4, h * (isListening ? 0.9 : 1.1))}px`,
                          animationDuration: `${0.4 + (i % 3) * 0.15}s`,
                        }}
                        className="w-1 bg-blue-600 rounded-full animate-bounce"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm shadow-sm ${
                        m.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                      }`}
                    >
                      {m.sender === 'ai' ? (
                        <div className="space-y-2">
                          <MathView content={m.text} />

                          {/* Whiteboard Auto-Draw Trigger Card */}
                          {m.whiteboardData && m.whiteboardData.shouldDraw && (
                            <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-blue-700 bg-blue-50/80 p-2.5 rounded-xl">
                              <div className="flex items-center gap-1 font-semibold">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Đã phác thảo lên Bảng vẽ iPad:</span>
                              </div>
                              <p className="mt-0.5 text-slate-700 font-medium">{m.whiteboardData.title}</p>
                              {m.whiteboardData.latexFormula && (
                                <div className="mt-1 font-mono text-[11px] text-slate-800">
                                  ${m.whiteboardData.latexFormula}$
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => handleNavigateFromResult('voice-canvas')}
                                className="mt-2 w-full flex items-center justify-center gap-1 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                              >
                                <span>Xem nét vẽ trực tiếp trên iPad Canvas</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          {/* Voice Search Direct Result Cards */}
                          {m.searchResults && m.searchResults.length > 0 && (
                            <div className="mt-2 space-y-2 pt-2 border-t border-slate-100">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                                <Search className="w-3 h-3 text-blue-600" />
                                <span>Kết quả tìm kiếm phù hợp:</span>
                              </span>

                              {m.searchResults.map((res, rIdx) => (
                                <div
                                  key={rIdx}
                                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 hover:border-blue-300 transition-colors"
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-bold text-xs text-slate-900">{res.title}</span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-medium">
                                      {res.type}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 leading-relaxed">
                                    {res.description}
                                  </p>
                                  {res.formula && (
                                    <div className="text-[11px] font-mono text-blue-700">
                                      <MathView content={`$${res.formula}$`} inline />
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleNavigateFromResult(res.tab)}
                                    className="w-full mt-1 flex items-center justify-center gap-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                                  >
                                    <span>Chuyển đến chuyên mục này ngay</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span>{m.text}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-500 w-fit">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                    <span>AI đang phân tích giọng nói & tìm kiếm chuyên đề...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Bar */}
              <div className="px-3 py-1.5 bg-slate-100/70 border-t border-slate-200 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Gợi ý:</span>
                {quickPrompts.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(item.prompt)}
                    className="text-[11px] whitespace-nowrap bg-white px-2.5 py-1 rounded-md text-slate-700 hover:text-blue-600 hover:border-blue-300 border border-slate-200 transition-colors shadow-2xs"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Input & Voice Controls */}
              <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`p-2.5 rounded-full transition-all ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-200'
                      : chatMode === 'search'
                      ? 'bg-blue-600 text-white ring-2 ring-blue-200'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                  title={
                    isListening
                      ? 'Dừng thu âm'
                      : chatMode === 'search'
                      ? 'Nói để tìm kiếm nhanh'
                      : 'Nói để đặt câu hỏi hoặc tìm kiếm'
                  }
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={
                    isListening
                      ? 'Đang nghe bạn nói...'
                      : chatMode === 'search'
                      ? 'Nói hoặc nhập: "Tìm công thức Bayes", "Bài trắc nghiệm"...'
                      : 'Hỏi đáp XSTK hoặc nói "Tìm bài tập...", "Vẽ phân phối..."'
                  }
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder:text-slate-400"
                />

                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || loading}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-full transition-colors"
                  title="Gửi câu hỏi / Tìm kiếm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default VoiceAssistantWidget;
