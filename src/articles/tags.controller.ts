import { Controller, Get } from '@nestjs/common';
import { TagsService } from './tags.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  @ApiResponse({ status: 200, description: 'Returns list of all tags' })
  async getAllTags() {
    return this.tagsService.getAllTags();
  }
}
