import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { PageHeader } from "../components/PageHeader";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "../components/ui/table";
import { Info, Plus, Edit, Trash2, Search, Clock, Scissors, Sparkles, Hand, Flower2, DollarSign, User, Heart, Brain, Stethoscope, Smile, Dumbbell, Star, Car, Wrench, Home, PawPrint, Briefcase, GraduationCap, MoreHorizontal, } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useOutletContext } from "react-router-dom";
import { formatLimitText, formatPrice } from "@/lib/parsers";
import { api } from "@/lib/api";
import { handleServiceError } from "@/lib/errorHandlers";
import { toast } from "sonner";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const serviceCategories = {
  HAIR: { label: "Cabelo", icon: Scissors },
  BEARD: { label: "Barba", icon: User },
  AESTHETIC: { label: "Estética", icon: Sparkles },
  NAILS: { label: "Unhas", icon: Hand },
  MASSAGE: { label: "Massagem", icon: Heart },
  THERAPY: { label: "Terapia", icon: Brain },
  HEALTH: { label: "Saúde", icon: Stethoscope },
  DENTAL: { label: "Odontologia", icon: Smile },
  FITNESS: { label: "Fitness", icon: Dumbbell },
  BEAUTY: { label: "Beleza", icon: Star },
  AUTOMOTIVE: { label: "Automotivo", icon: Car },
  TECHNICAL: { label: "Técnico", icon: Wrench },
  HOME_SERVICE: { label: "Serviço Residencial", icon: Home },
  PET: { label: "Pet", icon: PawPrint },
  CONSULTING: { label: "Consultoria", icon: Briefcase },
  EDUCATION: { label: "Educação", icon: GraduationCap },
  OTHER: { label: "Outro", icon: MoreHorizontal },
}

export function ServicesPage() {
  const { dados } = useOutletContext();
  const [data, setDataState] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    duration_minutes: "",
    price: "",
    commission: 0,
    description: "",
    status: "ACTIVE" as "ACTIVE" | "DISABLED",
    company_id: localStorage.getItem('companyId')
  });

  useEffect(() => {
    if (!dados) return;

    setDataState(dados.services);
  }, [dados])

  const handleEditService = async (id) => {
    try {
      await api.patch(`/services/${id}`, formData)
      const services = (await api.get("/services")).data.data

      setDataState(services)
      toast.success('Serviço alterado com sucesso!')
      setIsAddDialogOpen(false);
      resetForm();
    } catch (err) {
      handleServiceError(err)
    }

    setEditingService(null);
    resetForm();
  };

  const openEditDialog = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category: service.category,
      duration_minutes: service.duration_minutes,
      price: service.price,
      commission: service.commission,
      description: service.description,
      status: service.status,
      company_id: localStorage.getItem('companyId')
    });
  };

  const handleAddService = async () => {
    try {
      const response = (await api.post("/services", formData)).data.data

      setDataState((prev) => [...prev, response])
      toast.success('Serviço adicionado com sucesso!')
      setIsAddDialogOpen(false);
      resetForm();
    } catch (err) {
      handleServiceError(err)
    }
  };

  const handleDeleteService = async (id) => {
    await api.delete(`/services/${id}`)

    const newData = (await api.get('/services')).data.data
    toast.success('Serviço deletado com sucesso!');
    setDataState(newData);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      duration_minutes: "",
      price: "",
      commission: 0,
      description: "",
      status: "ACTIVE",
      company_id: localStorage.getItem('companyId')
    });
  };

  const getStatusBadge = (service) => {
    const statusConfig = {
      active: { label: 'Ativo', className: 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:cursor-default' },
      disabled: { label: 'Inativo', className: 'bg-gray-400/10 text-gray-500 border border-gray-400/20 hover:bg-gray-400/20 hover:cursor-default' },
    };
  
    const config = statusConfig[service.toLowerCase()];
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  if (data === null) return <div>Carregando...</div>

  const filteredServices = data.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

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
                  {data.length} serviços cadastrados • {data.filter(f => f.status === "ACTIVE").length} ativos • Média {formatPrice(data.reduce((acc, curr) => acc + Number(curr.price), 0) / data.length)}
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
                        <Select
                          value={formData.category}
                          onValueChange={(value) =>
                            setFormData({ ...formData, category: value })
                          }
                        >
                          <SelectTrigger id="duration">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent className="max-h-96">
                            {Object.entries(serviceCategories).map(([value, meta]) => {
                              const Icon = meta.icon;

                              return (
                              <SelectItem key={value} value={value} className="flex items-center gap-2 group">
                                <div className="flex items-center gap-2">
                                  <Icon className="text-primary group-hover:text-white" size={16} />
                                  {meta.label}
                                </div>
                              </SelectItem>
                            )
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration_minutes">Duração (minutos)</Label>
                        <Select
                          value={formData.duration_minutes}
                          onValueChange={(value) =>
                            setFormData({ ...formData, duration_minutes: value })
                          }
                        >
                          <SelectTrigger id="duration_minutes">
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
                          placeholder="Ex: 0,00"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="commission">Comissão (%)</Label>
                        <Input
                          id="commission"
                          type="number"
                          step="0.01"
                          min={0} max={100}
                          placeholder="Ex: 40"
                          value={formData.commission}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              commission: Number(e.target.value),
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value: "ACTIVE" | "DISABLED") =>
                            setFormData({ ...formData, status: value })
                          }
                        >
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Ativo</SelectItem>
                            <SelectItem value="DISABLED">Inativo</SelectItem>
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
                        className="bg-transparent text-foreground hover:bg-destructive hover:text-white"
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
                        disabled={!formData.name || !formData.category || !formData.duration_minutes || !formData.price || isNaN(formData.commission)}
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
            <Table className="w-full">
              <TableHeader className="table table-fixed z-10">
                <TableRow className="table w-full table-fixed bg-muted/50">
                  <TableHead className="font-semibold text-foreground">Serviço</TableHead>
                  <TableHead className="font-semibold text-foreground">Categoria</TableHead>
                  <TableHead className="font-semibold text-foreground">Duração</TableHead>
                  <TableHead className="font-semibold text-foreground">Preço</TableHead>
                  <TableHead className="font-semibold text-foreground">Comissão</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="font-semibold text-foreground ps-3">Ações</TableHead>
                </TableRow>
              </TableHeader>
              
              <div className="h-[600px] flex-1 flex overflow-y-auto">
                <TableBody className="block overflow-y-auto">
                  {filteredServices.length === 0 ? (
                    <TableRow className='table table-fixed w-full h-full'>
                      <TableCell colSpan={18} className="w-32 text-center py-16">
                        <div className="w-full h-96 flex flex-col justify-center items-center gap-2 text-muted-foreground">
                          <Wrench className="w-12 h-12 opacity-20" />
                          <p className="font-medium">Nenhum serviço cadastrado.</p>
                          <Button onClick={setIsAddDialogOpen}>Criar serviço</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (filteredServices.map((service) => {
                    const Icon = serviceCategories[service.category].icon;
                      
                    return (
                    <TableRow key={service.id} className="table w-full table-fixed hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{formatLimitText(service.name, 22)}</div>
                            {/* <div className="text-sm text-muted-foreground">
                              {service.description}
                            </div> */}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {serviceCategories[service.category].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{service.duration_minutes} min</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                          <DollarSign className="w-4 h-4 text-[#00A676]" />
                          <span className="text-sm font-semibold">{formatPrice(service.price, false)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {service.commission}%
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(service.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog 
                            open={editingService?.id === service.id}
                            onOpenChange={(open) => {
                              if (!open) {
                                setEditingService(null);
                                resetForm();
                              }
                            }}
                          >
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
                                  <Label>Categoria</Label>
                                  <Select
                                    value={formData.category}
                                    onValueChange={(value) =>
                                      setFormData({ ...formData, category: value })
                                    }
                                  >
                                    <SelectTrigger id="duration">
                                      <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-96">
                                      {Object.entries(serviceCategories).map(([value, meta]) => {
                                        const Icon = meta.icon;

                                        return (
                                        <SelectItem key={value} value={value} className="flex items-center gap-2 group">
                                          <div className="flex items-center gap-2">
                                            <Icon className="text-primary group-hover:text-white" size={16} />
                                            {meta.label}
                                          </div>
                                        </SelectItem>
                                      )
                                      })}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="edit-duration">
                                    Duração (minutos)
                                  </Label>
                                  <Select
                                    value={String(formData.duration_minutes)}
                                    onValueChange={(value) =>
                                      setFormData({
                                        ...formData,
                                        duration_minutes: value,
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
                                  <Label htmlFor="edit-commission">Comissão (%)</Label>
                                  <Input
                                    id="edit-commission"
                                    type="number"
                                    step="0.01"
                                    value={formData.commission}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        commission: Number(e.target.value),
                                      })
                                    }
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="edit-status">Status</Label>
                                  <Select
                                    value={formData.status}
                                    onValueChange={(
                                      value: "ACTIVE" | "DISABLED",
                                    ) =>
                                      setFormData({ ...formData, status: value })
                                    }
                                  >
                                    <SelectTrigger id="edit-status">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="ACTIVE">
                                        Ativo
                                      </SelectItem>
                                      <SelectItem value="DISABLED">
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
                                    value={formData.description ?? ''}
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
                                  className="bg-transparent text-foreground hover:bg-destructive hover:text-white"
                                  onClick={() => {
                                    setEditingService(null);
                                    resetForm();
                                  }}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  className="bg-primary hover:bg-primary/90"
                                  onClick={() => handleEditService(service.id)}
                                > 
                                  Salvar Alterações
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Popover>
                            <Tooltip disableHoverableContent>
                              <TooltipTrigger asChild>
                                <div>
                                  <PopoverTrigger asChild>
                                    <Button
                                      size="sm"
                                      className="h-8 w-8 p-0 bg-transparent text-foreground hover:bg-destructive/10 hover:text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </PopoverTrigger>
                                </div>
                              </TooltipTrigger>

                              <TooltipContent side="top" sideOffset={4} className="bg-destructive fill-destructive">
                                Excluir
                              </TooltipContent>
                            </Tooltip>

                            <PopoverContent side="left">
                              <p className="text-sm mb-2">Tem certeza que deseja excluir este serviço?</p>

                              <div className="flex justify-end gap-2">
                                <PopoverClose asChild>
                                  <Button size="sm" className="text-sm bg-transparent text-foreground hover:bg-transparent hover:text-destructive">Cancelar</Button>
                                </PopoverClose>
                                
                                <Button
                                  size="sm"
                                  className="text-sm bg-destructive text-white hover:bg-destructive/60"
                                  onClick={() => handleDeleteService(service.id)}
                                >
                                  Confirmar
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover> 
                        </div>
                      </TableCell>
                    </TableRow>
                  )} 
                ))}
                </TableBody>
              </div>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
