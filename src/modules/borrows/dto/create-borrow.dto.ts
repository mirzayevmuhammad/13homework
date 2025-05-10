import { IsNotEmpty, IsInt, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBorrowDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @IsNotEmpty()
  bookId: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  borrowDate?: Date;
}
