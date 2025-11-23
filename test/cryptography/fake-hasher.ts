import { HashComparer } from "src/domain/user-management/application/cryptography/hash-comparer";
import { HashGenerator } from "src/domain/user-management/application/cryptography/hash-generator";

export class FakeHasher implements HashGenerator, HashComparer {
  async hash(plainText: string): Promise<string> {
    return plainText.concat("-hashed");
  }
  async compare(plainText: string, hashedText: string): Promise<boolean> {
    return plainText.concat("-hashed") === hashedText;
  }
}
