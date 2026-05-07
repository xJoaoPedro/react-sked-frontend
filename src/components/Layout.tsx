import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useCallback, useEffect, useState } from "react";
import { socket } from "@/services/socket";
import { jwtDecode } from "jwt-decode";
import { api } from "@/lib/api";
import { LoadingPage } from "@/pages/LoadingPage";

const pageTitles: Record<string, string> = {
  "/login": "Login",
  "/dashboard": "Dashboard",
  "/daily-schedule": "Agenda do Dia",
  "/appointments": "Agendamentos",
  "/cancellations": "Cancelamentos",
  "/revenue": "Receita",
  "/inventory": "Estoque",
  "/services": "Serviços",
  "/professionals": "Profissionais",
  "/customers": "Clientes",
  "/settings": "Configurações",
};

const getDocumentTitle = (pathname: string) => {
  const pageTitle = pageTitles[pathname] ?? "Sked";

  return pageTitle === "Sked" ? pageTitle : `Sked - ${pageTitle}`;
};

export function Layout() {
  const [dados, setDados] = useState(null);
  const location = useLocation();

  useEffect(() => {
    verifyPermission()
  }, [location.pathname])

  useEffect(() => {
    document.title = getDocumentTitle(location.pathname);
  }, [location.pathname]);

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

  const refreshDados = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const decoded = jwtDecode(token);
    const id = localStorage.getItem("companyId");

    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      localStorage.removeItem("companyId");
      return null;
    }

    const response = (await api.get(`/companies/${id}/data`)).data;

    setDados(response.data);
    return response.data;
  }, []);

  const updateDados = useCallback((valueOrUpdater) => {
    setDados((prev) =>
      typeof valueOrUpdater === "function" ? valueOrUpdater(prev) : valueOrUpdater
    );
  }, []);

  useEffect(() => {
    async function fetchData() {
      await refreshDados();
    }

    fetchData();

    socket.connect();

    socket.on("connect", () => {
      // console.log("Socket conectado:", socket.id);
    });

    return () => {
      socket.disconnect();
    };
  }, [refreshDados]);

  if (!localStorage.getItem("token")) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {!dados ? (
        <LoadingPage />
      ) : (
        <><Sidebar dados={dados.settings} /><main className="flex-1 flex flex-col overflow-auto">
            <Outlet context={{ dados, updateDados, refreshDados }} />
          </main></>
      )}
      
    </div>
  );
}
