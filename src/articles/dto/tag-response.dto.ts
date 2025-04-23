import { ApiProperty } from '@nestjs/swagger';

export class TagsResponseDto {
  @ApiProperty({
    description: 'List of all tags',
    type: [String],
    example: ['dragons', 'training', 'programming'],
  })
  tags: string[];
}
