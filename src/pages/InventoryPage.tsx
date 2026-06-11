import { useEffect, useRef, useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '../components/ui/select';
import { DollarSign, Package, ShoppingCart, Plus, Edit, Trash2, Search, AlertTriangle, Package2, X, Scissors, User, Sparkles, Hand, Heart, Brain, Stethoscope, Smile, Dumbbell, Star, Car, Wrench, Home, PawPrint, Briefcase, GraduationCap, MoreHorizontal, Minus, PackageOpen, } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatLimitText, formatPrice } from '@/lib/parsers';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { handleProductError } from '@/lib/errorHandlers';
import { LoadingPage } from './LoadingPage';
import { usePageHeader } from '@/hooks/usePageHeader';
import { useLayoutOutletContext } from '@/hooks/useLayoutOutletContext';

const productCategories = {
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

export function InventoryPage() {
  const { dados, refreshDados } = useLayoutOutletContext();
  const quantityUpdateTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const pendingQuantityUpdatesRef = useRef<Record<number, number>>({});
  const [data, setDataState] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [quickFilter, setQuickFilter] = useState<'low' | 'out' | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    cost_price: '',
    category: '',
    company_id: localStorage.getItem('companyId')
  });

  usePageHeader("Gerenciamento de Estoque", "Controle seus produtos, quantidades e valores" );

  useEffect(() => {
    if (!dados) return;
    
    setDataState(dados.products);
  }, [dados])

  useEffect(() => {
    return () => {
      Object.values(quantityUpdateTimersRef.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const lowStockThreshold = Number(dados?.settings?.lowStockThreshold ?? data?.lowStockThreshold ?? 2);
  const selectedCategoryMeta = formData.category
    ? productCategories[formData.category]
    : null;

  const fetchPageData = async () => {
    const response = (await api.get(`/companies/${localStorage.getItem('companyId')}/products`)).data.data

    setDataState(response)
  }
  const getStatusBadge = (quantity) => {
    let status = 'estoque';

    if (quantity === 0) {
      status = 'esgotado'
    } else if (quantity <= lowStockThreshold) {
      status = 'baixo';
    }
    
    const statusConfig = {
      estoque: { label: 'Em estoque', className: 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20' },
      baixo: { label: 'Estoque baixo', className: 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 hover:bg-yellow-500/20' },
      esgotado: { label: 'Esgotado', className: 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20' },
    };
    
    const config = statusConfig[status];
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      quantity: '',
      cost_price: '',
      category: '',
      company_id: localStorage.getItem('companyId')
    });
  };

  const handleAddProduct = async () => {
    try {
      await api.post("/products", formData)

      toast.success('Produto adicionado com sucesso!')
      setIsAddDialogOpen(false);
      resetForm();
    } catch (err) {
      handleProductError(err)
    } finally {
      await Promise.all([fetchPageData(), refreshDados()])
    }
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      quantity: product.quantity,
      cost_price: product.cost_price,
      category: product.category,
      company_id: localStorage.getItem('companyId')
    });
  };

  const handleEditProduct = async (id) => {
    try {
      await api.patch(`/products/${id}`, formData)

      toast.success('Produto alterado com sucesso!')
      setIsAddDialogOpen(false);
      resetForm();
    } catch (err) {
      handleProductError(err)
    } finally {
      await Promise.all([fetchPageData(), refreshDados()]);
      setEditingProduct(null);
      resetForm();
    }    
  };

  const handleDeleteProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`)

      toast.success('Produto deletado com sucesso!');
    } catch (err) {
      handleProductError(err)
    } finally {
      await Promise.all([fetchPageData(), refreshDados()]);
    }
    
  };

  const flushQuantityUpdate = async (id: number) => {
    const quantity = pendingQuantityUpdatesRef.current[id];

    if (quantity === undefined) return;

    try {
      await api.patch(`/products/${id}`, { id, quantity });
      toast.success('Quantidade alterada com sucesso!');
      await Promise.all([fetchPageData(), refreshDados()]);
    } catch (err) {
      handleProductError(err);
      await Promise.all([fetchPageData(), refreshDados()]);
    } finally {
      delete pendingQuantityUpdatesRef.current[id];
      delete quantityUpdateTimersRef.current[id];
    }
  };

  const changeQuantity = (id: number, delta: number) => {
    const currentProduct = data?.products?.find((product) => product.id === id);
    const currentQuantity =
      pendingQuantityUpdatesRef.current[id] ?? currentProduct?.quantity ?? 0;
    const nextQuantity = currentQuantity + delta;

    if (nextQuantity < 0 || nextQuantity > 999) {
      toast.error('Quantidade fora do alcance.');
      return;
    }

    pendingQuantityUpdatesRef.current[id] = nextQuantity;

    setDataState((prev) => {
      if (!prev) return prev;

      const updatedProducts = prev.products.map((product) =>
        product.id === id ? { ...product, quantity: nextQuantity } : product,
      );

      const totalProducts = updatedProducts.length;
      const totalCost = updatedProducts.reduce(
        (sum, product) => sum + Number(product.cost_price) * Number(product.quantity),
        0,
      );
      const lowStock = updatedProducts.filter(
        (product) => product.quantity > 0 && product.quantity <= lowStockThreshold,
      ).length;
      const outOfStock = updatedProducts.filter((product) => product.quantity === 0).length;

      return {
        ...prev,
        products: updatedProducts,
        totalProducts,
        totalCost,
        lowStock,
        outOfStock,
      };
    });

    if (quantityUpdateTimersRef.current[id]) {
      clearTimeout(quantityUpdateTimersRef.current[id]);
    }

    quantityUpdateTimersRef.current[id] = setTimeout(() => {
      flushQuantityUpdate(id);
    }, 450);
  };

  const renderProductFormFields = () => (
    <div className="space-y-3 py-1 sm:space-y-4 sm:py-2">
      <div className="rounded-2xl border border-border bg-card p-3 sm:p-4">
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-foreground sm:text-sm">Informações do produto</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Defina nome e categoria para facilitar a organização do estoque.
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-name" className="text-xs sm:text-sm">Nome do Produto</Label>
            <Input
              id="product-name"
              placeholder="Ex: Pomada Matte 80g"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="h-9 text-xs sm:h-10 sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label className="text-xs sm:text-sm">Categoria</Label>
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
              <SelectTrigger id="product-category" className="h-9 text-xs data-[placeholder]:text-gray-500 sm:h-10 sm:text-sm">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent className="max-h-96">
                {Object.entries(productCategories).map(([value, meta]) => {
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
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-3 sm:p-4">
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-foreground sm:text-sm">Controle de estoque</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Informe quantidade disponível e custo unitário do produto.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="space-y-2">
            <Label htmlFor="product-quantity" className="text-xs sm:text-sm">Quantidade</Label>
            <Input
              id="product-quantity"
              type="number"
              min={0}
              max={999}
              placeholder="0"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              className="h-9 text-xs sm:h-10 sm:text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Informe a quantidade atual em estoque.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-cost-price" className="text-xs sm:text-sm">Preço de Custo</Label>
            <Input
              id="product-cost-price"
              type="number"
              step="0.01"
              min={0}
              placeholder="0,00"
              value={formData.cost_price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cost_price: e.target.value,
                })
              }
              className="h-9 text-xs sm:h-10 sm:text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Valor unitário pago pelo produto.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (data === null) return <LoadingPage />

  const filteredProducts = data.products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (quickFilter === 'out') return product.quantity === 0;
    if (quickFilter === 'low') return product.quantity > 0 && product.quantity <= lowStockThreshold;

    return true;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-custom">
        <div className="p-4 sm:p-6">
          {/* Metrics Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="mb-1 text-sm text-muted-foreground">Total de custo</p>
                  <h3 className="mb-2 text-2xl font-semibold text-destructive sm:text-3xl">{formatPrice(data.totalCost)}</h3>
                </div>
                <div className="rounded-lg bg-destructive/10 p-3 sm:p-4">
                  <ShoppingCart className="w-6 h-6 text-destructive" />
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="mb-1 text-sm text-muted-foreground">Total de produtos</p>
                  <h3 className="mb-2 text-2xl font-semibold text-blue-600 sm:text-3xl">{data.totalProducts}</h3>
                </div>
                <div className="rounded-lg bg-blue-600/10 p-3 sm:p-4">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="mb-1 text-sm text-muted-foreground">Estoque baixo</p>
                  <h3 className="mb-2 text-2xl font-semibold text-yellow-600 sm:text-3xl">{data.lowStock}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    produtos com até {lowStockThreshold} unidade{lowStockThreshold === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="rounded-lg bg-yellow-600/10 p-3 sm:p-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="mb-1 text-sm text-muted-foreground">Esgotado</p>
                  <h3 className="mb-2 text-2xl font-semibold text-destructive sm:text-3xl">{data.outOfStock}</h3>
                  <p className="text-xs text-muted-foreground mt-1">produtos sem estoque</p>
                </div>
                <div className="rounded-lg bg-destructive/10 p-3 sm:p-4">
                  <PackageOpen className="w-6 h-6 text-destructive" />
                </div>
              </div>
            </Card>
          </div>

          {/* Search and Table */}
          <Card className="overflow-hidden gap-0">
            <div className="border-b border-border px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  Meus produtos
                </h2>
                <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                  <div className="relative min-w-0 flex-1 sm:max-w-64 md:max-w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar produtos..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="h-9 pl-10 text-xs sm:h-10 sm:text-sm"
                    />
                  </div>

                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        type="button"
                        onClick={() => setQuickFilter((prev) => (prev === 'low' ? null : 'low'))}
                        className={`h-9 px-3 sm:h-10 ${quickFilter === 'low'
                            ? 'border border-yellow-500/30 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20'
                            : 'border border-border bg-default text-foreground hover:bg-yellow-500/10 hover:text-yellow-600'
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={4} className="bg-yellow-500 fill-yellow-500">
                      Filtrar produtos com estoque baixo
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        type="button"
                        onClick={() => setQuickFilter((prev) => (prev === 'out' ? null : 'out'))}
                        className={`h-9 px-3 sm:h-10 ${quickFilter === 'out'
                            ? 'border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20'
                            : 'border border-border bg-default text-foreground hover:bg-destructive/10 hover:text-destructive'
                        }`}
                      >
                        <PackageOpen className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={4} className="bg-destructive fill-destructive">
                      Filtrar produtos esgotados
                    </TooltipContent>
                  </Tooltip>
                  

                  
                  
                  <Dialog 
                    open={isAddDialogOpen}
                    onOpenChange={(open) => {
                      setIsAddDialogOpen(open);

                      if (!open) {
                        resetForm();
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-primary px-3 hover:bg-primary/90 sm:px-4">
                        <Plus className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Adicionar Produto</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="flex max-h-[92vh] w-[calc(100vw-1.5rem)] flex-col overflow-hidden p-0 sm:max-w-[560px]">
                      <DialogHeader className="border-b border-border bg-muted/30 px-4 py-4 sm:px-6 sm:py-5">
                        <DialogTitle className="text-lg sm:text-xl">Novo Produto</DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                          Preencha os dados abaixo para cadastrar o produto no estoque.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 scrollbar-custom">
                        {renderProductFormFields()}
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
                          onClick={handleAddProduct}
                          disabled={
                            !formData.name ||
                            !formData.category ||
                            !formData.quantity ||
                            !formData.cost_price
                          }
                        >
                          Adicionar Produto
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            <div className="h-[550px] overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="sticky top-0 z-10 bg-muted [&_tr]:border-b">
                  <tr className="border-b transition-colors">
                    <th className="h-10 px-2 text-left align-middle font-semibold whitespace-nowrap text-foreground">Nome</th>
                    <th className="h-10 px-2 text-left align-middle font-semibold whitespace-nowrap text-foreground">Categoria</th>
                    <th className="h-10 px-2 text-left align-middle font-semibold whitespace-nowrap text-foreground">Quantidade</th>
                    <th className="h-10 px-2 text-left align-middle font-semibold whitespace-nowrap text-foreground">Status</th>
                    <th className="h-10 px-2 text-left align-middle font-semibold whitespace-nowrap text-foreground">Preço de custo</th>
                    <th className="h-10 px-2 text-left align-middle font-semibold whitespace-nowrap text-foreground">Valor total</th>
                    <th className="h-10 px-2 ps-3 text-left align-middle font-semibold whitespace-nowrap text-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {filteredProducts.length === 0 ? (
                    <tr className="border-b transition-colors">
                      <td colSpan={7} className="w-32 p-2 align-middle whitespace-nowrap text-center py-16">
                        <div className="flex h-80 w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                          <Package className="h-12 w-12 opacity-20" />
                          <p className="font-medium">Nenhum produto encontrado.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (filteredProducts.map((product) => {
                    const Icon = productCategories[product.category].icon;

                    return (
                      <tr key={product.id} className="border-b transition-colors hover:bg-muted/30">
                        <td className="p-2 align-middle whitespace-nowrap font-medium">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                              <Icon className="text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{formatLimitText(product.name, 22)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-2 align-middle whitespace-nowrap">
                          <Badge variant="outline" className="text-xs">
                            {productCategories[product.category].label}
                          </Badge>
                        </td>
                        <td className="p-2 align-middle whitespace-nowrap font-medium">
                          <div className="flex w-32 items-center justify-between">
                            <Button variant='secondary' size='xs' className='mr-1 w-8' onClick={() => changeQuantity(product.id, -1)}><Minus /></Button>
                            {product.quantity} un
                            <Button variant='secondary' size='xs' className='ml-1 w-8' onClick={() => changeQuantity(product.id, 1)}><Plus /></Button>
                          </div>
                        </td>
                        <td className="p-2 align-middle whitespace-nowrap">
                          {getStatusBadge(product.quantity)}
                        </td>
                        <td className="p-2 align-middle whitespace-nowrap font-medium">
                          <div className="flex items-center gap-1.5 font-semibold text-foreground">
                            <DollarSign className="h-4 w-4 text-[#00A676]" />
                            <span className="text-sm font-semibold">{formatPrice(product.cost_price, false)}</span>
                          </div>
                        </td>
                        <td className="p-2 align-middle whitespace-nowrap font-medium">
                          <div className="flex items-center gap-1.5 font-semibold text-foreground">
                            <DollarSign className="h-4 w-4 text-[#00A676]" />
                            <span className="text-sm font-semibold">{formatPrice(product.cost_price * product.quantity, false)}</span>
                          </div>
                        </td>
                        <td className="p-2 align-middle whitespace-nowrap">
                          <div className="flex gap-2">
                              <Dialog 
                                open={editingProduct?.id === product.id}
                                onOpenChange={(open) => {
                                  if (!open) {
                                    setEditingProduct(null);
                                    resetForm();
                                  }
                                }}
                              >
                                <Tooltip disableHoverableContent>
                                  <TooltipTrigger asChild>
                                    <div>
                                      <DialogTrigger asChild>
                                        <Button
                                          onClick={() => openEditDialog(product)}
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
                                    <DialogTitle className="text-lg sm:text-xl">Editar Produto</DialogTitle>
                                    <DialogDescription className="text-xs sm:text-sm">
                                      Atualize as informações do produto no estoque.
                                    </DialogDescription>
                                  </DialogHeader>

                                  <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 scrollbar-custom">
                                    {renderProductFormFields()}
                                  </div>

                                  <DialogFooter className="mx-0 mb-0 border-t border-border bg-muted/20 px-4 py-3 sm:justify-end sm:px-6 sm:py-4">
                                    <Button
                                      className="h-9 text-xs bg-transparent text-foreground hover:bg-destructive hover:text-white sm:h-10 sm:text-sm"
                                      onClick={() => {
                                        setEditingProduct(null);
                                        resetForm();
                                      }}
                                    >
                                      Cancelar
                                    </Button>
                                    <Button
                                      className="h-9 text-xs bg-primary hover:bg-primary/90 sm:h-10 sm:text-sm"
                                      onClick={() => handleEditProduct(product.id)}
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
                                  <p className="mb-2 text-xs sm:text-sm">Tem certeza que deseja excluir este produto?</p>

                                  <div className="flex justify-end gap-2">
                                    <PopoverClose asChild>
                                      <Button size="sm" className="h-8 px-2 text-xs bg-transparent text-foreground hover:bg-transparent hover:text-destructive sm:h-9 sm:px-3 sm:text-sm">Cancelar</Button>
                                    </PopoverClose>
                                    
                                    <Button
                                      size="sm"
                                      className="h-8 px-2 text-xs bg-destructive text-white hover:bg-destructive/60 sm:h-9 sm:px-3 sm:text-sm"
                                      onClick={() => handleDeleteProduct(product.id)}
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
    </div>
  );
}
