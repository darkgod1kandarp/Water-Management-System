import DriverEntries from '../models/driver_entries.model';
import getLogger from '../utils/logger';
import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Customer from '../models/customer.model';
import Route from '../models/routes.model';
import { GenerateIndividualReportInput, generateIndividualReport, generateReport } from '../utils/driver';
import Logs from '../models/logs.model';
import {jsonToCummulativeExcel, jsonToIndividualExcel} from '../Services/Excel';
const logger = getLogger();
const DriverEntriesController = {

	async getDriverEntries(req: Request, res: Response) {

		const { route, customer, driver, start, end, sort } = req.query as { route: string, customer: string, driver: string, start: string, end: string, sort: 'bottle_received' | 'bottle_delivered' | 'createdAt' };
	
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 50;
		const driverEntries = await generateIndividualReport({ startDate: start, endDate: end, customerName: customer, driverName: driver, routeId: route, isPaginated: true, page, limit, sortBy: sort || 'createdAt' }) as any;
		logger.info('Getting all the driver entries');
		res.json({
			rows: driverEntries.rows,
			count: driverEntries.count,
			page: page,
			pages: Math.ceil(driverEntries.count / limit),
		});
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
			console.log(driverEntry);
			logger.info('Creating a new driver entry');
			await Logs.create({
				user_id: res.locals.user.id,
				action: 'create',
				module: 'driver_entries',
				message: `Created driver entry with id ${driverEntry.id}`,
			})
			console.log('Donnnnnnn');
			return res.json(driverEntry);
		} catch (error) {
			console.log(error);
			logger.error('Error while creating a new driver entry');
			// return res.send(500).json({ error });
		}
	},

	async getDriverHistory(req: Request, res: Response) {
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;
		try {
			const { id } = req.params;
			const driverEntries = await DriverEntries.findAndCountAll({
				where: { driver_id: id },
				include: [
					{
						model: Customer,
						as: 'customer',
						include: [ { model: Route, as: 'route' } ],
					},
				],
				offset: (page - 1) * limit,
				limit: limit,
			});
			logger.info(`Getting the driver history with id ${id}`);
			return res.json(driverEntries);
		} catch (error) {
			console.log(error);
			logger.error('Error while getting the driver history');
			return res.sendStatus(500);
		}
	},

	async getCumulativeEntries(req: Request, res: Response) {
		let { start, end } = req.query as { start: string; end: string };
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
	async generateIndividualExcel(req: Request, res: Response) {
		const { startDate, endDate, customerName, driverName, routeId, sortBy } = req.query as GenerateIndividualReportInput;
		const host_url = `${req.protocol}://${req.get('host')}`;
		try {
			const report = Object.values(await generateIndividualReport({ startDate, endDate, customerName, driverName, routeId, sortBy })).map(
				(entry) => {
					return {
						'Customer Name': entry.customer.name,
						'Driver': entry.driver.username,
						'Address': entry.customer.address,
						'Route': entry.customer.route.route_name,
						'Bottle Delivered': entry.bottle_delivered,
						'Bottle Received': entry.bottle_received,
						'Date': entry.createdAt,
						'Bottle Tally': entry.bottle_tally,
						'Per Bottle Charge': entry.customer.bottle_charge,
						'Mode of Payment': entry.mode_of_payment,
						'Amount': entry.bottle_delivered * entry.customer.bottle_charge,
					};
				},
			);
			const fileUrl = await jsonToIndividualExcel(report);

			await Logs.create({
				user_id: res.locals.user.id,
				action: 'download',
				module: 'driver_entries',
				message: `Exported individual report from ${startDate} to ${endDate}`,
			});

			res.json({ fileUrl: `${host_url}/${fileUrl}` });
		} catch (error: any) {
			logger.error('Error while generating report');
			console.log(error);
			if (
				error!.message === 'Timerange not provided' ||
				error!.message === 'Invalid timerange'
			) {
				return res.sendStatus(400);
			}
			return res.sendStatus(500);
		}
	},

	async generateCumulativeExcel(req: Request, res: Response) {
		let { start, end } = req.query as { start: string; end: string };
		const host_url = `${req.protocol}://${req.get('host')}`;
		try {
			const report = Object.values(await generateReport(start, end)).map(
				(customer) => {
					return {
						'Customer Name': customer.customer_name,
						'Bottle Tally': customer.bottle_tally,
						Route: customer.route,
						Address: customer.address,
						'Bottle Delivered': customer.bottle_delivered,
						'Bottle Received': customer.bottle_received,
						'Per Bottle Charge': customer.bottle_charge,
						'Revenue': customer.bottle_delivered * customer.bottle_charge,
					};
				},
			);

			await Logs.create({
				user_id: res.locals.user.id,
				action: 'download',
				module: 'driver_entries',
				message: `Exported cumulative report from ${start} to ${end}`,
			});
			const fileUrl = await jsonToCummulativeExcel(report);
			res.json({ fileUrl: `${host_url}/${fileUrl}` });
		} catch (error: any) {
			logger.error('Error while generating report');
			if (
				error!.message === 'Timerange not provided' ||
				error!.message === 'Invalid timerange'
			) {
				return res.sendStatus(400);
			}
			return res.sendStatus(500);
		}
	},

	async deleteDriverEntries(req: Request, res: Response) {
		try {
			const { id:driverEntryId } = req.params;
	
			// Find the driver entry
			const driverEntry = await DriverEntries.findByPk(driverEntryId);
			if (!driverEntry) {
				logger.error(`Driver entry with ID ${driverEntryId} not found`);
				return res.status(404).json({ message: "Driver entry not found" });
			}
	
			// Find the associated customer
			const customer = await Customer.findByPk(driverEntry.customer_id);
			if (!customer) {
				logger.error(`Customer with ID ${driverEntry.customer_id} not found`);
				return res.status(404).json({ message: "Associated customer not found" });
			}
	
			// Adjust the customer's bottle tally before deleting the entry
			customer.bottle_tally -= (driverEntry.bottle_received - driverEntry.bottle_delivered);
			await customer.save(); // Save the updated tally
	
			// Delete the driver entry
			await driverEntry.destroy();
	
			// Log the delete action
			await Logs.create({
				user_id: res.locals.user.id,
				action: 'delete',
				module: 'driver_entries',
				message: `Deleted driver entry (ID: ${driverEntryId}) for customer ID ${driverEntry.customer_id}`,
			});
	
			logger.info(`Deleted driver entry with ID: ${driverEntryId}`);
			return res.status(200).json({ message: "Driver entry deleted successfully" });
	
		} catch (err) {
			console.error(err);
			logger.error("Error while deleting driver entry");
			return res.status(500).json({ error: "Internal Server Error" });
		}
	},
	
	async updateDriverEntries(req: Request, res: Response) {
		try {
			const { customerId } = req.params; // Assuming customerId is passed in the request params
	
			// Find the latest entry for this customer
			const latestEntry = await DriverEntries.findOne({
				where: { customer_id: customerId },
				order: [['createdAt', 'DESC']], // Get the most recent entry
			});
	
			if (!latestEntry) {
				logger.error(`No entries found for customer with ID ${customerId}`);
				return res.status(404).json({ message: 'No entries found for this customer' });
			}
	
			// Ensure that the request does not attempt to update multiple entries
			if (await DriverEntries.count({ where: { customer_id: customerId } }) > 1) {
				const newestEntryId = latestEntry.id;
				const modifyingEntryId = req.body.id; // Assuming the frontend sends an ID
	
				if (modifyingEntryId && modifyingEntryId !== newestEntryId) {
					logger.error(`Attempt to update an older entry (ID: ${modifyingEntryId}) for customer ID ${customerId}`);
					return res.status(403).json({ message: 'You can only modify the latest entry for this customer' });
				}
			}
	
			const customer = await Customer.findByPk(customerId); 
			// Get older bottle tally of customer   
			customer.bottle_tally += (latestEntry.bottle_received - latestEntry.bottle_delivered)
			// Update only the latest entry
			await latestEntry.update(req.body);
			// Update the customer tall with new one entry
			customer.bottle_tally += (latestEntry.bottle_delivered - latestEntry.bottle_received)
			// Save the updated customer bottle tally
			await customer.save();
		
			logger.info(`Updated the latest driver entry for customer ID ${customerId}, Entry ID: ${latestEntry.id}`);
	
			// Log the update action
			await Logs.create({
				user_id: res.locals.user.id,
				action: 'update',
				module: 'driver_entries',
				message: `Updated the latest driver entry (ID: ${latestEntry.id}) for customer ID ${customerId}`,
			});
	
			return res.status(400).json(latestEntry);
		} catch (error) {
			logger.error('Error while updating the latest driver entry');
			return res.status(500).json({ error: 'Internal Server Error' });
		}
	}
	
	
};

export default DriverEntriesController;
