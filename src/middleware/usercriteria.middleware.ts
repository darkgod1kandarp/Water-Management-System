import { Request, Response, NextFunction } from 'express';
import getLogger from '../utils/logger';

const logger = getLogger();



export default function userCriteria(req: Request, res: Response, next: NextFunction) {
    if (req.url.includes("initial") && res.locals.user.role === 'driver') {
        return next();
    }
    if (res.locals.user.role === 'driver') {
        logger.error('User should be admin to access this route');
        return res.status(403).send({ message: 'Unauthorized access' });
    }
   
    next();
}