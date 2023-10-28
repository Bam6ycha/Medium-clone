import { ObjectType, Field, Int } from '@nestjs/graphql';
import { UserEntity } from '../user/user.entity';

@ObjectType()
export class PostEntity {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  title: string;

  @Field(() => String)
  content: string;

  @Field(() => [UserEntity])
  viewers: UserEntity[];
}
