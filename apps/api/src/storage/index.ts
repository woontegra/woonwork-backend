import type { StorageProvider } from './StorageProvider';
import { VercelBlobProvider } from './VercelBlobProvider';

let provider: StorageProvider = new VercelBlobProvider();

export function getStorageProvider(): StorageProvider {
  return provider;
}

export function setStorageProvider(next: StorageProvider): void {
  provider = next;
}
