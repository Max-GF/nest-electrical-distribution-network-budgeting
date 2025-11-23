import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "src/domain/user-management/enterprise/entities/base-user";
import { UserPayload } from "src/infra/auth/jwt-strategy";

@Injectable()
export class AccessTokenCreator {
  constructor(private jwt: JwtService) {}

  execute(user: User) {
    const signPayload: UserPayload = {
      sub: user.id.toString(),
      role: user.role.value,
      baseId: user.baseId.toString(),
      companyId: user.companyId.toString(),
      type: "accessToken",
    };
    return this.jwt.sign(
      signPayload,
      { expiresIn: "5m" }, // Access token expiration time, adjust as needed for your tests
    );
  }
}
