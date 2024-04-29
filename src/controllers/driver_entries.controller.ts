import DriverEntries  from "../models/driver_entries.model";   
import getLogger from '../utils/logger';   
import e, { Request, Response } from 'express';  
import { Op } from 'sequelize';   
import Customer from '../models/customer.model';
import {getStartOfWeek , getStartOfMonth, getPreviousMonth, getPreviousWeek} from '../utils/timer';

interface CustomerBottleTally {

    [customerId: string]: {
        customer_name: string;
        bottle_tally: number; // Assuming bottle_tally is a number, adjust if necessary
    }[];
}


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
            console.log(error);
            logger.error('Error while creating a new driver entry');
            return res.sendStatus(500);
        }
    },

    async getDriverHistory(req: Request, res: Response) {
        const page =  parseInt(req.query.page as string) || 1;   
        const limit = parseInt(req.query.limit as string) || 10;
        try{
            const { id } = req.params;
            const driverEntries = await DriverEntries.findAndCountAll({where: {driver_id: id},include: [{model: Customer, as: 'customer'}], offset: (page - 1) * limit, limit: limit});
            logger.info(`Getting the driver history with id ${id}`);
            res.json(driverEntries);
        } catch(error){
            console.log(error);
            logger.error('Error while getting the driver history');
            return res.sendStatus(500);
        }
    }, 

    async getDriverEntriesByTimeRange(req: Request, res: Response) {
        const { timerange } = req.params;
        if (!timerange) {
            logger.error('Timerange not provided');
            return res.sendStatus(400);
        }
        let date;
        if(timerange === 'prevMonth') {
             date = getPreviousMonth();
        } else if(timerange === 'prevWeek') {
            date = getPreviousWeek();
        }else if(timerange === 'startOfWeek') {
            date = getStartOfWeek();
        }else if(timerange === 'startOfMonth') {
            date = getStartOfMonth();
        } else {
            logger.error('Invalid timerange');
            return res.sendStatus(400);
        }
        
        const customer_bottle_tally:CustomerBottleTally = {};
        const startDate = date.start.split("-");
        const start = new Date(Number(startDate[0]), Number(startDate[1]) - 1, Number(startDate[2]));
        const endDate = date.end.split("-");
        const end = new Date(Number(endDate[0]), Number(endDate[1]) - 1, Number(endDate[2]));
        end.setHours(23, 59, 59);
        const driverEntries = await DriverEntries.findAll({where:{created_at: {[Op.between]: [start, end]}},include: [{model: Customer, as: 'customer'}], order: [['created_at', 'DESC']]});
        for(const entry of driverEntries){
            if (!customer_bottle_tally[entry.customer.id]) {
                customer_bottle_tally[entry.customer.id] = [];
            }
            customer_bottle_tally[entry.customer.id] =[...customer_bottle_tally[entry.customer.id],{
                customer_name: entry.customer.name,
                bottle_tally: entry.customer.bottle_tally,
            } ]
        }
        logger.info(`Getting the driver entries within time range ${timerange}`);
        res.json(customer_bottle_tally);
    }
};

export default DriverEntriesController;  
