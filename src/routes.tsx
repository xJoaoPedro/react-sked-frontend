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
import { hasManagerAccess } from "./lib/auth";
import { LandingPage } from "./pages/LandingPage";

function ManagerRoute({ element }: { element: ReactElement }) {
  return hasManagerAccess() ? element : <Navigate to="/dashboard" replace />;
}

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/auth", element: <RegisterPage /> },
  { path: "*", element: <NotFoundPage /> },

  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      { path: "daily-schedule", element: <DailySchedulePage /> },
      { path: "appointments", element: <AppointmentsPage /> },
      { path: "cancellations", element: <CancellationsPage /> },
      // TODO IMPLEMENTAR FUTURAMENTE
      // { path: "commissions", element: <CommissionsPage /> },
      // { path: "reports", element: <ReportsPage /> },
      { path: "revenue", element: <ManagerRoute element={<RevenuePage />} /> },
      { path: "inventory", element: <InventoryPage /> },
      { path: "services", element: <ServicesPage /> },
      { path: "professionals", element: <ManagerRoute element={<ProfessionalsPage />} /> },
      { path: "customers", element: <CustomersPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
