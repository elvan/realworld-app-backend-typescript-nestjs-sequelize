import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Article } from './models/article.model';
import { Tag } from './models/tag.model';
import { User } from '../users/models/user.model';
import { ArticleFavorite } from './models/article-favorite.model';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleTag } from './models/article-tag.model';
import { ProfilesService } from '../users/profiles.service';
import { Sequelize } from 'sequelize-typescript';
import * as slugify from 'slugify';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article)
    private readonly articleModel: typeof Article,
    @InjectModel(Tag)
    private readonly tagModel: typeof Tag,
    @InjectModel(ArticleFavorite)
    private readonly articleFavoriteModel: typeof ArticleFavorite,
    @InjectModel(ArticleTag)
    private readonly articleTagModel: typeof ArticleTag,
    private readonly profilesService: ProfilesService,
    private readonly sequelize: Sequelize,
  ) {}

  async createArticle(userId: number, createArticleDto: CreateArticleDto): Promise<{ article: any }> {
    const slug = this.generateSlug(createArticleDto.title);

    // Create article in a transaction to handle tags atomically
    const result = await this.sequelize.transaction(async (t) => {
      // Create the article
      const article = await this.articleModel.create({
        title: createArticleDto.title,
        description: createArticleDto.description,
        body: createArticleDto.body,
        slug,
        authorId: userId,
      }, { transaction: t });

      // Handle tags if provided
      if (createArticleDto.tagList && createArticleDto.tagList.length > 0) {
        const uniqueTags = [...new Set(createArticleDto.tagList)];
        
        // Find or create tags
        for (const tagName of uniqueTags) {
          const [tag] = await this.tagModel.findOrCreate({
            where: { name: tagName },
            transaction: t,
          });

          // Associate tag with article
          await this.articleTagModel.create({
            articleId: article.id,
            tagId: tag.id,
          }, { transaction: t });
        }
      }

      // Fetch the complete article with associations
      const completeArticle = await this.articleModel.findByPk(article.id, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['username', 'bio', 'image'],
          },
          {
            model: Tag,
            as: 'tags',
            attributes: ['name'],
            through: { attributes: [] },
          },
        ],
        transaction: t,
      });

      return completeArticle;
    });

    // Format the response
    const authorProfile = await this.profilesService.getProfile(result?.author?.username || '', userId);
    
    return {
      article: {
        ...result?.toJSON(),
        tagList: result?.tags?.map(tag => tag.name) || [],
        favorited: false,
        favoritesCount: 0,
        author: authorProfile.profile,
      },
    };
  }

  async findBySlug(slug: string, currentUserId?: number): Promise<{ article: any }> {
    const article = await this.articleModel.findOne({
      where: { slug },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['username', 'bio', 'image'],
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['name'],
          through: { attributes: [] },
        },
      ],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    let favorited = false;

    if (currentUserId) {
      const favorite = await this.articleFavoriteModel.findOne({
        where: {
          articleId: article.id,
          userId: currentUserId,
        },
      });

      favorited = !!favorite;
    }

    // Get author profile with following status
    const authorProfile = await this.profilesService.getProfile(article.author.username, currentUserId);

    return {
      article: {
        ...article.toJSON(),
        tagList: article.tags.map(tag => tag.name),
        favorited,
        author: authorProfile.profile,
      },
    };
  }

  async updateArticle(slug: string, userId: number, updateArticleDto: UpdateArticleDto): Promise<{ article: any }> {
    const article = await this.articleModel.findOne({
      where: { slug },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'bio', 'image'],
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['name'],
          through: { attributes: [] },
        },
      ],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Check if the user is the author
    if (article.authorId !== userId) {
      throw new UnauthorizedException('You are not authorized to update this article');
    }

    // Update the article fields
    if (updateArticleDto.title) {
      article.title = updateArticleDto.title;
      article.slug = this.generateSlug(updateArticleDto.title);
    }

    if (updateArticleDto.description) article.description = updateArticleDto.description;
    if (updateArticleDto.body) article.body = updateArticleDto.body;

    await article.save();

    // Handle tag updates if provided
    if (updateArticleDto.tagList) {
      // Remove existing tag associations
      await this.articleTagModel.destroy({
        where: { articleId: article.id },
      });

      // Create new tag associations
      const uniqueTags = [...new Set(updateArticleDto.tagList)];
      
      for (const tagName of uniqueTags) {
        const [tag] = await this.tagModel.findOrCreate({
          where: { name: tagName },
        });

        await this.articleTagModel.create({
          articleId: article.id,
          tagId: tag.id,
        });
      }
    }

    // Fetch the updated article with associations
    const updatedArticle = await this.articleModel.findOne({
      where: { id: article.id },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['username', 'bio', 'image'],
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['name'],
          through: { attributes: [] },
        },
      ],
    });

    // Check if the current user has favorited the article
    const favorite = await this.articleFavoriteModel.findOne({
      where: {
        articleId: article.id,
        userId,
      },
    });

    // Get author profile with following status
    const authorProfile = await this.profilesService.getProfile(article.author.username, userId);

    return {
      article: {
        ...updatedArticle?.toJSON(),
        tagList: updatedArticle?.tags?.map(tag => tag.name) || [],
        favorited: !!favorite,
        author: authorProfile.profile,
      },
    };
  }

  async deleteArticle(slug: string, userId: number): Promise<void> {
    const article = await this.articleModel.findOne({ where: { slug } });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Check if the user is the author
    if (article.authorId !== userId) {
      throw new UnauthorizedException('You are not authorized to delete this article');
    }

    // Delete the article
    await article.destroy();
  }

  async listArticles(
    query: {
      tag?: string;
      author?: string;
      favorited?: string;
      limit?: number;
      offset?: number;
    },
    currentUserId?: number,
  ): Promise<{ articles: any[]; articlesCount: number }> {
    const limit = query.limit || 20;
    const offset = query.offset || 0;

    const whereClause: any = {};
    const includeClause: any[] = [
      {
        model: User,
        as: 'author',
        attributes: ['username', 'bio', 'image'],
      },
      {
        model: Tag,
        as: 'tags',
        attributes: ['name'],
        through: { attributes: [] },
      },
    ];

    // Filter by tag
    if (query.tag) {
      includeClause.push({
        model: Tag,
        as: 'tags',
        attributes: [],
        through: { attributes: [] },
        where: { name: query.tag },
      });
    }

    // Filter by author
    if (query.author) {
      includeClause.push({
        model: User,
        as: 'author',
        attributes: [],
        where: { username: query.author },
      });
    }

    // Filter by favorited
    if (query.favorited) {
      includeClause.push({
        model: User,
        as: 'favoritedBy',
        attributes: [],
        through: { attributes: [] },
        where: { username: query.favorited },
      });
    }

    // Get total count and articles
    const { count, rows } = await this.articleModel.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit,
      offset,
      distinct: true,
      order: [['createdAt', 'DESC']],
    });

    // Format the response with additional fields
    const formattedArticles = await Promise.all(
      rows.map(async (article) => {
        let favorited = false;

        if (currentUserId) {
          const favorite = await this.articleFavoriteModel.findOne({
            where: {
              articleId: article.id,
              userId: currentUserId,
            },
          });

          favorited = !!favorite;
        }

        // Get author profile with following status
        const authorProfile = await this.profilesService.getProfile(article.author.username, currentUserId);

        return {
          ...article.toJSON(),
          tagList: article.tags.map(tag => tag.name),
          favorited,
          author: authorProfile.profile,
        };
      }),
    );

    return {
      articles: formattedArticles,
      articlesCount: count,
    };
  }

  async getFeed(
    userId: number,
    query: { limit?: number; offset?: number },
  ): Promise<{ articles: any[]; articlesCount: number }> {
    const limit = query.limit || 20;
    const offset = query.offset || 0;

    // Get the IDs of users that the current user follows
    const followedUsers = await this.sequelize.query(
      `SELECT followed_id FROM user_follows WHERE follower_id = ?`,
      {
        replacements: [userId],
        type: 'SELECT',
      },
    );

    const followedUserIds = followedUsers.map((user: any) => user.followed_id);

    // If the user doesn't follow anyone, return empty array
    if (followedUserIds.length === 0) {
      return {
        articles: [],
        articlesCount: 0,
      };
    }

    // Get articles from followed users
    const { count, rows } = await this.articleModel.findAndCountAll({
      where: {
        authorId: followedUserIds,
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['username', 'bio', 'image'],
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['name'],
          through: { attributes: [] },
        },
      ],
      limit,
      offset,
      distinct: true,
      order: [['createdAt', 'DESC']],
    });

    // Format the response with additional fields
    const formattedArticles = await Promise.all(
      rows.map(async (article) => {
        // Check if the current user has favorited the article
        const favorite = await this.articleFavoriteModel.findOne({
          where: {
            articleId: article.id,
            userId,
          },
        });

        // Get author profile with following status
        const authorProfile = await this.profilesService.getProfile(article.author.username, userId);

        return {
          ...article.toJSON(),
          tagList: article.tags.map(tag => tag.name),
          favorited: !!favorite,
          author: authorProfile.profile,
        };
      }),
    );

    return {
      articles: formattedArticles,
      articlesCount: count,
    };
  }

  async favoriteArticle(slug: string, userId: number): Promise<{ article: any }> {
    const article = await this.articleModel.findOne({
      where: { slug },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['username', 'bio', 'image'],
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['name'],
          through: { attributes: [] },
        },
      ],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Check if already favorited
    const existingFavorite = await this.articleFavoriteModel.findOne({
      where: {
        articleId: article.id,
        userId,
      },
    });

    if (!existingFavorite) {
      // Create the favorite
      await this.articleFavoriteModel.create({
        articleId: article.id,
        userId,
      });

      // Update favorites count
      article.favoritesCount += 1;
      await article.save();
    }

    // Get author profile with following status
    const authorProfile = await this.profilesService.getProfile(article.author.username, userId);

    return {
      article: {
        ...article.toJSON(),
        tagList: article.tags.map(tag => tag.name),
        favorited: true,
        author: authorProfile.profile,
      },
    };
  }

  async unfavoriteArticle(slug: string, userId: number): Promise<{ article: any }> {
    const article = await this.articleModel.findOne({
      where: { slug },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['username', 'bio', 'image'],
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['name'],
          through: { attributes: [] },
        },
      ],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Remove the favorite
    const deleted = await this.articleFavoriteModel.destroy({
      where: {
        articleId: article.id,
        userId,
      },
    });

    // Update favorites count if a record was actually deleted
    if (deleted > 0) {
      article.favoritesCount = Math.max(0, article.favoritesCount - 1);
      await article.save();
    }

    // Get author profile with following status
    const authorProfile = await this.profilesService.getProfile(article.author.username, userId);

    return {
      article: {
        ...article.toJSON(),
        tagList: article.tags.map(tag => tag.name),
        favorited: false,
        author: authorProfile.profile,
      },
    };
  }

  private generateSlug(title: string): string {
    return (
      (slugify as any)(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
}
