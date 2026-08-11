import type { Request, Response, NextFunction } from 'express';
import * as pageService from '../services/page.service';
import { ok } from '../lib/errors';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const parentIdRaw = req.query.parentId as string | undefined;
    const data = await pageService.listPages(req.tenant!.id, {
      parentId: parentIdRaw,
      q: req.query.q as string | undefined,
    });
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await pageService.getPage(req.tenant!.id, req.params.id);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await pageService.createPage(req.tenant!.id, req.user!.id, req.body);
    res.status(201).json(ok(data));
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await pageService.updatePage(req.tenant!.id, req.params.id, req.body);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await pageService.deletePage(req.tenant!.id, req.params.id);
    res.json(ok({ message: 'Sayfa silindi' }));
  } catch (error) {
    next(error);
  }
}
