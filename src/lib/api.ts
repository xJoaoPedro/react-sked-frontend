import axios from "axios"
import { toast } from "sonner"
import { socket } from "@/services/socket"

export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL + '/api',
})

/**
 * REQUEST INTERCEPTOR
 * Injeta token automaticamente em todas as requisições
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (socket.connected && socket.id) {
    config.headers["x-socket-id"] = socket.id
  }

  return config
})

/**
 * RESPONSE INTERCEPTOR
 * Trata erros globalmente com toast
 */
api.interceptors.response.use(
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
