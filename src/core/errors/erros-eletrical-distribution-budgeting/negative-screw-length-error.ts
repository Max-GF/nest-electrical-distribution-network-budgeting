import { UseCaseError } from "src/core/errors/use-case-error";

export class NegativeScrewLengthError extends Error implements UseCaseError {
  constructor(errorText?: string) {
    super(errorText ?? "Negative values are not allowed for screw enum.");
  }
}
