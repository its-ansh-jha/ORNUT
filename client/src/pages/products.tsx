import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Heart, Search, SlidersHorizontal } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function Products() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [sortBy, setSortBy] = useState("name");
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: wishlist = [] } = useQuery<any[]>({
    queryKey: ["/api/wishlist"],
    enabled: !!user,
  });

  const addToCartMutation = useMutation({
    mutationFn: (productId: string) =>
      apiRequest("POST", "/api/cart", { productId, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ title: "Added to cart!" });
    },
  });

  const toggleWishlistMutation = useMutation({
    mutationFn: (productId: string) => {
      const isInWishlist = wishlist.some((item: any) => item.productId === productId);
      if (isInWishlist) {
        const wishlistItem = wishlist.find((item: any) => item.productId === productId);
        return apiRequest("DELETE", `/api/wishlist/${wishlistItem.id}`, {});
      }
      return apiRequest("POST", "/api/wishlist", { productId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
    },
  });

  const filteredProducts = products
    .filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(p.category);
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return Number(a.price) - Number(b.price);
      if (sortBy === "price-desc") return Number(b.price) - Number(a.price);
      return a.name.localeCompare(b.name);
    });

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleAddToCart = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please sign in to add items to cart", variant: "destructive" });
      return;
    }
    addToCartMutation.mutate(productId);
  };

  const handleToggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please sign in to add items to wishlist", variant: "destructive" });
      return;
    }
    toggleWishlistMutation.mutate(productId);
  };

  const FilterSection = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold mb-4 block">Categories</Label>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
                data-testid={`checkbox-category-${category}`}
              />
              <label
                htmlFor={category}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
              >
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Our Products</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <Card className="p-6">
            <FilterSection />
          </Card>
        </aside>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-product-search"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden" data-testid="button-filters">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSection />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <div className="aspect-square bg-muted animate-pulse" />
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded mb-2 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const isInWishlist = wishlist.some((item: any) => item.productId === product.id);
                return (
                  <Card
                    key={product.id}
                    className="overflow-hidden hover-elevate cursor-pointer group"
                    data-testid={`card-product-${product.id}`}
                  >
                    <Link href={`/product/${product.slug || product.id}`}>
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <Button
                          size="icon"
                          variant={isInWishlist ? "default" : "secondary"}
                          className="absolute top-4 right-4 rounded-full"
                          onClick={(e) => handleToggleWishlist(product.id, e)}
                          data-testid={`button-wishlist-${product.id}`}
                        >
                          <Heart
                            className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`}
                          />
                        </Button>
                      </div>
                    </Link>
                    <CardContent className="p-6">
                      <Link href={`/product/${product.slug || product.id}`}>
                        <h3 className="font-semibold text-xl mb-2" data-testid={`text-product-name-${product.id}`}>
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2 capitalize">
                          {product.category}
                        </p>
                        <p className="text-2xl font-bold text-primary mb-4" data-testid={`text-product-price-${product.id}`}>
                          ₹{Number(product.price).toFixed(2)}
                        </p>
                      </Link>
                      <Button
                        className="w-full"
                        onClick={(e) => handleAddToCart(product.id, e)}
                        disabled={addToCartMutation.isPending}
                        data-testid={`button-add-to-cart-${product.id}`}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}