import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';
import { GetUsersInput } from './dto/getUsers.input';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from 'src/auth/guards/roleGuard.guard';
import { UserRoles } from 'src/auth/decorators/role.decorator';
import { UserRole } from '@prisma/client';
import { CreateUserResponse } from './dto/createUser-response';
import { CreateUserInput } from './dto/createUser.input';

@Resolver()
@UseGuards(RolesGuard)
@UserRoles(UserRole.user)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [UserEntity])
  private getUsers(@Args('getUsersInput') getUsersInput: GetUsersInput) {
    return this.userService.getUsers(getUsersInput);
  }

  @Query(() => UserEntity)
  private getUser(@Args('id', { type: () => Int }) id: number) {
    return this.userService.getUser(id);
  }

  @Mutation(() => CreateUserResponse)
  private createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ) {
    return this.userService.createUser(createUserInput);
  }
}
