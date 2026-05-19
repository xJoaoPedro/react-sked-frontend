import { useEffect, useMemo, useState } from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";

import { api } from "@/lib/api";
import { showRequestErrorToast } from "@/lib/errorHandlers";
import { formatPrice } from "@/lib/parsers";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
  statusLabel: string;
};

type TransactionDraft = {
  id: string;
  description: string;
  amount: string;
  paymentMethod: string;
  occurredAt: string;
};

type PaymentMethodOption = {
  value: string;
  label: string;
};

function toDateTimeLocal(value?: string | null) {
  const date = value ? new Date(value) : new Date();
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - timezoneOffset);

  return localDate.toISOString().slice(0, 16);
}

function buildTransactionId() {
  return `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
}

function getDraftAmount(amount: string) {
  const parsedAmount = Number(amount);

  return Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : 0;
}

function getTransactionDescription(appointment?: RevenueAppointmentOption | null) {
  if (!appointment) return "";

  return `${appointment.serviceName} - ${appointment.clientName}`;
}

function createTransactionDraft(
  appointment?: RevenueAppointmentOption | null,
  occurredAt?: string | null,
  paymentMethod = "PIX",
): TransactionDraft {
  const initialOccurredAt =
    occurredAt === undefined ? undefined : occurredAt || appointment?.date;

  return {
    id: buildTransactionId(),
    description: getTransactionDescription(appointment),
    amount: "",
    paymentMethod,
    occurredAt: toDateTimeLocal(initialOccurredAt),
  };
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
  const [paymentMethodOptions, setPaymentMethodOptions] = useState<PaymentMethodOption[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>(
    appointmentContext?.appointmentId ? String(appointmentContext.appointmentId) : "",
  );
  const [transactions, setTransactions] = useState<TransactionDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const selectedAppointment = useMemo(
    () =>
      appointmentOptions.find(
        (appointment) => String(appointment.appointmentId) === String(selectedAppointmentId),
      ) || null,
    [appointmentOptions, selectedAppointmentId],
  );

  const draftedTotal = useMemo(
    () => transactions.reduce((sum, transaction) => sum + getDraftAmount(transaction.amount), 0),
    [transactions],
  );

  const remainingAfterDrafts = useMemo(() => {
    if (!selectedAppointment) return 0;

    return Math.max(selectedAppointment.remainingAmount - draftedTotal, 0);
  }, [draftedTotal, selectedAppointment]);

  useEffect(() => {
    if (!open) return;

    setSelectedAppointmentId(appointmentContext?.appointmentId ? String(appointmentContext.appointmentId) : "");
    setTransactions([]);
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

        setAppointmentOptions(response.appointments || []);
        setPaymentMethodOptions(response.availablePaymentMethods || []);
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
    if (!open || !selectedAppointment) return;

    const defaultPaymentMethod = paymentMethodOptions[0]?.value || "PIX";

    setTransactions([
      createTransactionDraft(
        selectedAppointment,
        undefined,
        defaultPaymentMethod,
      ),
    ]);
  }, [open, paymentMethodOptions, selectedAppointment]);

  const handleTransactionChange = (
    transactionId: string,
    field: keyof Omit<TransactionDraft, "id">,
    value: string,
  ) => {
    setTransactions((prev) => {
      const nextTransactions = prev.map((transaction) => {
        if (transaction.id !== transactionId) return transaction;

        if (field !== "amount" || !selectedAppointment) {
          return { ...transaction, [field]: value };
        }

        if (!value) {
          return { ...transaction, amount: value };
        }

        const parsedAmount = Number(value);

        if (!Number.isFinite(parsedAmount)) {
          return { ...transaction, amount: value };
        }

        const totalFromOtherTransactions = prev.reduce((sum, item) => {
          if (item.id === transactionId) return sum;

          return sum + getDraftAmount(item.amount);
        }, 0);

        const maxAmountForCurrentTransaction = Math.max(
          selectedAppointment.remainingAmount - totalFromOtherTransactions,
          0,
        );

        return {
          ...transaction,
          amount:
            parsedAmount > maxAmountForCurrentTransaction
              ? String(maxAmountForCurrentTransaction)
              : value,
        };
      });

      if (field !== "amount" || !selectedAppointment) {
        return nextTransactions;
      }

      const draftedTotal = nextTransactions.reduce(
        (sum, transaction) => sum + getDraftAmount(transaction.amount),
        0,
      );

      const maxReached = draftedTotal >= selectedAppointment.remainingAmount;

      if (!maxReached) {
        return nextTransactions;
      }

      return nextTransactions.filter((transaction) => getDraftAmount(transaction.amount) > 0);
    });
  };

  const handleAddTransaction = () => {
    if (!selectedAppointment || remainingAfterDrafts <= 0) return;

    const defaultPaymentMethod = paymentMethodOptions[0]?.value || "PIX";

    setTransactions((prev) => [
      ...prev,
      createTransactionDraft(
        selectedAppointment,
        undefined,
        defaultPaymentMethod,
      ),
    ]);
  };

  const handleRemoveTransaction = (transactionId: string) => {
    setTransactions((prev) => prev.filter((transaction) => transaction.id !== transactionId));
  };

  const handleSubmit = async () => {
    try {
      if (!selectedAppointment) {
        toast.error("Selecione um serviço para registrar a transação.");
        return;
      }

      if (!transactions.length) {
        toast.error("Adicione ao menos uma transação.");
        return;
      }

      const preparedTransactions = transactions.map((transaction, index) => {
        const parsedAmount = Number(transaction.amount);

        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
          throw new Error(`Informe um valor válido para a transação ${index + 1}.`);
        }

        if (!transaction.occurredAt) {
          throw new Error(`Informe a data e hora da transação ${index + 1}.`);
        }

        return {
          appointment_id: selectedAppointment.appointmentId,
          description: transaction.description.trim() || undefined,
          amount: parsedAmount,
          payment_method: transaction.paymentMethod,
          occurred_at: new Date(transaction.occurredAt).toISOString(),
        };
      });

      const totalAmount = preparedTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

      if (totalAmount > selectedAppointment.remainingAmount) {
        toast.error("A soma das transações ultrapassa o valor restante do serviço.");
        return;
      }

      setSubmitting(true);

      for (const transaction of preparedTransactions) {
        await api.post(`/companies/${companyId}/revenue/transactions`, transaction);
      }

      toast.success(
        preparedTransactions.length > 1
          ? "Transações registradas com sucesso!"
          : "Receita registrada com sucesso!",
      );
      onOpenChange(false);
      await onCreated?.();
    } catch (error) {
      if (error instanceof Error && !("response" in error)) {
        toast.error(error.message);
      } else {
        showRequestErrorToast(error, "Não foi possível registrar a receita.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] flex-col overflow-hidden border-border/60 bg-background p-0 shadow-2xl sm:max-w-4xl">
        <DialogHeader className="border-b border-border bg-muted/30 px-6 py-5">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {isAppointmentFlow ? "Registrar transações do agendamento" : "Novo lançamento por serviço"}
          </DialogTitle>
          <DialogDescription className="max-w-3xl text-sm text-muted-foreground">
            {isAppointmentFlow
              ? "Confirme os dados financeiros do serviço concluído e adicione uma ou mais transações até fechar o valor desejado."
              : "Selecione um serviço/agendamento e distribua o valor restante em uma ou mais transações sem ultrapassar o total do serviço."}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-hidden px-6 py-5">
          <div className="grid h-full min-h-0 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div className="space-y-4 overflow-y-auto pr-2 scrollbar-custom">
              <div className="grid gap-2">
                <Label>Serviço / agendamento</Label>
                <Select
                  value={selectedAppointmentId}
                  onValueChange={setSelectedAppointmentId}
                  disabled={loadingAppointments || isAppointmentFlow || appointmentOptions.length === 0}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder={loadingAppointments ? "Carregando..." : "Selecione um serviço"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-96">
                    {appointmentOptions.map((appointment) => (
                      <SelectItem
                        key={appointment.appointmentId}
                        value={String(appointment.appointmentId)}
                        className="py-2"
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
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Cliente</p>
                      <p className="mt-1 text-sm font-medium">{selectedAppointment.clientName || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Serviço</p>
                      <p className="mt-1 text-sm font-medium">{selectedAppointment.serviceName || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Profissional</p>
                      <p className="mt-1 text-sm font-medium">{selectedAppointment.professionalName || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                      <p className="mt-1 text-sm font-medium">{selectedAppointment.statusLabel}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                    <div className="rounded-lg border border-border/70 bg-background px-3 py-2.5">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Valor do serviço</p>
                      <p className="mt-1 text-sm font-semibold">{formatPrice(selectedAppointment.serviceAmount)}</p>
                    </div>
                    <div className="rounded-lg border border-border/70 bg-background px-3 py-2.5">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Já lançado</p>
                      <p className="mt-1 text-sm font-semibold">{formatPrice(draftedTotal)}</p>
                    </div>
                    <div className="rounded-lg border border-border/70 bg-background px-3 py-2.5">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Restante atual</p>
                      <p className="mt-1 text-sm font-semibold text-primary">
                        {formatPrice(remainingAfterDrafts)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex min-h-0 flex-col gap-4">
              <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">Transações do lançamento</p>
                  <p className="text-sm text-muted-foreground">
                    Adicione quantas transações forem necessárias para esse atendimento.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleAddTransaction}
                  disabled={!selectedAppointment || remainingAfterDrafts <= 0}
                >
                  <PlusIcon />
                  Adicionar transação
                </Button>
              </div>  

              <div className="min-h-0 max-h-[32rem] flex-1 space-y-3 overflow-y-auto pr-2 scrollbar-custom">
                {transactions.map((transaction, index) => {
                  const otherTransactionsTotal = transactions.reduce((sum, item) => {
                    if (item.id === transaction.id) return sum;

                    return sum + getDraftAmount(item.amount);
                  }, 0);
                  const maxAmountForCurrentTransaction = selectedAppointment
                    ? Math.max(selectedAppointment.remainingAmount - otherTransactionsTotal, 0)
                    : undefined;

                  return (
                    <div
                      key={transaction.id}
                      className="rounded-xl border border-border bg-background p-4 shadow-sm"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">Transação {index + 1}</p>
                          <p className="text-xs text-muted-foreground">
                            Defina valor, forma de pagamento e data desse lançamento.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTransaction(transaction.id)}
                          disabled={transactions.length === 1}
                        >
                          <Trash2Icon />
                          Remover
                        </Button>
                      </div>

                      <div className="grid gap-4">
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="grid gap-2">
                            <Label htmlFor={`revenue-amount-${transaction.id}`}>Valor</Label>
                            <Input
                              id={`revenue-amount-${transaction.id}`}
                              type="number"
                              min="0.01"
                              step="0.01"
                              max={maxAmountForCurrentTransaction}
                              value={transaction.amount}
                              onChange={(event) =>
                                handleTransactionChange(transaction.id, "amount", event.target.value)
                              }
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label>Forma de pagamento</Label>
                            <Select
                              value={transaction.paymentMethod}
                              onValueChange={(value) =>
                                handleTransactionChange(transaction.id, "paymentMethod", value)
                              }
                            >
                              <SelectTrigger className="h-10">
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

                        <div className="grid gap-2">
                          <Label htmlFor={`revenue-occurred-at-${transaction.id}`}>Data e hora</Label>
                          <Input
                            id={`revenue-occurred-at-${transaction.id}`}
                            type="datetime-local"
                            value={transaction.occurredAt}
                            onChange={(event) =>
                              handleTransactionChange(transaction.id, "occurredAt", event.target.value)
                            }
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor={`revenue-description-${transaction.id}`}>Descrição</Label>
                          <Textarea
                            id={`revenue-description-${transaction.id}`}
                            value={transaction.description}
                            onChange={(event) =>
                              handleTransactionChange(transaction.id, "description", event.target.value)
                            }
                            placeholder="Ex.: Corte premium - João"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0 border-t border-border bg-muted/20 px-6 py-4">
          <Button onClick={() => onOpenChange(false)} className="bg-transparent text-foreground hover:bg-destructive hover:text-white">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !selectedAppointment || appointmentOptions.length === 0 || transactions.length === 0}
          >
            {submitting
              ? "Salvando..."
              : transactions.length > 1
                ? "Salvar transações"
                : "Salvar transação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
