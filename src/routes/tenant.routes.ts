import { Router } from 'express';
import * as tenantController from '../controllers/tenant.controller';
import { requireAuth } from '../middleware/requireAuth';
import { requireTenant } from '../middleware/requireTenant';

const router = Router();

router.use(requireAuth);

router.get('/', tenantController.listTenants);
router.get('/:tenantId', tenantController.getTenant);
router.get('/:tenantId/members', requireTenant, tenantController.listMembers);

export default router;
