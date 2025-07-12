// lib/actions.ts
"use server";

import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, writeBatch, getDocs, setDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Language } from "./types";
import { defaultTranslations } from "./config";


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

const productSchema = z.object({
    name: z.string().min(3, "Product name must be at least 3 characters."),
    price: z.coerce.number().min(0.01, "Price must be greater than 0."),
    priceUnit: z.string().min(1, "Price unit is required."),
    status: z.enum(['Active', 'Archived']),
    image: z.string().url("Must be a valid URL."),
    description: z.string().min(10, "Description must be at least 10 characters."),
    features: z.string().transform((str) => str.split('\n').map(s => s.trim()).filter(Boolean)),
});

type ProductActionState = {
    status: "success" | "error" | "idle";
    message: string;
    errors?: Record<string, string>;
}

export async function addProductAction(prevState: ProductActionState, formData: FormData): Promise<ProductActionState> {
    const validatedFields = productSchema.safeParse({
        name: formData.get("name"),
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

        revalidatePath('/admin');
        revalidatePath('/products');

    } catch (error) {
        console.error("Error adding product: ", error);
        return {
            status: "error",
            message: "Failed to add product to database. Please try again.",
            errors: {},
        }
    }
    
    redirect('/admin');
}


export async function editProductAction(productId: string, prevState: ProductActionState, formData: FormData): Promise<ProductActionState> {
    const validatedFields = productSchema.safeParse({
        name: formData.get("name"),
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
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, validatedFields.data);

        revalidatePath('/admin');
        revalidatePath('/products');
        
        return {
            status: 'success',
            message: 'Product updated successfully!',
        };

    } catch (error) {
        console.error("Error updating product: ", error);
        return {
            status: "error",
            message: "Failed to update product. Please try again.",
        }
    }
}


export async function deleteProductAction(productId: string) {
    try {
        await deleteDoc(doc(db, "products", productId));
        revalidatePath('/admin');
        revalidatePath('/products');
        return { status: "success", message: "Product deleted successfully." };
    } catch (error) {
        console.error("Error deleting product:", error);
        return { status: "error", message: "Failed to delete product." };
    }
}

// ========= SETTINGS ACTIONS =========

export type LanguageActionState = { status: 'idle' | 'success' | 'error', message: string };

export async function saveLanguagesAction(prevState: LanguageActionState, formData: FormData): Promise<LanguageActionState> {
    const languages: Language[] = [];
    const entries = Array.from(formData.entries());

    for (let i = 0; i < entries.length; i++) {
        const [key, value] = entries[i];
        const match = key.match(/languages\.(\d+)\.(.+)/);
        if (match) {
            const index = parseInt(match[1], 10);
            const prop = match[2];
            if (!languages[index]) languages[index] = { id: '', name: '', default: false };
            if (prop === 'default') {
                (languages[index] as any)[prop] = value === 'on';
            } else {
                (languages[index] as any)[prop] = value;
            }
        }
    }

    // Validate
    if (languages.filter(l => l.default).length !== 1) {
        return { status: 'error', message: "Exactly one language must be set as default." };
    }

    try {
        const batch = writeBatch(db);
        const existingLangsSnapshot = await getDocs(collection(db, 'languages'));
        const existingLangIds = existingLangsSnapshot.docs.map(d => d.id);
        const newLangIds = languages.map(l => l.id);

        // Delete languages that were removed
        for (const langId of existingLangIds) {
            if (!newLangIds.includes(langId)) {
                batch.delete(doc(db, 'languages', langId));
                batch.delete(doc(db, 'translations', langId)); // Also delete translations
            }
        }

        // Set new/updated languages
        for (const lang of languages) {
            const langRef = doc(db, 'languages', lang.id);
            batch.set(langRef, { name: lang.name, default: lang.default });
            
            // If it's a new language, create a default translation document for it
            if(!existingLangIds.includes(lang.id)) {
                const translationRef = doc(db, 'translations', lang.id);
                batch.set(translationRef, defaultTranslations);
            }
        }
        
        await batch.commit();
        revalidatePath('/admin/settings');
        return { status: 'success', message: "Languages saved successfully." };
    } catch (error) {
        console.error("Error saving languages:", error);
        return { status: 'error', message: "An error occurred while saving languages." };
    }
}

export type TranslationActionState = { status: 'idle' | 'success' | 'error', message: string };

export async function saveTranslationsAction(prevState: TranslationActionState, formData: FormData): Promise<TranslationActionState> {
    const langCode = formData.get('langCode') as string;
    if (!langCode) {
        return { status: 'error', message: "Language code is missing." };
    }
    
    const translations: Record<string, string> = {};
    const entries = Array.from(formData.entries());
    for (const [key, value] of entries) {
        const match = key.match(/translations\.(\d+)\.value/);
        if (match) {
            const index = parseInt(match[1], 10);
            const keyEntry = entries.find(([k]) => k === `translations.${index}.key`);
            if (keyEntry) {
                 translations[keyEntry[1] as string] = value as string;
            }
        }
    }

    try {
        const translationRef = doc(db, 'translations', langCode);
        await setDoc(translationRef, translations, { merge: true });
        revalidatePath('/admin/settings');
        return { status: 'success', message: `Translations for '${langCode}' saved.` };
    } catch (error) {
        console.error("Error saving translations:", error);
        return { status: 'error', message: 'Failed to save translations.' };
    }
}


export type ThemeActionState = { status: 'idle' | 'success' | 'error', message: string };
export async function saveThemeAction(prevState: ThemeActionState, formData: FormData): Promise<ThemeActionState> {
    const themeData: any = { colors: {}, threeScene: {} };
    for (const [key, value] of formData.entries()) {
        if (key.startsWith('colors.')) {
            themeData.colors[key.substring(7)] = value;
        } else if (key.startsWith('threeScene.')) {
            themeData.threeScene[key.substring(11)] = value;
        }
    }

    try {
        const themeRef = doc(db, 'theme', 'config');
        await setDoc(themeRef, themeData, { merge: true });
        revalidatePath('/admin/settings');
        return { status: 'success', message: "Theme updated successfully." };
    } catch (error) {
        console.error("Error saving theme:", error);
        return { status: 'error', message: "Failed to save theme." };
    }
}
