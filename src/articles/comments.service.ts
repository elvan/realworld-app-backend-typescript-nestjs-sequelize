import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Comment } from './models/comment.model';
import { Article } from './models/article.model';
import { User } from '../users/models/user.model';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ProfilesService } from '../users/profiles.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment)
    private readonly commentModel: typeof Comment,
    @InjectModel(Article)
    private readonly articleModel: typeof Article,
    private readonly profilesService: ProfilesService,
  ) {}

  async addComment(slug: string, userId: number, createCommentDto: CreateCommentDto): Promise<{ comment: any }> {
    // Find the article
    const article = await this.articleModel.findOne({ where: { slug } });
    
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Create the comment
    const comment = await this.commentModel.create({
      body: createCommentDto.body,
      authorId: userId,
      articleId: article.id,
    });

    // Get the complete comment with author
    const completeComment = await this.commentModel.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['username', 'bio', 'image'],
        },
      ],
    });

    // Get author profile with following status
    const authorProfile = await this.profilesService.getProfile(completeComment?.author?.username || '', userId);

    return {
      comment: {
        id: completeComment?.id,
        createdAt: completeComment?.createdAt,
        updatedAt: completeComment?.updatedAt,
        body: completeComment?.body || '',
        author: authorProfile.profile,
      },
    };
  }

  async getComments(slug: string, currentUserId?: number): Promise<{ comments: any[] }> {
    // Find the article
    const article = await this.articleModel.findOne({ where: { slug } });
    
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Get all comments for the article
    const comments = await this.commentModel.findAll({
      where: { articleId: article.id },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['username', 'bio', 'image'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Format the response with author profiles
    const formattedComments = await Promise.all(
      comments.map(async (comment) => {
        const authorProfile = await this.profilesService.getProfile(comment.author.username, currentUserId);
        
        return {
          id: comment.id,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          body: comment.body,
          author: authorProfile.profile,
        };
      }),
    );

    return { comments: formattedComments };
  }

  async deleteComment(slug: string, commentId: number, userId: number): Promise<void> {
    // Find the article
    const article = await this.articleModel.findOne({ where: { slug } });
    
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Find the comment
    const comment = await this.commentModel.findOne({
      where: { 
        id: commentId,
        articleId: article.id,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if the user is the author of the comment
    if (comment.authorId !== userId) {
      throw new UnauthorizedException('You are not authorized to delete this comment');
    }

    // Delete the comment
    await comment.destroy();
  }
}
