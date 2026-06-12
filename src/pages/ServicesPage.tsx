import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "../components/ui/select";
import { Info, Plus, Edit, Trash2, Search, Clock, Scissors, Sparkles, Hand, DollarSign, User, Heart, Brain, Stethoscope, Smile, Dumbbell, Star, Car, Wrench, Home, PawPrint, Briefcase, GraduationCap, MoreHorizontal, } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatLimitText, formatPrice } from "@/lib/parsers";
import { api } from "@/lib/api";
import { handleServiceError } from "@/lib/errorHandlers";
import { toast } from "sonner";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LoadingPage } from "./LoadingPage";
import { usePageHeader } from "@/hooks/usePageHeader";
import { useLayoutOutletContext } from "@/hooks/useLayoutOutletContext";

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
  const { dados, refreshDados } = useLayoutOutletContext();
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
  const selectedCategoryMeta = formData.category
    ? serviceCategories[formData.category]
    : null;

  usePageHeader("Serviços", "Gerencie os serviços oferecidos pelo seu negócio" );

  useEffect(() => {
    if (!dados) return;

    setDataState(dados.services);
  }, [dados])

  const handleEditService = async (id) => {
    try {
      await api.patch(`/services/${id}`, formData)
      const services = (await api.get("/services")).data.data

      setDataState(services)
      await refreshDados();
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
      await refreshDados();
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
    await refreshDados();
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

  const renderCreateServiceForm = () => (
    <div className="space-y-3 py-1 sm:space-y-4 sm:py-2">
      <div className="rounded-2xl border border-border bg-card p-3 sm:p-4">
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-foreground sm:text-sm">Informações do serviço</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Defina nome, categoria e uma descrição curta para identificar o serviço.
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs sm:text-sm">Nome do Serviço</Label>
            <Input
              id="name"
              placeholder="Ex: Corte Masculino"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="h-9 text-xs sm:h-10 sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="category" className="text-xs sm:text-sm">Categoria</Label>
              {selectedCategoryMeta && (
                <Badge variant="outline" className="gap-1.5 text-xs">
                  <selectedCategoryMeta.icon className="w-3.5 h-3.5 text-primary" />
                  {selectedCategoryMeta.label}
                </Badge>
              )}
            </div>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger id="category" className="h-9 text-xs data-[placeholder]:text-gray-500 sm:h-10 sm:text-sm">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent className="max-h-96">
                {Object.entries(serviceCategories).map(([value, meta]) => {
                  const Icon = meta.icon;

                  return (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <Icon className="text-primary" size={16} />
                        {meta.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs sm:text-sm">Descrição</Label>
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
              className="h-9 text-xs sm:h-10 sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-3 sm:p-4">
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-foreground sm:text-sm">Configuração comercial</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Configure duração, preço, comissão e disponibilidade do serviço.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration_minutes" className="text-xs sm:text-sm">Duração</Label>
            <Select
              value={formData.duration_minutes}
              onValueChange={(value) =>
                setFormData({ ...formData, duration_minutes: value })
              }
            >
              <SelectTrigger id="duration_minutes" className="h-9 text-xs data-[placeholder]:text-gray-500 sm:h-10 sm:text-sm">
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
            <Label htmlFor="status" className="text-xs sm:text-sm">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "ACTIVE" | "DISABLED") =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger id="status" className="h-9 text-xs sm:h-10 sm:text-sm">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Ativo</SelectItem>
                <SelectItem value="DISABLED">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price" className="text-xs sm:text-sm">Preço (R$)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="Ex: 0,00"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="h-9 text-xs sm:h-10 sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="commission" className="text-xs sm:text-sm">Comissão (%)</Label>
            <Input
              id="commission"
              type="number"
              step="0.01"
              min={0}
              max={100}
              placeholder="Ex: 40"
              value={formData.commission}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  commission: Number(e.target.value),
                })
              }
              className="h-9 text-xs sm:h-10 sm:text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );

  if (data === null) return <LoadingPage />

  const filteredServices = data.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-custom">
        {/* Info Banner */}
        <Card className="m-4 mb-0 border-primary/20 bg-primary/10 p-4 sm:m-6 sm:mb-0">
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
        <Card className="m-4 gap-0 overflow-hidden sm:m-6">
          <div className="border-b border-border px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Lista de Serviços
                </h3>
                <p className="text-sm text-muted-foreground">
                  {data.length} serviços cadastrados • {data.filter(f => f.status === "ACTIVE").length} ativos • Média {formatPrice(data.reduce((acc, curr) => acc + Number(curr.price), 0) / data.length)}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                <div className="relative min-w-0 flex-1 sm:max-w-64 md:max-w-72">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar serviços..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9 pl-10 text-xs sm:h-10 sm:text-sm"
                  />
                </div>

                <Dialog
                  open={isAddDialogOpen}
                  onOpenChange={(open) => {
                    setIsAddDialogOpen(open);
                    if (!open) resetForm();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-primary px-3 hover:bg-primary/90 sm:px-4">
                      <Plus className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Adicionar Serviço</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="flex max-h-[92vh] w-[calc(100vw-1.5rem)] flex-col overflow-hidden p-0 sm:max-w-[560px]">
                    <DialogHeader className="border-b border-border bg-muted/30 px-4 py-4 sm:px-6 sm:py-5">
                      <DialogTitle className="text-lg sm:text-xl">Novo Serviço</DialogTitle>
                      <DialogDescription className="text-xs sm:text-sm">
                        Preencha os dados abaixo para cadastrar o serviço.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 scrollbar-custom">
                      {renderCreateServiceForm()}
                    </div>

                    <DialogFooter className="mx-0 mb-0 border-t border-border bg-muted/20 px-4 py-3 sm:justify-end sm:px-6 sm:py-4">
                      <Button
                        className="h-9 text-xs bg-transparent text-foreground hover:bg-destructive hover:text-white sm:h-10 sm:text-sm"
                        onClick={() => {
                          setIsAddDialogOpen(false);
                          resetForm();
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        className="h-9 text-xs bg-primary hover:bg-primary/90 sm:h-10 sm:text-sm"
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

          <div className="h-[600px] overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="sticky top-0 z-10 bg-muted [&_tr]:border-b">
                <tr className="border-b transition-colors">
                  <th className="h-10 px-2 text-left align-middle font-semibold whitespace-nowrap text-foreground">Serviço</th>
                  <th className="h-10 px-2 text-left align-middle font-semibold whitespace-nowrap text-foreground">Categoria</th>
                  <th className="h-10 px-2 text-left align-middle font-semibold whitespace-nowrap text-foreground">Duração</th>
                  <th className="h-10 px-2 text-left align-middle font-semibold whitespace-nowrap text-foreground">Preço</th>
                  <th className="h-10 px-2 text-left align-middle font-semibold whitespace-nowrap text-foreground">Comissão</th>
                  <th className="h-10 px-2 text-left align-middle font-semibold whitespace-nowrap text-foreground">Status</th>
                  <th className="h-10 px-2 ps-3 text-left align-middle font-semibold whitespace-nowrap text-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredServices.length === 0 ? (
                  <tr className="border-b transition-colors">
                    <td colSpan={7} className="w-32 p-2 align-middle whitespace-nowrap py-16 text-center">
                      <div className="flex h-80 w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Wrench className="h-12 w-12 opacity-20" />
                        <p className="font-medium">Nenhum serviço cadastrado.</p>
                        <Button onClick={() => setIsAddDialogOpen(true)}>Criar serviço</Button>
                      </div>
                    </td>
                  </tr>
                ) : (filteredServices.map((service) => {
                  const Icon = serviceCategories[service.category].icon;
                    
                  return (
                  <tr key={service.id} className="border-b transition-colors hover:bg-muted/30">
                    <td className="p-2 align-middle whitespace-nowrap font-medium">
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
                      </td>
                      <td className="p-2 align-middle whitespace-nowrap">
                        <Badge variant="outline" className="text-xs">
                          {serviceCategories[service.category].label}
                        </Badge>
                      </td>
                      <td className="p-2 align-middle whitespace-nowrap">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{service.duration_minutes} min</span>
                        </div>
                      </td>
                      <td className="p-2 align-middle whitespace-nowrap font-medium">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                          <DollarSign className="w-4 h-4 text-[#00A676]" />
                          <span className="text-sm font-semibold">{formatPrice(service.price, false)}</span>
                        </div>
                      </td>
                      <td className="p-2 align-middle whitespace-nowrap text-muted-foreground">
                        {service.commission}%
                      </td>
                      <td className="p-2 align-middle whitespace-nowrap">
                        {getStatusBadge(service.status)}
                      </td>
                      <td className="p-2 align-middle whitespace-nowrap">
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
                            <DialogContent className="flex max-h-[92vh] w-[calc(100vw-1.5rem)] flex-col overflow-hidden p-0 sm:max-w-[560px]">
                              <DialogHeader className="border-b border-border bg-muted/30 px-4 py-4 sm:px-6 sm:py-5">
                                <DialogTitle className="text-lg sm:text-xl">Editar Serviço</DialogTitle>
                                <DialogDescription className="text-xs sm:text-sm">
                                  Atualize as informações do serviço.
                                </DialogDescription>
                              </DialogHeader>

                              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 scrollbar-custom">
                                {renderCreateServiceForm()}
                              </div>

                              <DialogFooter className="mx-0 mb-0 border-t border-border bg-muted/20 px-4 py-3 sm:justify-end sm:px-6 sm:py-4">
                                <Button
                                  className="h-9 text-xs bg-transparent text-foreground hover:bg-destructive hover:text-white sm:h-10 sm:text-sm"
                                  onClick={() => {
                                    setEditingService(null);
                                    resetForm();
                                  }}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  className="h-9 text-xs bg-primary hover:bg-primary/90 sm:h-10 sm:text-sm"
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

                            <PopoverContent side="left" className="w-64 p-3 sm:w-80 sm:p-4">
                              <p className="mb-2 text-xs sm:text-sm">Tem certeza que deseja excluir este serviço?</p>

                              <div className="flex justify-end gap-2">
                                <PopoverClose asChild>
                                  <Button size="sm" className="h-8 px-2 text-xs bg-transparent text-foreground hover:bg-transparent hover:text-destructive sm:h-9 sm:px-3 sm:text-sm">Cancelar</Button>
                                </PopoverClose>
                                
                                <Button
                                  size="sm"
                                  className="h-8 px-2 text-xs bg-destructive text-white hover:bg-destructive/60 sm:h-9 sm:px-3 sm:text-sm"
                                  onClick={() => handleDeleteService(service.id)}
                                >
                                  Confirmar
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </td>
                    </tr>
                  )} 
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
