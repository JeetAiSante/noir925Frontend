import { useState, useEffect } from 'react';
import { MapPin, ChevronDown, Navigation, Search } from 'lucide-react';
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

  useEffect(() => {
    const saved = localStorage.getItem('noir925_location');
    if (saved) setLocation(saved);
  }, []);

  const filteredCities = cities.filter(city => 
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const detectLocation = async () => {
    setIsDetecting(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      // Simplified: just set to nearest major city based on lat
      const lat = position.coords.latitude;
      const city = lat > 20 ? 'Delhi' : lat > 15 ? 'Mumbai' : 'Chennai';
      selectCity(city);
    } catch {
      // Fallback
    } finally {
      setIsDetecting(false);
    }
  };

  const selectCity = (city: string) => {
    setLocation(city);
    localStorage.setItem('noir925_location', city);
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
        >
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span className="hidden sm:inline max-w-[80px] truncate">
            {location || 'Select City'}
          </span>
          <ChevronDown className="w-3 h-3 opacity-50" />
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
          <Navigation className={cn("w-4 h-4", isDetecting && "animate-spin")} />
          {isDetecting ? 'Detecting...' : 'Detect My Location'}
        </Button>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 text-sm bg-muted/50 border-0"
          />
        </div>

        <DropdownMenuSeparator />

        {/* Cities List */}
        <div className="max-h-48 overflow-y-auto space-y-0.5">
          {filteredCities.map((city) => (
            <DropdownMenuItem
              key={city}
              onClick={() => selectCity(city)}
              className={cn(
                "cursor-pointer rounded-lg",
                location === city && "bg-primary/10 text-primary"
              )}
            >
              <MapPin className="w-3.5 h-3.5 mr-2 opacity-50" />
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
