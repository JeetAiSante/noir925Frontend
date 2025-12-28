import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ParsedProduct {
  name: string;
  slug: string;
  price: number;
  original_price?: number;
  stock_quantity: number;
  description?: string;
  short_description?: string;
  material?: string;
  sku?: string;
  category_name?: string;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_bestseller: boolean;
  is_trending: boolean;
  images: string[];
  errors: string[];
  isValid: boolean;
}

interface ProductCSVImportProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Array<{ id: string; name: string }>;
}

const REQUIRED_COLUMNS = ['name', 'price'];
const OPTIONAL_COLUMNS = [
  'slug', 'original_price', 'stock_quantity', 'description', 'short_description',
  'material', 'sku', 'category', 'is_active', 'is_featured', 'is_new',
  'is_bestseller', 'is_trending', 'images'
];

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Date.now().toString(36);
};

const parseBoolean = (value: string | undefined): boolean => {
  if (!value) return false;
  const lower = value.toLowerCase().trim();
  return lower === 'true' || lower === 'yes' || lower === '1';
};

const parseImages = (value: string | undefined): string[] => {
  if (!value) return [];
  return value.split('|').map(url => url.trim()).filter(url => url.length > 0);
};

export default function ProductCSVImport({ isOpen, onClose, onSuccess, categories }: ProductCSVImportProps) {
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setParsedProducts([]);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const parseCSV = (text: string): string[][] => {
    const lines: string[][] = [];
    let currentLine: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (inQuotes) {
        if (char === '"' && nextChar === '"') {
          currentField += '"';
          i++;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          currentField += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          currentLine.push(currentField.trim());
          currentField = '';
        } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
          currentLine.push(currentField.trim());
          if (currentLine.some(f => f.length > 0)) {
            lines.push(currentLine);
          }
          currentLine = [];
          currentField = '';
          if (char === '\r') i++;
        } else if (char !== '\r') {
          currentField += char;
        }
      }
    }

    if (currentField || currentLine.length > 0) {
      currentLine.push(currentField.trim());
      if (currentLine.some(f => f.length > 0)) {
        lines.push(currentLine);
      }
    }

    return lines;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setIsLoading(true);
    setFileName(file.name);

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length < 2) {
        toast.error('CSV file must have a header row and at least one data row');
        resetState();
        return;
      }

      const headers = rows[0].map(h => h.toLowerCase().trim());
      
      // Validate required columns
      const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
      if (missingColumns.length > 0) {
        toast.error(`Missing required columns: ${missingColumns.join(', ')}`);
        resetState();
        return;
      }

      // Parse products
      const products: ParsedProduct[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const errors: string[] = [];
        
        const getValue = (columnName: string): string | undefined => {
          const index = headers.indexOf(columnName);
          return index >= 0 ? row[index] : undefined;
        };

        const name = getValue('name')?.trim() || '';
        const priceStr = getValue('price')?.trim() || '';
        const price = parseFloat(priceStr);
        const originalPriceStr = getValue('original_price')?.trim();
        const stockStr = getValue('stock_quantity')?.trim();

        // Validation
        if (!name) errors.push('Name is required');
        if (!priceStr || isNaN(price) || price <= 0) errors.push('Valid price is required');

        const originalPrice = originalPriceStr ? parseFloat(originalPriceStr) : undefined;
        if (originalPriceStr && (isNaN(originalPrice!) || originalPrice! <= 0)) {
          errors.push('Invalid original price');
        }

        const stockQuantity = stockStr ? parseInt(stockStr) : 0;
        if (stockStr && (isNaN(stockQuantity) || stockQuantity < 0)) {
          errors.push('Invalid stock quantity');
        }

        products.push({
          name,
          slug: getValue('slug')?.trim() || generateSlug(name),
          price: isNaN(price) ? 0 : price,
          original_price: originalPrice,
          stock_quantity: isNaN(stockQuantity) ? 0 : stockQuantity,
          description: getValue('description')?.trim(),
          short_description: getValue('short_description')?.trim(),
          material: getValue('material')?.trim(),
          sku: getValue('sku')?.trim(),
          category_name: getValue('category')?.trim(),
          is_active: parseBoolean(getValue('is_active')) || true,
          is_featured: parseBoolean(getValue('is_featured')),
          is_new: parseBoolean(getValue('is_new')),
          is_bestseller: parseBoolean(getValue('is_bestseller')),
          is_trending: parseBoolean(getValue('is_trending')),
          images: parseImages(getValue('images')),
          errors,
          isValid: errors.length === 0,
        });
      }

      setParsedProducts(products);
      
      const validCount = products.filter(p => p.isValid).length;
      const invalidCount = products.length - validCount;
      
      if (invalidCount > 0) {
        toast.warning(`${validCount} valid, ${invalidCount} with errors`);
      } else {
        toast.success(`${validCount} products ready to import`);
      }
    } catch (error) {
      console.error('CSV parse error:', error);
      toast.error('Failed to parse CSV file');
      resetState();
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    const validProducts = parsedProducts.filter(p => p.isValid);
    if (validProducts.length === 0) {
      toast.error('No valid products to import');
      return;
    }

    setIsImporting(true);

    try {
      // Build category lookup
      const categoryLookup = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));

      let successCount = 0;
      let errorCount = 0;

      for (const product of validProducts) {
        const categoryId = product.category_name 
          ? categoryLookup.get(product.category_name.toLowerCase()) 
          : null;

        const { error } = await supabase.from('products').insert({
          name: product.name,
          slug: product.slug,
          price: product.price,
          original_price: product.original_price || null,
          stock_quantity: product.stock_quantity,
          description: product.description || null,
          short_description: product.short_description || null,
          material: product.material || '925 Silver',
          sku: product.sku || null,
          category_id: categoryId || null,
          is_active: product.is_active,
          is_featured: product.is_featured,
          is_new: product.is_new,
          is_bestseller: product.is_bestseller,
          is_trending: product.is_trending,
          images: product.images.length > 0 ? product.images : [],
        });

        if (error) {
          console.error('Insert error:', error);
          errorCount++;
        } else {
          successCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} products`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to import ${errorCount} products`);
      }

      if (successCount > 0) {
        onSuccess();
        handleClose();
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import products');
    } finally {
      setIsImporting(false);
    }
  };

  const validCount = parsedProducts.filter(p => p.isValid).length;
  const invalidCount = parsedProducts.length - validCount;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import Products from CSV
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* File Upload */}
          {parsedProducts.length === 0 ? (
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {isLoading ? (
                  <Loader2 className="w-12 h-12 mx-auto text-muted-foreground animate-spin" />
                ) : (
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                )}
                <p className="mt-4 text-sm text-muted-foreground">
                  {isLoading ? 'Parsing CSV...' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">CSV files only</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* CSV Format Guide */}
              <div className="bg-muted/50 rounded-lg p-4 text-sm">
                <h4 className="font-medium mb-2">CSV Format Guide</h4>
                <p className="text-muted-foreground mb-2">
                  Required columns: <code className="bg-background px-1 rounded">name</code>, <code className="bg-background px-1 rounded">price</code>
                </p>
                <p className="text-muted-foreground mb-2">
                  Optional columns: slug, original_price, stock_quantity, description, short_description, material, sku, category, is_active, is_featured, is_new, is_bestseller, is_trending, images
                </p>
                <p className="text-muted-foreground">
                  For multiple images, separate URLs with <code className="bg-background px-1 rounded">|</code> (pipe character)
                </p>
                <p className="text-muted-foreground mt-1">
                  Boolean values: use <code className="bg-background px-1 rounded">true/false</code>, <code className="bg-background px-1 rounded">yes/no</code>, or <code className="bg-background px-1 rounded">1/0</code>
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* File Info & Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{fileName}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={resetState}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    {validCount} valid
                  </Badge>
                  {invalidCount > 0 && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {invalidCount} errors
                    </Badge>
                  )}
                </div>
              </div>

              {/* Preview Table */}
              <ScrollArea className="flex-1 border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">Status</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Flags</TableHead>
                      <TableHead>Errors</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedProducts.map((product, index) => (
                      <TableRow key={index} className={product.isValid ? '' : 'bg-destructive/5'}>
                        <TableCell>
                          {product.isValid ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-destructive" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {product.name || '-'}
                        </TableCell>
                        <TableCell>
                          ₹{product.price.toLocaleString()}
                          {product.original_price && (
                            <span className="text-xs text-muted-foreground ml-1 line-through">
                              ₹{product.original_price.toLocaleString()}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{product.stock_quantity}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {product.category_name || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {product.is_featured && <Badge variant="outline" className="text-xs">Featured</Badge>}
                            {product.is_new && <Badge variant="outline" className="text-xs">New</Badge>}
                            {product.is_bestseller && <Badge variant="outline" className="text-xs">Bestseller</Badge>}
                            {product.is_trending && <Badge variant="outline" className="text-xs">Trending</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.errors.length > 0 && (
                            <span className="text-xs text-destructive">
                              {product.errors.join(', ')}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {parsedProducts.length > 0 && (
            <Button
              onClick={handleImport}
              disabled={validCount === 0 || isImporting}
              className="gap-2"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Import {validCount} Products
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
