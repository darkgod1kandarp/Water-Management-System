import {sequelize, DataTypes, Sequelize}  from  '../utils/sequelize';  
import getLogger from '../utils/logger';
import Route from './routes.model';
import DriverEntries from './driver_entries.model';

const logger = getLogger();

// Define the Customer model   
const Customers = sequelize.define('customer', {
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    route_id: {
        type: DataTypes.UUID,
        references: {
            model: 'routes',
            key: 'id'
        },
        allowNull: false,
        onDelete: 'CASCADE',
    },
    bottle_tally: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    bottle_charge: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
           min : 0
       }
    }
},
{  
    paranoid: true,
},
);

Customers.belongsTo(Route, { foreignKey: 'route_id', targetKey: 'id', as : 'route' });
export default Customers;


