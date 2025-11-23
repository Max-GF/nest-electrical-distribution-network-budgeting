import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import {
  Company,
  CompanyProps,
} from "src/domain/user-management/enterprise/entities/company";
import { Cnpj } from "src/domain/user-management/enterprise/entities/value-objects/cnpj";
import { PrismaCompanyMapper } from "src/infra/database/prisma/mappers/user-management/prisma-company-mapper";
import { PrismaService } from "src/infra/database/prisma/prisma.service";

export function makeCompany(
  override: Partial<CompanyProps> = {},
  id?: UniqueEntityID,
) {
  const company = Company.create(
    {
      name: faker.company.name(),
      cnpj: Cnpj.create(generateCNPJ()),

      ...override,
    },
    id,
  );

  return company;
}

function generateCNPJ(): string {
  const randomDigit = (): number => Math.floor(Math.random() * 10);

  const calculateCheckDigit = (cnpjArray: number[]): number => {
    const weights =
      cnpjArray.length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    const sum = cnpjArray.reduce(
      (accumulator: number, current: number, index: number) =>
        accumulator + current * weights[index],
      0,
    );

    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const cnpj: number[] = [
    randomDigit(),
    randomDigit(),
    randomDigit(),
    randomDigit(),
    randomDigit(),
    randomDigit(),
    randomDigit(),
    randomDigit(),
    0,
    0,
    0,
    1,
  ];

  const firstCheckDigit = calculateCheckDigit(cnpj);
  cnpj.push(firstCheckDigit);

  const secondCheckDigit = calculateCheckDigit(cnpj);
  cnpj.push(secondCheckDigit);

  return cnpj.join("");
}

@Injectable()
export class CompanyFactory {
  constructor(private readonly prisma: PrismaService) {}

  async makePrismaCompany(data: Partial<CompanyProps> = {}): Promise<Company> {
    const company = makeCompany(data);
    await this.prisma.company.create({
      data: PrismaCompanyMapper.toPrisma(company),
    });
    return company;
  }
  async makePrismaManyRandomCompanies(
    data: Partial<CompanyProps> = {},
    howMany = 1,
  ): Promise<Company[]> {
    const companies = Array.from({ length: howMany }, () => makeCompany(data));
    await this.prisma.company.createMany({
      data: companies.map(PrismaCompanyMapper.toPrisma),
    });

    return companies;
  }
}
