import { Sequelize, DataTypes } from 'sequelize';
import fs from 'fs';
import { logger } from '../middleware/logger.middleware';


// Config File creation and reading
const config = JSON.parse(fs.readFileSync('src/config/config.json', 'utf-8'));
console.log(process.env.NODE_ENV );
const env = process.env.NODE_ENV || 'development';

logger.info(`Environment: ${env}`);
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
    }
);

export {Sequelize, DataTypes, sequelize};