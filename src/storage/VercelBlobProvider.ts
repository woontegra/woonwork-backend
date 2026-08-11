import type { StorageProvider, UploadParams, UploadResult } from './StorageProvider';
import { AppError } from '../lib/errors';

/**
 * Vercel Blob entegrasyonu için iskelet.
 * Gerçek upload henüz uygulanmaz; ileride @vercel/blob ile bağlanabilir.
 */
export class VercelBlobProvider implements StorageProvider {
  readonly name = 'vercel-blob';

  async upload(_params: UploadParams): Promise<UploadResult> {
    throw new AppError(
      501,
      'STORAGE_NOT_CONFIGURED',
      'Vercel Blob depolama henüz yapılandırılmadı',
    );
  }

  async delete(_storageKey: string): Promise<void> {
    throw new AppError(
      501,
      'STORAGE_NOT_CONFIGURED',
      'Vercel Blob depolama henüz yapılandırılmadı',
    );
  }

  async getSignedUrl(_storageKey: string, _expiresInSeconds = 3600): Promise<string> {
    throw new AppError(
      501,
      'STORAGE_NOT_CONFIGURED',
      'Vercel Blob depolama henüz yapılandırılmadı',
    );
  }
}
