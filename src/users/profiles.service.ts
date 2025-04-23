import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { UserFollow } from './models/user-follow.model';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(UserFollow)
    private readonly userFollowModel: typeof UserFollow,
    private readonly sequelize: Sequelize,
  ) {}

  async getProfile(username: string, currentUserId?: number): Promise<{ profile: any }> {
    const user = await this.userModel.findOne({ where: { username } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let isFollowing = false;

    if (currentUserId) {
      const follow = await this.userFollowModel.findOne({
        where: {
          followerId: currentUserId,
          followedId: user.id,
        },
      });

      isFollowing = !!follow;
    }

    return {
      profile: user.toProfileJSON(isFollowing),
    };
  }

  async followUser(username: string, currentUserId: number): Promise<{ profile: any }> {
    const user = await this.userModel.findOne({ where: { username } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Don't allow users to follow themselves
    if (user.id === currentUserId) {
      return {
        profile: user.toProfileJSON(false),
      };
    }

    // Check if already following
    const existingFollow = await this.userFollowModel.findOne({
      where: {
        followerId: currentUserId,
        followedId: user.id,
      },
    });

    if (!existingFollow) {
      // Create the follow relationship
      await this.userFollowModel.create({
        followerId: currentUserId,
        followedId: user.id,
      });
    }

    return {
      profile: user.toProfileJSON(true),
    };
  }

  async unfollowUser(username: string, currentUserId: number): Promise<{ profile: any }> {
    const user = await this.userModel.findOne({ where: { username } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove the follow relationship
    await this.userFollowModel.destroy({
      where: {
        followerId: currentUserId,
        followedId: user.id,
      },
    });

    return {
      profile: user.toProfileJSON(false),
    };
  }
}
