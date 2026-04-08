import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { PageHeader } from "../components/PageHeader";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "../components/ui/table";
import { Plus, Edit, Trash2, User, Users, UserPlus, Cake, Gift, Upload, Repeat, } from "lucide-react";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  birthDate: string;
  registeredAt: string;
  totalVisits: number;
  lastVisit?: string;
}

const mockCustomers: Customer[] = [
  {
    id: 1,
    name: "Ana Paula Santos",
    email: "ana.santos@gmail.com",
    phone: "(11) 98765-4321",
    birthDate: "1990-03-31",
    registeredAt: "2024-01-15",
    totalVisits: 12,
    lastVisit: "2026-03-20",
  },
  {
    id: 2,
    name: "Carlos Eduardo Silva",
    email: "carlos.silva@outlook.com",
    phone: "(21) 97654-3210",
    birthDate: "1985-03-31",
    registeredAt: "2024-02-10",
    totalVisits: 8,
    lastVisit: "2026-03-15",
  },
  {
    id: 3,
    name: "Beatriz Costa",
    email: "bia.costa@hotmail.com",
    phone: "(31) 96543-2109",
    birthDate: "1995-05-20",
    registeredAt: "2024-03-05",
    totalVisits: 15,
    lastVisit: "2026-03-25",
  },
  {
    id: 4,
    name: "Daniel Oliveira",
    email: "daniel.oliveira@yahoo.com",
    phone: "(41) 95432-1098",
    birthDate: "1988-08-12",
    registeredAt: "2024-01-20",
    totalVisits: 20,
    lastVisit: "2026-03-28",
  },
  {
    id: 5,
    name: "Fernanda Lima",
    email: "fernanda.lima@gmail.com",
    phone: "(51) 94321-0987",
    birthDate: "1992-11-30",
    registeredAt: "2024-02-25",
    totalVisits: 10,
    lastVisit: "2026-03-18",
  },
  {
    id: 6,
    name: "Gabriel Martins",
    email: "gabriel.martins@icloud.com",
    phone: "(61) 93210-9876",
    birthDate: "1987-03-31",
    registeredAt: "2024-03-10",
    totalVisits: 6,
    lastVisit: "2026-03-22",
  },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR");
};

const isBirthdayToday = (birthDate: string) => {
  const today = new Date("2026-03-31"); // Today's date from context
  const birth = new Date(birthDate);
  return (
    today.getMonth() === birth.getMonth() && today.getDate() === birth.getDate()
  );
};

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    photo: "",
  });

  const birthdayCustomers = customers.filter((c) =>
    isBirthdayToday(c.birthDate),
  );
  const totalCustomers = customers.length;
  const newThisMonth = customers.filter((c) => {
    const registered = new Date(c.registeredAt);
    const now = new Date("2026-03-31");
    return (
      registered.getMonth() === now.getMonth() &&
      registered.getFullYear() === now.getFullYear()
    );
  }).length;

  // Calculate return rate (customers who have visited more than once)
  const returningCustomers = customers.filter((c) => c.totalVisits > 1).length;
  const returnRate =
    totalCustomers > 0
      ? Math.round((returningCustomers / totalCustomers) * 100)
      : 0;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCustomer = () => {
    const newCustomer: Customer = {
      id: Math.max(...customers.map((c) => c.id)) + 1,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      birthDate: formData.birthDate,
      photo: formData.photo,
      registeredAt: new Date().toISOString().split("T")[0],
      totalVisits: 0,
    };

    setCustomers([...customers, newCustomer]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditCustomer = () => {
    if (!editingCustomer) return;

    setCustomers(
      customers.map((c) =>
        c.id === editingCustomer.id
          ? {
              ...editingCustomer,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              birthDate: formData.birthDate,
              photo: formData.photo,
            }
          : c,
      ),
    );

    setEditingCustomer(null);
    resetForm();
  };

  const handleDeleteCustomer = (id: number) => {
    setCustomers(customers.filter((c) => c.id !== id));
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      birthDate: customer.birthDate,
      photo: customer.photo || "",
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      birthDate: "",
      photo: "",
    });
  };

  const handleSendBirthdayCoupon = () => {
    alert(
      `Cupom de desconto enviado para ${birthdayCustomers.length} aniversariante(s)! 🎉`,
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <PageHeader title="Clientes" subtitle="Gerencie sua base de clientes" />

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-custom">
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Customers */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total de Clientes
                  </p>
                  <h3 className="text-3xl font-bold text-foreground">
                    {totalCustomers}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#00A676]/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#00A676]" />
                </div>
              </div>
            </Card>

            {/* New This Month */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Novos este mês
                  </p>
                  <h3 className="text-3xl font-bold text-foreground">
                    {newThisMonth}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </Card>

            {/* Return Rate */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Taxa de Retorno
                  </p>
                  <h3 className="text-3xl font-bold text-foreground">
                    {returnRate}%
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {returningCustomers} de {totalCustomers} voltaram
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Repeat className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </Card>

            {/* Birthday Today */}
            <Card className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Aniversariantes Hoje
                  </p>
                  <h3 className="text-3xl font-bold text-foreground">
                    {birthdayCustomers.length}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center">
                  <Cake className="w-6 h-6 text-pink-500" />
                </div>
              </div>
            </Card>
          </div>

          {/* Birthday Customers Card */}
          {birthdayCustomers.length > 0 && (
            <Card className="p-6 border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      🎉 Aniversariantes do Dia
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Envie um cupom especial para celebrar
                    </p>
                  </div>
                </div>
                <Button
                  className="bg-pink-500 hover:bg-pink-600 text-white"
                  onClick={handleSendBirthdayCoupon}
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Enviar Cupom de Desconto
                </Button>
              </div>

              <div className="space-y-3">
                {birthdayCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center gap-4 p-4 bg-white rounded-lg border border-pink-200"
                  >
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {customer.photo ? (
                        <img
                          src={customer.photo}
                          alt={customer.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {customer.email} • {customer.phone}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-pink-600">
                        🎂 Aniversário
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date("2026-03-31").getFullYear() -
                          new Date(customer.birthDate).getFullYear()}{" "}
                        anos
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Customers Table */}
          <Card className="overflow-hidden gap-0">
            <div className="py-3 px-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    Todos os Clientes
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {customers.length} clientes cadastrados
                  </p>
                </div>
                <Dialog
                  open={isAddDialogOpen}
                  onOpenChange={setIsAddDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-[#00A676] hover:bg-[#00A676]/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar cliente
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                      {/* Photo and Basic Info */}
                      <div className="flex gap-6">
                        {/* Photo Upload */}
                        <div className="flex-shrink-0">
                          <Label
                            htmlFor="photo-upload"
                            className="cursor-pointer block"
                          >
                            <div className="w-32 h-32 bg-muted flex items-center justify-center overflow-hidden hover:bg-muted/80 transition-colors border-2 border-dashed border-border hover:border-[#00A676] rounded-full">
                              {formData.photo ? (
                                <img
                                  src={formData.photo}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  <Upload className="w-8 h-8 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground text-center px-2">
                                    Carregar foto
                                  </span>
                                </div>
                              )}
                            </div>
                          </Label>
                          <Input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1 space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Nome completo</Label>
                            <Input
                              id="name"
                              placeholder="Ex: João Silva"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="joao@exemplo.com"
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  email: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {/* Contact and Birth Date */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefone</Label>
                          <Input
                            id="phone"
                            placeholder="(00) 00000-0000"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phone: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="birthDate">Data de nascimento</Label>
                          <Input
                            id="birthDate"
                            type="date"
                            value={formData.birthDate}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                birthDate: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddDialogOpen(false);
                          resetForm();
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        className="bg-[#00A676] hover:bg-[#00A676]/90"
                        onClick={handleAddCustomer}
                        disabled={
                          !formData.name || !formData.email || !formData.phone
                        }
                      >
                        Adicionar Cliente
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>Nome</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Aniversário</TableHead>
                    <TableHead>Visitas</TableHead>
                    <TableHead>Última Visita</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                            {customer.photo ? (
                              <img
                                src={customer.photo}
                                alt={customer.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {customer.name}
                              {isBirthdayToday(customer.birthDate) && (
                                <span className="text-xs">🎂</span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Cliente desde {formatDate(customer.registeredAt)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{customer.email}</div>
                          <div className="text-muted-foreground">
                            {customer.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(customer.birthDate)}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-[#00A676]/10 text-[#00A676] rounded-full text-sm font-medium">
                          {customer.totalVisits}
                        </span>
                      </TableCell>
                      <TableCell>
                        {customer.lastVisit
                          ? formatDate(customer.lastVisit)
                          : "Nunca"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {/* Edit Dialog */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(customer)}
                                className="text-[#080D0D] border-[#080D0D]/20 hover:bg-[#00A676]/10 hover:text-[#00A676] hover:border-[#00A676]/20"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[700px]">
                              <DialogHeader>
                                <DialogTitle>Editar Cliente</DialogTitle>
                              </DialogHeader>

                              <div className="space-y-6 py-4">
                                {/* Photo and Basic Info */}
                                <div className="flex gap-6">
                                  {/* Photo Upload */}
                                  <div className="flex-shrink-0">
                                    <Label
                                      htmlFor="edit-photo-upload"
                                      className="cursor-pointer block"
                                    >
                                      <div className="w-32 h-32 bg-muted flex items-center justify-center overflow-hidden hover:bg-muted/80 transition-colors border-2 border-dashed border-border hover:border-[#00A676] rounded-full">
                                        {formData.photo ? (
                                          <img
                                            src={formData.photo}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="flex flex-col items-center gap-2">
                                            <Upload className="w-8 h-8 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground text-center px-2">
                                              Carregar foto
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </Label>
                                    <Input
                                      id="edit-photo-upload"
                                      type="file"
                                      accept="image/*"
                                      onChange={handlePhotoUpload}
                                      className="hidden"
                                    />
                                  </div>

                                  {/* Basic Info */}
                                  <div className="flex-1 space-y-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-name">
                                        Nome completo
                                      </Label>
                                      <Input
                                        id="edit-name"
                                        value={formData.name}
                                        onChange={(e) =>
                                          setFormData({
                                            ...formData,
                                            name: e.target.value,
                                          })
                                        }
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="edit-email">E-mail</Label>
                                      <Input
                                        id="edit-email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                          setFormData({
                                            ...formData,
                                            email: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Contact and Birth Date */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-phone">Telefone</Label>
                                    <Input
                                      id="edit-phone"
                                      value={formData.phone}
                                      onChange={(e) =>
                                        setFormData({
                                          ...formData,
                                          phone: e.target.value,
                                        })
                                      }
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-birthDate">
                                      Data de nascimento
                                    </Label>
                                    <Input
                                      id="edit-birthDate"
                                      type="date"
                                      value={formData.birthDate}
                                      onChange={(e) =>
                                        setFormData({
                                          ...formData,
                                          birthDate: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                              </div>

                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setEditingCustomer(null);
                                    resetForm();
                                  }}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  className="bg-[#00A676] hover:bg-[#00A676]/90"
                                  onClick={handleEditCustomer}
                                >
                                  Salvar Alterações
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          {/* Delete Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="text-[#E63946] border-[#E63946]/20 hover:bg-[#E63946]/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
