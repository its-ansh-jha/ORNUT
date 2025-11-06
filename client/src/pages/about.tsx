import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Award, Heart, Truck } from "lucide-react";

export default function About() {
  return (
    <div className="flex flex-col">
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-about-title">
            Our Story
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Crafting the finest artisanal peanut butter since 2020. Every jar is made with love,
            fresh roasted peanuts, and a commitment to quality that you can taste.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 container mx-auto max-w-7xl px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-semibold mb-6">What Makes Us Different</h2>
            <p className="text-muted-foreground mb-4">
              We started with a simple mission: create the best-tasting, most natural peanut butter
              possible. No shortcuts, no artificial ingredients, just pure peanut perfection.
            </p>
            <p className="text-muted-foreground mb-4">
              Each batch is carefully roasted and ground in small quantities to ensure consistent
              quality and rich, authentic flavor. We source our peanuts from sustainable farms and
              use eco-friendly packaging because we believe great food shouldn't cost the earth.
            </p>
            <p className="text-muted-foreground">
              From our classic creamy and crunchy varieties to unique specialty flavors, every jar
              represents our dedication to craftsmanship and your satisfaction.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <ValueCard
              icon={<Leaf className="h-8 w-8 text-primary" />}
              title="100% Natural"
              description="Only real ingredients, nothing artificial"
            />
            <ValueCard
              icon={<Award className="h-8 w-8 text-primary" />}
              title="Award Winning"
              description="Recognized for quality & taste"
            />
            <ValueCard
              icon={<Heart className="h-8 w-8 text-primary" />}
              title="Made with Love"
              description="Small batches, big attention to detail"
            />
            <ValueCard
              icon={<Truck className="h-8 w-8 text-primary" />}
              title="Fast Delivery"
              description="Fresh from our kitchen to your door"
            />
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-semibold text-center mb-12">Our Process</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <ProcessStep
              number="01"
              title="Source"
              description="We partner with sustainable farms to source the finest organic peanuts"
            />
            <ProcessStep
              number="02"
              title="Roast"
              description="Small-batch roasting brings out the rich, nutty flavor and aroma"
            />
            <ProcessStep
              number="03"
              title="Grind"
              description="Carefully ground to achieve the perfect creamy or crunchy texture"
            />
            <ProcessStep
              number="04"
              title="Package"
              description="Hand-packed in eco-friendly glass jars and shipped fresh to you"
            />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 container mx-auto max-w-7xl px-4 text-center">
        <h2 className="text-3xl font-semibold mb-6">Join Our Community</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Thousands of peanut butter lovers trust us for their daily spread. Join our community and
          experience the difference that quality and care make.
        </p>
        <div className="flex flex-wrap gap-12 justify-center text-left">
          <StatCard number="50,000+" label="Happy Customers" />
          <StatCard number="100,000+" label="Jars Sold" />
          <StatCard number="4.9/5" label="Average Rating" />
          <StatCard number="95%" label="Would Recommend" />
        </div>
      </section>
    </div>
  );
}

function ValueCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <div className="flex justify-center mb-3">{icon}</div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function ProcessStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold text-primary mb-4">{number}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold text-primary mb-2">{number}</div>
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
}
