import {sequelize, DataTypes, Sequelize}  from  '../utils/sequelize';  
import getLogger from '../utils/logger';

const logger = getLogger();

// {
//     "id": "uuid",
//     "truck_no": "string",
//     "created_at":"timestamp",
//     "updated_at":"timestamp"
// }

// Define the Trucks model   
export default sequelize.define('trucks', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue:Sequelize.literal('uuid_generate_v4()'),
    },
    truck_no: {
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
{   timestamps: false,
    hooks: {
        beforeCreate: async (truck:any) => {
            const existingTruck = await sequelize.models.trucks.findOne({where: {truck_no: truck.truck_no}});  
            if (existingTruck) {
                logger.error(`Truck with name ${truck.truck_no} already exists`);
                throw new Error(`Truck with name ${truck.truck_no} already exists`);
            }
        },
        beforeUpdate: async (truck:any) => {
            truck.updated_at = new Date();   
        },
    },
}
);

