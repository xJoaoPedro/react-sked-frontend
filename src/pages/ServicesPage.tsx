import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { PageHeader } from "../components/PageHeader";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "../components/ui/table";
import { Info, Plus, Edit, Trash2, Search, Clock, Scissors, Sparkles, Hand, Flower2, } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Service {
  id: number;
  name: string;
  category: string;
  duration: number; // em minutos
  price: number;
  commissionRate: number;
  description: string;
  status: "active" | "inactive";
}

const mockServices: Service[] = [
  {
    id: 1,
    name: "Corte Masculino",
    category: "Cabelo",
    duration: 30,
    price: 45,
    commissionRate: 40,
    description: "Corte tradicional masculino",
    status: "active",
  },
  {
    id: 2,
    name: "Corte + Barba",
    category: "Cabelo",
    duration: 45,
    price: 65,
    commissionRate: 40,
    description: "Corte de cabelo com barba",
    status: "active",
  },
  {
    id: 3,
    name: "Barba",
    category: "Barba",
    duration: 30,
    price: 30,
    commissionRate: 40,
    description: "Aparar e modelar barba",
    status: "active",
  },
  {
    id: 4,
    name: "Coloração",
    category: "Cabelo",
    duration: 90,
    price: 120,
    commissionRate: 45,
    description: "Coloração completa",
    status: "active",
  },
  {
    id: 5,
    name: "Hidratação",
    category: "Tratamento",
    duration: 60,
    price: 80,
    commissionRate: 50,
    description: "Tratamento hidratante",
    status: "active",
  },
  {
    id: 6,
    name: "Manicure",
    category: "Estética",
    duration: 45,
    price: 35,
    commissionRate: 50,
    description: "Manicure tradicional",
    status: "active",
  },
  {
    id: 7,
    name: "Pedicure",
    category: "Estética",
    duration: 60,
    price: 45,
    commissionRate: 50,
    description: "Pedicure completo",
    status: "active",
  },
  {
    id: 8,
    name: "Massagem Relaxante",
    category: "Spa",
    duration: 60,
    price: 100,
    commissionRate: 45,
    description: "Massagem terapêutica",
    status: "active",
  },
];

// Function to get icon based on category
const getCategoryIcon = (category: string) => {
  const icons: Record<string, typeof Scissors> = {
    Cabelo: Scissors,
    Barba: Scissors,
    Tratamento: Sparkles,
    Estética: Hand,
    Spa: Flower2,
  };

  const IconComponent = icons[category] || Scissors;
  return <IconComponent className="w-5 h-5 text-primary" />;
};

export function ServicesPage() {
  const [services, setServices] = useState<Service[]>(mockServices);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    duration: "",
    price: "",
    commissionRate: "",
    description: "",
    status: "active" as "active" | "inactive",
  });

  // Calculate metrics
  const totalServices = services.length;
  const activeServices = services.filter((s) => s.status === "active").length;
  const averagePrice =
    services.reduce((sum, s) => sum + s.price, 0) / services.length;
  const categories = Array.from(new Set(services.map((s) => s.category)));

  // Filter services
  const filteredServices = services.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory =
      filterCategory === "all" || s.category === filterCategory;
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  const handleAddService = () => {
    const newService: Service = {
      id: Math.max(...services.map((s) => s.id)) + 1,
      name: formData.name,
      category: formData.category,
      duration: parseInt(formData.duration),
      price: parseFloat(formData.price),
      commissionRate: parseFloat(formData.commissionRate),
      description: formData.description,
      status: formData.status,
    };

    setServices([...services, newService]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditService = () => {
    if (!editingService) return;

    setServices(
      services.map((s) =>
        s.id === editingService.id
          ? {
              ...editingService,
              name: formData.name,
              category: formData.category,
              duration: parseInt(formData.duration),
              price: parseFloat(formData.price),
              commissionRate: parseFloat(formData.commissionRate),
              description: formData.description,
              status: formData.status,
            }
          : s,
      ),
    );

    setEditingService(null);
    resetForm();
  };

  const handleDeleteService = (id: number) => {
    setServices(services.filter((s) => s.id !== id));
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category: service.category,
      duration: service.duration.toString(),
      price: service.price.toString(),
      commissionRate: service.commissionRate.toString(),
      description: service.description,
      status: service.status,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      duration: "",
      price: "",
      commissionRate: "",
      description: "",
      status: "active",
    });
  };

  const getStatusBadge = (service: Service) => {
    let status = 'inactive';

    if (service.status === 'active') {
      status = 'active';
    }
    
    const statusConfig = {
      active: { label: 'Ativo', className: 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:cursor-default' },
      inactive: { label: 'Inativo', className: 'bg-gray-400/10 text-gray-500 border border-gray-400/20 hover:bg-gray-400/20 hover:cursor-default' },
    };
  
    const config = statusConfig[status];
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <PageHeader
        title="Serviços"
        subtitle="Gerencie os serviços oferecidos pelo seu negócio"
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-custom">
        {/* Info Banner */}
        <Card className="p-4 bg-primary/10 border-primary/20 m-6 mb-0">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-primary mb-1">
                Informações sobre Serviços
              </h4>
              <p className="text-sm text-primary/90">
                Configure os serviços oferecidos, defina preços, duração e taxa
                de comissão para cada um. Os serviços ativos aparecem
                disponíveis para agendamento.
              </p>
            </div>
          </div>
        </Card>

        {/* Services Table */}
        <Card className="overflow-hidden m-6 gap-0">
          <div className="py-3 px-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Lista de Serviços
                </h3>
                <p className="text-sm text-muted-foreground">
                  {totalServices} serviços cadastrados • {activeServices} ativos
                  • Média R$ {averagePrice.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar serviços..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select
                  value={filterCategory}
                  onValueChange={setFilterCategory}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>

                <Dialog
                  open={isAddDialogOpen}
                  onOpenChange={setIsAddDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Serviço
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Serviço</DialogTitle>
                      <DialogDescription>
                        Preencha as informações do serviço
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="name">Nome do Serviço</Label>
                        <Input
                          id="name"
                          placeholder="Ex: Corte Masculino"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Categoria</Label>
                        <Input
                          id="category"
                          placeholder="Ex: Cabelo"
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration">Duração (minutos)</Label>
                        <Select
                          value={formData.duration}
                          onValueChange={(value) =>
                            setFormData({ ...formData, duration: value })
                          }
                        >
                          <SelectTrigger id="duration">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 min</SelectItem>
                            <SelectItem value="30">30 min</SelectItem>
                            <SelectItem value="45">45 min</SelectItem>
                            <SelectItem value="60">1h</SelectItem>
                            <SelectItem value="75">1h 15min</SelectItem>
                            <SelectItem value="90">1h 30min</SelectItem>
                            <SelectItem value="105">1h 45min</SelectItem>
                            <SelectItem value="120">2h</SelectItem>
                            <SelectItem value="135">2h 15min</SelectItem>
                            <SelectItem value="150">2h 30min</SelectItem>
                            <SelectItem value="165">2h 45min</SelectItem>
                            <SelectItem value="180">3h</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="price">Preço (R$)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="commissionRate">Comissão (%)</Label>
                        <Input
                          id="commissionRate"
                          type="number"
                          step="0.01"
                          placeholder="40"
                          value={formData.commissionRate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              commissionRate: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value: "active" | "inactive") =>
                            setFormData({ ...formData, status: value })
                          }
                        >
                          <SelectTrigger id="status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Ativo</SelectItem>
                            <SelectItem value="inactive">Inativo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Input
                          id="description"
                          placeholder="Breve descrição do serviço"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                        />
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
                        className="bg-primary hover:bg-primary/90"
                        onClick={handleAddService}
                        disabled={
                          !formData.name ||
                          !formData.category ||
                          !formData.duration ||
                          !formData.price
                        }
                      >
                        Adicionar Serviço
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          <div>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead>Serviço</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {getCategoryIcon(service.category)}
                        </div>
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {service.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {service.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration} min</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      R$ {service.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {service.commissionRate}%
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(service)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <Tooltip disableHoverableContent>
                            <TooltipTrigger asChild>
                              <div>
                                <DialogTrigger asChild>
                                  <Button
                                    onClick={() => openEditDialog(service)}
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded rounded-md bg-transparent text-foreground hover:bg-blue-500/10 hover:text-blue-600"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>                          
                                </DialogTrigger>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" sideOffset={4} className="bg-blue-500 fill-blue-500">
                              Editar
                            </TooltipContent>
                          </Tooltip>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Editar Serviço</DialogTitle>
                              <DialogDescription>
                                Atualize as informações do serviço
                              </DialogDescription>
                            </DialogHeader>

                            <div className="grid grid-cols-2 gap-4 py-4">
                              <div className="col-span-2 space-y-2">
                                <Label htmlFor="edit-name">
                                  Nome do Serviço
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
                                <Label htmlFor="edit-category">Categoria</Label>
                                <Input
                                  id="edit-category"
                                  value={formData.category}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      category: e.target.value,
                                    })
                                  }
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="edit-duration">
                                  Duração (minutos)
                                </Label>
                                <Select
                                  value={formData.duration}
                                  onValueChange={(value) =>
                                    setFormData({
                                      ...formData,
                                      duration: value,
                                    })
                                  }
                                >
                                  <SelectTrigger id="edit-duration">
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="15">15 min</SelectItem>
                                    <SelectItem value="30">30 min</SelectItem>
                                    <SelectItem value="45">45 min</SelectItem>
                                    <SelectItem value="60">1h</SelectItem>
                                    <SelectItem value="75">1h 15min</SelectItem>
                                    <SelectItem value="90">1h 30min</SelectItem>
                                    <SelectItem value="105">
                                      1h 45min
                                    </SelectItem>
                                    <SelectItem value="120">2h</SelectItem>
                                    <SelectItem value="135">
                                      2h 15min
                                    </SelectItem>
                                    <SelectItem value="150">
                                      2h 30min
                                    </SelectItem>
                                    <SelectItem value="165">
                                      2h 45min
                                    </SelectItem>
                                    <SelectItem value="180">3h</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="edit-price">Preço (R$)</Label>
                                <Input
                                  id="edit-price"
                                  type="number"
                                  step="0.01"
                                  value={formData.price}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      price: e.target.value,
                                    })
                                  }
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="edit-commissionRate">
                                  Comissão (%)
                                </Label>
                                <Input
                                  id="edit-commissionRate"
                                  type="number"
                                  step="0.01"
                                  value={formData.commissionRate}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      commissionRate: e.target.value,
                                    })
                                  }
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="edit-status">Status</Label>
                                <Select
                                  value={formData.status}
                                  onValueChange={(
                                    value: "active" | "inactive",
                                  ) =>
                                    setFormData({ ...formData, status: value })
                                  }
                                >
                                  <SelectTrigger id="edit-status">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">
                                      Ativo
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                      Inativo
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="col-span-2 space-y-2">
                                <Label htmlFor="edit-description">
                                  Descrição
                                </Label>
                                <Input
                                  id="edit-description"
                                  value={formData.description}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      description: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>

                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setEditingService(null);
                                  resetForm();
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button
                                className="bg-primary hover:bg-primary/90"
                                onClick={handleEditService}
                              >
                                Salvar Alterações
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Tooltip disableHoverableContent>
                          <TooltipTrigger asChild>
                            <div>
                              <Button  
                                size="sm"
                                onClick={() => handleDeleteService(service.id)}
                                className="h-8 w-8 p-0 rounded rounded-md bg-transparent text-foreground hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TooltipTrigger>

                          <TooltipContent side="top" sideOffset={4} className="bg-destructive fill-destructive">
                            Excluir
                          </TooltipContent>
                        </Tooltip>
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
  );
}
