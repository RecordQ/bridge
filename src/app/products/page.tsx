// src/app/products/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Search, Package } from "lucide-react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { Skeleton } from '@/components/ui/skeleton';
import { Product, Category } from '@/lib/types';
import Link from 'next/link';
import { PageLayout } from '@/components/layout/PageLayout';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/shared/Icon';

function ProductSkeleton() {
    return (
        <Card className="flex flex-col h-full bg-card/80">
            <CardHeader>
                <Skeleton className="aspect-video w-full mb-4 rounded-lg bg-muted" />
                <Skeleton className="h-8 w-3/4 mb-2 bg-muted" />
                <Skeleton className="h-4 w-full bg-muted" />
                <Skeleton className="h-10 w-1/2 mt-2 bg-muted" />
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
                <Skeleton className="h-4 w-full bg-muted" />
                <Skeleton className="h-4 w-5/6 bg-muted" />
                <Skeleton className="h-4 w-full bg-muted" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-full bg-muted" />
            </CardFooter>
        </Card>
    )
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const router = useRouter();

  useEffect(() => {
    async function getProductTiers() {
      setLoading(true);
      try {
          const productsCol = collection(db, 'products');
          const q = query(productsCol, where("status", "==", "Active"), orderBy('createdAt', 'desc'));
          const productSnapshot = await getDocs(q);
          const productData = productSnapshot.docs.map(doc => {
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
                  category: data.category || 'Other',
              }
          });
          setProducts(productData);

          const catCol = collection(db, 'categories');
          const catSnapshot = await getDocs(query(catCol, orderBy('name')));
          const catList = catSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
          setCategories(catList);

      } catch (error) {
          console.error("Error fetching product tiers:", error);
          setProducts([]);
          setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    getProductTiers();
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter(product =>
        selectedCategory === 'All' || product.category === selectedCategory
      )
      .filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [products, searchTerm, selectedCategory]);
  
  const handleQuoteClick = (productId: string) => {
    localStorage.setItem('selectedProductIdForQuote', productId);
    router.push('/contact');
  };
  
  return (
    <PageLayout>
        <main className="flex-1 bg-transparent backdrop-blur-sm">
          <section 
            className="relative py-24 md:py-40"
          >
            <div className="container mx-auto text-center relative z-10 px-4">
              <h1 className="font-headline text-4xl md:text-6xl font-bold text-foreground">Our Products</h1>
              <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Find the perfect customizable products for your budget. No hidden fees, just stellar value.
              </p>
            </div>
          </section>

          <section className="py-16 md:py-24 bg-transparent">
            <div className="container mx-auto px-4">
                <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search for products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10"
                        />
                    </div>
                </div>
                 <div className="mb-12 flex justify-center flex-wrap gap-2">
                    <Button 
                        key="All" 
                        variant={selectedCategory === 'All' ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory('All')}
                        className="gap-2"
                    >
                        All Products
                    </Button>
                    {categories.map(category => (
                        <Button 
                            key={category.id} 
                            variant={selectedCategory === category.name ? 'default' : 'outline'}
                            onClick={() => setSelectedCategory(category.name)}
                            className="gap-2"
                        >
                            <Icon name={category.icon} className="h-4 w-4" />
                            {category.name}
                        </Button>
                    ))}
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
                    <Card key={tier.id} className="flex flex-col h-full hover:border-accent transition-colors duration-300 bg-card/80">
                      <CardHeader>
                        <div className="aspect-video mb-4 overflow-hidden rounded-lg">
                          <Image
                            src={tier.image}
                            alt={tier.name}
                            width={600}
                            height={400}
                            className="w-full h-full object-cover"
                            data-ai-hint={tier.name}
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
                          Get a Quote
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                 <Card className="text-center py-12 bg-card/80">
                    <CardHeader>
                        <div className="mx-auto bg-muted rounded-full w-24 h-24 flex items-center justify-center mb-4">
                            <Package className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <CardTitle className="font-headline text-3xl font-bold">No Products Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mt-2 whitespace-pre-line">
                            Your search for "{searchTerm}" did not match any products in the "{selectedCategory}" category.
                        </p>
                        {searchTerm && (
                            <Button variant="outline" className="mt-6" onClick={() => {setSearchTerm(""); setSelectedCategory("All")}}>
                                Clear Search & Filters
                            </Button>
                        )}
                    </CardContent>
                </Card>
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
        </main>
    </PageLayout>
  );
}
