import { ApiProperty } from '@nestjs/swagger';
import { ProfileResponseDto } from '../../users/dto/profile-response.dto';

export class ArticleResponseDto {
  @ApiProperty()
  slug: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  body: string;

  @ApiProperty({ type: [String] })
  tagList: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  favorited: boolean;

  @ApiProperty()
  favoritesCount: number;

  @ApiProperty({ type: ProfileResponseDto })
  author: ProfileResponseDto;
}

export class MultipleArticlesResponseDto {
  @ApiProperty({ type: [ArticleResponseDto] })
  articles: ArticleResponseDto[];

  @ApiProperty()
  articlesCount: number;
}

export class SingleArticleResponseDto {
  @ApiProperty({ type: ArticleResponseDto })
  article: ArticleResponseDto;
}
