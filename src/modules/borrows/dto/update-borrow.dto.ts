import { IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBorrowDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  returnDate?: Date;
}
