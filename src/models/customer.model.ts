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
    phoneNumber: {
        type: DataTypes.STRING,    
        allowNull: true,
    },
    address: {
        type: DataTypes.TEXT, 
        allowNull: true
    },
    name: {
        
        type: DataTypes.STRING,
        allowNull: false,
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
        allowNull: true,
        defaultValue: 0,
        validate: {
           min : 0
       }
    },
    bottle_charge: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
           min : 0
       }
    }, 
    bottle_count_updated: {
        type: DataTypes.BOOLEAN,    
        defaultValue: true
    }, 
    coupon_count: {
        type: DataTypes.INTEGER, 
        defaultValue: 0, 
    }, 
    credits: {
        type: DataTypes.INTEGER, 
        defaultValue: 0
    }
},
{  
    paranoid: true,
    hooks: {
        beforeCreate: async (customer: any) => {
            if (!customer.phoneNumber|| !customer.bottle_charge || !customer.address) {
                customer.bottle_count_updated = false;
                customer.bottle_charge = 0;
               
            }
        },
    },
},
);

Customers.belongsTo(Route, { foreignKey: 'route_id', targetKey: 'id', as : 'route' });
export default Customers;


