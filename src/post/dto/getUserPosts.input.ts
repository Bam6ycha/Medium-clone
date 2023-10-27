import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { GetAllPostsInput } from './getAllPosts.input';

@InputType()
export class GetUserPostsInput extends GetAllPostsInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
