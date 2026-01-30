export default function TicketActions({
  ticket,
  role,
  userId,
  onAssign,
  onChangeStatus,
  actionLoadingKey,
}) {
  const { id, status, assigned_to } = ticket;

  const isAgentLike = role === "AGENT" || role === "ADMIN";
  const isClient = role === "CLIENT";

  const assignedToMe =
    userId != null &&
    assigned_to != null &&
    Number(assigned_to) === Number(userId);

  const isTicketBusy =
    actionLoadingKey?.startsWith(`assign-${id}`) ||
    actionLoadingKey?.startsWith(`status-${id}-`);

  const btnPrimary =
    "rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed";
  const btnSecondary =
    "rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed";

  const assigning = actionLoadingKey === `assign-${id}`;
  const resolving = actionLoadingKey === `status-${id}-RESOLVED`;
  const closing = actionLoadingKey === `status-${id}-CLOSED`;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {isAgentLike && !assigned_to && (
        <button
          onClick={() => onAssign(id)}
          disabled={isTicketBusy}
          className={btnPrimary}
        >
          {assigning ? "Assigning..." : "Assign to me"}
        </button>
      )}

      {isAgentLike && assignedToMe && (
        <span className="text-xs text-slate-600">Already assigned to you</span>
      )}

      {isAgentLike && status === "IN_PROGRESS" && (
        <button
          onClick={() => onChangeStatus(id, "RESOLVED")}
          disabled={isTicketBusy}
          className={btnSecondary}
        >
          {resolving ? "Resolving..." : "Resolve"}
        </button>
      )}

      {(isAgentLike || isClient) && (status === "RESOLVED" || status === "IN_PROGRESS") && (
        <button
          onClick={() => onChangeStatus(id, "CLOSED")}
          disabled={isTicketBusy}
          className={btnSecondary}
        >
          {closing ? "Closing..." : "Close"}
        </button>
      )}
    </div>
  );
}
