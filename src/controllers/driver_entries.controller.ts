import DriverEntries  from "../models/driver_entries.model";   
import getLogger from '../utils/logger';   
import { Request, Response } from 'express';  
import { Op } from 'sequelize';   

const logger = getLogger();   
const DriverEntriesController = {  

    async getDriverEntries(req: Request, res: Response) {
        const driverEntries = await DriverEntries.findAll();
        logger.info('Getting all the driver entries');
        res.json(driverEntries);
    },   

    async getDriverEntry(req: Request, res: Response) {
        const { id } = req.params;
        const driverEntry = await DriverEntries.findByPk(id);
        logger.info(`Getting the driver entry with id ${id}`);
        if (!driverEntry){
            logger.error(`Driver entry with id ${id} not found`);
            return res.sendStatus(404);
        }
        res.json(driverEntry);
    },  

    async createDriverEntry(req: Request, res: Response) {
        try {
            const driverEntry = await DriverEntries.create(req.body);
            logger.info('Creating a new driver entry');
            res.json(driverEntry);
        } catch (error) {
            logger.error('Error while creating a new driver entry');
            return res.sendStatus(500);
        }
    },

    async getDriverHistory(req: Request, res: Response) {
        try{
            const { id } = req.params;
            const driverEntries = await DriverEntries.findAll({where: {driver_id: id}});
            logger.info(`Getting the driver history with id ${id}`);
            res.json(driverEntries);
        } catch(error){
            console.log(error);
            logger.error('Error while getting the driver history');
            return res.sendStatus(500);
        }
    }
};

export default DriverEntriesController;  
