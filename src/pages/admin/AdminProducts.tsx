import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Filter, MoreHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import ProductForm from '@/components/admin/ProductForm';
import { useDBProducts, useCategories, useCreateProduct, useUpdateProduct, useDeleteProduct, DBProduct } from '@/hooks/useAdminData';

const AdminProducts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DBProduct | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const { data: products, isLoading } = useDBProducts();
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
        <Button className="gap-2" onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}>
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
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
          <div key={product.id} className="bg-background rounded-xl border border-border/50 overflow-hidden group">
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
              {product.is_new && <Badge className="absolute top-2 left-2">New</Badge>}
              {product.discount_percent && <Badge variant="destructive" className="absolute top-2 right-2">-{product.discount_percent}%</Badge>}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-muted-foreground">{categories?.find(c => c.id === product.category_id)?.name || 'Uncategorized'}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
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
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={product.stock_quantity > 0 ? 'secondary' : 'destructive'} className="text-xs">
                  {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && <div className="text-center py-12"><p className="text-muted-foreground">No products found</p></div>}

      <ProductForm isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setEditingProduct(null); }} onSubmit={handleSubmit} product={editingProduct} isLoading={createProduct.isPending || updateProduct.isPending} />

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
    </div>
  );
};

export default AdminProducts;
