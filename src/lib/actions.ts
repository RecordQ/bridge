// lib/actions.ts
"use server";

import { z } from "zod";
import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { serverTimestamp } from "firebase-admin/firestore";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import sharp from "sharp";


// ========= FILE UPLOAD UTILITY =========
async function uploadImage(imageFile: File): Promise<string> {
    const originalBuffer = Buffer.from(await imageFile.arrayBuffer());

    const resizedBuffer = await sharp(originalBuffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

    const fileName = `${randomUUID()}.webp`;
    const file = adminStorage.file(`products/${fileName}`);

    await file.save(resizedBuffer, {
        metadata: {
            contentType: 'image/webp',
        },
    });

    // Make the file public and get the URL
    await file.makePublic();
    return file.publicUrl();
}


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
    await adminDb.collection("submissions").add({
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
        const submissionRef = adminDb.collection('submissions').doc(submissionId);
        await submissionRef.update({ status });
        revalidatePath('/admin');
        return { status: "success", message: "Submission status updated." };
    } catch (error) {
        console.error("Error updating submission:", error);
        return { status: "error", message: "Failed to update submission." };
    }
}


// ========= PRODUCT ACTIONS =========

const productSchema = z.object({
    name: z.string().min(3, "Product name must be at least 3 characters."),
    price: z.coerce.number().min(0.01, "Price must be greater than 0."),
    priceUnit: z.string().min(1, "Price unit is required."),
    status: z.enum(['Active', 'Archived']),
    image: z.union([z.string().url("Must be a valid URL."), z.instanceof(File)]),
    description: z.string().min(10, "Description must be at least 10 characters."),
    features: z.string().transform((str) => str.split('\n').map(s => s.trim()).filter(Boolean)),
});

const imageFileSchema = z.instanceof(File).refine(
    (file) => file.size === 0 || file.type.startsWith("image/"),
    "Only image files are allowed."
).refine(
    (file) => file.size < 10 * 1024 * 1024,
    "Image must be less than 10MB."
);


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
        image: imageFile,
        description: formData.get("description"),
        features: formData.get("features"),
    };
    
    const validatedImage = imageFileSchema.safeParse(imageFile);
    if (!validatedImage.success) {
        return {
            status: "error",
            message: "Please correct the image error.",
            errors: { image: validatedImage.error.issues[0].message },
        }
    }
    
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
        let imageUrl = "https://placehold.co/600x400.png";
        if (validatedFields.data.image instanceof File && validatedFields.data.image.size > 0) {
            imageUrl = await uploadImage(validatedFields.data.image);
        }

        const productData = {
            ...validatedFields.data,
            image: imageUrl,
            createdAt: serverTimestamp(),
        };

        await adminDb.collection('products').add(productData);

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
    const imageFile = formData.get("image") as File;
    const existingImageUrl = formData.get("existingImage") as string;
    
    const validationData = {
        name: formData.get("name"),
        price: formData.get("price"),
        priceUnit: formData.get("priceUnit"),
        status: formData.get("status"),
        image: imageFile.size > 0 ? imageFile : existingImageUrl,
        description: formData.get("description"),
        features: formData.get("features"),
    };
    
    const validatedImage = imageFileSchema.safeParse(imageFile);
    if (!validatedImage.success) {
        return {
            status: "error",
            message: "Please correct the image error.",
            errors: { image: validatedImage.error.issues[0].message },
        }
    }
    
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
        let imageUrl = existingImageUrl;
        if (validatedFields.data.image instanceof File && validatedFields.data.image.size > 0) {
            imageUrl = await uploadImage(validatedFields.data.image);
            // Optionally: delete the old image from storage
        }
        
        const productRef = adminDb.collection('products').doc(productId);
        await productRef.update({
            ...validatedFields.data,
            image: imageUrl,
        });

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
        await adminDb.collection("products").doc(productId).delete();
        // Optionally: delete image from storage as well
        revalidatePath('/admin');
        revalidatePath('/products');
        revalidatePath('/');
        return { status: "success", message: "Product deleted successfully." };
    } catch (error) {
        console.error("Error deleting product:", error);
        return { status: "error", message: "Failed to delete product." };
    }
}
