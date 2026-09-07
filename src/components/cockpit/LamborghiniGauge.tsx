import React from "react";
import { 
  Zap, 
  Flame, 
  Gauge, 
  CheckCircle2, 
  Activity, 
  Radio, 
  Compass, 
  Sparkles
} from "lucide-react";

export type SupercarColor = "giallo" | "verde" | "rosso" | "blu" | "viola";

interface ColorTheme {
  primary: string;
  glow: string;
  gradient: string;
  border: string;
  bgBadge: string;
  text: string;
  hexBorder: string;
}

const COLOR_THEMES: Record<SupercarColor, ColorTheme> = {
  giallo: {
    primary: "#f59e0b", // Giallo Auge (Lamborghini Yellow-Orange)
    glow: "rgba(245, 158, 11, 0.4)",
    gradient: "from-amber-500 to-yellow-400",
    border: "border-amber-500/40",
    bgBadge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    text: "text-amber-400",
    hexBorder: "#f59e0b"
  },
  verde: {
    primary: "#10b981", // Verde Mantis (Lamborghini Lime/Emerald)
    glow: "rgba(16, 185, 129, 0.4)",
    gradient: "from-emerald-500 to-teal-400",
    border: "border-emerald-500/40",
    bgBadge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    text: "text-emerald-400",
    hexBorder: "#10b981"
  },
  rosso: {
    primary: "#ef4444", // Rosso Mars (Racing Red)
    glow: "rgba(239, 68, 68, 0.4)",
    gradient: "from-rose-600 to-red-500",
    border: "border-red-500/40",
    bgBadge: "bg-red-500/20 text-red-300 border-red-500/30",
    text: "text-red-400",
    hexBorder: "#ef4444"
  },
  blu: {
    primary: "#06b6d4", // Blu Cepheus (Cyan Telemetry)
    glow: "rgba(6, 182, 212, 0.4)",
    gradient: "from-cyan-500 to-blue-400",
    border: "border-cyan-500/40",
    bgBadge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    text: "text-cyan-400",
    hexBorder: "#06b6d4"
  },
  viola: {
    primary: "#a855f7", // Viola Pasifae (Electric Purple)
    glow: "rgba(168, 85, 247, 0.4)",
    gradient: "from-purple-500 to-violet-400",
    border: "border-purple-500/40",
    bgBadge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    text: "text-purple-400",
    hexBorder: "#a855f7"
  }
};

// ============================================================================
// 1. Lamborghini Arc Gauge (Speedometer / Tachometer 240-degree dial)
// ============================================================================
export interface LamborghiniArcGaugeProps {
  value: number; // 0 to max
  max?: number;
  label: string;
  unit?: string;
  gear?: "P" | "R" | "N" | "D" | "S" | string;
  color?: SupercarColor;
  size?: "sm" | "md" | "lg";
  subLabel?: string;
  ticksCount?: number;
  highlightRedline?: boolean;
}

export const LamborghiniArcGauge: React.FC<LamborghiniArcGaugeProps> = ({
  value,
  max = 100,
  label,
  unit = "%",
  gear = "D",
  color = "giallo",
  size = "md",
  subLabel,
  ticksCount = 10,
  highlightRedline = true
}) => {
  const theme = COLOR_THEMES[color];
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);

  // SVG dimensions based on size
  const dim = size === "lg" ? 220 : size === "md" ? 170 : 130;
  const strokeWidth = size === "lg" ? 10 : size === "md" ? 8 : 6;
  const center = dim / 2;
  const radius = center - strokeWidth - (size === "lg" ? 14 : 10);

  // 240 degree arc: from 150° (bottom-left) to 390° (bottom-right)
  const startAngle = 150;
  const angleSpan = 240;
  const currentAngle = startAngle + (pct / 100) * angleSpan;

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    };
  };

  const describeArc = (cx: number, cy: number, r: number, startA: number, endA: number) => {
    const start = polarToCartesian(cx, cy, r, startA);
    const end = polarToCartesian(cx, cy, r, endA);
    const largeArcFlag = endA - startA <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  const bgPath = describeArc(center, center, radius, startAngle, startAngle + angleSpan);
  const activePath = describeArc(center, center, radius, startAngle, Math.max(startAngle + 0.5, currentAngle));

  // Needle tip coordinates
  const needleCoord = polarToCartesian(center, center, radius, currentAngle);

  // Ticks generation
  const ticks = [];
  for (let i = 0; i <= ticksCount; i++) {
    const tickAngle = startAngle + (i / ticksCount) * angleSpan;
    const isRedline = highlightRedline && i >= ticksCount * 0.8;
    const innerR = radius - (i % 2 === 0 ? 8 : 5);
    const outerR = radius - 2;
    const p1 = polarToCartesian(center, center, innerR, tickAngle);
    const p2 = polarToCartesian(center, center, outerR, tickAngle);
    ticks.push({ p1, p2, isRedline, i });
  }

  return (
    <div className="relative flex flex-col items-center select-none">
      <div className="relative" style={{ width: dim, height: dim }}>
        {/* Outer Hexagonal Subtle Aura */}
        <div 
          className="absolute inset-2 rounded-full pointer-events-none opacity-30 blur-lg transition-opacity"
          style={{ backgroundColor: theme.glow }}
        />

        <svg width={dim} height={dim} className="overflow-visible">
          <defs>
            {/* Supercar Neon Filter */}
            <filter id={`neon-glow-${color}-${dim}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation={size === "lg" ? "4" : "3"} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id={`gauge-grad-${color}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor={theme.primary} />
              <stop offset="100%" stopColor={color === "rosso" ? "#ff2200" : "#ffffff"} />
            </linearGradient>
          </defs>

          {/* Background Track with Carbon Dark style */}
          <path
            d={bgPath}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Scale Tick Marks */}
          {ticks.map(t => (
            <line
              key={t.i}
              x1={t.p1.x}
              y1={t.p1.y}
              x2={t.p2.x}
              y2={t.p2.y}
              stroke={t.isRedline ? "#ef4444" : "#475569"}
              strokeWidth={t.i % 2 === 0 ? 2 : 1.2}
            />
          ))}

          {/* Active Dynamic Glow Arc */}
          <path
            d={activePath}
            fill="none"
            stroke={`url(#gauge-grad-${color})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter={`url(#neon-glow-${color}-${dim})`}
            className="transition-all duration-700 ease-out"
          />

          {/* Needle / Indicator Head */}
          <circle
            cx={needleCoord.x}
            cy={needleCoord.y}
            r={strokeWidth * 0.75}
            fill="#ffffff"
            stroke={theme.primary}
            strokeWidth={2}
            className="transition-all duration-700 ease-out shadow-lg"
          />
        </svg>

        {/* Center Digital Cockpit Cluster Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {/* Digital Gear Indicator (P, R, N, D, S) */}
          {gear && (
            <div className={`mb-0.5 px-2 py-0.5 rounded-md font-mono text-[10px] font-black border tracking-wider shadow-inner ${
              gear === "S" ? "bg-amber-500 text-black border-amber-300 animate-pulse font-black" :
              gear === "P" ? "bg-rose-950/80 text-rose-400 border-rose-800" :
              gear === "D" ? "bg-emerald-950/80 text-emerald-400 border-emerald-800" :
              "bg-slate-800 text-slate-300 border-slate-700"
            }`}>
              GEAR [{gear}]
            </div>
          )}

          {/* Value display */}
          <div className="flex items-baseline gap-0.5">
            <span 
              className={`font-black font-mono tracking-tighter leading-none text-white drop-shadow-md ${
                size === "lg" ? "text-3xl" : size === "md" ? "text-2xl" : "text-lg"
              }`}
            >
              {typeof value === "number" && value % 1 !== 0 ? value.toFixed(1) : value}
            </span>
            {unit && (
              <span className={`font-mono font-bold text-slate-400 ${size === "lg" ? "text-xs" : "text-[10px]"}`}>
                {unit}
              </span>
            )}
          </div>

          {/* Primary Label */}
          <span className={`font-bold tracking-wider uppercase text-slate-300 text-center leading-tight mt-1 ${
            size === "lg" ? "text-[11px]" : "text-[10px]"
          }`}>
            {label}
          </span>
        </div>
      </div>

      {/* Sub Label */}
      {subLabel && (
        <span className="text-[10px] font-mono text-slate-400 tracking-wider text-center mt-1">
          {subLabel}
        </span>
      )}
    </div>
  );
};


// ============================================================================
// 2. Lamborghini Slanted Chevron LED Segmented Bar (For Affinity & Metrics)
// ============================================================================
export interface LamborghiniSegmentedBarProps {
  label: string;
  value: number; // 0 to 100
  color?: SupercarColor;
  segmentsCount?: number;
  icon?: string;
  showPercent?: boolean;
}

export const LamborghiniSegmentedBar: React.FC<LamborghiniSegmentedBarProps> = ({
  label,
  value,
  color = "giallo",
  segmentsCount = 10,
  icon = "⚡",
  showPercent = true
}) => {
  const theme = COLOR_THEMES[color];
  const activeSegments = Math.round((Math.min(Math.max(value, 0), 100) / 100) * segmentsCount);

  return (
    <div className="space-y-1.5 select-none">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="font-bold text-slate-200 flex items-center gap-1.5 tracking-wide">
          <span>{icon}</span>
          <span className="uppercase">{label}</span>
        </span>
        {showPercent && (
          <span className={`font-black font-mono ${theme.text}`}>
            {value}%
          </span>
        )}
      </div>

      {/* Segmented Chevrons Track */}
      <div className="flex items-center gap-1">
        {Array.from({ length: segmentsCount }).map((_, i) => {
          const isActive = i < activeSegments;
          const isTip = i === activeSegments - 1;

          return (
            <div
              key={i}
              className={`h-3 flex-1 transform -skew-x-24 rounded-xs transition-all duration-300 ${
                isActive
                  ? `${isTip ? "shadow-md" : ""} transition-colors`
                  : "bg-slate-800/80 border border-slate-700/50"
              }`}
              style={{
                backgroundColor: isActive ? theme.primary : undefined,
                boxShadow: isTip ? `0 0 10px ${theme.glow}` : undefined
              }}
            />
          );
        })}
      </div>
    </div>
  );
};


// ============================================================================
// 3. Lamborghini Cockpit Triple-Gauge Cluster (Supercar Center Dashboard)
// ============================================================================
export interface LamborghiniCockpitClusterProps {
  masteryPct: number; // 0 to 100
  pendingCount: number;
  changesCount: number;
  reviewedCount: number;
  avgScore: number; // e.g. 5.6 / 6.0
  maxScore?: number;
  totalMissions: number;
  activeMode: "strada" | "corsa";
  onToggleMode: () => void;
}

export const LamborghiniCockpitCluster: React.FC<LamborghiniCockpitClusterProps> = ({
  masteryPct,
  pendingCount,
  changesCount,
  reviewedCount,
  avgScore,
  maxScore = 6.0,
  totalMissions,
  activeMode,
  onToggleMode
}) => {
  // Determine overall supercar gear
  const gear = pendingCount > 0 ? "P" : changesCount > 0 ? "R" : masteryPct >= 90 ? "S" : "D";

  return (
    <div className="relative rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-black p-5 sm:p-7 border-2 border-slate-800 shadow-2xl overflow-hidden animate-fadeIn">
      {/* Carbon Fiber Background Pattern */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #000 0, #000 2px, #1e293b 2px, #1e293b 4px)`
        }}
      />

      {/* Top Cockpit Header Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/90 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-black flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/20">
            🐂
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-sm border border-amber-500/20">
                TELEMETRY COCKPIT • V12 PERFORMANCE
              </span>
              <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                SENSORS: 8 ACTIVE
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2 mt-0.5 font-mono">
              <span>LEARNWISE DIGITAL INSTRUMENT CLUSTER</span>
            </h2>
          </div>
        </div>

        {/* Driving Mode Selector Switch (STRADA ⇄ CORSA) */}
        <div className="flex items-center gap-2 bg-slate-950/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          <button
            type="button"
            onClick={() => onToggleMode()}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === "strada"
                ? "bg-slate-800 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Compass size={13} />
            <span>STRADA (มาตรฐาน)</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleMode()}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === "corsa"
                ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-md shadow-amber-500/20 animate-pulse"
                : "text-slate-500 hover:text-amber-400"
            }`}
          >
            <Flame size={13} />
            <span>CORSA (เรซซิ่ง)</span>
          </button>
        </div>
      </div>

      {/* Main 3-Gauge Digital Cockpit Cluster */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center justify-items-center py-2">
        {/* Left Gauge: Boost Pressure / Pending Review Queue */}
        <div className="w-full flex flex-col items-center bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 shadow-inner">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-400 mb-1">
            <Zap size={13} className="text-amber-400" />
            <span>QUEUE BOOST PRESSURE</span>
          </div>
          <LamborghiniArcGauge
            value={pendingCount}
            max={Math.max(totalMissions * 4, 10)}
            unit="TASKS"
            label="รอครูตรวจ"
            gear={pendingCount > 0 ? "P" : "D"}
            color={pendingCount > 0 ? "giallo" : "verde"}
            size="md"
            subLabel={`${changesCount} ส่งกลับแก้ไข • ${reviewedCount} ตรวจจบ`}
          />
        </div>

        {/* Center Gauge: Main Tachometer / Classroom Mastery Rate */}
        <div className="w-full flex flex-col items-center bg-slate-950/90 p-5 rounded-2xl border-2 border-amber-500/40 shadow-xl shadow-amber-500/5 relative">
          <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black font-mono tracking-widest uppercase">
            ★ MAIN TACHOMETER ★
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-black text-amber-300 mt-1 mb-1">
            <Activity size={14} className="text-amber-400" />
            <span>CLASSROOM MASTERY VELOCITY</span>
          </div>
          <LamborghiniArcGauge
            value={masteryPct}
            max={100}
            unit="%"
            label="อัตราผ่านเกณฑ์เข้าใจจริง"
            gear={gear}
            color={masteryPct >= 90 ? "verde" : masteryPct >= 70 ? "giallo" : "rosso"}
            size="lg"
            subLabel="ว 4.2 ม.4/1 • 6-POINT RUBRIC"
          />
        </div>

        {/* Right Gauge: Engine RPM / Class Average Score */}
        <div className="w-full flex flex-col items-center bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 shadow-inner">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-cyan-400 mb-1">
            <Gauge size={13} className="text-cyan-400" />
            <span>ENGINE REV / AVG SCORE</span>
          </div>
          <LamborghiniArcGauge
            value={avgScore}
            max={maxScore}
            unit="/ 6.0"
            label="คะแนนเฉลี่ยระดับห้อง"
            gear="S"
            color="blu"
            size="md"
            subLabel={`คิดเป็น ${Math.round((avgScore / maxScore) * 100)}% ของเกณฑ์เต็ม`}
          />
        </div>
      </div>

      {/* Bottom Telemetry & Status Sensor Bar */}
      <div className="relative z-10 mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
            <CheckCircle2 size={12} />
            <span>SYSTEM HEALTH: NOMINAL (100%)</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[11px] font-bold">
            <Radio size={12} />
            <span>TELEMETRY: REAL-TIME LINKED</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[11px] font-bold">
            <Sparkles size={12} />
            <span>SGS & ปพ.5 READY</span>
          </span>
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          RPM REDLINE: 8,500 • CALIBRATION CONFIDENCE: 100%
        </div>
      </div>
    </div>
  );
};
