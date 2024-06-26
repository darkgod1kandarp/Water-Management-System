import { Request, Response, NextFunction } from 'express';
import getLogger from '../utils/logger';

const logger = getLogger();


export default function userCriteria(req: Request, res: Response, next: NextFunction) {
    if (res.locals.user.role === 'driver') {
        logger.error('User should be admin to access this route');
        return res.send({ message: 'Unauthorized access' }).status(403);
    }
    next();
}