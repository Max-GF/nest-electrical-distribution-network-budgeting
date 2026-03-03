# Copilot Instructions - NestJS Electrical Distribution Budgeting Project

This document outlines the coding standards, patterns, and best practices for this project. Follow these instructions when generating code.

## 1. Architecture & Structure
- **Clean Architecture**: The project follows strict separation of concerns:
  - `src/domain`: Enterprise logic, Entities, Value Objects, Use Cases, Repository Interfaces.
  - `src/core`: Shared kernel, generic errors, base classes (Entity, ValueObject, Either).
  - `src/infra`: Framework implementation (NestJS), Controllers, Database (Prisma), Presenters.
- **Modules**: Organize features by domain modules (e.g., `eletrical-distribution-budgeting`, `user-management`).

## 2. DTOs & Validation
- **Libraries**: Use `class-validator` and `class-transformer`.
- **Nested Objects**: Always use `@ValidateNested()` and `@Type(() => ClassName)` for nested objects or arrays of objects.
- **Polymorphism**: For entities with polymorphic items (like `Group` items):
  - Create a base DTO or a union type DTO.
  - Include all possible fields as optional (`@IsOptional()`) if using a single DTO strategy, or use specific sub-DTOs if the structure allows.
  - Validate the `type` field (Enum).
- **Query Params**: Use `@Transform(({ value }) => Number(value))` for numeric query parameters (page, pageSize) to ensure correct types.
- **Strictness**: Use `!` for required properties in DTO classes to avoid TypeScript initialization errors (e.g., `name!: string;`).

## 3. Controllers & HTTP
- **Decorators**: Use standard NestJS decorators (`@Controller`, `@Post`, `@Get`, `@Body`, `@Query`, `@Param`).
- **Swagger**:
  - Use `@ApiTags`, `@ApiOperation`, `@ApiResponse`.
  - Define separate Response classes in `src/infra/http/swagger/.../responses/`.
  - Use `@ApiProperty` for all exposed fields.
  - For polymorphic responses, use `@ApiExtraModels` and `oneOf` schema.
- **Error Handling**:
  - Use Cases return `Either<Error, Result>`.
  - Controllers must check `result.isLeft()` and throw appropriate NestJS exceptions:
    - `AlreadyRegisteredError` -> `ConflictException`
    - `ResourceNotFoundError` -> `NotFoundException`
    - `NotAllowedError` -> `BadRequestException` (or `ForbiddenException` depending on context).
- **Presenters**: Use Presenters (e.g., `GroupPresenter`) to map Domain Entities to HTTP Responses. Do not return Domain Entities directly.

## 4. Testing (E2E)
- **Framework**: `vitest` with `supertest`.
- **Setup**: Use `makeUser`, `makeCompany`, etc., from `test/factories`.
- **Authentication**:
  - Create a user and company.
  - Generate a JWT token using `jwt.sign()`.
  - Pass token in `Authorization` header: `.set("Authorization", \`Bearer ${accessToken}\`)`.
- **Data Creation**:
  - Use Repositories to seed data.
  - **Important**: Use `createMany` or `create` methods. Avoid `save` if it implies update-or-create logic unless specifically intended.
- **Value Objects**: When creating entities in tests, use Value Object factory methods (e.g., `TensionLevel.create("MEDIUM")`) instead of casting strings to `any`.
- **Assertions**:
  - Check status code.
  - Check response body structure.
  - Verify persistence in the database using the Repository.

## 5. Prisma & Database
- **Repositories**: Implement Domain Repository interfaces.
- **Mappers**: Use Mappers to convert between Domain Entities and Prisma types.
- **Transactions**: Use `this.prisma.$transaction` for operations involving multiple tables (e.g., `Group` + `GroupItem`).
- **Naming**: Follow the pattern `Prisma[Entity]Repository`.

## 6. Specific Entity Patterns
- **Group Entity**:
  - Contains a list of `GroupItem`.
  - `GroupItem` is polymorphic (`material`, `poleScrew`, `cableConnector`).
  - When mapping in Controllers, handle each type specifically to map relevant fields (e.g., `materialId` for materials, `lengthAdd` for pole screws).

## 7. Common Corrections to Avoid
- **Do not cast to `any`**: Fix types properly, especially for Enums/Value Objects.
- **Query Param Types**: Always transform numeric query params.
- **DTO Initialization**: Initialize DTO properties or use `!` to satisfy strict property initialization.
- **Repository Methods**: Ensure the method exists on the abstract class before using it in tests.
