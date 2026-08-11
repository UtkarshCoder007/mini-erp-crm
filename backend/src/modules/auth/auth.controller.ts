import { Request, Response } from 'express';
import { z } from 'zod';
import { loginUser } from './auth.service';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;
  const result = await loginUser(email, password);

  if (!result) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({ data: result });
}