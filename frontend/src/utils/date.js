export function formatDateTime(isoString) {
  if (!isoString) return "";

  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";

  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
