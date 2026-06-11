import axios from "axios";
import { useEffect, useState, type FormEvent } from "react";
import skedLogo from "@/assets/skedLogo.svg";
import { DesktopCard } from "@/components/auth/DesktopCard";
import { MobileCard } from "@/components/auth/MobileCard";
import { type LoginForm, type RegisterForm, formatDigits } from "@/components/auth/types";
import { getCurrentAuthSession, isPendingCompanySession, persistAuthSession } from "@/lib/auth";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";

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
    return (
      <Navigate
        to={isPendingCompanySession(currentSession) ? "/pending-approval" : "/dashboard"}
        replace
      />
    );
  }

  function setAuthMode(mode: "login" | "register") {
    setSearchParams({ mode }, { replace: true });
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

  const cardProps = {
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
    onLoginSubmit: handleLogin,
    onRegisterSubmit: handleRegister,
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080D0D] px-4 select-none">
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

      <div className="absolute top-4 left-1/2 z-50 -translate-x-1/2 md:top-8">
        <Link
          to="/"
          className="mx-auto flex h-16 w-28 items-center justify-center rounded-xl border border-[#00A676]/30 bg-[#00A676]/20 px-4 shadow-[0_12px_30px_rgba(0,166,118,0.12)] transition hover:bg-[#00A676]/25"
        >
          <img src={skedLogo} alt="Sked" className="h-8 w-full object-contain" />
        </Link>
      </div>

      {isDesktop ? (
        <div className="relative z-10 flex min-h-screen items-center justify-center py-10">
          <DesktopCard {...cardProps} />
        </div>
      ) : (
        <div className="relative z-10 flex min-h-[100svh] w-full items-center justify-center pt-20 pb-4">
          <MobileCard {...cardProps} />
        </div>
      )}

      <p className="absolute bottom-6 hidden text-xs tracking-wide text-white/20 md:block">
        © 2026 Sked. Todos os direitos reservados.
      </p>
    </div>
  );
}
