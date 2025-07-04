import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const pricingTiers = [
  {
    name: "Custom USB Drives",
    image: "https://placehold.co/600x400.png",
    aiHint: "custom usb",
    description: "Perfect for corporate giveaways and data storage.",
    price: "$5.99",
    priceUnit: "/ unit",
    features: [
      "8GB - 128GB Capacity",
      "Logo Printing/Engraving",
      "Variety of Materials",
      "Data Preloading Service",
    ],
  },
  {
    name: "Branded Gift Boxes",
    image: "https://placehold.co/600x400.png",
    aiHint: "gift box",
    description: "Elegant packaging for any occasion.",
    price: "$12.49",
    priceUnit: "/ unit",
    features: [
      "Premium Cardboard/Wood",
      "Custom Inserts",
      "Full-Color Printing",
      "Magnetic Closure",
    ],
  },
  {
    name: "Promotional Pens",
    image: "https://placehold.co/600x400.png",
    aiHint: "promotional pen",
    description: "A classic and effective marketing tool.",
    price: "$2.99",
    priceUnit: "/ unit",
    features: [
      "Metal or Plastic Body",
      "Smooth Black/Blue Ink",
      "Laser Engraving/Printing",
      "Comfort Grip",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="bg-background">
      <section 
        className="relative py-24 md:py-40 bg-cover bg-center"
        style={{backgroundImage: 'url(https://placehold.co/1920x1080.png)'}}
        data-ai-hint="abstract galaxy"
      >
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="container mx-auto text-center relative z-10">
          <h1 className="font-headline text-4xl md:text-6xl font-bold text-white">Transparent Pricing</h1>
          <p className="mt-4 text-lg md:text-xl text-white/80 max-w-3xl mx-auto">
            Find the perfect customizable products for your budget. No hidden fees, just stellar value.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {pricingTiers.map((tier) => (
              <Card key={tier.name} className="flex flex-col h-full hover:border-primary transition-colors duration-300">
                <CardHeader>
                  <div className="aspect-video mb-4 overflow-hidden rounded-lg">
                    <Image
                      src={tier.image}
                      alt={tier.name}
                      width={600}
                      height={400}
                      data-ai-hint={tier.aiHint}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="font-headline text-2xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div>
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.priceUnit}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-accent" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/contact">Get a Quote</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="text-center mt-16">
            <h3 className="font-headline text-2xl font-bold">Need a Custom Order?</h3>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              For bulk orders, unique requirements, or product combinations, contact us for a personalized quote. Our team is ready to build the perfect package for you.
            </p>
            <Button asChild variant="outline" size="lg" className="mt-6">
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
