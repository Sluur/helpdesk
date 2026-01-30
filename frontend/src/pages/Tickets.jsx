import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { logout, getUserId, getUserRole } from "../api/auth";
import {
  getTickets,
  assignToMe, // <- asegúrate que el export se llame así
  changeTicketStatus,
  createTicket as createTicketApi,
} from "../api/tickets.api";
import { getCategories } from "../api/categories.api";

import TicketItem from "../components/tickets/TicketItem";
import CreateTicketForm from "../components/tickets/CreateTicketForm";

import { getErrorInfo } from "../utils/httpError";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingKey, setActionLoadingKey] = useState(null);
  const [error, setError] = useState("");

  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState("");

  const navigate = useNavigate();

  const categoryNameById = useMemo(() => {
    return Object.fromEntries((categories || []).map((c) => [c.id, c.name]));
  }, [categories]);

const filteredTickets = useMemo(() => {
  const q = query.trim().toLowerCase();

  return tickets.filter((t) => {
    const matchesQuery =
      !q ||
      (t.title || "").toLowerCase().includes(q) ||
      (t.description || "").toLowerCase().includes(q);

    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || t.priority === priorityFilter;

    return matchesQuery && matchesStatus && matchesPriority;
  });
}, [tickets, query, statusFilter, priorityFilter]);

  const fetchTickets = async () => {
    setError("");
    try {
      const data = await getTickets();
      setTickets(data);
    } catch {
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoriesError("");
    setCategoriesLoading(true);

    try {
      const data = await getCategories();
      const active = data.filter((c) => c.is_active !== false);
      setCategories(active);
    } catch {
      setCategoriesError("Could not load categories.");
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchCategories();
    setRole(getUserRole());
    setUserId(getUserId());
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // ASSIGN TO ME
  const handleAssignToMe = async (ticketId) => {
    setError("");
    const key = `assign-${ticketId}`;
    setActionLoadingKey(key);

    try {
      await assignToMe(ticketId);
      await fetchTickets();
    } catch (err) {
      const { status, details } = getErrorInfo(err);

      if (status === 403) setError("You don't have permission to assign this ticket.");
      else if (status === 401) navigate("/");
      else setError(details || "Could not assign the ticket.");
    } finally {
      setActionLoadingKey(null);
    }
  };

  // CHANGE STATUS
  const changeStatus = async (ticketId, newStatus) => {
    setError("");
    const key = `status-${ticketId}-${newStatus}`;
    setActionLoadingKey(key);

    try {
      await changeTicketStatus(ticketId, newStatus);
      await fetchTickets();
    } catch (err) {
      const { status, details } = getErrorInfo(err);

      if (status === 403) setError("You don't have permission to change the status.");
      else if (status === 400) setError(details || "Invalid status transition.");
      else if (status === 401) navigate("/");
      else setError(details || "Could not change the status.");
    } finally {
      setActionLoadingKey(null);
    }
  };

  // CREATE TICKET (handler called by CreateTicketForm)
const handleCreateTicket = async (payload) => {
  const key = "create-ticket";
  setActionLoadingKey(key);

  try {
    await createTicketApi(payload);
    await fetchTickets();
  } catch (err) {
    const { status, details } = getErrorInfo(err);
    if (status === 400) throw new Error(details || "Invalid data. Please check the fields.");
    if (status === 403) throw new Error("You don't have permission to create tickets.");
    throw new Error(details || "Could not create the ticket.");
  } finally {
    setActionLoadingKey(null);
  }
};


if (loading) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Tickets</h2>
            <p className="mt-1 text-xs text-slate-600">Loading tickets...</p>
          </div>
          <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-200" />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <TicketListSkeleton />
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Tickets</h2>
            {categoriesLoading && (
              <p className="mt-1 text-xs text-slate-600">Loading categories...</p>
            )}
            {categoriesError && (
              <p className="mt-1 text-xs text-red-700">{categoriesError}</p>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <CreateTicketForm
            categories={categories}
            onCreate={handleCreateTicket}
            submitting={actionLoadingKey === "create-ticket"}
          />
        </div>
<div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
    <div className="md:col-span-2">
      <label className="text-sm font-medium text-slate-900">Search</label>
      <input
        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-400"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by title or description..."
      />
    </div>

    <div>
      <label className="text-sm font-medium text-slate-900">Status</label>
      <select
        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-400"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="ALL">All</option>
        <option value="OPEN">OPEN</option>
        <option value="IN_PROGRESS">IN_PROGRESS</option>
        <option value="RESOLVED">RESOLVED</option>
        <option value="CLOSED">CLOSED</option>
      </select>
    </div>

    <div>
      <label className="text-sm font-medium text-slate-900">Priority</label>
      <select
        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-400"
        value={priorityFilter}
        onChange={(e) => setPriorityFilter(e.target.value)}
      >
        <option value="ALL">All</option>
        <option value="LOW">LOW</option>
        <option value="MEDIUM">MEDIUM</option>
        <option value="HIGH">HIGH</option>
        <option value="CRITICAL">CRITICAL</option>
      </select>
    </div>
  </div>

  <div className="mt-3 flex items-center justify-between">
    <p className="text-sm text-slate-600">
      Showing <span className="font-medium text-slate-900">{filteredTickets.length}</span>{" "}
      of <span className="font-medium text-slate-900">{tickets.length}</span>
    </p>

    <button
      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
      onClick={() => {
        // TODO: reset query, statusFilter, priorityFilter
        setQuery("");
        setPriorityFilter("ALL");
        setStatusFilter("ALL");
      }}
    >
      Clear filters
    </button>
  </div>
</div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          {filteredTickets.length === 0 ? (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
    <p className="text-sm font-medium text-slate-900">
      {tickets.length === 0
        ? "No tickets yet. Create your first ticket."
        : "No tickets match your filters."}
    </p>
    <p className="mt-1 text-sm text-slate-600">
      {tickets.length === 0
        ? "Use the form above to submit a new request."
        : "Try clearing filters or adjusting your search."}
    </p>
  </div>
) : (
  <ul className="space-y-3">
    {filteredTickets.map((t) => (
      <TicketItem
        key={t.id}
        ticket={t}
        role={role}
        userId={userId}
        categoryName={categoryNameById[t.category] || `#${t.category}`}
        onAssign={handleAssignToMe}
        onChangeStatus={changeStatus}
        actionLoadingKey={actionLoadingKey}
      />
    ))}
  </ul>
)}

        </div>
      </div>
    </div>
  );
}
function TicketListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-slate-200 bg-white p-4"
        >
          <div className="h-4 w-2/3 rounded bg-slate-200" />
          <div className="mt-2 h-3 w-1/2 rounded bg-slate-200" />
          <div className="mt-4 flex gap-2">
            <div className="h-6 w-20 rounded bg-slate-200" />
            <div className="h-6 w-20 rounded bg-slate-200" />
            <div className="h-6 w-20 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
