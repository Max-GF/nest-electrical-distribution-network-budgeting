import { Module } from "@nestjs/common";
import { Downloader } from "src/domain/user-management/application/storage/downloader";
import { Uploader } from "src/domain/user-management/application/storage/uploader";
import { EnvModule } from "../env/env.module";
import { R2Storage } from "./r2-storage";

@Module({
  imports: [EnvModule],
  providers: [
    R2Storage,
    {
      provide: Uploader,
      useClass: R2Storage,
    },
    {
      provide: Downloader,
      useClass: R2Storage,
    },
  ],
  exports: [R2Storage, Uploader, Downloader],
})
export class StorageModule {}
