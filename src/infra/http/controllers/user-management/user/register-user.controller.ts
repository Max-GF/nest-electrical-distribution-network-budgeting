import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Post,
  UnprocessableEntityException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AlreadyRegisteredError } from "src/core/errors/errors-user-management/already-registered-error";
import { NotAllowedError } from "src/core/errors/errors-user-management/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/errors-user-management/resource-not-found-error";
import { RegisterUserUseCase } from "src/domain/user-management/application/use-cases/user/register-user";
import { Public } from "src/infra/auth/public";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { z } from "zod";
import { UserPresenter } from "../../../presenters/user-management/user-presenter";
import { RegisterUserDto } from "../../../swagger/user-management/dto/register-user.dto";
import { RegisterUserResponse } from "../../../swagger/user-management/responses/register-user.response";

const registerUserBodySchema = z.object({
  cpf: z.string(),

  name: z.string().toUpperCase(),
  email: z.string(),
  password: z.string().min(6),
  role: z.string().toUpperCase(),

  baseId: z.string().uuid(),
  companyId: z.string().uuid(),
  avatarId: z.string().optional(),
});

@ApiTags("User Management")
@Controller("/accounts")
@Public()
export class RegisterUserController {
  constructor(private registerUser: RegisterUserUseCase) {}
  @Post()
  @RegisterUserResponse()
  async handle(
    @Body(new ZodValidationPipe(registerUserBodySchema))
    body: RegisterUserDto,
  ): Promise<{
    message: string;
    user: ReturnType<typeof UserPresenter.toHttp>;
  }> {
    const { cpf, name, email, password, role, baseId, companyId, avatarId } =
      body;
    const result = await this.registerUser.execute({
      cpf,
      name,
      email,
      password,
      role,
      baseId,
      companyId,
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
          throw new UnprocessableEntityException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }
    return {
      message: "User created successfully",
      user: UserPresenter.toHttp(result.value.user),
    };
  }
}
