import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DiscountPopup from './DiscountPopup';
import SpinWheelPopup from './SpinWheelPopup';
import { useFeatureToggles } from '@/hooks/useFeatureToggle';

interface FirstTimePopupProps {
  children: React.ReactNode;
}

const FirstTimePopup = ({ children }: FirstTimePopupProps) => {
  const [showDiscountPopup, setShowDiscountPopup] = useState(false);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [pageNavigations, setPageNavigations] = useState(0);
  const location = useLocation();
  
  // Get feature toggles from database
  const { data: features = [] } = useFeatureToggles();
  
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
    if (!hasSpun && pageNavigations >= 2 && !showDiscountPopup) {
      const timer = setTimeout(() => {
        setShowSpinWheel(true);
        localStorage.setItem('noir925_has_spun', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [pageNavigations, showDiscountPopup, isSpinWheelEnabled]);

  useEffect(() => {
    const hasSubscribed = localStorage.getItem('noir925_subscribed');
    const popupShownToday = localStorage.getItem('noir925_popup_date');
    const today = new Date().toDateString();

    // Track scroll for discount popup
    if (isDiscountPopupEnabled && !hasSubscribed && popupShownToday !== today) {
      let scrollCount = 0;
      let lastScrollY = window.scrollY;
      
      const scrollListener = () => {
        if (Math.abs(window.scrollY - lastScrollY) > 300) {
          scrollCount++;
          lastScrollY = window.scrollY;
          
          // Show discount popup after 3 scroll events
          if (scrollCount >= 3 && !showDiscountPopup && !showSpinWheel) {
            setShowDiscountPopup(true);
            localStorage.setItem('noir925_popup_date', today);
          }
        }
      };

      window.addEventListener('scroll', scrollListener, { passive: true });
      return () => window.removeEventListener('scroll', scrollListener);
    }
  }, [showDiscountPopup, showSpinWheel, isDiscountPopupEnabled]);

  return (
    <>
      {children}
      
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