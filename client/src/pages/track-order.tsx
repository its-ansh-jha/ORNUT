import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Circle, Package, RotateCcw, Search } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";

const deliveryStatuses = [
  { key: "order_placed", label: "Order Placed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "in_transit", label: "In Transit" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

export default function TrackOrder() {
  const [, params] = useRoute("/orders/:id");
  const orderId = params?.id;
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [orderNumber, setOrderNumber] = useState("");
  const [searchedOrderNumber, setSearchedOrderNumber] = useState("");
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [returnReason, setReturnReason] = useState("");

  // For authenticated users viewing their order
  const { data: order, isLoading: isLoadingOrder } = useQuery<any>({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId && !!user,
  });

  const { data: tracking = [], isLoading: isLoadingTracking } = useQuery<any[]>({
    queryKey: ["/api/orders", orderId, "tracking"],
    enabled: !!orderId && !!user,
  });

  // For public tracking by order number
  const { data: publicTrackingData, isLoading: isLoadingPublicTracking } = useQuery<any>({
    queryKey: ["/api/track", searchedOrderNumber],
    enabled: !!searchedOrderNumber,
  });

  const returnMutation = useMutation({
    mutationFn: async (reason: string) => {
      const orderToReturn = order || publicTrackingData?.order;
      return apiRequest("/api/returns", "POST", { orderId: orderToReturn.id, reason });
    },
    onSuccess: () => {
      toast({
        title: "Return request submitted",
        description: "We'll review your request and get back to you soon.",
      });
      setShowReturnDialog(false);
      setReturnReason("");
      queryClient.invalidateQueries({ queryKey: ["/api/returns"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit return request",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleReturnSubmit = () => {
    if (!returnReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for the return.",
        variant: "destructive",
      });
      return;
    }
    returnMutation.mutate(returnReason);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      toast({
        title: "Order number required",
        description: "Please enter your order number to track.",
        variant: "destructive",
      });
      return;
    }
    setSearchedOrderNumber(orderNumber.toUpperCase());
  };

  const displayOrder = order || publicTrackingData?.order;
  const displayTracking = tracking.length > 0 ? tracking : (publicTrackingData?.tracking || []);
  const isLoading = isLoadingOrder || isLoadingTracking || isLoadingPublicTracking;

  // Show search form if accessed from /track-order route
  if (!orderId && !searchedOrderNumber) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <div className="text-center mb-8">
          <Package className="h-24 w-24 mx-auto mb-6 text-primary" />
          <h1 className="text-3xl font-bold mb-4" data-testid="text-track-order-title">
            Track Your Order
          </h1>
          <p className="text-muted-foreground">
            Enter your order number to track your delivery
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enter Order Number</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <Input
                  placeholder="e.g., ORNUT12345678"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                  className="text-lg"
                  data-testid="input-order-number"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Your order number starts with "ORNUT" followed by numbers
                </p>
              </div>
              <Button type="submit" className="w-full" data-testid="button-track-order">
                <Search className="w-4 h-4 mr-2" />
                Track Order
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="h-96 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!displayOrder) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
        <Package className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
        <h1 className="text-3xl font-bold mb-4">Order not found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn't find an order with that number. Please check and try again.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setSearchedOrderNumber("");
            setOrderNumber("");
          }}
          data-testid="button-search-again"
        >
          Search Again
        </Button>
      </div>
    );
  }

  const currentStatusIndex = deliveryStatuses.findIndex(
    (s) => s.key === displayOrder.deliveryStatus
  );

  const deliveredTracking = displayTracking.find((t: any) => t.status === "delivered");
  const deliveryDate = deliveredTracking ? new Date(deliveredTracking.timestamp) : null;
  const daysElapsed = deliveryDate ? differenceInDays(new Date(), deliveryDate) : null;
  const canRequestReturn = user && displayOrder.deliveryStatus === "delivered" && daysElapsed !== null && daysElapsed <= 5;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold" data-testid="text-track-order-title">
          Track Order #{displayOrder.orderNumber}
        </h1>
        {searchedOrderNumber && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchedOrderNumber("");
              setOrderNumber("");
            }}
            data-testid="button-new-search"
          >
            <Search className="w-4 h-4 mr-2" />
            New Search
          </Button>
        )}
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {deliveryStatuses.map((status, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;

                return (
                  <div key={status.key} className="flex gap-4 pb-8 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div
                        className={`rounded-full p-2 ${
                          isCompleted
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </div>
                      {index < deliveryStatuses.length - 1 && (
                        <div
                          className={`w-0.5 h-16 ${
                            isCompleted ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={`font-semibold ${
                            isCurrent ? "text-primary" : ""
                          }`}
                        >
                          {status.label}
                        </h3>
                        {isCurrent && <Badge>Current</Badge>}
                      </div>
                      {displayTracking
                        .filter((t: any) => t.status === status.key)
                        .map((t: any, idx: number) => (
                          <div key={idx} className="text-sm text-muted-foreground mt-1">
                            <p>{t.message}</p>
                            {t.location && (
                              <p className="text-xs">Location: {t.location}</p>
                            )}
                            <p className="text-xs">
                              {format(new Date(t.timestamp), "PPpp")}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p className="font-semibold">{displayOrder.contactDetails.fullName}</p>
                <p>{displayOrder.shippingAddress.address}</p>
                <p>
                  {displayOrder.shippingAddress.city}, {displayOrder.shippingAddress.state}{" "}
                  {displayOrder.shippingAddress.zipCode}
                </p>
                <p className="pt-2">{displayOrder.contactDetails.phone}</p>
                <p>{displayOrder.contactDetails.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {displayOrder.orderItems?.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-12 h-12 rounded overflow-hidden">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity} × ₹{Number(item.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{Number(displayOrder.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {canRequestReturn && (
          <Card>
            <CardHeader>
              <CardTitle>Return Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Delivered {daysElapsed} {daysElapsed === 1 ? 'day' : 'days'} ago. 
                    You have {5 - (daysElapsed || 0)} {(5 - (daysElapsed || 0)) === 1 ? 'day' : 'days'} left to request a return.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowReturnDialog(true)}
                  data-testid="button-request-return"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Request Return
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent data-testid="dialog-request-return">
          <DialogHeader>
            <DialogTitle>Request Return</DialogTitle>
            <DialogDescription>
              Please provide a reason for your return request. Our team will review and get back to you shortly.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for return..."
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              rows={5}
              data-testid="input-return-reason"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowReturnDialog(false);
                setReturnReason("");
              }}
              data-testid="button-cancel-return"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReturnSubmit}
              disabled={returnMutation.isPending}
              data-testid="button-submit-return"
            >
              {returnMutation.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
