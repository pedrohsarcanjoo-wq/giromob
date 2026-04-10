import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-2026';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    res.status(401).json({ error: 'Erro no formato do Token' });
    return;
  }

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    res.status(401).json({ error: 'Token malformatado' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).userId = (decoded as any).id;
    return next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
    return;
  }
}
