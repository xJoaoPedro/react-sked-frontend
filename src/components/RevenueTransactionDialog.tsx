import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { showRequestErrorToast } from "@/lib/errorHandlers";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/parsers";
import { toast } from "sonner";

type RevenueTransactionDialogProps = {
  companyId: number | string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => Promise<void> | void;
  appointmentContext?: {
    appointmentId: number;
    clientId?: number | null;
    clientName?: string | null;
    employeeId?: number | null;
    professionalName?: string | null;
    serviceId?: number | null;
    serviceName?: string | null;
    amount?: number | null;
    occurredAt?: string | null;
  } | null;
};

type RevenueAppointmentOption = {
  appointmentId: number;
  date: string;
  clientId?: number | null;
  clientName?: string | null;
  employeeId?: number | null;
  professionalName?: string | null;
  serviceId?: number | null;
  serviceName?: string | null;
  serviceAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
};

const paymentMethodOptions = [
  { value: "PIX", label: "Pix" },
  { value: "CREDIT", label: "Crédito" },
  { value: "DEBIT", label: "Débito" },
  { value: "CASH", label: "Dinheiro" },
];

const paymentStatusOptions = [
  { value: "RECEIVED", label: "Pago" },
  { value: "PENDING", label: "Pendente" },
];

function toDateTimeLocal(value?: string | null) {
  const date = value ? new Date(value) : new Date();
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - timezoneOffset);

  return localDate.toISOString().slice(0, 16);
}

export function RevenueTransactionDialog({
  companyId,
  open,
  onOpenChange,
  onCreated,
  appointmentContext = null,
}: RevenueTransactionDialogProps) {
  const isAppointmentFlow = Boolean(appointmentContext?.appointmentId);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [appointmentOptions, setAppointmentOptions] = useState<RevenueAppointmentOption[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>(
    appointmentContext?.appointmentId ? String(appointmentContext.appointmentId) : "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    paymentMethod: "PIX",
    status: "RECEIVED",
    occurredAt: toDateTimeLocal(appointmentContext?.occurredAt),
  });

  const selectedAppointment = useMemo(
    () =>
      appointmentOptions.find(
        (appointment) => String(appointment.appointmentId) === String(selectedAppointmentId),
      ) || null,
    [appointmentOptions, selectedAppointmentId],
  );

  useEffect(() => {
    if (!open) return;

    setSelectedAppointmentId(appointmentContext?.appointmentId ? String(appointmentContext.appointmentId) : "");
    setFormData({
      description: "",
      amount: "",
      paymentMethod: "PIX",
      status: "RECEIVED",
      occurredAt: toDateTimeLocal(appointmentContext?.occurredAt),
    });
  }, [appointmentContext, open]);

  useEffect(() => {
    if (!open) return;

    const fetchAppointments = async () => {
      try {
        setLoadingAppointments(true);

        const response = (
          await api.get(`/companies/${companyId}/revenue/appointments`, {
            params: { limit: 200 },
          })
        ).data.data;

        setAppointmentOptions(response);
      } catch (error) {
        showRequestErrorToast(error, "Não foi possível carregar os serviços disponíveis.");
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, [companyId, open]);

  useEffect(() => {
    if (!open || loadingAppointments || !appointmentOptions.length) return;

    if (appointmentContext?.appointmentId) {
      const contextId = String(appointmentContext.appointmentId);
      const hasContextOption = appointmentOptions.some(
        (appointment) => String(appointment.appointmentId) === contextId,
      );

      if (hasContextOption) {
        setSelectedAppointmentId(contextId);
      }

      return;
    }

    if (!selectedAppointmentId) {
      setSelectedAppointmentId(String(appointmentOptions[0].appointmentId));
    }
  }, [appointmentContext?.appointmentId, appointmentOptions, loadingAppointments, open, selectedAppointmentId]);

  useEffect(() => {
    if (!selectedAppointment) return;

    setFormData((prev) => ({
      ...prev,
      description: `${selectedAppointment.serviceName} - ${selectedAppointment.clientName}`,
      amount: String(selectedAppointment.remainingAmount),
      occurredAt: prev.occurredAt || toDateTimeLocal(selectedAppointment.date),
    }));
  }, [selectedAppointment]);

  const handleSubmit = async () => {
    try {
      if (!selectedAppointment) {
        toast.error("Selecione um serviço para registrar a transação.");
        return;
      }

      setSubmitting(true);

      await api.post(`/companies/${companyId}/revenue/transactions`, {
        appointment_id: selectedAppointment.appointmentId,
        description: formData.description.trim() || undefined,
        amount: Number(formData.amount),
        payment_method: formData.paymentMethod,
        status: formData.status,
        occurred_at: new Date(formData.occurredAt).toISOString(),
      });

      toast.success("Receita registrada com sucesso!");
      onOpenChange(false);
      await onCreated?.();
    } catch (error) {
      showRequestErrorToast(error, "Não foi possível registrar a receita.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isAppointmentFlow ? "Registrar transação do agendamento" : "Novo lançamento por serviço"}
          </DialogTitle>
          <DialogDescription>
            {isAppointmentFlow
              ? "Confirme os dados financeiros do serviço concluído e registre a transação."
              : "Selecione um serviço/agendamento e registre uma nova transação sem ultrapassar o valor total do serviço."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <Label>Serviço / agendamento</Label>
          <Select
            value={selectedAppointmentId}
            onValueChange={setSelectedAppointmentId}
            disabled={loadingAppointments || isAppointmentFlow || appointmentOptions.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingAppointments ? "Carregando..." : "Selecione um serviço"} />
            </SelectTrigger>
            <SelectContent>
              {appointmentOptions.map((appointment) => (
                <SelectItem
                  key={appointment.appointmentId}
                  value={String(appointment.appointmentId)}
                >
                  {appointment.serviceName} - {appointment.clientName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!loadingAppointments && appointmentOptions.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum serviço com valor disponível foi encontrado para lançamento.
            </p>
          )}
          {isAppointmentFlow && !selectedAppointment && !loadingAppointments && (
            <p className="text-sm text-muted-foreground">
              Esse agendamento não está mais disponível para receber novas transações.
            </p>
          )}
        </div>

        {selectedAppointment && (
          <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-muted/30 p-4 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Cliente</p>
              <p className="mt-1 text-sm font-medium">{selectedAppointment.clientName || "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Serviço</p>
              <p className="mt-1 text-sm font-medium">{selectedAppointment.serviceName || "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Valor do serviço</p>
              <p className="mt-1 text-sm font-medium">
                {formatPrice(selectedAppointment.serviceAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Já lançado</p>
              <p className="mt-1 text-sm font-medium">{formatPrice(selectedAppointment.paidAmount)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Restante</p>
              <p className="mt-1 text-sm font-medium text-primary">
                {formatPrice(selectedAppointment.remainingAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
              <p className="mt-1 text-sm font-medium">{selectedAppointment.status}</p>
            </div>
          </div>
        )}

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="revenue-description">Descrição</Label>
            <Textarea
              id="revenue-description"
              value={formData.description}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, description: event.target.value }))
              }
              placeholder="Ex.: Corte premium - João"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="revenue-amount">Valor</Label>
              <Input
                id="revenue-amount"
                type="number"
                min="0.01"
                step="0.01"
                max={selectedAppointment?.remainingAmount || undefined}
                value={formData.amount}
                onChange={(event) => {
                  const nextValue = event.target.value;

                  if (!selectedAppointment) {
                    setFormData((prev) => ({ ...prev, amount: nextValue }));
                    return;
                  }

                  const parsedValue = Number(nextValue);
                  const cappedValue =
                    Number.isFinite(parsedValue) && parsedValue > selectedAppointment.remainingAmount
                      ? String(selectedAppointment.remainingAmount)
                      : nextValue;

                  setFormData((prev) => ({ ...prev, amount: cappedValue }));
                }}
              />
              {selectedAppointment && (
                <p className="text-xs text-muted-foreground">
                  Valor máximo disponível: {formatPrice(selectedAppointment.remainingAmount)}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Forma de pagamento</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, paymentMethod: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Status financeiro</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="revenue-occurred-at">Data e hora</Label>
              <Input
                id="revenue-occurred-at"
                type="datetime-local"
                value={formData.occurredAt}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, occurredAt: event.target.value }))
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !selectedAppointment || appointmentOptions.length === 0}
          >
            {submitting ? "Salvando..." : "Salvar receita"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
