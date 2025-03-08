import { z } from "zod";

export const SignInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignInSchemaInfer = z.infer<typeof SignInSchema>;
