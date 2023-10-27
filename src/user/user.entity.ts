import { ObjectType, Field, Int } from '@nestjs/graphql';
import { UserRole } from '@prisma/client';

@ObjectType()
export class UserEntity {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  role: UserRole;
}
