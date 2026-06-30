import { Router } from "express";
import { getAudit } from "../audit.js";

const router = Router();

// GET /api/audit            -> full trail (newest first)
// GET /api/audit?itemId=xxx -> trail for one item
router.get("/", async (req, res) => {
  const entries = await getAudit({ itemId: req.query.itemId });
  res.json(entries);
});

export default router;
