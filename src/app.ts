import express from 'express';
import dotenv from 'dotenv';
// Load the environment variables
dotenv.config();   

const app  = express(); 


// Middleware module   
import {Logger, logger} from './middleware/logger.middleware';
// import generateToken from './src/middleware/generatetoken.middleware';
import verifyToken from './middleware/verifytoken.middleware';

// Utils module
import { sequelize } from './utils/sequelize';

// Routes module
import routes from './routes/routes.routes';
import truck from './routes/trucks.routes';
import user from './routes/user.routes';
import customerRoutes from './routes/customer.routes';
import driverEntries from './routes/driver_entries.routes';
import { send } from 'process';
import { SendEmail, templates } from './Services/SendEmail';
import CronJob from './Services/CronJob';

// Syncing up the module    
// Avoid this method for syncing up the databse as it will delete all table and then it will recreate the table again so data will be lost
// sequelize.sync({force:true})
sequelize.sync()
    .then(() => {
        logger.info('Database is connected');
    })
    .catch((err) => {
        console.log(err);
        logger.error(err);
});



// Added middleware to the app
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(Logger);
app.use('/uploads', express.static('uploads'));

// Initializing the global variables 
const port = process.env.PORT || 3000;     


// Checking basic API for checking server is running or not
app.get('/api', (req, res) => {
    logger.info('API is working');
    res.json({
        message: 'Welcome to the API'
    });
});

// Routes
app.use('/api/v1/users', verifyToken , user);  
app.use('/api/v1/routes', verifyToken, routes );
app.use('/api/v1/trucks', verifyToken, truck);
app.use('/api/v1/customer' ,verifyToken,customerRoutes); 
app.use('/api/v1/driver-entries',verifyToken, driverEntries);   

   
app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });





