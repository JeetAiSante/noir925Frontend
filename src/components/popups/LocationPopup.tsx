import { useState, useEffect } from 'react';
import { MapPin, Navigation, Search, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface LocationPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (location: string) => void;
}

const indianCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata',
  'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
  'Lucknow', 'Chandigarh', 'Kochi', 'Indore', 'Nagpur'
];

const LocationPopup = ({ open, onOpenChange, onLocationSelect }: LocationPopupProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [filteredCities, setFilteredCities] = useState(indianCities);

  useEffect(() => {
    setFilteredCities(
      indianCities.filter(city =>
        city.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm]);

  const detectLocation = async () => {
    setIsDetecting(true);
    try {
      await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      selectCity('Mumbai');
    } catch {
      selectCity('Delhi');
    } finally {
      setIsDetecting(false);
    }
  };

  const selectCity = (city: string) => {
    localStorage.setItem('noir925_location', city);
    onLocationSelect(city);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-sm p-0 gap-0 overflow-hidden bg-card border-primary/10 shadow-luxury">
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 z-10 w-7 h-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-muted transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <MapPin className="w-6 h-6 text-primary" />
          </div>
          <h2 className="font-display text-lg mb-0.5">Select Your City</h2>
          <p className="text-xs text-muted-foreground">For personalized shopping</p>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Detect Location */}
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center gap-2 h-10 border-primary/20 hover:bg-primary/5"
            onClick={detectLocation}
            disabled={isDetecting}
          >
            <Navigation className={cn("w-4 h-4", isDetecting && "animate-spin")} />
            {isDetecting ? 'Detecting...' : 'Use Current Location'}
          </Button>

          <div className="relative flex items-center gap-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] text-muted-foreground uppercase">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-sm bg-muted/50 border-0"
            />
          </div>

          {/* Cities Grid */}
          <div className="grid grid-cols-3 gap-1.5 max-h-32 overflow-y-auto">
            {filteredCities.map((city) => (
              <button
                key={city}
                onClick={() => selectCity(city)}
                className="px-2 py-1.5 text-xs rounded-md bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors truncate"
              >
                {city}
              </button>
            ))}
          </div>

          {filteredCities.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-2">
              No cities found
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPopup;
