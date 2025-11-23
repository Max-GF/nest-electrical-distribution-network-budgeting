import { TokenExpiredError } from "src/core/errors/errors-user-management/token-expired-error";
import { WrongCredentialsError } from "src/core/errors/errors-user-management/wrong-credentials-error";
import { Encrypter } from "src/domain/user-management/application/cryptography/encrypter";

export class FakeEncrypter implements Encrypter {
  async encrypt(
    payload: Record<string, unknown>,
    expiresIn?: string,
  ): Promise<string> {
    const now = Date.now();
    const exp =
      now + (expiresIn === undefined ? 1000 * 60 * 60 : parseInt(expiresIn)); // Expire in 1 hour (Just for testing)

    const fullPayload = { ...payload, exp };
    return JSON.stringify(fullPayload);
  }

  async decrypt(refreshToken: string): Promise<Record<string, unknown>> {
    const payload = JSON.parse(refreshToken);
    const now = Date.now();
    if (payload.exp && payload.exp < now) {
      throw new TokenExpiredError("Token has expired");
    }
    if (payload === null || typeof payload !== "object") {
      throw new WrongCredentialsError(
        "Invalid token format. Expected an object.",
      );
    }

    return payload;
  }
}
