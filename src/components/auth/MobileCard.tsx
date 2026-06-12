import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  FileText,
  Lock,
  Mail,
  Phone,
} from "lucide-react";
import { useRef } from "react";
import { formatCNPJ, formatPhone } from "@/lib/parsers";
import { type AuthCardProps, formatDigits } from "./types";

export function MobileCard({
  isLogin,
  setAuthMode,
  showPassword,
  showRegPassword,
  setShowPassword,
  setShowRegPassword,
  loginLoading,
  registerLoading,
  loginError,
  registerError,
  loginForm,
  regForm,
  setLoginForm,
  setRegForm,
  onLoginSubmit,
  onRegisterSubmit,
}: AuthCardProps) {
  const loginFormRef = useRef<HTMLFormElement>(null);
  const registerFormRef = useRef<HTMLFormElement>(null);
  const cardHeightClass = isLogin ? "min-h-[420px]" : "min-h-[600px]";

  return (
    <div className="w-full max-w-[420px]">
      <motion.div
        key={isLogin ? "login" : "register"}
        className={`relative w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#0D1515]/95 shadow-[0_28px_70px_rgba(0,0,0,0.45)] ${cardHeightClass}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,166,118,0.18),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_30%)]" />
        <div className="pointer-events-none absolute top-[-60px] right-[-40px] h-40 w-40 rounded-full bg-[#00A676]/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-80px] left-[-20px] h-44 w-44 rounded-full bg-white/5 blur-3xl" />

        {isLogin ? (
          <form
            ref={loginFormRef}
            className="relative h-full overflow-y-auto px-5 py-5"
            onSubmit={onLoginSubmit}
          >
            <div className="mb-4">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#00A676]">
                Login
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Bem-vindo de volta</h3>
              <p className="mt-1 text-sm text-white/45">Use suas credenciais para continuar.</p>
            </div>

            {loginError && <div className="mb-3 text-sm text-red-400">{loginError}</div>}

            <div className="relative mb-2.5">
              <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                type="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] py-2.5 pr-4 pl-10 text-sm text-white placeholder:text-white/30 focus:border-[#00A676] focus:ring-2 focus:ring-[#00A676]/15 focus:outline-none"
                required
              />
            </div>

            <div className="relative mb-3.5">
              <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm((prev) => ({ ...prev, password: e.target.value }))
                }
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] py-2.5 pr-10 pl-10 text-sm text-white placeholder:text-white/30 focus:border-[#00A676] focus:ring-2 focus:ring-[#00A676]/15 focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute top-1/2 right-3.5 -translate-y-1/2 text-white/35 transition-colors hover:text-white/70"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <button
              type="button"
              onClick={() => loginFormRef.current?.requestSubmit()}
              disabled={loginLoading}
              className="w-full rounded-2xl bg-[#00A676] py-2.5 text-sm font-medium text-white shadow-[0_18px_40px_rgba(0,166,118,0.28)] transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loginLoading ? "Entrando..." : "Entrar"}
            </button>

            <button
              type="button"
              onClick={() => setAuthMode("register")}
              className="mt-3 inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-[#00A676]"
            >
              Criar empresa <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <form
            ref={registerFormRef}
            className="relative h-full overflow-y-auto px-5 py-5"
            onSubmit={onRegisterSubmit}
          >
            <div className="mb-4">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#00A676]">
                Cadastro
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Comece sua agenda</h3>
              <p className="mt-1 text-sm text-white/45">
                Preencha os dados da empresa para criar seu acesso.
              </p>
            </div>

            {registerError && <div className="mb-3 text-sm text-red-400">{registerError}</div>}

            <div className="relative mb-2.5">
              <Building2 className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                type="text"
                placeholder="Nome fantasia"
                value={regForm.fantasy_name}
                onChange={(e) =>
                  setRegForm((prev) => ({ ...prev, fantasy_name: e.target.value }))
                }
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] py-2.5 pr-4 pl-10 text-sm text-white placeholder:text-white/30 focus:border-[#00A676] focus:ring-2 focus:ring-[#00A676]/15 focus:outline-none"
                required
              />
            </div>

            <div className="relative mb-2.5">
              <FileText className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                type="text"
                placeholder="Razão social"
                value={regForm.legal_name}
                onChange={(e) => setRegForm((prev) => ({ ...prev, legal_name: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] py-2.5 pr-4 pl-10 text-sm text-white placeholder:text-white/30 focus:border-[#00A676] focus:ring-2 focus:ring-[#00A676]/15 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <div className="relative">
                <FileText className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-white/35" />
                <input
                  type="text"
                  placeholder="CNPJ"
                  value={formatCNPJ(regForm.cnpj)}
                  onChange={(e) =>
                    setRegForm((prev) => ({
                      ...prev,
                      cnpj: formatDigits(e.target.value, 14),
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.06] py-2.5 pr-4 pl-10 text-sm text-white placeholder:text-white/30 focus:border-[#00A676] focus:ring-2 focus:ring-[#00A676]/15 focus:outline-none"
                  maxLength={18}
                  required
                />
              </div>

              <div className="relative">
                <Phone className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-white/35" />
                <input
                  type="text"
                  placeholder="Telefone"
                  value={formatPhone(regForm.phone)}
                  onChange={(e) =>
                    setRegForm((prev) => ({
                      ...prev,
                      phone: formatDigits(e.target.value, 11),
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.06] py-2.5 pr-4 pl-10 text-sm text-white placeholder:text-white/30 focus:border-[#00A676] focus:ring-2 focus:ring-[#00A676]/15 focus:outline-none"
                  maxLength={15}
                  required
                />
              </div>
            </div>

            <div className="relative mt-2.5 mb-2.5">
              <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                type="email"
                placeholder="Email"
                value={regForm.email}
                onChange={(e) => setRegForm((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] py-2.5 pr-4 pl-10 text-sm text-white placeholder:text-white/30 focus:border-[#00A676] focus:ring-2 focus:ring-[#00A676]/15 focus:outline-none"
                required
              />
            </div>

            <div className="relative mb-3">
              <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                type={showRegPassword ? "text" : "password"}
                placeholder="Senha"
                value={regForm.password}
                onChange={(e) =>
                  setRegForm((prev) => ({ ...prev, password: e.target.value }))
                }
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] py-2.5 pr-10 pl-10 text-sm text-white placeholder:text-white/30 focus:border-[#00A676] focus:ring-2 focus:ring-[#00A676]/15 focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowRegPassword((value) => !value)}
                className="absolute top-1/2 right-3.5 -translate-y-1/2 text-white/35 transition-colors hover:text-white/70"
                tabIndex={-1}
              >
                {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <p className="mb-3 text-xs leading-relaxed text-white/45">
              Use no mínimo 8 caracteres com letra maiúscula, minúscula, número e símbolo.
            </p>

            <button
              type="button"
              onClick={() => registerFormRef.current?.requestSubmit()}
              disabled={registerLoading}
              className="w-full rounded-2xl bg-[#00A676] py-2.5 text-sm font-medium text-white shadow-[0_18px_40px_rgba(0,166,118,0.28)] transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {registerLoading ? "Cadastrando..." : "Criar conta"}
            </button>

            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className="mt-3 inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-[#00A676]"
            >
              <ArrowLeft className="h-4 w-4" /> Já tenho conta
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
