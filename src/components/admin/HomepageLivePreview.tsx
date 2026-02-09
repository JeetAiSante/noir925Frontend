import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Maximize2, 
  Minimize2,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionContent {
  id: string;
  section_key: string;
  section_name: string;
  settings: Record<string, any> | null;
}

interface HomepageLivePreviewProps {
  sections: SectionContent[];
  activeSection?: string | null;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

const deviceSizes: Record<DeviceType, { width: string; label: string }> = {
  desktop: { width: '100%', label: 'Desktop' },
  tablet: { width: '768px', label: 'Tablet' },
  mobile: { width: '375px', label: 'Mobile' },
};

const HomepageLivePreview = ({ 
  sections, 
  activeSection,
  isFullscreen = false,
  onToggleFullscreen
}: HomepageLivePreviewProps) => {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);

  const getActiveSectionData = () => {
    if (!activeSection) return null;
    return sections.find(s => s.id === activeSection);
  };

  const renderSectionPreview = (section: SectionContent) => {
    const settings = section.settings || {};
    
    switch (section.section_key) {
      case 'video_hero':
      case 'hero':
        return (
          <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-muted to-muted/50 rounded-lg overflow-hidden">
            {settings.backgroundImage ? (
              <img 
                src={settings.backgroundImage} 
                alt="Hero background" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                <span className="text-muted-foreground text-sm">No background image</span>
              </div>
            )}
            <div className="absolute inset-0 bg-foreground/40 flex flex-col items-center justify-center text-center p-4">
              <h1 className="text-background text-2xl md:text-4xl font-bold mb-2">
                {settings.customTitle || settings.headingText || 'Hero Title'}
              </h1>
              {settings.customSubtitle && (
                <p className="text-background/80 text-sm md:text-lg mb-4">
                  {settings.customSubtitle}
                </p>
              )}
              {settings.customDescription && (
                <p className="text-background/70 text-xs md:text-sm max-w-md mb-4">
                  {settings.customDescription}
                </p>
              )}
              {settings.buttonText && (
                <button className="px-6 py-2 bg-background text-foreground rounded-md font-medium text-sm">
                  {settings.buttonText}
                </button>
              )}
            </div>
          </div>
        );

      case 'gender_shop':
        return (
          <div className="w-full p-4 bg-muted/30 rounded-lg">
            <h2 className="text-lg font-semibold text-center mb-4">
              {settings.customTitle || 'Shop By Gender'}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center overflow-hidden">
                {settings.menImage ? (
                  <img src={settings.menImage} alt="Men" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-muted-foreground text-sm">Men's Image</span>
                )}
              </div>
              <div className="aspect-[3/4] bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center overflow-hidden">
                {settings.womenImage ? (
                  <img src={settings.womenImage} alt="Women" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-muted-foreground text-sm">Women's Image</span>
                )}
              </div>
            </div>
          </div>
        );

      case 'bestsellers':
      case 'new_arrivals':
      case 'trending_slider':
        return (
          <div className="w-full p-4 bg-muted/30 rounded-lg">
            <div className="text-center mb-4">
              <h2 className="text-lg font-semibold">
                {settings.customTitle || section.section_name}
              </h2>
              {settings.customSubtitle && (
                <p className="text-sm text-muted-foreground">{settings.customSubtitle}</p>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-md flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">Product {i}</span>
                </div>
              ))}
            </div>
            {settings.buttonText && (
              <div className="text-center mt-4">
                <button className="px-4 py-1.5 border border-foreground/20 rounded text-sm">
                  {settings.buttonText}
                </button>
              </div>
            )}
          </div>
        );

      case 'parallax_banner':
        return (
          <div className="relative w-full aspect-[21/9] bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg overflow-hidden">
            {settings.backgroundImage ? (
              <img 
                src={settings.backgroundImage} 
                alt="Banner" 
                className="w-full h-full object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-foreground/30 flex flex-col items-center justify-center text-center p-4">
              <h2 className="text-background text-xl font-bold">
                {settings.customTitle || 'Parallax Banner'}
              </h2>
              {settings.customSubtitle && (
                <p className="text-background/80 text-sm">{settings.customSubtitle}</p>
              )}
            </div>
          </div>
        );

      case 'gift_of_choice':
        return (
          <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-accent to-accent/50 rounded-lg overflow-hidden">
            {settings.backgroundImage && (
              <img 
                src={settings.backgroundImage} 
                alt="Gift" 
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-foreground/20 flex flex-col items-center justify-center text-center p-4">
              <h2 className="text-background text-xl font-bold mb-2">
                {settings.customTitle || 'Gift of Choice'}
              </h2>
              {settings.customDescription && (
                <p className="text-background/80 text-sm max-w-sm">{settings.customDescription}</p>
              )}
            </div>
          </div>
        );

      case 'brand_story':
        return (
          <div className="w-full p-4 bg-muted/30 rounded-lg">
            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-lg overflow-hidden">
                {settings.storyImage ? (
                  <img src={settings.storyImage} alt="Brand Story" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Story Image</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">
                  {settings.customTitle || 'Our Story'}
                </h2>
                {settings.customDescription && (
                  <p className="text-sm text-muted-foreground line-clamp-4">
                    {settings.customDescription}
                  </p>
                )}
                {settings.buttonText && (
                  <button className="text-sm text-primary underline">
                    {settings.buttonText}
                  </button>
                )}
              </div>
            </div>
          </div>
        );

      case 'wedding_collection':
        return (
          <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-accent to-secondary/30 rounded-lg overflow-hidden">
            {settings.backgroundImage && (
              <img 
                src={settings.backgroundImage} 
                alt="Wedding" 
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-foreground/30 flex flex-col items-center justify-center text-center p-4">
              <h2 className="text-background text-xl font-bold mb-2">
                {settings.customTitle || 'Wedding Collection'}
              </h2>
              {settings.customSubtitle && (
                <p className="text-background/80 text-sm">{settings.customSubtitle}</p>
              )}
            </div>
          </div>
        );

      case 'newsletter':
        return (
          <div className="w-full p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg text-center">
            <h2 className="text-lg font-semibold mb-2">
              {settings.customTitle || 'Subscribe to Newsletter'}
            </h2>
            {settings.customDescription && (
              <p className="text-sm text-muted-foreground mb-4">{settings.customDescription}</p>
            )}
            <div className="flex gap-2 max-w-sm mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-3 py-2 border rounded-md text-sm"
                disabled
              />
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
                {settings.buttonText || 'Subscribe'}
              </button>
            </div>
          </div>
        );

      case 'final_cta':
        return (
          <div className="relative w-full aspect-[21/9] bg-gradient-to-r from-primary to-primary/80 rounded-lg overflow-hidden">
            {settings.backgroundImage && (
              <img 
                src={settings.backgroundImage} 
                alt="CTA" 
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-foreground/40 flex flex-col items-center justify-center text-center p-4">
              <h2 className="text-background text-xl font-bold mb-2">
                {settings.customTitle || 'Start Shopping Today'}
              </h2>
              {settings.buttonText && (
                <button className="px-6 py-2 bg-background text-foreground rounded-md font-medium text-sm">
                  {settings.buttonText}
                </button>
              )}
            </div>
          </div>
        );

      case 'reviews':
        return (
          <div className="w-full p-4 bg-muted/30 rounded-lg">
            <h2 className="text-lg font-semibold text-center mb-4">
              {settings.customTitle || 'Customer Reviews'}
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-3 bg-background rounded-md">
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} className="text-primary text-xs">★</span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    "Amazing product quality..."
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full p-6 bg-muted/30 rounded-lg text-center">
            <h2 className="text-lg font-semibold mb-2">
              {settings.customTitle || section.section_name}
            </h2>
            {settings.customSubtitle && (
              <p className="text-sm text-muted-foreground mb-2">{settings.customSubtitle}</p>
            )}
            {settings.customDescription && (
              <p className="text-xs text-muted-foreground">{settings.customDescription}</p>
            )}
            <p className="text-xs text-muted-foreground/50 mt-4">
              Preview for "{section.section_key}"
            </p>
          </div>
        );
    }
  };

  const activeSectionData = getActiveSectionData();

  return (
    <Card className={cn(
      "flex flex-col overflow-hidden",
      isFullscreen ? "fixed inset-4 z-50" : "h-full"
    )}>
      {/* Preview Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Live Preview</span>
          {activeSectionData && (
            <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-0.5 rounded">
              {activeSectionData.section_name}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {/* Device Switcher */}
          <div className="flex items-center bg-background rounded-md p-0.5 mr-2">
            <Button
              variant={device === 'desktop' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setDevice('desktop')}
              title="Desktop"
            >
              <Monitor className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={device === 'tablet' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setDevice('tablet')}
              title="Tablet"
            >
              <Tablet className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={device === 'mobile' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setDevice('mobile')}
              title="Mobile"
            >
              <Smartphone className="h-3.5 w-3.5" />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setRefreshKey(k => k + 1)}
            title="Refresh Preview"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          
          {onToggleFullscreen && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onToggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => window.open('/', '_blank')}
            title="Open Homepage"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      
      {/* Preview Content */}
      <div className="flex-1 overflow-auto bg-gradient-to-br from-muted/20 to-background p-4">
        <div 
          key={refreshKey}
          className="mx-auto transition-all duration-300"
          style={{ 
            maxWidth: deviceSizes[device].width,
            minHeight: '100%'
          }}
        >
          {activeSectionData ? (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground text-center mb-4">
                Previewing: <strong>{activeSectionData.section_name}</strong>
              </div>
              {renderSectionPreview(activeSectionData)}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs text-muted-foreground text-center mb-4">
                Full Homepage Preview (Sections in order)
              </div>
              {sections
                .sort((a, b) => {
                  // Maintain the sort order from database
                  return 0;
                })
                .map(section => (
                  <div key={section.id} className="relative group">
                    <div className="absolute -left-2 top-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {section.section_name}
                    </div>
                    {renderSectionPreview(section)}
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>
      
      {/* Device indicator */}
      <div className="text-center py-2 border-t bg-muted/30">
        <span className="text-xs text-muted-foreground">
          {deviceSizes[device].label} ({deviceSizes[device].width})
        </span>
      </div>
    </Card>
  );
};

export default HomepageLivePreview;
