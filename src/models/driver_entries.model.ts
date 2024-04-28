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
                beforeValidate: async (entry:any, options) => {
                    const customer:any =  await customerModel.findOne({where: {id: entry.customer_id}})  
                    if (customer) {
                        if (entry.bottle_received < 0 || entry.bottle_delivered < 0) {
                            throw new Error('Bottle received and bottle delivered cannot be negative');
                        }
                        if (entry.bottle_received > customer.bottle_tally) {
                            throw new Error('Bottle received cannot be greater than bottle tally');
                        }
                        entry.bottle_tally = Number(customer.bottle_tally) + Number(entry.bottle_delivered) - Number(entry.bottle_received);
                        if (entry.bottle_tally < 0) {
                            throw new Error('Bottle tally cannot be negative');
                        }
                        customer.bottle_tally = entry.bottle_tally; 
                        console.log("Customer", customer.bottle_tally, entry.bottle_tally)
                        await customer.save();
                    } else {
                        throw new Error(`Customer with id ${entry.customer_id} not found`);
                    }
                },
                beforeUpdate: async (entry:any) => {
                    entry.updated_at = new Date();
                },
            },
        }
    )

Drivers.belongsTo(customerModel, {foreignKey: 'customer_id', targetKey: 'id', as: 'customer'});
export default Drivers;