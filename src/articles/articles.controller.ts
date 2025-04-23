import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @ApiOperation({ summary: 'Get recent articles globally' })
  @ApiQuery({ name: 'tag', required: false, description: 'Filter by tag' })
  @ApiQuery({ name: 'author', required: false, description: 'Filter by author (username)' })
  @ApiQuery({ name: 'favorited', required: false, description: 'Filter by favorites of a user (username)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit number of articles returned (default is 20)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset/skip number of articles (default is 0)' })
  @ApiResponse({ status: 200, description: 'Returns list of articles' })
  @UseGuards(OptionalJwtAuthGuard)
  async listArticles(
    @Query('tag') tag?: string,
    @Query('author') author?: string,
    @Query('favorited') favorited?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Request() req?: any,
  ) {
    const currentUserId = req.user?.id;
    return this.articlesService.listArticles(
      { tag, author, favorited, limit, offset },
      currentUserId,
    );
  }

  @Get('feed')
  @ApiOperation({ summary: 'Get recent articles from users you follow' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit number of articles returned (default is 20)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset/skip number of articles (default is 0)' })
  @ApiResponse({ status: 200, description: 'Returns articles from followed users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getFeed(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Request() req?: any,
  ) {
    return this.articlesService.getFeed(req.user.id, { limit, offset });
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get an article' })
  @ApiParam({ name: 'slug', description: 'Slug of the article to get' })
  @ApiResponse({ status: 200, description: 'Returns the article' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @UseGuards(OptionalJwtAuthGuard)
  async getArticle(
    @Param('slug') slug: string,
    @Request() req?: any,
  ) {
    const currentUserId = req.user?.id;
    return this.articlesService.findBySlug(slug, currentUserId);
  }

  @Post()
  @ApiOperation({ summary: 'Create an article' })
  @ApiResponse({ status: 201, description: 'Article created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 422, description: 'Validation error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createArticle(
    @Body('article') createArticleDto: CreateArticleDto,
    @Request() req,
  ) {
    return this.articlesService.createArticle(req.user.id, createArticleDto);
  }

  @Put(':slug')
  @ApiOperation({ summary: 'Update an article' })
  @ApiParam({ name: 'slug', description: 'Slug of the article to update' })
  @ApiResponse({ status: 200, description: 'Article updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateArticle(
    @Param('slug') slug: string,
    @Body('article') updateArticleDto: UpdateArticleDto,
    @Request() req,
  ) {
    return this.articlesService.updateArticle(slug, req.user.id, updateArticleDto);
  }

  @Delete(':slug')
  @ApiOperation({ summary: 'Delete an article' })
  @ApiParam({ name: 'slug', description: 'Slug of the article to delete' })
  @ApiResponse({ status: 200, description: 'Article deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async deleteArticle(
    @Param('slug') slug: string,
    @Request() req,
  ) {
    await this.articlesService.deleteArticle(slug, req.user.id);
    return {};
  }

  @Post(':slug/favorite')
  @ApiOperation({ summary: 'Favorite an article' })
  @ApiParam({ name: 'slug', description: 'Slug of the article to favorite' })
  @ApiResponse({ status: 200, description: 'Article favorited successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async favoriteArticle(
    @Param('slug') slug: string,
    @Request() req,
  ) {
    return this.articlesService.favoriteArticle(slug, req.user.id);
  }

  @Delete(':slug/favorite')
  @ApiOperation({ summary: 'Unfavorite an article' })
  @ApiParam({ name: 'slug', description: 'Slug of the article to unfavorite' })
  @ApiResponse({ status: 200, description: 'Article unfavorited successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async unfavoriteArticle(
    @Param('slug') slug: string,
    @Request() req,
  ) {
    return this.articlesService.unfavoriteArticle(slug, req.user.id);
  }
}
