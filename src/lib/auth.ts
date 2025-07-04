
'use server'

import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import bcrypt from "bcryptjs";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginState = {
    status: "success" | "error" | "idle";
    message: string;
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
    
    try {
        const usersCol = collection(db, 'users');

        // For convenience in this prototype, we will seed a default admin user 
        // if the 'users' collection is empty. In a real application, you would
        // have a secure way to provision admin users.
        const userSnapshot = await getDocs(usersCol);
        if (userSnapshot.empty) {
            console.log("No users found. Seeding default admin user.");
            const hashedPassword = await bcrypt.hash('password', 10);
            await addDoc(usersCol, { username: 'admin', password: hashedPassword });
        }

        const q = query(usersCol, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { status: "error", message: "Invalid username or password." };
        }

        const userDoc = querySnapshot.docs[0];
        const user = userDoc.data();
        
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return { status: "error", message: "Invalid username or password." };
        }
        
        // In a real app, you would create a session here (e.g., using JWTs or a session cookie)
        // and protect the /admin route with middleware.
        return { status: "success", message: "Login successful!" };

    } catch (error) {
        console.error("Authentication error:", error);
        return { status: "error", message: "An unexpected error occurred. Please try again." };
    }
}
