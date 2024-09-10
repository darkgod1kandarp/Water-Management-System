import Routes from '../models/routes.model';   
import e, { Request, Response } from 'express';   
import { Op } from 'sequelize';   
import getLogger from '../utils/logger';
import Customers from '../models/customer.model';
import Logs from '../models/logs.model';

const logger = getLogger();

const  RoutesController = {

    // Get all the routes
    async getRoutes(req: Request, res: Response) {
        const routes = await Routes.findAll({ order: [ [ 'createdAt', 'DESC' ] ] });
        
        logger.info('Getting all the routes');
        return res.json(routes);
    },

    // Get the route details by id
    async getRoute(req: Request, res: Response) {
        const { id } = req.params;
        const route = await Routes.findByPk(id);
        if (!route){
            logger.error(`Route with id ${id} not found`);
            return res.sendStatus(404);
        }
        logger.info(`Getting the route with id ${id}`);
        return res.json(route);
    },

    // Create the route details
    async createRoute(req: Request, res: Response) {
        try{
            logger.info('Creating a new route');
            const route = await Routes.create(req.body);
            await Logs.create({
                user_id: res.locals.user.id,
                action: 'create',
                module: 'route',
                message: `Created route with id ${route.id}`,
            });
            return res.json(route);
        } catch (error:any) {

            if (error.name === 'SequelizeUniqueConstraintError') {
                logger.error('Error while creating a new route',error);
                return res.status(400).json({error: 'Route name already exists'});
            }

            logger.error('Error while creating a new route',error);
            return res.status(500).json({error: 'Error while creating a new route'});
    }
},

    // Update the route details 
    async updateRoute(req: Request, res: Response) {
        const { id } = req.params;
        const route = await Routes.findByPk(id);
        if (!route){
            logger.error(`Route with id ${id} not found`);
            return res.sendStatus(404) ;
        }
        await Logs.create({
            user_id: res.locals.user.id,
            action: 'update',
            module: 'route',
            message: `Updated route with id ${route.id} New Name: ${req.body.route_name} Old Name: ${route.route_name}`,
        })
        logger.info(`Updating the route with id ${id}`);
        route.update(req.body);
        return res.json(route);
    },

    // Delete the route details   
    async deleteRoute(req: Request, res: Response){
        const { id } = req.params;
        const route = await Routes.findByPk(id);
        const customerExists = await Customers.findOne({where: {route_id: id}});
        if (customerExists){
            logger.error(`Route with id ${id} cannot be deleted as it is associated with a customer`);
            return res.status(400).json({error: 'Route cannot be deleted as it is associated with a customer'});
        }
        if (!route){
            logger.error(`Route with id ${id} not found`);
            return res.sendStatus(404);
        }
        await Logs.create({
            user_id: res.locals.user.id,
            action: 'delete',
            module: 'route',
            message: `Deleted route with id ${route.id}`,
        });
        route.destroy();
        res.json(route);
    },

    // Search for a route by name  while creating table using routes 
    async searchRoute(req: Request, res: Response) {  
        console.log(req.params);
        const { name } = req.params;
        if (!name) {
            logger.error('Invalid search query');
            return res.sendStatus(400);
        }

        logger.info(`Searching for route with name ${name}`);

        // It will find like name wise query on the routes table    
        const route = await Routes.findAll({
            where: {
                // Represents th op.like query  here op.Like stands for operation like
                route_name: {
                    [Op.like]: `%${name}%`
                }
            },
        });

        return res.json(route);
    },

};

export default RoutesController;
  