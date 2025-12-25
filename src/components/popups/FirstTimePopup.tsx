import { useState, useEffect } from 'react';
import LocationPopup from './LocationPopup';
import DiscountPopup from './DiscountPopup';

interface FirstTimePopupProps {
  children: React.ReactNode;
}

const FirstTimePopup = ({ children }: FirstTimePopupProps) => {
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [showDiscountPopup, setShowDiscountPopup] = useState(false);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [scrollCount, setScrollCount] = useState(0);

  useEffect(() => {
    // Check if user has already set location
    const savedLocation = localStorage.getItem('noir925_location');
    const hasSubscribed = localStorage.getItem('noir925_subscribed');
    const popupShownToday = localStorage.getItem('noir925_popup_date');
    const today = new Date().toDateString();

    if (savedLocation) {
      setUserLocation(savedLocation);
    } else {
      // Show location popup after 2 seconds for first-time visitors
      const timer = setTimeout(() => {
        setShowLocationPopup(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    // Track scroll for discount popup
    if (!hasSubscribed && popupShownToday !== today) {
      const handleScroll = () => {
        setScrollCount(prev => {
          const newCount = prev + 1;
          // Show discount popup after 3 scroll events
          if (newCount >= 3 && !showDiscountPopup && !showLocationPopup) {
            setShowDiscountPopup(true);
            localStorage.setItem('noir925_popup_date', today);
          }
          return newCount;
        });
      };

      let lastScrollY = window.scrollY;
      const scrollListener = () => {
        if (Math.abs(window.scrollY - lastScrollY) > 300) {
          handleScroll();
          lastScrollY = window.scrollY;
        }
      };

      window.addEventListener('scroll', scrollListener, { passive: true });
      return () => window.removeEventListener('scroll', scrollListener);
    }
  }, [showLocationPopup, showDiscountPopup]);

  const handleLocationSelect = (location: string) => {
    setUserLocation(location);
  };

  return (
    <>
      {children}
      
      <LocationPopup
        open={showLocationPopup}
        onOpenChange={setShowLocationPopup}
        onLocationSelect={handleLocationSelect}
      />
      
      <DiscountPopup
        open={showDiscountPopup}
        onOpenChange={setShowDiscountPopup}
      />
    </>
  );
};

export default FirstTimePopup;