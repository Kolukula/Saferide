import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import { addbus, getbuses, updateBusLocation, getBusById, deleteBus } from "../controllers/busController.js";

const router = express.Router();

router.post("/addbus", protect, authorizeRoles("admin"), addbus);
router.get("/getbuses", protect, getbuses);
router.get("/:id", protect, getBusById);
router.put("/:id/location", protect, authorizeRoles("driver"), updateBusLocation);
router.delete("/:id", protect, authorizeRoles("admin"), deleteBus);

export default router;
