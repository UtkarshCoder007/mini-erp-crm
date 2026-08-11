import { Router } from 'express';
import { login } from './auth.controller';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { Response } from 'express';

const router = Router();

router.post('/login', login);

router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  res.json({ data: req.user });
});

export default router;