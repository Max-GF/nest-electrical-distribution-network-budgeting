import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UnprocessableEntityException,
} from "@nestjs/common";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { NotAllowedError } from "src/core/errors/errors-user-management/not-allowed-error";
import { FetchUsersWithFilteredOptionsUseCase } from "src/domain/user-management/application/use-cases/user/fetch-users-with-filtered-options";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { z } from "zod";
import { UserPresenter } from "../../../presenters/user-management/user-presenter";
import { FetchUsersWithFilteredOptionsDto } from "../../../swagger/user-management/dto/fetch-users-with-filtered-options.dto";
import { FetchUsersWithFilteredOptionsResponse } from "../../../swagger/user-management/responses/fetch-users-with-filtered-options.response";

const fetchUsersWithFilteredOptionsQuerySchema = z.object({
  roles: z
    .string()
    .optional()
    .transform((str) => {
      if (str === undefined) return undefined;
      return str
        .toUpperCase()
        .split(",")
        .map((tag) => tag.trim());
    }),
  basesIds: z
    .string()
    .uuid()
    .optional()
    .transform((str) => {
      if (str === undefined) return undefined;
      return str.split(",").map((tag) => tag.trim());
    }),
  companiesIds: z
    .string()
    .uuid()
    .optional()
    .transform((str) => {
      if (str === undefined) return undefined;
      return str.split(",").map((tag) => tag.trim());
    }),
  isActive: z
    .string()
    .optional()
    .transform((str) => {
      if (str === undefined) return undefined;
      return str.toLowerCase() === "true";
    }),
  page: z
    .string()
    .optional()
    .default("1")
    .transform(Number)
    .pipe(z.number().min(1)),
  pageSize: z
    .string()
    .optional()
    .default("40")
    .transform(Number)
    .pipe(z.number().min(1)),
});
type FetchUsersWithFilteredOptionsQuerySchema = z.infer<
  typeof fetchUsersWithFilteredOptionsQuerySchema
>;
const queryValidationPipe = new ZodValidationPipe(
  fetchUsersWithFilteredOptionsQuerySchema,
);

@ApiTags("User Management")
@Controller("/accounts")
export class FetchUsersWithFilteredOptionsController {
  constructor(
    private fetchUsersWithFilteredOptions: FetchUsersWithFilteredOptionsUseCase,
  ) {}
  @Get()
  @FetchUsersWithFilteredOptionsResponse()
  @ApiQuery({ type: FetchUsersWithFilteredOptionsDto })
  async handle(
    @Query(queryValidationPipe) query: FetchUsersWithFilteredOptionsQuerySchema,
  ): Promise<{
    message: string;
    users: ReturnType<typeof UserPresenter.toHttpWithDetails>[];
  }> {
    const result = await this.fetchUsersWithFilteredOptions.execute({
      ...query,
    });
    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case NotAllowedError:
          throw new UnprocessableEntityException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }
    return {
      message: "Users fetched successfully",
      users: result.value.users.map(UserPresenter.toHttpWithDetails),
    };
  }
}
