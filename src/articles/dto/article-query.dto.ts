import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ArticleQueryDto {
  @ApiProperty({
    description: 'Filter by tag',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly tag?: string;

  @ApiProperty({
    description: 'Filter by author (username)',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly author?: string;

  @ApiProperty({
    description: 'Filter by favorited (username)',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly favorited?: string;

  @ApiProperty({
    description: 'Limit number of articles returned (default is 20)',
    required: false,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  readonly limit?: number = 20;

  @ApiProperty({
    description: 'Offset/skip number of articles (default is 0)',
    required: false,
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly offset?: number = 0;
}
