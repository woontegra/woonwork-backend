import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import { requireAuth } from '../middleware/requireAuth';
import { requireTenant } from '../middleware/requireTenant';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.use(requireAuth, requireTenant);

router.get('/', taskController.list);
router.post('/', requireRole('MEMBER'), taskController.create);
router.get('/:id', taskController.getById);
router.patch('/:id', requireRole('MEMBER'), taskController.update);
router.delete('/:id', requireRole('EDITOR'), taskController.remove);

export default router;
