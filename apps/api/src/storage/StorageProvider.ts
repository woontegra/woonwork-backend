export interface UploadParams {
  tenantId: string;
  fileName: string;
  mimeType: string;
  data: Buffer;
}

export interface UploadResult {
  storageKey: string;
  url?: string;
  size: number;
}

export interface StorageProvider {
  readonly name: string;
  upload(params: UploadParams): Promise<UploadResult>;
  delete(storageKey: string): Promise<void>;
  getSignedUrl(storageKey: string, expiresInSeconds?: number): Promise<string>;
}
