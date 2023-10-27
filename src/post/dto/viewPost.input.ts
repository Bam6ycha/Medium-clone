import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber } from 'class-validator';

@InputType()
export class ViewPostInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  id: number;
}
