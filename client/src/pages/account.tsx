import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { 
  Package, 
  Heart, 
  RotateCcw, 
  User, 
  Mail, 
  ShoppingBag,
  MapPin,
  CreditCard
} from "lucide-react";

export default function Account() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  const { data: orders = [] } = useQuery<any[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  const { data: returns = [] } = useQuery<any[]>({
    queryKey: ["/api/returns"],
    enabled: !!user,
  });

  const { data: wishlistItems = [] } = useQuery<any[]>({
    queryKey: ["/api/wishlist"],
    enabled: !!user,
  });

  if (!user) {
    navigate("/");
    return null;
  }

  const activeOrders = orders.filter(
    (o) => o.deliveryStatus !== "delivered" && o.status !== "cancelled"
  );
  const completedOrders = orders.filter(
    (o) => o.deliveryStatus === "delivered" || o.status === "cancelled"
  );

  const initials = user.displayName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || user.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8" data-testid="text-account-title">
          My Account
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                    <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold" data-testid="text-user-name">
                    {user.displayName || "User"}
                  </h2>
                  <p className="text-sm text-muted-foreground" data-testid="text-user-email">
                    {user.email}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-3 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Member since</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Email verified</span>
                    <Badge variant="secondary" className="ml-auto">
                      {user.emailVerified ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => logout()}
                  data-testid="button-sign-out"
                >
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="hover-elevate cursor-pointer" onClick={() => navigate("/orders")}>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Total Orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" data-testid="text-total-orders">
                    {orders.length}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate cursor-pointer" onClick={() => navigate("/wishlist")}>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Wishlist Items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" data-testid="text-wishlist-count">
                    {wishlistItems.length}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate cursor-pointer" onClick={() => navigate("/returns")}>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Returns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" data-testid="text-returns-count">
                    {returns.length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your account and orders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/orders">
                  <Button variant="outline" className="w-full justify-start gap-3" data-testid="button-view-orders">
                    <Package className="h-5 w-5" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">My Orders</div>
                      <div className="text-xs text-muted-foreground">
                        {activeOrders.length} active • {completedOrders.length} completed
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/wishlist">
                  <Button variant="outline" className="w-full justify-start gap-3" data-testid="button-view-wishlist">
                    <Heart className="h-5 w-5" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">My Wishlist</div>
                      <div className="text-xs text-muted-foreground">
                        {wishlistItems.length} saved {wishlistItems.length === 1 ? 'item' : 'items'}
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/returns">
                  <Button variant="outline" className="w-full justify-start gap-3" data-testid="button-view-returns">
                    <RotateCcw className="h-5 w-5" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">Returns & Refunds</div>
                      <div className="text-xs text-muted-foreground">
                        {returns.filter((r) => r.status === "pending").length} pending requests
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/track-order">
                  <Button variant="outline" className="w-full justify-start gap-3" data-testid="button-track-order">
                    <MapPin className="h-5 w-5" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">Track Order</div>
                      <div className="text-xs text-muted-foreground">
                        Check your delivery status
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/products">
                  <Button variant="outline" className="w-full justify-start gap-3" data-testid="button-shop-now">
                    <ShoppingBag className="h-5 w-5" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">Continue Shopping</div>
                      <div className="text-xs text-muted-foreground">
                        Browse our premium peanut butter
                      </div>
                    </div>
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            {orders.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Orders</CardTitle>
                    <Link href="/orders">
                      <Button variant="ghost" size="sm" data-testid="button-view-all-orders">
                        View All
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover-elevate cursor-pointer"
                        onClick={() => navigate(`/orders/${order.id}`)}
                        data-testid={`order-item-${order.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Package className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">Order #{order.orderNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.orderItems?.length || 0} {order.orderItems?.length === 1 ? 'item' : 'items'} • ₹{Number(order.totalAmount).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <Badge>
                          {order.deliveryStatus.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
