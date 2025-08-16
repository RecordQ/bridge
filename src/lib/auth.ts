'use server'

import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { createHash } from "crypto";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginState = {
    status: "success" | "error" | "idle";
    message: string;
    username?: string;
    passwordHash?: string;
    errors?: {
        username?: string[];
        password?: string[];
    }
};

export async function loginAction(prevState: LoginState, formData: FormData): Promise<LoginState> {
    const validatedFields = loginSchema.safeParse({
        username: formData.get('username'),
        password: formData.get('password'),
    });

    if (!validatedFields.success) {
        return {
            status: "error",
            message: "Invalid form data.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const { username, password } = validatedFields.data;
    const passwordHash = createHash('sha512').update(password).digest('hex');
    
    try {
        const usersCol = adminDb.collection('users');
        const userSnapshot = await usersCol.get();

        if (userSnapshot.empty) {
            // If no users exist, create a default admin user
            const defaultAdminPasswordHash = createHash('sha512').update('password').digest('hex');
            await usersCol.add({ username: 'admin', password: defaultAdminPasswordHash });
        }

        const q = usersCol.where("username", "==", username);
        const querySnapshot = await q.get();

        if (querySnapshot.empty) {
            return { status: "error", message: "Invalid username or password." };
        }

        const userDoc = querySnapshot.docs[0];
        const user = userDoc.data();

        const passwordMatch = passwordHash === user.password;

        if (!passwordMatch) {
            return { status: "error", message: "Invalid username or password." };
        }
        
        return {
            status: "success",
            message: "Login Successful",
            username: username,
            passwordHash: passwordHash,
        };

    } catch (error: any) {
        console.error("Authentication error:", error);
        return { status: "error", message: `An unexpected error occurred. Please try again. ${error.message}` };
    }
}
