
// src/components/admin/CategoryActions.tsx
"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { addCategoryAction, editCategoryAction, deleteCategoryAction, type CategoryFormState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, Trash, Edit, PlusCircle, type LucideProps, type LucideIcon, Package, PenTool, Usb, Box, Briefcase, Gift, ShoppingCart, Tag, Star, Home, Wrench, Shirt, Computer, Car, Camera, Sprout, Heart, Trophy, Book, Watch } from "lucide-react";
import { type Category } from "@/lib/types";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";

// Manual mapping of string names to Lucide components
const icons: Record<string, LucideIcon> = {
    Package, PenTool, Usb, Box, Briefcase, Gift, ShoppingCart, Tag, Star, Home, Wrench, Shirt, Computer, Car, Camera, Sprout, Heart, Trophy, Book, Watch
};

const Icon = ({ name, ...props }: { name: string } & LucideProps) => {
    const LucideIcon = icons[name] || Package; // Fallback to Package icon
    return <LucideIcon {...props} />;
};


function SubmitButton({ text, pendingText, icon: Icon }: { text: string, pendingText: string, icon: LucideIcon }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><LoaderCircle className="animate-spin mr-2" />{pendingText}</> : <><Icon className="mr-2" />{text}</>}
        </Button>
    )
}

function IconPicker({ iconList, selectedIcon, setSelectedIcon }: { iconList: string[], selectedIcon: string, setSelectedIcon: (icon: string) => void }) {
    return (
        <div>
            <input type="hidden" name="icon" value={selectedIcon} />
            <div className="flex items-center gap-4 mb-2">
                <p>Selected Icon:</p> 
                <div className="flex items-center gap-2 p-2 border rounded-md">
                    <Icon name={selectedIcon} className="h-5 w-5" />
                    <span>{selectedIcon}</span>
                </div>
            </div>
             <ScrollArea className="h-72 w-full rounded-md border">
                <div className="p-4 grid grid-cols-5 gap-2">
                {iconList.map((iconName) => (
                    <Button
                        key={iconName}
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => setSelectedIcon(iconName)}
                        className={cn("h-12 w-12", selectedIcon === iconName && "bg-accent")}
                    >
                        <Icon name={iconName} className="h-6 w-6" />
                    </Button>
                ))}
                </div>
            </ScrollArea>
        </div>
    )
}

// ========= ADD CATEGORY DIALOG =========
export function AddCategoryDialog() {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const [selectedIcon, setSelectedIcon] = useState("Package");

    const [state, formAction] = useActionState<CategoryFormState, FormData>(addCategoryAction, {
        status: "idle",
        message: "",
    });
    
    // A hardcoded, curated list of icons to prevent runtime errors.
    const iconList = useMemo(() => Object.keys(icons), []);

    useEffect(() => {
        if (state.status === "success") {
            setOpen(false);
            setSelectedIcon("Package");
            toast({ title: "Success!", description: state.message });
        } else if (state.status === "error") {
            toast({ title: "Error", description: state.message, variant: "destructive" });
        }
    }, [state, toast]);

    return (
         <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                 <Button size="sm">
                    <PlusCircle className="mr-2" />
                    Add Category
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                 <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                    <DialogDescription>
                        Create a new category for your products. Choose a name and an icon.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} className="space-y-4 py-4">
                     <div className="space-y-2">
                        <Label htmlFor="name">Category Name</Label>
                        <Input id="name" name="name" placeholder="e.g., Office Supplies" />
                        {state.errors?.name && <p className="text-sm text-destructive mt-1">{state.errors.name}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label>Icon</Label>
                        <IconPicker iconList={iconList} selectedIcon={selectedIcon} setSelectedIcon={setSelectedIcon} />
                        {state.errors?.icon && <p className="text-sm text-destructive mt-1">{state.errors.icon}</p>}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <SubmitButton text="Add Category" pendingText="Adding..." icon={PlusCircle} />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


// ========= EDIT CATEGORY DIALOG =========

export function EditCategoryDialog({ category }: { category: Category }) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const editActionWithId = editCategoryAction.bind(null, category.id);
    const [selectedIcon, setSelectedIcon] = useState(category.icon);

    const [state, formAction] = useActionState<CategoryFormState, FormData>(editActionWithId, {
        status: "idle",
        message: "",
    });

     // A hardcoded, curated list of icons to prevent runtime errors.
    const iconList = useMemo(() => Object.keys(icons), []);

    useEffect(() => {
        if (state.status === "success") {
            setOpen(false);
            toast({ title: "Success!", description: state.message });
        } else if (state.status === "error") {
            toast({ title: "Error", description: state.message, variant: "destructive" });
        }
    }, [state, toast]);
    
    // Reset icon on cancel
    useEffect(() => {
        if (!open) {
            setSelectedIcon(category.icon);
        }
    }, [open, category.icon]);

    return (
         <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                 <Button variant="ghost" size="icon"><Edit className="h-4 w-4"/></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                 <DialogHeader>
                    <DialogTitle>Edit {category.name}</DialogTitle>
                    <DialogDescription>
                       Make changes to your category here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} className="space-y-4 py-4">
                     <div className="space-y-2">
                        <Label htmlFor="name">Category Name</Label>
                        <Input id="name" name="name" defaultValue={category.name} />
                        {state.errors?.name && <p className="text-sm text-destructive mt-1">{state.errors.name}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label>Icon</Label>
                        <IconPicker iconList={iconList} selectedIcon={selectedIcon} setSelectedIcon={setSelectedIcon} />
                        {state.errors?.icon && <p className="text-sm text-destructive mt-1">{state.errors.icon}</p>}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <SubmitButton text="Save Changes" pendingText="Saving..." icon={Edit} />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// ========= DELETE CATEGORY DIALOG =========

export function DeleteCategoryDialog({ categoryId, categoryName }: { categoryId: string, categoryName: string }) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();

    const handleDelete = async () => {
        const result = await deleteCategoryAction(categoryId, categoryName);
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
               <Button variant="destructive" size="icon"><Trash className="h-4 w-4"/></Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the category
                        <span className="font-semibold"> {categoryName}</span>.
                        Products in this category will not be deleted but will need to be reassigned to a new category.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <form action={handleDelete}>
                        <Button variant="destructive" type="submit">
                            Delete Category
                        </Button>
                    </form>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
