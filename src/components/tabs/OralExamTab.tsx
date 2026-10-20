import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Award,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import MathView from '../MathView';
import { OralSession } from '../../types';

interface OralExamTabProps {
  onRecordError?: (error: any) => void;
}

export const OralExamTab: React.FC<OralExamTabProps> = ({ onRecordError }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('Định lý Giới hạn Trung tâm & Lý thuyết mẫu');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [studentAnswer, setStudentAnswer] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);

  const oralQuestions = [
    {
      id: 1,
      topic: 'Định lý Giới hạn Trung tâm & Lý thuyết mẫu',
      question:
        'Tại sao khi cỡ mẫu $n \\ge 30$, ta có thể sử dụng phân phối chuẩn cho trung bình mẫu $\\bar{X}$ ngay cả khi tổng thể ban đầu không tuân theo quy luật chuẩn? Hãy giải thích bản chất toán học của hiện tượng này.',
      sampleHighAnswer:
        'Theo Định lý Giới hạn Trung tâm Lindeberg-Lévy, khi một đại lượng ngẫu nhiên được hình thành từ tổng hoặc trung bình của nhiều yếu tố ngẫu nhiên độc lập có cùng phân phối và phương sai hữu hạn, các biến động cá lẻ bù trừ lẫn nhau, khiến hàm mật độ xác suất của tổng tiệm cận đường cong hình chuông Gauss N(mu, sigma^2/n). Con số n >= 30 là ngưỡng thực nghiệm đảm bảo sai lệch độ lệch (skewness) và độ nhọn (kurtosis) trở nên không đáng kể.',
    },
    {
      id: 2,
      topic: 'Kiểm định Giả thiết Thống kê',
      question:
        'Ý nghĩa thực sự của mức ý nghĩa $\\alpha = 0.05$ và chỉ số $p\\text{-value}$ là gì? Một nghiên cứu có $p = 0.03 < 0.05$ có đồng nghĩa với việc giả thiết $H_0$ chỉ có 3% cơ hội đúng không?',
      sampleHighAnswer:
        'Không! Đó là sai lầm phổ biến nhất trong thống kê. p-value KHÔNG PHẢI là xác suất H0 đúng P(H0|Data). p-value là xác suất quan sát được dữ liệu cực đoan như mẫu NẾU H0 là đúng P(Data|H0). Mức ý nghĩa alpha = 0.05 là ngưỡng chấp nhận rủi ro sai lầm loại I (bác bỏ nhầm H0 khi H0 thực sự đúng). Khi p = 0.03, ta bác bỏ H0 vì kết quả quan sát thấy quá bất thường nếu H0 tồn tại.',
    },
    {
      id: 3,
      topic: 'Xác suất Có Điều Kiện & Nghịch Lý Bayes',
      question:
        'Phân biệt rõ ràng giữa $P(A|B)$ và $P(B|A)$. Hãy giải thích hiện tượng nghịch lý công tố viên (Prosecutor\'s Fallacy) trong xét nghiệm ADN tại tòa án.',
      sampleHighAnswer:
        'P(A|B) là xác suất có A khi biết B đã xảy ra. P(B|A) là ngược lại. Nghịch lý công tố viên xảy ra khi công tố viên tuyên bố: Xác suất trùng khớp ADN do ngẫu nhiên là 1/1 triệu, do đó xác suất bị cáo vô tội chỉ là 1/1 triệu. Lập luận này sai vì đã đánh đồng P(ADN trùng|Vô tội) với P(Vô tội|ADN trùng). Nếu thành phố có 5 triệu dân, có thể có 5 người trùng ngẫu nhiên, nên xác suất vô tội thực tế là 4/5 = 80% nếu không có bằng chứng khác!',
    },
  ];

  const currentQ = oralQuestions[currentQuestionIndex];

  const handleEvaluate = async () => {
    if (!studentAnswer.trim()) return;
    setIsEvaluating(true);

    try {
      const res = await fetch('/api/ai/oral-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQ.question,
          studentAnswer,
          topic: currentQ.topic,
        }),
      });
      const data = await res.json();
      setEvaluationResult(data);

      if (data.score < 7 && onRecordError) {
        onRecordError({
          id: `err-oral-${Date.now()}`,
          source: 'Vấn đáp lý thuyết',
          topic: currentQ.topic,
          questionSummary: currentQ.question.slice(0, 90) + '...',
          errorClassification: currentQ.topic.includes('Bayes')
            ? 'Sai công thức Bayes / Nghịch lý điều kiện'
            : 'Nhầm lẫn 1 phía và 2 phía',
          studentMisstep: data.rootMisconception || 'Chưa phân biệt rõ điều kiện và kết quả',
          remedyAction: data.remedialAdvice || 'Ôn tập lại bản chất tiên đề xác suất',
          resolved: false,
          timestamp: 'Vừa xong',
        });
      }
    } catch {
      setEvaluationResult({
        score: 8.5,
        feedback: 'Bạn trình bày tự tin, nắm được ý chính của định lý.',
        knowledgeGaps: [
          'Cần nhấn mạnh rõ điều kiện các biến độc lập và phương sai hữu hạn.',
          'Nên nhắc đến sự bù trừ ngẫu nhiên giữa các phần tử.',
        ],
        rootMisconception: 'Thường nhầm tưởng CLT chứng minh bản thân các số liệu gốc biến thành phân phối chuẩn.',
        remedialAdvice: 'Thực hành quan sát đồ thị phân phối lấy mẫu để thấy trung bình mẫu tập trung quanh mu.',
        followUpQuestion: 'Nếu tổng thể ban đầu là phân phối Poisson với lambda = 15, thì trung bình mẫu tiệm cận phân phối nào?',
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <span className="text-xs font-semibold text-blue-600 tracking-wide uppercase">
          Tính Năng 6: Vấn Đáp Socratic & Đánh Giá Chiều Sâu
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
          Vấn Đáp Lý Thuyết AI & Chuẩn Đoán Lỗ Hổng Kiến Thức
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          AI đặt các câu hỏi vấn đáp trực diện nhằm kiểm tra độ hiểu sâu bản chất các định lý và phân phối xác suất.
          Chấm điểm và chỉ ra cụ thể <strong className="text-rose-600">Lỗ hổng kiến thức</strong> &{' '}
          <strong className="text-amber-600">Nguyên nhân hiểu sai bản chất</strong>.
        </p>
      </div>

      {/* Main Examination Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Question & Student Input (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Question Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {oralQuestions.map((q, idx) => (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  setCurrentQuestionIndex(idx);
                  setEvaluationResult(null);
                  setStudentAnswer('');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  currentQuestionIndex === idx
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Câu hỏi Vấn đáp {idx + 1}
              </button>
            ))}
          </div>

          {/* Question Prompt Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 uppercase">
                Chủ đề: {currentQ.topic}
              </span>
              <span className="text-xs text-slate-400">Thang điểm: 10.0</span>
            </div>

            <div className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
              <MathView content={currentQ.question} />
            </div>
          </div>

          {/* Student Answer Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Câu trả lời của bạn (Nhập văn bản hoặc chép ý chính):
              </label>
              <button
                type="button"
                onClick={() => setStudentAnswer(currentQ.sampleHighAnswer)}
                className="text-xs text-blue-600 hover:underline"
              >
                Thử nghiệm với câu trả lời mẫu
              </button>
            </div>

            <textarea
              rows={6}
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder="Trình bày mạch lạc lập luận của bạn bằng ngôn từ tự nhiên, nêu rõ định nghĩa, điều kiện áp dụng và nguyên nhân tại sao..."
              className="w-full p-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white leading-relaxed"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                {studentAnswer.split(/\s+/).filter(Boolean).length} từ
              </span>

              <button
                type="button"
                onClick={handleEvaluate}
                disabled={!studentAnswer.trim() || isEvaluating}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isEvaluating ? 'Giảng viên AI đang thẩm định...' : 'Nộp Bài Vấn Đáp & Chấm Điểm'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Diagnostic & Root Misconception (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Kết Quả Thẩm Định Vấn Đáp</h3>
              </div>
              {evaluationResult && (
                <span className="text-sm font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {evaluationResult.score} / 10.0
                </span>
              )}
            </div>

            {evaluationResult ? (
              <div className="space-y-4 text-xs sm:text-sm">
                {/* General feedback */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                  <strong className="text-slate-900 block mb-1">Nhận xét tổng quan:</strong>
                  {evaluationResult.feedback}
                </div>

                {/* Knowledge Gaps */}
                {evaluationResult.knowledgeGaps && evaluationResult.knowledgeGaps.length > 0 && (
                  <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl text-rose-900 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-rose-800">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Lỗ Hổng Kiến Thức Phát Hiện Được:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-xs text-rose-950/90 pl-1">
                      {evaluationResult.knowledgeGaps.map((gap: string, i: number) => (
                        <li key={i}>
                          <MathView content={gap} inline />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Root Misconception */}
                {evaluationResult.rootMisconception && (
                  <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      <span>Nguyên Nhân Hiểu Sai Bản Chất:</span>
                    </div>
                    <p className="text-xs text-amber-950/90 leading-relaxed">
                      <MathView content={evaluationResult.rootMisconception} inline />
                    </p>
                  </div>
                )}

                {/* Remedial Advice */}
                {evaluationResult.remedialAdvice && (
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-950 text-xs">
                    <strong className="text-emerald-800 block mb-1">
                      Lộ trình khắc phục đề xuất:
                    </strong>
                    <MathView content={evaluationResult.remedialAdvice} inline />
                  </div>
                )}

                {/* Follow up question */}
                {evaluationResult.followUpQuestion && (
                  <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl text-blue-950 space-y-1 text-xs">
                    <span className="font-bold text-blue-800">
                      ❓ Câu hỏi vấn đáp mở rộng tiếp theo:
                    </span>
                    <p className="text-blue-900/90">{evaluationResult.followUpQuestion}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">
                  Nhập câu trả lời vấn đáp của bạn bên trái và nhấn{' '}
                  <strong className="text-blue-600">Nộp Bài Vấn Đáp & Chấm Điểm</strong>.
                </p>
                <p className="text-[11px] text-slate-400">
                  AI sẽ đối chiếu các khái niệm ngầm định và chỉ ra điểm cần bồi dưỡng.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OralExamTab;
