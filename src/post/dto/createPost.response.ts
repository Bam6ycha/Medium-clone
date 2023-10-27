import { Field, Int, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@ObjectType()
export class CreatePostResponse {
  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => String)
  @IsString()
  content: string;
}
