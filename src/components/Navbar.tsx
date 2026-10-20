import React, { useState } from 'react';
import {
  Compass,
  FileCheck2,
  Mic,
  FileText,
  HelpCircle,
  Brain,
  BarChart3,
  Network,
  MessageSquare,
  User,
  Sparkles,
  Menu,
  X,
  Sigma,
} from 'lucide-react';
import { TabType } from '../types';
import VoiceSearchBar from './VoiceSearchBar';

interface NavbarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  errorCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, errorCount }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: TabType; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'pipeline', label: '1. Quy trình 4 Bước', icon: Compass },
    { id: 'multimodal', label: '2. AI Tutor Chấm Điểm', icon: FileCheck2 },
    { id: 'voice-canvas', label: '3. Giọng Nói & iPad Live', icon: Mic },
    { id: 'essay', label: '4. Sinh Bài Tự Luận', icon: FileText },
    { id: 'mcq', label: '5. Trắc Nghiệm & "Tại sao?"', icon: HelpCircle },
    { id: 'oral-exam', label: '6. Vấn Đáp Lý Thuyết AI', icon: Brain },
    {
      id: 'error-analytics',
      label: '7. Phân Tích Lỗi Sai',
      icon: BarChart3,
      badge: errorCount > 0 ? `${errorCount}` : undefined,
    },
    { id: 'mindmap', label: '8. Bản Đồ Tư Duy', icon: Network },
    { id: 'forum', label: '9. Diễn Đàn & Trợ Giảng', icon: MessageSquare },
    { id: 'profile', label: '10. Hồ Sơ Cá Nhân', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sigma className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">ProbStat AI</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                EdTech v2.5
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Nền tảng Học tập & Luyện thi Xác suất Thống kê Thông minh
            </p>
          </div>
        </div>

        {/* Voice Search & Status */}
        <div className="flex items-center gap-3">
          <VoiceSearchBar onNavigateTab={onSelectTab} />

          <div className="hidden md:flex items-center gap-2 border-l border-slate-200 pl-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              NT
            </div>
            <div className="flex flex-col text-left">
              <span className="font-semibold text-slate-800 text-xs leading-none">Nhật Tân</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Sinh viên K68</span>
            </div>
          </div>

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Feature Tabs Ribbon */}
      <div className="border-t border-slate-100 bg-slate-50/60 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 py-1.5 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-1 shadow-lg animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

export default Navbar;
