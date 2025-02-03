import {sequelize, DataTypes, Sequelize}  from  '../utils/sequelize';  
import bcrypt from 'bcryptjs';


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
    role: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['driver', 'admin','sales'],
    },
    isNew: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
},
{  
    paranoid: true,
    hooks: {
        beforeCreate: async (user:any) => {
            const salt = process.env.SALT || 10;
            user.created_at = new Date();
            user.updated_at = new Date();
            user.password = await bcrypt.hash(user.password, salt);
        },
        beforeUpdate: async (user:any) => {
            user.updated_at = new Date();
        },
    },
}
);


export default User;




