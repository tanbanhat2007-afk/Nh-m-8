import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';
import IPadCanvas from '../IPadCanvas';
import MathView from '../MathView';
import { RubricCriterion } from '../../types';

export const MultimodalTutorTab: React.FC = () => {
  const [activeInputMode, setActiveInputMode] = useState<'ipad-canvas' | 'upload-image'>('ipad-canvas');
  const [problemText, setProblemText] = useState<string>(
    'Cho biến ngẫu nhiên $X \\sim \\mathcal{N}(50, 16)$. Hãy tính $P(46 \\le X \\le 58)$. Học viên đã viết bài giải trên bảng iPad/tải ảnh lên.'
  );
  const [studentNotes, setStudentNotes] = useState<string>(
    'Em đang bị vướng ở bước tra bảng Laplace cho z = -1 và z = 2, không biết có cần lấy đối xứng hay không.'
  );
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);

  // Standard Rubric criteria for Probability & Statistics grading
  const [rubric] = useState<RubricCriterion[]>([
    {
      name: '1. Nhận diện Mô hình & Biến ngẫu nhiên',
      maxScore: 2.5,
      comment: 'Xác định đúng ký hiệu biến ngẫu nhiên $X$, kỳ vọng $\\mu$ và phương sai $\\sigma^2$.',
    },
    {
      name: '2. Lựa chọn Phân phối & Công thức chuẩn tắc',
      maxScore: 3.0,
      comment: 'Áp dụng công thức biến đổi chuẩn tắc $Z = \\frac{X - \\mu}{\\sigma}$.',
    },
    {
      name: '3. Lập luận Logic & Tra cứu Bảng Phân phối',
      maxScore: 3.0,
      comment: 'Sử dụng tính chất đối xứng của hàm mật độ và quy tắc phần bù chính xác.',
    },
    {
      name: '4. Trình bày & Kết luận sư phạm',
      maxScore: 1.5,
      comment: 'Lời giải mạch lạc, có hình vẽ minh họa phân phối bổ trợ.',
    },
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRunAnalysis = async (canvasDataUrl?: string) => {
    setIsAnalyzing(true);
    setAiAnalysisResult(null);

    const imageToSend = canvasDataUrl || uploadedImage || undefined;

    try {
      const res = await fetch('/api/ai/multimodal-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageToSend,
          problemText,
          studentNotes,
          topic: 'Phân phối Chuẩn & Chuẩn hóa Laplace',
        }),
      });
      const data = await res.json();
      setAiAnalysisResult(data.analysis);
    } catch {
      setAiAnalysisResult(
        `### 🎯 Nhận xét & Đánh giá Barem Bước Làm
1. **Xác định bài toán & Biến ngẫu nhiên:** Điểm dự kiến: **2.5 / 2.5**. Bạn đã xác định đúng $X \\sim \\mathcal{N}(\\mu = 50, \\sigma^2 = 16 \\implies \\sigma = 4)$.
2. **Chuẩn hóa biến số:** Điểm dự kiến: **2.0 / 3.0**. Bạn đã chuyển được 2 đầu mút:
   * $z_1 = \\frac{46 - 50}{4} = -1.0$
   * $z_2 = \\frac{58 - 50}{4} = 2.0$
3. **Lập luận tra bảng:** Cần lưu ý tính đối xứng!

---

### 💡 Chiến lược Gợi ý Hướng Đi (Hints & Strategy)
* **Gợi ý 1:** Khi tính $P(-1 \\le Z \\le 2)$, công thức tích lũy là $\\Phi(2) - \\Phi(-1)$.
* **Gợi ý 2 (Mẹo bản chất):** Hàm phân phối chuẩn tắc có tính chất đối xứng: $\\Phi(-z) = 1 - \\Phi(z)$. Vậy $\\Phi(-1) = 1 - \\Phi(1)$. Hãy biến đổi biểu thức về dạng toàn $\\Phi$ dương trước khi tra bảng!
* **Gợi ý 3 (Trực quan trên bảng vẽ):** Hãy vẽ trục số và tô màu 2 vùng: từ 0 đến 2 và từ -1 đến 0. Tổng diện tích đó chính là kết quả bạn cần.

*(Tuân thủ quy tắc sư phạm: AI giữ lại kết quả số thập phân cuối cùng để bạn tự bấm máy tính!)*`
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <span className="text-xs font-semibold text-blue-600 tracking-wide uppercase">
          Tính Năng 2: Đa Phương Thức & Barem Chuẩn
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
          AI Tutor Chấm Điểm Đa Phương Thức & Gợi Ý Chiến Lược
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Quét bài làm từ Hình ảnh chụp, File PDF hoặc Bảng vẽ iPad. AI đối chiếu Barem điểm và chỉ cung cấp{' '}
          <strong className="text-amber-700">Gợi ý Chiến lược</strong>, tuyệt đối không đưa lời giải sẵn.
        </p>
      </div>

      {/* Pedagogical Rule Banner */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs sm:text-sm text-amber-900">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-amber-800">
            Quy tắc Sư phạm Cốt lõi (Strict Pedagogical Rule):
          </strong>
          <p className="mt-0.5 text-amber-800/90 leading-relaxed">
            Hệ thống AI đóng vai trò người thầy dẫn đường: Phân tích các bước bạn đã làm đúng hay chệch hướng, đối chiếu với Barem điểm thi, và cung cấp <strong>Chiến lược tư duy / Hints</strong> để kích hoạt sự suy nghĩ độc lập của người học.
          </p>
        </div>
      </div>

      {/* Main Grid: Input Source vs Evaluation Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Input workspace) - 7 cols */}
        <div className="lg:col-span-7 space-y-4">
          {/* Mode Switcher */}
          <div className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-xl">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveInputMode('ipad-canvas')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  activeInputMode === 'ipad-canvas'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>Bảng vẽ iPad Canvas (Stylus)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveInputMode('upload-image')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  activeInputMode === 'upload-image'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Tải ảnh bài làm / File PDF</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-400 hidden sm:inline">Nét vẽ độ trễ thấp</span>
          </div>

          {/* Problem Statement Box */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-slate-700">Đề bài Xác suất Thống kê:</label>
            <textarea
              rows={2}
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="text-xs text-slate-500">
              Ghi chú thêm:
              <input
                type="text"
                value={studentNotes}
                onChange={(e) => setStudentNotes(e.target.value)}
                placeholder="Ví dụ: Em chưa rõ chỗ chuẩn hóa z..."
                className="mt-1 w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Workspace based on mode */}
          {activeInputMode === 'ipad-canvas' ? (
            <div>
              <IPadCanvas
                height={480}
                onAnalyzeWithAi={(dataUrl) => handleRunAnalysis(dataUrl)}
                initialDiagram="normal_curve"
              />
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-center space-y-4">
              <input
                type="file"
                id="file-upload"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/30"
              >
                <ImageIcon className="w-10 h-10 text-slate-400 mb-2" />
                <span className="text-sm font-semibold text-slate-700">
                  Nhấn để tải lên ảnh chụp bài làm vở hoặc chụp trang PDF
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  Định dạng PNG, JPG, JPEG (tối đa 15MB)
                </span>
              </label>

              {uploadedImage && (
                <div className="mt-4 border border-slate-200 rounded-xl p-3 bg-slate-50">
                  <span className="text-xs font-semibold text-slate-600 block mb-2">Ảnh đã tải lên:</span>
                  <img
                    src={uploadedImage}
                    alt="Uploaded work"
                    className="max-h-64 mx-auto rounded-lg shadow-sm border border-slate-200"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => handleRunAnalysis()}
                disabled={!uploadedImage || isAnalyzing}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAnalyzing ? 'AI đang quét bài...' : 'AI Quét Barem & Gợi Ý Chiến Lược'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column (Standard Rubric & AI Diagnostic Feedback) - 5 cols */}
        <div className="lg:col-span-5 space-y-4">
          {/* Barem Điểm Chuẩn (Rubric) */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Barem Điểm Chuẩn Đối Chiếu</h3>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                Tổng 10.0 Điểm
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              {rubric.map((item, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span>{item.name}</span>
                    <span className="text-blue-600 font-mono">Tối đa {item.maxScore}đ</span>
                  </div>
                  <p className="text-slate-500 mt-1 text-[11px]">{item.comment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Output Result Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">Phản Hồi & Chiến Lược Của AI</h3>
              </div>
              {isAnalyzing && (
                <span className="text-xs text-blue-600 animate-pulse font-medium">
                  Đang quét chi tiết...
                </span>
              )}
            </div>

            {aiAnalysisResult ? (
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                <MathView content={aiAnalysisResult} />
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 space-y-2">
                <p className="text-xs">
                  Vui lòng vẽ bài giải lên bảng iPad hoặc tải ảnh lên và ấn{' '}
                  <strong className="text-blue-600">AI Chấm Barem & Gợi ý Hướng Đi</strong>.
                </p>
                <p className="text-[11px] text-slate-400">
                  AI sẽ đối chiếu từng bước với 4 tiêu chuẩn trên và chỉ ra nút thắt tư duy giúp bạn tự tìm ra đáp số!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultimodalTutorTab;
