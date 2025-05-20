import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from './tenant.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantService: TenantService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID not provided');
    }

    const tenant = await this.tenantService.findOne(tenantId);

    if (!tenant) {
      throw new UnauthorizedException('Invalid tenant');
    }

    req['tenant'] = tenant;
    next();
  }
} 