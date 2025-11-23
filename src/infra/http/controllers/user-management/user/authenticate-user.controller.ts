import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { NotAllowedError } from "src/core/errors/errors-user-management/not-allowed-error";
import { WrongCredentialsError } from "src/core/errors/errors-user-management/wrong-credentials-error";
import { AuthenticateUserUseCase } from "src/domain/user-management/application/use-cases/user/authenticate-user";
import { Public } from "src/infra/auth/public";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { z } from "zod";
import { AuthenticateUserDto } from "../../../swagger/user-management/dto/authenticate.dto";
import { AuthenticateUserResponse } from "../../../swagger/user-management/responses/authenticate.response";

const authenticateUserBodySchema = z.object({
  email: z.string().email().optional(),
  cpf: z.string().optional(),
  password: z.string().min(6).max(100),
});

@ApiTags("Authentication")
@Controller("/authenticate")
@Public()
export class AuthenticateUserController {
  constructor(private authenticateUser: AuthenticateUserUseCase) {}
  @Post()
  @AuthenticateUserResponse()
  async handle(
    @Body(new ZodValidationPipe(authenticateUserBodySchema))
    body: AuthenticateUserDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, cpf, password } = body;
    const result = await this.authenticateUser.execute({
      email: email,
      cpf: cpf,
      password,
    });
    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case WrongCredentialsError:
          throw new UnauthorizedException(error.message);
        case NotAllowedError:
          throw new BadRequestException(error.message);
        default:
          throw new InternalServerErrorException(error.message);
      }
    }
    const { accessToken, refreshToken } = result.value;
    return {
      accessToken,
      refreshToken,
    };
  }
}
