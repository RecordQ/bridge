"use server";

import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


// ========= CONTACT FORM ACTION =========

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
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


// ========= ADD PRODUCT ACTION =========

const addProductSchema = z.object({
    name: z.string().min(3, "Product name must be at least 3 characters."),
    stock: z.coerce.number().int().min(0, "Stock must be a positive number."),
    price: z.coerce.number().min(0.01, "Price must be greater than 0."),
    priceUnit: z.string().min(1, "Price unit is required."),
    status: z.enum(['Active', 'Archived']),
    image: z.string().url("Must be a valid URL."),
    description: z.string().min(10, "Description must be at least 10 characters."),
    features: z.string().transform((str) => str.split('\n').map(s => s.trim()).filter(Boolean)),
});

export type AddProductState = {
    status: "success" | "error" | "idle";
    message: string;
    errors?: Record<keyof z.infer<typeof addProductSchema>, string>;
}

export async function addProductAction(prevState: AddProductState, formData: FormData): Promise<AddProductState> {
    const validatedFields = addProductSchema.safeParse({
        name: formData.get("name"),
        stock: formData.get("stock"),
        price: formData.get("price"),
        priceUnit: formData.get("priceUnit"),
        status: formData.get("status"),
        image: formData.get("image"),
        description: formData.get("description"),
        features: formData.get("features"),
    });

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
        await addDoc(collection(db, 'products'), {
            ...validatedFields.data,
            createdAt: serverTimestamp(),
        });

        // Revalidate paths to show new data
        revalidatePath('/admin');
        revalidatePath('/pricing');

    } catch (error) {
        console.error("Error adding product: ", error);
        return {
            status: "error",
            message: "Failed to add product to database. Please try again.",
            errors: {},
        }
    }
    
    // Redirect to admin dashboard on success
    redirect('/admin');

    // This return is technically unreachable due to redirect, but satisfies TypeScript
    return {
        status: "success",
        message: "Product added successfully!",
        errors: {},
    }
}
