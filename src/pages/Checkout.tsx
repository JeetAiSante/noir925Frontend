import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLoyaltySettings, useUserLoyaltyPoints, useEarnPoints, useRedeemPoints } from "@/hooks/useLoyaltyPoints";
import { z } from "zod";
import { CreditCard, Truck, Shield, ChevronLeft, Smartphone, Banknote, CheckCircle, Lock, ArrowRight, Sparkles, Gift, Tag, MapPin, Plus, Star, Coins, Info } from "lucide-react";
import GiftWrapping from "@/components/checkout/GiftWrapping";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GIFT_WRAP_COST = 99;

interface SavedAddress {
  id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  address_type: string;
}

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh'
] as const;

// Zod schema for checkout form validation
const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().trim().regex(/^[+]?91?[0-9]{10}$/, "Invalid phone number (10 digits required)"),
  addressLine1: z.string().trim().min(5, "Address must be at least 5 characters").max(200, "Address must be less than 200 characters"),
  addressLine2: z.string().trim().max(200, "Address must be less than 200 characters").optional().or(z.literal("")),
  city: z.string().trim().min(2, "City must be at least 2 characters").max(100, "City must be less than 100 characters"),
  state: z.enum(indianStates, { errorMap: () => ({ message: "Please select a valid state" }) }),
  postalCode: z.string().trim().regex(/^[0-9]{6}$/, "Postal code must be 6 digits"),
  country: z.string().default("India"),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { formatPrice, currentCurrency } = useCurrency();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isGiftWrap, setIsGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSaveAddressDialog, setShowSaveAddressDialog] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [taxSettings, setTaxSettings] = useState<{ tax_name: string; tax_percent: number; is_enabled: boolean; is_inclusive: boolean } | null>(null);

  // Loyalty hooks
  const { data: loyaltySettings } = useLoyaltySettings();
  const { data: userPoints } = useUserLoyaltyPoints();
  const earnPointsMutation = useEarnPoints();
  const redeemPointsMutation = useRedeemPoints();

  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to proceed with checkout",
      });
      navigate("/auth?redirect=/checkout");
    }
  }, [user, navigate, toast]);

  // Fetch saved addresses and tax settings
  useEffect(() => {
    if (user) {
      fetchSavedAddresses();
    }
    fetchTaxSettings();
  }, [user]);

  const fetchTaxSettings = async () => {
    const { data } = await supabase
      .from('tax_settings')
      .select('*')
      .single();
    
    if (data) {
      setTaxSettings(data);
    }
  };

  const fetchSavedAddresses = async () => {
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user?.id)
      .order('is_default', { ascending: false });
    
    if (data && data.length > 0) {
      setSavedAddresses(data);
      // Auto-select default address
      const defaultAddr = data.find(a => a.is_default) || data[0];
      if (defaultAddr) {
        selectAddress(defaultAddr);
      }
    }
  };

  const selectAddress = (address: SavedAddress) => {
    setSelectedAddressId(address.id);
    setShippingInfo({
      fullName: address.full_name,
      email: user?.email || "",
      phone: address.phone,
      addressLine1: address.address_line1,
      addressLine2: address.address_line2 || "",
      city: address.city,
      state: address.state,
      postalCode: address.postal_code,
      country: address.country,
    });
  };

  // Calculate tax based on admin settings
  const taxPercent = taxSettings?.is_enabled ? taxSettings.tax_percent : 0;
  const taxAmount = taxSettings?.is_inclusive 
    ? Math.round(cartTotal - (cartTotal / (1 + taxPercent / 100)))
    : Math.round(cartTotal * (taxPercent / 100));
  const shipping = cartTotal > 2000 ? 0 : 99;
  const giftWrapCost = isGiftWrap ? GIFT_WRAP_COST : 0;
  const couponDiscount = appliedCoupon ? Math.round(cartTotal * (appliedCoupon.discount / 100)) : 0;
  const total = taxSettings?.is_inclusive 
    ? cartTotal + shipping + giftWrapCost - couponDiscount - loyaltyDiscount
    : cartTotal + shipping + taxAmount + giftWrapCost - couponDiscount - loyaltyDiscount;
  const potentialPoints = loyaltySettings?.is_enabled ? Math.floor(cartTotal * (loyaltySettings.points_per_rupee || 1)) : 0;

  const handleRedeemPoints = () => {
    if (!userPoints || !loyaltySettings) return;

    const availablePoints = userPoints.available_points || 0;
    const maxPointsToRedeem = Math.min(
      availablePoints,
      Math.floor((cartTotal * (loyaltySettings.max_discount_percent || 50)) / 100 / (loyaltySettings.points_value_per_rupee || 0.25))
    );

    if (pointsToRedeem > 0 && pointsToRedeem <= maxPointsToRedeem) {
      const discount = Math.floor(pointsToRedeem * (loyaltySettings.points_value_per_rupee || 0.25));
      setLoyaltyDiscount(discount);
      toast({
        title: 'Points Applied!',
        description: `${pointsToRedeem} points redeemed for ₹${discount} discount`,
      });
    }
  };

  const removePointsDiscount = () => {
    setPointsToRedeem(0);
    setLoyaltyDiscount(0);
    toast({
      title: 'Points Removed',
      description: 'Loyalty points discount has been removed',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAddressId(null); // Clear selected address when typing
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handleGiftWrapChange = (enabled: boolean, message: string) => {
    setIsGiftWrap(enabled);
    setGiftMessage(message);
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsApplyingCoupon(true);
    
    // Fetch from database
    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .eq('is_active', true)
      .single();
    
    if (coupon) {
      // Check min order value
      if (coupon.min_order_value && cartTotal < Number(coupon.min_order_value)) {
        toast({
          title: 'Minimum Order Not Met',
          description: `This coupon requires a minimum order of ₹${coupon.min_order_value}`,
          variant: 'destructive',
        });
        setIsApplyingCoupon(false);
        return;
      }

      // Check usage limit
      if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
        toast({
          title: 'Coupon Expired',
          description: 'This coupon has reached its usage limit',
          variant: 'destructive',
        });
        setIsApplyingCoupon(false);
        return;
      }

      const discountValue = coupon.discount_type === 'percentage' 
        ? Number(coupon.discount_value) 
        : (Number(coupon.discount_value) / cartTotal) * 100;

      setAppliedCoupon({ code: coupon.code, discount: discountValue });
      toast({
        title: 'Coupon Applied!',
        description: `${coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`} discount applied`,
      });
    } else {
      toast({
        title: 'Invalid Coupon',
        description: 'This coupon code is not valid.',
        variant: 'destructive',
      });
    }
    
    setIsApplyingCoupon(false);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast({
      title: 'Coupon Removed',
      description: 'The discount has been removed from your order.',
    });
  };

  const handlePlaceOrderClick = () => {
    // Validate with Zod schema
    const result = checkoutSchema.safeParse(shippingInfo);
    
    if (!result.success) {
      const firstError = result.error.errors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }
    setShowConfirmDialog(true);
  };

  const handlePlaceOrder = async () => {
    setShowConfirmDialog(false);
    setIsProcessing(true);

    // Track items with successfully decremented stock for potential rollback
    const decrementedItems: { id: string; quantity: number }[] = [];
    let couponUsed = false;

    try {
      // ATOMIC: Use coupon first if applied (before order creation)
      if (appliedCoupon) {
        const { data: couponResult, error: couponError } = await supabase
          .rpc('atomic_use_coupon', { coupon_code_input: appliedCoupon.code });

        if (couponError || !couponResult || couponResult.length === 0) {
          throw new Error('Failed to validate coupon');
        }

        const result = couponResult[0];
        if (!result.success) {
          toast({
            title: "Coupon Error",
            description: result.error_message || 'This coupon is no longer available',
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }
        couponUsed = true;
      }

      // ATOMIC: Decrement stock for all items atomically
      for (const item of cartItems) {
        const { data: stockResult, error: stockError } = await supabase
          .rpc('atomic_decrement_stock', { 
            product_id_input: item.id, 
            quantity_input: item.quantity 
          });

        if (stockError || !stockResult || stockResult.length === 0) {
          // Rollback previously decremented stock
          for (const decremented of decrementedItems) {
            await supabase.rpc('atomic_rollback_stock', { 
              product_id_input: decremented.id, 
              quantity_input: decremented.quantity 
            });
          }
          // Rollback coupon if used
          if (couponUsed && appliedCoupon) {
            await supabase.rpc('atomic_rollback_coupon', { coupon_code_input: appliedCoupon.code });
          }
          throw new Error('Failed to reserve stock');
        }

        const result = stockResult[0];
        if (!result.success) {
          // Rollback previously decremented stock
          for (const decremented of decrementedItems) {
            await supabase.rpc('atomic_rollback_stock', { 
              product_id_input: decremented.id, 
              quantity_input: decremented.quantity 
            });
          }
          // Rollback coupon if used
          if (couponUsed && appliedCoupon) {
            await supabase.rpc('atomic_rollback_coupon', { coupon_code_input: appliedCoupon.code });
          }
          toast({
            title: "Insufficient Stock",
            description: result.error_message || `${item.name} is not available in the requested quantity.`,
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }

        decrementedItems.push({ id: item.id, quantity: item.quantity });
      }

      // Now create the order - stock is already reserved
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id || null,
          order_number: "",
          subtotal: cartTotal,
          shipping_cost: shipping,
          tax: taxAmount,
          discount: couponDiscount,
          total,
          payment_method: paymentMethod,
          payment_status: "pending",
          status: "pending",
          notes: isGiftWrap ? `Gift wrapped with message: ${giftMessage}` : null,
          shipping_address: {
            full_name: shippingInfo.fullName,
            address_line1: shippingInfo.addressLine1,
            address_line2: shippingInfo.addressLine2,
            city: shippingInfo.city,
            state: shippingInfo.state,
            postal_code: shippingInfo.postalCode,
            country: shippingInfo.country,
            phone: shippingInfo.phone,
            gift_wrap: isGiftWrap,
            gift_message: giftMessage,
            coupon_code: appliedCoupon?.code || null,
          },
        })
        .select()
        .single();

      if (orderError) {
        // Rollback stock and coupon on order creation failure
        for (const decremented of decrementedItems) {
          await supabase.rpc('atomic_rollback_stock', { 
            product_id_input: decremented.id, 
            quantity_input: decremented.quantity 
          });
        }
        if (couponUsed && appliedCoupon) {
          await supabase.rpc('atomic_rollback_coupon', { coupon_code_input: appliedCoupon.code });
        }
        throw orderError;
      }

      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_image: item.image,
        quantity: item.quantity,
        price: item.price,
        size: item.size || null,
        variant: item.variant || null,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        // Rollback stock and coupon on order items insertion failure
        for (const decremented of decrementedItems) {
          await supabase.rpc('atomic_rollback_stock', { 
            product_id_input: decremented.id, 
            quantity_input: decremented.quantity 
          });
        }
        if (couponUsed && appliedCoupon) {
          await supabase.rpc('atomic_rollback_coupon', { coupon_code_input: appliedCoupon.code });
        }
        throw itemsError;
      }

      // Coupon already atomically updated above, no need to update again

      // Redeem loyalty points if applied
      if (loyaltyDiscount > 0 && pointsToRedeem > 0) {
        try {
          await redeemPointsMutation.mutateAsync({ points: pointsToRedeem, orderId: order.id });
        } catch (err) {
          console.error('Error redeeming points:', err);
        }
      }

      // Earn loyalty points on this order
      if (loyaltySettings?.is_enabled) {
        try {
          await earnPointsMutation.mutateAsync({ orderTotal: cartTotal, orderId: order.id });
        } catch (err) {
          console.error('Error earning points:', err);
        }
      }

      // Stock already atomically decremented above, no need to update again

      // Send order confirmation email with invoice
      try {
        const estimatedDelivery = new Date();
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);
        
        await supabase.functions.invoke('send-order-confirmation', {
          body: {
            orderNumber: order.order_number,
            customerName: shippingInfo.fullName,
            customerEmail: shippingInfo.email || user?.email,
            items: cartItems.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              image: item.image
            })),
            subtotal: cartTotal,
            shipping: shipping,
            tax: taxAmount,
            discount: (appliedCoupon?.discount || 0) + loyaltyDiscount,
            total: total,
            shippingAddress: {
              addressLine1: shippingInfo.addressLine1,
              addressLine2: shippingInfo.addressLine2,
              city: shippingInfo.city,
              state: shippingInfo.state,
              postalCode: shippingInfo.postalCode,
              country: shippingInfo.country
            },
            paymentMethod: paymentMethod === 'card' ? 'Credit/Debit Card' : paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'wallet' ? 'Digital Wallet' : 'Cash on Delivery',
            estimatedDelivery: estimatedDelivery.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
          }
        });
      } catch (emailError) {
        console.error('Email error:', emailError);
      }

      // Check for low stock and send alerts
      try {
        await supabase.functions.invoke('low-stock-alert', {});
      } catch (stockAlertError) {
        console.error('Stock alert error:', stockAlertError);
      }

      clearCart();
      toast({
        title: "🎉 Order Placed Successfully!",
        description: `Your order #${order.order_number} has been placed. Thank you for shopping with us!`,
      });
      
      // Check if address is not already saved and show save prompt
      const isAddressSaved = savedAddresses.some(addr => 
        addr.address_line1 === shippingInfo.addressLine1 && 
        addr.postal_code === shippingInfo.postalCode
      );
      
      if (!isAddressSaved && shippingInfo.addressLine1) {
        setShowSaveAddressDialog(true);
      } else {
        navigate("/account");
      }
    } catch (error) {
      console.error("Order error:", error);
      toast({
        title: "Order Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const saveNewAddress = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('addresses')
      .insert({
        user_id: user.id,
        full_name: shippingInfo.fullName,
        phone: shippingInfo.phone,
        address_line1: shippingInfo.addressLine1,
        address_line2: shippingInfo.addressLine2 || null,
        city: shippingInfo.city,
        state: shippingInfo.state,
        postal_code: shippingInfo.postalCode,
        country: shippingInfo.country,
        is_default: savedAddresses.length === 0,
        address_type: 'home',
      });

    if (!error) {
      toast({ title: 'Address saved successfully' });
      fetchSavedAddresses();
      setShowAddressDialog(false);
    }
  };

  if (!user) {
    return null; // Will redirect via useEffect
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 md:py-24 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <CreditCard className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-display mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">Add some items to your cart before checkout.</p>
            <Button onClick={() => navigate("/shop")} variant="luxury">
              Continue Shopping
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 md:py-8">
        <button
          onClick={() => navigate("/cart")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Cart
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="text-2xl md:text-3xl font-display">Secure Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Shipping & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Saved Addresses */}
            {savedAddresses.length > 0 && (
              <div className="bg-card rounded-xl p-5 border border-border">
                <h2 className="text-lg font-display mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Select Delivery Address
                </h2>
                <div className="grid md:grid-cols-2 gap-3 mb-4">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => selectAddress(addr)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium capitalize">{addr.address_type}</span>
                        {addr.is_default && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Default</span>
                        )}
                      </div>
                      <p className="font-medium text-sm">{addr.full_name}</p>
                      <p className="text-xs text-muted-foreground">{addr.address_line1}</p>
                      <p className="text-xs text-muted-foreground">{addr.city}, {addr.state} - {addr.postal_code}</p>
                      {selectedAddressId === addr.id && (
                        <CheckCircle className="w-5 h-5 text-primary mt-2" />
                      )}
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowAddressDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Address
                </Button>
              </div>
            )}

            {/* Shipping Information */}
            <div className="bg-card rounded-xl p-5 border border-border">
              <h2 className="text-lg font-display mb-5 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck className="w-4 h-4 text-primary" />
                </div>
                {savedAddresses.length > 0 ? 'Or Enter New Address' : 'Shipping Information'}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="fullName" className="text-sm">Full Name *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={shippingInfo.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm">Phone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    className="mt-1.5"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="addressLine1" className="text-sm">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    name="addressLine1"
                    value={shippingInfo.addressLine1}
                    onChange={handleInputChange}
                    placeholder="Street address"
                    className="mt-1.5"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="addressLine2" className="text-sm">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    name="addressLine2"
                    value={shippingInfo.addressLine2}
                    onChange={handleInputChange}
                    placeholder="Apartment, suite, etc."
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="city" className="text-sm">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-sm">State *</Label>
                  <Select
                    value={shippingInfo.state}
                    onValueChange={(value) => setShippingInfo({ ...shippingInfo, state: value })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianStates.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="postalCode" className="text-sm">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={shippingInfo.postalCode}
                    onChange={handleInputChange}
                    placeholder="110001"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="country" className="text-sm">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={shippingInfo.country}
                    onChange={handleInputChange}
                    disabled
                    className="mt-1.5 bg-muted"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-card rounded-xl p-5 border border-border">
              <h2 className="text-lg font-display mb-5 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-primary" />
                </div>
                Payment Method
              </h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                <label 
                  htmlFor="card"
                  className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="card" id="card" />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Credit / Debit Card</p>
                    <p className="text-xs text-muted-foreground">Visa, Mastercard, RuPay</p>
                  </div>
                  {paymentMethod === 'card' && <CheckCircle className="w-5 h-5 text-primary" />}
                </label>
                
                <label 
                  htmlFor="upi"
                  className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="upi" id="upi" />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">UPI Payment</p>
                    <p className="text-xs text-muted-foreground">GPay, PhonePe, Paytm</p>
                  </div>
                  {paymentMethod === 'upi' && <CheckCircle className="w-5 h-5 text-primary" />}
                </label>
                
                <label 
                  htmlFor="cod"
                  className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="cod" id="cod" />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <Banknote className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-xs text-muted-foreground">Pay when you receive</p>
                  </div>
                  {paymentMethod === 'cod' && <CheckCircle className="w-5 h-5 text-primary" />}
                </label>
              </RadioGroup>
            </div>

            {/* Gift Wrapping */}
            <GiftWrapping
              onGiftWrapChange={handleGiftWrapChange}
              giftWrapCost={GIFT_WRAP_COST}
            />

            {/* Coupon Code */}
            <div className="bg-card rounded-xl p-5 border border-border">
              <h2 className="text-lg font-display mb-5 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Tag className="w-4 h-4 text-primary" />
                </div>
                Coupon Code
              </h2>
              
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="font-medium">{appliedCoupon.code}</span>
                    <span className="text-sm text-muted-foreground">
                      ({appliedCoupon.discount}% off)
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={removeCoupon}>
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="uppercase"
                  />
                  <Button 
                    onClick={applyCoupon} 
                    disabled={isApplyingCoupon || !couponCode.trim()}
                  >
                    {isApplyingCoupon ? 'Applying...' : 'Apply'}
                  </Button>
                </div>
              )}
            </div>

            {/* Loyalty Points */}
            {loyaltySettings?.is_enabled && userPoints && (userPoints.available_points || 0) > 0 && (
              <div className="bg-card rounded-xl p-5 border border-border">
                <h2 className="text-lg font-display mb-5 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Coins className="w-4 h-4 text-primary" />
                  </div>
                  Loyalty Points
                </h2>
                
                <div className="mb-4 p-3 bg-accent/10 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-accent" />
                    <span className="font-medium">Available Points:</span>
                  </div>
                  <span className="font-display text-lg text-primary">{userPoints.available_points?.toLocaleString()}</span>
                </div>

                {loyaltyDiscount > 0 ? (
                  <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="font-medium">{pointsToRedeem} points = ₹{loyaltyDiscount}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={removePointsDiscount}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder={`Enter points (min ${loyaltySettings.min_points_to_redeem})`}
                        value={pointsToRedeem || ''}
                        onChange={(e) => setPointsToRedeem(Math.min(parseInt(e.target.value) || 0, userPoints.available_points || 0))}
                        min={loyaltySettings.min_points_to_redeem}
                        max={userPoints.available_points || 0}
                      />
                      <Button 
                        onClick={handleRedeemPoints} 
                        disabled={pointsToRedeem < (loyaltySettings.min_points_to_redeem || 100)}
                      >
                        Redeem
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {loyaltySettings.points_value_per_rupee} points = ₹1 | Min: {loyaltySettings.min_points_to_redeem} points
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Points to earn banner */}
            {loyaltySettings?.is_enabled && potentialPoints > 0 && (
              <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg flex items-center gap-3">
                <Star className="w-5 h-5 text-accent" />
                <p className="text-sm">
                  <span className="font-medium">Earn {potentialPoints} points</span> on this order!
                </p>
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-5 border border-border sticky top-20">
              <h2 className="text-lg font-display mb-5">Order Summary</h2>
              
              <div className="space-y-3 mb-5 max-h-[300px] overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      {item.size && (
                        <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={shipping === 0 ? 'text-primary font-medium' : ''}>
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
                {taxSettings?.is_enabled && taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {taxSettings.tax_name} ({taxSettings.tax_percent}%{taxSettings.is_inclusive ? ' incl.' : ''})
                    </span>
                    <span>{taxSettings.is_inclusive ? 'Included' : `₹${taxAmount.toLocaleString()}`}</span>
                  </div>
                )}
                {isGiftWrap && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Gift className="w-3 h-3" /> Gift Wrapping
                    </span>
                    <span>₹{giftWrapCost}</span>
                  </div>
                )}
                {appliedCoupon && appliedCoupon.discount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                {loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-accent">
                    <span className="flex items-center gap-1">
                      <Coins className="w-3 h-3" /> Points Discount
                    </span>
                    <span>-₹{loyaltyDiscount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between text-lg font-display mb-5">
                <span>Total</span>
                <span className="text-primary">₹{total.toLocaleString()}</span>
              </div>

              <Button
                className="w-full"
                size="lg"
                variant="luxury"
                onClick={handlePlaceOrderClick}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Place Order
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-muted/50 rounded-lg">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">
                  256-bit SSL Secure Checkout
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Order Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Order</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to place an order for ₹{total.toLocaleString()}. 
              This will be delivered to {shippingInfo.addressLine1}, {shippingInfo.city}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePlaceOrder}>
              Confirm Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Address Dialog */}
      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save This Address</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Would you like to save this address for future orders?
            </p>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">{shippingInfo.fullName}</p>
              <p className="text-sm text-muted-foreground">{shippingInfo.addressLine1}</p>
              <p className="text-sm text-muted-foreground">{shippingInfo.city}, {shippingInfo.state} - {shippingInfo.postalCode}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddressDialog(false)}>
                Not Now
              </Button>
              <Button className="flex-1" onClick={saveNewAddress}>
                Save Address
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Address After Order Dialog */}
      <AlertDialog open={showSaveAddressDialog} onOpenChange={setShowSaveAddressDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Save This Address?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to save this shipping address for faster checkout next time?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="p-4 bg-muted/50 rounded-lg my-2">
            <p className="font-medium">{shippingInfo.fullName}</p>
            <p className="text-sm text-muted-foreground">{shippingInfo.addressLine1}</p>
            {shippingInfo.addressLine2 && (
              <p className="text-sm text-muted-foreground">{shippingInfo.addressLine2}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {shippingInfo.city}, {shippingInfo.state} - {shippingInfo.postalCode}
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => navigate("/account")}>
              No Thanks
            </AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              await saveNewAddress();
              navigate("/account");
            }}>
              Save Address
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default Checkout;
