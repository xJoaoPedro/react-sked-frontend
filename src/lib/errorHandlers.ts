import { toast } from "sonner";

const getErrorMessage = (error, fallbackMessage = "Erro inesperado na requisicao") =>
  error?.response?.data?.message || error?.message || fallbackMessage;

const getToastId = (error, message) => {
  const status = error?.response?.status || "unknown";
  const method = error?.config?.method || "unknown";
  const url = error?.config?.url || "unknown";

  return `request-error:${status}:${method}:${url}:${message}`;
};

export function showRequestErrorToast(error, fallbackMessage) {
  const message = getErrorMessage(error, fallbackMessage);

  toast.error(message, {
    id: getToastId(error, message),
  });
}

export function handleServiceError(error) {
  showRequestErrorToast(error, "Nao foi possivel salvar o servico.");
}

export function handleProductError(error) {
  showRequestErrorToast(error, "Nao foi possivel concluir a operacao do produto.");
}
