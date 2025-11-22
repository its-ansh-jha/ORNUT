import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingCart, Search, Star } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Products() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [category, setCategory] = useState("all");

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const filteredProducts = useMemo(() => {
    let result = products;

    if (searchTerm) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (category !== "all") {
      result = result.filter(p => p.category === category);
    }

    if (sortBy === "price-low") {
      result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, searchTerm, sortBy, category]);

  return (
    <>
      <Helmet>
        <title>Products - Ornut | Premium Peanut Butter Online</title>
        <meta name="description" content="Browse our full range of premium peanut butter products. Natural, high-protein, gluten-free options. Free shipping over ₹1200." />
        <meta name="keywords" content="peanut butter, natural peanut butter, high protein, gluten free, buy online" />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-r from-[#037A3F] to-[#026a34] text-white">
          <div className="container mx-auto max-w-7xl px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Products</h1>
            <p className="text-lg text-green-100">Discover our range of premium peanut butter products</p>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 border-b bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-lg bg-white border-gray-200 focus:border-[#037A3F]"
                  data-testid="input-search-products"
                />
              </div>

              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger data-testid="select-category" className="rounded-lg">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="peanut-butter">Peanut Butter</SelectItem>
                  <SelectItem value="chocolate">Chocolate</SelectItem>
                  <SelectItem value="crunchy">Crunchy</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger data-testid="select-sort" className="rounded-lg">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="price-low">Price (Low to High)</SelectItem>
                  <SelectItem value="price-high">Price (High to Low)</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setCategory("all");
                  setSortBy("featured");
                }}
                className="border-[#037A3F] text-[#037A3F] hover:bg-[#037A3F] hover:text-white rounded-lg"
                data-testid="button-reset-filters"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16 bg-white">
          <div className="container mx-auto max-w-7xl px-4">
            {isLoading ? (
              <div className="text-center py-12">Loading products...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No products found. Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-8 font-medium">Showing {filteredProducts.length} products</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("Please sign in to add items to cart");
      }
      return apiRequest("POST", "/api/cart", { productId: product.id, quantity: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Product added successfully!",
        action: (
          <Button 
            size="sm" 
            onClick={() => navigate("/cart")}
            data-testid="button-go-to-cart"
          >
            Go to Cart
          </Button>
        )
      });
    },
    onError: (error: any) => {
      if (error.message.includes("sign in")) {
        toast({
          title: "Sign in required",
          description: "Please sign in to add items to cart",
          variant: "destructive",
        });
      }
    },
  });

  return (
    <Link href={`/product/${product.slug || product.id}`}>
      <Card className="hover-elevate h-full cursor-pointer overflow-hidden border-0 shadow-sm" data-testid={`card-product-${product.id}`}>
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 bg-[#9EEA01] text-[#037A3F] px-3 py-1 rounded-full text-xs font-bold shadow-sm">
            20% OFF
          </div>
        </div>
        <CardContent className="pt-6 pb-4">
          <h3 className="font-semibold text-lg mb-2 text-gray-900 line-clamp-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-1">{product.description}</p>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold text-[#037A3F]">₹{Math.round((Number(product.price) || 0) * 0.8)}</span>
            <span className="text-sm text-gray-500 line-through">₹{Number(product.price) || 0}</span>
          </div>

          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-[#9EEA01] text-sm">★</span>
            ))}
            <span className="text-xs text-gray-600 ml-1">(124)</span>
          </div>

          <Button 
            onClick={(e) => {
              e.preventDefault();
              addToCartMutation.mutate();
            }}
            disabled={addToCartMutation.isPending}
            className="w-full bg-[#037A3F] hover:bg-[#026a34] text-white rounded-full font-semibold"
            data-testid={`button-add-to-cart-${product.id}`}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
