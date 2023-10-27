import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber } from 'class-validator';

@InputType()
export class GetUsersInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  offset: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  limit: number;
}
