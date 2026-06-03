import axios from "axios";
import { useEffect, useState } from "react";
import { Clock3, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import skedLogo from "@/assets/skedLogo.svg";
import { Button } from "@/components/ui/button";
import { clearAuthStorage, getCurrentAuthSession, isApprovedCompanySession } from "@/lib/auth";

export function PendingApprovalPage() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState("");
  const session = getCurrentAuthSession();

  useEffect(() => {
    document.title = "Sked - Aprovação pendente";
  }, []);

  useEffect(() => {
    if (!session) {
      navigate("/auth", { replace: true });
      return;
    }

    if (isApprovedCompanySession(session)) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, session]);

  function handleLogout() {
    clearAuthStorage();
    navigate("/auth", { replace: true });
  }

  async function handleCheckApproval() {
    const token = localStorage.getItem("token");

    if (!token) {
      handleLogout();
      return;
    }

    setIsChecking(true);
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const refreshedToken = response.data?.token;

      if (!refreshedToken) {
        throw new Error("Não foi possível atualizar a sessão");
      }

      localStorage.setItem("token", refreshedToken);

      const refreshedSession = getCurrentAuthSession();

      if (isApprovedCompanySession(refreshedSession)) {
        navigate("/dashboard", { replace: true });
        return;
      }

      setError("A empresa ainda está aguardando aprovação.");
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.error ||
          requestError?.message ||
          "Não foi possível verificar a aprovação agora.",
      );
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080D0D] px-6 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,166,118,0.20),transparent_32%),linear-gradient(160deg,#081010_0%,#0D1515_50%,#111C1A_100%)]" />

      <section className="relative z-10 w-full max-w-xl rounded-[28px] border border-white/10 bg-white/95 p-8 text-foreground shadow-[0_32px_96px_rgba(0,0,0,0.45)] backdrop-blur md:p-10">
        <img src={skedLogo} alt="Sked" className="mb-8 h-10 w-auto" />

        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00A676]/15 text-[#00A676]">
          <Clock3 className="h-7 w-7" />
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Aprovação pendente
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Seu cadastro foi recebido, mas a empresa ainda precisa ser aprovada antes de acessar o
          sistema.
        </p>

        {error ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {error}
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={handleCheckApproval} disabled={isChecking} className="sm:min-w-52">
            {isChecking ? "Verificando..." : "Verificar aprovação"}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={handleLogout}
            className="sm:min-w-52"
          >
            <LogOut />
            Sair
          </Button>
        </div>
      </section>
    </main>
  );
}
