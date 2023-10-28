import { Resolver, Mutation, Args, Int, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SignInInput } from './dto/signIn-input';
import { LogoutResponse } from './dto/logout-response';
import { Public } from './decorators/public.decorator';
import { NewTokensResponse } from './dto/newTokens-response.input';
import { CurrentUser } from './decorators/currentUser.decorator';
import { CurrentUserId } from './decorators/currentUserId.decorator';
import { UseGuards } from '@nestjs/common';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { SignResponse } from './dto/signIn-response';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => String)
  public helloWorld() {
    return 'Hello, World!';
  }

  @Public()
  @Mutation(() => SignResponse)
  public signIn(@Args('signInInput') signInInput: SignInInput) {
    return this.authService.signIn(signInInput);
  }

  @Mutation(() => LogoutResponse)
  public logout(@Args('id', { type: () => Int }) id: number) {
    return this.authService.logout(id);
  }

  @Mutation(() => NewTokensResponse)
  @UseGuards(RefreshTokenGuard)
  @Public()
  public getTokens(
    @CurrentUserId() userId: number,
    @CurrentUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.getTokens(userId, refreshToken);
  }
}
