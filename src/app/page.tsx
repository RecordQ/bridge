// src/app/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Usb, Box, PenTool, CheckCircle, Star, Users, Zap } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore/lite";
import type { Product } from "@/lib/types";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";


function getIconForProduct(name: string) {
  const lowerCaseName = name.toLowerCase();
  if (lowerCaseName.includes('usb')) return Usb;
  if (lowerCaseName.includes('box')) return Box;
  if (lowerCaseName.includes('pen')) return PenTool;
  return Zap;
}

export default function Home() {
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function getTopProducts() {
      try {
        const productsCol = collection(db, 'products');
        const q = query(productsCol, where('status', '==', 'Active'), orderBy('createdAt', 'desc'), limit(3));
        const productSnapshot = await getDocs(q);
        
        if (productSnapshot.empty) {
          setTopProducts([]);
          return;
        }
        
        const products = productSnapshot.docs.map(doc => {
          const data = doc.data();
          const features = Array.isArray(data.features) ? data.features : [];
          return {
            id: doc.id,
            name: data.name || '',
            price: data.price || 0,
            status: data.status || 'Archived',
            priceUnit: data.priceUnit || '',
            image: data.image || '',
            description: data.description || '',
            features: features,
            createdAt: data.createdAt,
          }
        }) as Product[];
        setTopProducts(products);
      } catch (error) {
        console.error("Error fetching top products:", error);
        setTopProducts([]);
      } finally {
        setLoading(false);
      }
    }
    getTopProducts();
  }, []);

  const handleQuoteClick = (productId: string) => {
    localStorage.setItem('selectedProductIdForQuote', productId);
    router.push('/contact');
  };

  const features = [
    {
      icon: CheckCircle,
      title: "Premium Quality",
      description: "Only the best materials for products that last and impress."
    },
    {
      icon: Star,
      title: "Endless Customization",
      description: "Your vision, your logo, your brand. We make it happen."
    },
    {
      icon: Users,
      title: "Corporate & Personal",
      description: "Perfect for large-scale branding or unique personal gifts."
    }
  ];

  return (
    <PageLayout>
      <main className="flex-1 overflow-hidden">
        <section 
          className="relative py-32 md:py-48 flex items-center justify-center min-h-[80vh]"
        >
          <div className="container mx-auto text-center relative z-10 px-4">
             <div className="inline-block bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1 font-medium text-sm mb-4">
                We turn ideas into tangible brand assets
             </div>
            <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground">
               Elevate Your Brand
            </h1>
            <p className="max-w-2xl mx-auto mt-4 text-lg md:text-xl text-foreground/70 mb-8">
              Bridge Ltd offers premium, customizable products to help your brand shine. From tech gadgets to elegant gift solutions, we bring your vision to life.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-7 px-8">
                <Link href="/products">Explore Products</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg py-7 px-8 border-2">
                <Link href="/contact">Request a Quote <ArrowRight className="ml-2" /></Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background/50 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-3 gap-8 text-center">
                    {features.map((feature, index) => (
                        <div key={index}>
                           <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mx-auto mb-4 border-2 border-primary/20">
                               <feature.icon className="w-8 h-8 text-primary" />
                           </div>
                           <h3 className="text-xl font-bold font-headline mb-2">{feature.title}</h3>
                           <p className="text-foreground/70">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <section id="products" className="py-16 md:py-24 bg-secondary/50 border-y backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4">
                  Our Signature Products
              </h2>
               <p className="text-lg text-foreground/70">
                  Discover our curated selection of top-tier products, ready for your branding.
              </p>
            </div>
            
            {loading ? (
                <div className="grid md:grid-cols-3 gap-8 mt-12">
                  <Skeleton className="h-96 w-full rounded-2xl" />
                  <Skeleton className="h-96 w-full rounded-2xl" />
                  <Skeleton className="h-96 w-full rounded-2xl" />
                </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8 mt-12">
                {topProducts.map((product) => {
                  const Icon = getIconForProduct(product.name);
                  return (
                    <Card key={product.id} className="group overflow-hidden rounded-2xl bg-card/80 border-2 border-border hover:border-primary hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300">
                      <CardContent className="p-0">
                        <div className="aspect-video overflow-hidden">
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={600}
                            height={400}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            data-ai-hint={product.name}
                          />
                        </div>
                        <div className="p-6">
                            <h3 className="font-headline text-xl font-bold mb-2">{product.name}</h3>
                            <p className="text-foreground/70 text-sm mb-4 h-10">{product.description}</p>
                            <Button onClick={() => handleQuoteClick(product.id)} className="w-full">
                                Get a Quote
                            </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
            {topProducts.length > 0 && (
              <div className="text-center mt-12">
                  <Button asChild size="lg" variant="ghost">
                    <Link href="/products">
                        View All Products <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
              </div>
            )}
          </div>
        </section>
        
        <section className="py-16 md:py-32 bg-background/50 backdrop-blur-sm">
          <div className="container mx-auto text-center px-4">
              <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4">
                Ready to Create Something Amazing?
              </h2>
              <p className="max-w-2xl mx-auto text-muted-foreground text-lg mb-8">
                  Let's collaborate on your next project. Our team is ready to help you design the perfect custom products for your brand.
              </p>
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-7 px-8">
                    <Link href="/contact">
                        Contact Us Today <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
          </div>
        </section>
      </main>
    </PageLayout>
  );
}
