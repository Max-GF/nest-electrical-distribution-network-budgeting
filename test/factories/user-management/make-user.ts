import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import {
  User,
  UserProps,
} from "src/domain/user-management/enterprise/entities/base-user";
import { Cpf } from "src/domain/user-management/enterprise/entities/value-objects/cpf";
import { UserRole } from "src/domain/user-management/enterprise/entities/value-objects/user-roles";
import { PrismaUserMapper } from "src/infra/database/prisma/mappers/user-management/prisma-user-mapper";
import { PrismaService } from "src/infra/database/prisma/prisma.service";

export function makeUser(
  override: Partial<UserProps> = {},
  id?: UniqueEntityID,
) {
  const user = User.create(
    {
      cpf: Cpf.create(generateCPF()),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRole.create(faker.helpers.arrayElement(["ADMIN", "COMMON"])),
      baseId: new UniqueEntityID(),
      companyId: new UniqueEntityID(),
      isActive: faker.datatype.boolean(),
      firstLogin: faker.datatype.boolean(),
      ...override,
    },
    id,
  );

  return user;
}

function generateCPF(): string {
  const randomDigits = (): number => Math.floor(Math.random() * 10);

  const generateDigit = (cpfArray: number[]): number => {
    const sum = cpfArray.reduce((acc: number, val: number, idx: number) => {
      return acc + val * (cpfArray.length + 1 - idx);
    }, 0);
    const remnant = (sum * 10) % 11;
    return remnant === 10 ? 0 : remnant;
  };

  const cpf: number[] = Array.from({ length: 9 }, randomDigits);
  cpf.push(generateDigit(cpf));
  cpf.push(generateDigit(cpf));

  return cpf.join("");
}

@Injectable()
export class UserFactory {
  constructor(private readonly prisma: PrismaService) {}

  async makePrismaUser(data: Partial<UserProps> = {}): Promise<User> {
    const user = makeUser(data);
    await this.prisma.user.create({
      data: PrismaUserMapper.toPrisma(user),
    });
    return user;
  }
  async makePrismaManyRandomUsers(
    data: Partial<UserProps> = {},
    howMany = 1,
  ): Promise<User[]> {
    const users = Array.from({ length: howMany }, () => makeUser(data));
    await this.prisma.user.createMany({
      data: users.map(PrismaUserMapper.toPrisma),
    });

    return users;
  }
}
