import axios from "axios"
import { toast } from "sonner"

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
    const message =
      error?.response?.data?.message ||
      "Erro inesperado na requisição"
      
    if (status === 401) {
      toast.error("Sessão expirada")

      localStorage.removeItem("token")
      window.location.href = "/login"
    } else if (status >= 500) {
      toast.error("Erro interno do servidor")
    } else {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)