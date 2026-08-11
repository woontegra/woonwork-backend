import { Router } from 'express';
import authRoutes from './auth.routes';
import tenantRoutes from './tenant.routes';
import projectRoutes from './project.routes';
import taskRoutes from './task.routes';
import pageRoutes from './page.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

router.use('/auth', authRoutes);
router.use('/tenants', tenantRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/pages', pageRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
