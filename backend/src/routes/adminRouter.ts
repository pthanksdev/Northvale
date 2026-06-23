import { Router } from "express";
import {
  createAdminProduct,
  deleteAdminProduct,
  getCloudinaryAuth,
  listAdminProducts,
  requireAdmin,
  updateAdminProduct,
} from "../controllers/adminController.js";
import { getDashboardStats } from "../controllers/adminDashboardController.js";
import { listAllOrders, getOrderDetail, updateOrderStatus } from "../controllers/adminOrderController.js";
import { listAllUsers, updateUserRole } from "../controllers/adminUserController.js";

const router = Router();

router.use(requireAdmin);

// Dashboard
router.get("/dashboard", getDashboardStats);

// Cloudinary
router.get("/cloudinary/auth", getCloudinaryAuth);

// Products
router.get("/products", listAdminProducts);
router.post("/products", createAdminProduct);
router.patch("/products/:id", updateAdminProduct);
router.delete("/products/:id", deleteAdminProduct);

// Orders
router.get("/orders", listAllOrders);
router.get("/orders/:id", getOrderDetail);
router.patch("/orders/:id/status", updateOrderStatus);

// Users
router.get("/users", listAllUsers);
router.patch("/users/:id/role", updateUserRole);

export default router;
