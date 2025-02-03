import { sequelize, DataTypes } from '../utils/sequelize';
import customerModel from './customer.model';
import userModel from './user.model';
// Define the DriverEntries model
const Drivers = sequelize.define(
	'driver_entries',
	{
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
				key: 'id',
			},
			onDelete: 'CASCADE',
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
		mode_of_payment: {
			type: DataTypes.ENUM,
			values: [ 'cash', 'online', 'card', 'credit', 'coupon' ],
			allowNull: false,
			defaultValue: 'cash',
		},
		truck_no: {
			type: DataTypes.UUID,
			references: {
				model: 'trucks',
				key: 'id',
			},
			allowNull: false,
			onDelete: 'CASCADE',
		},
		driver_id: {
			type: DataTypes.UUID,
			references: {
				model: 'users',
				key: 'id',
			},
			allowNull: false,
			onDelete: 'CASCADE',
        },
		number_of_coupon: {
			type: DataTypes.INTEGER,    
			allowNull: true, 
		},
		credits: {
			type: DataTypes.INTEGER, 
			allowNull: true
		}, 
		comments: {
			type: DataTypes.TEXT, 
			allowNull: true
		},
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('NOW()'),
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('NOW()'),
        }
	},
	{
		paranoid: true,
		hooks: {
			beforeValidate: async (entry: any, options) => {
				const customer: any = await customerModel.findOne({
					where: { id: entry.customer_id },
				});

				if (customer) {

					if (entry.model_of_payment === "credit" ){  
						const singleBottleCharge = customer.bottle_charge;  
						customer.credit += (parseInt(singleBottleCharge) * parseInt(entry.bottle_delivered));   
					}   
					if (entry.mode_of_payment === "coupon" && customer.coupon_count < entry.number_of_coupon){   
						throw new Error(
							'Customer does not have that many coupon code.'
						)
					} else{
						customer.coupon_count -= entry.number_of_coupon    
					}

					if (entry.bottle_received < 0 || entry.bottle_delivered < 0) {
						throw new Error(
							'Bottle received and bottle delivered cannot be negative',
						);
					}
					if (entry.bottle_received > customer.bottle_tally) {
						throw new Error(
							'Bottle received cannot be greater than bottle tally',
						);
					}
					entry.bottle_tally =
						Number(customer.bottle_tally) +
						Number(entry.bottle_delivered) -
						Number(entry.bottle_received);
					if (entry.bottle_tally < 0) {
						throw new Error('Bottle tally cannot be negative');
					}
					customer.bottle_tally = entry.bottle_tally;
					console.log('Customer', customer.bottle_tally, entry.bottle_tally);
					customer.deletedAt = null;
					await customer.save();
				} else {
					throw new Error(`Customer with id ${entry.customer_id} not found`);
				}
			},
		},
	},
);

Drivers.belongsTo(customerModel, {
	foreignKey: 'customer_id',
	targetKey: 'id',
	as: 'customer',
});
Drivers.belongsTo(userModel, {
    foreignKey: 'driver_id',
    targetKey: 'id',
    as: 'driver',
});

export default Drivers;
