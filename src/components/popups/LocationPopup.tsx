import { useState, useEffect } from 'react';
import { MapPin, Navigation, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface LocationPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (location: string) => void;
}

const indianCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Kochi',
  'Indore', 'Bhopal', 'Nagpur', 'Surat', 'Vadodara', 'Coimbatore'
];

const LocationPopup = ({ open, onOpenChange, onLocationSelect }: LocationPopupProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [filteredCities, setFilteredCities] = useState(indianCities);

  useEffect(() => {
    if (searchTerm) {
      setFilteredCities(
        indianCities.filter(city => 
          city.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredCities(indianCities);
    }
  }, [searchTerm]);

  const detectLocation = () => {
    setIsDetecting(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Use reverse geocoding (simplified - in production use a proper API)
            const { latitude, longitude } = position.coords;
            // For demo, we'll just pick a random nearby city
            const nearestCity = indianCities[Math.floor(Math.random() * indianCities.length)];
            onLocationSelect(nearestCity);
            localStorage.setItem('noir925_location', nearestCity);
            onOpenChange(false);
          } catch (error) {
            console.error('Geocoding error:', error);
          } finally {
            setIsDetecting(false);
          }
        },
        (error) => {
          console.error('Location error:', error);
          setIsDetecting(false);
        }
      );
    } else {
      setIsDetecting(false);
    }
  };

  const selectCity = (city: string) => {
    onLocationSelect(city);
    localStorage.setItem('noir925_location', city);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <MapPin className="w-5 h-5 text-primary" />
            Select Your Location
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Detect Location Button */}
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={detectLocation}
            disabled={isDetecting}
          >
            <Navigation className={`w-5 h-5 text-primary ${isDetecting ? 'animate-pulse' : ''}`} />
            {isDetecting ? 'Detecting your location...' : 'Use my current location'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or select manually
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for your city..."
              className="pl-10"
            />
          </div>

          {/* City List */}
          <div className="max-h-60 overflow-y-auto space-y-1">
            {filteredCities.map((city) => (
              <button
                key={city}
                onClick={() => selectCity(city)}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-accent transition-colors flex items-center gap-3"
              >
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{city}</span>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPopup;