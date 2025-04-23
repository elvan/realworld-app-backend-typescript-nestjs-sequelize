import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Article } from './models/article.model';
import { Tag } from './models/tag.model';
import { Comment } from './models/comment.model';
import { ArticleFavorite } from './models/article-favorite.model';
import { ArticleTag } from './models/article-tag.model';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Article, Comment, Tag, ArticleFavorite, ArticleTag]),
    UsersModule,
  ],
  controllers: [ArticlesController, CommentsController, TagsController],
  providers: [ArticlesService, CommentsService, TagsService],
  exports: [ArticlesService, CommentsService, TagsService],
})
export class ArticlesModule {}
