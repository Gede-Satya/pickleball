import type { ReactNode } from "react";

type BadgeColor =
  | "emerald"
  | "amber"
  | "red"
  | "indigo"
  | "slate"
  | "purple"
  | "sky";

const badgeColors: Record<BadgeColor, string> = {
  emerald: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-600",
  indigo: "bg-white text-indigo-700 border border-indigo-200",
  slate: "bg-slate-200 text-slate-600",
  purple: "bg-purple-100 text-purple-700",
  sky: "bg-sky-100 text-sky-700",
};

export default function Badge({
  color = "slate",
  children,
}: {
  color?: BadgeColor;
  children: ReactNode;
}) {
  return (
    <span
      className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeColors[color]}`}
    >
      {children}
    </span>
  );
}
