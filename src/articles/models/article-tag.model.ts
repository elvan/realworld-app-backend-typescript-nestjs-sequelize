import { Column, Model, Table, ForeignKey } from 'sequelize-typescript';
import { Article } from './article.model';
import { Tag } from './tag.model';

@Table({
  tableName: 'article_tags',
  timestamps: true,
  underscored: true,
})
export class ArticleTag extends Model {
  @ForeignKey(() => Article)
  @Column({ field: 'article_id', allowNull: false, primaryKey: true })
  articleId: number;

  @ForeignKey(() => Tag)
  @Column({ field: 'tag_id', allowNull: false, primaryKey: true })
  tagId: number;
}
