import axios from "axios"
import { showRequestErrorToast } from "@/lib/errorHandlers"

export const register = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
})

/**
 * RESPONSE INTERCEPTOR
 * Trata erros globalmente com toast
 */
register.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
      
    if (status === 401) {
      showRequestErrorToast(error, "Sessao expirada")

      localStorage.removeItem("token")
      window.location.href = "/login"
    } else if (status >= 500) {
      showRequestErrorToast(error, "Erro interno do servidor")
    } else {
      showRequestErrorToast(error)
    }

    return Promise.reject(error)
  }
)
