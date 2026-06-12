import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { User, Users, UserPlus, Repeat, UserRoundX, UserX, } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LoadingPage } from "./LoadingPage";
import { formatDate, formatPhone } from "@/lib/parsers";
import { api } from "@/lib/api";
import { usePageHeader } from "@/hooks/usePageHeader";
import { useLayoutOutletContext } from "@/hooks/useLayoutOutletContext";

export function CustomersPage() {
  const { dados } = useLayoutOutletContext();
  const [data, setDataState] = useState(null);
  const [limit] = useState(50);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [initialized, setInitialized] = useState(false);

  usePageHeader("Clientes", "Gerencie sua base de clientes");

  const fetchTableData = async () => {
    const response = (await api.get(`/companies/${localStorage.getItem('companyId')}/customers`, {params: { page, limit }})).data.data;

    setDataState((prev) => ({
      ...prev,
      customers: response.data,
    }));
    setTotalPages(response.totalPages);
  }

  useEffect(() => {
    if (!dados) return;

    setDataState(dados.customers);
    setInitialized(true);
  }, [dados])

  useEffect(() => {
    if (!initialized) return

    fetchTableData()
  }, [initialized, page])

  if (data === null) return <LoadingPage />

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-custom">
        <div className="space-y-6 p-4 sm:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">
                    Total de Clientes
                  </p>
                  <h3 className="text-2xl font-bold text-foreground sm:text-3xl">
                    {data.totalCustomers}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">
                    Novos este mês
                  </p>
                  <h3 className="text-2xl font-bold text-foreground sm:text-3xl">
                    {data.newCustomers}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">
                    Taxa de Retorno
                  </p>
                  <h3 className="text-2xl font-bold text-foreground sm:text-3xl">
                    {data.totalCustomers > 0 ? ((data.returningCustomers / data.totalCustomers) * 100).toFixed(1) : 0}%
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {data.returningCustomers} de {data.totalCustomers} voltaram
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Repeat className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </Card>
          </div>

          {/* Customers Table */}
          <Card className="overflow-hidden gap-0">
            <div className="border-b border-border px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    Todos os Clientes
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {data.totalCustomers} clientes cadastrados
                  </p>
                </div>
              </div>
            </div>

            <div className="h-[500px] overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="sticky top-0 z-10 bg-muted [&_tr]:border-b">
                  <tr className="border-b transition-colors">
                    <th className="h-10 px-2 text-left align-middle font-semibold whitespace-nowrap text-foreground">Nome</th>
                    <th className="h-10 px-2 text-left align-middle font-semibold whitespace-nowrap text-foreground">Contato</th>
                    <th className="h-10 px-2 text-left align-middle font-semibold whitespace-nowrap text-foreground">Visitas</th>
                    <th className="h-10 px-2 text-left align-middle font-semibold whitespace-nowrap text-foreground">Última Visita</th>
                    <th className="h-10 px-2 ps-3 text-left align-middle font-semibold whitespace-nowrap text-foreground">Ações</th>
                  </tr>
                </thead>

                <tbody className="[&_tr:last-child]:border-0">
                  {data.customers.length === 0 ? (
                    <tr className="border-b transition-colors">
                      <td colSpan={5} className="w-32 p-2 py-16 text-center align-middle whitespace-nowrap">
                        <div className="flex h-80 w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                          <UserX className="h-12 w-12 opacity-20" />
                          <p className="font-medium">Nenhum cliente encontrado.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (data.customers.map((customer) => (
                    <tr key={customer.id} className="border-b transition-colors hover:bg-muted/30">
                      <td className="py-3 p-2 align-middle whitespace-nowrap font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                              <User className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {customer.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {/* Cliente desde {formatDate(customer.registeredAt)} */}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-2 align-middle whitespace-nowrap">
                          <div className="text-sm">
                            <div>{customer.email}</div>
                            <div className="text-muted-foreground">
                              {formatPhone(customer.contact)}
                            </div>
                          </div>
                        </td>
                        <td className="p-2 align-middle whitespace-nowrap">
                          <span className="w-full px-2 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                            {customer.visits}
                          </span>
                        </td>
                        <td className="p-2 align-middle whitespace-nowrap">{formatDate(customer.lastVisit)}</td>
                        <td className="p-2 text-right align-middle whitespace-nowrap">
                          <div className="flex gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-md bg-transparent text-foreground hover:bg-destructive/10 hover:text-destructive"
                                  >
                                    <UserRoundX className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TooltipTrigger>

                              <TooltipContent side="top" sideOffset={4} className="bg-destructive fill-destructive text-white">
                                Bloquear usuário
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    )))}
                </tbody>
              </table>
            </div>

            {data.customers.length > 0 && (
              <div className="border-t border-border bg-muted/20 px-4 py-4 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    <span className="hidden sm:inline">
                      Mostrando{' '}
                      <span className="font-medium text-foreground">
                        {(page - 1) * limit + 1}-{Math.min(page * limit, data.totalCustomers)}
                      </span>{' '}
                      de{' '}
                      <span className="font-medium text-foreground">
                        {data.totalCustomers}
                      </span>{' '}
                      clientes
                    </span>
                    <span className="sm:hidden">
                      <span className="font-medium text-foreground">
                        {(page - 1) * limit + 1}-{Math.min(page * limit, data.totalCustomers)}
                      </span>{' '}
                      /{' '}
                      <span className="font-medium text-foreground">{data.totalCustomers}</span>{' '}
                      clientes
                    </span>
                  </p>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="px-1 text-sm sm:px-3">
                    <Input 
                      type="number" 
                      min="1" 
                      max={totalPages} 
                      value={page} 
                      onChange={(e) => {
                        const value = Number(e.target.value)
                        if (value <= 0) setPage(1)
                        else if (value > totalPages) setPage(totalPages)
                        else setPage(Number(e.target.value ))
                      }}
                      className='w-fit'
                    /> / {totalPages}
                    </span>

                    <Button
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(Number(page) - 1)}
                    >
                      <span className="sm:hidden">‹</span>
                      <span className="hidden sm:inline">Anterior</span>
                    </Button>
                    <Button
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() => setPage(Number(page) + 1)}
                    >
                      <span className="sm:hidden">›</span>
                      <span className="hidden sm:inline">Próximo</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
