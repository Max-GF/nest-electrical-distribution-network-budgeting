import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "prisma/generated/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      // log: [
      //   "query", // Just for debugging purposes
      //   "info",
      //   "warn",
      //   "error",
      // ],
    });
  }
  onModuleInit() {
    return this.$connect();
  }
  onModuleDestroy() {
    return this.$disconnect();
  }
}
