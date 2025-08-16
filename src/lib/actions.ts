// lib/actions.ts
"use server";

import { z } from "zod";
import { db, storage } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


// ========= CONTACT FORM ACTION =========

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  product: z.string().min(1, "Please select a product."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

export type ContactFormState = {
    message: string;
    status: "success" | "error" | "idle";
};

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const validatedFields = contactFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    product: formData.get("product"),
    message: formData.get("message"),
  });

  if (!validatedFields.success) {
    const errorMessages = validatedFields.error.issues.map(issue => issue.message).join(", ");
    return {
      message: `There was an error with your submission: ${errorMessages}`,
      status: "error",
    };
  }

  try {
    await addDoc(collection(db, "submissions"), {
      ...validatedFields.data,
      createdAt: serverTimestamp(),
      status: 'New',
    });
    
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
    const storageRef = ref(storage, `products/${Date.now()}-${image.name}`);
    const imageBuffer = await image.arrayBuffer();
    await uploadBytes(storageRef, imageBuffer, { contentType: image.type });
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
}

const productSchema = z.object({
    name: z.string().min(3, "Product name must be at least 3 characters."),
    price: z.coerce.number().min(0.01, "Price must be greater than 0."),
    priceUnit: z.string().min(1, "Price unit is required."),
    status: z.enum(['Active', 'Archived']),
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
    const imageFile = formData.get("image") as File;
    const validationData = {
        name: formData.get("name"),
        price: formData.get("price"),
        priceUnit: formData.get("priceUnit"),
        status: formData.get("status"),
        image: imageFile.size > 0 ? imageFile : undefined,
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
        console.error("Firebase Error adding product to database:", error);
        return {
            status: "error",
            message: `Failed to add product to database. Please try again.`,
            errors: {},
        }
    }
    
    redirect('/admin');
}


export async function editProductAction(productId: string, prevState: AddProductState, formData: FormData): Promise<AddProductState> {
    const imageFile = formData.get("image") as File;
    const validationData = {
        name: formData.get("name"),
        price: formData.get("price"),
        priceUnit: formData.get("priceUnit"),
        status: formData.get("status"),
        image: imageFile.size > 0 ? imageFile : undefined,
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
            message: `Failed to update product. Please try again.`,
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
