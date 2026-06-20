import { Module } from "@nestjs/common";
import { ConfigModule } from "src/config/config.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { SystemController } from "./system.controller";
import { SystemService } from "./system.service";

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [SystemController],
  providers: [SystemService],
  exports: [SystemService],
})
export class SystemModule {}
