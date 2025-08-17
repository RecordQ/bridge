// lib/actions.ts
"use server";

import { z } from "zod";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp, updateDoc, doc, deleteDoc, query, where, getDocs } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


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
      errors: validatedFields.error.flatten().fieldErrors,
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
    
    revalidatePath("/admin");
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
        revalidatePath('/admin');
        return { status: "success", message: "Submission status updated." };
    } catch (error) {
        console.error("Error updating submission:", error);
        return { status: "error", message: "Failed to update submission." };
    }
}


// ========= PRODUCT ACTIONS =========

async function uploadImage(image: File): Promise<string> {
    const uploadUrl = process.env.NEXT_PUBLIC_UPLOAD_ENDPOINT;
    if (!uploadUrl) {
        throw new Error("Upload endpoint URL is not configured.");
    }

    const formData = new FormData();
    formData.append('file', image);

    try {
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`File upload failed: ${response.statusText} - ${errorText}`);
        }

        const filename = await response.text();
        const baseUrl = new URL(uploadUrl);
        
        return `${baseUrl.protocol}//${baseUrl.hostname}:${baseUrl.port}/download/${filename}`;
        
    } catch (error) {
        console.error("Error uploading image to custom endpoint:", error);
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
        let imageUrl = '';
        if (validatedFields.data.image) {
            imageUrl = await uploadImage(validatedFields.data.image);
        }

        const productData = {
            ...validatedFields.data,
            image: imageUrl,
            createdAt: serverTimestamp(),
        };

        await addDoc(collection(db, 'products'), productData);

        revalidatePath('/admin');
        revalidatePath('/products');
        revalidatePath('/');

    } catch (error: any) {
        console.error("Error adding product to database:", error);
        return {
            status: "error",
            message: `Failed to add product to database. Please try again. ${error.message}`,
            errors: {},
        }
    }
    
    redirect('/admin');
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

        if (validatedFields.data.image) {
            imageUrl = await uploadImage(validatedFields.data.image);
        }
        
        const { image, ...restOfData } = validatedFields.data;
        
        const updateData: Record<string, any> = { ...restOfData };
        if (imageUrl !== undefined) {
            updateData.image = imageUrl;
        }

        await updateDoc(productRef, updateData);

        revalidatePath('/admin');
        revalidatePath('/products');
        revalidatePath('/');
        
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
        revalidatePath('/admin');
        revalidatePath('/products');
        revalidatePath('/');
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
            errors: validatedFields.error.flatten().fieldErrors,
        }
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
        revalidatePath('/admin');
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
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }
    
    try {
        const categoryRef = doc(db, 'categories', categoryId);
        await updateDoc(categoryRef, validatedFields.data);
        revalidatePath('/admin');
        return { status: "success", message: `Category "${validatedFields.data.name}" updated.` };
    } catch (error) {
        console.error("Error updating category:", error);
        return { status: "error", message: "Failed to update category." };
    }
}

export async function deleteCategoryAction(categoryId: string, categoryName: string) {
     try {
        await deleteDoc(doc(db, "categories", categoryId));
        revalidatePath('/admin');
        return { status: "success", message: `Category "${categoryName}" deleted.` };
    } catch (error) {
        console.error("Error deleting category:", error);
        return { status: "error", message: "Failed to delete category." };
    }
}
