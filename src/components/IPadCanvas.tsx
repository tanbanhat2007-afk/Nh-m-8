import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Pen,
  Highlighter,
  Eraser,
  RotateCcw,
  RotateCw,
  Trash2,
  Download,
  Grid,
  Sparkles,
  Camera,
  Maximize2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

export type PaperGridType = 'blank' | 'math-grid' | 'ruled-lines' | 'dots';

export interface IPadCanvasProps {
  onAnalyzeWithAi?: (base64Image: string) => void;
  height?: number | string;
  readOnly?: boolean;
  initialDiagram?: 'normal_curve' | 'binomial_bars' | 'bayes_tree' | 'hypothesis_test' | null;
}

export const IPadCanvas: React.FC<IPadCanvasProps> = ({
  onAnalyzeWithAi,
  height = 560,
  initialDiagram = null,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeTool, setActiveTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [strokeColor, setStrokeColor] = useState<string>('#2563EB');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [gridType, setGridType] = useState<PaperGridType>('math-grid');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  // Setup High DPI Canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const targetWidth = rect.width;
    const targetHeight = typeof height === 'number' ? height : 560;

    canvas.width = targetWidth * dpr;
    canvas.height = targetHeight * dpr;
    canvas.style.width = `${targetWidth}px`;
    canvas.style.height = `${targetHeight}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      // Fill canvas background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Save initial blank state
      const initialSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initialSnapshot]);
      setHistoryIndex(0);
    }
  }, [height]);

  useEffect(() => {
    initCanvas();
    const handleResize = () => {
      // Don't wipe canvas on resize, simply maintain ratio if possible
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initCanvas]);

  // Save history state
  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(snapshot);
    if (newHistory.length > 25) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const targetIndex = historyIndex - 1;
      ctx.putImageData(history[targetIndex], 0, 0);
      setHistoryIndex(targetIndex);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const targetIndex = historyIndex + 1;
      ctx.putImageData(history[targetIndex], 0, 0);
      setHistoryIndex(targetIndex);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
    saveState();
  };

  // Drawing event handlers
  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const coords = getCoordinates(e);
    setIsDrawing(true);
    setLastPoint(coords);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPoint) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentCoords = getCoordinates(e);

    ctx.save();
    if (activeTool === 'pen') {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.globalAlpha = 1.0;
    } else if (activeTool === 'highlighter') {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth * 3.5;
      ctx.globalAlpha = 0.28;
    } else if (activeTool === 'eraser') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = strokeWidth * 5;
      ctx.globalAlpha = 1.0;
    }

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(currentCoords.x, currentCoords.y);
    ctx.stroke();
    ctx.restore();

    setLastPoint(currentCoords);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDrawing) {
      setIsDrawing(false);
      setLastPoint(null);
      saveState();
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Safe ignore
      }
    }
  };

  // Export current canvas to image
  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `xstk-ipad-canvas-${Date.now()}.png`;
    a.click();
  };

  // Trigger AI Tutor analysis of canvas
  const handleTriggerAi = () => {
    const canvas = canvasRef.current;
    if (!canvas || !onAnalyzeWithAi) return;
    const dataUrl = canvas.toDataURL('image/png');
    onAnalyzeWithAi(dataUrl);
  };

  // Upload external photo / PDF screenshot into canvas
  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;

        // Draw image keeping aspect ratio
        const scale = Math.min((w * 0.8) / img.width, (h * 0.8) / img.height);
        const nw = img.width * scale;
        const nh = img.height * scale;
        const ox = (w - nw) / 2;
        const oy = (h - nh) / 2;

        ctx.drawImage(img, ox, oy, nw, nh);
        saveState();
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // AI Live Diagram Drawing Engine
  const drawAiDiagram = useCallback((type: 'normal_curve' | 'binomial_bars' | 'bayes_tree' | 'hypothesis_test') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    // Reset white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);

    if (type === 'normal_curve' || type === 'hypothesis_test') {
      const centerX = w / 2;
      const baseY = h * 0.72;
      const scaleX = w * 0.12;
      const peakY = h * 0.28;
      const heightNormal = baseY - peakY;

      // Draw Axis
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w * 0.08, baseY);
      ctx.lineTo(w * 0.92, baseY);
      ctx.stroke();

      // Normal Bell Curve points
      const points: { x: number; y: number; z: number }[] = [];
      for (let z = -3.5; z <= 3.5; z += 0.05) {
        const x = centerX + z * scaleX;
        const pdf = Math.exp(-0.5 * z * z);
        const y = baseY - pdf * heightNormal;
        points.push({ x, y, z });
      }

      // If hypothesis testing, shade critical region (e.g. z > 1.645)
      if (type === 'hypothesis_test') {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
        ctx.beginPath();
        const critPoints = points.filter((p) => p.z >= 1.645);
        if (critPoints.length > 0) {
          ctx.moveTo(critPoints[0].x, baseY);
          critPoints.forEach((p) => ctx.lineTo(p.x, p.y));
          ctx.lineTo(critPoints[critPoints.length - 1].x, baseY);
          ctx.closePath();
          ctx.fill();

          // Critical line
          ctx.strokeStyle = '#DC2626';
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(critPoints[0].x, baseY);
          ctx.lineTo(critPoints[0].x, critPoints[0].y);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#DC2626';
          ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('Miền bác bỏ H₀ (α = 0.05)', critPoints[0].x + 8, baseY - 35);
          ctx.fillText('z_crit = +1.645', critPoints[0].x - 20, baseY + 20);
        }
      } else {
        // Shade ±1σ area
        ctx.fillStyle = 'rgba(37, 99, 235, 0.15)';
        ctx.beginPath();
        const std1 = points.filter((p) => p.z >= -1 && p.z <= 1);
        ctx.moveTo(std1[0].x, baseY);
        std1.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.lineTo(std1[std1.length - 1].x, baseY);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#2563EB';
        ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('68.27% (±1σ)', centerX - 35, baseY - heightNormal * 0.4);
      }

      // Draw Bell Curve Stroke
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      points.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();

      // Center Line (Mean μ)
      ctx.strokeStyle = '#0284C7';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(centerX, baseY);
      ctx.lineTo(centerX, peakY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#0F172A';
      ctx.font = '600 14px "JetBrains Mono", monospace';
      ctx.fillText('μ (Kỳ vọng)', centerX - 30, baseY + 22);
      ctx.fillText('μ - 1σ', centerX - scaleX - 25, baseY + 22);
      ctx.fillText('μ + 1σ', centerX + scaleX - 25, baseY + 22);

      // Header Tag
      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(
        type === 'hypothesis_test'
          ? 'Minh họa Miền Bác Bỏ Z-test 1 Phía (Right-tailed test)'
          : 'Đồ thị Phân phối Chuẩn Gauss N(μ, σ²)',
        w * 0.08,
        h * 0.12
      );
    } else if (type === 'binomial_bars') {
      // Binomial Distribution B(10, 0.4)
      const n = 10;
      const p = 0.4;
      const barCount = n + 1;
      const baseY = h * 0.75;
      const startX = w * 0.12;
      const barWidth = (w * 0.76) / (barCount * 1.5);
      const gap = barWidth * 0.5;

      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Phân phối Xác suất Nhị thức B(n = 10, p = 0.4)', w * 0.1, h * 0.12);

      // Combinations formula helper
      const comb = (n: number, k: number): number => {
        if (k === 0 || k === n) return 1;
        let res = 1;
        for (let i = 1; i <= k; i++) res = (res * (n - i + 1)) / i;
        return res;
      };

      for (let k = 0; k <= n; k++) {
        const prob = comb(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
        const barH = prob * h * 1.6;
        const x = startX + k * (barWidth + gap);
        const y = baseY - barH;

        // Bar gradient
        const grad = ctx.createLinearGradient(x, y, x, baseY);
        if (k === 4) {
          grad.addColorStop(0, '#06B6D4');
          grad.addColorStop(1, '#2563EB');
        } else {
          grad.addColorStop(0, '#93C5FD');
          grad.addColorStop(1, '#3B82F6');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
        ctx.fill();

        // Label
        ctx.fillStyle = '#475569';
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.fillText(`k=${k}`, x + 4, baseY + 18);
        if (k === 4) {
          ctx.fillStyle = '#0284C7';
          ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(`P(X=4)=${(prob * 100).toFixed(1)}%`, x - 14, y - 8);
        }
      }

      // Baseline
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(w * 0.08, baseY);
      ctx.lineTo(w * 0.92, baseY);
      ctx.stroke();
    } else if (type === 'bayes_tree') {
      // Tree diagram
      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Cây Xác Suất Suy Diễn Bayes (Probability Tree Diagram)', w * 0.08, h * 0.12);

      const rootX = w * 0.14;
      const rootY = h * 0.5;

      const nodeA1X = w * 0.42;
      const nodeA1Y = h * 0.32;
      const nodeA2X = w * 0.42;
      const nodeA2Y = h * 0.68;

      const leafX = w * 0.74;

      ctx.lineWidth = 2.5;

      // Branch to A1
      ctx.strokeStyle = '#2563EB';
      ctx.beginPath();
      ctx.moveTo(rootX, rootY);
      ctx.lineTo(nodeA1X, nodeA1Y);
      ctx.stroke();

      // Branch to A2
      ctx.strokeStyle = '#64748B';
      ctx.beginPath();
      ctx.moveTo(rootX, rootY);
      ctx.lineTo(nodeA2X, nodeA2Y);
      ctx.stroke();

      // Leaves from A1
      ctx.strokeStyle = '#10B981';
      ctx.beginPath();
      ctx.moveTo(nodeA1X, nodeA1Y);
      ctx.lineTo(leafX, nodeA1Y - 45);
      ctx.stroke();

      ctx.strokeStyle = '#EF4444';
      ctx.beginPath();
      ctx.moveTo(nodeA1X, nodeA1Y);
      ctx.lineTo(leafX, nodeA1Y + 45);
      ctx.stroke();

      // Leaves from A2
      ctx.strokeStyle = '#10B981';
      ctx.beginPath();
      ctx.moveTo(nodeA2X, nodeA2Y);
      ctx.lineTo(leafX, nodeA2Y - 45);
      ctx.stroke();

      ctx.strokeStyle = '#EF4444';
      ctx.beginPath();
      ctx.moveTo(nodeA2X, nodeA2Y);
      ctx.lineTo(leafX, nodeA2Y + 45);
      ctx.stroke();

      // Labels
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Bệnh D (P = 0.01)', nodeA1X + 8, nodeA1Y - 6);
      ctx.fillText('Khỏe D̄ (P = 0.99)', nodeA2X + 8, nodeA2Y + 16);

      ctx.fillStyle = '#059669';
      ctx.fillText('Dương tính (+) [Đúng]: P(+|D) = 0.99', leafX + 8, nodeA1Y - 40);
      ctx.fillStyle = '#DC2626';
      ctx.fillText('Âm tính (-) [Âm giả]: P(-|D) = 0.01', leafX + 8, nodeA1Y + 50);

      ctx.fillStyle = '#DC2626';
      ctx.fillText('Dương tính (+) [Dương giả]: P(+|D̄) = 0.05', leafX + 8, nodeA2Y - 40);
      ctx.fillStyle = '#059669';
      ctx.fillText('Âm tính (-) [Đúng]: P(-|D̄) = 0.95', leafX + 8, nodeA2Y + 50);
    }

    saveState();
  }, [saveState]);

  useEffect(() => {
    if (initialDiagram) {
      drawAiDiagram(initialDiagram);
    }
  }, [initialDiagram, drawAiDiagram]);

  // Background styling classes for iPad paper feel
  const getGridStyle = () => {
    switch (gridType) {
      case 'math-grid':
        return {
          backgroundImage:
            'linear-gradient(to right, rgba(203, 213, 225, 0.45) 1px, transparent 1px), linear-gradient(to bottom, rgba(203, 213, 225, 0.45) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        };
      case 'ruled-lines':
        return {
          backgroundImage:
            'linear-gradient(to bottom, rgba(203, 213, 225, 0.6) 1px, transparent 1px)',
          backgroundSize: '100% 28px',
        };
      case 'dots':
        return {
          backgroundImage:
            'radial-gradient(rgba(148, 163, 184, 0.6) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        };
      case 'blank':
      default:
        return { backgroundColor: '#FFFFFF' };
    }
  };

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Top iPad-style Tool Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs">
        {/* Tool Selector */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTool('pen')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTool === 'pen'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Bút mực Stylus"
          >
            <Pen className="w-3.5 h-3.5" />
            <span>Bút viết</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('highlighter')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTool === 'highlighter'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Bút dạ quang đánh dấu"
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span>Dạ quang</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('eraser')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTool === 'eraser'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Tẩy xóa nét vẽ"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Tẩy</span>
          </button>
        </div>

        {/* Color Palette (Pen/Highlighter) */}
        {activeTool !== 'eraser' && (
          <div className="flex items-center gap-1.5 bg-white px-2 py-1.5 rounded-lg border border-slate-200">
            {[
              { color: '#1E293B', title: 'Đen than' },
              { color: '#2563EB', title: 'Xanh dương' },
              { color: '#06B6D4', title: 'Xanh Cyan' },
              { color: '#DC2626', title: 'Đỏ son' },
              { color: '#16A34A', title: 'Xanh lục' },
              { color: '#F59E0B', title: 'Cam hổ phách' },
            ].map((c) => (
              <button
                key={c.color}
                type="button"
                onClick={() => setStrokeColor(c.color)}
                style={{ backgroundColor: c.color }}
                className={`w-5 h-5 rounded-full transition-transform ${
                  strokeColor === c.color ? 'scale-125 ring-2 ring-offset-1 ring-blue-500' : 'hover:scale-110'
                }`}
                title={c.title}
              />
            ))}
          </div>
        )}

        {/* Thickness slider */}
        <div className="hidden sm:flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
          <span className="text-slate-500 font-medium">Nét:</span>
          <input
            type="range"
            min={1}
            max={12}
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-16 accent-blue-600 cursor-pointer"
          />
          <span className="text-slate-700 font-mono w-4">{strokeWidth}</span>
        </div>

        {/* Grid Style Toggle */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setGridType('math-grid')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              gridType === 'math-grid' ? 'bg-slate-200 text-slate-800 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Lưới ô vuông toán học"
          >
            Ô ly
          </button>
          <button
            type="button"
            onClick={() => setGridType('ruled-lines')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              gridType === 'ruled-lines' ? 'bg-slate-200 text-slate-800 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Dòng kẻ ngang"
          >
            Kẻ ngang
          </button>
          <button
            type="button"
            onClick={() => setGridType('dots')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              gridType === 'dots' ? 'bg-slate-200 text-slate-800 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Chấm Dot Grid"
          >
            Dots
          </button>
          <button
            type="button"
            onClick={() => setGridType('blank')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              gridType === 'blank' ? 'bg-slate-200 text-slate-800 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Trang trắng trơn"
          >
            Trắng
          </button>
        </div>

        {/* Actions: Undo, Redo, Clear, Export, AI Diagrams */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded hover:bg-slate-200"
            title="Hoàn tác (Undo)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded hover:bg-slate-200"
            title="Làm lại (Redo)"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
            title="Xóa trắng bảng"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <label
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded cursor-pointer"
            title="Tải ảnh bài làm / PDF screenshot vào bảng"
          >
            <Camera className="w-4 h-4" />
            <input type="file" accept="image/*" onChange={handleUploadImage} className="hidden" />
          </label>

          <button
            type="button"
            onClick={exportImage}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded"
            title="Tải ảnh bảng vẽ về máy"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Smart Drawing Presets Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-1.5 bg-blue-50/70 border-b border-blue-100 text-xs text-blue-900">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-semibold">AI Vẽ Minh Họa Nhanh:</span>
          <button
            type="button"
            onClick={() => drawAiDiagram('normal_curve')}
            className="px-2 py-0.5 bg-white border border-blue-200 text-blue-700 rounded hover:bg-blue-100 transition-colors"
          >
            Đường cong Gauss N(μ, σ²)
          </button>
          <button
            type="button"
            onClick={() => drawAiDiagram('hypothesis_test')}
            className="px-2 py-0.5 bg-white border border-blue-200 text-blue-700 rounded hover:bg-blue-100 transition-colors"
          >
            Miền Bác Bỏ $Z$-test
          </button>
          <button
            type="button"
            onClick={() => drawAiDiagram('binomial_bars')}
            className="px-2 py-0.5 bg-white border border-blue-200 text-blue-700 rounded hover:bg-blue-100 transition-colors"
          >
            Cột Nhị Thức $B(n,p)$
          </button>
          <button
            type="button"
            onClick={() => drawAiDiagram('bayes_tree')}
            className="px-2 py-0.5 bg-white border border-blue-200 text-blue-700 rounded hover:bg-blue-100 transition-colors"
          >
            Cây Xác Suất Bayes
          </button>
        </div>

        {onAnalyzeWithAi && (
          <button
            type="button"
            onClick={handleTriggerAi}
            className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Chấm Barem & Gợi ý Hướng Đi</span>
          </button>
        )}
      </div>

      {/* Drawing Canvas Area */}
      <div
        ref={containerRef}
        style={{ height: height, ...getGridStyle() }}
        className="relative w-full cursor-crosshair touch-none select-none overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="absolute inset-0 w-full h-full"
        />
      </div>

      {/* iPad-like Bottom Indicator */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500">
        <span>Tương thích Apple Pencil / Stylus & Cảm ứng đa điểm</span>
        <div className="flex items-center gap-3">
          <span>Áp lực nét: Mượt mà</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          <span>Sẵn sàng</span>
        </div>
      </div>
    </div>
  );
};

export default IPadCanvas;
