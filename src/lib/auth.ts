import { jwtDecode } from "jwt-decode";

export interface AuthSession {
  user_id?: number;
  employee_id?: number;
  company_id?: number;
  role?: "EMPLOYEE" | "MANAGER";
  auth_type?: "user" | "company";
  approved?: boolean;
  status?: "PENDING" | "APPROVED" | "DENIED";
  approve_date?: string | number | Date | null;
  exp?: number;
}

export function getCurrentAuthSession(): AuthSession | null {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    return jwtDecode<AuthSession>(token);
  } catch {
    return null;
  }
}

export function isEmployeeSession(session: AuthSession | null = getCurrentAuthSession()) {
  return session?.auth_type === "user" && session?.role === "EMPLOYEE";
}

export function hasManagerAccess(session: AuthSession | null = getCurrentAuthSession()) {
  return !isEmployeeSession(session);
}

export function getDefaultAuthenticatedRoute(session: AuthSession | null = getCurrentAuthSession()) {
  return isEmployeeSession(session) ? "/daily-schedule" : "/dashboard";
}

export function isApprovedCompanySession(session: AuthSession | null = getCurrentAuthSession()) {
  if (session?.auth_type !== "company") return true;

  return session?.approved !== false;
}

export function isPendingCompanySession(session: AuthSession | null = getCurrentAuthSession()) {
  return session?.auth_type === "company" && session?.approved === false;
}

export function clearAuthStorage() {
  localStorage.removeItem("token");
  localStorage.removeItem("companyId");
}

export function persistAuthSession(data: { token: string; companyId?: number; id?: number }) {
  localStorage.setItem("token", data.token);

  const companyId = data.companyId ?? data.id;
  if (companyId) {
    localStorage.setItem("companyId", String(companyId));
  }
}
