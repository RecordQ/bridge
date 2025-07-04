import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

type PricingTier = {
    id: string;
    name: string;
    image: string;
    aiHint: string;
    description: string;
    price: string;
    priceUnit: string;
    features: string[];
};


async function getPricingTiers(): Promise<PricingTier[]> {
    try {
        const productsCol = collection(db, 'products');
        const snapshot = await getDocs(productsCol);
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name || 'Unnamed Product',
                image: data.image || 'https://placehold.co/600x400.png',
                aiHint: data.aiHint || 'product',
                description: data.description || 'No description available.',
                price: data.price ? `$${data.price}` : 'N/A',
                priceUnit: data.priceUnit || '/ unit',
                features: data.features || [],
            }
        });
    } catch (error) {
        console.error("Error fetching pricing tiers:", error);
        return [];
    }
}


export default async function PricingPage() {
  const pricingTiers = await getPricingTiers();

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
          {pricingTiers.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              {pricingTiers.map((tier) => (
                <Card key={tier.id} className="flex flex-col h-full hover:border-primary transition-colors duration-300">
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
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
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
          ) : (
            <div className="text-center py-12">
                <h2 className="font-headline text-3xl font-bold">No Pricing Information Available</h2>
                <p className="text-muted-foreground mt-4">Please check back later or contact us for a custom quote.</p>
            </div>
          )}
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
