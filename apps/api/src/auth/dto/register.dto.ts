import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @MaxLength(191)
  email!: string;

  @IsString()
  @Length(3, 100)
  @Matches(/^[a-zA-Z0-9_.-]+$/)
  username!: string;

  @IsString()
  @Length(12, 128)
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;
}