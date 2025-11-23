export abstract class Encrypter {
  abstract encrypt(
    payload: Record<string, unknown>,
    expiresIn: string,
  ): Promise<string>;
  abstract decrypt(refreshToken: string): Promise<Record<string, unknown>>;
}
