import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Borrow, Prisma } from '@prisma/client';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { UpdateBorrowDto } from './dto/update-borrow.dto';

@Injectable()
export class BorrowsService {
  constructor(private prisma: PrismaService) {}

  async create(createBorrowDto: CreateBorrowDto): Promise<Borrow> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: createBorrowDto.userId },
    });

    if (!user) {
      throw new NotFoundException(
        `ID ${createBorrowDto.userId} bilan foydalanuvchi topilmadi`,
      );
    }

    // Check if book exists and is available
    const book = await this.prisma.book.findUnique({
      where: { id: createBorrowDto.bookId },
    });

    if (!book) {
      throw new NotFoundException(
        `ID ${createBorrowDto.bookId} bilan kitob topilmadi`,
      );
    }

    if (book.available <= 0) {
      throw new BadRequestException('Bu kitob hozirda mavjud emas');
    }

    // Create borrow and update book availability in a transaction
    return this.prisma.$transaction(async (prisma) => {
      // Decrease available count
      await prisma.book.update({
        where: { id: createBorrowDto.bookId },
        data: { available: { decrement: 1 } },
      });

      // Create borrow record
      return prisma.borrow.create({
        data: createBorrowDto,
      });
    });
  }

  async findAll(): Promise<Borrow[]> {
    return this.prisma.borrow.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        book: true,
      },
    });
  }

  async findAllByUser(userId: number): Promise<Borrow[]> {
    return this.prisma.borrow.findMany({
      where: { userId },
      include: {
        book: true,
      },
    });
  }

  async findOne(id: number): Promise<Borrow> {
    const borrow = await this.prisma.borrow.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        book: true,
      },
    });

    if (!borrow) {
      throw new NotFoundException(`ID ${id} bilan qarz topilmadi`);
    }

    return borrow;
  }

  async update(id: number, updateBorrowDto: UpdateBorrowDto): Promise<Borrow> {
    // Check if borrow exists
    const borrow = await this.findOne(id);

    // If returnDate is provided and it's a book return operation
    if (updateBorrowDto.returnDate && !borrow.returnDate) {
      // Return the book in a transaction
      return this.prisma.$transaction(async (prisma) => {
        // Increase available count
        await prisma.book.update({
          where: { id: borrow.bookId },
          data: { available: { increment: 1 } },
        });

        // Update borrow record
        return prisma.borrow.update({
          where: { id },
          data: updateBorrowDto,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
            book: true,
          },
        });
      });
    }

    // Regular update without return operation
    return this.prisma.borrow.update({
      where: { id },
      data: updateBorrowDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        book: true,
      },
    });
  }

  async remove(id: number): Promise<Borrow> {
    // Check if borrow exists
    const borrow = await this.findOne(id);

    // If book hasn't been returned yet, increase available count
    if (!borrow.returnDate) {
      return this.prisma.$transaction(async (prisma) => {
        // Increase available count
        await prisma.book.update({
          where: { id: borrow.bookId },
          data: { available: { increment: 1 } },
        });

        // Delete borrow record
        return prisma.borrow.delete({
          where: { id },
        });
      });
    }

    // If book was already returned, just delete the record
    return this.prisma.borrow.delete({
      where: { id },
    });
  }
}
