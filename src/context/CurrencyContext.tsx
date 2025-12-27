import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface CurrencySetting {
  id: string;
  currency_code: string;
  currency_symbol: string;
  currency_name: string;
  exchange_rate: number;
  country_codes: string[];
  is_default: boolean;
  is_active: boolean;
}

interface CurrencyContextType {
  currentCurrency: CurrencySetting | null;
  currencies: CurrencySetting[];
  setCurrency: (currencyCode: string) => void;
  formatPrice: (priceInINR: number) => string;
  convertPrice: (priceInINR: number) => number;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currentCurrency, setCurrentCurrency] = useState<CurrencySetting | null>(null);

  const { data: currencies = [], isLoading } = useQuery({
    queryKey: ['currency-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('currency_settings')
        .select('*')
        .eq('is_active', true)
        .order('is_default', { ascending: false });
      
      if (error) throw error;
      return data as CurrencySetting[];
    },
  });

  // Detect user's country and set currency
  useEffect(() => {
    const detectAndSetCurrency = async () => {
      if (currencies.length === 0) return;

      // Check localStorage first
      const savedCurrency = localStorage.getItem('preferred_currency');
      if (savedCurrency) {
        const found = currencies.find(c => c.currency_code === savedCurrency);
        if (found) {
          setCurrentCurrency(found);
          return;
        }
      }

      // Try to detect location
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = data.country_code;

        const matchedCurrency = currencies.find(c => 
          c.country_codes.includes(countryCode)
        );

        if (matchedCurrency) {
          setCurrentCurrency(matchedCurrency);
          localStorage.setItem('preferred_currency', matchedCurrency.currency_code);
        } else {
          // Fall back to default currency
          const defaultCurrency = currencies.find(c => c.is_default) || currencies[0];
          setCurrentCurrency(defaultCurrency);
        }
      } catch (error) {
        // Fall back to default currency on error
        const defaultCurrency = currencies.find(c => c.is_default) || currencies[0];
        setCurrentCurrency(defaultCurrency);
      }
    };

    detectAndSetCurrency();
  }, [currencies]);

  const setCurrency = (currencyCode: string) => {
    const found = currencies.find(c => c.currency_code === currencyCode);
    if (found) {
      setCurrentCurrency(found);
      localStorage.setItem('preferred_currency', currencyCode);
    }
  };

  const convertPrice = (priceInINR: number): number => {
    if (!currentCurrency) return priceInINR;
    return Math.round(priceInINR * currentCurrency.exchange_rate * 100) / 100;
  };

  const formatPrice = (priceInINR: number): string => {
    if (!currentCurrency) return `₹${priceInINR.toLocaleString('en-IN')}`;
    
    const converted = convertPrice(priceInINR);
    
    // Format based on currency
    if (currentCurrency.currency_code === 'INR') {
      return `${currentCurrency.currency_symbol}${converted.toLocaleString('en-IN')}`;
    }
    
    return `${currentCurrency.currency_symbol}${converted.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currentCurrency,
        currencies,
        setCurrency,
        formatPrice,
        convertPrice,
        isLoading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
