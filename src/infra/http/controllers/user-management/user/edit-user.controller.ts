import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Put,
  UnprocessableEntityException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AlreadyRegisteredError } from "src/core/errors/errors-user-management/already-registered-error";
import { NotAllowedError } from "src/core/errors/errors-user-management/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/errors-user-management/resource-not-found-error";
import { EditUserUseCase } from "src/domain/user-management/application/use-cases/user/edit-user";
import { CurrentUser } from "src/infra/auth/current-user.decorator";
import { UserPayload } from "src/infra/auth/jwt-strategy";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { UserPresenter } from "src/infra/http/presenters/user-management/user-presenter";
import { EditUserDto } from "src/infra/http/swagger/user-management/dto/edit-user.dto";
import { EditUserResponse } from "src/infra/http/swagger/user-management/responses/edit-user.response";
import { z } from "zod";

const editUserBodySchema = z.object({
  name: z.string().max(100).toUpperCase().optional(),
  email: z.string().email().toUpperCase().optional(),
  password: z.string().min(6).max(100).optional(),

  role: z.string().toUpperCase().optional(),

  baseId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),

  isActive: z.boolean().optional(),

  avatarId: z.string().uuid().optional().nullable(),
});

@ApiTags("User Management")
@Controller("/accounts/:id")
export class EditUserController {
  constructor(private editUser: EditUserUseCase) {}
  @Put()
  @EditUserResponse()
  async handle(
    @Body(new ZodValidationPipe(editUserBodySchema))
    body: EditUserDto,
    @Param("id") userId: string,

    @CurrentUser() user: UserPayload,
  ): Promise<{
    message: string;
    user: ReturnType<typeof UserPresenter.toHttp>;
  }> {
    const {
      baseId,
      companyId,
      avatarId,
      email,
      isActive,
      name,
      password,
      role,
    } = body;
    const result = await this.editUser.execute({
      actualUserRole: user.role,
      userId,
      name,
      email,
      password,
      role,
      baseId,
      companyId,
      isActive,
      avatarId,
    });
    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        case AlreadyRegisteredError:
          throw new ConflictException(error.message);
        case NotAllowedError:
          if (error.message === "Invalid permission") {
            throw new ForbiddenException(error.message);
          } else {
            throw new UnprocessableEntityException(error.message);
          }
        default:
          throw new BadRequestException(error.message);
      }
    }
    return {
      message: "User edited successfully",
      user: UserPresenter.toHttp(result.value.user),
    };
  }
}
