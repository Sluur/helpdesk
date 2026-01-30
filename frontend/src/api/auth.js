import api from "./axios";
import { decodeJwt } from "../utils/jwt";


export async function login(email, password) {
  const { data } = await api.post("token/", { email, password });
  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
  return data;
}

export function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem("access"));
}

export function getUserRole() {
  const token = localStorage.getItem("access");
  if (!token) return null;
  const payload = decodeJwt(token);
  return payload?.role ?? null;
}

export function getUserId() {
  const token = localStorage.getItem("access");
  if (!token) return null;
  const payload = decodeJwt(token);

  // SimpleJWT usualmente trae `user_id`
  return payload?.user_id ?? payload?.id ?? null;
}
