import { UseCaseError } from "src/core/errors/use-case-error";

export class TokenExpiredError extends Error implements UseCaseError {
  constructor(errorText?: string) {
    super(errorText ?? "Token has expired");
  }
}
