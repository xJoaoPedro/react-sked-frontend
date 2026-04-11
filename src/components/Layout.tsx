import { Navigate, Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useEffect } from "react";
import { socket } from "@/services/socket";

export function Layout() {
  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("🔥 Socket conectado:", socket.id);
    });

    socket.on("message", (msg) => {
      console.log("Servidor:", msg);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (!localStorage.getItem('token')) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}