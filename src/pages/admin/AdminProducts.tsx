import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Filter, MoreHorizontal, Loader2, CheckSquare, Square, Power, PowerOff, Percent, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import ProductForm from '@/components/admin/ProductForm';
import ProductCSVImport from '@/components/admin/ProductCSVImport';
import { useDBProducts, useCategories, useCreateProduct, useUpdateProduct, useDeleteProduct, DBProduct } from '@/hooks/useAdminData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminProducts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DBProduct | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  
  // Bulk action states
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkPriceOpen, setBulkPriceOpen] = useState(false);
  const [bulkPriceAction, setBulkPriceAction] = useState<'increase' | 'decrease'>('increase');
  const [bulkPricePercent, setBulkPricePercent] = useState(10);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const { data: products, isLoading, refetch } = useDBProducts();
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const filteredProducts = (products || []).filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (data: Partial<DBProduct>) => {
    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, data }, {
        onSuccess: () => {
          setIsFormOpen(false);
          setEditingProduct(null);
        }
      });
    } else {
      createProduct.mutate(data, {
        onSuccess: () => {
          setIsFormOpen(false);
        }
      });
    }
  };

  const handleDelete = () => {
    if (deletingProductId) {
      deleteProduct.mutate(deletingProductId, {
        onSuccess: () => setDeletingProductId(null)
      });
    }
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString()}`;

  // Bulk selection handlers
  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const selectAllVisible = () => {
    const newSelected = new Set(selectedProducts);
    filteredProducts.forEach(p => newSelected.add(p.id));
    setSelectedProducts(newSelected);
  };

  const deselectAll = () => {
    setSelectedProducts(new Set());
  };

  const isAllSelected = filteredProducts.length > 0 && filteredProducts.every(p => selectedProducts.has(p.id));

  // Bulk actions
  const handleBulkActivate = async (activate: boolean) => {
    if (selectedProducts.size === 0) return;
    setBulkActionLoading(true);
    
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: activate })
        .in('id', Array.from(selectedProducts));

      if (error) throw error;
      
      toast.success(`${selectedProducts.size} products ${activate ? 'activated' : 'deactivated'}`);
      setSelectedProducts(new Set());
      refetch();
    } catch (error) {
      console.error('Bulk activate error:', error);
      toast.error('Failed to update products');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;
    setBulkActionLoading(true);
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', Array.from(selectedProducts));

      if (error) throw error;
      
      toast.success(`${selectedProducts.size} products deleted`);
      setSelectedProducts(new Set());
      setBulkDeleteOpen(false);
      refetch();
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete products');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkPriceUpdate = async () => {
    if (selectedProducts.size === 0) return;
    setBulkActionLoading(true);
    
    try {
      const selectedProductList = products?.filter(p => selectedProducts.has(p.id)) || [];
      
      for (const product of selectedProductList) {
        const multiplier = bulkPriceAction === 'increase' 
          ? (1 + bulkPricePercent / 100) 
          : (1 - bulkPricePercent / 100);
        
        const newPrice = Math.round(Number(product.price) * multiplier);
        const newOriginalPrice = product.original_price 
          ? Math.round(Number(product.original_price) * multiplier) 
          : null;
        
        await supabase
          .from('products')
          .update({ 
            price: newPrice,
            original_price: newOriginalPrice 
          })
          .eq('id', product.id);
      }
      
      toast.success(`Prices updated for ${selectedProducts.size} products`);
      setSelectedProducts(new Set());
      setBulkPriceOpen(false);
      refetch();
    } catch (error) {
      console.error('Bulk price update error:', error);
      toast.error('Failed to update prices');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkToggleFlag = async (flag: 'is_featured' | 'is_new' | 'is_bestseller' | 'is_trending', value: boolean) => {
    if (selectedProducts.size === 0) return;
    setBulkActionLoading(true);
    
    try {
      const { error } = await supabase
        .from('products')
        .update({ [flag]: value })
        .in('id', Array.from(selectedProducts));

      if (error) throw error;
      
      const flagLabel = flag.replace('is_', '').replace('_', ' ');
      toast.success(`${selectedProducts.size} products marked as ${value ? '' : 'not '}${flagLabel}`);
      setSelectedProducts(new Set());
      refetch();
    } catch (error) {
      console.error('Bulk flag update error:', error);
      toast.error('Failed to update products');
    } finally {
      setBulkActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl mb-2">Products</h1>
          <p className="text-muted-foreground">{products?.length || 0} products in catalog</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setIsImportOpen(true)}>
            <Upload className="w-4 h-4" />
            Import CSV
          </Button>
          <Button className="gap-2" onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}>
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedProducts.size > 0 && (
        <div className="flex items-center gap-3 p-4 bg-accent rounded-lg border border-primary/20">
          <span className="font-medium text-sm">
            {selectedProducts.size} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={deselectAll}
            className="gap-1"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
          <div className="h-4 w-px bg-border" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkActivate(true)}
            disabled={bulkActionLoading}
            className="gap-1"
          >
            <Power className="w-4 h-4" />
            Activate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkActivate(false)}
            disabled={bulkActionLoading}
            className="gap-1"
          >
            <PowerOff className="w-4 h-4" />
            Deactivate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBulkPriceOpen(true)}
            disabled={bulkActionLoading}
            className="gap-1"
          >
            <Percent className="w-4 h-4" />
            Update Prices
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Set Flags
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleBulkToggleFlag('is_featured', true)}>Mark Featured</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkToggleFlag('is_featured', false)}>Unmark Featured</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleBulkToggleFlag('is_new', true)}>Mark New</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkToggleFlag('is_new', false)}>Unmark New</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleBulkToggleFlag('is_bestseller', true)}>Mark Bestseller</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkToggleFlag('is_bestseller', false)}>Unmark Bestseller</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleBulkToggleFlag('is_trending', true)}>Mark Trending</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkToggleFlag('is_trending', false)}>Unmark Trending</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setBulkDeleteOpen(true)}
            disabled={bulkActionLoading}
            className="gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={isAllSelected ? deselectAll : selectAllVisible}
            title={isAllSelected ? 'Deselect all' : 'Select all visible'}
          >
            {isAllSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          </Button>
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              {selectedCategory === 'all' ? 'All Categories' : categories?.find(c => c.id === selectedCategory)?.name || 'Category'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedCategory('all')}>All Categories</DropdownMenuItem>
            {categories?.map((cat) => (
              <DropdownMenuItem key={cat.id} onClick={() => setSelectedCategory(cat.id)}>{cat.name}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <div 
            key={product.id} 
            className={`bg-background rounded-xl border overflow-hidden group transition-all ${
              selectedProducts.has(product.id) 
                ? 'border-primary ring-2 ring-primary/20' 
                : 'border-border/50 hover:border-border'
            }`}
          >
            <div className="relative aspect-square">
              <img src={(product.images as string[])?.[0] || '/placeholder.svg'} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="icon" variant="secondary" className="rounded-full" onClick={() => { setEditingProduct(product); setIsFormOpen(true); }}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="destructive" className="rounded-full" onClick={() => setDeletingProductId(product.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Selection checkbox */}
              <div className="absolute top-2 left-2">
                <Checkbox
                  checked={selectedProducts.has(product.id)}
                  onCheckedChange={() => toggleProductSelection(product.id)}
                  className="bg-background/80 border-2"
                />
              </div>
              
              {product.is_new && <Badge className="absolute top-2 right-2">New</Badge>}
              {product.discount_percent && <Badge variant="destructive" className="absolute top-10 right-2">-{product.discount_percent}%</Badge>}
              {!product.is_active && (
                <Badge variant="secondary" className="absolute bottom-2 left-2">
                  Inactive
                </Badge>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-muted-foreground">{categories?.find(c => c.id === product.category_id)?.name || 'Uncategorized'}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0"><MoreHorizontal className="w-4 h-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setEditingProduct(product); setIsFormOpen(true); }}>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => setDeletingProductId(product.id)}>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-semibold">{formatPrice(Number(product.price))}</span>
                {product.original_price && <span className="text-xs text-muted-foreground line-through">{formatPrice(Number(product.original_price))}</span>}
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant={product.stock_quantity > 0 ? 'secondary' : 'destructive'} className="text-xs">
                  {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                </Badge>
                {product.is_featured && <Badge variant="outline" className="text-xs">Featured</Badge>}
                {product.is_bestseller && <Badge variant="outline" className="text-xs">Bestseller</Badge>}
                {product.is_trending && <Badge variant="outline" className="text-xs">Trending</Badge>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && <div className="text-center py-12"><p className="text-muted-foreground">No products found</p></div>}

      <ProductForm isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setEditingProduct(null); }} onSubmit={handleSubmit} product={editingProduct} isLoading={createProduct.isPending || updateProduct.isPending} />

      {/* Single Delete Dialog */}
      <AlertDialog open={!!deletingProductId} onOpenChange={() => setDeletingProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this product? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedProducts.size} Products</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedProducts.size} products? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={bulkActionLoading}
            >
              {bulkActionLoading ? 'Deleting...' : 'Delete All'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Price Update Dialog */}
      <Dialog open={bulkPriceOpen} onOpenChange={setBulkPriceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Prices for {selectedProducts.size} Products</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Action</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={bulkPriceAction === 'increase'}
                    onChange={() => setBulkPriceAction('increase')}
                    className="accent-primary"
                  />
                  Increase
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={bulkPriceAction === 'decrease'}
                    onChange={() => setBulkPriceAction('decrease')}
                    className="accent-primary"
                  />
                  Decrease
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Percentage (%)</Label>
              <Input
                type="number"
                min={1}
                max={99}
                value={bulkPricePercent}
                onChange={(e) => setBulkPricePercent(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Prices will be {bulkPriceAction === 'increase' ? 'increased' : 'decreased'} by {bulkPricePercent}%
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkPriceOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkPriceUpdate} disabled={bulkActionLoading}>
              {bulkActionLoading ? 'Updating...' : 'Update Prices'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Import Dialog */}
      <ProductCSVImport
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={() => refetch()}
        categories={categories || []}
      />
    </div>
  );
};

export default AdminProducts;