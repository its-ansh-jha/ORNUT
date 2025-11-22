import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Heart, Leaf, Award, Truck, CheckCircle } from "lucide-react";
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

  const featuredProducts = products?.slice(0, 3) || [];

  // Structured data for Organization
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
        
        {/* Open Graph tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Ornut - Premium High Protein Peanut Butter Made in India" />
        <meta property="og:description" content="100% natural, high protein peanut butter. No preservatives, gluten-free. Made with premium roasted peanuts in India. Free shipping over ₹1200." />
        <meta property="og:url" content="https://peanutproducts.in/" />
        <meta property="og:site_name" content="Ornut" />
        <meta property="og:image" content="https://peanutproducts.in/og-image.jpg" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ornut - Premium High Protein Peanut Butter" />
        <meta name="twitter:description" content="100% natural, high protein peanut butter made in India. No preservatives, gluten-free." />
        <meta name="twitter:image" content="https://peanutproducts.in/og-image.jpg" />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
      </Helmet>

      <div className="flex flex-col">
        <section
        className="relative h-[500px] md:h-[600px] flex items-center justify-center text-white"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
        <div className="relative z-10 container mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Discover Ornut
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Premium artisanal peanut butter crafted with passion. Natural ingredients, extraordinary taste.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" variant="default" className="backdrop-blur-md" data-testid="button-shop-now">
                Shop Now
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="backdrop-blur-md bg-background/20" data-testid="button-learn-more">
                Learn More
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-6 justify-center text-sm">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              <span>Free shipping over ₹1200</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              <span>Award-winning quality</span>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              <span>100% Natural ingredients</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>No Preservatives</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 container mx-auto max-w-7xl px-4">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12">
          Featured Products
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-square bg-muted animate-pulse" />
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded mb-2 animate-pulse" />
                  <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        <div className="text-center mt-12">
          <Link href="/products">
            <Button variant="outline" size="lg" data-testid="button-view-all">
              View All Products
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12">
            Why Choose Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Leaf className="h-12 w-12 text-primary" />}
              title="Natural Ingredients"
              description="Only the finest roasted peanuts and natural ingredients. No artificial additives."
            />
            <FeatureCard
              icon={<Award className="h-12 w-12 text-primary" />}
              title="Artisanal Process"
              description="Small-batch production ensures consistent quality and rich, authentic flavor."
            />
            <FeatureCard
              icon={<Leaf className="h-12 w-12 text-primary" />}
              title="No Preservatives"
              description="100% free from preservatives, additives, and artificial ingredients. Pure and simple."
            />
            <FeatureCard
              icon={<CheckCircle className="h-12 w-12 text-primary" />}
              title="Quality Guaranteed"
              description="Every jar is tested for perfection. Love it or your money back."
            />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 container mx-auto max-w-7xl px-4">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="max-w-3xl mx-auto">
          <AccordionItem value="item-1">
            <AccordionTrigger data-testid="faq-shipping">What are your shipping options?</AccordionTrigger>
            <AccordionContent>
              We offer free standard shipping on orders over INR1200. Standard shipping takes 3-5 business days.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger data-testid="faq-storage">How should I store the peanut butter?</AccordionTrigger>
            <AccordionContent>
              Store in a cool, dry place. After opening, refrigeration is optional but will extend shelf
              life. Natural separation is normal - just stir before use. Consume within 3 months of opening
              for best quality.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger data-testid="faq-returns">What is your return policy?</AccordionTrigger>
            <AccordionContent>
              We offer a 5-day satisfaction guarantee. If you're not completely happy with your purchase,
              contact us for a full refund or exchange. Your happiness is our priority.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
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
    mutationFn: () =>
      apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity: 1,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
        action: (
          <Button 
            size="sm" 
            variant="default"
            onClick={() => navigate("/cart")}
          >
            Go to Cart
          </Button>
        )
      });
    },
    onError: () => {
      toast({
        title: "Failed to add to cart",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to add items to cart",
        variant: "destructive",
      });
      return;
    }

    addToCartMutation.mutate();
  };

  return (
    <Card className="overflow-hidden hover-elevate cursor-pointer group" data-testid={`card-product-${product.id}`}>
      <Link href={`/product/${product.slug || product.id}`}>
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-4 right-4 rounded-full"
            onClick={(e) => {
              e.preventDefault();
            }}
            data-testid={`button-wishlist-${product.id}`}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </Link>
      <CardContent className="p-6">
        <Link href={`/product/${product.slug || product.id}`}>
          <h3 className="font-semibold text-xl mb-2" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>
          <p className="text-2xl font-bold text-primary" data-testid={`text-product-price-${product.id}`}>
            ₹{Number(product.price).toFixed(2)}
          </p>
        </Link>
        <Button 
          className="w-full mt-4" 
          onClick={handleAddToCart}
          disabled={addToCartMutation.isPending}
          data-testid={`button-add-to-cart-${product.id}`}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
        </Button>
      </CardContent>
    </Card>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="text-center p-6">
      <CardContent className="pt-6">
        <div className="flex justify-center mb-4">{icon}</div>
        <h3 className="font-semibold text-xl mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
