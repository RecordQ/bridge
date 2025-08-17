// src/app/admin/add-product/page.tsx
"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { addProductAction, type AddProductState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, LoaderCircle, PlusCircle } from "lucide-react";
import Link from "next/link";
import { ImageCropper } from "@/components/admin/ImageCropper";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending ? <LoaderCircle className="animate-spin" /> : <><PlusCircle className="mr-2" />Add Product</>}
        </Button>
    )
}

export default function AddProductPage() {
    const router = useRouter();
    const {toast} = useToast();
    const [croppedImage, setCroppedImage] = useState<File | null>(null);

    const [state, formAction, isPending] = useActionState<AddProductState, FormData>(addProductAction, {
        status: "idle",
        message: "",
        errors: {},
    });

    useEffect(() => {
        if (state.status === "success") {
            toast({
                title: "Success!",
                description: state.message,
            });
            // The action now handles redirection via redirect()
        } else if (state.status === "error") {
            toast({
                title: "Error",
                description: state.message,
                variant: "destructive",
            });
        }
    }, [state, router, toast]);
    
    const handleFormAction = (formData: FormData) => {
        if (croppedImage) {
            formData.set('image', croppedImage, croppedImage.name);
        } else {
            formData.delete('image');
        }
        formAction(formData);
    }

    return (
        <div className="min-h-screen bg-muted/40 p-4 sm:p-8 flex items-center justify-center">
            <Card className="w-full max-w-2xl">
                 <CardHeader>
                    <div className="flex items-center justify-between">
                         <div>
                            <CardTitle className="font-headline text-2xl">Add New Product</CardTitle>
                            <CardDescription>Fill in the details to add a new product to your catalog.</CardDescription>
                         </div>
                         <Button asChild variant="outline" size="sm">
                             <Link href="/admin"><ArrowLeft className="mr-2" />Back to Dashboard</Link>
                         </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <form action={handleFormAction} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input id="name" name="name" placeholder="e.g., Custom USB Drive" disabled={isPending} />
                            {state.errors?.name && <p className="text-sm text-destructive mt-1">{state.errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Price</Label>
                            <Input id="price" name="price" type="number" step="0.01" placeholder="e.g., 12.99" disabled={isPending} />
                            {state.errors?.price && <p className="text-sm text-destructive mt-1">{state.errors.price}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="priceUnit">Price Unit</Label>
                            <Input id="priceUnit" name="priceUnit" placeholder="e.g., / unit" defaultValue="/ unit" disabled={isPending} />
                             {state.errors?.priceUnit && <p className="text-sm text-destructive mt-1">{state.errors.priceUnit}</p>}
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="status">Status</Label>
                             <Select name="status" defaultValue="Active" disabled={isPending}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Archived">Archived</SelectItem>
                                </SelectContent>
                             </Select>
                            {state.errors?.status && <p className="text-sm text-destructive mt-1">{state.errors.status}</p>}
                        </div>
                         <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="image">Product Image</Label>
                            <ImageCropper onCrop={setCroppedImage} aspect={16 / 9} />
                             {state.errors?.image && <p className="text-sm text-destructive mt-1">{state.errors.image}</p>}
                        </div>
                         <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" placeholder="A brief description of the product." disabled={isPending} />
                            {state.errors?.description && <p className="text-sm text-destructive mt-1">{state.errors.description}</p>}
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="features">Features (one per line)</Label>
                            <Textarea id="features" name="features" placeholder="Feature 1\nFeature 2\nFeature 3" rows={4} disabled={isPending} />
                             {state.errors?.features && <p className="text-sm text-destructive mt-1">{state.errors.features}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <SubmitButton />
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
