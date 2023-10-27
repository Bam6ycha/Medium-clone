import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber } from 'class-validator';

@InputType()
export class GetAllPostsInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  cursor: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  limit: number;
}
