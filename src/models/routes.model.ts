import { Router } from 'express';
import {sequelize, DataTypes, Sequelize}  from  '../utils/sequelize';  
import { v4 as uuidv4 } from 'uuid';
import getLogger from '../utils/logger';
import Customer from './customer.model';    
import Driver from './driver_entries.model';
  
const logger = getLogger();

// Define the Routes model  
const Route = sequelize.define('routes', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),

    },
    route_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    }
},
{
    paranoid: true,
    hooks: {
        beforeCreate: async (route:any) => {
            
        }
    }
}
);

// Route.hasMany(Customer, {
//     onDelete: 'CASCADE',
// });
// Route.hasMany(Driver, {
//     onDelete: 'CASCADE',
// });

export default Route;