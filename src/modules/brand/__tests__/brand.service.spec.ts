import { Test, TestingModule } from '@nestjs/testing';
import { BrandService } from '../brand.service';
import { LoggerModule } from '../../logger/logger.module';
import { brandProviders } from '../brand.providers';
import { DB_CONNECTION_TOKEN } from '@open-commerce/nestjs-database';

jest.mock('@open-commerce/nestjs-database');
import { DatabaseModule } from '@open-commerce/nestjs-database';

describe('BrandService', () => {
  let brandService: BrandService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, LoggerModule],
      providers: [
        BrandService,
        ...brandProviders,
        {
          provide: DB_CONNECTION_TOKEN,
          useValue: {
            getRepository: () => {
              // TODO mock db connection better when adding tests
            },
          },
        },
      ],
      exports: [BrandService],
    }).compile();

    brandService = module.get<BrandService>(BrandService);
  });

  it('should be defined', () => {
    expect(brandService).toBeDefined();
  });
});
