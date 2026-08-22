import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "../config";
import { Role } from "@prisma/client";

export type JwtPayload = {
  userId: string;
  role: Role;
};

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, config.jwtAccessSecret, {
    expiresIn: config.jwtAccessExpires,
  } as SignOptions);
}

export function signRefreshToken(payload: JwtPayload) {
  return jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpires,
  } as SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtAccessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtRefreshSecret) as JwtPayload;
}
