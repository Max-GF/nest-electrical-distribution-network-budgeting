import { Injectable } from "@nestjs/common";
import {
  JwtService,
  TokenExpiredError as TokenExpiredErrorJwt,
} from "@nestjs/jwt";
import { TokenExpiredError } from "src/core/errors/errors-user-management/token-expired-error";
import { WrongCredentialsError } from "src/core/errors/errors-user-management/wrong-credentials-error";
import { Encrypter } from "src/domain/user-management/application/cryptography/encrypter";

@Injectable()
export class JwtEncrypter implements Encrypter {
  constructor(private jwtService: JwtService) {}
  async decrypt(refreshToken: string): Promise<Record<string, unknown>> {
    try {
      const payload =
        await this.jwtService.verifyAsync<Record<string, unknown>>(
          refreshToken,
        );
      return payload;
    } catch (error) {
      console.error("Error decrypting token:", error);

      if (error instanceof TokenExpiredErrorJwt) {
        throw new TokenExpiredError(error.message);
      }
      throw new WrongCredentialsError("Invalid or expired token.");
    }
  }

  encrypt(
    payload: Record<string, unknown>,
    expiresIn: string,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, { expiresIn });
  }
}
