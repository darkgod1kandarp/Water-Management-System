import {sequelize, DataTypes, Sequelize}  from  '../utils/sequelize';  
import getLogger from '../utils/logger';

const logger = getLogger();

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
    }
},
{   paranoid: true,
    hooks: {
        beforeCreate: async (truck:any) => {
            const existingTruck = await sequelize.models.trucks.findOne({where: {truck_no: truck.truck_no}});  
            if (existingTruck) {
                logger.error(`Truck with name ${truck.truck_no} already exists`);
                throw new Error(`Truck with name ${truck.truck_no} already exists`);
            }
        }
    },
}
);

