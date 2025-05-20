import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto, tenantId: string) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const { password, ...userData } = createUserDto;

    return this.prisma.user.create({
      data: {
        ...userData,
        hashedPassword,
        tenantId,
        id: crypto.randomUUID(),
        updatedAt: new Date(),
      },
    });
  }

  async findAll(tenantId: string, query: FindAllUsersDto) {
    const { search, role, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      ...(role && { role }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, tenantId: string) {
    await this.findOne(id, tenantId);

    const data: any = { ...updateUserDto };
    if (updateUserDto.password) {
      data.hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      delete data.password;
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.user.delete({
      where: { id },
    });
  }

  async countAdmins(tenantId: string): Promise<number> {
    return this.prisma.user.count({
      where: {
        tenantId,
        role: UserRole.ADMIN,
      },
    });
  }
}
