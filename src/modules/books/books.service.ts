import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Book, Prisma } from '@prisma/client';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    // Check if book with the same ISBN already exists
    const existingBook = await this.prisma.book.findUnique({
      where: { isbn: createBookDto.isbn },
    });

    if (existingBook) {
      throw new ConflictException('Bu ISBN bilan kitob allaqachon mavjud');
    }

    return this.prisma.book.create({
      data: {
        ...createBookDto,
        available: createBookDto.quantity, // Initially all books are available
      },
    });
  }

  async findAll(): Promise<Book[]> {
    return this.prisma.book.findMany();
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      throw new NotFoundException(`ID ${id} bilan kitob topilmadi`);
    }

    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    // First check if book exists
    const existingBook = await this.findOne(id);

    // Calculate new available count
    let availableDelta = 0;
    if (updateBookDto.quantity) {
      availableDelta = updateBookDto.quantity - existingBook.quantity;
    }

    return this.prisma.book.update({
      where: { id },
      data: {
        ...updateBookDto,
        // If quantity is updated, also update available count
        ...(availableDelta !== 0 && {
          available: { increment: availableDelta },
        }),
      },
    });
  }

  async remove(id: number): Promise<Book> {
    // First check if book exists
    await this.findOne(id);

    // Check if there are active borrows
    const activeLoans = await this.prisma.borrow.count({
      where: {
        bookId: id,
        returnDate: null,
      },
    });

    if (activeLoans > 0) {
      throw new ConflictException(
        "Bu kitob hozirda kimdir tomonidan olingan. O'chirib bo'lmaydi",
      );
    }

    return this.prisma.book.delete({
      where: { id },
    });
  }
}
