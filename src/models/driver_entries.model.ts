import {sequelize, DataTypes}  from  '../utils/sequelize';  
import customerModel  from './customer.model';


// Define the DriverEntries model
const Drivers =  sequelize.define('driver_entries', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize.literal('uuid_generate_v4()'),
        },
        customer_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'customers',
                key: 'id'
            },
        },
        bottle_delivered: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        bottle_received: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        bottle_tally: { 
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        truck_no: {
            type: DataTypes.UUID,   
            references: {
                model: 'trucks',
                key: 'id'
            },
            allowNull: false,
        },
        driver_id: {
            type: DataTypes.UUID,
            references: {
                model: 'users',
                key: 'id'
            },
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
                beforeCreate: async (entry:any) => {
                    const customer:any =  await customerModel.findOne({where: {id: entry.customer_id}})  
                    if (customer) {
                        entry.bottle_tally = Number(customer.bottle_tally) + Number(entry.bottle_delivered) - Number(entry.bottle_received);
                        console.log("Bottle Tally", entry.bottle_tally);
                        customer.bottle_tally = entry.bottle_tally; 
                        await customer.save();
                    } else {
                        throw new Error(`Customer with id ${entry.customer_id} not found`);
                    }
                    return entry;
                },
                beforeUpdate: async (entry:any) => {
                    entry.updated_at = new Date();
                },
            },
        }
    )

Drivers.belongsTo(customerModel, {foreignKey: 'customer_id', targetKey: 'id', as: 'customer'});
export default Drivers;