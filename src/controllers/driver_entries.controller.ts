import DriverEntries from "../models/driver_entries.model";
import getLogger from '../utils/logger';
import  { Request, Response } from 'express';
import { Op } from 'sequelize';
import Customer from '../models/customer.model';
import jsonToExcel from "../Services/Excel";
import Route from "../models/routes.model";


const generateReport = async (startDate:String, endDate:String) => {

    const customer_bottle_tally: CustomerBottleTally = {};
    const customerDeliveresAndRecieved: CustomerDeliveresAndRecieved = {};
    const start = new Date(Number(startDate.split('-')[0]), Number(startDate.split('-')[1]) - 1, Number(startDate.split('-')[2])).setUTCHours(0, 0, 0);
    const end = new Date(Number(endDate.split('-')[0]), Number(endDate.split('-')[1]) - 1, Number(endDate.split('-')[2])).setUTCHours(23, 59, 59);
    const driverEntries = await DriverEntries.findAll({ where: { createdAt : { [ Op.between ]: [ start, end ] } }, include: [ { model: Customer, as: 'customer', include: [{model:Route,  as: 'route'}] } ] });
    for (const entry of driverEntries) {
        if (customerDeliveresAndRecieved[ entry.customer_id ]) {
            customerDeliveresAndRecieved[ entry.customer_id ].bottle_delivered += entry.bottle_delivered;
            customerDeliveresAndRecieved[ entry.customer_id ].bottle_received += entry.bottle_received;
        } else {
            customerDeliveresAndRecieved[ entry.customer_id ] = {
                bottle_delivered: entry.bottle_delivered,
                bottle_received: entry.bottle_received
            }
        }
        if (customer_bottle_tally[ entry.customer_id ]) {
            continue
        }
        customer_bottle_tally[ entry.customer_id ] = {
            customer_name: entry.customer.name,
            bottle_tally: entry.bottle_tally,
            route: entry.customer.route.route_name,
            address: entry.customer.address,
            bottle_delivered: 0,
            bottle_received: 0
        }
    }
    for (const [ customerId, { bottle_delivered, bottle_received } ] of Object.entries(customerDeliveresAndRecieved)) {
        if (customer_bottle_tally[ customerId ]) {
            customer_bottle_tally[ customerId ].bottle_delivered = bottle_delivered;
            customer_bottle_tally[ customerId ].bottle_received = bottle_received;
        }
    }
    return customer_bottle_tally;
}


interface CustomerEntry {
    customer_name: string;
    bottle_tally: number; // Assuming bottle_tally is a number, adjust if necessary
    route: string;
    address: string;
    bottle_delivered: number;
    bottle_received: number;
}

interface CustomerBottleTally {
    [ customerId: string ]: CustomerEntry;
}

interface CustomerDeliveresAndRecieved {
    [ customerId: string ]: {
        bottle_delivered: number;
        bottle_received: number;
    };
}

interface Date {
    start: string;
    end: string;
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
        if (!driverEntry) {
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
            return res.send(500).json({ error });
        }
    },

    async getDriverHistory(req: Request, res: Response) {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        try {
            const { id } = req.params;
            const driverEntries = await DriverEntries.findAndCountAll({ where: { driver_id: id }, include: [ { model: Customer, as: 'customer',include: [{model:Route,  as: 'route'}] } ], offset: (page - 1) * limit, limit: limit });
            logger.info(`Getting the driver history with id ${id}`);
            res.json(driverEntries);
        } catch (error) {
            console.log(error);
            logger.error('Error while getting the driver history');
            return res.sendStatus(500);
        }
    },

    // async getDriverEntriesByTimeRange(req: Request, res: Response) {

    //     const { timerange } = req.query;
    //     if (!timerange) {
    //         logger.error('Timerange not provided');
    //         return res.sendStatus(400);
    //     }

    //     let date:Date;
    //     if (timerange === 'prevMonth') {
    //         date = getPreviousMonth();
    //     } else if (timerange === 'prevWeek') {
    //         date = getPreviousWeek();
    //     } else if (timerange === 'startOfWeek') {
    //         date = getStartOfWeek();
    //     } else if (timerange === 'startOfMonth') {
    //         date = getStartOfMonth();
    //         console.log(date);
    //     } else {
    //         logger.error('Invalid timerange');
    //         throw new Error('Invalid timerange');
    //     }
    //     try {
    //         const report = await generateReport(date.start, date.end);
    //         res.json(report);
    //     }
    //     catch (error:any) {
    //         logger.error('Error while generating report');
    //         if (error.message === 'Timerange not provided' || error.message === 'Invalid timerange') { 
    //             return res.sendStatus(400);
    //         }
    //         return res.sendStatus(500);
    //     }
    // },

    async getDriverEntriesByTimePeriod(req: Request, res: Response) {
       
        let {start, end} = req.query as {start: string, end: string};
        console.log(start, end);
        if (!start || !end) {
            logger.error('Start or end date not provided');
            return res.sendStatus(400);
        }
        try {
            const driverEntries = await generateReport(start, end);
            logger.info('Getting all the driver entries by time period');
            res.json(driverEntries);
        } catch (error) {
            console.log(error);
            logger.error('Error while getting the driver entries by time period');
            return res.sendStatus(500);
        }
    },


    async generateExcel(req: Request, res: Response) {
        let {start, end} = req.query as {start: string, end: string};
        const host_url = `${req.protocol}://${req.get('host')}`;
        try {
            const report = Object.values(await generateReport(start, end)).map(customer => {
                return {
                    'Customer Name': customer.customer_name,
                    'Bottle Tally': customer.bottle_tally,
                    'Route': customer.route,
                    'Address': customer.address,
                    'Bottle Delivered': customer.bottle_delivered,
                    'Bottle Received': customer.bottle_received
                }
            });

            console.log(report);
            const fileUrl = await jsonToExcel(report);    
            res.json({ fileUrl: `${host_url}/${fileUrl}` });
        }
        catch (error:any) {
            logger.error('Error while generating report');
            if (error!.message === 'Timerange not provided' || error!.message === 'Invalid timerange') {
                return res.sendStatus(400);
            }
            return res.sendStatus(500);
        }
    }
};

export default DriverEntriesController;  
