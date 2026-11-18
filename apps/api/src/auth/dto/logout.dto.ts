import {
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class LogoutDto {
  @IsString()
  @Length(40, 512)
  @Matches(/^[A-Za-z0-9_-]+$/)
  refreshToken!: string;
}