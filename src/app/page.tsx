import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Usb, Box, PenTool } from "lucide-react";

const products = [
  {
    name: "Custom USB Drives",
    description: "High-speed, reliable USB drives available in various styles and capacities. Perfect for branding.",
    icon: Usb,
    image: "https://placehold.co/600x400.png",
    aiHint: "custom usb"
  },
  {
    name: "Branded Gift Boxes",
    description: "Elegant gift boxes to present your items with a touch of class. Fully customizable designs.",
    icon: Box,
    image: "https://placehold.co/600x400.png",
    aiHint: "gift box"
  },
  {
    name: "Promotional Pens",
    description: "Sleek and professional pens that make a statement. A classic promotional item.",
    icon: PenTool,
    image: "https://placehold.co/600x400.png",
    aiHint: "promotional pen"
  },
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section 
        className="relative py-24 md:py-40 bg-cover bg-center"
        style={{backgroundImage: 'url(https://placehold.co/1920x1080.png)'}}
        data-ai-hint="vibrant nebula"
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto text-center relative z-10 p-4">
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">
            Customize Your Universe
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-foreground/80 mb-8">
            Bridge Ltd offers premium, customizable products to help your brand shine. From tech gadgets to elegant gift solutions, we bring your vision to life.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/#products">Explore Products</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">Request a Quote</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4">Quality That Speaks Volumes</h2>
            <p className="max-w-3xl mx-auto text-muted-foreground md:text-lg">
                We believe in the power of a lasting impression. That's why we source only the highest-quality materials for our products, ensuring your brand is represented with the excellence it deserves.
            </p>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 md:py-24 bg-card/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Our Core Offerings</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground mt-2">Discover our range of customizable products designed to elevate your brand.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {products.map((product) => (
              <Card key={product.name} className="overflow-hidden group hover:shadow-2xl hover:border-primary transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <product.icon className="w-8 h-8 text-accent" />
                    <CardTitle className="font-headline text-xl">{product.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video overflow-hidden rounded-md mb-4">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={600}
                      height={400}
                      data-ai-hint={product.aiHint}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardDescription>{product.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4">Ready to Create Something Amazing?</h2>
            <p className="max-w-3xl mx-auto text-muted-foreground md:text-lg mb-8">
                Let's collaborate on your next project. Our team is ready to help you design the perfect custom products.
            </p>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/contact">
                    Contact Us <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </Button>
        </div>
      </section>
    </>
  );
}
