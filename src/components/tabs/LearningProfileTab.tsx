import React, { useState } from 'react';
import {
  User,
  Award,
  Zap,
  Target,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  BookOpen,
} from 'lucide-react';
import { initialSkillMatrix } from '../../data/initialData';
import { UserSkillMatrix } from '../../types';
import MathView from '../MathView';

interface LearningProfileTabProps {
  onStartRemedialExercise?: (topic: string) => void;
}

export const LearningProfileTab: React.FC<LearningProfileTabProps> = ({
  onStartRemedialExercise,
}) => {
  const [skills] = useState<UserSkillMatrix[]>(initialSkillMatrix);

  // Overall competency score
  const overallAvg = Math.round(
    skills.reduce((acc, curr) => acc + curr.score, 0) / skills.length
  );

  const persistentPitfalls = [
    {
      title: 'Bẫy chia đôi mức ý nghĩa α trong Kiểm định',
      frequency: 'Thường gặp trong 3/5 bài gần nhất',
      description:
        'Thường nhầm lẫn áp dụng kiểm định 2 phía ($z_{\\alpha/2} = 1.96$) ngay cả khi đề bài đã khẳng định rõ chiều hướng ("kém hơn", "giảm sút", "nhiều hơn").',
      remedy:
        'Hãy thuộc lòng bảng đối chiếu: Dấu của H1 quyết định vị trí miền bác bỏ: H1: μ < μ0 -> miền trái, H1: μ > μ0 -> miền phải, H1: μ ≠ μ0 -> chia 2 bên.',
    },
    {
      title: 'Nhầm lẫn giữa Độ lệch chuẩn σ và Sai số chuẩn SE',
      frequency: 'Thường gặp trong bài toán CLT và Khoảng tin cậy',
      description:
        'Khi tính xác suất cho trung bình mẫu hoặc tổng n phần tử, quên chia/nhân với $\\sqrt{n}$.',
      remedy:
        'Nguyên tắc vàng: Tổng thể phân tán theo $\\sigma$, nhưng Trung bình mẫu luôn gom chặt hơn quanh $\\mu$ với độ phân tán là $\\sigma / \\sqrt{n}$.',
    },
  ];

  const personalizedRecommendations = [
    {
      topic: 'Kiểm định Giả thiết 1 phía vs 2 phía',
      priority: 'Ưu tiên cao',
      badge: 'Bổ trợ cấp bách',
      reason: 'Điểm kỹ năng trụ cột này đang ở mức 62/100, cần củng cố trước kỳ thi giữa kỳ.',
    },
    {
      topic: 'Tính toán hàm tích lũy Laplace Φ(z)',
      priority: 'Ưu tiên vừa',
      badge: 'Rèn luyện tốc độ',
      reason: 'Đã nắm bản chất nhưng tốc độ tra bảng và xử lý số âm còn chậm.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <span className="text-xs font-semibold text-blue-600 tracking-wide uppercase">
          Tính Năng 10: Hồ Sơ Cá Nhân Hóa & Trí Tuệ Thích Ứng
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
          Hồ Sơ Học Tập AI Cá Nhân Hóa & Ma Trận Năng Lực
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Theo dõi lịch sử rèn luyện, phân tích đa chiều ma trận kỹ năng cá nhân, nhận diện các lỗi sai cố hữu và đề xuất bài tập bổ trợ thích ứng riêng cho bạn.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-2xl font-bold font-mono">
              XSTK
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold">Nguyễn Nhật Tân (K68 - CNTT)</h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Mục tiêu: Đạt điểm A môn Xác suất Thống kê & Chuẩn bị Phân tích Dữ liệu AI
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="bg-white/20 px-2.5 py-0.5 rounded-full">Đã làm: 68 bài tập</span>
                <span className="bg-white/20 px-2.5 py-0.5 rounded-full">Chuỗi học tập: 12 ngày liên tục</span>
              </div>
            </div>
          </div>

          <div className="bg-white/15 border border-white/20 p-4 rounded-xl text-center sm:min-w-36">
            <span className="text-xs text-blue-100 font-medium">Chỉ số Năng lực XSTK</span>
            <div className="text-3xl font-bold font-mono mt-0.5">{overallAvg} / 100</div>
            <span className="text-[11px] text-emerald-300 font-semibold">Trình độ: Khá - Giỏi</span>
          </div>
        </div>
      </div>

      {/* Skill Matrix - 6 Pillars */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Ma Trận 6 Trụ Cột Năng Lực Xác Suất Thống Kê
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Cập nhật qua AI Diagnostics</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((s, idx) => {
            let statusColor = 'text-blue-600 bg-blue-50';
            if (s.status === 'Xuất sắc') statusColor = 'text-emerald-700 bg-emerald-50';
            if (s.status === 'Yếu') statusColor = 'text-rose-700 bg-rose-50';

            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{s.pillar}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${statusColor}`}>
                      {s.status}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-bold font-mono text-slate-900">{s.score}</span>
                    <span className="text-xs text-slate-400">/ 100</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
                    <div
                      style={{ width: `${s.score}%` }}
                      className={`h-full rounded-full ${
                        s.score >= 80 ? 'bg-emerald-500' : s.score >= 70 ? 'bg-blue-600' : 'bg-rose-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                  <strong className="text-slate-700">Đề xuất: </strong>
                  {s.recommendedTopic}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Split: Persistent Pitfalls vs Personalized Remedial Exercises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Persistent Pitfalls */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Nhận Diện Lỗi Sai Cố Hữu Của Cá Nhân (Persistent Pitfalls)
            </h3>
          </div>

          <div className="space-y-3">
            {persistentPitfalls.map((pit, idx) => (
              <div key={idx} className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-amber-900">
                  <span>{pit.title}</span>
                  <span className="text-[10px] bg-amber-100 px-2 py-0.5 rounded-full text-amber-800">
                    {pit.frequency}
                  </span>
                </div>
                <div className="text-amber-950/90 leading-relaxed">
                  <MathView content={pit.description} />
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-amber-200/80 text-amber-900">
                  <strong className="text-amber-800 block mb-0.5">Biện pháp khắc phục:</strong>
                  <MathView content={pit.remedy} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Adaptive Remedial Exercises */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Target className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Bài Tập Bổ Trợ Cá Nhân Hóa Đề Xuất (Adaptive Remediation)
            </h3>
          </div>

          <div className="space-y-3">
            {personalizedRecommendations.map((rec, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>{rec.topic}</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                    {rec.badge}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{rec.reason}</p>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onStartRemedialExercise && onStartRemedialExercise(rec.topic)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                  >
                    <span>Luyện tập ngay chuyên đề này</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningProfileTab;
