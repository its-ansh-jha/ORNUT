import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Heart, Minus, Plus, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:slugOrId");
  const slugOrId = params?.slugOrId;
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", slugOrId],
    enabled: !!slugOrId,
  });

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: wishlist = [] } = useQuery<any[]>({
    queryKey: ["/api/wishlist"],
    enabled: !!user,
  });

  const addToCartMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/cart", { productId: product?.id, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ title: "Added to cart!", description: `${quantity} item(s) added` });
    },
  });

  const toggleWishlistMutation = useMutation({
    mutationFn: () => {
      const isInWishlist = wishlist.some((item: any) => item.productId === product?.id);
      if (isInWishlist) {
        const wishlistItem = wishlist.find((item: any) => item.productId === product?.id);
        return apiRequest("DELETE", `/api/wishlist/${wishlistItem.id}`, {});
      }
      return apiRequest("POST", "/api/wishlist", { productId: product?.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({ title: isInWishlist ? "Removed from wishlist" : "Added to wishlist!" });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-muted animate-pulse rounded-lg" />
          <div className="space-y-4">
            <div className="h-12 bg-muted rounded animate-pulse" />
            <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
            <div className="h-24 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link href="/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    );
  }

  const isInWishlist = wishlist.some((item: any) => item.productId === product?.id);
  const relatedProducts = allProducts
    .filter((p) => p.id !== product?.id && p.category === product.category)
    .slice(0, 3);

  const handleAddToCart = () => {
    if (!user) {
      toast({ title: "Please sign in to add items to cart", variant: "destructive" });
      return;
    }
    addToCartMutation.mutate();
  };

  const handleToggleWishlist = () => {
    if (!user) {
      toast({ title: "Please sign in to add items to wishlist", variant: "destructive" });
      return;
    }
    toggleWishlistMutation.mutate();
  };

  // Generate SEO-optimized metadata
  const pageTitle = `${product.metaTitle || product.name} | Ornut - Premium Peanut Butter`;
  const metaDescription = product.metaDescription || `Buy ${product.name} online in India. ${product.description}. Free shipping on orders over ₹1200. 100% natural peanut butter made in India.`;
  const productUrl = `https://ornut.com/product/${product.slug || product.id}`;

  // Generate JSON-LD structured data for Google
  const productStructuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": product.description,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "Ornut"
    },
    "offers": {
      "@type": "Offer",
      "url": productUrl,
      "priceCurrency": "INR",
      "price": product.price,
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Ornut"
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={productUrl} />
        
        {/* Open Graph tags for social sharing */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={product.image} />
        <meta property="og:url" content={productUrl} />
        <meta property="og:site_name" content="Ornut" />
        
        {/* Product-specific Open Graph tags */}
        <meta property="product:price:amount" content={String(product.price)} />
        <meta property="product:price:currency" content="INR" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product.name} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={product.image} />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(productStructuredData)}
        </script>
      </Helmet>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Link href="/products">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div className="aspect-square rounded-lg overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            data-testid="img-product"
          />
        </div>

        <div className="flex flex-col">
          <h1 className="text-4xl font-bold mb-4" data-testid="text-product-name">
            {product.name}
          </h1>
          <p className="text-sm text-muted-foreground mb-4 capitalize">
            {product.category}
          </p>
          <p className="text-4xl font-bold text-primary mb-6" data-testid="text-product-price">
            ₹{Number(product.price).toFixed(2)}
          </p>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                data-testid="button-decrease-quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="px-4 font-semibold" data-testid="text-quantity">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                data-testid="button-increase-quantity"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {product.inStock ? (
              <span className="text-sm text-primary font-medium">In Stock</span>
            ) : (
              <span className="text-sm text-destructive font-medium">Out of Stock</span>
            )}
          </div>

          <div className="flex gap-4 mb-8">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={!product.inStock || addToCartMutation.isPending}
              data-testid="button-add-to-cart"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </Button>
            <Button
              size="lg"
              variant={isInWishlist ? "default" : "outline"}
              onClick={handleToggleWishlist}
              disabled={toggleWishlistMutation.isPending}
              data-testid="button-toggle-wishlist"
            >
              <Heart className={`h-5 w-5 ${isInWishlist ? "fill-current" : ""}`} />
            </Button>
          </div>

          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="description" className="flex-1" data-testid="tab-description">
                Description
              </TabsTrigger>
              <TabsTrigger value="nutrition" className="flex-1" data-testid="tab-nutrition">
                Nutrition
              </TabsTrigger>
              <TabsTrigger value="shipping" className="flex-1" data-testid="tab-shipping">
                Shipping
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4">
              <p className="text-muted-foreground">{product.description}</p>
            </TabsContent>
            <TabsContent value="nutrition" className="mt-4">
              <p className="text-muted-foreground">
                Made with 100% roasted peanuts. Rich in protein, healthy fats, and essential nutrients.
                No artificial ingredients or preservatives.
              </p>
            </TabsContent>
            <TabsContent value="shipping" className="mt-4">
              <p className="text-muted-foreground">
                Free standard shipping on orders over ₹1200.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-3xl font-semibold mb-8">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Card key={relatedProduct.id} className="overflow-hidden hover-elevate">
                <Link href={`/product/${relatedProduct.slug || relatedProduct.id}`}>
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{relatedProduct.name}</h3>
                    <p className="text-xl font-bold text-primary">
                      ₹{Number(relatedProduct.price).toFixed(2)}
                    </p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}
      </div>
    </>
  );
}
