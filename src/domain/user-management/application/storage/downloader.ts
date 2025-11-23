export interface DownloadParams {
  url: string;
}

export interface DownloadResponse {
  fileName: string;
  fileType: string;
  body: Buffer;
}

export abstract class Downloader {
  abstract download(params: DownloadParams): Promise<DownloadResponse | null>;
}
