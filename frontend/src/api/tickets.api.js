import api from "./axios";

export async function getTickets() {
    const res = await api.get("tickets/");
    return res.data
}

export async function createTicket(payload) {
    const res = await api.post("tickets/", payload);
    return res.data;
}
export async function getTicket(ticketId) {
  const res = await api.get(`tickets/${ticketId}/`);
  return res.data;
}
export async function assignToMe(ticketId) {
  const res = await api.post(`tickets/${ticketId}/assign_to_me/`);
  return res.data;
}

export async function changeTicketStatus(ticketId, status) {
  const res = await api.post(`tickets/${ticketId}/change_status/`, { status });
  return res.data;
}
