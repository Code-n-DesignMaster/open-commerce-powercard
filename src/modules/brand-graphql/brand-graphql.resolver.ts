import { Resolver, Query } from '@nestjs/graphql';
import { LoggerService } from '@open-commerce/nestjs-logger';

import { BrandService } from '../brand/brand.service';
import { BaseResolver } from '../../resolvers/BaseResolver';
import { IBrand } from '@open-commerce/data-objects';

@Resolver('Brand')
export class BrandResolver extends BaseResolver {
  constructor(
    readonly logger: LoggerService,
    private readonly brandService: BrandService,
  ) {
    super(logger);
  }

  @Query('brand')
  public async brand(): Promise<IBrand> {
    this.log('Resolving brand');

    const brand = await this.brandService.findById(1);

    this.log('Returning brand', { brand });
    return brand;
  }
}
