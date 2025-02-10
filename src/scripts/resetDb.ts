import { sequelize } from '../utils/sequelize';
import fs from 'fs';
import path from 'path';
import getLogger from '../utils/logger';

const logger = getLogger();

async function resetDatabase() {
    try {
        // First, drop all tables
        await sequelize.query('DROP SCHEMA public CASCADE;');
        await sequelize.query('CREATE SCHEMA public;');
        await sequelize.query('GRANT ALL ON SCHEMA public TO postgres;');
        await sequelize.query('GRANT ALL ON SCHEMA public TO public;');
        
        // Read and execute init.sql
        const initSqlPath = path.join(process.cwd(), 'init.sql');
        const initSql = fs.readFileSync(initSqlPath, 'utf8');
        await sequelize.query(initSql);
        
        // Sync all models
        await sequelize.sync({ force: true });
        
        logger.info('Database reset successful');
    } catch (error) {
        logger.error('Error resetting database:', error);
        process.exit(1);
    }
}

resetDatabase();