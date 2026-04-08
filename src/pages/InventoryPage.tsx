import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { PageHeader } from '../components/PageHeader';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '../components/ui/table';
import { DollarSign, Package, ShoppingCart, Plus, Edit, Trash2, Search, AlertTriangle, Package2, X, } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  costPrice: number;
  salePrice: number;
  category: string;
  minStock: number;
  image?: string;
}

const mockProducts: Product[] = [
  {
    id: 1,
    name: 'POMADA MATTE 80g - 40.00',
    quantity: 15,
    unit: 'un',
    costPrice: 20,
    salePrice: 40,
    category: 'Finalizadores',
    minStock: 5,
  },
  {
    id: 2,
    name: 'BRILHO 150g - 30gr',
    quantity: 30,
    unit: 'un',
    costPrice: 15,
    salePrice: 30,
    category: 'Finalizadores',
    minStock: 10,
  },
  {
    id: 3,
    name: 'OLEO P/ BARBA - 50.00',
    quantity: 12,
    unit: 'un',
    costPrice: 25,
    salePrice: 50,
    category: 'Barba',
    minStock: 5,
  },
  {
    id: 4,
    name: 'ESSENCIA CORPORAL - 120g',
    quantity: 35,
    unit: 'un',
    costPrice: 18,
    salePrice: 35,
    category: 'Corpo',
    minStock: 10,
  },
  {
    id: 5,
    name: 'POMADA EM PO - 70g',
    quantity: 18,
    unit: 'un',
    costPrice: 22,
    salePrice: 45,
    category: 'Finalizadores',
    minStock: 8,
  },
  {
    id: 6,
    name: 'HIDRATANTE CAPILAR 150 g - HIDRATANTE CAPILAR 100 g',
    quantity: 0,
    unit: 'un',
    costPrice: 30,
    salePrice: 65,
    category: 'Tratamento',
    minStock: 5,
  },
  {
    id: 7,
    name: 'P. BRILHO - POMADA BRILHO CREMITAM BARACUBA 90g',
    quantity: 10,
    unit: 'un',
    costPrice: 19,
    salePrice: 38,
    category: 'Finalizadores',
    minStock: 5,
  },
  {
    id: 8,
    name: 'OLEO HAIR - 120 ML',
    quantity: 4,
    unit: 'un',
    costPrice: 28,
    salePrice: 55,
    category: 'Tratamento',
    minStock: 8,
  },
];

export function InventoryPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: 'un',
    costPrice: '',
    salePrice: '',
    category: '',
    minStock: '',
  });

  // Calculate metrics
  const totalSaleValue = products.reduce(
    (sum, p) => sum + p.quantity * p.salePrice,
    0
  );
  const totalCostValue = products.reduce(
    (sum, p) => sum + p.quantity * p.costPrice,
    0
  );
  const totalProducts = products.reduce((sum, p) => sum + p.quantity, 0);
  const lowStockProducts = products.filter(p => p.quantity > 0 && p.quantity <= p.minStock).length;
  const outOfStockProducts = products.filter(p => p.quantity === 0).length;

  // Filter products
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: Math.max(...products.map(p => p.id)) + 1,
      name: formData.name,
      quantity: parseInt(formData.quantity),
      unit: formData.unit,
      costPrice: parseFloat(formData.costPrice),
      salePrice: parseFloat(formData.salePrice),
      category: formData.category,
      minStock: parseInt(formData.minStock),
      image: productImage || undefined,
    };

    setProducts([...products, newProduct]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditProduct = () => {
    if (!editingProduct) return;

    setProducts(
      products.map(p =>
        p.id === editingProduct.id
          ? {
              ...editingProduct,
              name: formData.name,
              quantity: parseInt(formData.quantity),
              unit: formData.unit,
              costPrice: parseFloat(formData.costPrice),
              salePrice: parseFloat(formData.salePrice),
              category: formData.category,
              minStock: parseInt(formData.minStock),
              image: productImage || undefined,
            }
          : p
      )
    );

    setEditingProduct(null);
    resetForm();
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      quantity: product.quantity.toString(),
      unit: product.unit,
      costPrice: product.costPrice.toString(),
      salePrice: product.salePrice.toString(),
      category: product.category,
      minStock: product.minStock.toString(),
    });
    setProductImage(product.image || null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      quantity: '',
      unit: 'un',
      costPrice: '',
      salePrice: '',
      category: '',
      minStock: '',
    });
    setProductImage(null);
  };

  const getStockStatus = (product: Product) => {
    if (product.quantity === 0) {
      return { label: 'Esgotado', color: 'bg-[#E63946] text-white' };
    }
    if (product.quantity <= product.minStock) {
      return { label: 'Estoque baixo', color: 'bg-yellow-500 text-white' };
    }
    return { label: 'Em estoque', color: 'bg-[#00A676] text-white' };
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <PageHeader
        title="Gerenciamento de Estoque"
        subtitle="Controle seus produtos, quantidades e valores"
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-custom">
        <div className="p-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <Card className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total em Vendas
                  </p>
                  <h3 className="text-2xl font-semibold text-[#00A676]">
                    R$ {totalSaleValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-lg bg-[#00A676]/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-[#00A676]" />
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total de Custo
                  </p>
                  <h3 className="text-2xl font-semibold text-[#E63946]">
                    R$ {totalCostValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-lg bg-[#E63946]/10 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-[#E63946]" />
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total de Produtos
                  </p>
                  <h3 className="text-2xl font-semibold text-foreground">
                    {totalProducts}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-600/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Estoque Baixo
                  </p>
                  <h3 className="text-2xl font-semibold text-yellow-600">
                    {lowStockProducts}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    produtos precisam atenção
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-yellow-600/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Esgotado
                  </p>
                  <h3 className="text-2xl font-semibold text-[#E63946]">
                    {outOfStockProducts}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    produtos sem estoque
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-[#E63946]/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-[#E63946]" />
                </div>
              </div>
            </Card>
          </div>

          {/* Search and Table */}
          <Card className="overflow-hidden gap-0">
            <div className="py-4 px-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  Produtos em Estoque
                </h2>
                <div className="flex items-center gap-3">
                  <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar produtos..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#00A676] hover:bg-[#00A676]/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Produto
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Adicionar Novo Produto</DialogTitle>
                        <DialogDescription>
                          Preencha as informações do produto para adicionar ao estoque
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="col-span-2 space-y-2">
                          <Label htmlFor="name">Nome do Produto</Label>
                          <Input
                            id="name"
                            placeholder="Ex: Pomada Matte 80g"
                            value={formData.name}
                            onChange={e =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category">Categoria</Label>
                          <Input
                            id="category"
                            placeholder="Ex: Finalizadores"
                            value={formData.category}
                            onChange={e =>
                              setFormData({ ...formData, category: e.target.value })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="unit">Unidade</Label>
                          <Select
                            value={formData.unit}
                            onValueChange={value =>
                              setFormData({ ...formData, unit: value })
                            }
                          >
                            <SelectTrigger id="unit">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="un">Unidade (un)</SelectItem>
                              <SelectItem value="kg">Quilograma (kg)</SelectItem>
                              <SelectItem value="g">Grama (g)</SelectItem>
                              <SelectItem value="ml">Mililitro (ml)</SelectItem>
                              <SelectItem value="l">Litro (l)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="quantity">Quantidade</Label>
                          <Input
                            id="quantity"
                            type="number"
                            placeholder="0"
                            value={formData.quantity}
                            onChange={e =>
                              setFormData({ ...formData, quantity: e.target.value })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="minStock">Estoque Mínimo</Label>
                          <Input
                            id="minStock"
                            type="number"
                            placeholder="0"
                            value={formData.minStock}
                            onChange={e =>
                              setFormData({ ...formData, minStock: e.target.value })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="costPrice">Preço de Custo (R$)</Label>
                          <Input
                            id="costPrice"
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            value={formData.costPrice}
                            onChange={e =>
                              setFormData({ ...formData, costPrice: e.target.value })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="salePrice">Preço de Venda (R$)</Label>
                          <Input
                            id="salePrice"
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            value={formData.salePrice}
                            onChange={e =>
                              setFormData({ ...formData, salePrice: e.target.value })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="image">Imagem do Produto</Label>
                          {productImage ? (
                            <div className="relative">
                              <img 
                                src={productImage} 
                                alt="Preview" 
                                className="w-full h-32 object-cover rounded-lg border border-border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => setProductImage(null)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="relative">
                              <Input
                                id="image"
                                type="file"
                                accept="image/*"
                                className="cursor-pointer"
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setProductImage(reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </div>
                          )}
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
                          onClick={handleAddProduct}
                          disabled={
                            !formData.name ||
                            !formData.quantity ||
                            !formData.costPrice ||
                            !formData.salePrice
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

            <div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-center">Quantidade</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Preço de Custo</TableHead>
                    <TableHead className="text-right">Preço de Venda</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map(product => {
                    const status = getStockStatus(product);
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium max-w-md">
                          <div className="flex items-center gap-3">
                            {product.image ? (
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-10 h-10 rounded-lg object-cover border border-border flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                <Package2 className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                            <span className="truncate">{product.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {product.quantity} {product.unit}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`text-xs ${status.color}`}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          R$ {product.costPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          R$ {product.salePrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          R${' '}
                          {(product.quantity * product.salePrice).toLocaleString(
                            'pt-BR',
                            { minimumFractionDigits: 2 }
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditDialog(product)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                  <DialogTitle>Editar Produto</DialogTitle>
                                  <DialogDescription>
                                    Atualize as informações do produto
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="grid grid-cols-2 gap-4 py-4">
                                  <div className="col-span-2 space-y-2">
                                    <Label htmlFor="edit-name">Nome do Produto</Label>
                                    <Input
                                      id="edit-name"
                                      value={formData.name}
                                      onChange={e =>
                                        setFormData({ ...formData, name: e.target.value })
                                      }
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-category">Categoria</Label>
                                    <Input
                                      id="edit-category"
                                      value={formData.category}
                                      onChange={e =>
                                        setFormData({ ...formData, category: e.target.value })
                                      }
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-unit">Unidade</Label>
                                    <Select
                                      value={formData.unit}
                                      onValueChange={value =>
                                        setFormData({ ...formData, unit: value })
                                      }
                                    >
                                      <SelectTrigger id="edit-unit">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="un">Unidade (un)</SelectItem>
                                        <SelectItem value="kg">Quilograma (kg)</SelectItem>
                                        <SelectItem value="g">Grama (g)</SelectItem>
                                        <SelectItem value="ml">Mililitro (ml)</SelectItem>
                                        <SelectItem value="l">Litro (l)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-quantity">Quantidade</Label>
                                    <Input
                                      id="edit-quantity"
                                      type="number"
                                      value={formData.quantity}
                                      onChange={e =>
                                        setFormData({ ...formData, quantity: e.target.value })
                                      }
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-minStock">Estoque Mínimo</Label>
                                    <Input
                                      id="edit-minStock"
                                      type="number"
                                      value={formData.minStock}
                                      onChange={e =>
                                        setFormData({ ...formData, minStock: e.target.value })
                                      }
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-costPrice">Preço de Custo (R$)</Label>
                                    <Input
                                      id="edit-costPrice"
                                      type="number"
                                      step="0.01"
                                      value={formData.costPrice}
                                      onChange={e =>
                                        setFormData({ ...formData, costPrice: e.target.value })
                                      }
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-salePrice">Preço de Venda (R$)</Label>
                                    <Input
                                      id="edit-salePrice"
                                      type="number"
                                      step="0.01"
                                      value={formData.salePrice}
                                      onChange={e =>
                                        setFormData({ ...formData, salePrice: e.target.value })
                                      }
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-image">Imagem do Produto</Label>
                                    {productImage ? (
                                      <div className="relative">
                                        <img 
                                          src={productImage} 
                                          alt="Preview" 
                                          className="w-full h-32 object-cover rounded-lg border border-border"
                                        />
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="sm"
                                          className="absolute top-2 right-2"
                                          onClick={() => setProductImage(null)}
                                        >
                                          <X className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="relative">
                                        <Input
                                          id="edit-image"
                                          type="file"
                                          accept="image/*"
                                          className="cursor-pointer"
                                          onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              const reader = new FileReader();
                                              reader.onloadend = () => {
                                                setProductImage(reader.result as string);
                                              };
                                              reader.readAsDataURL(file);
                                            }
                                          }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setEditingProduct(null);
                                      resetForm();
                                    }}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    className="bg-[#00A676] hover:bg-[#00A676]/90"
                                    onClick={handleEditProduct}
                                  >
                                    Salvar Alterações
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-[#E63946] border-[#E63946]/20 hover:bg-[#E63946]/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}