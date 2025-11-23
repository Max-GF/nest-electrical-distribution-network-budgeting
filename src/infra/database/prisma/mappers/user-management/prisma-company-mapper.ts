import {
  Base as PrismaBase,
  Company as PrismaCompany,
} from "prisma/generated/client";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { Company as DomainCompany } from "src/domain/user-management/enterprise/entities/company";
import { Cnpj } from "src/domain/user-management/enterprise/entities/value-objects/cnpj";
import { CompanyWithBases as DomainCompanyWithBases } from "src/domain/user-management/enterprise/entities/value-objects/company-with-bases";
import { PrismaBaseMapper } from "./prisma-base-mapper";

type PrismaCompanyWithBases = PrismaCompany & {
  bases: PrismaBase[];
};

export class PrismaCompanyMapper {
  static toPrisma(raw: DomainCompany): PrismaCompany {
    return {
      id: raw.id.toString(),
      name: raw.name,
      cnpj: raw.cnpj.value,
    };
  }
  static toDomain(raw: PrismaCompany): DomainCompany {
    return DomainCompany.create(
      {
        name: raw.name,
        cnpj: Cnpj.create(raw.cnpj),
      },
      new UniqueEntityID(raw.id),
    );
  }
  static toDomainWithBases(
    raw: PrismaCompanyWithBases,
  ): DomainCompanyWithBases {
    return DomainCompanyWithBases.create({
      id: raw.id,
      name: raw.name,
      cnpj: raw.cnpj,
      bases: raw.bases.map(PrismaBaseMapper.toDomain),
    });
  }
}
