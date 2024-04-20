import TruckController from '../controllers/truck.controller';
import { Router } from 'express';   
import userCriteria from '../middleware/usercriteria.middleware';

// Defining the router   
const router = Router();   

router.get('/', userCriteria,(req, res) => {
    TruckController.getTrucks(req, res);
});

router.get('/:id',userCriteria, (req, res) => {
    TruckController.getTruck(req, res);
});

router.post('/',userCriteria, (req, res) => {
    TruckController.createTruck(req, res);
});

router.put('/:id',userCriteria, (req, res) => {
    TruckController.updateTruck(req, res);
});

router.delete('/:id',userCriteria, (req, res) => {
    TruckController.deleteTruck(req, res);
});
 
router.get('/search/:name', (req, res) => {
    TruckController.getTruckBySimilarName(req, res);
});

export default router;