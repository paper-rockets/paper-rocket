import React, { useState, useRef, useEffect, useSyncExternalStore } from 'react';
import {
  subscribeFps,
  getFps,
  subscribeInputTelemetry,
  getInputTelemetry,
  resetPeakLag,
  InputTelemetry,
} from '../core/telemetryStore';
import { Activity, Zap, Cpu, MousePointer, RefreshCw, X, ChevronUp } from 'lucide-react';

interface FpsCounterProps {
  uiScale?: number;
}

/**
 * High-Performance Interactive Input Lag & Telemetry Debug HUD
 *
 * Subscribes as a leaf node to high-frequency telemetry without triggering
 * React root re-renders. Provides microsecond-level hardware queue latency,
 * stroke processing duration, and a live input jitter sparkline.
 */
const FpsCounterComponent: React.FC<FpsCounterProps> = ({ uiScale = 1.0 }) => {
  const fps = useSyncExternalStore(subscribeFps, getFps, getFps);
  const inputData = useSyncExternalStore(
    subscribeInputTelemetry,
    getInputTelemetry,
    getInputTelemetry
  );

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render live jitter sparkline on canvas
  useEffect(() => {
    if (!isExpanded || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Draw background grid lines (8ms and 16.6ms thresholds)
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;

    // 16.6ms line (60fps budget)
    const y16 = h - (16.6 / 40) * h;
    ctx.beginPath();
    ctx.moveTo(0, y16);
    ctx.lineTo(w, y16);
    ctx.stroke();

    // 8.3ms line (120fps budget)
    const y8 = h - (8.3 / 40) * h;
    ctx.beginPath();
    ctx.moveTo(0, y8);
    ctx.lineTo(w, y8);
    ctx.stroke();

    const history = inputData.history || [];
    if (history.length < 2) return;

    // Draw latency area & line
    ctx.beginPath();
    const step = w / (history.length - 1);

    history.forEach((val, i) => {
      const x = i * step;
      const normalized = Math.min(1, val / 40); // 40ms max scale
      const y = h - normalized * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.strokeStyle = inputData.inputLagMs > 20 ? '#f43f5e' : inputData.inputLagMs > 10 ? '#f59e0b' : '#10b981';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [isExpanded, inputData]);

  // Color rating helpers
  const getLagColor = (ms: number) => {
    if (ms <= 8) return 'text-emerald-400';
    if (ms <= 18) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getFpsColor = (val: number) => {
    if (val >= 55) return 'text-emerald-400';
    if (val >= 30) return 'text-amber-400';
    return 'text-rose-400';
  };

  const statusDotColor =
    fps >= 55 && inputData.inputLagMs <= 12
      ? 'bg-emerald-400'
      : fps >= 30 && inputData.inputLagMs <= 25
        ? 'bg-amber-400'
        : 'bg-rose-400';

  return (
    <div
      style={{
        transform: uiScale !== 1.0 ? `scale(${uiScale})` : undefined,
        transformOrigin: 'bottom left',
      }}
      className="fixed bottom-3 left-3 sm:bottom-4 sm:left-4 z-30 select-none font-sans"
    >
      {!isExpanded ? (
        /* COMPACT PILL (TAP TO EXPAND INPUT LAG DEBUG HUD) */
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="px-2.5 py-1 rounded-xl bg-[#141519] border border-zinc-800 text-[10.5px] font-mono text-zinc-300 shadow-xl flex items-center gap-2 hover:border-zinc-700 hover:bg-[#1a1b21] transition-all cursor-pointer group"
          title="Click to open Input Lag & Hardware Telemetry Debug HUD"
        >
          <span className={`w-2 h-2 rounded-full ${statusDotColor} animate-pulse shrink-0`} />
          <span className={`font-semibold ${getFpsColor(fps)}`}>{fps} FPS</span>
          <span className="text-zinc-500">|</span>
          <span className={`font-medium ${getLagColor(inputData.inputLagMs)}`}>
            {inputData.inputLagMs.toFixed(1)}ms lag
          </span>
          <ChevronUp className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-transform" />
        </button>
      ) : (
        /* EXPANDED INPUT LAG & TELEMETRY DEBUG HUD */
        <div className="w-72 sm:w-80 p-3 rounded-2xl bg-[#141519] border border-zinc-700/80 shadow-2xl text-zinc-200 flex flex-col gap-2.5 font-sans animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white tracking-wide">Input Lag & Latency HUD</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => resetPeakLag()}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Reset Peak Lag Statistics"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Collapse Debug HUD"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Telemetry Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {/* FPS & Frame Time */}
            <div className="p-2 rounded-xl bg-black/40 border border-zinc-800/80 flex flex-col">
              <span className="text-[10px] text-zinc-400 uppercase font-sans">Render Frame Rate</span>
              <div className="flex items-baseline justify-between mt-0.5">
                <span className={`text-base font-bold ${getFpsColor(fps)}`}>{fps} FPS</span>
                <span className="text-[10px] text-zinc-400">{inputData.frameTimeMs.toFixed(1)}ms</span>
              </div>
            </div>

            {/* Input Queue Latency */}
            <div className="p-2 rounded-xl bg-black/40 border border-zinc-800/80 flex flex-col">
              <span className="text-[10px] text-zinc-400 uppercase font-sans">Queue Latency (OS→JS)</span>
              <div className="flex items-baseline justify-between mt-0.5">
                <span className={`text-base font-bold ${getLagColor(inputData.inputLagMs)}`}>
                  {inputData.inputLagMs.toFixed(1)}ms
                </span>
                <span className="text-[10px] text-zinc-400">Peak: {inputData.peakLagMs.toFixed(1)}ms</span>
              </div>
            </div>

            {/* Stroke Processing Time */}
            <div className="p-2 rounded-xl bg-black/40 border border-zinc-800/80 flex flex-col">
              <span className="text-[10px] text-zinc-400 uppercase font-sans">Stroke Compute</span>
              <div className="flex items-baseline justify-between mt-0.5">
                <span className="text-sm font-semibold text-sky-300">
                  {inputData.strokeProcessMs.toFixed(2)}ms
                </span>
                <span className="text-[10px] text-zinc-400">Ray+Loft</span>
              </div>
            </div>

            {/* Estimated Total Latency */}
            <div className="p-2 rounded-xl bg-black/40 border border-zinc-800/80 flex flex-col">
              <span className="text-[10px] text-zinc-400 uppercase font-sans">Motion-to-Photon</span>
              <div className="flex items-baseline justify-between mt-0.5">
                <span className={`text-sm font-semibold ${getLagColor(inputData.eventToRenderMs)}`}>
                  ~{inputData.eventToRenderMs.toFixed(1)}ms
                </span>
                <span className="text-[10px] text-zinc-400">Total</span>
              </div>
            </div>
          </div>

          {/* Real-Time Jitter Sparkline Graph */}
          <div className="flex flex-col gap-1 p-2 rounded-xl bg-black/50 border border-zinc-800/80">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span>Live Input Jitter Graph (32 samples)</span>
              <span className="text-[9px] text-zinc-400">Top: 40ms | Mid: 16.6ms</span>
            </div>
            <canvas
              ref={canvasRef}
              width={280}
              height={40}
              className="w-full h-10 rounded bg-[#0d0e12] border border-zinc-800/50"
            />
          </div>

          {/* Hardware Device & Precision Info */}
          <div className="flex items-center justify-between text-[10.5px] text-zinc-400 px-1 font-mono">
            <div className="flex items-center gap-1.5">
              <MousePointer className="w-3.5 h-3.5 text-zinc-400" />
              <span className="capitalize text-zinc-300 font-sans">{inputData.pointerType || 'Mouse'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>{inputData.coalescedCount} Coalesced pts/event</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const FpsCounter = React.memo(FpsCounterComponent);

