"use server";

import { z } from "zod";

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
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
    return {
      message: "There was an error with your submission.",
      status: "error",
    };
  }

  // In a real app, you would send an email, save to a database, etc.
  console.log("Contact form submitted successfully:");
  console.log(validatedFields.data);

  return {
    message: "Thank you for your message! We will get back to you soon.",
    status: "success",
  };
}
