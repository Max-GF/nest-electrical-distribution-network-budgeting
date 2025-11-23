import { UseCaseError } from "src/core/errors/use-case-error";

export class AlreadyRegisteredError extends Error implements UseCaseError {
  constructor(errorText?: string) {
    super(errorText ?? "Already registered");
  }
}
