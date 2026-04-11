import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { DailySchedulePage } from "./pages/DailySchedulePage";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { CancellationsPage } from "./pages/CancellationsPage";
import { CommissionsPage } from "./pages/CommissionsPage";
import { RevenuePage } from "./pages/RevenuePage";
import { ReportsPage } from "./pages/ReportsPage";
import { InventoryPage } from "./pages/InventoryPage";
import { ServicesPage } from "./pages/ServicesPage";
import { ProfessionalsPage } from "./pages/ProfessionalsPage";
import { CustomersPage } from "./pages/CustomersPage";
import { SettingsPage } from "./pages/SettingsPage";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },

  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "daily-schedule", element: <DailySchedulePage /> },
      { path: "appointments", element: <AppointmentsPage /> },
      { path: "cancellations", element: <CancellationsPage /> },
      { path: "commissions", element: <CommissionsPage /> },
      { path: "revenue", element: <RevenuePage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "inventory", element: <InventoryPage /> },
      { path: "services", element: <ServicesPage /> },
      { path: "professionals", element: <ProfessionalsPage /> },
      { path: "customers", element: <CustomersPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);