import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'node:crypto'
import { DomainError } from '../utils/domain-error'

type UploadUrlRequest = {
  fileName: string
  contentType: string
  userId: string
  organizationId: string
}

function getEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new DomainError('AVATAR_STORAGE_NOT_CONFIGURED', `Missing env var ${name}`)
  }
  return value
}

function sanitizeFileExtension(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? 'bin'
  const safeExtension = extension.replace(/[^a-z0-9]/g, '')
  return safeExtension || 'bin'
}

function resolvePublicUrl(endpoint: string, bucket: string, objectKey: string) {
  const publicBaseUrl = process.env.OBJECT_STORAGE_PUBLIC_BASE_URL
  if (publicBaseUrl) {
    return `${publicBaseUrl.replace(/\/$/, '')}/${objectKey}`
  }

  const normalizedEndpoint = endpoint.replace(/\/$/, '')
  return `${normalizedEndpoint}/${bucket}/${objectKey}`
}

export class AvatarStorageService {
  private readonly bucket = getEnv('OBJECT_STORAGE_BUCKET')
  private readonly region = process.env.OBJECT_STORAGE_REGION || 'auto'
  private readonly endpoint = getEnv('OBJECT_STORAGE_ENDPOINT')
  private readonly accessKeyId = getEnv('OBJECT_STORAGE_ACCESS_KEY_ID')
  private readonly secretAccessKey = getEnv('OBJECT_STORAGE_SECRET_ACCESS_KEY')
  private readonly signedUrlTtl = Number(process.env.OBJECT_STORAGE_SIGNED_URL_TTL_SECONDS || '300')

  private readonly client = new S3Client({
    region: this.region,
    endpoint: this.endpoint,
    credentials: {
      accessKeyId: this.accessKeyId,
      secretAccessKey: this.secretAccessKey
    },
    forcePathStyle: true
  })

  async createUploadUrl(input: UploadUrlRequest) {
    if (!input.contentType.startsWith('image/')) {
      throw new DomainError('VALIDATION_INVALID_CONTENT_TYPE', 'Only images are allowed')
    }

    const extension = sanitizeFileExtension(input.fileName)
    const objectKey = `avatars/${input.organizationId}/${input.userId}/${randomUUID()}.${extension}`
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: objectKey,
      ContentType: input.contentType
    })
    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: this.signedUrlTtl
    })

    return {
      objectKey,
      uploadUrl,
      publicUrl: resolvePublicUrl(this.endpoint, this.bucket, objectKey),
      expiresInSeconds: this.signedUrlTtl
    }
  }
}
