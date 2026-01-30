export function getErrorInfo(err) {
  const status = err?.response?.status ?? null;
  const data = err?.response?.data ?? null;

  // Intentamos armar un mensaje legible a partir del payload DRF
  let details = null;

  if (data) {
    if (typeof data === "string") details = data;
    else if (data.detail) details = data.detail;
    else if (typeof data === "object") {
      // Ej: { title: ["This field is required."] }
      details = Object.entries(data)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
        .join(" | ");
    }
  }

  return { status, details };
}
