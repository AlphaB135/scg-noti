import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config/env';

export function jwtGuard(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) return res.sendStatus(401);
  try {
    req.user = jwt.verify(token, JWT_SECRET!);
    next();
  } catch { res.sendStatus(401); }
}
