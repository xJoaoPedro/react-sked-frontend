import axios from "axios";
import { useEffect, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  Calendar,
  Eye,
  EyeOff,
  FileText,
  Lock,
  Mail,
  Phone,
} from "lucide-react";
import skedLogo from "@/assets/skedLogo.svg";
import { getCurrentAuthSession, isPendingCompanySession, persistAuthSession } from "@/lib/auth";
import { formatCNPJ, formatPhone } from "@/lib/parsers";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";

type LoginForm = {
  email: string;
  password: string;
};

type RegisterForm = {
  fantasy_name: string;
  legal_name: string;
  cnpj: string;
  phone: string;
  email: string;
  password: string;
};

const registerBackgroundImages = [
  "/login-bg-1.jpg",
  "/login-bg-2.jpg",
  "/login-bg-3.jpg",
  "/login-bg-4.jpg",
];

function isStrongPassword(password: string) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const url = import.meta.env.VITE_BASE_URL;
  const authMode = searchParams.get("mode") === "register" ? "register" : "login";

  const [backgroundImage] = useState(
    () =>
      registerBackgroundImages[Math.floor(Math.random() * registerBackgroundImages.length)],
  );
  const [isLogin, setIsLogin] = useState(authMode !== "register");
  const [isDesktop, setIsDesktop] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");

  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const [regForm, setRegForm] = useState<RegisterForm>({
    fantasy_name: "",
    legal_name: "",
    cnpj: "",
    phone: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    document.title = "Sked - Acesso";
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const syncViewport = () => setIsDesktop(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  useEffect(() => {
    setIsLogin(authMode !== "register");
  }, [authMode]);

  const currentSession = getCurrentAuthSession();

  if (localStorage.getItem("token") && localStorage.getItem("companyId")) {
    return <Navigate to={isPendingCompanySession(currentSession) ? "/pending-approval" : "/dashboard"} replace />;
  }

  const formPanelAnimation = isDesktop
    ? { left: isLogin ? -16 : "calc(50% - 16px)", top: -16 }
    : { left: -16, top: isLogin ? -16 : "calc(50% - 16px)" };

  function setAuthMode(mode: "login" | "register") {
    setSearchParams({ mode }, { replace: true });
  }

  function formatDigits(value: string, maxLength?: number) {
    const digits = value.replace(/\D/g, "");

    return typeof maxLength === "number" ? digits.slice(0, maxLength) : digits;
  }

  async function loginAsCompanyOrEmployee(credentials: LoginForm) {
    try {
      const response = await axios.post(`${url}/auth/companies/login`, credentials);
      return response.data;
    } catch (companyError: any) {
      if (companyError?.response?.status && companyError.response.status !== 401) {
        throw companyError;
      }

      const response = await axios.post(`${url}/auth/users/login`, credentials);
      return response.data;
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const data = await loginAsCompanyOrEmployee(loginForm);

      persistAuthSession(data);

      navigate(data.approved === false ? "/pending-approval" : "/dashboard");
    } catch (error: any) {
      setLoginError(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          "Erro ao fazer login",
      );
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRegisterLoading(true);
    setRegisterError("");

    if (!isStrongPassword(regForm.password)) {
      setRegisterError(
        "A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial.",
      );
      setRegisterLoading(false);
      return;
    }

    try {
      const payload = {
        fantasy_name: regForm.fantasy_name.trim(),
        legal_name: regForm.legal_name.trim(),
        cnpj: formatDigits(regForm.cnpj, 14),
        phone: formatDigits(regForm.phone, 11),
        email: regForm.email.trim(),
        password: regForm.password,
      };

      await axios.post(`${url}/auth/companies/register`, payload);

      try {
        const loginData = await loginAsCompanyOrEmployee({
          email: payload.email,
          password: payload.password,
        });

        persistAuthSession(loginData);

        navigate(loginData.approved === false ? "/pending-approval" : "/dashboard");
        return;
      } catch {
        setAuthMode("login");
        setLoginForm({
          email: payload.email,
          password: payload.password,
        });
        return;
      }
    } catch (error: any) {
      setRegisterError(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Erro ao cadastrar empresa",
      );
    } finally {
      setRegisterLoading(false);
    }
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080D0D] px-4 py-10 select-none"
    >
      <img
        src={backgroundImage}
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="async"
        className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover object-center blur-[6px]"
      />
      <div className="absolute inset-0 bg-[#080D0D]/38" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(8,13,13,0.66),rgba(8,13,13,0.76))]" />
      <div className="pointer-events-none absolute top-[-160px] left-[-120px] h-[500px] w-[500px] rounded-full bg-[#00A676]/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute right-[-80px] bottom-[-180px] h-[520px] w-[520px] rounded-full bg-[#00A676]/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-[40%] left-[40%] h-[300px] w-[300px] rounded-full bg-[#00A676]/[0.04] blur-2xl" />

      <div className="absolute top-8 left-1/2 z-50 -translate-x-1/2">
        <Link
          to="/"
          className="mx-auto flex h-16 w-28 items-center justify-center rounded-xl border border-[#00A676]/30 bg-[#00A676]/20 px-4 shadow-[0_12px_30px_rgba(0,166,118,0.12)] transition hover:bg-[#00A676]/25"
        >
          <img src={skedLogo} alt="Sked" className="h-8 w-full object-contain" />
        </Link>
      </div>

      <div className="relative h-[860px] w-full max-w-[980px] overflow-hidden rounded-2xl shadow-[0_32px_96px_rgba(0,0,0,0.7)] md:h-[600px]">
        <div className="absolute inset-0 bg-[#0D1515]" />

        <div
          className="pointer-events-none absolute rounded-md bg-[#00A676]/[0.08]"
          style={{
            width: 340,
            height: 310,
            top: 36,
            left: 168,
            transform: "rotate(-38deg) skewX(6deg) skewY(3deg)",
          }}
        />
        <div
          className="pointer-events-none absolute rounded-md bg-[#00A676]/[0.05]"
          style={{
            width: 360,
            height: 190,
            top: -22,
            left: 84,
            transform: "rotate(-38deg) skewX(6deg) skewY(3deg)",
          }}
        />
        <div
          className="pointer-events-none absolute rounded-full bg-[#00A676]/[0.04]"
          style={{ width: 120, height: 120, bottom: -20, right: 240 }}
        />

        <div className="pointer-events-none absolute top-0 left-0 z-10 flex h-1/2 w-full flex-col items-center justify-center px-8 md:h-full md:w-1/2 md:px-10">
          <motion.div
            className="pointer-events-auto text-center"
            animate={{ opacity: isLogin ? 0 : 1, y: isLogin ? 8 : 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{ pointerEvents: isLogin ? "none" : "auto" }}
          >
            <div className="mx-auto mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-[#00A676]/30 bg-[#00A676]/20">
              <Calendar className="h-5 w-5 text-[#00A676]" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">Sua agenda em um só lugar</h3>
            <p className="mb-7 text-sm leading-relaxed text-white/50">
              Cadastre sua empresa para começar a gerenciar atendimentos, clientes e equipe no
              Sked.
            </p>
            <button
              onClick={() => setAuthMode("login")}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-2.5 text-sm text-white/80 transition-all duration-300 hover:border-[#00A676] hover:text-[#00A676]"
              type="button"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Já tenho conta
            </button>
          </motion.div>
        </div>

        <div className="pointer-events-none absolute right-0 bottom-0 z-10 flex h-1/2 w-full flex-col items-center justify-center px-8 md:top-0 md:h-full md:w-1/2 md:px-10">
          <motion.div
            className="pointer-events-auto text-center"
            animate={{ opacity: isLogin ? 1 : 0, y: isLogin ? 0 : 8 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{ pointerEvents: isLogin ? "auto" : "none" }}
          >
            <div className="mx-auto mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-[#00A676]/30 bg-[#00A676]/20">
              <Building2 className="h-5 w-5 text-[#00A676]" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">Acesse sua conta</h3>
            <p className="mb-7 text-sm leading-relaxed text-white/50">
              Entre com seu email e senha para continuar no painel da sua empresa ou da sua
              equipe.
            </p>
            <button
              type="button"
              onClick={() => setAuthMode("register")}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-2.5 text-sm text-white/80 transition-all duration-300 hover:border-[#00A676] hover:text-[#00A676]"
            >
              Cadastrar empresa <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        </div>

        <motion.div
          className="absolute top-[-16px] left-[-16px] z-20 h-[calc(50%+32px)] w-[calc(100%+32px)] rounded-2xl bg-white shadow-[0_0_40px_rgba(0,0,0,0.4)] md:bottom-[-16px] md:h-auto md:w-[calc(50%+32px)]"
          animate={formPanelAnimation}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="relative h-full w-full overflow-hidden">
            <motion.form
              className="absolute inset-0 flex flex-col justify-center overflow-y-auto px-8 py-8 md:px-12 md:py-12"
              animate={{ opacity: isLogin ? 1 : 0, x: isLogin ? 0 : -28 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              style={{ pointerEvents: isLogin ? "auto" : "none" }}
              onSubmit={handleLogin}
            >
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-[#080D0D]">Entrar</h2>
                <p className="mt-0.5 text-sm text-gray-400">Use suas credenciais para continuar</p>
              </div>

              {loginError && <div className="mb-3 text-sm text-red-500">{loginError}</div>}

              <div className="relative mb-3">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm text-[#080D0D] placeholder:text-gray-400 transition-all duration-200 focus:border-[#00A676] focus:ring-2 focus:ring-[#00A676]/10 focus:outline-none"
                  required
                />
              </div>

              <div className="relative mb-5">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pr-10 pl-10 text-sm text-[#080D0D] placeholder:text-gray-400 transition-all duration-200 focus:border-[#00A676] focus:ring-2 focus:ring-[#00A676]/10 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full rounded-xl bg-[#080D0D] py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:bg-[#00A676] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loginLoading ? "Entrando..." : "Entrar"}
              </button>

              <p className="mt-4 text-center text-xs text-gray-400">
                <button
                  type="button"
                  className="text-[#00A676] hover:underline"
                  onClick={() => setAuthMode("register")}
                >
                  Ainda não tem conta? Cadastre sua empresa
                </button>
              </p>
            </motion.form>

            <motion.form
              className="absolute inset-0 flex flex-col justify-center overflow-y-auto px-8 py-8 md:px-12 md:py-12"
              animate={{ opacity: isLogin ? 0 : 1, x: isLogin ? 28 : 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              style={{ pointerEvents: isLogin ? "none" : "auto" }}
              onSubmit={handleRegister}
            >
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-[#080D0D]">Cadastrar empresa</h2>
                <p className="mt-0.5 text-sm text-gray-400">
                  Preencha os dados principais para criar seu acesso ao Sked
                </p>
              </div>

              {registerError && <div className="mb-3 text-sm text-red-500">{registerError}</div>}

              <div className="relative mb-3">
                <Building2 className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nome fantasia"
                  value={regForm.fantasy_name}
                  onChange={(e) =>
                    setRegForm((prev) => ({ ...prev, fantasy_name: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm text-[#080D0D] placeholder:text-gray-400 transition-all duration-200 focus:border-[#00A676] focus:ring-2 focus:ring-[#00A676]/10 focus:outline-none"
                  required
                />
              </div>

              <div className="relative mb-3">
                <FileText className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Razão social"
                  value={regForm.legal_name}
                  onChange={(e) =>
                    setRegForm((prev) => ({ ...prev, legal_name: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm text-[#080D0D] placeholder:text-gray-400 transition-all duration-200 focus:border-[#00A676] focus:ring-2 focus:ring-[#00A676]/10 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="relative">
                  <FileText className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
                    className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm text-[#080D0D] placeholder:text-gray-400 transition-all duration-200 focus:border-[#00A676] focus:ring-2 focus:ring-[#00A676]/10 focus:outline-none"
                    maxLength={18}
                    required
                  />
                </div>

                <div className="relative">
                  <Phone className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
                    className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm text-[#080D0D] placeholder:text-gray-400 transition-all duration-200 focus:border-[#00A676] focus:ring-2 focus:ring-[#00A676]/10 focus:outline-none"
                    maxLength={15}
                    required
                  />
                </div>
              </div>

              <div className="relative mt-3 mb-3">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email"
                  value={regForm.email}
                  onChange={(e) =>
                    setRegForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm text-[#080D0D] placeholder:text-gray-400 transition-all duration-200 focus:border-[#00A676] focus:ring-2 focus:ring-[#00A676]/10 focus:outline-none"
                  required
                />
              </div>

              <div className="relative mb-5">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type={showRegPassword ? "text" : "password"}
                  placeholder="Senha"
                  value={regForm.password}
                  onChange={(e) =>
                    setRegForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pr-10 pl-10 text-sm text-[#080D0D] placeholder:text-gray-400 transition-all duration-200 focus:border-[#00A676] focus:ring-2 focus:ring-[#00A676]/10 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword((value) => !value)}
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showRegPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <p className="mb-5 text-xs leading-relaxed text-gray-400">
                Use no mínimo 8 caracteres com letra maiúscula, minúscula, número e símbolo.
              </p>

              <button
                type="submit"
                disabled={registerLoading}
                className="w-full rounded-xl bg-[#00A676] py-2.5 text-sm font-medium text-white shadow-sm shadow-[#00A676]/20 transition-all duration-300 hover:bg-[#009166] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {registerLoading ? "Cadastrando..." : "Criar conta"}
              </button>

              <p className="mt-4 text-center text-xs text-gray-400">
                <button
                  type="button"
                  className="text-[#00A676] hover:underline"
                  onClick={() => setAuthMode("login")}
                >
                  Já tem conta? Entrar
                </button>
              </p>
            </motion.form>
          </div>
        </motion.div>

        <div className="pointer-events-none absolute inset-0 z-30 rounded-2xl ring-1 ring-white/[0.05]" />
      </div>

      <p className="absolute bottom-6 text-xs tracking-wide text-white/20">
        © 2026 Sked. Todos os direitos reservados.
      </p>
    </div>
  );
}
