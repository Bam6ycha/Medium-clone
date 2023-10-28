import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { hash, verify } from 'argon2';
import { UserRole } from '@prisma/client';
import { SignInInput } from './dto/signIn-input';
import { SignResponse } from './dto/signIn-response';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private prisma: PrismaService,
    private jswService: JwtService,
    private configService: ConfigService,
  ) {}

  public async signIn({ email, password }: SignInInput): Promise<SignResponse> {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });

      if (!user) {
        throw new ForbiddenException('Access denied');
      }

      const isPasswordMatch = await verify(user.passwordHash, password);

      if (!isPasswordMatch) {
        throw new ForbiddenException('Access denied');
      }

      const { accessToken, refreshToken } = this.createTokens(
        user.id,
        user.email,
        user.role,
      );

      await this.updateRefreshToken(user.id, refreshToken);

      return { accessToken, refreshToken, user };
    } catch (error: unknown) {
      this.logger.error((error as Error).message);
      throw new BadRequestException((error as Error).message);
    }
  }

  public async logout(userId: number) {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId, refreshTokenHash: { not: null } },
        data: { refreshTokenHash: null },
      });

      if (!user) {
        throw new NotFoundException(
          `Could not found user by provided id:${userId}, or you already have been logout`,
        );
      }

      return { loggedOut: true };
    } catch (error) {
      throw new NotFoundException(
        `Could not found user by provided id:${userId}`,
      );
    }
  }

  public async getTokens(userId: number, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new ForbiddenException('Access denied');
    }

    const isRefreshTokenMatch = await verify(
      user.refreshTokenHash,
      refreshToken,
    );

    if (!isRefreshTokenMatch) {
      throw new ForbiddenException('Access denied');
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToke } =
      this.createTokens(user.id, user.email, user.role);

    await this.updateRefreshToken(user.id, refreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToke };
  }

  public createTokens(
    userId: number,
    email: string,
    role: UserRole = 'user',
  ): { accessToken: string; refreshToken: string } {
    const tokenARGS = { userId, email, role };

    const accessToken = this.jswService.sign(tokenARGS, {
      expiresIn: '1d',
      secret: this.configService.get('ACCESS_TOKEN_SECRET'),
    });

    const refreshToken = this.jswService.sign(tokenARGS, {
      expiresIn: '7d',
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
    });

    return { accessToken, refreshToken };
  }

  public async updateRefreshToken(userId: number, refreshToken: string) {
    try {
      const refreshTokenHash = await hash(refreshToken);

      await this.prisma.user.update({
        where: { id: userId },
        data: { refreshTokenHash },
      });
    } catch (error: unknown) {
      this.logger.error((error as Error).message);
      throw new BadRequestException((error as Error).message);
    }
  }
}
