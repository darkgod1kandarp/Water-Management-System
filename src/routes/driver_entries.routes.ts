import DriverEntriesController from "../controllers/driver_entries.controller";
import { Router } from 'express';

// Defining the router
const route = Router();

route.get("/cumulative", (req, res) => {
    DriverEntriesController.getCumulativeEntries(req, res);
});


route.get("/export/cumulative", (req, res) =>{
    DriverEntriesController.generateCumulativeExcel(req, res);
});

route.get("/export/individual", (req, res) => { 
    DriverEntriesController.generateIndividualExcel(req, res);
});


route.get("/", (req, res) => {
    DriverEntriesController.getDriverEntries(req, res);
});

route.get("/:id", (req, res) => {
    DriverEntriesController.getDriverEntry(req, res);
});

route.post("/", (req, res) => {
    DriverEntriesController.createDriverEntry(req, res);
});

route.get('/history/:id', (req, res) => {
    DriverEntriesController.getDriverHistory(req, res);
})


export default route;