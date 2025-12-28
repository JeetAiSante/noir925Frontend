import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  bucket: 'product-images' | 'banner-images' | 'avatars';
  value?: string | string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  aspectRatio?: 'square' | 'video' | 'banner';
  className?: string;
}

const ImageUpload = ({
  bucket,
  value,
  onChange,
  multiple = false,
  maxFiles = 5,
  aspectRatio = 'square',
  className
}: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const images = Array.isArray(value) ? value : value ? [value] : [];

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    banner: 'aspect-[3/1]'
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesToUpload = Array.from(files).slice(0, multiple ? maxFiles - images.length : 1);
    
    if (filesToUpload.length === 0) {
      toast({
        title: "Maximum files reached",
        description: `You can only upload up to ${maxFiles} images.`,
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not an image file.`,
            variant: "destructive"
          });
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds 5MB limit.`,
            variant: "destructive"
          });
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        newUrls.push(publicUrl);
        setUploadProgress(((i + 1) / filesToUpload.length) * 100);
      }

      // Always return array
      const updatedUrls = multiple ? [...images, ...newUrls] : newUrls;
      onChange(updatedUrls);

      if (newUrls.length > 0) {
        toast({
          title: "Upload successful",
          description: `${newUrls.length} image(s) uploaded successfully.`
        });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async (urlToRemove: string) => {
    try {
      // Extract file path from URL
      const url = new URL(urlToRemove);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];

      await supabase.storage.from(bucket).remove([fileName]);

      // Always return array
      const remainingImages = images.filter(url => url !== urlToRemove);
      onChange(remainingImages);

      toast({
        title: "Image removed",
        description: "The image has been deleted."
      });
    } catch (error) {
      console.error('Delete error:', error);
      // Still remove from UI even if storage delete fails
      const remainingImages = images.filter(url => url !== urlToRemove);
      onChange(remainingImages);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Image Previews */}
      {images.length > 0 && (
        <div className={cn(
          "grid gap-4",
          multiple ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"
        )}>
          {images.map((url, index) => (
            <div
              key={url}
              className={cn(
                "relative group rounded-xl overflow-hidden border border-border bg-muted",
                aspectClasses[aspectRatio]
              )}
            >
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="rounded-full"
                  onClick={() => handleRemove(url)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              {multiple && (
                <span className="absolute top-2 left-2 bg-background/80 text-xs px-2 py-1 rounded-full">
                  {index + 1}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {(multiple ? images.length < maxFiles : images.length === 0) && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            "w-full border-2 border-dashed border-border rounded-xl transition-all hover:border-primary hover:bg-primary/5",
            aspectClasses[aspectRatio],
            isUploading && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex flex-col items-center justify-center h-full gap-2 p-4">
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Uploading... {Math.round(uploadProgress)}%
                </span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">
                  Click to upload {multiple ? 'images' : 'an image'}
                </span>
                <span className="text-xs text-muted-foreground">
                  PNG, JPG, WebP up to 5MB
                </span>
              </>
            )}
          </div>
        </button>
      )}

      {multiple && (
        <p className="text-xs text-muted-foreground text-center">
          {images.length} / {maxFiles} images uploaded
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
