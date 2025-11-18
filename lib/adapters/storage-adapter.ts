/**
 * Storage adapter interface
 *
 * Enables alternative storage backends for attachments and media
 */

import { logger } from '../logger'

export interface StorageObject {
  key: string
  url: string
  size: number
  contentType: string
  metadata?: Record<string, string>
}

export interface IStorageAdapter {
  upload(key: string, data: Buffer | string, contentType: string): Promise<StorageObject>
  download(key: string): Promise<Buffer>
  delete(key: string): Promise<void>
  getUrl(key: string, expiresIn?: number): Promise<string>
  list(prefix?: string): Promise<StorageObject[]>
}

/**
 * Local storage adapter (default)
 * Stores files in the local filesystem
 */
export class LocalStorageAdapter implements IStorageAdapter {
  constructor(private basePath: string = './storage') {}

  async upload(key: string, data: Buffer | string, contentType: string): Promise<StorageObject> {
    logger.info('Storage: Upload (local)', undefined, { key, contentType })

    // TODO: Implement actual file writing
    // const fs = require('fs/promises')
    // const path = require('path')
    // const filePath = path.join(this.basePath, key)
    // await fs.writeFile(filePath, data)

    return {
      key,
      url: `/storage/${key}`,
      size: Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data),
      contentType,
    }
  }

  async download(key: string): Promise<Buffer> {
    logger.info('Storage: Download (local)', undefined, { key })
    // TODO: Implement actual file reading
    return Buffer.from('')
  }

  async delete(key: string): Promise<void> {
    logger.info('Storage: Delete (local)', undefined, { key })
    // TODO: Implement actual file deletion
  }

  async getUrl(key: string, expiresIn?: number): Promise<string> {
    return `/storage/${key}`
  }

  async list(prefix?: string): Promise<StorageObject[]> {
    logger.info('Storage: List (local)', undefined, { prefix })
    // TODO: Implement actual directory listing
    return []
  }
}

/**
 * S3 storage adapter (stub)
 * Integrates with AWS S3 or compatible object storage
 */
export class S3StorageAdapter implements IStorageAdapter {
  constructor(
    private config: {
      bucket: string
      region?: string
      accessKeyId?: string
      secretAccessKey?: string
    }
  ) {}

  async upload(key: string, data: Buffer | string, contentType: string): Promise<StorageObject> {
    logger.info('Storage: Upload (S3)', undefined, { key, bucket: this.config.bucket })

    // TODO: Implement actual S3 upload
    // const s3 = new S3Client({ region: this.config.region })
    // await s3.send(new PutObjectCommand({
    //   Bucket: this.config.bucket,
    //   Key: key,
    //   Body: data,
    //   ContentType: contentType,
    // }))

    return {
      key,
      url: `https://${this.config.bucket}.s3.amazonaws.com/${key}`,
      size: Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data),
      contentType,
    }
  }

  async download(key: string): Promise<Buffer> {
    logger.info('Storage: Download (S3)', undefined, { key })
    // TODO: Implement actual S3 download
    return Buffer.from('')
  }

  async delete(key: string): Promise<void> {
    logger.info('Storage: Delete (S3)', undefined, { key })
    // TODO: Implement actual S3 deletion
  }

  async getUrl(key: string, expiresIn: number = 3600): Promise<string> {
    // TODO: Implement actual S3 presigned URL generation
    return `https://${this.config.bucket}.s3.amazonaws.com/${key}`
  }

  async list(prefix?: string): Promise<StorageObject[]> {
    logger.info('Storage: List (S3)', undefined, { prefix })
    // TODO: Implement actual S3 listing
    return []
  }
}
