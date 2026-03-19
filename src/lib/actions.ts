// lib/actions.ts
"use server";

import { z } from "zod";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp, updateDoc, doc, deleteDoc, query, where, getDocs } from "firebase/firestore/lite";
import { revalidatePath } from "next/cache";


// ========= CONTACT FORM ACTION =========

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  products: z.string().min(1, "Please select at least one product."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

export type ContactFormState = {
    message: string;
    status: "success" | "error" | "idle";
    errors?: {
        product?: string;
    }
};

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const validatedFields = contactFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    products: formData.get("products"),
    message: formData.get("message"),
  });

  if (!validatedFields.success) {
    const errorMessages = validatedFields.error.issues.map(issue => issue.message).join(", ");
    return {
      message: `There was an error with your submission: ${errorMessages}`,
      status: "error",
      errors: { product: errorMessages }, // Flattened errors to match expected string field
    };
  }

  try {
    const submissionData = {
        name: validatedFields.data.name,
        email: validatedFields.data.email,
        product: validatedFields.data.products, // The field is named 'product' in the database
        message: validatedFields.data.message,
        createdAt: serverTimestamp(),
        status: 'New',
    };
    await addDoc(collection(db, "submissions"), submissionData);
    
    try {
        revalidatePath("/admin");
    } catch (e) {
        console.error("Revalidation failed:", e);
    }
    return {
      message: "Thank you for your message! We will get back to you soon.",
      status: "success",
    };
  } catch (error) {
    console.error("Error writing document: ", error);
    return {
      message: "Failed to submit your message. Please try again later.",
      status: "error",
    };
  }
}

export async function updateSubmissionStatusAction(submissionId: string, status: 'New' | 'Contacted') {
    try {
        const submissionRef = doc(db, 'submissions', submissionId);
        await updateDoc(submissionRef, { status });
        try {
            revalidatePath('/admin');
        } catch (e) {
            console.error("Revalidation failed:", e);
        }
        return { status: "success", message: "Submission status updated." };
    } catch (error) {
        console.error("Error updating submission:", error);
        return { status: "error", message: "Failed to update submission." };
    }
}


// ========= PRODUCT ACTIONS =========

async function uploadImage(image: File): Promise<{ imageUrl: string; r2Key: string }> {
    const formData = new FormData();
    formData.append('file', image);

    const baseUrl = process.env.NEXT_PUBLIC_ENDPOINT || '';

    try {
        const response = await fetch(`${baseUrl}/api/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`File upload failed: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Upload failed');
        }

        const downloadUrl = `${baseUrl}/api/download/${encodeURIComponent(data.key)}`;

        return {
            imageUrl: downloadUrl,
            r2Key: data.key,
        };
    } catch (error) {
        console.error("Error uploading image to R2:", error);
        throw error;
    }
}


const productSchema = z.object({
    name: z.string().min(3, "Product name must be at least 3 characters."),
    price: z.coerce.number().min(0.01, "Price must be greater than 0."),
    priceUnit: z.string().min(1, "Price unit is required."),
    status: z.enum(['Active', 'Archived']),
    category: z.string().min(1, "Category is required."),
    image: z.instanceof(File).optional(),
    description: z.string().min(10, "Description must be at least 10 characters."),
    features: z.string().transform((str) => str.split('\n').map(s => s.trim()).filter(Boolean)),
});


export type AddProductState = {
    status: "success" | "error" | "idle";
    message: string;
    errors?: Record<string, string>;
    redirect?: string;
}

export async function addProductAction(prevState: AddProductState, formData: FormData): Promise<AddProductState> {
    const imageFile = formData.get("image") as File | null;
    const validationData = {
        name: formData.get("name"),
        price: formData.get("price"),
        priceUnit: formData.get("priceUnit"),
        status: formData.get("status"),
        category: formData.get("category"),
        image: imageFile && imageFile.size > 0 ? imageFile : undefined,
        description: formData.get("description"),
        features: formData.get("features"),
    };
    
    const validatedFields = productSchema.safeParse(validationData);

    if (!validatedFields.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of validatedFields.error.issues) {
            if (issue.path[0]) {
                fieldErrors[issue.path[0] as string] = issue.message;
            }
        }
        return {
            status: "error",
            message: "Please correct the errors below.",
            errors: fieldErrors,
        }
    }

    try {
        let productData: Record<string, any> = {
            ...validatedFields.data,
            createdAt: serverTimestamp(),
        };

        if (validatedFields.data.image) {
            const uploadResult = await uploadImage(validatedFields.data.image);
            productData.image = uploadResult.imageUrl;
            productData.r2Key = uploadResult.r2Key;
        }

        await addDoc(collection(db, 'products'), productData);

        try {
            try {
            revalidatePath('/admin');
        } catch (e) {
            console.error("Revalidation failed:", e);
        }
            revalidatePath('/products');
            revalidatePath('/');
        } catch (e) {
            console.error("Revalidation failed:", e);
        }

    } catch (error: any) {
        console.error("Error adding product to database:", error);
        return {
            status: "error",
            message: `Failed to add product to database. Please try again. ${error.message}`,
            errors: {},
        }
    }
    
    return {
        status: "success",
        message: "Product added successfully!",
        redirect: "/admin",
    };
}


export async function editProductAction(productId: string, prevState: AddProductState, formData: FormData): Promise<AddProductState> {
    const imageFile = formData.get("image") as File | null;
    const validationData = {
        name: formData.get("name"),
        price: formData.get("price"),
        priceUnit: formData.get("priceUnit"),
        status: formData.get("status"),
        category: formData.get("category"),
        image: imageFile && imageFile.size > 0 ? imageFile : undefined,
        description: formData.get("description"),
        features: formData.get("features"),
    };
    
    const validatedFields = productSchema.safeParse(validationData);


    if (!validatedFields.success) {
         const fieldErrors: Record<string, string> = {};
        for (const issue of validatedFields.error.issues) {
            if (issue.path[0]) {
                fieldErrors[issue.path[0] as string] = issue.message;
            }
        }
        return {
            status: "error",
            message: "Please correct the errors below.",
            errors: fieldErrors,
        }
    }

    try {
        const productRef = doc(db, 'products', productId);
        let imageUrl: string | undefined = undefined;

        const { image, ...restOfData } = validatedFields.data;
        const updateData: Record<string, any> = { ...restOfData };

        if (validatedFields.data.image) {
            const uploadResult = await uploadImage(validatedFields.data.image);
            imageUrl = uploadResult.imageUrl;
            updateData.r2Key = uploadResult.r2Key;
        }
        
        if (imageUrl !== undefined) {
            updateData.image = imageUrl;
        }

        await updateDoc(productRef, updateData);

        try {
            try {
            revalidatePath('/admin');
        } catch (e) {
            console.error("Revalidation failed:", e);
        }
            revalidatePath('/products');
            revalidatePath('/');
        } catch (e) {
            console.error("Revalidation failed:", e);
        }
        
        return {
            status: 'success',
            message: 'Product updated successfully!',
        };

    } catch (error: any) {
        console.error("Error updating product in database:", error);
        return {
            status: "error",
            message: `Failed to update product. Please try again. ${error.message}`,
        }
    }
}


export async function deleteProductAction(productId: string) {
    try {
        await deleteDoc(doc(db, "products", productId));
        try {
            try {
            revalidatePath('/admin');
        } catch (e) {
            console.error("Revalidation failed:", e);
        }
            revalidatePath('/products');
            revalidatePath('/');
        } catch (e) {
            console.error("Revalidation failed:", e);
        }
        return { status: "success", message: "Product deleted successfully." };
    } catch (error) {
        console.error("Error deleting product:", error);
        return { status: "error", message: "Failed to delete product." };
    }
}

// ========= CATEGORY ACTIONS =========

const categorySchema = z.object({
    name: z.string().min(2, "Category name must be at least 2 characters."),
    icon: z.string().min(1, "An icon must be selected."),
});

export type CategoryFormState = {
    status: "success" | "error" | "idle";
    message: string;
    errors?: {
        name?: string;
        icon?: string;
    }
};

export async function addCategoryAction(prevState: CategoryFormState, formData: FormData): Promise<CategoryFormState> {
    const validatedFields = categorySchema.safeParse({
        name: formData.get("name"),
        icon: formData.get("icon"),
    });

    if (!validatedFields.success) {
        return {
            status: "error",
            message: "Invalid data.",
            errors: { name: "Invalid data." }
        };
    }
    
    try {
        // Check for duplicate category name
        const categoriesRef = collection(db, 'categories');
        const q = query(categoriesRef, where("name", "==", validatedFields.data.name));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return {
                status: "error",
                message: "A category with this name already exists.",
                errors: { name: "A category with this name already exists." }
            };
        }

        await addDoc(collection(db, 'categories'), validatedFields.data);
        try {
            revalidatePath('/admin');
        } catch (e) {
            console.error("Revalidation failed:", e);
        }
        return { status: "success", message: `Category "${validatedFields.data.name}" added.` };
    } catch (error) {
        console.error("Error adding category:", error);
        return { status: "error", message: "Failed to add category." };
    }
}

export async function editCategoryAction(categoryId: string, prevState: CategoryFormState, formData: FormData): Promise<CategoryFormState> {
    const validatedFields = categorySchema.safeParse({
        name: formData.get("name"),
        icon: formData.get("icon"),
    });

    if (!validatedFields.success) {
        return {
            status: "error",
            message: "Invalid data.",
            errors: { name: "Invalid data." }
        }
    }
    
    try {
        const categoryRef = doc(db, 'categories', categoryId);
        await updateDoc(categoryRef, validatedFields.data);
        try {
            revalidatePath('/admin');
        } catch (e) {
            console.error("Revalidation failed:", e);
        }
        return { status: "success", message: `Category "${validatedFields.data.name}" updated.` };
    } catch (error) {
        console.error("Error updating category:", error);
        return { status: "error", message: "Failed to update category." };
    }
}

export async function deleteCategoryAction(categoryId: string, categoryName: string) {
     try {
        await deleteDoc(doc(db, "categories", categoryId));
        try {
            revalidatePath('/admin');
        } catch (e) {
            console.error("Revalidation failed:", e);
        }
        return { status: "success", message: `Category "${categoryName}" deleted.` };
    } catch (error) {
        console.error("Error deleting category:", error);
        return { status: "error", message: "Failed to delete category." };
    }
}
