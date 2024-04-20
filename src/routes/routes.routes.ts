import { Router } from 'express';  
import RoutesController from '../controllers/routes.controller';
import userCriteria from '../middleware/usercriteria.middleware';

// Defining the router  
const router = Router();   

router.get("/", (req, res) => {
    RoutesController.getRoutes(req, res);
});

router.get("/:id", (req, res) => {
    RoutesController.getRoute(req, res);
});

router.post("/", userCriteria,(req, res) => {
    RoutesController.createRoute(req, res);
});

router.put("/:id",userCriteria, (req, res) => {
    RoutesController.updateRoute(req, res);
});

router.delete("/:id",userCriteria, (req, res) => {
    RoutesController.deleteRoute(req, res);
});

router.get("/search/:name", (req, res) => {
    RoutesController.searchRoute(req, res);
});

export default router;