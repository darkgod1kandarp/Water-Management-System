const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

const existingNames = new Set();

const dbConnection = async (testEnv) => {
	const config = {
		username: 'postgres',
		password: 'postgres',
		database: 'water_management',
		host: '127.0.0.1',
		dialect: 'postgres',
		port: 5432,
	};
	

	try {
		const sequelize = new Sequelize(
			config.database,
			config.username,
			config.password,
			{
				host: config.host,
				port: config.port,
				dialect: 'postgres',
			},
		);
		await sequelize.authenticate();
		return sequelize;
	} catch (error) {
		console.error('Error: Could not connect to PostgreSQL database:', error);
		process.exit(1);
	}
};

const generateSlug = (words) => {
	const adjectives = [
		'happy',
		'clever',
		'bright',
		'swift',
		'quiet',
		'wise',
		'brave',
		'calm',
	];
	const nouns = [
		'tiger',
		'eagle',
		'wolf',
		'bear',
		'lion',
		'hawk',
		'deer',
		'fox',
	];

	let name;
	do {
		const parts = [];
		for (let i = 0; i < words; i++) {
			parts.push(
				i % 2 === 0
					? adjectives[Math.floor(Math.random() * adjectives.length)]
					: nouns[Math.floor(Math.random() * nouns.length)],
			);
		}
		name = parts.join('-');
	} while (existingNames.has(name));

	existingNames.add(name);
	return name;
};

const fillingUserTable = async (sequelize) => {
	const salt = '$2a$10$Ur4McDr64HYDC1SL5XKpSu';
	const password = bcrypt.hashSync('1234', salt);
	const name = generateSlug(2);
	const role = ['driver', 'admin', 'sales'][Math.floor(Math.random() * 3)];

	await sequelize.query(
		'INSERT INTO users (username, password, "role", "isNew", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?)',
		{
			replacements: [name, password, role, true, new Date(), new Date()],
		},
	);
};

const fillingRouteTable = async (sequelize) => {
	const name = generateSlug(3);
	await sequelize.query(
		'INSERT INTO routes (route_name, "createdAt", "updatedAt") VALUES (?, ?, ?)',
		{
			replacements: [name, new Date(), new Date()],
		},
	);
};

const fillingCustomerTable = async (sequelize) => {
	const name = generateSlug(3);
	const address = generateSlug(4);
	const bottleCharge = Math.floor(Math.random() * 10) + 1;

	const [routes] = await sequelize.query('SELECT id FROM routes');
	const routeId = routes[Math.floor(Math.random() * routes.length)].id;

	await sequelize.query(
		'INSERT INTO customers (name, route_id, bottle_tally, address, bottle_charge, "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?)',
		{
			replacements: [
				name,
				routeId,
				1,
				address,
				bottleCharge,
				new Date(),
				new Date(),
			],
		},
	);
};

const fillingTruckTable = async (sequelize) => {
	await sequelize.query(
		'INSERT INTO trucks (truck_no, "createdAt", "updatedAt") VALUES (?, ?, ?)',
		{
			replacements: [generateSlug(3), new Date(), new Date()],
		},
	);
};

const fillingDriverEntries = async (sequelize) => {
	const [customers] = await sequelize.query('SELECT id FROM customers');
	const [trucks] = await sequelize.query('SELECT id FROM trucks');
	const [drivers] = await sequelize.query(
		'SELECT id FROM users WHERE role = ?',
		{
			replacements: ['driver'],
		},
	);

	const customerId = customers[Math.floor(Math.random() * customers.length)].id;
	const truckId = trucks[Math.floor(Math.random() * trucks.length)].id;
	const driverId = drivers[Math.floor(Math.random() * drivers.length)].id;

	const createdAt = moment()
		.subtract(Math.floor(Math.random() * 30) + 1, 'days')
		.toDate();

	await sequelize.query(
		'INSERT INTO driver_entries (customer_id, bottle_delivered, bottle_received, bottle_tally, truck_no, driver_id, "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
		{
			replacements: [
				customerId,
				1,
				1,
				1,
				truckId,
				driverId,
				createdAt,
				createdAt,
			],
		},
	);
};

const main = async () => {
    const args = process.argv.slice(2);
    const testEnv = args.includes('--test_env')
        ? args[args.indexOf('--test_env') + 1]
        : 'testing';
    const noOfEntries = args.includes('--no_of_entries')
        ? parseInt(args[args.indexOf('--no_of_entries') + 1])
        : 10;

    const sequelize = await dbConnection(testEnv);

    // First create some drivers
    for (let i = 0; i < Math.max(3, Math.floor(noOfEntries / 3)); i++) {
        await sequelize.query(
            'INSERT INTO users (username, password, "role", "isNew", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?)',
            {
                replacements: [
                    generateSlug(2),
                    bcrypt.hashSync('user_password', '$2a$10$Ur4McDr64HYDC1SL5XKpSu'),
                    'driver',
                    true,
                    new Date(),
                    new Date()
                ],
            }
        );
    }

    // Then create the rest of the data
    for (let i = 0; i < noOfEntries; i++) {
        await fillingUserTable(sequelize);
        await fillingRouteTable(sequelize);
        await fillingCustomerTable(sequelize);
        await fillingTruckTable(sequelize);
        await fillingDriverEntries(sequelize);
    }

    await sequelize.close();
};

if (require.main === module) {
	main().catch(console.error);
}
