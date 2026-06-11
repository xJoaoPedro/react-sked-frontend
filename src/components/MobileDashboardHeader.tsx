import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, User, X } from "lucide-react";
import skedLogo from "@/assets/skedLogo.svg";
import { clearAuthStorage, getCurrentAuthSession, hasManagerAccess, isEmployeeSession } from "@/lib/auth";
import { socket } from "@/services/socket";
import { useCachedEvolutionProfilePhoto } from "@/hooks/useCachedEvolutionProfilePhoto";
import { getVisibleMenuCategories } from "./Sidebar";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";

type MobileDashboardHeaderProps = {
  title: string;
  dados: any;
};

export function MobileDashboardHeader({ title, dados }: MobileDashboardHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const authSession = getCurrentAuthSession();
  const canAccessManagerAreas = hasManagerAccess(authSession);
  const isEmployee = isEmployeeSession(authSession);
  const companyId = localStorage.getItem("companyId");
  const profilePhoto = useCachedEvolutionProfilePhoto(companyId, dados?.settings?.evolution);
  const visibleMenuCategories = getVisibleMenuCategories(canAccessManagerAreas);

  const handleLogout = () => {
    clearAuthStorage();
    socket.disconnect();
    navigate("/auth");
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#0D1515]/95 px-4 py-3 backdrop-blur md:hidden">
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1 px-3 text-center">
          <p className="truncate text-sm font-semibold text-white">{title}</p>
        </div>

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
    </>
  );
}
