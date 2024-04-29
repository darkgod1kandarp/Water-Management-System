import UserModel from "../models/user.model";   
import getLogger from '../utils/logger';   
import { Request, Response } from 'express';   
import { Op } from 'sequelize';   
import generateToken from '../middleware/generatetoken.middleware';
import bcrypt from 'bcryptjs';


const logger = getLogger();   
const UserController = {  

    // Get all the users  
    async getUsers(req: Request, res: Response) {
        if (res.locals.user.isAdmin === false) {
            logger.error('Unauthorized access');
            return res.send({ message: 'Unauthorized access' }).status(403);
        }
        const users = await UserModel.findAll();
        logger.info('Getting all the users');
        res.json(users);
    },   

    async login(req: Request, res: Response) {
        const salt:any = process.env.SALT || 10;
        const { username, password } = req.body;
        if (!username || !password) {
            logger.error('Invalid credentials');
            return res.sendStatus(401);
        }
        const cryptedPassword = await bcrypt.hash(password, salt);
        const user = await UserModel.findOne({
            where: {
                [Op.and]: [{ username }, { password: cryptedPassword}]
            }
        });
        if (!user) {
            logger.error('Invalid credentials');
            return res.sendStatus(401);
        }
        const token  = generateToken(user.id, user.isAdmin);
        res.json({ token ,  user });
    },

    
    async getUser(req: Request, res: Response) {
       
        const { id } = req.params;
        const user = await UserModel.findByPk(id);
        logger.info(`Getting the user with id ${id}`);
        if (!user){
            logger.error(`User with id ${id} not found`);
            return res.sendStatus(404);
        }
        res.json(user);
    },  
    async createUser(req: Request, res: Response) {
        try {
            const user = await UserModel.create(req.body);
            logger.info('Creating a new user');
            res.json(user);
        } catch (error) {
            logger.error('Error while creating a new user');
            return res.sendStatus(500);
        }
    },

    async updateUser(req: Request, res: Response) {
        try{
            // Checking if user exists
            const user  =  await  UserModel.findByPk(req.params.id);
            if (!user){
                logger.error(`User with id ${req.params.id} not found`);
                return res.sendStatus(404);
            }

            // Ensuring user name to be unique
            if (req.body.username != user.username) {
                const existingUser = await UserModel.findOne({where: {username: req.body.username}});
                if (existingUser) {
                    logger.error(`User with name ${req.body.username} already exists`);
                    return res.status(400).json({error: `User with name ${req.body.username} already exists`});
                }
            }

            try{
                await user.update(req.body);
            } catch (error) {
                logger.error('Error while updating the user');
                return res.sendStatus(500);
            }

            logger.info(`Updating the user with id ${req.params.id}`);
            return res.json({ user , token: generateToken(user.id, user.isAdmin) }).status(200)
        }
        catch (error) {
            logger.error('Error while updating the user');
            return res.sendStatus(500);
        }

    },

    async deleteUser(req: Request, res: Response) {
        try{
            const user = await UserModel.findByPk(req.params.id);
            if (!user){
                logger.error(`User with id ${req.params.id} not found`);
                return res.sendStatus(404);
            }
            await user.destroy();
            logger.info(`Deleting the user with id ${req.params.id}`);
            return res.sendStatus(204);
        }
        catch (error) {
            console.log(error);
            logger.error('Error while deleting the user');
            return res.sendStatus(500);
        }
    }

};


export default UserController;