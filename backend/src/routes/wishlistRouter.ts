import { Router } from "express";
import { getWishlist, toggleWishlist } from "../controllers/wishlistController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);
router.get("/", getWishlist);
router.post("/toggle", toggleWishlist);

export default router;
