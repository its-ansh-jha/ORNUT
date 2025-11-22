import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Leaf, Award, Truck, CheckCircle, Star } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { useAuth } from "@/lib/auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@assets/generated_images/Hero_banner_peanut_butter_156a8621.png";

export default function Home() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const featuredProducts = products?.slice(0, 4) || [];

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Ornut",
    "url": "https://peanutproducts.in",
    "logo": "https://peanutproducts.in/logo.png",
    "description": "Premium high protein peanut butter made in India with 100% natural ingredients. No preservatives, no added sugar.",
    "sameAs": [
      "https://www.facebook.com/ornut",
      "https://www.instagram.com/ornu_t",
      "https://twitter.com/ornut"
    ]
  };

  return (
    <>
      <Helmet>
        <title>Ornut - Premium High Protein Peanut Butter Made in India | 100% Natural</title>
        <meta 
          name="description" 
          content="Buy premium high protein peanut butter online in India. 100% natural, gluten-free, no preservatives. Made with roasted peanuts. Free shipping over ₹1200. Best natural peanut butter for fitness and health." 
        />
        <meta name="keywords" content="high protein peanut butter, natural peanut butter, peanut butter India, best peanut butter, gluten free peanut butter, healthy peanut butter, protein rich peanut butter, made in India, no preservatives" />
        <link rel="canonical" href="https://peanutproducts.in/" />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Ornut - Premium High Protein Peanut Butter Made in India" />
        <meta property="og:description" content="100% natural, high protein peanut butter. No preservatives, gluten-free. Made with premium roasted peanuts in India. Free shipping over ₹1200." />
        <meta property="og:url" content="https://peanutproducts.in/" />
        <meta property="og:site_name" content="Ornut" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ornut - Premium High Protein Peanut Butter" />
        <meta name="twitter:description" content="100% natural, high protein peanut butter made in India. No preservatives, gluten-free." />

        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
      </Helmet>

      <div className="flex flex-col">
        {/* Hero Section */}
        <section
          className="relative h-[500px] md:h-[600px] flex items-center justify-center text-white overflow-hidden"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/60 to-transparent" />
          <div className="relative z-10 container mx-auto max-w-7xl px-4 text-left">
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Peanut Butter Khana Hai
              </h1>
              <p className="text-lg md:text-xl mb-8 text-gray-100 max-w-xl">
                Experience the pure taste of premium peanut butter. 100% natural, high-protein, and deliciously crafted for your health.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/products">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700" data-testid="button-shop-now">
                    Shop Now
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="backdrop-blur-md bg-white/20 border-white text-white hover:bg-white/30" data-testid="button-explore">
                  Explore Products
                </Button>
              </div>
              <div className="mt-12 flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>100% Natural Ingredients • No Preservatives</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-400" />
                  <span>High Protein • Gluten Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-green-400" />
                  <span>Free Shipping Over ₹1200</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Best Sellers</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Handpicked peanut butter products loved by thousands of customers
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-12">Loading products...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <Link href="/products">
                <Button size="lg" variant="outline" data-testid="button-view-all">
                  View All Products
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Ornut */}
        <section className="py-20 bg-gradient-to-b from-green-50 to-white">
          <div className="container mx-auto max-w-7xl px-4">
            <h2 className="text-4xl font-bold text-center mb-16">Why Choose Ornut?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">100% Natural</h3>
                <p className="text-gray-600">Pure peanuts, no additives or preservatives</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">High Protein</h3>
                <p className="text-gray-600">Packed with 8-10g protein per serving</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Gluten Free</h3>
                <p className="text-gray-600">Safe for celiac and gluten-sensitive diets</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                <p className="text-gray-600">Free shipping on orders over ₹1200</p>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Testimonials */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4">
            <h2 className="text-4xl font-bold text-center mb-16">What Our Customers Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Rajesh Kumar",
                  rating: 5,
                  text: "Best peanut butter I've had! Creamy, natural taste, and perfect for my fitness routine. Highly recommended!"
                },
                {
                  name: "Priya Sharma",
                  rating: 5,
                  text: "Love how natural and pure this is. No artificial taste. My whole family enjoys it on toast and in smoothies."
                },
                {
                  name: "Amit Verma",
                  rating: 5,
                  text: "Fast delivery, great quality, and absolutely delicious. Will definitely order again. Worth every penny!"
                }
              ].map((testimonial, idx) => (
                <Card key={idx} className="hover-elevate">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                    <p className="font-semibold text-sm">— {testimonial.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-green-600 text-white">
          <div className="container mx-auto max-w-7xl px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Taste the Difference?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of health-conscious customers enjoying premium peanut butter
            </p>
            <Link href="/products">
              <Button size="lg" variant="outline" className="bg-white text-green-600 border-white hover:bg-gray-100" data-testid="button-get-started">
                Get Started Now
              </Button>
            </Link>
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
            variant="default"
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
      <Card className="hover-elevate h-full cursor-pointer overflow-hidden" data-testid={`card-product-${product.id}`}>
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
          {Math.random() > 0.5 && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              20% Off
            </div>
          )}
        </div>
        <CardContent className="pt-4 pb-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold text-green-600">₹{Math.round((Number(product.price) || 0) * 0.8)}</span>
            <span className="text-sm text-gray-500 line-through">₹{Number(product.price) || 0}</span>
          </div>

          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-xs text-gray-600 ml-1">(124 reviews)</span>
          </div>

          <Button 
            onClick={(e) => {
              e.preventDefault();
              addToCartMutation.mutate();
            }}
            disabled={addToCartMutation.isPending}
            className="w-full bg-green-600 hover:bg-green-700"
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
