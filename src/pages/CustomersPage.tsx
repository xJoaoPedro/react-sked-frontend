import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { PageHeader } from "../components/PageHeader";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "../components/ui/table";
import { User, Users, UserPlus, Cake, Gift, Repeat, UserRoundX, UserX, } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LoadingPage } from "./LoadingPage";
import { useOutletContext } from "react-router-dom";
import { formatDate, formatPhone } from "@/lib/parsers";
import { api } from "@/lib/api";

export function CustomersPage() {
  const { dados } = useOutletContext();
  const [data, setDataState] = useState(null);
  const [limit] = useState(50);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [initialized, setInitialized] = useState(false);

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

  console.log(data)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <PageHeader title="Clientes" subtitle="Gerencie sua base de clientes" />

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-custom">
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total de Clientes
                  </p>
                  <h3 className="text-3xl font-bold text-foreground">
                    {data.totalCustomers}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Novos este mês
                  </p>
                  <h3 className="text-3xl font-bold text-foreground">
                    {data.newCustomers}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Taxa de Retorno
                  </p>
                  <h3 className="text-3xl font-bold text-foreground">
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
            <div className="py-3 px-6 border-b border-border">
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

            <div>
              <Table className="w-full">
                <TableHeader className="table table-fixed z-10">
                  <TableRow className="table w-full table-fixed bg-muted/50">
                    <TableHead className="font-semibold text-foreground">Nome</TableHead>
                    <TableHead className="font-semibold text-foreground">Contato</TableHead>
                    <TableHead className="font-semibold text-foreground">Visitas</TableHead>
                    <TableHead className="font-semibold text-foreground">Última Visita</TableHead>
                    <TableHead className="font-semibold text-foreground ps-3">Ações</TableHead>
                  </TableRow>
                </TableHeader>

                <div className="h-[500px] flex-1 flex overflow-y-auto">
                  <TableBody className="block overflow-y-auto">
                    {data.customers.length === 0 ? (
                      <TableRow className='table table-fixed w-full h-full'>
                        <TableCell colSpan={18} className="w-32 text-center py-16">
                          <div className="w-full h-96 flex flex-col justify-center items-center gap-2 text-muted-foreground">
                            <UserX className="w-12 h-12 opacity-20" />
                            <p className="font-medium">Nenhum cliente encontrado.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (data.customers.map((customer) => (
                      <TableRow key={customer.id} className="table w-full table-fixed hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium py-3">
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
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{customer.email}</div>
                            <div className="text-muted-foreground">
                              {formatPhone(customer.contact)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="w-full px-2 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                            {customer.visits}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(customer.lastVisit)}</TableCell>
                        <TableCell className="text-right">
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
                        </TableCell>
                      </TableRow>
                    )))}
                  </TableBody>
                </div>
              </Table>
            </div>

            {data.customers.length > 0 && (
              <div className="border-t border-border px-6 py-4 flex items-center justify-between bg-muted/20">
                <p className="text-sm text-muted-foreground">
                  Mostrando{' '}
                  <span className="font-medium text-foreground">
                    {(page - 1) * limit + 1}-{Math.min(page * limit, data.totalCustomers)}
                  </span>{' '}
                  de{' '}
                  <span className="font-medium text-foreground">
                    {data.totalCustomers}
                  </span>{' '}
                  cancelamentos
                </p>

                <div className="flex items-center gap-2">
                  <span className="px-3 text-sm">
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
                    Anterior
                  </Button>
                  <Button
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(Number(page) + 1)}
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
