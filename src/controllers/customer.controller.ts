import { Request, Response } from 'express';   
import { Op } from 'sequelize';

// Importing the models
import Customer  from '../models/customer.model';  
import Routes from '../models/routes.model'; 

// Importing the logger
import getLogger from '../utils/logger';

const logger = getLogger();

const  CustomerController = {

    // Get all the customers
    async getCustomers(req: Request, res: Response) {
        
        const page =  parseInt(req.query.page as string) || 1;   
        const limit = parseInt(req.query.limit as string) || 10;
        const customers = await Customer.findAll({include: [{model:Routes, as:'route'}], offset: (page - 1) * limit, limit: limit,order:[['createdAt','DESC']]});
        logger.info('Getting all the customers');
        res.json(customers);
    },

    // Get the customer details by id
    async getCustomer(req: Request, res: Response) {
        const { id } = req.params;
        const customer = await Customer.findByPk(id);
        logger.info(`Getting the customer with id ${id}`);
        if (!customer){
            logger.error(`Customer with id ${id} not found`);
            return res.sendStatus(404);
        } 
        res.json(customer);
    },

    // Create the customer details
    async createCustomer(req: Request, res: Response) {
        // Ensuring customer name to be unique
        try {
            const customer = await Customer.create(req.body);
            logger.info('Creating a new customer');
            return res.json(customer);
        } catch (error:any)
        {
            logger.error('Error while creating a new customer',error);
            return res.send(500).json({error:error.message})
        }

    },

    // Update the customer details 
    async updateCustomer(req: Request, res: Response) {
        const { id } = req.params;
        // Checking if customer exists
        const customer = await Customer.findByPk(id);
        if (!customer) {
            logger.error(`Customer with id ${id} not found`);
            return res.sendStatus(404);
        }

        // Ensuring customer name to be unique
        if (req.body.name != customer.name) {
            const existingCustomer = await Customer.findOne({where: {name: req.body.name}});
            if (existingCustomer) {
                logger.error(`Customer with name ${req.body.name} already exists`);
                return res.status(400).json({error: `Customer with name ${req.body.name} already exists`});
            }
        }

        // Updating the customer details
        logger.info(`Updating the customer with id ${id}`);
        try{
            customer.update(req.body);
            res.json(customer);
        }
        catch (error) {
            logger.error('Error while updating the customer');
            return res.sendStatus(500);
        }


    },

    // Delete the customer details
    async deleteCustomer(req: Request, res: Response) {
        const { id } = req.params;
        const customer = await Customer.findByPk(id);
        if (!customer) {
            logger.error(`Customer with id ${id} not found`);
            return res.sendStatus(404);
        }

        try {
            customer.destroy();
            res.json(customer);
        } catch (error) {
            logger.error('Error while deleting the customer');
            return res.sendStatus(500);
        }
    },

    // Search for a customer by name  while creating table using customer 
    async searchCustomer(req: Request, res: Response) {  
        const { name } = req.params;
        // It will find like name wise query on the customer table    
        const customer = await Customer.findAll({
            where: {
                // Represents th op.like query  here op.Like stands for operation like
                name: {
                    [Op.like]: `%${name}%`
                }
            },
        });
        res.json(customer);
    },
    

    // Find the customer using route
    async findCustomerUsingRoute(req: Request, res: Response) {
        const { id } = req.params;
        const route = await Routes.findByPk(id);  
        if (!route) return res.sendStatus(404);   
        const customers = await Customer.findAll({
            where: {
                route_id: route.id
            }
        });

        if (!customers) {
            logger.error(`Customers with route id ${id} not found`);
            return res.sendStatus(404);
        }

        res.json(customers); 
    }   

};

export default CustomerController;


    