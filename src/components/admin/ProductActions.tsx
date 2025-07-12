// src/components/admin/ProductActions.tsx
"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteProductAction, editProductAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { LoaderCircle, Trash, Edit } from "lucide-react";
import { type Product } from "@/lib/types";

function SubmitButton({ text, pendingText }: { text: string, pendingText: string }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><LoaderCircle className="animate-spin mr-2" />{pendingText}</> : text}
        </Button>
    )
}

// ========= EDIT PRODUCT DIALOG =========

export function EditProductDialog({ product }: { product: Product }) {
    const [open, setOpen] = useState(false);
    const editActionWithId = editProductAction.bind(null, product.id);
    const [state, formAction, isPending] = useActionState(editActionWithId, {
        status: "idle",
        message: "",
        errors: {},
    });

    useEffect(() => {
        if (state.status === "success") {
            setOpen(false);
            toast({
                title: "Success!",
                description: state.message,
            });
        } else if (state.status === "error") {
            toast({
                title: "Error",
                description: state.message,
                variant: "destructive",
            });
        }
    }, [state]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                 <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit {product.name}</DialogTitle>
                    <DialogDescription>
                        Make changes to the product details here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                     <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input id="name" name="name" defaultValue={product.name} disabled={isPending} />
                        {state.errors?.name && <p className="text-sm text-destructive mt-1">{state.errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <Input id="price" name="price" type="number" step="0.01" defaultValue={product.price} disabled={isPending} />
                        {state.errors?.price && <p className="text-sm text-destructive mt-1">{state.errors.price}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="priceUnit">Price Unit</Label>
                        <Input id="priceUnit" name="priceUnit" defaultValue={product.priceUnit} disabled={isPending} />
                        {state.errors?.priceUnit && <p className="text-sm text-destructive mt-1">{state.errors.priceUnit}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select name="status" defaultValue={product.status} disabled={isPending}>
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
                        <Label htmlFor="image">Image URL</Label>
                        <Input id="image" name="image" defaultValue={product.image} disabled={isPending} />
                        {state.errors?.image && <p className="text-sm text-destructive mt-1">{state.errors.image}</p>}
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" defaultValue={product.description} disabled={isPending} />
                        {state.errors?.description && <p className="text-sm text-destructive mt-1">{state.errors.description}</p>}
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="features">Features (one per line)</Label>
                        <Textarea id="features" name="features" defaultValue={product.features.join('\n')} rows={4} disabled={isPending} />
                        {state.errors?.features && <p className="text-sm text-destructive mt-1">{state.errors.features}</p>}
                    </div>
                    <DialogFooter className="md:col-span-2">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <SubmitButton text="Save Changes" pendingText="Saving..." />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ========= DELETE PRODUCT DIALOG =========

export function DeleteProductDialog({ productId, productName }: { productId: string, productName: string }) {
    const [open, setOpen] = useState(false);

    const handleDelete = async () => {
        const result = await deleteProductAction(productId);
        if (result.status === "success") {
            toast({
                title: "Success!",
                description: result.message,
            });
            setOpen(false);
        } else {
             toast({
                title: "Error",
                description: result.message,
                variant: "destructive",
            });
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <Trash className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the product
                        <span className="font-semibold"> {productName} </span> 
                        from the database.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <form action={handleDelete}>
                        <Button variant="destructive" type="submit">
                            Delete Product
                        </Button>
                    </form>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}