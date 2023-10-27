import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '@prisma/client';
import { UserEntity } from 'src/user/user.entity';

@ObjectType()
export class CreateUserResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => UserEntity)
  user: User;
}
