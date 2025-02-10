import { Request, Response } from 'express';
import { Op } from 'sequelize';

// Importing the models
import Customer from '../models/customer.model';
import Routes from '../models/routes.model';

// Importing the logger
import getLogger from '../utils/logger';
import Logs from '../models/logs.model';

const logger = getLogger();

const CustomerController = {
	// Get all the customers
	async getCustomers(req: Request, res: Response) {
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;
		const search = req.query.search as string;
		const route_id = req.query.route_id as string;

		// Build where clause based on filters
		const whereClause: any = {};

		if (search) {
			whereClause.name = {
				[ Op.like ]: `%${search}%`
			};
		}

		if (route_id) {
			whereClause.route_id = route_id;
		}

		const customers = await Customer.findAll({
			where: whereClause,
			include: [ { model: Routes, as: 'route' } ],
			offset: (page - 1) * limit,
			limit: limit,
			order: [ [ 'createdAt', 'DESC' ] ],
		});

		logger.info('Getting all the customers with filters');
		res.json(customers);
	},

	// Get the customer details by id
	async getCustomer(req: Request, res: Response) {
		const { id } = req.params;
		const customer = await Customer.findByPk(id);
		logger.info(`Getting the customer with id ${id}`);
		if (!customer) {
			logger.error(`Customer with id ${id} not found`);
			return res.sendStatus(404);
		}
		res.json(customer);
	},

	// Create the customer details
	async createCustomer(req: Request, res: Response) {
		// Ensuring customer name to be unique
		try {
			console.log('Creating a new customer');
			const customer = await Customer.create(req.body);
			console.log('Customer Created');
			await Logs.create({
				user_id: res.locals.user.id,
				action: 'create',
				module: 'customer',
				message: `Created customer with id ${customer.id}`,
			});
			logger.info('Creating a new customer');
			return res.json(customer);
		} catch (error: any) {
			if (error.name === 'SequelizeUniqueConstraintError') {
				logger.error('Error while creating a new customer', error);
				return res
					.status(400)
					.json({ error: 'Customer with name already exists' });
			}
			logger.error('Error while creating a new customer', error);
			return res.sendStatus(500).json({ error: error.message });
		}
	},

	// Update the customer details
	async updateCustomer(req: Request, res: Response) {
		const { id } = req.params;
		// Checking if customer exists
		const customer = await Customer.findByPk(id);
		console.log(req.body);
		if (!customer) {
			logger.error(`Customer with id ${id} not found`);
			return res.sendStatus(404);
		}

		// Ensuring customer name to be unique
		if (req.body.name != customer.name) {
			const existingCustomer = await Customer.findOne({
				where: { name: req.body.name },
			});
			if (existingCustomer) {
				logger.error(`Customer with name ${req.body.name} already exists`);
				return res
					.status(400)
					.json({
						error: `Customer with name ${req.body.name} already exists`,
					});
			}
		}

		// Updating the customer details
		logger.info(`Updating the customer with id ${id}`);
		try {
			await Logs.create({
				user_id: res.locals.user.id,
				action: 'update',
				module: 'customer',
				message: `Updated customer with id ${customer.id} Old name ${customer.name} New name ${req.body.name}, Old address ${customer.address} New address ${req.body.address}, Old bottle_tally ${customer.bottle_tally},  New bottle_tally ${req.body.bottle_tally}, Old route_id ${customer.route_id} New route_id ${req.body.route_id},Old bottle_charge ${customer.bottle_charge} New bottle_charge ${req.body.bottle_charge} `,
			});
			customer.update(req.body);
			res.json(customer);
		} catch (error) {
			console.log(error);
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
		await Logs.create({
			user_id: res.locals.user.id,
			action: 'delete',
			module: 'customer',
			message: `Deleted customer with id ${customer.id}`,
		});
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
		const { page = 1, limit = 10 } = req.query;
		// It will find like name wise query on the customer table
		const customer = await Customer.findAll({
			include: [ { model: Routes, as: 'route' } ],
			offset: (parseInt(page as string) - 1) * parseInt(limit as string),
			limit: parseInt(limit as string),

			where: {
				// Represents th op.like query  here op.Like stands for operation like
				name: {
					[ Op.like ]: `%${name}%`,
				},
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
				route_id: route.id,
			},
		});

		if (!customers) {
			logger.error(`Customers with route id ${id} not found`);
			return res.sendStatus(404);
		}

		res.json(customers);
	},


	// Check for initial Data updating for customer side 
	async updateInitialData(req: Request, res: Response) {
		const { id } = req.params;
		// Checking if customer exists
		const customer = await Customer.findByPk(id);
		if (!customer) {
			logger.error(`Customer with id ${id} not found`);
			return res.sendStatus(404);
		}

		if (customer.bottle_count_updated) {
			logger.error(`Customer with id ${id} has been already updated its initial data.`)
			return res.status(404);
		}

		try {
			// Two field required number of bottle, bottle_count_updated, total_count_of_cupon
			await customer.update(req.body);
			// Creating Logs for the table to check when does number of bottles count got updated.
			await Logs.create({
				user_id: res.locals.user.id,
				action: 'update',
				module: 'customer',
				message: `Updated customers one time freeze data for collecting initial data for total count of bottled and cupon available with customers. `,
			});

			return res.status(200).json(customer);
		}catch (error) {
			logger.error('Error while deleting the customer');

			return res.sendStatus(500);
		}
	}
};

export default CustomerController;
