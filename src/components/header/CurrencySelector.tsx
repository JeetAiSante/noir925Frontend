import { useCurrency } from '@/context/CurrencyContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe, Check } from 'lucide-react';

const CurrencySelector = () => {
  const { currentCurrency, currencies, setCurrency, isLoading } = useCurrency();

  if (isLoading || !currentCurrency) {
    return (
      <Button variant="ghost" size="sm" className="opacity-50" disabled>
        <Globe className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 text-sm font-medium">
          <span className="text-base">{currentCurrency.currency_symbol}</span>
          <span className="hidden sm:inline">{currentCurrency.currency_code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {currencies.map((currency) => (
          <DropdownMenuItem
            key={currency.id}
            onClick={() => setCurrency(currency.currency_code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg w-6">{currency.currency_symbol}</span>
              <span>{currency.currency_name}</span>
            </span>
            {currentCurrency.currency_code === currency.currency_code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CurrencySelector;
