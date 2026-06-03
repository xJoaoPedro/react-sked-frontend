import axios from "axios";
import { useEffect, useState } from "react";
import { Check, Lock, Shield, Building2 } from "lucide-react";
import skedLogo from "@/assets/skedLogo.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PendingCompany = {
  id: number;
  fantasy_name: string;
  legal_name: string;
  cnpj: string;
  email: string;
  phone: string;
  created_at: string;
};

const ADMIN_PASSWORD_STORAGE_KEY = "sked:admin-approval-password";

export function AdminApprovalPage() {
  const [password, setPassword] = useState("");
  const [savedPassword, setSavedPassword] = useState("");
  const [companies, setCompanies] = useState<PendingCompany[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    document.title = "Sked - Aprovação de empresas";

    const storedPassword = sessionStorage.getItem(ADMIN_PASSWORD_STORAGE_KEY) || "";

    if (storedPassword) {
      setPassword(storedPassword);
      setSavedPassword(storedPassword);
      setIsUnlocked(true);
    }
  }, []);

  async function loadPendingCompanies(nextPassword = savedPassword) {
    if (!nextPassword) {
      setError("Informe a senha do painel admin.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/admin/companies/pending`, {
        headers: {
          "x-admin-password": nextPassword,
        },
      });

      sessionStorage.setItem(ADMIN_PASSWORD_STORAGE_KEY, nextPassword);
      setSavedPassword(nextPassword);
      setIsUnlocked(true);
      setCompanies(response.data?.data || []);
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.error ||
          requestError?.response?.data?.message ||
          "Não foi possível carregar as empresas pendentes.",
      );
      setIsUnlocked(false);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleApproveCompany(companyId: number) {
    if (!savedPassword) {
      setError("Informe a senha do painel admin.");
      return;
    }

    setSubmitting(companyId);
    setError("");

    try {
      await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/admin/companies/${companyId}/approve`,
        {},
        {
          headers: {
            "x-admin-password": savedPassword,
          },
        },
      );

      setCompanies((currentCompanies) =>
        currentCompanies.filter((company) => company.id !== companyId),
      );
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.error ||
          requestError?.response?.data?.message ||
          "Não foi possível aprovar a empresa.",
      );
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(0,166,118,0.18),transparent_28%),linear-gradient(180deg,#091110_0%,#0D1515_100%)] px-4 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        {!isUnlocked ? (
          <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center">
            <form
              className="w-full rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur"
              onSubmit={(event) => {
                event.preventDefault();
                loadPendingCompanies(password);
              }}
            >
              <img src={skedLogo} alt="Sked" className="mx-auto mb-8 h-10 w-auto" />
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="border-white/10 bg-black/20 pl-10 text-white placeholder:text-white/30"
                  placeholder="Digite a senha admin"
                />
              </div>
              {error ? (
                <div className="mt-4 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}
              <Button type="submit" disabled={loading} className="mt-4 w-full">
                {loading ? "Entrando..." : "Acessar"}
              </Button>
            </form>
          </div>
        ) : (
          <>
            <div className="mb-10 flex flex-col gap-6 rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur md:flex-row md:items-end md:justify-between">
              <div>
                <img src={skedLogo} alt="Sked" className="mb-6 h-10 w-auto" />
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00A676]/15 text-[#7BE0B4]">
                  <Shield className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-semibold tracking-tight">Aprovação de empresas</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
                  Empresas pendentes aguardando liberação para acessar o sistema.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => loadPendingCompanies(savedPassword)}
                disabled={loading}
                className="border-white/10 bg-black/20 text-white hover:bg-white/10"
              >
                {loading ? "Atualizando..." : "Atualizar lista"}
              </Button>
            </div>

            {error ? (
              <div className="mb-6 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <div className="grid gap-4">
              {companies.length === 0 ? (
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-8 text-center text-white/65">
                  {loading ? "Carregando empresas pendentes..." : "Nenhuma empresa pendente no momento."}
                </div>
              ) : (
                companies.map((company) => (
                  <article
                    key={company.id}
                    className="rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#00A676]/15 text-[#7BE0B4]">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold">{company.fantasy_name}</h2>
                            <p className="text-sm text-white/55">{company.legal_name}</p>
                          </div>
                        </div>

                        <div className="grid gap-1 text-sm text-white/70">
                          <span>Email: {company.email}</span>
                          <span>Telefone: {company.phone}</span>
                          <span>CNPJ: {company.cnpj}</span>
                          <span>
                            Cadastro: {new Date(company.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleApproveCompany(company.id)}
                        disabled={submitting === company.id}
                        className="md:min-w-44"
                      >
                        <Check />
                        {submitting === company.id ? "Aprovando..." : "Aprovar empresa"}
                      </Button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
