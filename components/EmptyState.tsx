import type { ReactNode } from "react";

export default function EmptyState({
  icon,
  title,
  description,
  dashed = false,
}: {
  icon: string;
  title: string;
  description?: ReactNode;
  dashed?: boolean;
}) {
  return (
    <div
      className={
        dashed
          ? "bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 text-center"
          : "bg-white border border-slate-200 rounded-2xl p-12 text-center"
      }
    >
      <span className="text-5xl block mb-4">{icon}</span>
      <h2 className="text-xl font-bold text-slate-800 mb-2">{title}</h2>
      {description && (
        <p className="text-slate-500 max-w-md mx-auto text-sm">{description}</p>
      )}
    </div>
  );
}
