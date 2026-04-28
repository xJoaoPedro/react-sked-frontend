import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useEffect, useState } from "react";
import { socket } from "@/services/socket";
import { jwtDecode } from "jwt-decode";
import { api } from "@/lib/api";

export function Layout() {
  const [dados, setDados] = useState(null);
  const location = useLocation();

  useEffect(() => {
    verifyPermission()
  }, [location.pathname])

  function verifyPermission() {
    const token = localStorage.getItem("token");
    if (!token) return <Navigate to="/login" replace />;

    const decoded = jwtDecode(token);
    const id = localStorage.getItem("companyId");

    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      localStorage.removeItem("companyId");
      return <Navigate to="/login" replace />;
    }
  }

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("token");
      if (!token) return <Navigate to="/login" replace />;

      const decoded = jwtDecode(token);
      const id = localStorage.getItem("companyId");

      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        localStorage.removeItem("companyId");
        return <Navigate to="/login" replace />;
      }

      const response = (await api.get(`/api/companies/${id}/data`)).data;

      setDados(response.data);
    }

    fetchData();

    socket.connect();

    socket.on("connect", () => {
      // console.log("Socket conectado:", socket.id);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (!localStorage.getItem("token")) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-auto">
        <Outlet context={{ dados }} />
      </main>
    </div>
  );
}
