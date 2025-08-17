// src/app/contact/page.tsx
"use client";

import { useFormStatus } from "react-dom";
import { useActionState, useEffect, useState, type Key } from "react";
import { toast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import type { Product } from '@/lib/types';

import { submitContactForm, type ContactFormState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Phone, MapPin, LoaderCircle, ChevronsUpDown, XIcon } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { PageLayout } from '@/components/layout/PageLayout';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={pending}>
      {pending ? <LoaderCircle className="animate-spin" /> : "Send Message"}
    </Button>
  );
}

function MultiSelectProducts({ products, loading, initialSelectedIds }: { products: Product[], loading: boolean, initialSelectedIds: string[] }) {
    const [open, setOpen] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<Product[]>(() => {
        return products.filter(p => initialSelectedIds.includes(p.id));
    });

    useEffect(() => {
        setSelectedProducts(products.filter(p => initialSelectedIds.includes(p.id)));
    }, [initialSelectedIds, products]);

    const handleToggle = (product: Product) => {
        setSelectedProducts(prev =>
            prev.some(p => p.id === product.id)
                ? prev.filter(p => p.id !== product.id)
                : [...prev, product]
        );
    };

    if (loading) {
        return <Skeleton className="h-10 w-full" />;
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <input type="hidden" name="products" value={selectedProducts.map(p => p.name).join(', ')} />
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal text-muted-foreground"
                >
                    <div className="flex-1 text-left">
                        {selectedProducts.length > 0 ? (
                             <div className="flex flex-wrap gap-1">
                                {selectedProducts.map(p => (
                                    <Badge key={p.id} variant="secondary">{p.name}</Badge>
                                ))}
                             </div>
                        ) : (
                            "Select products..."
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <div className="p-2 space-y-1">
                    {products.map((product) => (
                        <Label
                            key={product.id}
                            className="flex items-center gap-2 font-normal p-2 rounded-md hover:bg-accent"
                        >
                            <Checkbox
                                checked={selectedProducts.some(p => p.id === product.id)}
                                onCheckedChange={() => handleToggle(product)}
                            />
                            {product.name}
                        </Label>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}


function ContactPageForm() {
  const [state, formAction] = useActionState<ContactFormState, FormData>(submitContactForm, {
    message: "",
    status: "idle",
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [initialSelectedIds, setInitialSelectedIds] = useState<string[]>([]);

  const formKey: Key = state.status === 'success' ? new Date().getTime() : 'contact-form';
  
  useEffect(() => {
    async function initializeForm() {
      setLoadingProducts(true);
      
      const storedProductId = localStorage.getItem('selectedProductIdForQuote');
      if (storedProductId) {
        setInitialSelectedIds([storedProductId]);
        localStorage.removeItem('selectedProductIdForQuote');
      }

      try {
        const productsCol = collection(db, 'products');
        const q = query(productsCol, where("status", "==", "Active"));
        const snapshot = await getDocs(q);
        const productList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(productList);
      } catch (error) {
        console.error("Failed to fetch products for contact form:", error);
        toast({
          title: "Error",
          description: "Could not load products. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoadingProducts(false);
      }
    }
    initializeForm();
  }, []);

  useEffect(() => {
    if (state.status === "success") {
      toast({ title: "Success!", description: state.message });
      setInitialSelectedIds([]);
    } else if (state.status === "error") {
      toast({ title: "Error", description: state.message, variant: "destructive" });
    }
  }, [state]);


  return (
    <Card className="bg-card/80 border">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Send us a Message</CardTitle>
        <CardDescription>Fill out the form and we'll get back to you shortly.</CardDescription>
      </CardHeader>
      <CardContent>
        <form key={formKey} action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="Your Name" required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" name="email" placeholder="your.email@example.com" required/>
          </div>
          <div>
            <Label htmlFor="products">Products of Interest</Label>
            <MultiSelectProducts products={products} loading={loadingProducts} initialSelectedIds={initialSelectedIds} />
            {state.errors?.product && <p className="text-sm text-destructive mt-1">{state.errors.product}</p>}
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" placeholder="How can we help you today?" rows={6} required minLength={10} />
          </div>
          <SubmitButton />
          {state.status === 'error' && state.message && !state.errors && (
            <p className="text-destructive text-sm mt-2">{state.message}</p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

export default function ContactPage() {
  return (
    <PageLayout>
      <main className="flex-1 bg-transparent backdrop-blur-sm">
        <section 
          className="relative py-24 md:py-40"
        >
          <div className="container mx-auto text-center relative z-10 px-4">
            <h1 className="font-headline text-4xl md:text-6xl font-bold text-foreground">Get In Touch</h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Have a question or a project in mind? We'd love to hear from you.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-transparent">
          <div className="container mx-auto grid md:grid-cols-2 gap-16 px-4">
            <div>
              <h2 className="font-headline text-3xl font-bold mb-4">Contact Information</h2>
              <p className="text-muted-foreground mb-8">
                Reach out to us directly through any of the channels below. We're ready to assist you.
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Mail className="w-6 h-6 text-accent" />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <a href="mailto:contact@bridgeltd.com" className="text-muted-foreground hover:text-primary transition-colors">contact@bridgeltd.com</a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="w-6 h-6 text-accent" />
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <a href="tel:+1234567890" className="text-muted-foreground hover:text-primary transition-colors">+1 (234) 567-890</a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <MapPin className="w-6 h-6 text-accent" />
                  <div>
                    <h3 className="font-semibold">Office</h3>
                    <p className="text-muted-foreground">123 Starship Lane, Orbit City, 54321</p>
                  </div>
                </div>
              </div>
            </div>
            <ContactPageForm />
          </div>
        </section>
      </main>
    </PageLayout>
  )
}
