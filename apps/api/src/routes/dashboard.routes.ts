import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { requireAuth } from '../middleware/requireAuth';
import { requireTenant } from '../middleware/requireTenant';

const router = Router();

router.use(requireAuth, requireTenant);
router.get('/', dashboardController.getDashboard);

export default router;
