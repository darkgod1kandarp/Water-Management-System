import { Op, Order } from "sequelize";
import Customers from "../models/customer.model";
import User from "../models/user.model";
import Route from "../models/routes.model";
import DriverEntries from '../models/driver_entries.model';

export interface GenerateIndividualReportInput {
	startDate?: string;
	endDate?: string;
	customerName?: string;
	driverName?: string;
	routeId?: string;
	isPaginated?: boolean;
	sortBy?: string;
}

export interface PaginatedGenerateIndividualReportInput extends GenerateIndividualReportInput {
	isPaginated: true;
	page?: number;
	limit?: number;
}
export const generateIndividualReport = async (options: GenerateIndividualReportInput | PaginatedGenerateIndividualReportInput) => {
	const { startDate, endDate, customerName, driverName, isPaginated, sortBy } = options;
	const where: any = {};
	if (startDate && endDate) {
		where.createdAt = { [ Op.between ]: [ startDate, endDate ] };
	}
	if (customerName) {
		const possibleCustomers = await Customers.findAll({ where: { name: { [ Op.iLike ]: `%${customerName}%` } } });
		where.customer_id = { [ Op.in ]: possibleCustomers.map((customer) => customer.id) };
	}
	if (driverName) {
		const possibleDrivers = await User.findAll({ where: { name: { [ Op.iLike ]: `%${driverName}%` } } });
		where.driver_id = { [ Op.in ]: possibleDrivers.map((driver) => driver.id) };
	}
	const queryOptions = {
		where,
		include: [
			{
				model: Customers,
				as: 'customer',
				include: [ { model: Route, as: 'route' } ],
			},
			{
				model: User,
				as: 'driver',
				
			}
		],
		order: [ [ sortBy, 'DESC' ] ] as Order,
	};
	if (isPaginated) {
		let { page, limit } = options as PaginatedGenerateIndividualReportInput;
		page = page || 1;
		limit = limit || 50;
		return await DriverEntries.findAndCountAll({ ...queryOptions, offset: (page - 1) * limit, limit });
	}
	return await DriverEntries.findAll(queryOptions);

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

export const generateReport = async (startDate: String, endDate: String) => {
	const customer_bottle_tally: CustomerBottleTally = {};
	const customerDeliveresAndRecieved: CustomerDeliveresAndRecieved = {};
	const start = new Date(
		Number(startDate.split('-')[ 0 ]),
		Number(startDate.split('-')[ 1 ]) - 1,
		Number(startDate.split('-')[ 2 ]),
	).setUTCHours(0, 0, 0);
	const end = new Date(
		Number(endDate.split('-')[ 0 ]),
		Number(endDate.split('-')[ 1 ]) - 1,
		Number(endDate.split('-')[ 2 ]),
	).setUTCHours(23, 59, 59);
	const driverEntries = await DriverEntries.findAll({
		where: { createdAt: { [ Op.between ]: [ start, end ] } },
		include: [
			{
				model: Customers,
				as: 'customer',
				include: [ { model: Route, as: 'route' } ],
			},
		],
		order: [ [ 'createdAt', 'DESC' ] ],
	});
	for (const entry of driverEntries) {
		if (customerDeliveresAndRecieved[ entry.customer_id ]) {
			customerDeliveresAndRecieved[ entry.customer_id ].bottle_delivered +=
				entry.bottle_delivered;
			customerDeliveresAndRecieved[ entry.customer_id ].bottle_received +=
				entry.bottle_received;
		} else {
			customerDeliveresAndRecieved[ entry.customer_id ] = {
				bottle_delivered: entry.bottle_delivered,
				bottle_received: entry.bottle_received,
			};
		}
		if (customer_bottle_tally[ entry.customer_id ]) {
			continue;
		}
		customer_bottle_tally[ entry.customer_id ] = {
			customer_name: entry.customer.name,
			bottle_tally: entry.bottle_tally,
			route: entry.customer.route.route_name,
			address: entry.customer.address,
			bottle_delivered: 0,
			bottle_received: 0,
		};
	}
	for (const [
		customerId,
		{ bottle_delivered, bottle_received },
	] of Object.entries(customerDeliveresAndRecieved)) {
		if (customer_bottle_tally[ customerId ]) {
			customer_bottle_tally[ customerId ].bottle_delivered = bottle_delivered;
			customer_bottle_tally[ customerId ].bottle_received = bottle_received;
		}
	}
	return customer_bottle_tally;
};