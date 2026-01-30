import api from "./axios";

export async function getTicketComments(ticketId) {
  const res = await api.get(`tickets/${ticketId}/comments/`);
  return res.data;
}

export async function createTicketComment(ticketId, body) {
  const res = await api.post(`tickets/${ticketId}/comments/`, { body });
  return res.data;
}
