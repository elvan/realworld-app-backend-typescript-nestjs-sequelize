import { Table, Column, Model, DataType, BelongsToMany } from 'sequelize-typescript';
import { Article } from './article.model';
import { ArticleTag } from './article-tag.model';

@Table({
  tableName: 'tags',
  timestamps: true,
  underscored: true,
})
export class Tag extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  name: string;

  @BelongsToMany(() => Article, () => ArticleTag)
  articles: Article[];
}
