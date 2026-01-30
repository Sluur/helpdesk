import TicketActions from "./TicketActions";
import { Link } from "react-router-dom";
import Badge from "../ui/Badge";

export default function TicketItem({
  ticket,
  role,
  userId,
  categoryName,
  onAssign,
  onChangeStatus,
  actionLoadingKey,
}) {
  const assignedToMe =
    userId != null &&
    ticket.assigned_to != null &&
    Number(ticket.assigned_to) === Number(userId);

  const assignedLabel = ticket.assigned_to
    ? assignedToMe
      ? "Assigned to me"
      : "Assigned"
    : "Unassigned";

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link to={`/tickets/${ticket.id}`} className="truncate font-medium text-slate-900 hover:underline">
            {ticket.title}
            </Link>


          <p className="mt-1 text-xs text-slate-600">
            Category:{" "}
            <span className="font-medium text-slate-700">{categoryName}</span>{" "}
            <span className="mx-1">•</span>
            <span>{assignedLabel}</span>
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
            <Badge variant={`status_${ticket.status}`}>
            {ticket.status}
            </Badge>

            <Badge variant={`priority_${ticket.priority}`}>
            {ticket.priority}
            </Badge>
        </div>
      </div>

      <TicketActions
        ticket={ticket}
        role={role}
        userId={userId}
        onAssign={onAssign}
        onChangeStatus={onChangeStatus}
        actionLoadingKey={actionLoadingKey}
      />
    </li>
  );
}
