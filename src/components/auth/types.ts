import type { Dispatch, FormEvent, SetStateAction } from "react";

export type LoginForm = {
  email: string;
  password: string;
};

export type RegisterForm = {
  fantasy_name: string;
  legal_name: string;
  cnpj: string;
  phone: string;
  email: string;
  password: string;
};

export type AuthCardProps = {
  isLogin: boolean;
  setAuthMode: (mode: "login" | "register") => void;
  showPassword: boolean;
  showRegPassword: boolean;
  setShowPassword: Dispatch<SetStateAction<boolean>>;
  setShowRegPassword: Dispatch<SetStateAction<boolean>>;
  loginLoading: boolean;
  registerLoading: boolean;
  loginError: string;
  registerError: string;
  loginForm: LoginForm;
  regForm: RegisterForm;
  setLoginForm: Dispatch<SetStateAction<LoginForm>>;
  setRegForm: Dispatch<SetStateAction<RegisterForm>>;
  onLoginSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRegisterSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function formatDigits(value: string, maxLength?: number) {
  const digits = value.replace(/\D/g, "");

  return typeof maxLength === "number" ? digits.slice(0, maxLength) : digits;
}
