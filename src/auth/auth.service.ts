import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SignUpInput } from './dto/signUp-input';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { hash, verify } from 'argon2';
import { UserRole } from '@prisma/client';
import { SignResponse } from './dto/sign-response';
import { SignInInput } from './dto/signIn-input';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private prisma: PrismaService,
    private jswService: JwtService,
    private configService: ConfigService,
  ) {}

  public async signUp({
    password,
    email,
    username,
    role,
  }: SignUpInput): Promise<SignResponse> {
    try {
      const passwordHash = await hash(password);

      const newUser = await this.prisma.user.create({
        data: { passwordHash, email, name: username, role },
      });

      const { accessToken, refreshToken } = this.createTokens(
        newUser.id,
        newUser.email,
        newUser.role,
      );

      await this.updateRefreshToken(newUser.id, refreshToken);

      return { accessToken, refreshToken, user: newUser };
    } catch (error: unknown) {
      this.logger.error((error as Error).message);
    }
  }

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
      );

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
      this.createTokens(user.id, user.email);

    await this.updateRefreshToken(user.id, refreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToke };
  }

  private createTokens(
    userId: number,
    email: string,
    role: UserRole = 'user',
  ): { accessToken: string; refreshToken: string } {
    const tokenARGS = { userId, email, role };

    const accessToken = this.jswService.sign(tokenARGS, {
      expiresIn: '15s',
      secret: this.configService.get('ACS_TOKEN_SECRET'),
    });

    const refreshToken = this.jswService.sign(tokenARGS, {
      expiresIn: '7d',
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
    });

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: number, refreshToken: string) {
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
