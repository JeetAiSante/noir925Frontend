import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Save, 
  Image as ImageIcon, 
  Type, 
  Link2, 
  RefreshCw,
  Upload,
  Trash2,
  Plus,
  Eye,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SectionContent {
  id: string;
  section_key: string;
  section_name: string;
  settings: {
    // Text content
    customTitle?: string;
    customSubtitle?: string;
    customDescription?: string;
    headingText?: string;
    buttonText?: string;
    ctaText?: string;
    
    // Images
    backgroundImage?: string;
    heroImage?: string;
    images?: string[];
    overlayImage?: string;
    iconImage?: string;
    
    // Links
    buttonLink?: string;
    ctaLink?: string;
    viewAllLink?: string;
    
    // Slides/items for carousels
    slides?: Array<{
      id: string;
      title: string;
      subtitle?: string;
      description?: string;
      image: string;
      link?: string;
      buttonText?: string;
    }>;
    
    // Other settings
    [key: string]: any;
  } | null;
}

// Section-specific content configuration
const sectionContentConfig: Record<string, {
  hasImages: boolean;
  hasMultipleSlides: boolean;
  hasButton: boolean;
  hasDescription: boolean;
  imageFields?: string[];
  description?: string;
}> = {
  video_hero: {
    hasImages: true,
    hasMultipleSlides: true,
    hasButton: true,
    hasDescription: true,
    imageFields: ['backgroundImage', 'overlayImage'],
    description: 'Main hero section with video/image background and text overlay'
  },
  hero: {
    hasImages: true,
    hasMultipleSlides: true,
    hasButton: true,
    hasDescription: true,
    imageFields: ['backgroundImage', 'overlayImage'],
    description: 'Static hero section with customizable slides'
  },
  parallax_banner: {
    hasImages: true,
    hasMultipleSlides: true,
    hasButton: true,
    hasDescription: true,
    imageFields: ['backgroundImage'],
    description: 'Parallax scrolling banners with promotional content'
  },
  gender_shop: {
    hasImages: true,
    hasMultipleSlides: false,
    hasButton: true,
    hasDescription: true,
    imageFields: ['menImage', 'womenImage'],
    description: 'Shop by gender section with two main cards'
  },
  wedding_collection: {
    hasImages: true,
    hasMultipleSlides: false,
    hasButton: true,
    hasDescription: true,
    imageFields: ['backgroundImage', 'featureImage'],
    description: 'Wedding/bridal collection showcase'
  },
  gift_of_choice: {
    hasImages: true,
    hasMultipleSlides: false,
    hasButton: true,
    hasDescription: true,
    imageFields: ['backgroundImage'],
    description: 'Gift selection section'
  },
  brand_story: {
    hasImages: true,
    hasMultipleSlides: false,
    hasButton: true,
    hasDescription: true,
    imageFields: ['storyImage', 'founderImage'],
    description: 'Brand story and heritage section'
  },
  editorial_section: {
    hasImages: true,
    hasMultipleSlides: true,
    hasButton: true,
    hasDescription: true,
    imageFields: ['images'],
    description: 'Editorial/lifestyle content carousel'
  },
  final_cta: {
    hasImages: true,
    hasMultipleSlides: false,
    hasButton: true,
    hasDescription: true,
    imageFields: ['backgroundImage'],
    description: 'Final call-to-action section'
  },
  silver_care: {
    hasImages: true,
    hasMultipleSlides: false,
    hasButton: true,
    hasDescription: true,
    imageFields: ['heroImage'],
    description: 'Silver care guide section'
  },
  dailywear: {
    hasImages: true,
    hasMultipleSlides: false,
    hasButton: true,
    hasDescription: true,
    imageFields: ['backgroundImage'],
    description: 'Dailywear collection section'
  },
  shop_by_occasion: {
    hasImages: true,
    hasMultipleSlides: true,
    hasButton: true,
    hasDescription: true,
    description: 'Occasion-based shopping cards'
  },
  brand_partners: {
    hasImages: true,
    hasMultipleSlides: true,
    hasButton: false,
    hasDescription: true,
    description: 'Partner brand logos and links'
  },
  newsletter: {
    hasImages: true,
    hasMultipleSlides: false,
    hasButton: true,
    hasDescription: true,
    imageFields: ['backgroundImage'],
    description: 'Newsletter subscription section'
  },
  trust_strip: {
    hasImages: false,
    hasMultipleSlides: false,
    hasButton: false,
    hasDescription: false,
    description: 'Trust badges and guarantees strip'
  },
  bestsellers: {
    hasImages: false,
    hasMultipleSlides: false,
    hasButton: true,
    hasDescription: true,
    description: 'Bestselling products grid'
  },
  new_arrivals: {
    hasImages: false,
    hasMultipleSlides: false,
    hasButton: true,
    hasDescription: true,
    description: 'New arrivals products grid'
  },
  trending_slider: {
    hasImages: false,
    hasMultipleSlides: false,
    hasButton: true,
    hasDescription: true,
    description: 'Trending products slider'
  },
  reviews: {
    hasImages: false,
    hasMultipleSlides: false,
    hasButton: true,
    hasDescription: true,
    description: 'Customer reviews section'
  },
  instagram_feed: {
    hasImages: false,
    hasMultipleSlides: false,
    hasButton: true,
    hasDescription: true,
    description: 'Instagram feed integration'
  },
};

const AdminHomepageContent = () => {
  const [sections, setSections] = useState<SectionContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      
      setSections((data || []).map(s => ({
        ...s,
        settings: s.settings as SectionContent['settings']
      })));
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast.error('Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  const updateSectionContent = (sectionId: string, key: string, value: any) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      const newSettings = { ...(s.settings || {}), [key]: value };
      return { ...s, settings: newSettings };
    }));
  };

  const updateSlide = (sectionId: string, slideIndex: number, field: string, value: string) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      const slides = [...(s.settings?.slides || [])];
      if (slides[slideIndex]) {
        slides[slideIndex] = { ...slides[slideIndex], [field]: value };
      }
      return { ...s, settings: { ...s.settings, slides } };
    }));
  };

  const addSlide = (sectionId: string) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      const slides = [...(s.settings?.slides || [])];
      slides.push({
        id: crypto.randomUUID(),
        title: 'New Slide',
        subtitle: '',
        description: '',
        image: '',
        link: '',
        buttonText: 'Learn More'
      });
      return { ...s, settings: { ...s.settings, slides } };
    }));
  };

  const removeSlide = (sectionId: string, slideIndex: number) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      const slides = [...(s.settings?.slides || [])];
      slides.splice(slideIndex, 1);
      return { ...s, settings: { ...s.settings, slides } };
    }));
  };

  const handleImageUpload = async (sectionId: string, field: string, file: File) => {
    setUploadingImage(`${sectionId}-${field}`);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${sectionId}-${field}-${Date.now()}.${fileExt}`;
      const filePath = `homepage/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('banner-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('banner-images')
        .getPublicUrl(filePath);

      updateSectionContent(sectionId, field, publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(null);
    }
  };

  const saveAllChanges = async () => {
    setSaving(true);
    try {
      for (const section of sections) {
        const { error } = await supabase
          .from('homepage_sections')
          .update({ settings: section.settings })
          .eq('id', section.id);

        if (error) throw error;
      }
      toast.success('All content saved successfully');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const saveSectionChanges = async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('homepage_sections')
        .update({ settings: section.settings })
        .eq('id', sectionId);

      if (error) throw error;
      toast.success(`${section.section_name} saved`);
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const getConfig = (key: string) => sectionContentConfig[key] || {
    hasImages: false,
    hasMultipleSlides: false,
    hasButton: true,
    hasDescription: true
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Homepage Content Editor</h1>
          <p className="text-muted-foreground">
            Manage images, text, and links for each homepage section
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSections}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={saveAllChanges} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        <Accordion type="single" collapsible className="w-full">
          {sections.map((section) => {
            const config = getConfig(section.section_key);
            
            return (
              <AccordionItem 
                key={section.id} 
                value={section.id}
                className="border rounded-lg mb-2 overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/50">
                  <div className="flex items-center gap-3 text-left">
                    <div className="flex items-center gap-2">
                      {config.hasImages && <ImageIcon className="w-4 h-4 text-blue-500" />}
                      <Type className="w-4 h-4 text-green-500" />
                      {config.hasButton && <Link2 className="w-4 h-4 text-purple-500" />}
                    </div>
                    <div>
                      <span className="font-medium">{section.section_name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({section.section_key})
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="px-4 pb-4">
                  <div className="pt-4 border-t space-y-6">
                    {config.description && (
                      <p className="text-sm text-muted-foreground bg-accent/30 p-3 rounded-md">
                        {config.description}
                      </p>
                    )}
                    
                    <Tabs defaultValue="text" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="text" className="flex items-center gap-2">
                          <Type className="w-4 h-4" />
                          Text
                        </TabsTrigger>
                        <TabsTrigger value="images" className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          Images
                        </TabsTrigger>
                        <TabsTrigger value="links" className="flex items-center gap-2">
                          <Link2 className="w-4 h-4" />
                          Links
                        </TabsTrigger>
                      </TabsList>
                      
                      {/* Text Content Tab */}
                      <TabsContent value="text" className="space-y-4 mt-4">
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <Label>Section Title</Label>
                            <Input
                              placeholder="Custom title (leave empty for default)"
                              value={section.settings?.customTitle ?? ''}
                              onChange={(e) => updateSectionContent(section.id, 'customTitle', e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Section Subtitle</Label>
                            <Input
                              placeholder="Custom subtitle (leave empty for default)"
                              value={section.settings?.customSubtitle ?? ''}
                              onChange={(e) => updateSectionContent(section.id, 'customSubtitle', e.target.value)}
                            />
                          </div>
                          
                          {config.hasDescription && (
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Textarea
                                placeholder="Section description text"
                                className="min-h-[100px]"
                                value={section.settings?.customDescription ?? ''}
                                onChange={(e) => updateSectionContent(section.id, 'customDescription', e.target.value)}
                              />
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <Label>Heading Text</Label>
                            <Input
                              placeholder="Main heading text"
                              value={section.settings?.headingText ?? ''}
                              onChange={(e) => updateSectionContent(section.id, 'headingText', e.target.value)}
                            />
                          </div>
                          
                          {config.hasButton && (
                            <div className="space-y-2">
                              <Label>Button Text</Label>
                              <Input
                                placeholder="e.g., Shop Now, Learn More"
                                value={section.settings?.buttonText ?? ''}
                                onChange={(e) => updateSectionContent(section.id, 'buttonText', e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      
                      {/* Images Tab */}
                      <TabsContent value="images" className="space-y-4 mt-4">
                        {config.hasImages ? (
                          <div className="grid gap-4">
                            {config.imageFields?.map(field => (
                              <div key={field} className="space-y-2">
                                <Label className="capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</Label>
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Image URL or upload"
                                    value={section.settings?.[field] ?? ''}
                                    onChange={(e) => updateSectionContent(section.id, field, e.target.value)}
                                    className="flex-1"
                                  />
                                  <label className="cursor-pointer">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleImageUpload(section.id, field, file);
                                      }}
                                    />
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      size="icon"
                                      disabled={uploadingImage === `${section.id}-${field}`}
                                    >
                                      {uploadingImage === `${section.id}-${field}` ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Upload className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </label>
                                </div>
                                {section.settings?.[field] && (
                                  <div className="mt-2 relative rounded-lg overflow-hidden border max-w-xs">
                                    <img 
                                      src={section.settings[field]} 
                                      alt={field}
                                      className="w-full h-32 object-cover"
                                    />
                                    <Button
                                      variant="destructive"
                                      size="icon"
                                      className="absolute top-2 right-2 h-6 w-6"
                                      onClick={() => updateSectionContent(section.id, field, '')}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )) || (
                              <div className="space-y-2">
                                <Label>Background Image</Label>
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Image URL or upload"
                                    value={section.settings?.backgroundImage ?? ''}
                                    onChange={(e) => updateSectionContent(section.id, 'backgroundImage', e.target.value)}
                                    className="flex-1"
                                  />
                                  <label className="cursor-pointer">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleImageUpload(section.id, 'backgroundImage', file);
                                      }}
                                    />
                                    <Button type="button" variant="outline" size="icon">
                                      <Upload className="w-4 h-4" />
                                    </Button>
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground py-4 text-center">
                            This section uses product images or dynamic content from the database.
                          </p>
                        )}
                      </TabsContent>
                      
                      {/* Links Tab */}
                      <TabsContent value="links" className="space-y-4 mt-4">
                        <div className="grid gap-4">
                          {config.hasButton && (
                            <>
                              <div className="space-y-2">
                                <Label>Primary Button Link</Label>
                                <Input
                                  placeholder="/shop or https://..."
                                  value={section.settings?.buttonLink ?? ''}
                                  onChange={(e) => updateSectionContent(section.id, 'buttonLink', e.target.value)}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label>CTA Link</Label>
                                <Input
                                  placeholder="/collections or https://..."
                                  value={section.settings?.ctaLink ?? ''}
                                  onChange={(e) => updateSectionContent(section.id, 'ctaLink', e.target.value)}
                                />
                              </div>
                            </>
                          )}
                          
                          <div className="space-y-2">
                            <Label>View All Link</Label>
                            <Input
                              placeholder="/shop/category or https://..."
                              value={section.settings?.viewAllLink ?? ''}
                              onChange={(e) => updateSectionContent(section.id, 'viewAllLink', e.target.value)}
                            />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                    
                    {/* Multiple Slides Editor */}
                    {config.hasMultipleSlides && (
                      <div className="space-y-4 border-t pt-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">Slides / Items</Label>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => addSlide(section.id)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Slide
                          </Button>
                        </div>
                        
                        {(section.settings?.slides || []).length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4 bg-accent/30 rounded-md">
                            No custom slides. Click "Add Slide" to create carousel content.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {(section.settings?.slides || []).map((slide, idx) => (
                              <Card key={slide.id || idx} className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <span className="text-sm font-medium text-muted-foreground">
                                    Slide {idx + 1}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-destructive"
                                    onClick={() => removeSlide(section.id, idx)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                                <div className="grid gap-3">
                                  <Input
                                    placeholder="Slide Title"
                                    value={slide.title}
                                    onChange={(e) => updateSlide(section.id, idx, 'title', e.target.value)}
                                  />
                                  <Input
                                    placeholder="Subtitle"
                                    value={slide.subtitle || ''}
                                    onChange={(e) => updateSlide(section.id, idx, 'subtitle', e.target.value)}
                                  />
                                  <Textarea
                                    placeholder="Description"
                                    value={slide.description || ''}
                                    onChange={(e) => updateSlide(section.id, idx, 'description', e.target.value)}
                                    className="min-h-[60px]"
                                  />
                                  <div className="flex gap-2">
                                    <Input
                                      placeholder="Image URL"
                                      value={slide.image}
                                      onChange={(e) => updateSlide(section.id, idx, 'image', e.target.value)}
                                      className="flex-1"
                                    />
                                    <label className="cursor-pointer">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;
                                          
                                          const fileExt = file.name.split('.').pop();
                                          const fileName = `slide-${section.id}-${idx}-${Date.now()}.${fileExt}`;
                                          const filePath = `homepage/${fileName}`;

                                          try {
                                            const { error } = await supabase.storage
                                              .from('banner-images')
                                              .upload(filePath, file);

                                            if (error) throw error;

                                            const { data: { publicUrl } } = supabase.storage
                                              .from('banner-images')
                                              .getPublicUrl(filePath);

                                            updateSlide(section.id, idx, 'image', publicUrl);
                                            toast.success('Image uploaded');
                                          } catch (err) {
                                            toast.error('Upload failed');
                                          }
                                        }}
                                      />
                                      <Button type="button" variant="outline" size="icon">
                                        <Upload className="w-4 h-4" />
                                      </Button>
                                    </label>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <Input
                                      placeholder="Link URL"
                                      value={slide.link || ''}
                                      onChange={(e) => updateSlide(section.id, idx, 'link', e.target.value)}
                                    />
                                    <Input
                                      placeholder="Button Text"
                                      value={slide.buttonText || ''}
                                      onChange={(e) => updateSlide(section.id, idx, 'buttonText', e.target.value)}
                                    />
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-end pt-4 border-t">
                      <Button 
                        onClick={() => saveSectionChanges(section.id)}
                        disabled={saving}
                        size="sm"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save {section.section_name}
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
};

export default AdminHomepageContent;
