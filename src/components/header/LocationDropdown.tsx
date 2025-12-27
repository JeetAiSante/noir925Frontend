import { useState, useEffect, useCallback } from 'react';
import { MapPin, ChevronDown, Navigation, Search, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const cities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 
  'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
  'Lucknow', 'Chandigarh', 'Kochi', 'Indore', 'Nagpur'
];

const LocationDropdown = () => {
  const [location, setLocation] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Load saved location on mount and persist across navigation
  useEffect(() => {
    const saved = localStorage.getItem('noir925_location');
    const savedCoords = localStorage.getItem('noir925_location_coords');
    
    if (saved) {
      setLocation(saved);
      setHasPermission(true);
    } else {
      checkGeolocationPermission();
    }

    // Listen for storage changes (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'noir925_location' && e.newValue) {
        setLocation(e.newValue);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const checkGeolocationPermission = async () => {
    if (!navigator.permissions) return;
    
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      setHasPermission(result.state === 'granted');
      
      // If permission was already granted, auto-detect location
      if (result.state === 'granted' && !localStorage.getItem('noir925_location')) {
        detectLocation();
      }
      
      // Listen for permission changes
      result.onchange = () => {
        setHasPermission(result.state === 'granted');
        if (result.state === 'granted' && !location) {
          detectLocation();
        }
      };
    } catch (error) {
      console.error('Permission check failed:', error);
    }
  };

  const filteredCities = cities.filter(city => 
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const detectLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsDetecting(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { 
          timeout: 15000,
          enableHighAccuracy: true,
          maximumAge: 300000 // 5 minutes cache
        });
      });
      
      const { latitude, longitude } = position.coords;
      
      // Use BigDataCloud free reverse geocoding API
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      
      if (response.ok) {
        const data = await response.json();
        const detectedCity = data.city || data.locality || data.principalSubdivision;
        
        // Check if detected city is in our list, otherwise find nearest major city
        const matchedCity = cities.find(
          city => city.toLowerCase() === detectedCity?.toLowerCase()
        );
        
        if (matchedCity) {
          selectCity(matchedCity);
          toast.success(`Location detected: ${matchedCity}`);
        } else if (detectedCity) {
          // Add detected city to selection even if not in predefined list
          selectCity(detectedCity);
          toast.success(`Location detected: ${detectedCity}`);
        } else {
          // Fallback to state/region
          const fallbackCity = data.principalSubdivision || 'Mumbai';
          selectCity(fallbackCity);
          toast.success(`Location detected: ${fallbackCity}`);
        }
        
        setHasPermission(true);
      } else {
        throw new Error('Geocoding failed');
      }
    } catch (error: any) {
      console.error('Location detection failed:', error);
      
      if (error.code === 1) {
        // Permission denied
        setHasPermission(false);
        toast.error('Location access denied. Please select your city manually.');
      } else if (error.code === 2) {
        toast.error('Unable to detect location. Please try again.');
      } else if (error.code === 3) {
        toast.error('Location detection timed out. Please try again.');
      } else {
        toast.error('Failed to detect location. Please select manually.');
      }
    } finally {
      setIsDetecting(false);
    }
  }, [location]);

  const selectCity = (city: string, coords?: { lat: number; lng: number }) => {
    setLocation(city);
    localStorage.setItem('noir925_location', city);
    if (coords) {
      localStorage.setItem('noir925_location_coords', JSON.stringify(coords));
    }
    // Dispatch custom event for immediate sync across components
    window.dispatchEvent(new CustomEvent('locationChanged', { detail: { city, coords } }));
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "gap-1.5 text-xs md:text-sm font-normal h-8 px-2 md:px-3",
            "hover:bg-primary/5 transition-all duration-300",
            "border border-transparent hover:border-primary/20 rounded-full"
          )}
          aria-label={location ? `Current location: ${location}` : 'Select your city'}
        >
          <MapPin className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
          <span className="hidden sm:inline max-w-[80px] truncate">
            {location || 'Select City'}
          </span>
          <ChevronDown className="w-3 h-3 opacity-50" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-64 p-3 bg-card/98 backdrop-blur-xl border-primary/10 shadow-luxury"
      >
        {/* Detect Location */}
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 mb-3 border-primary/20 hover:bg-primary/5"
          onClick={detectLocation}
          disabled={isDetecting}
        >
          {isDetecting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          {isDetecting ? 'Detecting...' : 'Detect My Location'}
        </Button>

        {/* GPS Status Indicator */}
        {hasPermission !== null && (
          <p className={cn(
            "text-xs mb-2 flex items-center gap-1",
            hasPermission ? "text-green-600" : "text-muted-foreground"
          )}>
            <span className={cn(
              "w-2 h-2 rounded-full",
              hasPermission ? "bg-green-500" : "bg-muted-foreground"
            )} />
            {hasPermission ? 'GPS enabled' : 'GPS not enabled'}
          </p>
        )}

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 text-sm bg-muted/50 border-0"
            aria-label="Search for a city"
          />
        </div>

        <DropdownMenuSeparator />

        {/* Cities List */}
        <div className="max-h-48 overflow-y-auto space-y-0.5" role="listbox" aria-label="Available cities">
          {filteredCities.map((city) => (
            <DropdownMenuItem
              key={city}
              onClick={() => selectCity(city)}
              className={cn(
                "cursor-pointer rounded-lg",
                location === city && "bg-primary/10 text-primary"
              )}
              role="option"
              aria-selected={location === city}
            >
              <MapPin className="w-3.5 h-3.5 mr-2 opacity-50" aria-hidden="true" />
              {city}
            </DropdownMenuItem>
          ))}
        </div>

        {filteredCities.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            No cities found
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LocationDropdown;
