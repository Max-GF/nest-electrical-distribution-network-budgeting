import { UseCaseError } from "src/core/errors/use-case-error";

export class WrongCredentialsError extends Error implements UseCaseError {
  constructor(errorText?: string) {
    super(errorText ?? "Credentials are not valid.");
  }
}
