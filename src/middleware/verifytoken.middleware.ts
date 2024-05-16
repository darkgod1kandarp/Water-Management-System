import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from 'express';
import User from  "../models/user.model"
import getLogger from '../utils/logger';
const logger = getLogger();

type UserInterface= {
  id: number;
  role: string;
}

// Verify the token
const verifyToken = (req:Request, res:Response, next:NextFunction) => {
    if (!process.env.JWT_SECRET) return res.sendStatus(500);
    if (!req.headers.authorization) {
      if (req.path === "/login") return next();
      return res.sendStatus(403);
    }

    const bearerHeader  =  req.headers.authorization;
    const token:string = bearerHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, 
      async (err:any, decoded:any) => {
        if (err) return res.sendStatus(403);
        const { user } = decoded;
        User.findOne({ where: { id: user.userid } }).then((user:UserInterface) => {
          
          // If user not found
          if (!user) {
            logger.error("User not found while verifying token");
            return res.sendStatus(403);
          }
          res.locals.user = user;

          // If user found
         if (req.path==="/login"){

            return res.send({
              user,
              token: token
            }).status(200);
          } 
          next();
        });

      });
    
  };

export default  verifyToken;
