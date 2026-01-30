import { useMemo, useState } from "react";

export default function CreateTicketForm({ categories, onCreate, submitting = false }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryOverride, setCategoryOverride] = useState(""); 
  const [priority, setPriority] = useState("LOW");
  const [formError, setFormError] = useState("");

  const defaultCategoryId = useMemo(() => {
    return categories?.length ? String(categories[0].id) : "";
  }, [categories]);

  const categoryId = categoryOverride || defaultCategoryId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setFormError("");

    if (!title.trim()) return setFormError("Title is required.");
    if (!description.trim()) return setFormError("Description is required.");
    if (!categories || categories.length === 0) return setFormError("No categories available.");
    if (!categoryId) return setFormError("Category is required.");

    const category = Number(categoryId);
    if (Number.isNaN(category) || category <= 0) {
      return setFormError("Category must be a valid number.");
    }

    try {
      await onCreate({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
      });

      setTitle("");
      setDescription("");
      setCategoryOverride(""); // vuelve al default
      setPriority("LOW");
    } catch (err) {
      setFormError(err?.message || "Could not create the ticket.");
    }
  };

  const inputClass =
    "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-400 disabled:bg-slate-50 disabled:text-slate-500";
  const labelClass = "text-sm font-medium text-slate-900";
  const helperClass = "mt-1 text-xs text-slate-600";

  const disableForm = submitting;
  const noCategories = !categories || categories.length === 0;

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Create ticket</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>
            Title
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., I can’t log in"
              disabled={disableForm}
            />
          </label>
        </div>

        <div>
          <label className={labelClass}>
            Description
            <textarea
              className={inputClass}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue..."
              rows={4}
              disabled={disableForm}
            />
          </label>
        </div>

        <div>
          <label className={labelClass}>
            Category
            <select
              className={inputClass}
              value={categoryOverride || defaultCategoryId}
              onChange={(e) => setCategoryOverride(e.target.value)}
              disabled={disableForm || noCategories}
            >
              {(categories || []).map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          {noCategories && (
            <p className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              No active categories. Create one in the admin panel.
            </p>
          )}

          {!noCategories ? <p className={helperClass}>Select a category for the ticket.</p> : null}
        </div>

        <div>
          <label className={labelClass}>
            Priority
            <select
              className={inputClass}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={disableForm}
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </label>
        </div>

        {formError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        <button
          type="submit"
          disabled={disableForm || noCategories}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}
