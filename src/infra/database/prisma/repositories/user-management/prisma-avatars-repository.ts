import { Injectable } from "@nestjs/common";
import { AvatarsRepository } from "src/domain/user-management/application/repositories/avatars-repository";
import { UserAvatar } from "src/domain/user-management/enterprise/entities/user-avatar";
import { PrismaUserAvatarMapper } from "../../mappers/user-management/prisma-user-avatar-mapper";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class PrismaAvatarsRepository implements AvatarsRepository {
  constructor(private readonly prisma: PrismaService) {}
  async createMany(avatars: UserAvatar[]): Promise<void> {
    const data = avatars.map(PrismaUserAvatarMapper.toPrisma);
    await this.prisma.avatar.createMany({ data });
  }
  async findById(id: string): Promise<UserAvatar | null> {
    const foundedAvatar = await this.prisma.avatar.findUnique({
      where: { id },
    });
    if (!foundedAvatar) return null;
    return PrismaUserAvatarMapper.toDomain(foundedAvatar);
  }
  async deleteById(id: string): Promise<void> {
    await this.prisma.avatar.delete({ where: { id } });
  }
}
