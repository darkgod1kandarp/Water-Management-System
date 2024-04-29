import {sequelize, DataTypes, Sequelize}  from  '../utils/sequelize';  
import bcrypt from 'bcryptjs';
import DriverEntries from './driver_entries.model';


// Define the User(aka driver) model
const User = sequelize.define('user', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    isNew: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
        beforeCreate: async (user:any) => {
            const salt = process.env.SALT || 10;
            user.password = await bcrypt.hash(user.password, salt);
        },
        beforeUpdate: async (user:any) => {
            const salt:any = process.env.SALT || 10;
            user.password = await bcrypt.hash(user.password, salt);
            user.updated_at = new Date();
            user.isNew = false;
        },
    },
}
);

User.hasMany(DriverEntries, {
    onDelete: 'CASCADE',
});

export default User;




