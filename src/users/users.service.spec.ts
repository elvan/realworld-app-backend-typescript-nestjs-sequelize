import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { UserFollow } from './models/user-follow.model';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let mockUserModel: any;
  let mockUserFollowModel: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockUserModel = {
      findOne: jest.fn(),
      create: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
    };
    
    mockUserFollowModel = {
      findOne: jest.fn(),
      create: jest.fn(),
      destroy: jest.fn(),
    };
    
    mockJwtService = {
      sign: jest.fn().mockReturnValue('test-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(UserFollow),
          useValue: mockUserFollowModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if user with email already exists', async () => {
      mockUserModel.findOne.mockResolvedValueOnce({});
      
      const createUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
      };
      
      await expect(service.register(createUserDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if user with username already exists', async () => {
      mockUserModel.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({});
      
      const createUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
      };
      
      await expect(service.register(createUserDto)).rejects.toThrow(ConflictException);
    });

    it('should create and return a new user with token on success', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      
      const newUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed-password',
        generateToken: jest.fn().mockReturnValue('test-token'),
        toJSON: jest.fn().mockReturnValue({
          username: 'testuser',
          email: 'test@example.com',
          bio: null,
          image: null,
        }),
      };
      
      mockUserModel.create.mockResolvedValue(newUser);
      
      const createUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
      };
      
      const result = await service.register(createUserDto);
      
      expect(result).toEqual({
        user: {
          username: 'testuser',
          email: 'test@example.com',
          bio: null,
          image: null,
          token: 'test-token',
        },
      });
      expect(mockUserModel.create).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed-password',
      });
    });
  });

  describe('findByEmail', () => {
    it('should return a user if found by email', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
      };
      mockUserModel.findOne.mockResolvedValue(user);
      
      const result = await service.findByEmail('test@example.com');
      
      expect(result).toEqual(user);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should return the current user with token', async () => {
      const user = {
        generateToken: jest.fn().mockReturnValue('test-token'),
        toJSON: jest.fn().mockReturnValue({
          username: 'testuser',
          email: 'test@example.com',
        }),
      };
      
      mockUserModel.findByPk.mockResolvedValue(user);
      
      const result = await service.getCurrentUser(1);
      
      expect(result).toEqual({
        user: {
          username: 'testuser',
          email: 'test@example.com',
          token: 'test-token',
        },
      });
      expect(mockUserModel.findByPk).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findByPk.mockResolvedValue(null);
      
      await expect(service.getCurrentUser(1)).rejects.toThrow(NotFoundException);
    });
  });
});
