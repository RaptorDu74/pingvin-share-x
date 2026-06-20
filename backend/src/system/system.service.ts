import { Injectable, Logger } from "@nestjs/common";
import checkDiskSpace from "check-disk-space";
import { DATA_DIRECTORY } from "src/constants";
import { SystemInfoDTO } from "./dto/systemInfo.dto";
import { SystemStatsDTO } from "./dto/systemStats.dto";
import { ConfigService } from "src/config/config.service";
import { PrismaService } from "src/prisma/prisma.service";
import * as path from "path";

@Injectable()
export class SystemService {
  private readonly logger = new Logger(SystemService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async getSystemInfo(): Promise<SystemInfoDTO | null> {
    if (this.configService.get("s3.enabled")) {
      return null;
    }

    const resolvedPath = path.resolve(DATA_DIRECTORY);

    try {
      const diskSpace = await checkDiskSpace(resolvedPath);
      return {
        used: diskSpace.size - diskSpace.free,
        total: diskSpace.size,
      };
    } catch (e) {
      this.logger.warn(
        `Failed to check disk space for ${resolvedPath}, falling back to root: ${e.message}`,
      );
      try {
        const diskSpace = await checkDiskSpace("/");
        return {
          used: diskSpace.size - diskSpace.free,
          total: diskSpace.size,
        };
      } catch (err) {
        this.logger.error(
          `Failed to check disk space even for root: ${err.message}`,
        );
        return null;
      }
    }
  }

  async getStats(): Promise<SystemStatsDTO> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalShares,
      activeShares,
      totalFiles,
      totalUsers,
      sharesLast7Days,
      sharesLast30Days,
      viewsAgg,
      files,
    ] = await Promise.all([
      this.prisma.share.count(),
      this.prisma.share.count({ where: { expiration: { gt: now } } }),
      this.prisma.file.count(),
      this.prisma.user.count(),
      this.prisma.share.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      this.prisma.share.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.share.aggregate({ _sum: { views: true } }),
      this.prisma.file.findMany({ select: { size: true } }),
    ]);

    const totalSize = files.reduce(
      (acc, file) => acc + parseInt(file.size, 10),
      0,
    );

    return {
      totalShares,
      activeShares,
      totalFiles,
      totalUsers,
      totalViews: viewsAgg._sum.views ?? 0,
      totalSize,
      sharesLast7Days,
      sharesLast30Days,
    };
  }
}
