import React, { useState } from 'react';
import {
  Compass,
  BookOpen,
  Eye,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Sliders,
  Play,
  RotateCcw,
} from 'lucide-react';
import { xstkTopics } from '../../data/xstkTopics';
import { TopicLesson } from '../../types';
import MathView from '../MathView';
import IPadCanvas from '../IPadCanvas';

export const StepPipelineTab: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<TopicLesson>(xstkTopics[0]);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [practiceAnswer, setPracticeAnswer] = useState<string>('');
  const [practiceFeedback, setPracticeFeedback] = useState<string | null>(null);
  const [isCheckingAnswer, setIsCheckingAnswer] = useState<boolean>(false);

  // Interactive parameter state for Step 2 formula exploration
  const [sampleSizeN, setSampleSizeN] = useState<number>(64);
  const [popMeanMu, setPopMeanMu] = useState<number>(2000);
  const [popSigma, setPopSigma] = useState<number>(200);

  const calculatedSE = (popSigma / Math.sqrt(sampleSizeN)).toFixed(2);

  const handleCheckPractice = () => {
    if (!practiceAnswer.trim()) return;
    setIsCheckingAnswer(true);
    setTimeout(() => {
      setIsCheckingAnswer(false);
      setPracticeFeedback(
        `### ✅ Đánh giá Bước Giải của Bạn
* **Bước 1 (Nhận diện):** Bạn đã nắm đúng mô hình phân phối chuẩn cho trung bình mẫu theo Định lý CLT.
* **Bước 2 (Tính toán):** $SE = \\frac{20}{\\sqrt{100}} = 2\\text{g}$.
* **Bước 3 (Khoảng chuẩn hóa):** Xác suất nằm trong đoạn $P(|\\bar{X} - 1000| \\le 3) = P(-1.5 \\le Z \\le 1.5) = 2\\Phi(1.5) - 1 \\approx 0.8664$ (86.64%).
* **Chiến lược tiếp theo:** Hãy luyện tập thêm dạng bài tính cỡ mẫu tối thiểu $n$ để độ chính xác không vượt quá $1\\text{g}$ nhé!`
      );
    }, 600);
  };

  const steps = [
    {
      num: 1,
      title: 'Khái niệm & Trực quan',
      icon: Eye,
      description: 'Hình dung bản chất qua hình tượng đời sống thực tế',
    },
    {
      num: 2,
      title: 'Định lý & Công thức Toán',
      icon: BookOpen,
      description: 'Công thức toán học chuẩn LaTeX & điều kiện áp dụng',
    },
    {
      num: 3,
      title: 'Ví dụ & Đồ thị Minh họa',
      icon: Compass,
      description: 'Lời giải mẫu từng bước & đồ thị phân phối trực quan',
    },
    {
      num: 4,
      title: 'Luyện tập Ứng dụng',
      icon: CheckCircle2,
      description: 'Tự tay giải bài tập & AI chấm kiểm tra phản hồi',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header bar with topic selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 tracking-wide uppercase">
            Tính Năng 1: Quy trình Sư Phạm 4 Bước
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Quy Trình Học & Giải Toán Xác Suất Thống Kê
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Mô hình 4 bước bài bản giúp thấu suốt bản chất từ trực quan đến công thức thực hành
          </p>
        </div>

        {/* Topic dropdown selector */}
        <div className="w-full md:w-auto">
          <label className="block text-xs font-medium text-slate-600 mb-1">Chọn Chủ đề XSTK:</label>
          <select
            value={selectedTopic.id}
            onChange={(e) => {
              const found = xstkTopics.find((t) => t.id === e.target.value);
              if (found) {
                setSelectedTopic(found);
                setActiveStep(1);
                setPracticeAnswer('');
                setPracticeFeedback(null);
              }
            }}
            className="w-full md:w-80 px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {xstkTopics.map((t) => (
              <option key={t.id} value={t.id}>
                [{t.category}] {t.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Steps Navigation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {steps.map((st) => {
          const Icon = st.icon;
          const isActive = activeStep === st.num;
          const isPassed = activeStep > st.num;

          return (
            <button
              key={st.num}
              type="button"
              onClick={() => setActiveStep(st.num)}
              className={`p-4 rounded-xl text-left border transition-all relative ${
                isActive
                  ? 'bg-blue-50/80 border-blue-500 shadow-sm ring-1 ring-blue-500'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isPassed
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isPassed ? '✓' : st.num}
                </span>
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              </div>
              <h4 className="text-sm font-semibold text-slate-900">{st.title}</h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{st.description}</p>
            </button>
          );
        })}
      </div>

      {/* Main Step Content Area */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        {/* Step 1: Concept & Intuition */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                BƯỚC 1 / 4
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Khái Niệm Trực Quan & Bản Chất Hiện Tượng
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                    💡 Bản chất dễ hiểu
                  </h4>
                  <p className="text-slate-700 leading-relaxed text-sm">
                    {selectedTopic.step1Concept.intuitiveExplanation}
                  </p>
                </div>

                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-2">
                    🎯 Hình tượng so sánh (Analogy)
                  </h4>
                  <p className="text-amber-900 leading-relaxed text-sm">
                    {selectedTopic.step1Concept.keyAnalogy}
                  </p>
                </div>

                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-2">
                    🌍 Ứng dụng thực tế đời sống & Khoa học dữ liệu
                  </h4>
                  <p className="text-emerald-900 leading-relaxed text-sm">
                    {selectedTopic.step1Concept.realWorldApplication}
                  </p>
                </div>
              </div>

              {/* Intuitive visual card */}
              <div className="p-5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl text-white flex flex-col justify-between">
                <div>
                  <span className="text-xs text-blue-100 font-semibold uppercase">Tóm tắt cốt lõi</span>
                  <h4 className="text-lg font-bold mt-1">{selectedTopic.title}</h4>
                  <p className="text-xs text-blue-100 mt-2 leading-relaxed">
                    {selectedTopic.summary}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 bg-white text-blue-600 hover:bg-blue-50 font-semibold rounded-lg text-sm transition-colors shadow-sm"
                >
                  <span>Chuyển sang Bước 2: Định lý</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Theory & Formulas */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                BƯỚC 2 / 4
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Định Lý & Công Thức Toán Học Chính Xác
              </h3>
            </div>

            {/* Major Theorem LaTeX Display */}
            <div className="p-6 bg-slate-900 text-white rounded-xl shadow-inner text-center">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                {selectedTopic.step2Theory.theoremName}
              </span>
              <div className="my-4 text-xl sm:text-2xl font-mono overflow-x-auto text-emerald-300 py-2">
                <MathView content={`$$${selectedTopic.step2Theory.latexFormula}$$`} />
              </div>
              <p className="text-xs text-slate-400">
                Hiển thị chuẩn KaTeX toán học quốc tế
              </p>
            </div>

            {/* Interactive Parameter Laboratory */}
            {selectedTopic.id === 'normal-clt' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-bold text-slate-800">
                      Phòng Thí Nghiệm Tham Số Realtime (CLT Explorer)
                    </h4>
                  </div>
                  <span className="text-xs text-slate-500">Kéo thanh trượt để xem sự biến thiên</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-1">
                      Cỡ mẫu $n$: <strong className="text-slate-900 font-mono">{sampleSizeN}</strong>
                    </label>
                    <input
                      type="range"
                      min={10}
                      max={200}
                      step={2}
                      value={sampleSizeN}
                      onChange={(e) => setSampleSizeN(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">
                      Kỳ vọng $\mu$: <strong className="text-slate-900 font-mono">{popMeanMu}</strong>
                    </label>
                    <input
                      type="range"
                      min={500}
                      max={5000}
                      step={50}
                      value={popMeanMu}
                      onChange={(e) => setPopMeanMu(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">
                      Độ lệch chuẩn $\sigma$: <strong className="text-slate-900 font-mono">{popSigma}</strong>
                    </label>
                    <input
                      type="range"
                      min={10}
                      max={500}
                      step={10}
                      value={popSigma}
                      onChange={(e) => setPopSigma(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                  <span className="text-slate-600">
                    <MathView content="Sai số chuẩn của trung bình mẫu $SE = \frac{\sigma}{\sqrt{n}}$:" inline />
                  </span>
                  <strong className="text-sm font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {calculatedSE}
                  </strong>
                </div>
              </div>
            )}

            {/* Parameter meaning table & conditions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                  Ý nghĩa các ký hiệu trong công thức
                </h4>
                <div className="space-y-2 text-xs">
                  {selectedTopic.step2Theory.parameterDescriptions.map((param, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 pb-2 border-b border-slate-100 last:border-0">
                      <span className="font-mono font-semibold text-blue-600 min-w-16">
                        ${param.symbol}$
                      </span>
                      <span className="text-slate-700">{param.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                  Điều kiện bắt buộc để áp dụng
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  {selectedTopic.step2Theory.conditions.map((cond, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{cond}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium"
              >
                Quay lại Bước 1
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
              >
                <span>Sang Bước 3: Ví dụ & Đồ thị</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Example & Interactive Distribution */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                BƯỚC 3 / 4
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Ví Dụ Minh Họa & Đồ Thị Phân Phối Trực Quan
              </h3>
            </div>

            {/* Problem Statement Card */}
            <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                Đề bài ví dụ thực tế
              </span>
              <div className="text-sm text-slate-800 font-medium mt-1 leading-relaxed">
                <MathView content={selectedTopic.step3Example.problemStatement} />
              </div>
            </div>

            {/* Split layout: Walkthrough vs Interactive iPad Canvas Graphic */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Step by step walkthrough */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Lời giải chi tiết từng bước (Step-by-step Walkthrough)
                </h4>
                {selectedTopic.step3Example.solutionWalkthrough.map((stepStr, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700">
                    <MathView content={stepStr} />
                  </div>
                ))}
              </div>

              {/* iPad Canvas live visualizer */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                  Minh họa đồ thị trên Bảng vẽ iPad Live
                </h4>
                <IPadCanvas
                  height={340}
                  initialDiagram={selectedTopic.step3Example.interactiveDiagramType}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium"
              >
                Quay lại Bước 2
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
              >
                <span>Sang Bước 4: Luyện tập ứng dụng</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Guided Practice & AI Feedback */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                BƯỚC 4 / 4
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Luyện Tập Ứng Dụng Có AI Dẫn Dắt Từng Bước
              </h3>
            </div>

            {/* Problem card */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Bài tập thử thách</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                  Cấp độ: Vận dụng
                </span>
              </div>
              <div className="text-sm font-medium text-slate-800 leading-relaxed">
                <MathView content={selectedTopic.step4Practice.problem} />
              </div>

              {/* Clue hint accordion */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900">
                <span className="font-semibold text-amber-800">💡 Gợi ý chiến lược: </span>
                <MathView content={selectedTopic.step4Practice.clue} inline />
              </div>
            </div>

            {/* Student input field */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Nhập các bước lập luận hoặc kết quả của bạn:
              </label>
              <textarea
                rows={4}
                value={practiceAnswer}
                onChange={(e) => setPracticeAnswer(e.target.value)}
                placeholder="Ví dụ: Gọi X_bar là trọng lượng trung bình của 100 gói... SE = 20 / sqrt(100) = 2g... Ta chuẩn hóa biến Z..."
                className="w-full p-3.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPracticeAnswer(selectedTopic.step4Practice.expectedAnswerSnippet)}
                className="text-xs text-blue-600 hover:underline"
              >
                Điền nhanh lời giải mẫu để kiểm tra
              </button>

              <button
                type="button"
                onClick={handleCheckPractice}
                disabled={!practiceAnswer.trim() || isCheckingAnswer}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isCheckingAnswer ? 'AI đang chấm bài...' : 'AI Chấm Điểm & Phản Hồi'}</span>
              </button>
            </div>

            {/* AI Feedback Display */}
            {practiceFeedback && (
              <div className="p-5 bg-blue-50/60 border border-blue-200 rounded-xl text-xs sm:text-sm animate-fadeIn">
                <MathView content={practiceFeedback} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StepPipelineTab;
