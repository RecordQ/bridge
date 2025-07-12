// src/app/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Usb, Box, PenTool, Package } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import type { Product } from "@/lib/types";
import { useEffect, useState } from "react";
import { useSiteData } from "@/hooks/useSiteData";

function getIconForProduct(name: string) {
  const lowerCaseName = name.toLowerCase();
  if (lowerCaseName.includes('usb')) return Usb;
  if (lowerCaseName.includes('box')) return Box;
  if (lowerCaseName.includes('pen')) return PenTool;
  return Package;
}

export default function Home() {
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const router = useRouter();
  const { t } = useSiteData();

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
      }
    }
    getTopProducts();
  }, []);

  const handleQuoteClick = (productId: string) => {
    localStorage.setItem('selectedProductIdForQuote', productId);
    router.push('/contact');
  };

  return (
    <>
      {/* Hero Section */}
      <section 
        className="relative py-32 md:py-48 flex items-center justify-center min-h-screen"
      >
        <div className="container mx-auto text-center relative z-10 px-4">
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">
            {t('home_hero_title')}
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-foreground/80 mb-8">
            {t('home_hero_subtitle')}
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/products">{t('button_explore_products')}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">{t('button_request_quote')}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 md:py-24 bg-transparent">
        <div className="container mx-auto text-center px-4">
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4">{t('home_intro_title')}</h2>
            <p className="max-w-3xl mx-auto text-muted-foreground md:text-lg">
                {t('home_intro_subtitle')}
            </p>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 md:py-24 bg-transparent">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">{t('home_products_title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {topProducts.map((product) => {
              const Icon = getIconForProduct(product.name);
              return (
                <div key={product.id} className="block group cursor-pointer" onClick={() => handleQuoteClick(product.id)}>
                  <Card className="overflow-hidden h-full hover:shadow-2xl hover:border-primary transition-all duration-300 bg-card/50 backdrop-blur-sm border border-border/20">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <Icon className="w-8 h-8 text-accent" />
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
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardDescription>{product.description}</CardDescription>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
          {topProducts.length > 0 && (
            <div className="text-center mt-12">
               <Button asChild size="lg" variant="outline">
                <Link href="/products">
                    {t('button_show_more')} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-transparent">
        <div className="container mx-auto text-center px-4">
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4">{t('home_cta_title')}</h2>
            <p className="max-w-3xl mx-auto text-muted-foreground md:text-lg mb-8">
                {t('home_cta_subtitle')}
            </p>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/contact">
                    {t('button_contact_us')} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </Button>
        </div>
      </section>
    </>
  );
}
