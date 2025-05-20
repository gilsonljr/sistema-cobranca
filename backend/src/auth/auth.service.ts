import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../users/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async getTenantId(email: string) {
    const domain = email.split('@')[1];

    // Buscar o tenant pelo domínio
    const tenant = await this.prisma.tenant.findFirst({
      where: { domain },
    });

    if (!tenant) {
      throw new Error('Tenant not found for this email domain');
    }

    return { tenantId: tenant.id };
  }

  async validateUser(
    email: string,
    password: string,
    tenantId: string,
  ): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: { email, tenantId },
    });

    if (user && (await bcrypt.compare(password, user.hashedPassword))) {
      const { hashedPassword, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      tenantId: user.tenantId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    };
  }
}
