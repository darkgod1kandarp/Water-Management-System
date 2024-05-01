import { Router } from 'express';
import CustomerController from '../controllers/customer.controller';
import userCriteria from '../middleware/usercriteria.middleware';


// Defining the router   
const router =Router();      

router.get('/',(req, res) => {
    CustomerController.getCustomers(req, res);
});

router.get('/:id', userCriteria,(req, res) => {
    CustomerController.getCustomer(req, res);
});

router.post('/',userCriteria, (req, res) => {
    CustomerController.createCustomer(req, res);
});

router.put('/:id',userCriteria, (req, res) => {
    CustomerController.updateCustomer(req, res);
});

router.delete('/:id',userCriteria, (req, res) => {
    CustomerController.deleteCustomer(req, res);
});

router.get('/search/:name', (req, res) => {
    CustomerController.searchCustomer(req, res);
})  
 
router.get('/route/:id', userCriteria,(req, res) => {
    CustomerController.findCustomerUsingRoute(req, res);
})

export  default router;

