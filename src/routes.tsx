import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { DailySchedulePage } from "./pages/DailySchedulePage";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { CancellationsPage } from "./pages/CancellationsPage";
import type { ReactElement } from "react";
// import { CommissionsPage } from "./pages/CommissionsPage";
// import { ReportsPage } from "./pages/ReportsPage";
import { RevenuePage } from "./pages/RevenuePage";
import { InventoryPage } from "./pages/InventoryPage";
import { ServicesPage } from "./pages/ServicesPage";
import { ProfessionalsPage } from "./pages/ProfessionalsPage";
import { CustomersPage } from "./pages/CustomersPage";
import { SettingsPage } from "./pages/SettingsPage";
import { Layout } from "./components/Layout";
import { RegisterPage } from "./pages/RegisterPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import {
  getDefaultAuthenticatedRoute,
  getCurrentAuthSession,
  hasManagerAccess,
  isApprovedCompanySession,
  isPendingCompanySession,
} from "./lib/auth";
import { LandingPage } from "./pages/LandingPage";
import { PendingApprovalPage } from "./pages/PendingApprovalPage";
import { AdminApprovalPage } from "./pages/AdminApprovalPage";

function ManagerRoute({ element }: { element: ReactElement }) {
  return hasManagerAccess() ? element : <Navigate to={getDefaultAuthenticatedRoute()} replace />;
}

function ProtectedAppRoute({ element }: { element: ReactElement }) {
  const session = getCurrentAuthSession();

  if (!session) return <Navigate to="/auth" replace />;
  if (isPendingCompanySession(session)) return <Navigate to="/pending-approval" replace />;

  return element;
}

function PendingApprovalRoute() {
  const session = getCurrentAuthSession();

  if (!session) return <Navigate to="/auth" replace />;
  if (isApprovedCompanySession(session)) return <Navigate to="/dashboard" replace />;

  return <PendingApprovalPage />;
}

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/auth", element: <RegisterPage /> },
  { path: "/pending-approval", element: <PendingApprovalRoute /> },
  { path: "/admin/companies", element: <AdminApprovalPage /> },
  { path: "*", element: <NotFoundPage /> },

  {
    path: "/",
    element: <ProtectedAppRoute element={<Layout />} />,
    children: [
      { path: "dashboard", element: <ManagerRoute element={<DashboardPage />} /> },
      { path: "daily-schedule", element: <DailySchedulePage /> },
      { path: "appointments", element: <AppointmentsPage /> },
      { path: "cancellations", element: <ManagerRoute element={<CancellationsPage />} /> },
      // TODO IMPLEMENTAR FUTURAMENTE
      // { path: "commissions", element: <CommissionsPage /> },
      // { path: "reports", element: <ReportsPage /> },
      { path: "revenue", element: <ManagerRoute element={<RevenuePage />} /> },
      { path: "inventory", element: <InventoryPage /> },
      { path: "services", element: <ManagerRoute element={<ServicesPage />} /> },
      { path: "professionals", element: <ManagerRoute element={<ProfessionalsPage />} /> },
      { path: "customers", element: <ManagerRoute element={<CustomersPage />} /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
