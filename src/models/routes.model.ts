import { Router } from 'express';
import {sequelize, DataTypes, Sequelize}  from  '../utils/sequelize';  
import { v4 as uuidv4 } from 'uuid';
import getLogger from '../utils/logger';
  
const logger = getLogger();

// Define the Routes model  
export default sequelize.define('routes', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),

    },
    route_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: new Date(),
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: new Date(),
    },
},
{
    timestamps: false,
    hooks: {
        beforeCreate: async (route:any) => {
            const existingRoute = await sequelize.models.routes.findOne({where: {route_name: route.route_name}});  
            if (existingRoute) {
                logger.error(`Route with name ${route.route_name} already exists`);
                throw new Error(`Route with name ${route.route_name} already exists`);
            }
        },
        beforeUpdate: async (route:any) => {
            route.updated_at = new Date();   
        },
    },
}
);