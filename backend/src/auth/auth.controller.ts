import { Controller, Post, Body, Headers, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

interface LoginDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('tenant')
  async getTenantId(@Query('email') email: string) {
    // Extrair o domínio do email
    const tenantId = await this.authService.getTenantId(email);
    return tenantId;
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
      tenantId,
    );

    if (!user) {
      throw new Error('Invalid credentials');
    }

    return this.authService.login(user);
  }
}
