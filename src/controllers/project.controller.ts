import type { Request, Response, NextFunction } from 'express';
import * as projectService from '../services/project.service';
import { ok } from '../lib/errors';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await projectService.listProjects(req.tenant!.id, {
      status: req.query.status as string | undefined,
      q: req.query.q as string | undefined,
    });
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await projectService.getProject(req.tenant!.id, req.params.id);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await projectService.createProject(req.tenant!.id, req.user!.id, req.body);
    res.status(201).json(ok(data));
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await projectService.updateProject(req.tenant!.id, req.params.id, req.body);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await projectService.deleteProject(req.tenant!.id, req.params.id);
    res.json(ok({ message: 'Proje silindi' }));
  } catch (error) {
    next(error);
  }
}
