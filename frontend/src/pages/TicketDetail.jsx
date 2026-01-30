import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import TicketActions from "../components/tickets/TicketActions";
import { getUserId, getUserRole } from "../api/auth";
import { assignToMe, changeTicketStatus } from "../api/tickets.api";
import { getTicket } from "../api/tickets.api";
import { getTicketComments, createTicketComment } from "../api/comments.api";
import { getErrorInfo } from "../utils/httpError";
import { formatDateTime } from "../utils/date";
import Badge from "../components/ui/Badge";

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [actionLoadingKey, setActionLoadingKey] = useState(null);

  const fetchAll = async () => {
    setError("");
    try {
      const [t, c] = await Promise.all([
        getTicket(id),
        getTicketComments(id),
      ]);
      setTicket(t);
      setComments(c);
    } catch (err) {
      const { status, details } = getErrorInfo(err);
      if (status === 401) navigate("/");
      else setError(details || "Could not load ticket details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setRole(getUserRole());
    setUserId(getUserId());
    fetchAll();
}, [id]);

const handleAssignToMe = async () => {
  setError("");
  const key = `assign-${ticket.id}`;
  setActionLoadingKey(key);

  try {
    const updated = await assignToMe(ticket.id);
    setTicket(updated);
  } catch (err) {
    const { status, details } = getErrorInfo(err);
    if (status === 401) navigate("/");
    else if (status === 403) setError("You don't have permission to assign this ticket.");
    else setError(details || "Could not assign the ticket.");
  } finally {
    setActionLoadingKey(null);
  }
};

const handleChangeStatus = async (newStatus) => {
  setError("");
  const key = `status-${ticket.id}-${newStatus}`;
  setActionLoadingKey(key);

  try {
    const updated = await changeTicketStatus(ticket.id, newStatus);
    setTicket(updated);
  } catch (err) {
    const { status, details } = getErrorInfo(err);
    if (status === 401) navigate("/");
    else if (status === 403) setError("You don't have permission to change the status.");
    else if (status === 400) setError(details || "Invalid status transition.");
    else setError(details || "Could not change the status.");
  } finally {
    setActionLoadingKey(null);
  }
};

  const submitComment = async (e) => {
    e.preventDefault();
    setError("");

    if (!body.trim()) {
      setError("Comment cannot be empty.");
      return;
    }

    setPosting(true);
    try {
      const newComment = await createTicketComment(id, body.trim());
      setComments((prev) => [...prev, newComment]);
      setBody("");
    } catch (err) {
      const { status, details } = getErrorInfo(err);
      if (status === 401) navigate("/");
      else if (status === 403) setError("You don't have permission to comment on this ticket.");
      else setError(details || "Could not post the comment.");
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return <p className="p-6 text-sm text-slate-700">Loading ticket...</p>;
  }

  if (!ticket) {
    return <p className="p-6 text-sm text-slate-700">Ticket not found.</p>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <Link to="/tickets" className="text-sm font-medium text-slate-900 hover:underline">
            ← Back to tickets
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">{ticket.title}</h2>
          <p className="mt-2 text-sm text-slate-600">{ticket.description}</p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <Badge variant={`status_${ticket.status}`}>
              {ticket.status}
            </Badge>

            <Badge variant={`priority_${ticket.priority}`}>
              {ticket.priority}
            </Badge>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
              Category: {ticket.category}
            </span>

          </div>
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-slate-900">Actions</h4>
              <TicketActions
                ticket={ticket}
                role={role}
                userId={userId}
                onAssign={() => handleAssignToMe()}
                onChangeStatus={(id, status) => handleChangeStatus(status)}
                actionLoadingKey={actionLoadingKey}
              />
            </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Comments</h3>

          {comments.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">No comments yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {comments.map((c) => (
                <li key={c.id} className="rounded-lg border border-slate-200 p-3">
  <div className="flex items-center justify-between gap-3">
    <p className="text-xs font-medium text-slate-700">
      By {c.author}
    </p>
    <p className="text-xs text-slate-500">
      {formatDateTime(c.created_at)}
    </p>
  </div>

  <p className="mt-2 text-sm text-slate-900">{c.body}</p>
</li>

              ))}
            </ul>
          )}

          <form onSubmit={submitComment} className="mt-4">
            <label className="text-sm font-medium text-slate-900">
              Add a comment
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-400"
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your comment..."
              />
            </label>

            <button
              type="submit"
              disabled={posting}
              className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {posting ? "Posting..." : "Post comment"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
