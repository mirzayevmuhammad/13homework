import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { BorrowsService } from './borrows.service';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { UpdateBorrowDto } from './dto/update-borrow.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('borrows')
@UseGuards(JwtAuthGuard)
export class BorrowsController {
  constructor(private readonly borrowsService: BorrowsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  create(@Body() createBorrowDto: CreateBorrowDto) {
    return this.borrowsService.create(createBorrowDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  findAll() {
    return this.borrowsService.findAll();
  }

  @Get('my')
  findMyBorrows(@Request() req) {
    return this.borrowsService.findAllByUser(req.user.id);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.borrowsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBorrowDto: UpdateBorrowDto,
  ) {
    return this.borrowsService.update(id, updateBorrowDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.borrowsService.remove(id);
  }
}
