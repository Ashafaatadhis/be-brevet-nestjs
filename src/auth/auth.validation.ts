import { ZodType, z } from 'zod';

export class AuthValidation {
  static readonly REGISTER: ZodType = z
    .object({
      fullname: z.string().min(1).max(100),
      username: z.string().min(1).max(100),
      email: z.string().email(),
      password: z.string().min(1).max(100),
      confirmPassword: z.string().min(1).max(100),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    });
  static readonly LOGIN: ZodType = z.object({
    username: z.string().min(1).max(100),
    password: z.string().min(1).max(100),
  });
}
