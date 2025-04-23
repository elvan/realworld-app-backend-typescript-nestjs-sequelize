import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Param, 
  UseGuards,
  Request
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Profile')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(':username')
  @ApiOperation({ summary: 'Get a profile' })
  @ApiParam({ name: 'username', description: 'Username of the profile to get' })
  @ApiResponse({ status: 200, description: 'Returns profile information' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  @UseGuards(OptionalJwtAuthGuard)
  async getProfile(
    @Param('username') username: string,
    @Request() req,
  ) {
    const currentUserId = req.user?.id;
    return this.profilesService.getProfile(username, currentUserId);
  }

  @Post(':username/follow')
  @ApiOperation({ summary: 'Follow a user' })
  @ApiParam({ name: 'username', description: 'Username of the profile you want to follow' })
  @ApiResponse({ status: 200, description: 'Followed user successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async followUser(
    @Param('username') username: string,
    @Request() req,
  ) {
    return this.profilesService.followUser(username, req.user.id);
  }

  @Delete(':username/follow')
  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiParam({ name: 'username', description: 'Username of the profile you want to unfollow' })
  @ApiResponse({ status: 200, description: 'Unfollowed user successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async unfollowUser(
    @Param('username') username: string,
    @Request() req,
  ) {
    return this.profilesService.unfollowUser(username, req.user.id);
  }
}
