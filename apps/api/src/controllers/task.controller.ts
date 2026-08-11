import type { Request, Response, NextFunction } from 'express';
import * as taskService from '../services/task.service';
import { ok } from '../lib/errors';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await taskService.listTasks(req.tenant!.id, {
      status: req.query.status as string | undefined,
      priority: req.query.priority as string | undefined,
      projectId: req.query.projectId as string | undefined,
      assigneeId: req.query.assigneeId as string | undefined,
      q: req.query.q as string | undefined,
    });
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await taskService.getTask(req.tenant!.id, req.params.id);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await taskService.createTask(req.tenant!.id, req.user!.id, req.body);
    res.status(201).json(ok(data));
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await taskService.updateTask(req.tenant!.id, req.params.id, req.body);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await taskService.deleteTask(req.tenant!.id, req.params.id);
    res.json(ok({ message: 'Görev silindi' }));
  } catch (error) {
    next(error);
  }
}
