import { Column, Model, Table, ForeignKey } from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
import { Article } from './article.model';

@Table({
  tableName: 'article_favorites',
  timestamps: true,
  underscored: true,
})
export class ArticleFavorite extends Model {
  @ForeignKey(() => User)
  @Column({ field: 'user_id', allowNull: false, primaryKey: true })
  userId: number;

  @ForeignKey(() => Article)
  @Column({ field: 'article_id', allowNull: false, primaryKey: true })
  articleId: number;
}
