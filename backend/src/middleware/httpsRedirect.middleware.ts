import { Request, Response, NextFunction } from 'express';

const isProduction = process.env.NODE_ENV === 'production';

export const httpsRedirect = (req: Request, res: Response, next: NextFunction) => {
    if (isProduction && req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
    }
    next();
};
