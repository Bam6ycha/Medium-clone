import { InputType, Field } from '@nestjs/graphql';
import { UserRole } from '@prisma/client';
import { IsString, IsNotEmpty, IsIn, IsEmail } from 'class-validator';

@InputType()
export class SignUpInput {
  @IsNotEmpty()
  @IsString()
  @Field()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  @Field()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Field()
  password: string;

  @IsIn(Object.keys(UserRole))
  @Field()
  role: UserRole;
}
