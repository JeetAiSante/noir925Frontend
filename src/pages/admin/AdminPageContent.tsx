import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminSecurityWrapper from '@/components/admin/AdminSecurityWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Save, FileText, Settings, Plus, Trash2, GripVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PageContent {
  id: string;
  page_key: string;
  page_title: string;
  content: any;
  meta_title: string | null;
  meta_description: string | null;
  is_active: boolean;
}

const AdminPageContent = () => {
  const queryClient = useQueryClient();
  const [selectedPage, setSelectedPage] = useState<string>('help-center');
  const [editingContent, setEditingContent] = useState<any>(null);

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['admin-page-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .order('page_title');
      
      if (error) throw error;
      return data as PageContent[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<PageContent> & { id: string }) => {
      const { error } = await supabase
        .from('page_content')
        .update({
          page_title: updates.page_title,
          content: updates.content,
          meta_title: updates.meta_title,
          meta_description: updates.meta_description,
          is_active: updates.is_active,
        })
        .eq('id', updates.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-page-content'] });
      toast.success('Page content updated successfully');
    },
    onError: () => {
      toast.error('Failed to update page content');
    },
  });

  const currentPage = pages.find(p => p.page_key === selectedPage);

  const handleSave = () => {
    if (!currentPage || !editingContent) return;
    
    updateMutation.mutate({
      id: currentPage.id,
      ...editingContent,
    });
  };

  const handleContentChange = (field: string, value: any) => {
    setEditingContent((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCategoryChange = (categoryIndex: number, field: string, value: any) => {
    const content = editingContent?.content || currentPage?.content || { categories: [] };
    const newCategories = [...(content.categories || [])];
    newCategories[categoryIndex] = { ...newCategories[categoryIndex], [field]: value };
    handleContentChange('content', { ...content, categories: newCategories });
  };

  const handleFAQChange = (categoryIndex: number, faqIndex: number, field: string, value: string) => {
    const content = editingContent?.content || currentPage?.content || { categories: [] };
    const newCategories = [...(content.categories || [])];
    const newFaqs = [...(newCategories[categoryIndex]?.faqs || [])];
    newFaqs[faqIndex] = { ...newFaqs[faqIndex], [field]: value };
    newCategories[categoryIndex] = { ...newCategories[categoryIndex], faqs: newFaqs };
    handleContentChange('content', { ...content, categories: newCategories });
  };

  const addCategory = () => {
    const content = editingContent?.content || currentPage?.content || { categories: [] };
    const newCategories = [...(content.categories || []), {
      title: 'New Category',
      icon: 'HelpCircle',
      description: 'Category description',
      faqs: []
    }];
    handleContentChange('content', { ...content, categories: newCategories });
  };

  const addFAQ = (categoryIndex: number) => {
    const content = editingContent?.content || currentPage?.content || { categories: [] };
    const newCategories = [...(content.categories || [])];
    const newFaqs = [...(newCategories[categoryIndex]?.faqs || []), {
      question: 'New Question',
      answer: 'Answer here...'
    }];
    newCategories[categoryIndex] = { ...newCategories[categoryIndex], faqs: newFaqs };
    handleContentChange('content', { ...content, categories: newCategories });
  };

  const removeCategory = (categoryIndex: number) => {
    const content = editingContent?.content || currentPage?.content || { categories: [] };
    const newCategories = content.categories.filter((_: any, i: number) => i !== categoryIndex);
    handleContentChange('content', { ...content, categories: newCategories });
  };

  const removeFAQ = (categoryIndex: number, faqIndex: number) => {
    const content = editingContent?.content || currentPage?.content || { categories: [] };
    const newCategories = [...(content.categories || [])];
    newCategories[categoryIndex].faqs = newCategories[categoryIndex].faqs.filter(
      (_: any, i: number) => i !== faqIndex
    );
    handleContentChange('content', { ...content, categories: newCategories });
  };

  // Initialize editing content when page changes
  if (currentPage && !editingContent) {
    setEditingContent({
      page_title: currentPage.page_title,
      content: currentPage.content,
      meta_title: currentPage.meta_title,
      meta_description: currentPage.meta_description,
      is_active: currentPage.is_active,
    });
  }

  const renderHelpCenterEditor = () => {
    const content = editingContent?.content || currentPage?.content || { categories: [] };
    
    return (
      <div className="space-y-6">
        {(content.categories || []).map((category: any, catIndex: number) => (
          <Card key={catIndex}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                <Input
                  value={category.title}
                  onChange={(e) => handleCategoryChange(catIndex, 'title', e.target.value)}
                  className="text-lg font-semibold w-64"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCategory(catIndex)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Description</Label>
                <Input
                  value={category.description || ''}
                  onChange={(e) => handleCategoryChange(catIndex, 'description', e.target.value)}
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">FAQs</Label>
                  <Button size="sm" variant="outline" onClick={() => addFAQ(catIndex)}>
                    <Plus className="h-3 w-3 mr-1" /> Add FAQ
                  </Button>
                </div>
                
                {(category.faqs || []).map((faq: any, faqIndex: number) => (
                  <div key={faqIndex} className="border rounded-lg p-4 space-y-3 bg-muted/50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-3">
                        <div>
                          <Label className="text-xs">Question</Label>
                          <Input
                            value={faq.question}
                            onChange={(e) => handleFAQChange(catIndex, faqIndex, 'question', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Answer</Label>
                          <Textarea
                            value={faq.answer}
                            onChange={(e) => handleFAQChange(catIndex, faqIndex, 'answer', e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFAQ(catIndex, faqIndex)}
                        className="text-destructive hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Button variant="outline" onClick={addCategory} className="w-full">
          <Plus className="h-4 w-4 mr-2" /> Add Category
        </Button>
      </div>
    );
  };

  const renderGenericEditor = () => {
    const content = editingContent?.content || currentPage?.content || { sections: [] };
    
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Page Content (JSON)</CardTitle>
            <CardDescription>
              Edit the page content structure. Use valid JSON format.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={JSON.stringify(content, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleContentChange('content', parsed);
                } catch {
                  // Invalid JSON, don't update
                }
              }}
              rows={20}
              className="font-mono text-sm"
            />
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <AdminSecurityWrapper>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link to="/admin">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Page Content Manager</h1>
                <p className="text-muted-foreground">Edit Help Center, Size Guide, and policy pages</p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Page List Sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Pages
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <div className="space-y-1">
                      {pages.map((page) => (
                        <button
                          key={page.id}
                          onClick={() => {
                            setSelectedPage(page.page_key);
                            setEditingContent(null);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                            selectedPage === page.page_key
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <div className="font-medium">{page.page_title}</div>
                          <div className="text-xs opacity-70">{page.page_key}</div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Editor Area */}
              <div className="lg:col-span-3">
                {currentPage && (
                  <Tabs defaultValue="content">
                    <TabsList className="mb-4">
                      <TabsTrigger value="content">Content</TabsTrigger>
                      <TabsTrigger value="seo">SEO Settings</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="content">
                      <Card>
                        <CardHeader>
                          <CardTitle>
                            <Input
                              value={editingContent?.page_title || currentPage.page_title}
                              onChange={(e) => handleContentChange('page_title', e.target.value)}
                              className="text-xl font-bold"
                            />
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {selectedPage === 'help-center' ? renderHelpCenterEditor() : renderGenericEditor()}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="seo">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            SEO Settings
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label>Meta Title</Label>
                            <Input
                              value={editingContent?.meta_title || currentPage.meta_title || ''}
                              onChange={(e) => handleContentChange('meta_title', e.target.value)}
                              placeholder="Enter meta title for SEO"
                            />
                          </div>
                          <div>
                            <Label>Meta Description</Label>
                            <Textarea
                              value={editingContent?.meta_description || currentPage.meta_description || ''}
                              onChange={(e) => handleContentChange('meta_description', e.target.value)}
                              placeholder="Enter meta description for SEO"
                              rows={3}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="settings">
                      <Card>
                        <CardHeader>
                          <CardTitle>Page Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Page Active</Label>
                              <p className="text-sm text-muted-foreground">
                                Toggle to show or hide this page
                              </p>
                            </div>
                            <Switch
                              checked={editingContent?.is_active ?? currentPage.is_active}
                              onCheckedChange={(checked) => handleContentChange('is_active', checked)}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminSecurityWrapper>
  );
};

export default AdminPageContent;
