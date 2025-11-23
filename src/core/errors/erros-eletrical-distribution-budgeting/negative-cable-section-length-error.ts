import { UseCaseError } from "src/core/errors/use-case-error";

export class NegativeCableSectionError extends Error implements UseCaseError {
  constructor(errorText?: string) {
    super(
      errorText ?? "Negative values are not allowed for cable section area.",
    );
  }
}
