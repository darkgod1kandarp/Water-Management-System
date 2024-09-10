import { sequelize, DataTypes } from '../utils/sequelize';


const Logs = sequelize.define(
    'logs',
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize.literal('uuid_generate_v4()'),
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        action: {
            type: DataTypes.ENUM,
            values: [ 'login', 'create', 'update', 'delete', 'download' ],
            allowNull: false,
        },
        module: {
            type: DataTypes.ENUM,
            values: [ 'customer', 'user', 'route', 'driver_entries','truck' ],
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
            
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('NOW()'),
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('NOW()'),
        },
    },
    {
        timestamps: true,
    }
);

export default Logs;