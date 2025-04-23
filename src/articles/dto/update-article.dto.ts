import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateArticleDto {
  @IsOptional()
  @IsString()
  readonly title?: string;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @IsOptional()
  @IsString()
  readonly body?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly tagList?: string[];
}
