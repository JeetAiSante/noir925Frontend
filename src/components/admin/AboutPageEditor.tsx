import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Trash2, Image as ImageIcon, Gem, Heart, Shield, Sparkles, Award, Users } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

interface AboutPageContent {
  hero: {
    title: string;
    subtitle: string;
    backgroundImage: string;
  };
  story: {
    title: string;
    paragraphs: string[];
    image: string;
  };
  stats: Array<{ value: string; label: string; description: string }>;
  values: Array<{ icon: string; title: string; description: string }>;
  milestones: Array<{ year: string; event: string }>;
}

interface AboutPageEditorProps {
  content: AboutPageContent;
  onChange: (content: AboutPageContent) => void;
}

const iconOptions = [
  { value: 'Gem', label: 'Gem', icon: Gem },
  { value: 'Heart', label: 'Heart', icon: Heart },
  { value: 'Shield', label: 'Shield', icon: Shield },
  { value: 'Sparkles', label: 'Sparkles', icon: Sparkles },
  { value: 'Award', label: 'Award', icon: Award },
  { value: 'Users', label: 'Users', icon: Users },
];

const AboutPageEditor = ({ content, onChange }: AboutPageEditorProps) => {
  const updateHero = (field: keyof AboutPageContent['hero'], value: string) => {
    onChange({ ...content, hero: { ...content.hero, [field]: value } });
  };

  const updateStory = (field: keyof AboutPageContent['story'], value: any) => {
    onChange({ ...content, story: { ...content.story, [field]: value } });
  };

  const updateStat = (index: number, field: string, value: string) => {
    const newStats = [...content.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    onChange({ ...content, stats: newStats });
  };

  const addStat = () => {
    onChange({
      ...content,
      stats: [...content.stats, { value: '0', label: 'New Stat', description: 'Description' }],
    });
  };

  const removeStat = (index: number) => {
    onChange({ ...content, stats: content.stats.filter((_, i) => i !== index) });
  };

  const updateValue = (index: number, field: string, value: string) => {
    const newValues = [...content.values];
    newValues[index] = { ...newValues[index], [field]: value };
    onChange({ ...content, values: newValues });
  };

  const addValue = () => {
    onChange({
      ...content,
      values: [...content.values, { icon: 'Gem', title: 'New Value', description: 'Description here' }],
    });
  };

  const removeValue = (index: number) => {
    onChange({ ...content, values: content.values.filter((_, i) => i !== index) });
  };

  const updateMilestone = (index: number, field: string, value: string) => {
    const newMilestones = [...content.milestones];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    onChange({ ...content, milestones: newMilestones });
  };

  const addMilestone = () => {
    onChange({
      ...content,
      milestones: [...content.milestones, { year: new Date().getFullYear().toString(), event: 'New milestone' }],
    });
  };

  const removeMilestone = (index: number) => {
    onChange({ ...content, milestones: content.milestones.filter((_, i) => i !== index) });
  };

  const updateStoryParagraph = (index: number, value: string) => {
    const newParagraphs = [...content.story.paragraphs];
    newParagraphs[index] = value;
    updateStory('paragraphs', newParagraphs);
  };

  const addStoryParagraph = () => {
    updateStory('paragraphs', [...content.story.paragraphs, 'New paragraph...']);
  };

  const removeStoryParagraph = (index: number) => {
    updateStory('paragraphs', content.story.paragraphs.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={['hero', 'story']} className="space-y-4">
        {/* Hero Section */}
        <AccordionItem value="hero" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              Hero Section
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Hero Title</Label>
              <Input
                value={content.hero?.title || ''}
                onChange={(e) => updateHero('title', e.target.value)}
                placeholder="The Art of Silver Craftsmanship"
              />
            </div>
            <div className="space-y-2">
              <Label>Hero Subtitle</Label>
              <Input
                value={content.hero?.subtitle || ''}
                onChange={(e) => updateHero('subtitle', e.target.value)}
                placeholder="Where tradition meets innovation"
              />
            </div>
            <div className="space-y-2">
              <Label>Background Image</Label>
              <ImageUpload
                bucket="banner-images"
                value={content.hero?.backgroundImage ? [content.hero.backgroundImage] : []}
                onChange={(urls) => updateHero('backgroundImage', urls[0] || '')}
                maxFiles={1}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Story Section */}
        <AccordionItem value="story" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Our Story
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Section Title</Label>
              <Input
                value={content.story?.title || ''}
                onChange={(e) => updateStory('title', e.target.value)}
                placeholder="Born from a Love of Silver & Soul"
              />
            </div>
            <div className="space-y-2">
              <Label>Story Image</Label>
              <ImageUpload
                bucket="banner-images"
                value={content.story?.image ? [content.story.image] : []}
                onChange={(urls) => updateStory('image', urls[0] || '')}
                maxFiles={1}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Paragraphs</Label>
                <Button size="sm" variant="outline" onClick={addStoryParagraph}>
                  <Plus className="w-4 h-4 mr-1" /> Add Paragraph
                </Button>
              </div>
              {content.story?.paragraphs?.map((para, i) => (
                <div key={i} className="flex gap-2">
                  <Textarea
                    value={para}
                    onChange={(e) => updateStoryParagraph(i, e.target.value)}
                    rows={3}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeStoryParagraph(i)}
                    className="text-destructive shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Stats Section */}
        <AccordionItem value="stats" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Statistics ({content.stats?.length || 0})
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <Button variant="outline" onClick={addStat} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Add Statistic
            </Button>
            <div className="grid gap-4">
              {content.stats?.map((stat, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Value</Label>
                          <Input
                            value={stat.value}
                            onChange={(e) => updateStat(i, 'value', e.target.value)}
                            placeholder="50+"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Label</Label>
                          <Input
                            value={stat.label}
                            onChange={(e) => updateStat(i, 'label', e.target.value)}
                            placeholder="Artisans"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Description</Label>
                          <Input
                            value={stat.description}
                            onChange={(e) => updateStat(i, 'description', e.target.value)}
                            placeholder="Skilled craftspeople"
                          />
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeStat(i)}
                        className="text-destructive shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Values Section */}
        <AccordionItem value="values" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Gem className="w-5 h-5 text-primary" />
              Our Values ({content.values?.length || 0})
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <Button variant="outline" onClick={addValue} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Add Value
            </Button>
            <div className="grid gap-4">
              {content.values?.map((value, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Icon</Label>
                            <select
                              value={value.icon}
                              onChange={(e) => updateValue(i, 'icon', e.target.value)}
                              className="w-full h-9 px-3 border border-input rounded-md bg-background"
                            >
                              {iconOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Title</Label>
                            <Input
                              value={value.title}
                              onChange={(e) => updateValue(i, 'title', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Description</Label>
                          <Textarea
                            value={value.description}
                            onChange={(e) => updateValue(i, 'description', e.target.value)}
                            rows={2}
                          />
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeValue(i)}
                        className="text-destructive shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Milestones Section */}
        <AccordionItem value="milestones" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Milestones ({content.milestones?.length || 0})
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <Button variant="outline" onClick={addMilestone} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Add Milestone
            </Button>
            <div className="space-y-3">
              {content.milestones?.map((milestone, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                  <Input
                    value={milestone.year}
                    onChange={(e) => updateMilestone(i, 'year', e.target.value)}
                    placeholder="Year"
                    className="w-24"
                  />
                  <Input
                    value={milestone.event}
                    onChange={(e) => updateMilestone(i, 'event', e.target.value)}
                    placeholder="Event description"
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeMilestone(i)}
                    className="text-destructive shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default AboutPageEditor;
