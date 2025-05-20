import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  ForbiddenException,
  ConflictException,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('first-admin')
  async createFirstAdmin(@Body() createUserDto: CreateUserDto, @Request() req) {
    const adminCount = await this.userService.countAdmins(
      req.headers['x-tenant-id'],
    );
    if (adminCount > 0) {
      throw new ConflictException('Admin user already exists');
    }

    createUserDto.role = UserRole.ADMIN;
    return this.userService.create(createUserDto, req.headers['x-tenant-id']);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createUserDto: CreateUserDto, @Request() req) {
    return this.userService.create(createUserDto, req.tenant.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(@Request() req, @Query() query: FindAllUsersDto) {
    return this.userService.findAll(req.tenant.id, query);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Request() req) {
    return this.userService.findOne(req.user.id, req.tenant.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(req.user.id, updateUserDto, req.tenant.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string, @Request() req) {
    return this.userService.findOne(id, req.tenant.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    const user = await this.userService.findOne(id, req.tenant.id);

    if (
      user.role === UserRole.ADMIN &&
      updateUserDto.role &&
      updateUserDto.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('Cannot change the role of an admin user');
    }

    return this.userService.update(id, updateUserDto, req.tenant.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string, @Request() req) {
    const user = await this.userService.findOne(id, req.tenant.id);

    if (user.id === req.user.id) {
      throw new ForbiddenException('Cannot delete your own account');
    }

    if (user.role === UserRole.ADMIN) {
      const adminCount = await this.userService.countAdmins(req.tenant.id);
      if (adminCount <= 1) {
        throw new ForbiddenException('Cannot delete the last admin user');
      }
    }

    return this.userService.remove(id, req.tenant.id);
  }
}
