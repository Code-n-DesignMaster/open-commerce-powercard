import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BRAND_REPOSITORY_TOKEN } from './constants/brand.constants';
import { Brand } from '@open-commerce/data-objects';

@Injectable()
export class BrandService {
  constructor(
    @Inject(BRAND_REPOSITORY_TOKEN)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  public async findAll(): Promise<Brand[]> {
    return await this.brandRepository.find();
  }

  public async findById(id: number): Promise<Brand> {
    const brand = await this.brandRepository.findOneOrFail(
      { id },
      {
        relations: [
          'tenant',
          'preferences',
          'agreements',
          'backgroundImage',
          'backgroundImage.images',
        ],
      },
    );

    return brand;
  }

  public async findByUuid(uuid: string): Promise<Brand> {
    return await this.brandRepository.findOneOrFail(
      { uuid },
      {
        relations: [
          'tenant',
          'preferences',
          'agreements',
          'backgroundImage',
          'backgroundImage.images',
        ],
      },
    );
  }
}
