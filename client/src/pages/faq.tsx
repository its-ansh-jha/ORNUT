import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const faqs = [
    {
      category: "Products",
      questions: [
        {
          q: "What ingredients are in your peanut butter?",
          a: "Our classic peanut butter contains only fresh roasted peanuts and a pinch of sea salt. Our specialty flavors include natural ingredients like honey, cocoa powder, or cinnamon. We never use artificial preservatives, colors, or flavors.",
        },
        {
          q: "Is your peanut butter organic?",
          a: "Yes! All our peanut butter varieties are made with certified organic peanuts sourced from sustainable farms. We're committed to using only the highest quality, natural ingredients.",
        },
        {
          q: "How long does peanut butter last?",
          a: "Unopened jars can be stored for up to 12 months in a cool, dry place. Once opened, we recommend consuming within 3 months for best quality. Refrigeration is optional but can extend shelf life.",
        },
        {
          q: "Why does oil separate in natural peanut butter?",
          a: "Natural separation is completely normal! Since we don't use stabilizers or hydrogenated oils, the natural peanut oil rises to the top. Simply stir before use to restore the creamy texture.",
        },
      ],
    },
    {
      category: "Shipping & Delivery",
      questions: [
        {
          q: "What are your shipping options?",
          a: "We offer free standard shipping on orders over $50, which takes 3-5 business days. Express shipping is available for $9.99 and takes 1-2 business days. All orders are shipped Monday through Friday.",
        },
        {
          q: "How can I track my order?",
          a: "Once your order ships, you'll receive a tracking number via email. You can also track your order status by logging into your account and viewing your order history.",
        },
        {
          q: "Do you ship internationally?",
          a: "Currently, we only ship within the United States. We're working on expanding to international shipping soon!",
        },
        {
          q: "What if my order arrives damaged?",
          a: "We pack all orders carefully, but if your jar arrives damaged, please contact us within 48 hours with photos. We'll send a replacement right away at no charge.",
        },
      ],
    },
    {
      category: "Payment & Returns",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit cards (Visa, MasterCard, American Express, Discover) through our secure Cashfree payment gateway. Your payment information is encrypted and secure.",
        },
        {
          q: "Is my payment information secure?",
          a: "Absolutely! We use industry-standard encryption and secure payment processing through Cashfree. We never store your complete credit card information on our servers.",
        },
        {
          q: "What is your return policy?",
          a: "We offer a 30-day satisfaction guarantee. If you're not completely happy with your purchase, contact us for a full refund or exchange. We want you to love our peanut butter!",
        },
        {
          q: "How long does it take to receive a refund?",
          a: "Refunds are processed within 2-3 business days after we receive your return. Depending on your bank, it may take an additional 5-7 business days for the refund to appear in your account.",
        },
      ],
    },
    {
      category: "Account & Orders",
      questions: [
        {
          q: "Do I need an account to place an order?",
          a: "Yes, you'll need to sign in with Google to place an order. This allows you to track your orders, save your wishlist, and manage your account information easily.",
        },
        {
          q: "How can I change my order after it's placed?",
          a: "If you need to modify your order, please contact us immediately. We'll do our best to accommodate changes, but once an order is shipped, we cannot make modifications.",
        },
        {
          q: "Can I cancel my order?",
          a: "Yes, you can cancel your order within 24 hours of placing it. After that, the order may have already been processed for shipping. Contact us as soon as possible if you need to cancel.",
        },
        {
          q: "How do I update my account information?",
          a: "Log into your account and navigate to the Account Settings page where you can update your personal information, shipping addresses, and preferences.",
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4" data-testid="text-faq-title">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-muted-foreground">
          Find answers to common questions about our products and services
        </p>
      </div>

      <div className="space-y-8">
        {faqs.map((category, categoryIdx) => (
          <div key={categoryIdx}>
            <h2 className="text-2xl font-semibold mb-4">{category.category}</h2>
            <Accordion type="single" collapsible className="w-full">
              {category.questions.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${categoryIdx}-${idx}`}>
                  <AccordionTrigger data-testid={`faq-question-${categoryIdx}-${idx}`}>
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent>{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center p-8 bg-muted/30 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
        <p className="text-muted-foreground">
          Contact us at support@peanutbutter.com or call 1-800-PEANUTS
        </p>
      </div>
    </div>
  );
}
