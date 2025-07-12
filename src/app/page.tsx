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
import { Skeleton } from "@/components/ui/skeleton";
import { PageLayout } from "@/components/layout/PageLayout";
import { EditableText, EditableWrapper } from "@/components/admin/settings/Editable";


function getIconForProduct(name: string) {
  const lowerCaseName = name.toLowerCase();
  if (lowerCaseName.includes('usb')) return Usb;
  if (lowerCaseName.includes('box')) return Box;
  if (lowerCaseName.includes('pen')) return PenTool;
  return Package;
}

export default function Home() {
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <PageLayout>
      <main className="flex-1">
          {/* Hero Section */}
        <section 
          className="relative py-32 md:py-48 flex items-center justify-center min-h-screen"
        >
          <div className="container mx-auto text-center relative z-10 px-4">
            <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground">
               <EditableText fieldType="text" translationKey="home_hero_title" styleKeys={{color: "home_hero_title_color", fontSize: "home_hero_title_font_size"}} />
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-foreground/80 mb-8">
              <EditableText fieldType="textarea" translationKey="home_hero_subtitle" styleKeys={{color: "home_hero_subtitle_color", fontSize: "home_hero_subtitle_font_size"}} />
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <EditableWrapper 
                fieldType="button" 
                translationKey="button_explore_products" 
                styleKeys={{
                  backgroundColor: "button_explore_products_bg_color", 
                  color: "button_explore_products_text_color", 
                  fontSize: "button_explore_products_font_size",
                  borderRadius: "button_explore_products_shape",
                  borderColor: "button_explore_products_outline_color",
                }}
              >
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/products"><EditableText fieldType="text" translationKey="button_explore_products" noEditModeUI={true} /></Link>
                </Button>
              </EditableWrapper>
               <EditableWrapper 
                fieldType="button" 
                translationKey="button_request_quote" 
                styleKeys={{
                  backgroundColor: "button_request_quote_bg_color", 
                  color: "button_request_quote_text_color", 
                  fontSize: "button_request_quote_font_size",
                  borderRadius: "button_request_quote_shape",
                  borderColor: "button_request_quote_outline_color",
                }}
               >
                <Button asChild size="lg" variant="outline">
                  <Link href="/contact"><EditableText fieldType="text" translationKey="button_request_quote" noEditModeUI={true} /></Link>
                </Button>
              </EditableWrapper>
            </div>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="py-16 md:py-24 bg-transparent">
          <div className="container mx-auto text-center px-4">
              <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4">
                <EditableText fieldType="text" translationKey="home_intro_title" styleKeys={{color: "home_intro_title_color", fontSize: "home_intro_title_font_size"}} />
              </h2>
              <p className="max-w-3xl mx-auto text-muted-foreground md:text-lg">
                  <EditableText fieldType="textarea" translationKey="home_intro_subtitle" styleKeys={{color: "home_intro_subtitle_color", fontSize: "home_intro_subtitle_font_size"}} />
              </p>
          </div>
        </section>

        {/* Products Section */}
        <section id="products" className="py-16 md:py-24 bg-transparent">
          <div className="container mx-auto px-4">
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
                <EditableText fieldType="text" translationKey="home_products_title" styleKeys={{color: "home_products_title_color", fontSize: "home_products_title_font_size"}} />
            </h2>
            {loading ? (
                <div className="grid md:grid-cols-3 gap-8">
                  <Skeleton className="h-96 w-full" />
                  <Skeleton className="h-96 w-full" />
                  <Skeleton className="h-96 w-full" />
                </div>
            ) : (
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
                              data-ai-hint={product.name}
                            />
                          </div>
                          <CardDescription>{product.description}</CardDescription>
                        </CardContent>
                      </Card>
                    </div>
                  )
                })}
              </div>
            )}
            {topProducts.length > 0 && (
              <div className="text-center mt-12">
                <EditableWrapper 
                    fieldType="button" 
                    translationKey="button_show_more" 
                    styleKeys={{
                        backgroundColor: "button_show_more_bg_color", 
                        color: "button_show_more_text_color", 
                        fontSize: "button_show_more_font_size",
                        borderRadius: "button_show_more_shape",
                        borderColor: "button_show_more_outline_color",
                    }}
                >
                  <Button asChild size="lg" variant="outline">
                    <Link href="/products">
                        <EditableText fieldType="text" translationKey="button_show_more" noEditModeUI={true} /> <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </EditableWrapper>
              </div>
            )}
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-transparent">
          <div className="container mx-auto text-center px-4">
              <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4">
                <EditableText fieldType="text" translationKey="home_cta_title" styleKeys={{color: "home_cta_title_color", fontSize: "home_cta_title_font_size"}} />
              </h2>
              <p className="max-w-3xl mx-auto text-muted-foreground md:text-lg mb-8">
                  <EditableText fieldType="textarea" translationKey="home_cta_subtitle" styleKeys={{color: "home_cta_subtitle_color", fontSize: "home_cta_subtitle_font_size"}} />
              </p>
              <EditableWrapper 
                fieldType="button" 
                translationKey="button_contact_us" 
                styleKeys={{
                    backgroundColor: 'button_contact_us_bg_color', 
                    color: 'button_contact_us_text_color', 
                    fontSize: "button_contact_us_font_size",
                    borderRadius: "button_contact_us_shape",
                    borderColor: "button_contact_us_outline_color",
                }}
              >
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/contact">
                        <EditableText fieldType="text" translationKey="button_contact_us" noEditModeUI={true} /> <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
              </EditableWrapper>
          </div>
        </section>
      </main>
    </PageLayout>
  );
}
