import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "./jwtAuth";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const auth = req.header("Authorization");
    if (!auth?.startsWith("Bearer ")) return res.status(401).json({ message: "Missing token" });
    const token = auth.substring("Bearer ".length);
    try {
        const payload = verifyJwt(token);
        (req as any).user = payload;
        next();
    } catch {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}