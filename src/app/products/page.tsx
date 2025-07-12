// src/app/products/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Search, Package, LoaderCircle } from "lucide-react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { Skeleton } from '@/components/ui/skeleton';
import { Product } from '@/lib/types';
import Link from 'next/link';
import { useSiteData } from '@/hooks/useSiteData';
import StyleInjector from '@/components/layout/StyleInjector';
import ThreeScene from '@/components/ThreeScene';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Chatbot } from '@/components/Chatbot';

function ProductSkeleton() {
    return (
        <Card className="flex flex-col h-full bg-card/50 backdrop-blur-sm border border-border/20">
            <CardHeader>
                <Skeleton className="aspect-video w-full mb-4 rounded-lg bg-muted/50" />
                <Skeleton className="h-8 w-3/4 mb-2 bg-muted/50" />
                <Skeleton className="h-4 w-full bg-muted/50" />
                <Skeleton className="h-10 w-1/2 mt-2 bg-muted/50" />
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
                <Skeleton className="h-4 w-full bg-muted/50" />
                <Skeleton className="h-4 w-5/6 bg-muted/50" />
                <Skeleton className="h-4 w-full bg-muted/50" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-full bg-muted/50" />
            </CardFooter>
        </Card>
    )
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { t, siteData, isLoading } = useSiteData();

  useEffect(() => {
    async function getProductTiers() {
      setLoading(true);
      try {
          const productsCol = collection(db, 'products');
          const q = query(productsCol, where("status", "==", "Active"), orderBy('createdAt', 'desc'));
          const snapshot = await getDocs(q);
          
          if (snapshot.empty) {
              setProducts([]);
              setFilteredProducts([]);
              return;
          }
          const productData = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                  id: doc.id,
                  name: data.name || 'Unnamed Product',
                  image: data.image || 'https://placehold.co/600x400.png',
                  description: data.description || 'No description available.',
                  price: data.price || 0,
                  priceUnit: data.priceUnit || '/ unit',
                  features: data.features || [],
                  status: data.status,
              }
          });
          setProducts(productData);
          setFilteredProducts(productData);
      } catch (error) {
          console.error("Error fetching product tiers:", error);
          setProducts([]);
          setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    }
    getProductTiers();
  }, []);

  useEffect(() => {
    const results = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);
  
  const handleQuoteClick = (productId: string) => {
    localStorage.setItem('selectedProductIdForQuote', productId);
    router.push('/contact');
  };
  
  if (isLoading || !siteData) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <ThreeScene />
      <StyleInjector colors={siteData.theme.colors} />
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <Header />
        <main className="flex-1 bg-transparent">
          <section 
            className="relative py-24 md:py-40"
          >
            <div className="container mx-auto text-center relative z-10 px-4">
              <h1 className="font-headline text-4xl md:text-6xl font-bold text-white">{t('products_hero_title')}</h1>
              <p className="mt-4 text-lg md:text-xl text-white/80 max-w-3xl mx-auto">
                {t('products_hero_subtitle')}
              </p>
            </div>
          </section>

          <section className="py-16 md:py-24 bg-transparent">
            <div className="container mx-auto px-4">
                <div className="mb-12 max-w-lg mx-auto">
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder={t('products_search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10"
                        />
                     </div>
                </div>
                
              {loading ? (
                 <div className="grid lg:grid-cols-3 gap-8 items-start">
                     <ProductSkeleton />
                     <ProductSkeleton />
                     <ProductSkeleton />
                 </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                  {filteredProducts.map((tier) => (
                    <Card key={tier.id} className="flex flex-col h-full hover:border-primary transition-colors duration-300 bg-card/50 backdrop-blur-sm border border-border/20">
                      <CardHeader>
                        <div className="aspect-video mb-4 overflow-hidden rounded-lg">
                          <Image
                            src={tier.image}
                            alt={tier.name}
                            width={600}
                            height={400}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardTitle className="font-headline text-2xl">{tier.name}</CardTitle>
                        <CardDescription>{tier.description}</CardDescription>
                        <div>
                          <span className="text-4xl font-bold">${tier.price.toFixed(2)}</span>
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
                        <Button onClick={() => handleQuoteClick(tier.id)} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                          {t('button_get_quote')}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                 <Card className="text-center py-12 bg-card/50 backdrop-blur-sm border border-border/20">
                    <CardHeader>
                        <div className="mx-auto bg-muted rounded-full w-24 h-24 flex items-center justify-center mb-4">
                            <Package className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <CardTitle className="font-headline text-3xl font-bold">{t('products_not_found_title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mt-2 whitespace-pre-line">
                            {t('products_not_found_subtitle', `Your search for "${searchTerm}" did not match any products.\nTry a different keyword or browse all products.`).replace('{searchTerm}', searchTerm)}
                        </p>
                        {searchTerm && (
                            <Button variant="outline" className="mt-6" onClick={() => setSearchTerm("")}>
                                {t('products_button_clear_search')}
                            </Button>
                        )}
                    </CardContent>
                </Card>
              )}
              <div className="text-center mt-16">
                <h3 className="font-headline text-2xl font-bold">{t('products_custom_order_title')}</h3>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                  {t('products_custom_order_subtitle')}
                </p>
                <Button asChild variant="outline" size="lg" className="mt-6">
                  <Link href="/contact">{t('products_button_contact_sales')}</Link>
                </Button>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
      <Chatbot />
    </>
  );
}
