import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleQueryDto } from './dto/article-query.dto';
import { FeedQueryDto } from './dto/feed-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

describe('ArticlesController', () => {
  let controller: ArticlesController;
  let articlesService: ArticlesService;

  beforeEach(async () => {
    const mockArticlesService = {
      findAll: jest.fn(),
      findFeed: jest.fn(),
      findBySlug: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      favorite: jest.fn(),
      unfavorite: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
      providers: [
        {
          provide: ArticlesService,
          useValue: mockArticlesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(OptionalJwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ArticlesController>(ArticlesController);
    articlesService = module.get<ArticlesService>(ArticlesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call articlesService.findAll with correct parameters', async () => {
      const query: ArticleQueryDto = {
        tag: 'nestjs',
        author: 'johndoe',
        favorited: 'janedoe',
        limit: 10,
        offset: 0,
      };
      const userId = 1;

      await controller.findAll(query, { user: { id: userId } });

      expect(articlesService.findAll).toHaveBeenCalledWith(query, userId);
    });
  });

  describe('findFeed', () => {
    it('should call articlesService.findFeed with correct parameters', async () => {
      const query: FeedQueryDto = {
        limit: 10,
        offset: 0,
      };
      const userId = 1;

      await controller.findFeed(query, { user: { id: userId } });

      expect(articlesService.findFeed).toHaveBeenCalledWith(query, userId);
    });
  });

  describe('findOne', () => {
    it('should call articlesService.findBySlug with correct parameters', async () => {
      const slug = 'test-article';
      const userId = 1;

      await controller.findOne(slug, { user: { id: userId } });

      expect(articlesService.findBySlug).toHaveBeenCalledWith(slug, userId);
    });
  });

  describe('create', () => {
    it('should call articlesService.create with correct parameters', async () => {
      const createArticleDto: CreateArticleDto = {
        title: 'Test Article',
        description: 'This is a test article',
        body: 'Lorem ipsum dolor sit amet',
        tagList: ['test', 'article'],
      };
      const userId = 1;

      await controller.create(createArticleDto, { user: { id: userId } });

      expect(articlesService.create).toHaveBeenCalledWith(createArticleDto, userId);
    });
  });

  describe('update', () => {
    it('should call articlesService.update with correct parameters', async () => {
      const slug = 'test-article';
      const updateArticleDto: UpdateArticleDto = {
        title: 'Updated Test Article',
        description: 'This is an updated test article',
        body: 'Updated lorem ipsum dolor sit amet',
      };
      const userId = 1;

      await controller.update(slug, updateArticleDto, { user: { id: userId } });

      expect(articlesService.update).toHaveBeenCalledWith(slug, updateArticleDto, userId);
    });
  });

  describe('remove', () => {
    it('should call articlesService.remove with correct parameters', async () => {
      const slug = 'test-article';
      const userId = 1;

      await controller.remove(slug, { user: { id: userId } });

      expect(articlesService.remove).toHaveBeenCalledWith(slug, userId);
    });
  });

  describe('favorite', () => {
    it('should call articlesService.favorite with correct parameters', async () => {
      const slug = 'test-article';
      const userId = 1;

      await controller.favorite(slug, { user: { id: userId } });

      expect(articlesService.favorite).toHaveBeenCalledWith(slug, userId);
    });
  });

  describe('unfavorite', () => {
    it('should call articlesService.unfavorite with correct parameters', async () => {
      const slug = 'test-article';
      const userId = 1;

      await controller.unfavorite(slug, { user: { id: userId } });

      expect(articlesService.unfavorite).toHaveBeenCalledWith(slug, userId);
    });
  });
});
