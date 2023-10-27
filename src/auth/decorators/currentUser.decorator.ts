import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { JWTPayloadWithRefreshToken } from '../types';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (
    data: keyof JWTPayloadWithRefreshToken | undefined,
    context: ExecutionContext,
  ) => {
    const request = GqlExecutionContext.create(context).getContext().req;

    return data ? request.user[data] : request.user;
  },
);
