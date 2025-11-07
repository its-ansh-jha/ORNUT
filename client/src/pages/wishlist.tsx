import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Wishlist() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: wishlistItems = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/wishlist"],
    enabled: !!user,
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: (itemId: string) =>
      apiRequest("DELETE", `/api/wishlist/${itemId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({ title: "Removed from wishlist" });
    },
  });

  const moveToCartMutation = useMutation({
    mutationFn: async ({ productId, itemId }: { productId: string; itemId: string }) => {
      await apiRequest("POST", "/api/cart", { productId, quantity: 1 });
      await apiRequest("DELETE", `/api/wishlist/${itemId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({ title: "Moved to cart!" });
    },
  });

  if (!user) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Wishlist</h1>
        <p className="text-muted-foreground mb-8">Please sign in to view your wishlist</p>
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Wishlist</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="aspect-square bg-muted animate-pulse" />
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded mb-2 animate-pulse" />
                <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-16 text-center">
        <Heart className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
        <h1 className="text-3xl font-bold mb-4">Your wishlist is empty</h1>
        <p className="text-muted-foreground mb-8">Save your favorite products for later!</p>
        <Link href="/products">
          <Button size="lg" data-testid="button-browse-products">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8" data-testid="text-wishlist-title">
        Your Wishlist ({wishlistItems.length} items)
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((item) => (
          <Card key={item.id} className="overflow-hidden" data-testid={`card-wishlist-item-${item.id}`}>
            <Link href={`/product/${item.product.id}`}>
              <div className="aspect-square overflow-hidden">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
            </Link>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg" data-testid={`text-wishlist-item-name-${item.id}`}>
                    {item.product.name}
                  </h3>
                  <p className="text-xl font-bold text-primary" data-testid={`text-wishlist-item-price-${item.id}`}>
                    ₹{Number(item.product.price).toFixed(2)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFromWishlistMutation.mutate(item.id)}
                  data-testid={`button-remove-${item.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Button
                className="w-full"
                onClick={() =>
                  moveToCartMutation.mutate({
                    productId: item.product.id,
                    itemId: item.id,
                  })
                }
                disabled={moveToCartMutation.isPending}
                data-testid={`button-move-to-cart-${item.id}`}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Move to Cart
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
