'use server'

import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { createHmac, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from 'next/navigation';

const SESSION_COOKIE_NAME = "app_session";

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

async function createSession(username: string) {
    const sessionToken = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await addDoc(collection(db, 'sessions'), {
        username,
        sessionToken,
        expires,
    });

    cookies().set(SESSION_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires,
        path: '/',
    });
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

        if (userSnapshot.empty) {
            console.log("No users found. Seeding default admin user.");
            const salt = randomBytes(16).toString('hex');
            const passwordHash = createHmac('sha512', salt).update('password').digest('hex');
            await addDoc(usersCol, { username: 'admin', password: passwordHash, salt: salt });
        }

        const q = query(usersCol, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { status: "error", message: "Invalid username or password." };
        }

        const userDoc = querySnapshot.docs[0];
        const user = userDoc.data();
        
        if (!user.salt) {
             return { status: "error", message: "Authentication failed. User data is missing security elements." };
        }

        const passwordHash = createHmac('sha512', user.salt).update(password).digest('hex');
        const passwordMatch = passwordHash === user.password;

        if (!passwordMatch) {
            return { status: "error", message: "Invalid username or password." };
        }
        
        await createSession(username);

    } catch (error) {
        console.error("Authentication error:", error);
        return { status: "error", message: "An unexpected error occurred. Please try again." };
    }
    
    redirect("/admin");
}

export async function logoutAction() {
    const sessionToken = cookies().get(SESSION_COOKIE_NAME)?.value;
    if (!sessionToken) {
        return;
    }

    // Delete session from DB
    const sessionsCol = collection(db, 'sessions');
    const q = query(sessionsCol, where("sessionToken", "==", sessionToken));
    const querySnapshot = await getDocs(q);
    
    for (const doc of querySnapshot.docs) {
        await deleteDoc(doc.ref);
    }
    
    // Clear cookie
    cookies().set(SESSION_COOKIE_NAME, "", { expires: new Date(0) });
}

export async function getSession() {
    const sessionToken = cookies().get(SESSION_COOKIE_NAME)?.value;
    if (!sessionToken) {
        return null;
    }
    
    const sessionsCol = collection(db, 'sessions');
    const q = query(sessionsCol, where("sessionToken", "==", sessionToken));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }

    const sessionDoc = querySnapshot.docs[0];
    const session = sessionDoc.data();
    
    if (session.expires.toDate() < new Date()) {
        await deleteDoc(sessionDoc.ref);
        return null;
    }

    return session;
}
