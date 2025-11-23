import { Controller, Get } from "@nestjs/common";
import { ApiExcludeEndpoint } from "@nestjs/swagger";
import { CurrentUser } from "src/infra/auth/current-user.decorator";
import { UserPayload } from "src/infra/auth/jwt-strategy";
import { Roles } from "src/infra/auth/roles.decorator";

@Controller("/test-guards")
export class TestGuardsController {
  @Get()
  @ApiExcludeEndpoint()
  @Roles("ADMIN")
  async handle(@CurrentUser() user: UserPayload): Promise<string> {
    console.log("user", user);
    return "test-guards";
  }
}
