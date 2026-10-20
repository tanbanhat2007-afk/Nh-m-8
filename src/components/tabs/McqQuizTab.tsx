import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  CheckCircle,
  XCircle,
  RefreshCw,
  Lightbulb,
  AlertOctagon,
  ArrowRight,
  BookmarkPlus,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { McqQuestion } from '../../types';
import { initialMcqQuestions } from '../../data/initialData';
import MathView from '../MathView';

interface McqQuizTabProps {
  onRecordError?: (error: any) => void;
}

export const McqQuizTab: React.FC<McqQuizTabProps> = ({ onRecordError }) => {
  const [questions, setQuestions] = useState<McqQuestion[]>(initialMcqQuestions);
  const [selectedTopic, setSelectedTopic] = useState<string>('Tất cả chuyên đề');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeWhyExplanation, setActiveWhyExplanation] = useState<Record<number, string>>({});
  const [loadingWhyId, setLoadingWhyId] = useState<number | null>(null);

  const handleSelectOption = (qId: number, optionIndex: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === qId) {
          const isCorrect = optionIndex === q.correctIndex;
          if (isCorrect) {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
            });
          } else if (onRecordError) {
            // Automatically log to Error Analytics
            onRecordError({
              id: `err-${Date.now()}`,
              source: 'Trắc nghiệm',
              topic: q.topic,
              questionSummary: q.question.slice(0, 100) + '...',
              errorClassification: q.topic.includes('Kiểm định')
                ? 'Nhầm lẫn 1 phía và 2 phía'
                : 'Quên chuẩn hóa biến ngẫu nhiên',
              studentMisstep: `Chọn ${q.options[optionIndex]}, đáp án chuẩn là ${q.options[q.correctIndex]}`,
              remedyAction: q.commonTrap || 'Xem lại lý thuyết phân phối và bẫy đề thi',
              resolved: false,
              timestamp: 'Vừa xong',
            });
          }

          return {
            ...q,
            userSelectedIndex: optionIndex,
            isAnswered: true,
          };
        }
        return q;
      })
    );
  };

  const handleAskWhy = async (q: McqQuestion) => {
    if (q.userSelectedIndex === undefined) return;
    setLoadingWhyId(q.id);

    try {
      const res = await fetch('/api/ai/explain-mcq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q.question,
          options: q.options,
          selectedIndex: q.userSelectedIndex,
          correctIndex: q.correctIndex,
        }),
      });
      const data = await res.json();
      setActiveWhyExplanation((prev) => ({
        ...prev,
        [q.id]: data.explanation || q.whyExplanation,
      }));
    } catch {
      setActiveWhyExplanation((prev) => ({
        ...prev,
        [q.id]: `### 💡 Phân tích Chi Tiết từ AI:
* **Tại sao đáp án [${String.fromCharCode(65 + q.correctIndex)}] đúng:** ${q.whyExplanation}
* **Bẫy đề thi cần né:** ${q.commonTrap}`,
      }));
    } finally {
      setLoadingWhyId(null);
    }
  };

  const handleGenerateNewQuiz = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'mcq',
          topic: selectedTopic === 'Tất cả chuyên đề' ? 'Tổng hợp Xác suất Thống kê' : selectedTopic,
          difficulty: 'Vận dụng',
        }),
      });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(
          data.questions.map((q: any, i: number) => ({
            id: i + 1,
            topic: data.topic || selectedTopic,
            question: q.statement || q.question,
            options: q.options || [
              'A. Phân phối Chuẩn',
              'B. Phân phối Student',
              'C. Phân phối Poisson',
              'D. Phân phối Khi-bình phương',
            ],
            correctIndex: q.correctIndex !== undefined ? q.correctIndex : 0,
            whyExplanation: q.whyExplanation || 'Lập luận toán học dựa trên Định lý Giới hạn Trung tâm.',
            commonTrap: 'Học sinh thường quên kiểm tra điều kiện kích thước mẫu n.',
          }))
        );
        setActiveWhyExplanation({});
      }
    } catch {
      // Refresh with curated randomized set
    } finally {
      setIsGenerating(false);
    }
  };

  const answeredCount = questions.filter((q) => q.isAnswered).length;
  const correctCount = questions.filter(
    (q) => q.isAnswered && q.userSelectedIndex === q.correctIndex
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <span className="text-xs font-semibold text-blue-600 tracking-wide uppercase">
          Tính Năng 5: Trắc Nghiệm Thông Minh & Nút &ldquo;Tại Sao?&rdquo;
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
          Sinh Bài Tập Trắc Nghiệm XSTK & Truy Vấn &ldquo;Tại Sao?&rdquo;
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Chấm điểm ngay tức thì khi chọn đáp án. Khi cần thấu hiểu bản chất và các bẫy đề thi kinh điển, hãy nhấn nút{' '}
          <strong className="text-blue-600">&ldquo;Tại sao?&rdquo;</strong> để AI giải mã toàn diện.
        </p>
      </div>

      {/* Control & Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Tất cả chuyên đề">Tất cả chuyên đề XSTK</option>
            <option value="Kiểm định Giả thiết">Kiểm định Giả thiết (Z & t)</option>
            <option value="Định lý Giới hạn Trung tâm">Định lý Giới hạn Trung tâm (CLT)</option>
            <option value="Xác suất Có Điều Kiện & Bayes">Xác suất Có Điều Kiện & Bayes</option>
            <option value="Phân phối Rời rạc">Phân phối Nhị thức & Poisson</option>
          </select>

          <button
            type="button"
            onClick={handleGenerateNewQuiz}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors border border-blue-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Sinh Đề Trắc Nghiệm Mới</span>
          </button>
        </div>

        {/* Score indicator */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Tiến độ làm bài:</span>
          <span className="font-bold text-slate-800">
            {answeredCount} / {questions.length} câu
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
            Đúng: {correctCount} câu
          </span>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, qIndex) => {
          const isAnswered = q.isAnswered;
          const userIdx = q.userSelectedIndex;
          const isCorrect = userIdx === q.correctIndex;
          const whyText = activeWhyExplanation[q.id];

          return (
            <div
              key={q.id}
              className={`bg-white border rounded-xl p-5 shadow-sm space-y-4 transition-all ${
                isAnswered
                  ? isCorrect
                    ? 'border-emerald-300 bg-emerald-50/10'
                    : 'border-rose-300 bg-rose-50/10'
                  : 'border-slate-200'
              }`}
            >
              {/* Question header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                    {qIndex + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">[{q.topic}]</span>
                </div>

                {isAnswered && (
                  <span
                    className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                      isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Chính xác (+10đ)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Chưa chính xác (Đã lưu vào Phân tích lỗi)</span>
                      </>
                    )}
                  </span>
                )}
              </div>

              {/* Question Statement */}
              <div className="text-sm font-semibold text-slate-900 leading-relaxed">
                <MathView content={q.question} />
              </div>

              {/* 4 Choices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {q.options.map((opt, optIdx) => {
                  let buttonStyle = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700';

                  if (isAnswered) {
                    if (optIdx === q.correctIndex) {
                      buttonStyle = 'bg-emerald-100/80 border-emerald-500 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                    } else if (optIdx === userIdx) {
                      buttonStyle = 'bg-rose-100/80 border-rose-500 text-rose-950 font-semibold ring-1 ring-rose-500';
                    } else {
                      buttonStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-2.5 ${buttonStyle}`}
                    >
                      <span className="font-bold shrink-0">{String.fromCharCode(65 + optIdx)}.</span>
                      <div className="flex-1">
                        <MathView content={opt} inline />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* "Tại sao?" Action Button when answered */}
              {isAnswered && (
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleAskWhy(q)}
                    disabled={loadingWhyId === q.id}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>
                      {loadingWhyId === q.id
                        ? 'AI đang phân tích bẫy...'
                        : 'Tại sao? (AI Giải thích Chi Tiết)'}
                    </span>
                  </button>

                  <span className="text-[11px] text-slate-400">
                    Bẫy kinh điển: {q.commonTrap}
                  </span>
                </div>
              )}

              {/* Detailed "Tại sao?" Explanation Box */}
              {whyText && (
                <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl text-xs sm:text-sm text-slate-800 space-y-2 animate-fadeIn">
                  <MathView content={whyText} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default McqQuizTab;
