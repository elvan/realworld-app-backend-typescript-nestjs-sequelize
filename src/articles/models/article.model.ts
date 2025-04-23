import { Column, Model, Table, ForeignKey, BelongsTo, HasMany, BelongsToMany, BeforeCreate, BeforeUpdate } from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
import { Comment } from './comment.model';
import { Tag } from './tag.model';
import * as slugify from 'slugify';

@Table({
  tableName: 'articles',
  timestamps: true,
  underscored: true,
})
export class Article extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ allowNull: false })
  title: string;

  @Column({ allowNull: false, unique: true })
  slug: string;

  @Column({ allowNull: false })
  description: string;

  @Column({ allowNull: false, type: 'text' })
  body: string;

  @ForeignKey(() => User)
  @Column({ allowNull: false, field: 'author_id' })
  authorId: number;

  @BelongsTo(() => User, 'authorId')
  author: User;

  @HasMany(() => Comment, 'articleId')
  comments: Comment[];

  @BelongsToMany(() => User, {
    through: 'article_favorites',
    foreignKey: 'articleId',
    otherKey: 'userId',
    as: 'favoritedBy',
  })
  favoritedBy: User[];

  @Column({ allowNull: false, defaultValue: 0 })
  favoritesCount: number;

  // Tags will be handled through a many-to-many relationship
  @BelongsToMany(() => Tag, {
    through: 'article_tags',
    foreignKey: 'articleId',
    otherKey: 'tagId',
    as: 'tags',
  })
  tags: Tag[];

  // Hooks
  @BeforeCreate
  @BeforeUpdate
  static async createSlug(instance: Article) {
    if (instance.changed('title')) {
      instance.slug = (slugify as any)(instance.title, { lower: true }) + 
                     '-' + 
                     ((Math.random() * Math.pow(36, 6) | 0).toString(36));
    }
  }

  // Helper methods for API responses
  toJSON() {
    const values = super.toJSON();
    
    // Handle tags (will be implemented)
    values.tagList = this.tags ? this.tags.map(tag => tag.name) : [];
    
    return values;
  }

  async updateFavoritesCount() {
    const count = await this.$count('favoritedBy');
    this.favoritesCount = count;
    await this.save();
    return this;
  }
}

