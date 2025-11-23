import {
  Body,
  Controller,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  Post,
  UnauthorizedException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { NotAllowedError } from "src/core/errors/errors-user-management/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/errors-user-management/resource-not-found-error";
import { TokenExpiredError } from "src/core/errors/errors-user-management/token-expired-error";
import { WrongCredentialsError } from "src/core/errors/errors-user-management/wrong-credentials-error";
import { RefreshAccessTokenUseCase } from "src/domain/user-management/application/use-cases/user/refresh-access-token";
import { Public } from "src/infra/auth/public";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { RefreshAccessTokenDto } from "src/infra/http/swagger/user-management/dto/refresh-access-token.dto";
import { RefreshAccessTokenResponse } from "src/infra/http/swagger/user-management/responses/refresh-access-token.response";
import { z } from "zod";

const refreshAccessTokenBodySchema = z.object({
  refreshToken: z.string(),
});

@ApiTags("Authentication")
@Controller("/refresh-access-token")
@Public()
export class RefreshAccessTokenController {
  constructor(private refreshAccessToken: RefreshAccessTokenUseCase) {}
  @Post()
  @RefreshAccessTokenResponse()
  async handle(
    @Body(new ZodValidationPipe(refreshAccessTokenBodySchema))
    body: RefreshAccessTokenDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const oldRefreshToken = body.refreshToken;
    const result = await this.refreshAccessToken.execute({
      refreshToken: oldRefreshToken,
    });
    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case WrongCredentialsError:
          throw new ForbiddenException(error.message);
        case NotAllowedError:
          throw new UnprocessableEntityException(error.message);
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        case TokenExpiredError:
          throw new UnauthorizedException(error.message);
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
