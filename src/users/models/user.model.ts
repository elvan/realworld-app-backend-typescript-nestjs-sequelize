import { Column, Model, Table, BeforeCreate, BeforeUpdate, HasMany, BelongsToMany } from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';
import { Article } from '../../articles/models/article.model';
import { Comment } from '../../articles/models/comment.model';

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
})
export class User extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ unique: true, allowNull: false })
  username: string;

  @Column({ unique: true, allowNull: false })
  email: string;

  @Column({ allowNull: false })
  password: string;

  @Column({ allowNull: true, defaultValue: '' })
  bio: string;

  @Column({ allowNull: true, defaultValue: '' })
  image: string;

  // Relationships will be defined later
  @HasMany(() => Article, 'authorId')
  articles: Article[];

  @HasMany(() => Comment, 'authorId')
  comments: Comment[];

  @BelongsToMany(() => User, {
    through: 'user_follows',
    foreignKey: 'followerId',
    otherKey: 'followedId',
    as: 'following',
  })
  following: User[];

  @BelongsToMany(() => User, {
    through: 'user_follows',
    foreignKey: 'followedId',
    otherKey: 'followerId',
    as: 'followers',
  })
  followers: User[];

  // Hooks
  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User) {
    if (instance.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      instance.password = await bcrypt.hash(instance.password, salt);
    }
  }

  // Instance methods
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  toJSON() {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
  }

  // Helper methods for API responses
  toAuthJSON(token: string) {
    return {
      email: this.email,
      token: token,
      username: this.username,
      bio: this.bio || '',
      image: this.image || '',
    };
  }

  toProfileJSON(isFollowing = false) {
    return {
      username: this.username,
      bio: this.bio || '',
      image: this.image || '',
      following: isFollowing,
    };
  }
}
