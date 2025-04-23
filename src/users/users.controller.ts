import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Body, 
  UsePipes, 
  ValidationPipe, 
  UseGuards,
  Request
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('User and Authentication')
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('users')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User has been successfully created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async register(@Body('user') createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('users/login')
  @ApiOperation({ summary: 'Login for existing user' })
  @ApiResponse({ status: 200, description: 'User has been successfully logged in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async login(@Body('user') loginUserDto: LoginUserDto) {
    return this.usersService.login(loginUserDto.email, loginUserDto.password);
  }

  @Get('user')
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Returns current user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req) {
    return this.usersService.getCurrentUser(req.user.id);
  }

  @Put('user')
  @ApiOperation({ summary: 'Update current user' })
  @ApiResponse({ status: 200, description: 'User has been successfully updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateCurrentUser(
    @Request() req,
    @Body('user') updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(req.user.id, updateUserDto);
  }
}
