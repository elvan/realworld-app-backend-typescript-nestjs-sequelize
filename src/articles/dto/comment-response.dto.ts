import { ApiProperty } from '@nestjs/swagger';
import { ProfileResponseDto } from '../../users/dto/profile-response.dto';

export class CommentResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  body: string;

  @ApiProperty({ type: ProfileResponseDto })
  author: ProfileResponseDto;
}

export class SingleCommentResponseDto {
  @ApiProperty({ type: CommentResponseDto })
  comment: CommentResponseDto;
}

export class MultipleCommentsResponseDto {
  @ApiProperty({ type: [CommentResponseDto] })
  comments: CommentResponseDto[];
}
