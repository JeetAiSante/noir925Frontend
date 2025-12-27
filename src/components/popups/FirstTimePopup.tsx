import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LocationPopup from './LocationPopup';
import DiscountPopup from './DiscountPopup';
import SpinWheelPopup from './SpinWheelPopup';
import { useFeatureToggles } from '@/hooks/useFeatureToggle';

interface FirstTimePopupProps {
  children: React.ReactNode;
}

const FirstTimePopup = ({ children }: FirstTimePopupProps) => {
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [showDiscountPopup, setShowDiscountPopup] = useState(false);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [pageNavigations, setPageNavigations] = useState(0);
  const location = useLocation();
  
  // Get feature toggles from database
  const { data: features = [] } = useFeatureToggles();
  
  const isLocationPopupEnabled = features.find(f => f.feature_key === 'location_popup')?.is_enabled ?? true;
  const isDiscountPopupEnabled = features.find(f => f.feature_key === 'discount_popup')?.is_enabled ?? true;
  const isSpinWheelEnabled = features.find(f => f.feature_key === 'spin_wheel_popup')?.is_enabled ?? true;

  // Track page navigations for spin wheel
  useEffect(() => {
    if (!isSpinWheelEnabled) return;
    const hasSpun = localStorage.getItem('noir925_has_spun');
    if (!hasSpun) {
      setPageNavigations(prev => prev + 1);
    }
  }, [location.pathname, isSpinWheelEnabled]);

  // Show spin wheel after 2 page navigations
  useEffect(() => {
    if (!isSpinWheelEnabled) return;
    const hasSpun = localStorage.getItem('noir925_has_spun');
    if (!hasSpun && pageNavigations >= 2 && !showLocationPopup && !showDiscountPopup) {
      const timer = setTimeout(() => {
        setShowSpinWheel(true);
        localStorage.setItem('noir925_has_spun', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [pageNavigations, showLocationPopup, showDiscountPopup, isSpinWheelEnabled]);

  useEffect(() => {
    // Check if user has already set location
    const savedLocation = localStorage.getItem('noir925_location');
    const hasSubscribed = localStorage.getItem('noir925_subscribed');
    const popupShownToday = localStorage.getItem('noir925_popup_date');
    const today = new Date().toDateString();

    if (savedLocation) {
      setUserLocation(savedLocation);
    } else if (isLocationPopupEnabled) {
      // Show location popup after 2 seconds for first-time visitors
      const timer = setTimeout(() => {
        setShowLocationPopup(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    // Track scroll for discount popup
    if (isDiscountPopupEnabled && !hasSubscribed && popupShownToday !== today) {
      let scrollCount = 0;
      let lastScrollY = window.scrollY;
      
      const scrollListener = () => {
        if (Math.abs(window.scrollY - lastScrollY) > 300) {
          scrollCount++;
          lastScrollY = window.scrollY;
          
          // Show discount popup after 3 scroll events
          if (scrollCount >= 3 && !showDiscountPopup && !showLocationPopup && !showSpinWheel) {
            setShowDiscountPopup(true);
            localStorage.setItem('noir925_popup_date', today);
          }
        }
      };

      window.addEventListener('scroll', scrollListener, { passive: true });
      return () => window.removeEventListener('scroll', scrollListener);
    }
  }, [showLocationPopup, showDiscountPopup, showSpinWheel, isLocationPopupEnabled, isDiscountPopupEnabled]);

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
      
      <SpinWheelPopup
        open={showSpinWheel}
        onOpenChange={setShowSpinWheel}
      />
    </>
  );
};

export default FirstTimePopup;