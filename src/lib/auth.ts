'use server'

import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { createHash, randomBytes } from "crypto";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// The state now returns an optional session token on success
export type LoginState = {
    status: "success" | "error" | "idle";
    message: string;
    sessionToken?: string;
    errors?: {
        username?: string[];
        password?: string[];
    }
};

async function createSession(username: string): Promise<string> {
    const sessionToken = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    await addDoc(collection(db, 'sessions'), {
        username,
        sessionToken,
        expires,
        createdAt: serverTimestamp(),
    });

    return sessionToken;
}


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
        const userSnapshot = await getDocs(usersCol);

        // Seed default admin if no users exist
        if (userSnapshot.empty) {
            const passwordHash = createHash('sha512').update('password').digest('hex');
            await addDoc(usersCol, { username: 'admin', password: passwordHash });
        }

        const q = query(usersCol, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { status: "error", message: "Invalid username or password." };
        }

        const userDoc = querySnapshot.docs[0];
        const user = userDoc.data();

        const passwordHash = createHash('sha512').update(password).digest('hex');
        const passwordMatch = passwordHash === user.password;

        if (!passwordMatch) {
            return { status: "error", message: "Invalid username or password." };
        }
        
        // On successful login, create a session and return the token
        const sessionToken = await createSession(username);

        return {
            status: "success",
            message: "Login Successful",
            sessionToken: sessionToken,
        };

    } catch (error) {
        console.error("Authentication error:", error);
        return { status: "error", message: "An unexpected error occurred. Please try again." };
    }
}

export async function logoutAction(sessionToken: string | null) {
    if (!sessionToken) {
        return;
    }

    try {
        const sessionsCol = collection(db, 'sessions');
        const q = query(sessionsCol, where("sessionToken", "==", sessionToken));
        const querySnapshot = await getDocs(q);
        
        // Use Promise.all to delete all matching sessions concurrently
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

    } catch(error) {
        console.error("Error during logout:", error);
        // We can choose to not throw an error to the client on logout failure
    }
}
