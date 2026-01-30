export default function Badge({ children, variant = "default" }) {
  const base =
    "inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium";

  const variants = {
    default: "bg-slate-100 text-slate-700 border-slate-200",

    status_OPEN: "bg-blue-50 text-blue-700 border-blue-200",
    status_IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
    status_RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    status_CLOSED: "bg-slate-100 text-slate-700 border-slate-200",
    status_REOPENED: "bg-purple-50 text-purple-700 border-purple-200",

    priority_LOW: "bg-slate-100 text-slate-700 border-slate-200",
    priority_MEDIUM: "bg-indigo-50 text-indigo-700 border-indigo-200",
    priority_HIGH: "bg-orange-50 text-orange-700 border-orange-200",
    priority_CRITICAL: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span className={`${base} ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
}
