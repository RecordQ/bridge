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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, LoaderCircle } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { useSiteData } from "@/hooks/useSiteData";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useSiteData();
  return (
    <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={pending}>
      {pending ? <LoaderCircle className="animate-spin" /> : t('button_send_message')}
    </Button>
  );
}

function ContactPageForm() {
  const { t } = useSiteData();
  const [state, formAction] = useActionState<ContactFormState, FormData>(submitContactForm, {
    message: "",
    status: "idle",
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // This key forces the form to re-render when a submission is successful
  const formKey: Key = state.status === 'success' ? new Date().getTime() : 'contact-form';
  
  useEffect(() => {
    async function initializeForm() {
      setLoadingProducts(true);
      
      // Check localStorage for a pre-selected product
      const storedProductId = localStorage.getItem('selectedProductIdForQuote');
      if (storedProductId) {
        setSelectedProductId(storedProductId);
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
    } else if (state.status === "error") {
      toast({ title: "Error", description: state.message, variant: "destructive" });
    }
  }, [state]);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border border-border/20">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{t('contact_form_title')}</CardTitle>
        <CardDescription>{t('contact_form_subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form key={formKey} action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="name">{t('contact_form_name_label')}</Label>
            <Input id="name" name="name" placeholder={t('contact_form_name_placeholder')} required />
          </div>
          <div>
            <Label htmlFor="email">{t('contact_form_email_label')}</Label>
            <Input id="email" type="email" name="email" placeholder={t('contact_form_email_placeholder')} required/>
          </div>
          <div>
            <Label htmlFor="product">{t('contact_form_product_label')}</Label>
            {loadingProducts ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select name="product" defaultValue={selectedProduct?.name} required>
                <SelectTrigger>
                  <SelectValue placeholder={t('contact_form_product_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.name}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div>
            <Label htmlFor="message">{t('contact_form_message_label')}</Label>
            <Textarea id="message" name="message" placeholder={t('contact_form_message_placeholder')} rows={6} required minLength={10} />
          </div>
          <SubmitButton />
          {state.status === 'error' && state.message && (
            <p className="text-destructive text-sm mt-2">{state.message}</p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

export default function ContactPage() {
  const { t } = useSiteData();
  return (
    <div className="bg-transparent">
      <section 
        className="relative py-24 md:py-40"
      >
        <div className="container mx-auto text-center relative z-10 px-4">
          <h1 className="font-headline text-4xl md:text-6xl font-bold text-white">{t('contact_hero_title')}</h1>
          <p className="mt-4 text-lg md:text-xl text-white/80 max-w-3xl mx-auto">
            {t('contact_hero_subtitle')}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-transparent">
        <div className="container mx-auto grid md:grid-cols-2 gap-16 px-4">
          <div>
            <h2 className="font-headline text-3xl font-bold mb-4">{t('contact_info_title')}</h2>
            <p className="text-muted-foreground mb-8">
              {t('contact_info_subtitle')}
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Mail className="w-6 h-6 text-accent" />
                <div>
                  <h3 className="font-semibold">{t('contact_info_email')}</h3>
                  <a href="mailto:contact@bridgeltd.com" className="text-muted-foreground hover:text-accent transition-colors">contact@bridgeltd.com</a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="w-6 h-6 text-accent" />
                <div>
                  <h3 className="font-semibold">{t('contact_info_phone')}</h3>
                  <a href="tel:+1234567890" className="text-muted-foreground hover:text-accent transition-colors">+1 (234) 567-890</a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <MapPin className="w-6 h-6 text-accent" />
                <div>
                  <h3 className="font-semibold">{t('contact_info_office')}</h3>
                  <p className="text-muted-foreground">123 Starship Lane, Orbit City, 54321</p>
                </div>
              </div>
            </div>
          </div>
          <ContactPageForm />
        </div>
      </section>
    </div>
  )
}
