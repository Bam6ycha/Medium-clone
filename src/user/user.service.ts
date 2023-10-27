import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetUsersInput } from './dto/getUsers.input';
import { UserRole } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { hash } from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateUserInput } from './dto/createUser.input';
import { CreateUserResponse } from './dto/createUser-response';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  public async getUsers({
    limit,
    offset,
  }: GetUsersInput): Promise<
    { name: string; email: string; role: UserRole }[]
  > {
    try {
      return await this.prisma.user.findMany({
        select: { name: true, email: true, role: true },
        skip: offset,
        take: limit,
      });
    } catch (error) {
      this.logger.error((error as Error).message);
      throw new BadRequestException((error as Error).message);
    }
  }

  public async getUser(id: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });

      if (!user) {
        throw new NotFoundException(`User with id:${id} was not found`);
      }

      return user;
    } catch (error) {
      this.logger.error((error as Error).message);

      throw new BadRequestException((error as Error).message);
    }
  }

  public async createUser({
    password,
    email,
    username,
    role,
  }: CreateUserInput): Promise<CreateUserResponse> {
    try {
      const passwordHash = await hash(password);

      const newUser = await this.prisma.user.create({
        data: { passwordHash, email, name: username, role },
      });

      const { accessToken, refreshToken } = this.authService.createTokens(
        newUser.id,
        newUser.email,
        newUser.role,
      );

      await this.authService.updateRefreshToken(newUser.id, refreshToken);

      return { accessToken, refreshToken, user: newUser };
    } catch (error: unknown) {
      this.logger.error((error as Error).message);

      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            `Unique constraint failed on the ${email}`,
          );
        }
      }

      throw new BadRequestException((error as Error).message);
    }
  }
}
