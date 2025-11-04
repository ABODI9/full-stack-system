import { Request, Response, NextFunction } from 'express';

export type JwtRole = 'admin' | 'manager' | 'user';
export type JwtUser = { id: number; email: string; role: JwtRole };

export type AuthRequest<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any,
  Locals extends Record<string, any> = Record<string, any>
> = Request<P, ResBody, ReqBody, ReqQuery, Locals> & { user?: JwtUser };

/**
 * ✅ مفتوح: لا يتحقق من التوكن
 * أي شخص يدخل يعتبر "مصادق عليه".
 */
export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  req.user = {
    id: 0,
    email: 'guest@example.com',
    role: 'admin', // أو 'user' إذا تبي بدون صلاحيات أدمن
  };
  next();
}

/**
 * ✅ يسمح للجميع، حتى لو الدور مش أدمن.
 */
export function requireRole(_roles: JwtRole[]) {
  return (_req: AuthRequest, _res: Response, next: NextFunction) => {
    next();
  };
}

/**
 * ✅ الكل يُعتبر أدمن الآن.
 */
export const requireAdmin = (_req: AuthRequest, _res: Response, next: NextFunction) => next();

/** alias للتوافق */
export const auth = requireAuth;
