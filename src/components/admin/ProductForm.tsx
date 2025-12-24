import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import ImageUpload from './ImageUpload';
import { useCategories, DBProduct } from '@/hooks/useAdminData';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  sku: z.string().optional(),
  description: z.string().optional(),
  short_description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  original_price: z.number().optional(),
  discount_percent: z.number().min(0).max(100).optional(),
  category_id: z.string().optional(),
  material: z.string().optional(),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
  stock_quantity: z.number().min(0, 'Stock must be non-negative'),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  is_new: z.boolean(),
  is_bestseller: z.boolean(),
  is_trending: z.boolean(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<DBProduct>) => void;
  product?: DBProduct | null;
  isLoading?: boolean;
}

const ProductForm = ({ isOpen, onClose, onSubmit, product, isLoading }: ProductFormProps) => {
  const [images, setImages] = useState<string[]>([]);
  const { data: categories } = useCategories();

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      sku: '',
      description: '',
      short_description: '',
      price: 0,
      original_price: undefined,
      discount_percent: undefined,
      category_id: undefined,
      material: '925 Silver',
      weight: '',
      dimensions: '',
      stock_quantity: 0,
      is_active: true,
      is_featured: false,
      is_new: false,
      is_bestseller: false,
      is_trending: false,
      meta_title: '',
      meta_description: '',
    }
  });

  const watchName = watch('name');

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        slug: product.slug,
        sku: product.sku || '',
        description: product.description || '',
        short_description: product.short_description || '',
        price: Number(product.price),
        original_price: product.original_price ? Number(product.original_price) : undefined,
        discount_percent: product.discount_percent || undefined,
        category_id: product.category_id || undefined,
        material: product.material || '925 Silver',
        weight: product.weight || '',
        dimensions: product.dimensions || '',
        stock_quantity: product.stock_quantity,
        is_active: product.is_active,
        is_featured: product.is_featured,
        is_new: product.is_new,
        is_bestseller: product.is_bestseller,
        is_trending: product.is_trending,
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
      });
      setImages(Array.isArray(product.images) ? product.images as string[] : []);
    } else {
      reset();
      setImages([]);
    }
  }, [product, reset]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!product && watchName) {
      const slug = watchName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setValue('slug', slug);
    }
  }, [watchName, product, setValue]);

  const handleFormSubmit = (data: ProductFormData) => {
    onSubmit({
      ...data,
      images,
      price: data.price,
      original_price: data.original_price || null,
      discount_percent: data.discount_percent || null,
      category_id: data.category_id || null,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="font-display text-xl">
            {product ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
            {/* Images */}
            <div className="space-y-2">
              <Label>Product Images</Label>
              <ImageUpload
                bucket="product-images"
                value={images}
                onChange={(urls) => setImages(urls as string[])}
                multiple
                maxFiles={6}
                aspectRatio="square"
              />
            </div>

            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Silver Chain Bracelet"
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  {...register('slug')}
                  placeholder="silver-chain-bracelet"
                />
                {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  {...register('sku')}
                  placeholder="NOIR-BRC-001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category_id">Category</Label>
                <Select
                  value={watch('category_id') || ''}
                  onValueChange={(value) => setValue('category_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="short_description">Short Description</Label>
              <Input
                id="short_description"
                {...register('short_description')}
                placeholder="A brief product summary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Full Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Detailed product description..."
                rows={4}
              />
            </div>

            {/* Pricing */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="2999"
                />
                {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="original_price">Original Price (₹)</Label>
                <Input
                  id="original_price"
                  type="number"
                  {...register('original_price', { valueAsNumber: true })}
                  placeholder="3999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_percent">Discount %</Label>
                <Input
                  id="discount_percent"
                  type="number"
                  {...register('discount_percent', { valueAsNumber: true })}
                  placeholder="25"
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  {...register('material')}
                  placeholder="925 Silver"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  {...register('weight')}
                  placeholder="15g"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  {...register('stock_quantity', { valueAsNumber: true })}
                  placeholder="50"
                />
              </div>
            </div>

            {/* Flags */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={watch('is_active')}
                  onCheckedChange={(checked) => setValue('is_active', checked)}
                />
                <Label htmlFor="is_active" className="text-sm">Active</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_featured"
                  checked={watch('is_featured')}
                  onCheckedChange={(checked) => setValue('is_featured', checked)}
                />
                <Label htmlFor="is_featured" className="text-sm">Featured</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_new"
                  checked={watch('is_new')}
                  onCheckedChange={(checked) => setValue('is_new', checked)}
                />
                <Label htmlFor="is_new" className="text-sm">New Arrival</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_bestseller"
                  checked={watch('is_bestseller')}
                  onCheckedChange={(checked) => setValue('is_bestseller', checked)}
                />
                <Label htmlFor="is_bestseller" className="text-sm">Bestseller</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_trending"
                  checked={watch('is_trending')}
                  onCheckedChange={(checked) => setValue('is_trending', checked)}
                />
                <Label htmlFor="is_trending" className="text-sm">Trending</Label>
              </div>
            </div>

            {/* SEO */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="font-medium">SEO Settings</h3>
              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  {...register('meta_title')}
                  placeholder="Product meta title for search engines"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  {...register('meta_description')}
                  placeholder="Product meta description for search engines"
                  rows={2}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
