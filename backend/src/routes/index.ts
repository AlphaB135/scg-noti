import { Router } from 'express';
import { login, logout } from '../modules/auth/auth.controller';
import { jwtGuard } from '../middleware/auth/jwtGuard';

const r = Router();
r.post('/auth/login', login);
r.post('/auth/logout', jwtGuard, logout);
r.get('/me', jwtGuard, (req, res) => res.json(req.user));
export default r;
