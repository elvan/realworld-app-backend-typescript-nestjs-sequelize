import { Column, Model, Table, ForeignKey } from 'sequelize-typescript';
import { User } from './user.model';

@Table({
  tableName: 'user_follows',
  timestamps: true,
  underscored: true,
})
export class UserFollow extends Model {
  @ForeignKey(() => User)
  @Column({ field: 'follower_id', allowNull: false, primaryKey: true })
  followerId: number;

  @ForeignKey(() => User)
  @Column({ field: 'followed_id', allowNull: false, primaryKey: true })
  followedId: number;
}
