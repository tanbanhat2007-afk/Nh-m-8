import React, { useState } from 'react';
import {
  Network,
  ChevronRight,
  ChevronDown,
  BookOpen,
  ArrowRight,
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Layers,
} from 'lucide-react';
import { xstkMindmap } from '../../data/mindmapData';
import { MindmapNode } from '../../types';
import MathView from '../MathView';

interface MindmapTabProps {
  onOpenPracticeTopic?: (topicName: string) => void;
}

export const MindmapTab: React.FC<MindmapTabProps> = ({ onOpenPracticeTopic }) => {
  const [selectedNode, setSelectedNode] = useState<MindmapNode>(
    xstkMindmap.children?.[2] || xstkMindmap
  );
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    root: true,
    'prob-foundation': true,
    'random-variables': true,
    distributions: true,
    'inferential-stats': true,
    'regression-modelling': true,
  });

  const toggleNode = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const renderTree = (node: MindmapNode, depth = 0) => {
    const isExpanded = !!expandedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNode?.id === node.id;

    return (
      <div key={node.id} className="select-none">
        <div
          onClick={() => setSelectedNode(node)}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
          className={`flex items-center gap-2 py-2 pr-3 rounded-lg cursor-pointer transition-colors text-xs sm:text-sm group ${
            isSelected
              ? 'bg-blue-600 text-white font-semibold shadow-sm'
              : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
          }`}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => toggleNode(node.id, e)}
              className={`p-1 rounded transition-colors ${
                isSelected ? 'text-white hover:bg-white/20' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          ) : (
            <span
              className={`w-2 h-2 rounded-full shrink-0 ml-1.5 ${
                isSelected ? 'bg-white' : 'bg-blue-400'
              }`}
            />
          )}

          <span className="truncate">{node.label}</span>

          {node.formula && (
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ml-auto shrink-0 hidden sm:inline ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              Công thức
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-slate-200/80 ml-4 mt-0.5 space-y-0.5">
            {node.children!.map((child) => renderTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <span className="text-xs font-semibold text-blue-600 tracking-wide uppercase">
          Tính Năng 8: Bản Đồ Tư Duy Tương Tác (Interactive Mindmap)
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
          Bản Đồ Cây Tri Thức Toàn Diện Xác Suất Thống Kê
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Trực quan hóa cấu trúc hệ thống kiến thức từ Nền tảng Xác suất, Biến ngẫu nhiên, Các họ phân phối, đến Ước lượng và Kiểm định. Nhấp vào từng nhánh để xem định nghĩa, công thức nhanh hoặc mở bài tập liên quan.
        </p>
      </div>

      {/* Main Split View: Mindmap Tree vs Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Mindmap Tree View (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col h-[600px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Cây Phân Nhánh Kiến Thức
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Nhấp để mở rộng / thu gọn</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {renderTree(xstkMindmap)}
          </div>
        </div>

        {/* Right: Selected Node Detail & Formula Hub (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
            <div className="pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono">
                {selectedNode.category}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                {selectedNode.label}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                {selectedNode.description}
              </p>
            </div>

            {/* Formula Block */}
            {selectedNode.formula ? (
              <div className="p-5 bg-slate-900 text-white rounded-xl space-y-2">
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block">
                  Công Thức Trọng Tâm (LaTeX / KaTeX)
                </span>
                <div className="text-base sm:text-lg font-mono text-emerald-300 py-1 overflow-x-auto">
                  <MathView content={`$$${selectedNode.formula}$$`} />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                Nhánh tổng quan chứa các nhánh công thức chuyên sâu con bên dưới.
              </div>
            )}

            {/* Quick Actions */}
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-semibold text-xs">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Học tập & Luyện tập Nhanh Với Nhánh Này:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenPracticeTopic && onOpenPracticeTopic(selectedNode.label)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                >
                  <span>Mở Bài Tập Luyện Tập Liên Quan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Children shortcuts if any */}
            {selectedNode.children && selectedNode.children.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Các nhánh con trực thuộc:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedNode.children.map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setSelectedNode(ch)}
                      className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-xs text-slate-800 transition-colors"
                    >
                      <span className="font-semibold block line-clamp-1">{ch.label}</span>
                      <span className="text-[11px] text-slate-500 line-clamp-1">{ch.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MindmapTab;
