import { UseCaseError } from "src/core/errors/use-case-error";

export class InvalidAvatarTypeError extends Error implements UseCaseError {
  constructor(errorText?: string) {
    super(errorText ?? "Not valid file type");
  }
}
