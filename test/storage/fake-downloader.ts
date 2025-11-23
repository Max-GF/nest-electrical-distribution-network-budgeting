import {
  Downloader,
  DownloadParams,
  DownloadResponse,
} from "src/domain/user-management/application/storage/downloader";
import { FakeUploader } from "./fake-uploader";

export class FakeDownloader implements Downloader {
  constructor(private uploader: FakeUploader) {}

  async download({ url }: DownloadParams): Promise<DownloadResponse | null> {
    const upload = this.uploader.uploads.find((item) => item.url === url);

    if (!upload) return null;

    const fileName = upload.fileName;

    const body = Buffer.from(`Fake content for ${fileName}`);

    const fileType = "image/png";

    return {
      fileName,
      fileType,
      body,
    };
  }
}
