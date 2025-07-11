"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Search, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Skeleton } from '@/components/ui/skeleton';

type ProductTier = {
    id: string;
    name: string;
    image: string;
    aiHint: string;
    description: string;
    price: string;
    priceUnit: string;
    features: string[];
};

async function getProductTiers(): Promise<ProductTier[]> {
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

function ProductSkeleton() {
    return (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <Skeleton className="aspect-video w-full mb-4 rounded-lg" />
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-1/2 mt-2" />
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-full" />
            </CardFooter>
        </Card>
    )
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductTier[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const data = await getProductTiers();
      setProducts(data);
      setFilteredProducts(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const results = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);

  return (
    <div className="bg-transparent">
      <section 
        className="relative py-24 md:py-40"
      >
        <div className="container mx-auto text-center relative z-10">
          <h1 className="font-headline text-4xl md:text-6xl font-bold text-white">Our Products</h1>
          <p className="mt-4 text-lg md:text-xl text-white/80 max-w-3xl mx-auto">
            Find the perfect customizable products for your budget. No hidden fees, just stellar value.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto">
            <div className="mb-12 max-w-lg mx-auto">
                 <div className="relative">
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
            
          {loading ? (
             <div className="grid lg:grid-cols-3 gap-8 items-start">
                 <ProductSkeleton />
                 <ProductSkeleton />
                 <ProductSkeleton />
             </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              {filteredProducts.map((tier) => (
                <Card key={tier.id} className="flex flex-col h-full hover:border-primary transition-colors duration-300 bg-card/80 backdrop-blur-sm">
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
             <Card className="text-center py-12 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <div className="mx-auto bg-muted rounded-full w-24 h-24 flex items-center justify-center mb-4">
                        <Package className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <CardTitle className="font-headline text-3xl font-bold">No Products Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mt-2">
                        Your search for "{searchTerm}" did not match any products.
                        <br/>
                        Try a different keyword or browse all products.
                    </p>
                    {searchTerm && (
                        <Button variant="outline" className="mt-6" onClick={() => setSearchTerm("")}>
                            Clear Search
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
    </div>
  );
}
