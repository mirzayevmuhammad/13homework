import { IsNotEmpty, IsString, IsInt, Min, IsISBN } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsISBN()
  isbn: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
