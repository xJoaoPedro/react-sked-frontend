import { Navigate, Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useEffect, useState } from "react";
import { socket } from "@/services/socket";
import axios from "axios";

export function Layout() {
  const [dados, setDados] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    async function fetchData() {
      const id = localStorage.getItem('companyId')
      
      if (!id) return;

      const response = (await axios.get(`${import.meta.env.VITE_BASE_URL}/api/companies/${id}/data`, {
          headers: { Authorization: `Bearer ${token}` },
      })).data;

      setDados(response);
    }

    fetchData();
    
    socket.connect();

    socket.on("connect", () => {
      // console.log("Socket conectado:", socket.id);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  if (!localStorage.getItem('token')) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-auto">
        <Outlet context={{ dados }} />
      </main>
    </div>
  );
}