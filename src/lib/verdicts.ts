import { VerdictType } from "@/types/report";

export type { VerdictType };

export const VERDICT_LABELS: Record<VerdictType, string> = {
  STRONG_BUY: "Strong Buy",
  BUY: "Buy",
  HOLD: "Hold",
  CAUTION: "Caution",
  AVOID: "Avoid",
  UNKNOWN: "Unknown",
};

export const VERDICT_BADGE_CLASSES: Record<VerdictType, string> = {
  STRONG_BUY: "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600",
  BUY: "bg-green-500 hover:bg-green-600 text-white border-green-600",
  HOLD: "bg-blue-500 hover:bg-blue-600 text-white border-blue-600",
  CAUTION: "bg-amber-500 hover:bg-amber-600 text-white border-amber-600",
  AVOID: "bg-red-500 hover:bg-red-600 text-white border-red-600",
  UNKNOWN: "bg-gray-500 hover:bg-gray-600 text-white border-gray-600",
};

export const VERDICT_CHART_COLORS: Record<VerdictType, string> = {
  STRONG_BUY: "#10b981", // emerald-500
  BUY: "#22c55e", // green-500
  HOLD: "#3b82f6", // blue-500
  CAUTION: "#f59e0b", // amber-500
  AVOID: "#ef4444", // red-500
  UNKNOWN: "#6b7280", // gray-500
};

export function getVerdictLabel(verdict?: VerdictType | string | null): string {
  if (!verdict) return VERDICT_LABELS.UNKNOWN;
  return VERDICT_LABELS[verdict as VerdictType] || verdict;
}

export function getVerdictBadgeClass(verdict?: VerdictType | string | null): string {
  if (!verdict) return VERDICT_BADGE_CLASSES.UNKNOWN;
  return VERDICT_BADGE_CLASSES[verdict as VerdictType] || VERDICT_BADGE_CLASSES.UNKNOWN;
}

export function getVerdictChartColor(verdict?: VerdictType | string | null): string {
  if (!verdict) return VERDICT_CHART_COLORS.UNKNOWN;
  return VERDICT_CHART_COLORS[verdict as VerdictType] || VERDICT_CHART_COLORS.UNKNOWN;
}

export function mapTextToVerdictType(text?: string | null): VerdictType {
  if (!text) return "UNKNOWN";
  
  const normalized = text.trim().toUpperCase().replace(/[^A-Z]/g, "_");
  
  if (normalized.includes("STRONG") && normalized.includes("BUY")) return "STRONG_BUY";
  if (normalized.includes("BUY") || normalized.includes("PROMISING")) return "BUY";
  if (normalized.includes("HOLD") || normalized.includes("WATCH")) return "HOLD";
  if (normalized.includes("CAUTION") || normalized.includes("RISK")) return "CAUTION";
  if (normalized.includes("AVOID") || normalized.includes("PASS")) return "AVOID";
  
  return "UNKNOWN";
}
