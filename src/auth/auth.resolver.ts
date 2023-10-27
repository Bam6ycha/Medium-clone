import { Resolver, Mutation, Args, Int, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SignUpInput } from './dto/signUp-input';
import { SignResponse } from './dto/sign-response';
import { SignInInput } from './dto/signIn-input';
import { LogoutResponse } from './dto/logout-response';
import { Public } from './decorators/public.decorator';
import { NewTokensResponse } from './dto/newTokens-response.input';
import { CurrentUser } from './decorators/currentUser.decorator';
import { CurrentUserId } from './decorators/currentUserId.decorator';
import { UseGuards } from '@nestjs/common';
import { RefreshTokenGuard } from './guards/refreshToken.guard';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => String)
  private helloWorld() {
    return 'Hello, World!';
  }

  @Public()
  @Mutation(() => SignResponse)
  private signup(@Args('signUpInput') signUpInput: SignUpInput) {
    return this.authService.signUp(signUpInput);
  }

  @Public()
  @Mutation(() => SignResponse)
  private signIn(@Args('signInInput') signInInput: SignInInput) {
    return this.authService.signIn(signInInput);
  }

  @Mutation(() => LogoutResponse)
  private logout(@Args('id', { type: () => Int }) id: number) {
    return this.authService.logout(id);
  }

  @UseGuards(RefreshTokenGuard)
  @Public()
  @Mutation(() => NewTokensResponse)
  private getTokens(
    @CurrentUserId() userId: number,
    @CurrentUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.getTokens(userId, refreshToken);
  }
}
