import { Sequelize, DataTypes } from 'sequelize';
import fs from 'fs';
import { logger } from '../middleware/logger.middleware';


// Config File creation and reading
const config = JSON.parse(fs.readFileSync('src/config/config.json', 'utf-8'));
console.log(process.env.NODE_ENV );
const env = process.env.NODE_ENV || 'development';

logger.info(`Environment: ${env}`);
console.log(config[env])
if (!config[env]) {
    logger.error(`Environment config for ${env} not found`);
    throw new Error(`Environment config for ${env} not found`);
}


// Database connection
const sequelize = new Sequelize(
    config[env].database || null
    , config[env].username || null
    , config[env].password || null
    , {
        host: config[env].host || 'localhost',
        dialect: config[env].dialect || 'postgres',
        port: config[env].port || 5432,
        logging: console.log,  // Enable query logging
        retry: {
            max: 5,           // Maximum retry attempts
            match: [/SequelizeConnectionRefusedError/],
        },
        pool: {
            max: 5,          // Maximum number of connection in pool
            min: 0,          // Minimum number of connection in pool
            acquire: 30000,  // Maximum time (ms) that pool will try to get connection before throwing error
            idle: 10000      // Maximum time (ms) that a connection can be idle before being released
        }
    }
);

// Add connection test
sequelize
    .authenticate()
    .then(() => {
        logger.info('Database connection has been established successfully.');
    })
    .catch(err => {
        logger.error('Unable to connect to the database:', err);
    });

export {Sequelize, DataTypes, sequelize};