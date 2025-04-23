import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<{ user: any }> {
    // Check if user with email or username already exists
    const existingUserByEmail = await this.findByEmail(createUserDto.email);
    if (existingUserByEmail) {
      throw new ConflictException('Email is already taken');
    }

    const existingUserByUsername = await this.findByUsername(createUserDto.username);
    if (existingUserByUsername) {
      throw new ConflictException('Username is already taken');
    }

    // Create the user
    const user = await this.userModel.create({
      username: createUserDto.username,
      email: createUserDto.email,
      password: createUserDto.password,
    });

    // Generate JWT token
    const token = await this.authService.generateToken(user);

    // Return user with token
    return {
      user: user.toAuthJSON(token),
    };
  }

  async login(email: string, password: string): Promise<{ user: any }> {
    // Validate user credentials
    const user = await this.authService.validateUser(email, password);

    // Generate JWT token
    const token = await this.authService.generateToken(user);

    // Return user with token
    return {
      user: user.toAuthJSON(token),
    };
  }

  async findById(id: number): Promise<User | null> {
    return this.userModel.findByPk(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ where: { username } });
  }

  async getCurrentUser(userId: number): Promise<{ user: any }> {
    const user = await this.findById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate JWT token
    const token = await this.authService.generateToken(user);

    // Return user with token
    return {
      user: user.toAuthJSON(token),
    };
  }

  async update(userId: number, updateUserDto: UpdateUserDto): Promise<{ user: any }> {
    const user = await this.findById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being updated and if it's already taken
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUserByEmail = await this.findByEmail(updateUserDto.email);
      if (existingUserByEmail && existingUserByEmail.id !== userId) {
        throw new ConflictException('Email is already taken');
      }
    }

    // Check if username is being updated and if it's already taken
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUserByUsername = await this.findByUsername(updateUserDto.username);
      if (existingUserByUsername && existingUserByUsername.id !== userId) {
        throw new ConflictException('Username is already taken');
      }
    }

    // Update user fields
    if (updateUserDto.email) user.email = updateUserDto.email;
    if (updateUserDto.username) user.username = updateUserDto.username;
    if (updateUserDto.password) user.password = updateUserDto.password;
    if (updateUserDto.bio !== undefined) user.bio = updateUserDto.bio;
    if (updateUserDto.image !== undefined) user.image = updateUserDto.image;

    // Save the updated user
    await user.save();

    // Generate JWT token
    const token = await this.authService.generateToken(user);

    // Return user with token
    return {
      user: user.toAuthJSON(token),
    };
  }
}
