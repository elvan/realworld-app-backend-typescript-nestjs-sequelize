import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Tag } from './models/tag.model';

@Injectable()
export class TagsService {
  constructor(
    @InjectModel(Tag)
    private readonly tagModel: typeof Tag,
  ) {}

  async getAllTags(): Promise<{ tags: string[] }> {
    const tags = await this.tagModel.findAll({
      attributes: ['name'],
      order: [['name', 'ASC']],
    });

    return {
      tags: tags.map(tag => tag.name),
    };
  }
}
