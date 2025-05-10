import { IsOptional, IsString, IsInt, Min, IsISBN } from 'class-validator';

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsISBN()
  isbn?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}
