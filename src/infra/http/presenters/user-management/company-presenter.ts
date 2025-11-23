import { Company } from "src/domain/user-management/enterprise/entities/company";
import { CompanyWithBases } from "src/domain/user-management/enterprise/entities/value-objects/company-with-bases";

export class CompanyPresenter {
  static toHttp(company: Company) {
    return {
      id: company.id.toString(),
      name: company.name,
      cnpj: company.cnpj.value,
    };
  }
  static toHttpWithBases(company: CompanyWithBases) {
    return {
      id: company.id,
      name: company.name,
      cnpj: company.cnpj,
      bases: company.bases.map((base) => {
        return { id: base.id.toString(), name: base.name };
      }),
    };
  }
}
