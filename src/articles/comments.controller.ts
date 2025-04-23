import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Comments')
@Controller('articles/:slug/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get comments for an article' })
  @ApiParam({ name: 'slug', description: 'Slug of the article that you want to get comments for' })
  @ApiResponse({ status: 200, description: 'Returns comments for article' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @UseGuards(OptionalJwtAuthGuard)
  async getComments(
    @Param('slug') slug: string,
    @Request() req,
  ) {
    const currentUserId = req.user?.id;
    return this.commentsService.getComments(slug, currentUserId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a comment for an article' })
  @ApiParam({ name: 'slug', description: 'Slug of the article that you want to create a comment for' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createComment(
    @Param('slug') slug: string,
    @Body('comment') createCommentDto: CreateCommentDto,
    @Request() req,
  ) {
    return this.commentsService.addComment(slug, req.user.id, createCommentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment for an article' })
  @ApiParam({ name: 'slug', description: 'Slug of the article that you want to delete a comment for' })
  @ApiParam({ name: 'id', description: 'ID of the comment you want to delete' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Article or comment not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @Param('slug') slug: string,
    @Param('id') commentId: number,
    @Request() req,
  ) {
    await this.commentsService.deleteComment(slug, commentId, req.user.id);
    return {};
  }
}
