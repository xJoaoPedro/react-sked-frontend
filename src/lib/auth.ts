import { jwtDecode } from "jwt-decode";

export interface AuthSession {
  user_id?: number;
  employee_id?: number;
  company_id?: number;
  role?: "EMPLOYEE" | "MANAGER";
  auth_type?: "user" | "company";
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
