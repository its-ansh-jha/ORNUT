import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Truck } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { format } from "date-fns";

export default function Orders() {
  const { user } = useAuth();

  const { data: orders = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">My Orders</h1>
        <p className="text-muted-foreground mb-8">Please sign in to view your orders</p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-24 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-16 text-center">
        <Package className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
        <h1 className="text-3xl font-bold mb-4">No orders yet</h1>
        <p className="text-muted-foreground mb-8">Start shopping to place your first order!</p>
        <Link href="/products">
          <Button size="lg" data-testid="button-start-shopping">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    if (status === "delivered") return "default";
    if (status === "cancelled") return "destructive";
    return "secondary";
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8" data-testid="text-orders-title">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="hover-elevate" data-testid={`card-order-${order.id}`}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg" data-testid={`text-order-number-${order.id}`}>
                      Order #{order.orderNumber}
                    </h3>
                    <Badge variant={getStatusVariant(order.deliveryStatus)} className="capitalize">
                      {order.deliveryStatus.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Placed on {format(new Date(order.createdAt), "PPP")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-2xl font-bold text-primary" data-testid={`text-order-total-${order.id}`}>
                    ₹{Number(order.totalAmount).toFixed(2)}
                  </p>
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="outline" size="sm" data-testid={`button-view-details-${order.id}`}>
                      <Truck className="h-4 w-4 mr-2" />
                      Track Order
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-4 border-t">
                {order.orderItems?.slice(0, 3).map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-16 h-16 rounded overflow-hidden">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
                {order.orderItems && order.orderItems.length > 3 && (
                  <p className="text-sm text-muted-foreground self-center">
                    +{order.orderItems.length - 3} more items
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}