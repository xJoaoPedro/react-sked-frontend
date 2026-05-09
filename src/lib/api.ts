import axios from "axios"
import { socket } from "@/services/socket"
import { showRequestErrorToast } from "@/lib/errorHandlers"

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
