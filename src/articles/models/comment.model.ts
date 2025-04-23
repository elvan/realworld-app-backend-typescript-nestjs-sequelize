import { Column, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
import { Article } from './article.model';

@Table({
  tableName: 'comments',
  timestamps: true,
  underscored: true,
})
export class Comment extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ allowNull: false, type: 'text' })
  body: string;

  @ForeignKey(() => User)
  @Column({ allowNull: false, field: 'author_id' })
  authorId: number;

  @BelongsTo(() => User, 'authorId')
  author: User;

  @ForeignKey(() => Article)
  @Column({ allowNull: false, field: 'article_id' })
  articleId: number;

  @BelongsTo(() => Article, 'articleId')
  article: Article;

  // Helper methods for API responses
  toJSON() {
    const values = super.toJSON();
    return values;
  }
}
