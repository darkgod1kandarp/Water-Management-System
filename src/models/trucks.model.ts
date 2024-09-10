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
        unique: true,
    }
},
{   paranoid: true,
    hooks: {
        beforeCreate: async (truck: any) => {
            
            
        }
    },
}
);

