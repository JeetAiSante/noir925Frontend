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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Truck, Shield, ChevronLeft, Smartphone, Banknote, CheckCircle, Lock, ArrowRight, Sparkles, Gift, Tag, MapPin, Plus } from "lucide-react";
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
];

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isGiftWrap, setIsGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressDialog, setShowAddressDialog] = useState(false);

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

  // Fetch saved addresses
  useEffect(() => {
    if (user) {
      fetchSavedAddresses();
    }
  }, [user]);

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

  const shipping = cartTotal > 2000 ? 0 : 99;
  const tax = Math.round(cartTotal * 0.18);
  const giftWrapCost = isGiftWrap ? GIFT_WRAP_COST : 0;
  const couponDiscount = appliedCoupon ? Math.round(cartTotal * (appliedCoupon.discount / 100)) : 0;
  const total = cartTotal + shipping + tax + giftWrapCost - couponDiscount;

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
    if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.addressLine1 || !shippingInfo.city || !shippingInfo.state || !shippingInfo.postalCode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    setShowConfirmDialog(true);
  };

  const handlePlaceOrder = async () => {
    setShowConfirmDialog(false);
    setIsProcessing(true);

    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id || null,
          order_number: "",
          subtotal: cartTotal,
          shipping_cost: shipping,
          tax,
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

      if (orderError) throw orderError;

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

      if (itemsError) throw itemsError;

      // Update coupon usage count
      if (appliedCoupon) {
        const { data: coupon } = await supabase
          .from('coupons')
          .select('usage_count')
          .eq('code', appliedCoupon.code)
          .single();
        
        if (coupon) {
          await supabase
            .from('coupons')
            .update({ usage_count: (coupon.usage_count || 0) + 1 })
            .eq('code', appliedCoupon.code);
        }
      }

      // Send order confirmation email
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'order_confirmation',
            data: {
              orderNumber: order.order_number,
              customerName: shippingInfo.fullName,
              customerEmail: shippingInfo.email || user?.email,
              total,
              items: cartItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
              }))
            }
          }
        });
      } catch (emailError) {
        console.error('Email error:', emailError);
      }

      clearCart();
      toast({
        title: "🎉 Order Placed Successfully!",
        description: `Your order #${order.order_number} has been placed. Thank you for shopping with us!`,
      });
      navigate("/account");
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
          </div>

          {/* Order Summary */}
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (18% GST)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
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

      <Footer />
    </div>
  );
};

export default Checkout;
