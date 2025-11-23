import { UseCaseError } from "src/core/errors/use-case-error";

export class ResourceNotFoundError extends Error implements UseCaseError {
  constructor(errorText?: string) {
    super(errorText ?? "Resource not found");
  }
}
