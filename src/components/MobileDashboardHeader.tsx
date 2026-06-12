import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LoaderCircle, LogOut, Menu, QrCode, User, X } from "lucide-react";
import skedLogo from "@/assets/skedLogo.svg";
import { api } from "@/lib/api";
import { clearAuthStorage, getCurrentAuthSession, hasManagerAccess, isEmployeeSession } from "@/lib/auth";
import { formatPhone } from "@/lib/parsers";
import { socket } from "@/services/socket";
import { useCachedEvolutionProfilePhoto } from "@/hooks/useCachedEvolutionProfilePhoto";
import { getVisibleMenuCategories } from "./Sidebar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

type MobileDashboardHeaderProps = {
  title: string;
  dados: any;
  refreshDados: () => Promise<void>;
};

export function MobileDashboardHeader({ title, dados, refreshDados }: MobileDashboardHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [displayQrCode, setDisplayQrCode] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(dados?.settings?.evolution?.status ?? null);
  const [companyPhone, setCompanyPhone] = useState<string | null>(dados?.settings?.evolution?.companyPhone ?? null);
  const [connectedPhone, setConnectedPhone] = useState<string | null>(dados?.settings?.evolution?.connectedPhone ?? null);
  const [phoneMismatch, setPhoneMismatch] = useState<boolean>(Boolean(dados?.settings?.evolution?.phoneMismatch));
  const location = useLocation();
  const navigate = useNavigate();
  const authSession = getCurrentAuthSession();
  const canAccessManagerAreas = hasManagerAccess(authSession);
  const isEmployee = isEmployeeSession(authSession);
  const companyId = localStorage.getItem("companyId");
  const profilePhoto = useCachedEvolutionProfilePhoto(companyId, dados?.settings?.evolution);
  const visibleMenuCategories = getVisibleMenuCategories(canAccessManagerAreas);
  const shouldShowQrButton = Boolean(companyId) && dados?.settings?.evolution?.connected === false;

  useEffect(() => {
    setConnectionStatus(dados?.settings?.evolution?.status ?? null);
    setCompanyPhone(dados?.settings?.evolution?.companyPhone ?? null);
    setConnectedPhone(dados?.settings?.evolution?.connectedPhone ?? null);
    setPhoneMismatch(Boolean(dados?.settings?.evolution?.phoneMismatch));
  }, [
    dados?.settings?.evolution?.status,
    dados?.settings?.evolution?.companyPhone,
    dados?.settings?.evolution?.connectedPhone,
    dados?.settings?.evolution?.phoneMismatch,
  ]);

  useEffect(() => {
    if (!qrCode) {
      setDisplayQrCode(null);
      return;
    }

    let active = true;
    const image = new Image();

    image.onload = () => {
      if (active) {
        setDisplayQrCode(qrCode.startsWith("data:") ? qrCode : `data:image/png;base64,${qrCode}`);
      }
    };

    image.onerror = () => {
      if (active) {
        setDisplayQrCode(qrCode);
      }
    };

    image.src = qrCode.startsWith("data:") ? qrCode : `data:image/png;base64,${qrCode}`;

    return () => {
      active = false;
    };
  }, [qrCode]);

  useEffect(() => {
    if (!isQrModalOpen || !companyId) return;

    let active = true;
    let intervalId: number | null = null;

    const loadConnection = async (connect = false) => {
      setIsLoadingQr(true);

      try {
        const response = connect
          ? await api.post(`/companies/${companyId}/evolution/connect`)
          : await api.get(`/companies/${companyId}/evolution/status`);
        const data = response.data.data;

        if (!active) return;

        setQrCode((currentQrCode) => data?.qrCode || currentQrCode || null);
        setConnectionStatus(data?.state || null);
        setCompanyPhone(data?.companyPhone || null);
        setConnectedPhone(data?.connectedPhone || null);
        setPhoneMismatch(Boolean(data?.phoneMismatch));

        if (data?.connected) {
          window.clearInterval(intervalId ?? undefined);
          setIsQrModalOpen(false);
          await refreshDados();
        }
      } finally {
        if (active) {
          setIsLoadingQr(false);
        }
      }
    };

    loadConnection(true).catch(() => null);

    intervalId = window.setInterval(() => {
      loadConnection(false).catch(() => null);
    }, 4000);

    return () => {
      active = false;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [companyId, isQrModalOpen, refreshDados]);

  const handleLogout = () => {
    clearAuthStorage();
    socket.disconnect();
    navigate("/auth");
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center gap-2 border-b border-white/10 bg-[#0D1515]/95 px-4 py-3 backdrop-blur md:hidden">
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-left text-sm font-semibold text-white">{title}</p>
        </div>

        {shouldShowQrButton && (
          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            className="flex h-10 items-center gap-2 rounded-xl border border-[#00A676]/40 bg-[#00A676]/12 px-3 text-xs font-medium text-[#7ef0c1] transition hover:bg-[#00A676]/20"
            aria-label="Conectar WhatsApp"
          >
            <QrCode className="h-4 w-4" />
            <span className="hidden min-[390px]:inline">WhatsApp</span>
          </button>
        )}

        <Link
          to="/settings"
          className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5"
        >
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt={dados?.settings?.fantasy_name ?? "Foto do perfil"}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-5 w-5 text-white" />
          )}
        </Link>
      </header>

      <Dialog open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DialogContent
          showCloseButton={false}
          className="left-0 top-0 h-svh w-[86vw] max-w-[340px] translate-x-0 translate-y-0 rounded-none border-r border-white/10 bg-[#0D1515] p-0 text-white"
        >
          <DialogTitle className="sr-only">Menu de navegação</DialogTitle>

          <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
            <img src={skedLogo} alt="Sked" className="h-8" />
            <button
              type="button"
              onClick={closeMenu}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-5">
            {visibleMenuCategories.map((category) => (
              <div key={category.title} className="mb-6">
                <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
                  {category.title}
                </h3>
                <ul className="space-y-1.5">
                  {category.items.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={closeMenu}
                        className={`flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                          location.pathname === item.path
                            ? "bg-[#00A676] text-white"
                            : "bg-white/5 text-white/78 hover:bg-white/10"
                        }`}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="border-t border-white/10 p-4">
            <Link
              to="/settings"
              onClick={closeMenu}
              className={`mb-2 flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                location.pathname === "/settings"
                  ? "bg-[#00A676] text-white"
                  : "bg-white/5 text-white/78 hover:bg-white/10"
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#00A676]">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt={dados?.settings?.fantasy_name ?? "Foto do perfil"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-white" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {isEmployee ? "Meu perfil" : dados?.settings?.fantasy_name}
                </p>
                <p className="truncate text-xs text-white/45">
                  {isEmployee ? "Funcionário" : dados?.settings?.email}
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl bg-[#8B1E1E] px-3 py-3 text-sm font-medium text-white transition hover:bg-[#a02222]"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              Sair
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
        <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quase la!</DialogTitle>
            <DialogDescription>
              Para conectar o WhatsApp, escaneie este QR Code com o numero {companyPhone ? formatPhone(companyPhone) : "da empresa"}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-2">
            <div className="flex h-64 w-64 items-center justify-center rounded-2xl border border-primary/15 bg-primary/5 p-4 shadow-sm">
              {displayQrCode ? (
                <img
                  src={displayQrCode}
                  alt="QR Code para conectar WhatsApp"
                  className="h-full w-full rounded-xl object-contain"
                />
              ) : isLoadingQr ? (
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
              ) : (
                <div className="px-6 text-center text-sm text-muted-foreground">
                  Estamos preparando o QR Code para conexao.
                </div>
              )}
            </div>

            <div className="w-full rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                Status atual: {phoneMismatch ? "numero divergente" : connectionStatus === "open" ? "conectado" : "aguardando conexao"}
              </p>
              <p className="mt-1">
                Abra o WhatsApp nesse numero, va em aparelhos conectados e escaneie o codigo acima.
              </p>
              {phoneMismatch && (
                <p className="mt-2 text-destructive">
                  O WhatsApp conectado nao corresponde ao telefone cadastrado da empresa.
                </p>
              )}
              {(companyPhone || connectedPhone) && (
                <p className="mt-2">
                  Cadastrado: {formatPhone(companyPhone) || "nao informado"} | Conectado: {formatPhone(connectedPhone) || "ainda nao identificado"}
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
