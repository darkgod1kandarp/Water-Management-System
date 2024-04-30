import DriverEntriesController from "../controllers/driver_entries.controller";
import { Router } from 'express';

// Defining the router
const route = Router();


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

route.get("/timerange/:timerange", (req, res) => {
    DriverEntriesController.getDriverEntriesByTimeRange(req, res);
});

route.get("/report", (req, res) =>
    DriverEntriesController.getDriverEntriesByTimeRange(req, res));

export default route;