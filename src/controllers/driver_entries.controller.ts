import DriverEntries from '../models/driver_entries.model';
import getLogger from '../utils/logger';
import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Customer from '../models/customer.model';
import jsonToExcel from '../Services/Excel';
import Route from '../models/routes.model';
import { GenerateIndividualReportInput, generateIndividualReport, generateReport } from '../utils/driver';
import Logs from '../models/logs.model';
const logger = getLogger();
const DriverEntriesController = {
	async getDriverEntries(req: Request, res: Response) {

		const { route, customer, driver, start, end, sort } = req.query as { route: string, customer: string, driver: string, start: string, end: string, sort: 'bottle_received' | 'bottle_delivered' | 'createdAt' };

		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 50;
		const driverEntries = await generateIndividualReport({ startDate: start, endDate: end, customerName: customer, driverName: driver, routeId: route, isPaginated: true, page, limit, sortBy: sort }) as any;
		logger.info('Getting all the driver entries');
		res.json({
			entries: driverEntries.rows,
			total: driverEntries.count,
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
			res.json(driverEntries);
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
			const report = Object.values(await generateIndividualReport({ startDate, endDate, customerName, driverName, routeId, sortBy }));
			const fileUrl = await jsonToExcel(report);

			await Logs.create({
				user_id: res.locals.user.id,
				action: 'download',
				module: 'driver_entries',
				message: `Exported individual report from ${startDate} to ${endDate}`,
			});

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
					};
				},
			);

			await Logs.create({
				user_id: res.locals.user.id,
				action: 'download',
				module: 'driver_entries',
				message: `Exported cumulative report from ${start} to ${end}`,
			});
			const fileUrl = await jsonToExcel(report);
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
};

export default DriverEntriesController;
