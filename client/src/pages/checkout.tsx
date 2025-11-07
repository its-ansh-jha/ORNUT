import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { load } from "@cashfreepayments/cashfree-js";
import { X, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 characters"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cashfree, setCashfree] = useState<any>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  const { data: cartItems = [] } = useQuery<any[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        // Initialize Cashfree SDK in production mode
        const cf = await load({ mode: "production" });
        setCashfree(cf);
        console.log("Cashfree SDK initialized in production mode");
      } catch (error) {
        console.error("Cashfree SDK initialization error:", error);
        toast({
          title: "Payment system unavailable",
          description: "Please refresh the page and try again",
          variant: "destructive",
        });
      }
    };
    initializeSDK();
  }, [toast]);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.displayName || "",
      email: user?.email || "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  const createPaymentOrderMutation = useMutation({
    mutationFn: (data: CheckoutFormData) =>
      apiRequest("POST", "/api/payment/create-order", {
        shippingAddress: {
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
        },
        contactDetails: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
        },
        couponId: appliedCoupon?.id,
      }),
    onSuccess: async (data: any) => {
      if (!cashfree) {
        toast({
          title: "Payment error",
          description: "Payment system not initialized",
          variant: "destructive",
        });
        return;
      }

      try {
        const checkoutOptions = {
          paymentSessionId: data.payment_session_id,
          redirectTarget: "_modal",
        };

        const result = await cashfree.checkout(checkoutOptions);
        
        if (result.error) {
          toast({
            title: "Payment failed",
            description: result.error.message || "Please try again",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }

        if (result.paymentDetails) {
          const verifyResponse = await apiRequest("POST", "/api/payment/verify", {
            orderId: data.order_id,
          });

          if (verifyResponse.success) {
            toast({
              title: "Payment successful!",
              description: `Order #${data.order_id}`,
            });
            navigate(`/orders/${verifyResponse.order.id}`);
          } else {
            toast({
              title: "Payment verification pending",
              description: "Please check your order status",
            });
            navigate("/orders");
          }
        }
      } catch (error) {
        console.error("Payment error:", error);
        toast({
          title: "Payment failed",
          description: "Please try again",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    },
    onError: () => {
      toast({
        title: "Order creation failed",
        description: "Please try again",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  if (!user) {
    navigate("/");
    return null;
  }

  if (cartItems.length === 0) {
    navigate("/cart");
    return null;
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );
  const shipping = subtotal >= 1200 ? 0 : 40;
  const couponDiscount = appliedCoupon?.discountAmount || 0;
  const total = subtotal + shipping - couponDiscount;

  const applyCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const orderTotal = subtotal + shipping;
      return apiRequest("POST", "/api/coupons/validate", { code, orderTotal });
    },
    onSuccess: (data: any) => {
      setAppliedCoupon(data);
      setCouponCode("");
      toast({
        title: "Coupon applied!",
        description: `You saved ₹${data.discountAmount.toFixed(2)}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Invalid coupon",
        description: error.message || "Please check the coupon code and try again",
        variant: "destructive",
      });
    },
  });

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast({
        title: "Enter coupon code",
        description: "Please enter a valid coupon code",
        variant: "destructive",
      });
      return;
    }
    applyCouponMutation.mutate(couponCode.toUpperCase());
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast({
      title: "Coupon removed",
    });
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);
    await createPaymentOrderMutation.mutateAsync(data);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8" data-testid="text-checkout-title">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-fullName" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-city" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-state" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-zipCode" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isProcessing}
                    data-testid="button-place-order"
                  >
                    {isProcessing ? "Processing..." : "Place Order"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-sm">
                      ₹{(Number(item.product.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span data-testid="text-checkout-subtotal">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span data-testid="text-checkout-shipping">
                    {shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="pt-4 border-t space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Have a coupon?
                </Label>
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      data-testid="input-coupon-code"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={applyCouponMutation.isPending}
                      data-testid="button-apply-coupon"
                    >
                      {applyCouponMutation.isPending ? "..." : "Apply"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-primary/10 rounded">
                      <Badge variant="default" className="font-mono">
                        {appliedCoupon.code}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        data-testid="button-remove-coupon"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex justify-between text-sm text-primary">
                      <span>Coupon Discount</span>
                      <span data-testid="text-coupon-discount">-₹{couponDiscount.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4 border-t text-lg font-bold">
                <span>Total</span>
                <span data-testid="text-checkout-total">₹{total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
