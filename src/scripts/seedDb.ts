import { sequelize } from '../utils/sequelize';
import User from '../models/user.model';
import Route from '../models/routes.model';
import Truck from '../models/trucks.model';
import Customer from '../models/customer.model';
import getLogger from '../utils/logger';

const logger = getLogger();

async function seedDatabase() {
    try {
        // Create admin user
        await User.create({
            username: 'admin',
            password: 'admin123',
            role: 'admin',
            isNew: false
        });

        // Create sample driver
        await User.create({
            username: 'driver1',
            password: 'driver123',
            role: 'driver',
            isNew: true
        });

        // Create sample routes
        const route1 = await Route.create({
            route_name: 'Route A'
        });

        const route2 = await Route.create({
            route_name: 'Route B'
        });

        // Create sample trucks
        await Truck.create({
            truck_no: 'TRK-001'
        });

        await Truck.create({
            truck_no: 'TRK-002'
        });

        // Create sample customers
        await Customer.create({
            name: 'John Doe',
            phoneNumber: '1234567890',
            address: '123 Main St',
            route_id: route1.id,
            bottle_tally: 5,
            bottle_charge: 20,
            coupon_count: 10
        });

        await Customer.create({
            name: 'Jane Smith',
            phoneNumber: '9876543210',
            address: '456 Oak Ave',
            route_id: route2.id,
            bottle_tally: 3,
            bottle_charge: 20,
            coupon_count: 5
        });

        logger.info('Database seeded successfully');
    } catch (error) {
        logger.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();