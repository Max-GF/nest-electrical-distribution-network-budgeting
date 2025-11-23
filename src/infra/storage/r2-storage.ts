import {
  Uploader,
  UploadParams,
} from "src/domain/user-management/application/storage/uploader";

import {
  GetObjectCommand,
  NoSuchKey,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import {
  Downloader,
  DownloadParams,
  DownloadResponse,
} from "src/domain/user-management/application/storage/downloader";
import { EnvService } from "../env/env.service";

@Injectable()
export class R2Storage implements Uploader, Downloader {
  private client: S3Client;

  constructor(private envService: EnvService) {
    const accountId = envService.get("CLOUDFLARE_ACCOUNT_ID");

    this.client = new S3Client({
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      region: "auto",
      credentials: {
        accessKeyId: envService.get("AWS_ACCESS_KEY_ID"),
        secretAccessKey: envService.get("AWS_SECRET_ACCESS_KEY"),
      },
    });
  }

  async upload({
    fileName,
    fileType,
    body,
  }: UploadParams): Promise<{ url: string }> {
    const uploadId = randomUUID();
    const uniqueFileName = `${uploadId}-${fileName}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.envService.get("AWS_BUCKET_NAME"),
        Key: uniqueFileName,
        ContentType: fileType,
        Body: body,
      }),
    );

    return {
      url: uniqueFileName,
    };
  }
  async download({ url }: DownloadParams): Promise<DownloadResponse | null> {
    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.envService.get("AWS_BUCKET_NAME"),
          Key: url,
        }),
      );

      if (!response.Body || !response.ContentType) return null;

      const body = await response.Body.transformToByteArray();
      const buffer = Buffer.from(body);

      return {
        fileName: url.split("-").slice(1).join("-"),
        fileType: response.ContentType,
        body: buffer,
      };
    } catch (error) {
      if (error instanceof NoSuchKey) {
        return null;
      }
      throw error;
    }
  }
}
