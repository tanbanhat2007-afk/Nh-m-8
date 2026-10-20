import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  TrendingUp,
  Brain,
  Layers,
} from 'lucide-react';
import IPadCanvas from '../IPadCanvas';
import MathView from '../MathView';
import { requestMicrophonePermission } from '../../utils/audioPermissions';

export const VoiceCanvasStudioTab: React.FC = () => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voiceMuted, setVoiceMuted] = useState<boolean>(false);
  const [speechTranscript, setSpeechTranscript] = useState<string>('');
  const [dialogueHistory, setDialogueHistory] = useState<
    { sender: 'user' | 'ai'; text: string; diagramType?: any }[]
  >([
    {
      sender: 'ai',
      text: 'Chào bạn! Trong phòng tương tác này, bạn có thể bấm nút Micro để đặt câu hỏi bằng giọng nói. Với các khái niệm khó như Phân phối chuẩn, Cây xác suất Bayes hay Miền bác bỏ kiểm định, tôi sẽ tự động vẽ đồ thị minh họa trực quan lên Bảng vẽ iPad realtime cho bạn!',
    },
  ]);
  const [currentAiDiagram, setCurrentAiDiagram] = useState<
    'normal_curve' | 'binomial_bars' | 'bayes_tree' | 'hypothesis_test' | null
  >('normal_curve');
  const [isThinking, setIsThinking] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'vi-VN';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSpeechTranscript(transcript);
        setIsListening(false);
        handleSendVoiceQuery(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

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

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const [micErrorMsg, setMicErrorMsg] = useState<string | null>(null);

  const toggleMic = async () => {
    setMicErrorMsg(null);
    if (!recognitionRef.current) {
      alert('Trình duyệt chưa hỗ trợ Web Speech API. Bạn có thể chọn câu hỏi mẫu bên dưới để kích hoạt.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setIsSpeaking(false);

      const perm = await requestMicrophonePermission();
      if (!perm.granted) {
        setMicErrorMsg(perm.error || 'Vui lòng cho phép quyền truy cập Micro trên trình duyệt.');
        return;
      }

      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
        setMicErrorMsg('Lỗi khởi động Micro. Vui lòng kiểm tra lại quyền truy cập Micro trên trình duyệt.');
      }
    }
  };

  const handleSendVoiceQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    setDialogueHistory((prev) => [...prev, { sender: 'user', text: queryText }]);
    setSpeechTranscript('');
    setIsThinking(true);

    try {
      const res = await fetch('/api/ai/voice-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: queryText, currentTopic: 'Xác suất Thống kê Đại cương' }),
      });
      const data = await res.json();

      const aiText = data.speechText || 'Đã phân tích câu hỏi của bạn.';
      const diagramType = data.whiteboard?.diagramType || 'normal_curve';

      setDialogueHistory((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiText,
          diagramType: data.whiteboard?.shouldDraw ? diagramType : undefined,
        },
      ]);

      if (data.whiteboard?.shouldDraw) {
        setCurrentAiDiagram(diagramType);
      }

      speakText(aiText);
    } catch {
      const fallback = 'Tôi đã nhận câu hỏi của bạn. Để hiểu rõ phân phối này, mời bạn quan sát đồ thị trực quan trên bảng vẽ iPad!';
      setDialogueHistory((prev) => [...prev, { sender: 'ai', text: fallback }]);
      speakText(fallback);
    } finally {
      setIsThinking(false);
    }
  };

  const sampleVoicePrompts = [
    {
      text: 'Vẽ đồ thị miền bác bỏ kiểm định Z một phía và giải thích',
      diagram: 'hypothesis_test',
    },
    {
      text: 'Minh họa quy tắc cây xác suất Bayes khi chẩn đoán bệnh',
      diagram: 'bayes_tree',
    },
    {
      text: 'Biểu diễn các cột xác suất của phân phối Nhị thức B(10, 0.4)',
      diagram: 'binomial_bars',
    },
    {
      text: 'Vẽ phân phối chuẩn Gauss và giải thích quy tắc 68-95-99.7%',
      diagram: 'normal_curve',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <span className="text-xs font-semibold text-blue-600 tracking-wide uppercase">
          Tính Năng 3: Đồng Bộ Thời Gian Thực (Live Sync)
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
          Phòng Trao Đổi Giọng Nói Hai Chiều & Bảng Vẽ iPad Realtime
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Tương tác qua giọng nói tự nhiên: Khi gặp các công thức toán phức tạp, AI tự động phác thảo đồ thị phân phối trực tiếp lên Bảng vẽ iPad để sinh viên dễ dàng lĩnh hội trực quan.
        </p>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Voice Dialogue Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Voice Microphone Controller */}
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-cyan-200" />
                <h3 className="font-bold text-sm">Giao Tiếp Giọng Nói AI</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setVoiceMuted(!voiceMuted);
                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                }}
                className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                title={voiceMuted ? 'Bật tiếng' : 'Tắt tiếng'}
              >
                {voiceMuted ? <VolumeX className="w-4 h-4 text-white/70" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Central Mic Button */}
            <div className="flex flex-col items-center justify-center py-4">
              <button
                type="button"
                onClick={toggleMic}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-300/40 shadow-xl'
                    : isSpeaking
                    ? 'bg-emerald-400 text-white ring-8 ring-emerald-200/40'
                    : 'bg-white text-blue-600 hover:scale-105 shadow-md'
                }`}
              >
                {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>

              <span className="text-xs font-medium mt-3 text-blue-100">
                {isListening
                  ? 'Đang lắng nghe... Hãy nói câu hỏi XSTK của bạn'
                  : isSpeaking
                  ? 'AI đang phát biểu bằng giọng nói...'
                  : 'Nhấn vào Micro để bắt đầu nói chuyện'}
              </span>

              {/* Sound wave bars */}
              {(isListening || isSpeaking) && (
                <div className="flex items-end gap-1 h-5 mt-3">
                  {[8, 16, 22, 12, 24, 15, 20, 10, 18, 14].map((h, i) => (
                    <span
                      key={i}
                      style={{
                        height: `${h}px`,
                        animationDuration: `${0.35 + (i % 3) * 0.12}s`,
                      }}
                      className="w-1 bg-white rounded-full animate-bounce"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Speech-to-text transcript preview */}
            {speechTranscript && (
              <div className="p-3 bg-white/15 rounded-xl text-xs text-blue-50 border border-white/20">
                <strong>Bạn vừa nói: </strong> &ldquo;{speechTranscript}&rdquo;
              </div>
            )}
          </div>

          {/* Microphone Permission Guidance */}
          {micErrorMsg && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start justify-between gap-2 animate-fadeIn">
              <div>
                <strong className="text-amber-800 block mb-0.5">Quyền truy cập Micro:</strong>
                <p className="leading-relaxed">{micErrorMsg}</p>
                <button
                  type="button"
                  onClick={toggleMic}
                  className="mt-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
                >
                  Thử cấp quyền lại
                </button>
              </div>
              <button
                type="button"
                onClick={() => setMicErrorMsg(null)}
                className="text-amber-500 hover:text-amber-700 p-0.5"
              >
                ✕
              </button>
            </div>
          )}

          {/* Sample Prompts to tap */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Hoặc chọn nhanh câu hỏi giọng nói mẫu:
            </span>
            <div className="space-y-1.5">
              {sampleVoicePrompts.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendVoiceQuery(item.text)}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50/60 text-xs text-slate-700 transition-colors flex items-center justify-between group"
                >
                  <span className="line-clamp-1">{item.text}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>

          {/* Dialogue Log */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 max-h-72 overflow-y-auto">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Lịch sử Trao Đổi
            </h4>
            {dialogueHistory.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl text-xs leading-relaxed ${
                  item.sender === 'user'
                    ? 'bg-blue-50 border border-blue-200 text-blue-900 ml-4'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 mr-4'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1 text-[11px] text-slate-500">
                  {item.sender === 'user' ? (
                    <>
                      <User className="w-3 h-3 text-blue-600" />
                      <span>Học viên</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-3 h-3 text-cyan-600" />
                      <span>Trợ lý AI</span>
                    </>
                  )}
                </div>
                <MathView content={item.text} />
              </div>
            ))}
            {isThinking && (
              <div className="flex items-center gap-2 p-2 text-xs text-blue-600">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>AI đang phân tích và chuẩn bị nét vẽ...</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live iPad Canvas Studio (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Bảng Vẽ iPad Đồng Bộ Thời Gian Thực (Live Whiteboard)
              </h3>
            </div>
            <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
              Đồng bộ nét vẽ AI
            </span>
          </div>

          <IPadCanvas
            height={550}
            initialDiagram={currentAiDiagram}
          />
        </div>
      </div>
    </div>
  );
};

export default VoiceCanvasStudioTab;
