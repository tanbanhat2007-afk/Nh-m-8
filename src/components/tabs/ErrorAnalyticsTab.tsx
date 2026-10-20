import React, { useState } from 'react';
import {
  AlertCircle,
  TrendingDown,
  CheckCircle,
  Filter,
  ArrowRight,
  BookMarked,
  Sparkles,
  BarChart2,
  PieChart,
  Check,
} from 'lucide-react';
import { ErrorLogItem } from '../../types';
import MathView from '../MathView';

interface ErrorAnalyticsTabProps {
  errorLogs: ErrorLogItem[];
  onToggleResolve?: (id: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const ErrorAnalyticsTab: React.FC<ErrorAnalyticsTabProps> = ({
  errorLogs,
  onToggleResolve,
  onNavigateTab,
}) => {
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter errors
  const filteredErrors = errorLogs.filter((item) => {
    if (selectedSource !== 'all' && item.source !== selectedSource) return false;
    if (selectedCategory !== 'all' && item.errorClassification !== selectedCategory) return false;
    return true;
  });

  // Calculate stats by source
  const countOral = errorLogs.filter((e) => e.source === 'Vấn đáp lý thuyết').length;
  const countMcq = errorLogs.filter((e) => e.source === 'Trắc nghiệm').length;
  const countEssay = errorLogs.filter((e) => e.source === 'Tự luận').length;
  const resolvedCount = errorLogs.filter((e) => e.resolved).length;

  // Group by category for diagnostic breakdown
  const categoryCounts = errorLogs.reduce((acc, curr) => {
    acc[curr.errorClassification] = (acc[curr.errorClassification] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categories = Object.keys(categoryCounts);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <span className="text-xs font-semibold text-blue-600 tracking-wide uppercase">
          Tính Năng 7: Tổng Hợp & Phân Tích Lỗi Sai Đa Nguồn
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
          Bảng Phân Tích & Gom Nhóm Lỗi Sai Tổng Hợp (Error Diagnostic)
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Tự động thống kê các bài tập làm sai từ cả 3 nguồn: <strong>Vấn đáp</strong>,{' '}
          <strong>Trắc nghiệm</strong> và <strong>Tự luận</strong>. Đưa ra phân tích chuyên sâu và lộ trình khắc phục cụ thể cho từng lỗi.
        </p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Tổng số lỗi ghi nhận</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">{errorLogs.length}</div>
          <span className="text-[11px] text-slate-400">Từ cả 3 kênh học tập</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-blue-600 font-medium">Từ Trắc Nghiệm</span>
          <div className="text-2xl font-bold text-blue-600 font-mono mt-1">{countMcq}</div>
          <span className="text-[11px] text-slate-400">Lỗi bẫy đề thi & công thức</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-amber-600 font-medium">Từ Vấn Đáp Lý Thuyết</span>
          <div className="text-2xl font-bold text-amber-600 font-mono mt-1">{countOral}</div>
          <span className="text-[11px] text-slate-400">Lỗi hiểu sai bản chất định lý</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-emerald-600 font-medium">Đã khắc phục thành công</span>
          <div className="text-2xl font-bold text-emerald-600 font-mono mt-1">{resolvedCount}</div>
          <span className="text-[11px] text-emerald-600">
            Đạt {errorLogs.length > 0 ? Math.round((resolvedCount / errorLogs.length) * 100) : 0}% lộ trình
          </span>
        </div>
      </div>

      {/* Diagnostic Category Distribution Chart & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Distribution Breakdown (1 col) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Phân Bố Theo Nhóm Lỗi
            </h3>
            <BarChart2 className="w-4 h-4 text-blue-600" />
          </div>

          <div className="space-y-3">
            {categories.map((cat) => {
              const count = categoryCounts[cat];
              const pct = Math.round((count / errorLogs.length) * 100);

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-medium line-clamp-1">{cat}</span>
                    <span className="font-mono text-slate-500">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
            <strong>Nhận định tổng quát từ AI:</strong> Bạn có xu hướng mắc lỗi nhiều nhất ở nhóm{' '}
            <strong className="text-blue-700">&ldquo;Nhầm lẫn 1 phía và 2 phía trong kiểm định&rdquo;</strong>.
            Cần rèn luyện thói quen gạch chân từ khóa trong đề trước khi tra bảng tới hạn.
          </div>
        </div>

        {/* Right: Remediation Action Plan & Errors Table (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-600">Lọc theo nguồn:</span>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Tất cả các nguồn</option>
                <option value="Trắc nghiệm">Trắc nghiệm</option>
                <option value="Vấn đáp lý thuyết">Vấn đáp lý thuyết</option>
                <option value="Tự luận">Tự luận</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600">Nhóm lỗi:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-44"
              >
                <option value="all">Tất cả nhóm lỗi</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* List of Error Items */}
          <div className="space-y-3">
            {filteredErrors.map((err) => (
              <div
                key={err.id}
                className={`bg-white border rounded-xl p-4 shadow-sm space-y-3 transition-all ${
                  err.resolved ? 'border-slate-200 opacity-75' : 'border-rose-200 bg-rose-50/15'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        err.source === 'Trắc nghiệm'
                          ? 'bg-blue-100 text-blue-800'
                          : err.source === 'Vấn đáp lý thuyết'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {err.source}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">[{err.topic}]</span>
                    <span className="text-[11px] text-slate-400">{err.timestamp}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleResolve && onToggleResolve(err.id)}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      err.resolved
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{err.resolved ? 'Đã khắc phục' : 'Đánh dấu đã hiểu'}</span>
                  </button>
                </div>

                <div className="text-xs sm:text-sm font-semibold text-slate-800">
                  <MathView content={err.questionSummary} />
                </div>

                {/* Misstep & Actionable Remedy */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-rose-50/80 border border-rose-200/80 rounded-lg text-rose-950">
                    <strong className="text-rose-800 block mb-0.5">⚠️ Bước làm chệch hướng:</strong>
                    <MathView content={err.studentMisstep} />
                  </div>

                  <div className="p-2.5 bg-emerald-50/80 border border-emerald-200/80 rounded-lg text-emerald-950">
                    <strong className="text-emerald-800 block mb-0.5">💡 Lộ trình khắc phục cụ thể:</strong>
                    <MathView content={err.remedyAction} />
                  </div>
                </div>
              </div>
            ))}

            {filteredErrors.length === 0 && (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-slate-400 text-xs">
                Không tìm thấy lỗi sai nào trong bộ lọc hiện tại.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorAnalyticsTab;
