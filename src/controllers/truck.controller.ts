import  { Request, Response } from 'express';   
import { Op } from 'sequelize';   

// Importing the models   
import Truck   from '../models/trucks.model';         

// Importing the logger
import getLogger from '../utils/logger';

const logger = getLogger();  

const TruckController = {   

    // Get all the trucks 
    async getTrucks(req: Request, res: Response) {
        const trucks = await Truck.findAll({order:[['createdAt','DESC']]});
        logger.info('Getting all the trucks');
        return res.json(trucks);
    },

    // Get the truck details by id  
    async getTruck(req: Request, res: Response) {
        const { id } = req.params;
        const truck = await Truck.findByPk(id);
        logger.info(`Getting the truck with id ${id}`);
        if (!truck){
            logger.error(`Truck with id ${id} not found`);
            return res.sendStatus(404);
        }
        return res.json(truck);
    },

    // Create the truck details
    async createTruck(req: Request, res: Response) {  
        try {
            const truck = await Truck.create(req.body);
            logger.info('Creating a new truck');
            res.json(truck);
        } catch (error: any) {
            console.log(error);
            logger.error('Error while creating a new truck');
            return res.status(500).json({error: error.message});
        }
    },

    // Update the truck details
    async updateTruck(req: Request, res: Response) {
        const { id } = req.params;

        // Checking if truck exists
        const truck = await Truck.findByPk(id);
        if (!truck) {
            logger.error(`Truck with id ${id} not found`);
            return res.sendStatus(404);
        }

        // Ensuring truck name to be unique
        if (req.body.truck_no != truck.truck_no) {
            const existingTruck = await Truck.findOne({where: {truck_no: req.body.truck_no}});
            if (existingTruck) {
                logger.error(`Truck with name ${req.body.truck_no} already exists`);
                return res.status(400).json({error: `Truck with name ${req.body.truck_no} already exists`});
            }
        }

        // Updating the truck details
        try{
            truck.update(req.body);
            res.json(truck);
        } catch (error) {
            logger.error('Error while updating the truck');
            return res.sendStatus(500);
        }
    },

    // Delete the truck details
    async deleteTruck(req: Request, res: Response){
        const { id } = req.params;
        const truck = await Truck.findByPk(id);
        if (!truck){
            logger.error(`Truck with id ${id} not found`);
            return res.sendStatus(404);
        }
        truck.destroy();
        res.json(truck);
    },

    async getTruckBySimilarName(req: Request, res: Response) {
        const { name } = req.params;
        const trucks = await Truck.findAll({
            where: {
                truck_no: {
                    [Op.like]: `%${name}%`
                }
            }
        });
        logger.info(`Getting the trucks with similar name to ${name}`);
        return res.json(trucks);
    }

};

export default TruckController;
