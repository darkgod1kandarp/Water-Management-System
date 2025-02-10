import { Request, Response, NextFunction } from 'express';
import getLogger from '../utils/logger';

const logger = getLogger();


export default function userCriteria(req: Request, res: Response, next: NextFunction) {
    if (res.locals.user.role === 'driver') {
        logger.error('User should be admin to access this route');
        return res.status(403).send({ message: 'Unauthorized access' });
    }
    if (req.url.includes("initial_data") && res.locals.user.role === 'driver') {
        next();
    }
    next();
}