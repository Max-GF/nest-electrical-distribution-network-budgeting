import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { z } from "zod";
import { EnvService } from "../env/env.service";

export const tokenPayloadSchema = z.object({
  sub: z.string().uuid(),

  role: z.string(),
  baseId: z.string().uuid(),
  companyId: z.string().uuid(),
  type: z.literal("accessToken"),
});

export type UserPayload = z.infer<typeof tokenPayloadSchema>;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: EnvService) {
    const publicKey = config.get("JWT_PUBLIC_KEY");
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: Buffer.from(publicKey, "base64"),
      algorithms: ["RS256"],
    });
  }
  async validate(payload: UserPayload): Promise<UserPayload> {
    return tokenPayloadSchema.parse(payload);
  }
}
