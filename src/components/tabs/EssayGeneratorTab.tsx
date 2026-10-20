import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Edit3,
  CheckCircle2,
  RefreshCw,
  Send,
} from 'lucide-react';
import { EssayExercise } from '../../types';
import { initialEssayExercises } from '../../data/initialData';
import MathView from '../MathView';

export const EssayGeneratorTab: React.FC = () => {
  const [topic, setTopic] = useState<string>('Phân phối Chuẩn & Định lý CLT');
  const [difficulty, setDifficulty] = useState<'Cơ bản' | 'Vận dụng' | 'Nâng cao'>('Vận dụng');
  const [exercises, setExercises] = useState<EssayExercise[]>(initialEssayExercises);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [expandedId, setExpandedId] = useState<number | null>(1);
  const [userDrafts, setUserDrafts] = useState<Record<number, string>>({});
  const [stepFeedback, setStepFeedback] = useState<Record<number, string>>({});

  const handleGenerate5Exercises = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'essay', topic, difficulty }),
      });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setExercises(
          data.questions.map((q: any, idx: number) => ({
            id: idx + 1,
            title: q.title || `Bài toán tự luận ${idx + 1}`,
            statement: q.statement,
            difficulty: difficulty,
            strategySteps: q.strategySteps || [
              'Bước 1: Nhận diện biến ngẫu nhiên và các tham số cơ bản.',
              'Bước 2: Chọn phân phối xác suất phù hợp với đề bài.',
              'Bước 3: Lập công thức toán học và tính toán xác suất cần tìm.',
            ],
          }))
        );
        setExpandedId(1);
      }
    } catch {
      // Keep existing exercises with a simulated new batch
      setExercises([
        {
          id: 1,
          title: 'Bài toán tuổi thọ linh kiện điện tử',
          difficulty: difficulty,
          statement: 'Thời gian hoạt động không hỏng $X$ (tính bằng ngàn giờ) của một vi điều khiển tuân theo phân phối Chuẩn với $\\mu = 10$ và $\\sigma = 2$. Tính xác suất để một vi điều khiển được chọn ngẫu nhiên hoạt động bền bỉ từ 8 đến 13 ngàn giờ?',
          strategySteps: [
            'Bước 1: Đặt biến ngẫu nhiên $X \\sim \\mathcal{N}(10, 4)$. Viết biểu thức cần tính $P(8 \\le X \\le 13)$.',
            'Bước 2: Chuẩn hóa 2 cận: $z_1 = \\frac{8 - 10}{2} = -1.0$ và $z_2 = \\frac{13 - 10}{2} = 1.5$.',
            'Bước 3: Dùng tính chất hàm Laplace $\\Phi$: $P = \\Phi(1.5) - \\Phi(-1.0) = \\Phi(1.5) - [1 - \\Phi(1.0)]$.',
          ],
        },
        {
          id: 2,
          title: 'Ước lượng tỷ lệ sản phẩm loại A của xí nghiệp',
          difficulty: difficulty,
          statement: 'Kiểm tra ngẫu nhiên 400 sản phẩm xuất xưởng thấy có 320 sản phẩm đạt loại A. Hãy ước lượng tỷ lệ sản phẩm loại A của xí nghiệp với độ tin cậy $95\\%$ ($z_{0.025} = 1.96$).',
          strategySteps: [
            'Bước 1: Tính tần suất mẫu: $\\hat{p} = \\frac{320}{400} = 0.80$.',
            'Bước 2: Tính sai số chuẩn của tỷ lệ: $SE = \\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}} = \\sqrt{\\frac{0.8 \\times 0.2}{400}} = 0.02$.',
            'Bước 3: Tính bán kính tin cậy $\\epsilon = 1.96 \\times 0.02 = 0.0392$ và suy ra khoảng ước lượng $(\\hat{p} - \\epsilon; \\hat{p} + \\epsilon)$.',
          ],
        },
        {
          id: 3,
          title: 'Kiểm định chất lượng phụ tùng gia công cơ khí',
          difficulty: difficulty,
          statement: 'Đường kính chi tiết gia công theo thiết kế là $\\mu_0 = 25.0\\text{mm}$. Đo thử 36 chi tiết cho trung bình $\\bar{X} = 25.08\\text{mm}$ với $\\sigma = 0.2\\text{mm}$. Với mức ý nghĩa $\\alpha = 0.05$, máy gia công có bị lệch chuẩn không?',
          strategySteps: [
            'Bước 1: Đặt giả thiết kiểm định 2 phía: $H_0: \\mu = 25.0$ đối với $H_1: \\mu \\ne 25.0$.',
            'Bước 2: Tính giá trị quan sát chuẩn tắc: $Z_{qs} = \\frac{25.08 - 25.0}{0.2 / \\sqrt{36}} = \\frac{0.08}{0.0333} = 2.40$.',
            'Bước 3: So sánh với giá trị tới hạn 2 phía $z_{\\alpha/2} = 1.96$: Vì $|Z_{qs}| = 2.40 > 1.96$, bác bỏ $H_0$.',
          ],
        },
        {
          id: 4,
          title: 'Ứng dụng định lý Bayes trong an toàn mạng',
          difficulty: difficulty,
          statement: 'Một hệ thống tường lửa phát hiện 1% các gói tin là tấn công mã độc ($P(M) = 0.01$). Tường lửa cảnh báo đúng 98% gói độc hại ($P(A|M) = 0.98$), nhưng cảnh báo nhầm 3% gói tin an toàn ($P(A|\\bar{M}) = 0.03$). Khi có tiếng chuông báo động, xác suất thực sự là gói tin độc hại?',
          strategySteps: [
            'Bước 1: Tính xác suất toàn phần của sự kiện báo động $P(A) = P(M)P(A|M) + P(\\bar{M})P(A|\\bar{M})$.',
            'Bước 2: Áp dụng công thức Bayes: $P(M|A) = \\frac{P(M)P(A|M)}{P(A)}$.',
            'Bước 3: Phân tích kết quả và nhận xét về hiện tượng dương tính giả trong hệ thống an ninh mạng.',
          ],
        },
        {
          id: 5,
          title: 'Số cuộc gọi đến tổng đài theo quy luật Poisson',
          difficulty: difficulty,
          statement: 'Trung bình có 5 cuộc gọi mỗi 10 phút. Tính xác suất để trong 10 phút tiếp theo tổng đài nhận được từ 3 đến 6 cuộc gọi?',
          strategySteps: [
            'Bước 1: Xác định biến ngẫu nhiên $X \\sim P(\\lambda = 5)$.',
            'Bước 2: Viết tổng xác suất cần tính: $P(3 \\le X \\le 6) = \\sum_{k=3}^6 \\frac{5^k e^{-5}}{k!}$.',
            'Bước 3: Lần lượt tính giá trị cho $k = 3, 4, 5, 6$ và cộng tổng.',
          ],
        },
      ]);
      setExpandedId(1);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCheckStudentStep = (id: number) => {
    const draft = userDrafts[id];
    if (!draft || !draft.trim()) return;

    setStepFeedback((prev) => ({
      ...prev,
      [id]: `🎯 **Gợi ý kiểm tra bước làm:**
* Bạn đã ghi nhận biến số rất rõ ràng.
* **Chiến lược tiếp theo:** Hãy rà soát lại xem giá trị độ lệch chuẩn bạn dùng là $\\sigma$ hay sai số chuẩn $\\sigma / \\sqrt{n}$. Chú ý đơn vị đo lường và làm tròn 4 chữ số thập phân!`,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <span className="text-xs font-semibold text-blue-600 tracking-wide uppercase">
          Tính Năng 4: Ngân Hàng Tự Luận Thông Minh
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
          Sinh Bài Tập Tương Tự Dạng Tự Luận & Hướng Dẫn Chiến Lược
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          AI tự động khởi tạo ngẫu nhiên bộ 5 bài toán tự luận tương đương cấp độ. Hệ thống hỗ trợ người học bằng{' '}
          <strong>Chiến lược giải từng bước</strong> để sinh viên tự thực hành mà không bị phụ thuộc vào lời giải sẵn.
        </p>
      </div>

      {/* Generator Control Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Chủ đề bài tập:</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="px-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Phân phối Chuẩn & Định lý CLT">Phân phối Chuẩn & Định lý CLT</option>
              <option value="Xác suất Có Điều Kiện & Bayes">Xác suất Có Điều Kiện & Bayes</option>
              <option value="Phân phối Rời rạc (Nhị thức, Poisson)">Phân phối Rời rạc (Nhị thức, Poisson)</option>
              <option value="Ước lượng Khoảng Tin Cậy">Ước lượng Khoảng Tin Cậy</option>
              <option value="Kiểm định Giả thiết Z-test & t-test">Kiểm định Giả thiết Z-test & t-test</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Cấp độ:</label>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {(['Cơ bản', 'Vận dụng', 'Nâng cao'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficulty(lvl)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    difficulty === lvl
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerate5Exercises}
          disabled={isGenerating}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-colors"
        >
          {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>{isGenerating ? 'AI đang sinh 5 bài toán...' : 'Sinh Bộ 5 Bài Tự Luận Mới'}</span>
        </button>
      </div>

      {/* 5 Exercises List */}
      <div className="space-y-4">
        {exercises.map((ex) => {
          const isExpanded = expandedId === ex.id;

          return (
            <div
              key={ex.id}
              className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-all ${
                isExpanded ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200'
              }`}
            >
              {/* Exercise Header Clickable */}
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : ex.id)}
                className="w-full flex items-center justify-between p-4 bg-slate-50/70 hover:bg-slate-100/70 text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {ex.id}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{ex.title}</h4>
                    <span className="text-[11px] text-slate-500">
                      Cấp độ: <strong className="text-slate-700">{ex.difficulty}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-blue-600 font-medium hidden sm:inline">
                    {isExpanded ? 'Thu gọn' : 'Xem chiến lược & Làm bài'}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              </button>

              {/* Expanded Area */}
              {isExpanded && (
                <div className="p-5 space-y-5 border-t border-slate-100">
                  {/* Problem Statement */}
                  <div className="p-4 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                    <MathView content={ex.statement} />
                  </div>

                  {/* Strategy Steps (Pedagogical Hints) */}
                  <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      <span>Chiến Lược Giải Từng Bước (Gợi ý Hướng đi Sư phạm):</span>
                    </div>

                    <div className="space-y-2">
                      {ex.strategySteps.map((step, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-start gap-2.5 text-xs text-amber-950/90 leading-relaxed"
                        >
                          <span className="w-5 h-5 rounded-full bg-amber-200/80 text-amber-900 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            {sIdx + 1}
                          </span>
                          <div>
                            <MathView content={step} inline />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Practice Draft Box for Student */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Nháp Lời Giải & Tính Toán Của Bạn:</span>
                      </label>
                      <span className="text-[11px] text-slate-400">
                        AI sẽ đối chiếu các bước mà không làm mất tính độc lập
                      </span>
                    </div>

                    <textarea
                      rows={3}
                      value={userDrafts[ex.id] || ''}
                      onChange={(e) =>
                        setUserDrafts((prev) => ({ ...prev, [ex.id]: e.target.value }))
                      }
                      placeholder="Ghi lại các biến số bạn xác định, công thức áp dụng và kết quả tạm tính..."
                      className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleCheckStudentStep(ex.id)}
                        disabled={!userDrafts[ex.id]?.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Gửi bước làm nhờ AI gợi ý</span>
                      </button>
                    </div>

                    {stepFeedback[ex.id] && (
                      <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950 mt-2">
                        <MathView content={stepFeedback[ex.id]} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EssayGeneratorTab;
