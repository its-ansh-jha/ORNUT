import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Heart, Leaf, Award, Truck, CheckCircle, Shield, Zap } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { useAuth } from "@/lib/auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@assets/generated_images/Hero_banner_peanut_butter_156a8621.png";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
      "https://www.instagram.com/ornut",
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
        <meta property="og:image" content="https://peanutproducts.in/og-image.jpg" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ornut - Premium High Protein Peanut Butter" />
        <meta name="twitter:description" content="100% natural, high protein peanut butter made in India. No preservatives, gluten-free." />
        <meta name="twitter:image" content="https://peanutproducts.in/og-image.jpg" />

        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
      </Helmet>

      <div className="flex flex-col">
        {/* Hero Section */}
        <section
          className="relative h-[500px] md:h-[600px] flex items-center justify-center text-white"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(3, 122, 63, 0.8) 0%, rgba(158, 234, 1, 0.3) 100%), url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="text-center max-w-2xl px-4 z-10">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Peanut Butter. Pure & Simple.
            </h1>
            <p className="text-lg md:text-xl mb-8 text-green-50">
              100% natural, high-protein peanut butter crafted for your health
            </p>
            <Link href="/products">
              <Button 
                size="lg" 
                className="bg-[#037A3F] hover:bg-[#026a34] text-white rounded-full px-8 font-semibold"
                data-testid="button-shop-now"
              >
                Shop Now
              </Button>
            </Link>
          </div>
        </section>

        {/* Trust Badges - Alpino Inspired */}
        <section className="bg-gradient-to-r from-[#037A3F] to-[#026a34] text-white py-8">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6" />
                <div>
                  <p className="font-semibold text-sm">100% Natural</p>
                  <p className="text-xs text-green-100">No additives</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Leaf className="h-6 w-6" />
                <div>
                  <p className="font-semibold text-sm">Lab Tested</p>
                  <p className="text-xs text-green-100">Quality assured</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="h-6 w-6" />
                <div>
                  <p className="font-semibold text-sm">Free Shipping</p>
                  <p className="text-xs text-green-100">Above ₹1200</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Award className="h-6 w-6" />
                <div>
                  <p className="font-semibold text-sm">Best Quality</p>
                  <p className="text-xs text-green-100">Guaranteed</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-white">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#037A3F] mb-3">Featured Products</h2>
              <p className="text-gray-600 text-lg">Crafted with love, packed with nutrition</p>
            </div>
            {isLoading ? (
              <div className="text-center py-12">Loading products...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <FeaturedProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
            <div className="text-center mt-12">
              <Link href="/products">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-[#037A3F] text-[#037A3F] hover:bg-[#037A3F] hover:text-white rounded-full"
                  data-testid="button-view-all-products"
                >
                  View All Products
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Ornut */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#037A3F] mb-3">Why Choose Ornut?</h2>
              <p className="text-gray-600 text-lg">The Ornut Difference</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <Zap className="h-8 w-8 text-[#9EEA01] mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">High Protein</h3>
                  <p className="text-gray-600">
                    Each serving packs 8g of plant-based protein for muscle recovery and sustained energy.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <Leaf className="h-8 w-8 text-[#037A3F] mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">100% Natural</h3>
                  <p className="text-gray-600">
                    No added sugars, oils, or preservatives. Just roasted peanuts in their purest form.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <Award className="h-8 w-8 text-[#9EEA01] mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Lab Certified</h3>
                  <p className="text-gray-600">
                    Every batch is tested for purity and quality. Your health, our priority.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Money Back Guarantee */}
        <section className="py-16 bg-[#037A3F] text-white">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <Shield className="h-16 w-16 mx-auto mb-6 text-[#9EEA01]" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Promise to You</h2>
            <p className="text-xl text-green-100 mb-8">
              Not satisfied? We offer a 100% money-back guarantee within 30 days. That's how confident we are in our product.
            </p>
            <Button 
              variant="secondary"
              size="lg"
              className="bg-[#9EEA01] text-[#037A3F] hover:bg-yellow-400 rounded-full font-semibold"
              data-testid="button-guarantee"
            >
              Learn More About Our Guarantee
            </Button>
          </div>
        </section>

        {/* Customer Testimonials */}
        <section className="py-16 bg-white">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#037A3F] mb-3">Loved by Thousands</h2>
              <p className="text-gray-600 text-lg">Real reviews from real customers</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: "Priya Singh",
                  role: "Fitness Enthusiast",
                  text: "Best peanut butter I've found in India! Perfect protein content and the taste is incredible.",
                  rating: 5
                },
                {
                  name: "Amit Kumar",
                  role: "Health Coach",
                  text: "I recommend Ornut to all my clients. 100% natural with no sugar - exactly what we need.",
                  rating: 5
                },
                {
                  name: "Sarah Patel",
                  role: "Home Baker",
                  text: "The quality is exceptional. Uses it in all my baking now. Highly recommended!",
                  rating: 5
                }
              ].map((testimonial, idx) => (
                <Card key={idx} className="border-0 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-[#9EEA01] text-lg">★</span>
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Bulk & Subscription */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-2 border-[#037A3F] bg-white">
                <CardContent className="pt-8">
                  <h3 className="text-2xl font-bold text-[#037A3F] mb-4">Bulk Orders</h3>
                  <p className="text-gray-600 mb-6">
                    Need bulk quantities for your gym, cafe, or business? We offer special wholesale pricing for bulk orders.
                  </p>
                  <Button 
                    className="bg-[#037A3F] hover:bg-[#026a34] text-white rounded-full w-full"
                    data-testid="button-bulk-orders"
                  >
                    Enquire Now
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-2 border-[#9EEA01] bg-white">
                <CardContent className="pt-8">
                  <h3 className="text-2xl font-bold text-[#037A3F] mb-4">Subscribe & Save</h3>
                  <p className="text-gray-600 mb-6">
                    Get 10% off on all orders when you subscribe. Never run out of your favorite peanut butter.
                  </p>
                  <Button 
                    className="bg-[#9EEA01] hover:bg-yellow-400 text-[#037A3F] rounded-full w-full font-semibold"
                    data-testid="button-subscribe"
                  >
                    Subscribe Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-white">
          <div className="container mx-auto max-w-3xl px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#037A3F] mb-3">Frequently Asked Questions</h2>
              <p className="text-gray-600 text-lg">Everything you need to know</p>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-semibold text-[#037A3F]">
                  How much protein is in each serving?
                </AccordionTrigger>
                <AccordionContent>
                  Each 32g serving contains 8g of plant-based protein, making it perfect for post-workout recovery and sustained energy.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg font-semibold text-[#037A3F]">
                  Are there any added sugars or oils?
                </AccordionTrigger>
                <AccordionContent>
                  No! Ornut contains 100% roasted peanuts with no added sugars, oils, or preservatives. What you see is what you get.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-lg font-semibold text-[#037A3F]">
                  How should I store Ornut?
                </AccordionTrigger>
                <AccordionContent>
                  Store in a cool, dry place. Natural oils may separate - simply stir to mix. Once opened, consume within 2-3 weeks for best freshness.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-lg font-semibold text-[#037A3F]">
                  Is Ornut gluten-free?
                </AccordionTrigger>
                <AccordionContent>
                  Yes! Ornut is 100% gluten-free, vegan, and suitable for all dietary preferences.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-lg font-semibold text-[#037A3F]">
                  What's your delivery time?
                </AccordionTrigger>
                <AccordionContent>
                  We deliver within 3-5 business days pan-India. Orders above ₹1200 ship free. Track your order in real-time via the app.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-gradient-to-r from-[#037A3F] to-[#026a34] text-white text-center">
          <div className="container mx-auto max-w-2xl px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Experience the Ornut Difference?</h2>
            <p className="text-green-100 text-lg mb-8">
              Join thousands of health-conscious customers enjoying premium peanut butter.
            </p>
            <Link href="/products">
              <Button 
                size="lg" 
                className="bg-[#9EEA01] text-[#037A3F] hover:bg-yellow-400 rounded-full px-8 font-semibold"
                data-testid="button-start-shopping"
              >
                Start Shopping
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

function FeaturedProductCard({ product }: { product: Product }) {
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
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
          <div className="absolute top-3 right-3 bg-[#9EEA01] text-[#037A3F] px-3 py-1 rounded-full text-xs font-bold">
            20% OFF
          </div>
        </div>
        <CardContent className="pt-6 pb-4">
          <h3 className="font-semibold text-lg mb-2 text-gray-900">{product.name}</h3>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold text-[#037A3F]">₹{Math.round((Number(product.price) || 0) * 0.8)}</span>
            <span className="text-sm text-gray-500 line-through">₹{Number(product.price) || 0}</span>
          </div>

          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-[#9EEA01]">★</span>
            ))}
            <span className="text-xs text-gray-600 ml-1">(124)</span>
          </div>

          <Button 
            onClick={(e) => {
              e.preventDefault();
              addToCartMutation.mutate();
            }}
            disabled={addToCartMutation.isPending}
            className="w-full bg-[#037A3F] hover:bg-[#026a34] text-white rounded-full"
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
