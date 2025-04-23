import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  bio: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  following: boolean;
}
