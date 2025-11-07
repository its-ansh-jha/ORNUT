import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Circle, Package, RotateCcw } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [returnReason, setReturnReason] = useState("");

  const { data: order, isLoading } = useQuery<any>({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId,
  });

  const { data: tracking = [] } = useQuery<any[]>({
    queryKey: ["/api/orders", orderId, "tracking"],
    enabled: !!orderId,
  });

  const returnMutation = useMutation({
    mutationFn: async (reason: string) => {
      return apiRequest("/api/returns", "POST", { orderId: order.id, reason });
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

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="h-96 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
        <Package className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
        <h1 className="text-3xl font-bold mb-4">Order not found</h1>
      </div>
    );
  }

  const currentStatusIndex = deliveryStatuses.findIndex(
    (s) => s.key === order.deliveryStatus
  );

  const deliveredTracking = tracking.find((t: any) => t.status === "delivered");
  const deliveryDate = deliveredTracking ? new Date(deliveredTracking.timestamp) : null;
  const daysElapsed = deliveryDate ? differenceInDays(new Date(), deliveryDate) : null;
  const canRequestReturn = order.deliveryStatus === "delivered" && daysElapsed !== null && daysElapsed <= 5;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8" data-testid="text-track-order-title">
        Track Order #{order.orderNumber}
      </h1>

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
                      {tracking
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
                <p className="font-semibold">{order.contactDetails.fullName}</p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zipCode}
                </p>
                <p className="pt-2">{order.contactDetails.phone}</p>
                <p>{order.contactDetails.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.orderItems?.map((item: any, idx: number) => (
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
                    <span>₹{Number(order.totalAmount).toFixed(2)}</span>
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
