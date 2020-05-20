import { Test } from '@nestjs/testing';
import { CONFIG_TOKEN, ConfigModule } from '@open-commerce/nestjs-config';
import { config } from '../../../config/config';
import { ADMIN_SERVICE_CONFIG } from '../../../config/config.constants';
import { AdminService } from '../admin.service';
import {
  FEATURE_REPOSITORY_TOKEN,
  LOCATION_REPOSITORY_TOKEN,
} from '../admin.constants';
import { OCAdminFeatureInvalidStoreError } from '../errors/admin-feature-invalid-store.error';
import { Feature, IFeatureEnabledResponse } from '@open-commerce/data-objects';
import {
  mockAdminFeaturesResult,
  mockFeatureRepo,
  mockLocationRepo,
  mockFeaturesAndLocationsQueryResult,
  mockAdminIsFeatureEnabledQueryResult,
  mockLocationsResponse,
} from '../__mocks__/admin.mock';
import { LOCATION_SERVICE_TOKEN } from '../../location/constants/location.constants';

export const mockLocationService = {
  locations: jest.fn().mockResolvedValue({ edges: [] }),
};

describe('AdminService', () => {
  let service: AdminService = null;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(config)],
      providers: [
        AdminService,
        {
          provide: ADMIN_SERVICE_CONFIG,
          useFactory: config => {
            return config.marsCaching;
          },
          inject: [CONFIG_TOKEN],
        },
        {
          provide: FEATURE_REPOSITORY_TOKEN,
          useValue: mockFeatureRepo,
        },
        {
          provide: LOCATION_REPOSITORY_TOKEN,
          useValue: mockLocationRepo,
        },
        {
          provide: LOCATION_SERVICE_TOKEN,
          useValue: mockLocationService,
        },
      ],
    }).compile();

    service = app.get(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('adminFeatures', () => {
    it('should return a list of features', async () => {
      const querySpy = jest
        .spyOn(mockFeatureRepo, 'query')
        .mockResolvedValue(mockFeaturesAndLocationsQueryResult);

      const result = await service.adminFeatures();

      expect(querySpy).toHaveBeenCalled();
      expect(result).toMatchObject(mockAdminFeaturesResult);
    });
  });

  describe('adminFeatureIsEnabled', () => {
    it('should query feature repo and return true', async () => {
      // it calls query on featureRepo
      const querySpy = jest
        .spyOn(mockFeatureRepo, 'query')
        .mockResolvedValueOnce(mockAdminIsFeatureEnabledQueryResult);

      // returns boolean result from query record isEnabled from first element
      const result = await service.adminIsFeatureEnabled('PAY_AT_TABLE', 38);

      // it throws error if result has zero length
      expect(querySpy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should throw an error if invalid store id is specified', async () => {
      // it calls query on featureRepo
      const querySpy = jest
        .spyOn(mockFeatureRepo, 'query')
        .mockResolvedValueOnce([]);

      try {
        // returns boolean result from query record isEnabled from first element
        await service.adminIsFeatureEnabled('PAY_AT_TABLE', 99999);
      } catch (error) {
        expect(querySpy).toHaveBeenCalled();
        expect(error).toBeInstanceOf(OCAdminFeatureInvalidStoreError);
      }
    });
  });

  describe('adminFeatureEnableForStore', () => {
    it('should query feature repo, check if store id exists, and update the feature_location record isEnabled value', async () => {
      const findOneSpy = jest
        .spyOn(mockFeatureRepo, 'findOne')
        .mockResolvedValueOnce({ id: 38 } as Feature);
      const findLocationSpy = jest
        .spyOn(mockLocationRepo, 'findOneOrFail')
        .mockResolvedValueOnce({});
      const querySpy = jest
        .spyOn(mockFeatureRepo, 'query')
        .mockImplementationOnce((query: string) => {
          // if store ID is provided, the query includes "AND "locationId", else it does not
          expect(query).toContain('AND "locationId"');
        });

      const result = await service.adminFeatureEnableForStore(
        'PAY_AT_TABLE',
        true,
        38,
      );

      expect(result).toBe(true);
      expect(findOneSpy).toHaveBeenCalled();
      expect(findLocationSpy).toHaveBeenCalled();
      expect(querySpy).toHaveBeenCalled();
    });

    it('should omit the locationId from the WHERE clause when storeId is ommitted', async () => {
      const findOneSpy = jest
        .spyOn(mockFeatureRepo, 'findOne')
        .mockResolvedValueOnce({ id: 38 } as Feature);
      const findLocationSpy = jest
        .spyOn(mockLocationRepo, 'findOneOrFail')
        .mockResolvedValueOnce({});
      const querySpy = jest
        .spyOn(mockFeatureRepo, 'query')
        .mockImplementationOnce((query: string) => {
          // if store ID is provided, the query includes "AND "locationId", else it does not
          expect(query).not.toContain('AND "locationId"');
        });

      const result = await service.adminFeatureEnableForStore(
        'PAY_AT_TABLE',
        true,
      );

      expect(result).toBe(true);
      expect(findOneSpy).toHaveBeenCalled();
      expect(findLocationSpy).toHaveBeenCalled();
      expect(querySpy).toHaveBeenCalled();
    });

    it('should throw an error if invalid store id is specified', async () => {
      const findOneSpy = jest
        .spyOn(mockFeatureRepo, 'findOne')
        .mockResolvedValueOnce({ id: 38 } as Feature);
      const findLocationSpy = jest
        .spyOn(mockLocationRepo, 'findOneOrFail')
        .mockRejectedValueOnce(new Error('test error'));

      try {
        await service.adminFeatureEnableForStore('PAY_AT_TABLE', true, 99999);
      } catch (error) {
        expect(error).toBeInstanceOf(OCAdminFeatureInvalidStoreError);
        expect(findLocationSpy).toHaveBeenCalled();
        expect(findOneSpy).toHaveBeenCalled();
      }
    });
  });

  describe('adminFeatureIsEnabledForLatAndLong', () => {
    it('should query feature repo and return true and provide the store ID and address of resolved store', async () => {
      const querySpy = jest
        .spyOn(mockFeatureRepo, 'query')
        .mockResolvedValueOnce(mockAdminIsFeatureEnabledQueryResult);
      jest
        .spyOn(mockLocationService, 'locations')
        .mockResolvedValueOnce(mockLocationsResponse);

      const result: IFeatureEnabledResponse = await service.adminIsFeatureEnabledForLatAndLong(
        'PAY_AT_TABLE',
        {
          latitude: 39.9562149,
          longitude: -75.13864,
        },
      );

      expect(querySpy).toHaveBeenCalled();
      expect(result.isEnabled).toBeDefined();
      expect(result.distance).toBeGreaterThanOrEqual(0);
      expect(result.storeId).toBeGreaterThan(0);
      expect(result.address).toBeTruthy();
      expect(result.address.street1).toBeTruthy();
      expect(result.address.city).toBeTruthy();
      expect(result.address.state).toBeTruthy();
      expect(result.address.zipCode).toBeTruthy();
    });

    it('should return false and null address if no store is found', async () => {
      const querySpy = jest
        .spyOn(mockFeatureRepo, 'query')
        .mockResolvedValueOnce(mockAdminIsFeatureEnabledQueryResult);
      jest
        .spyOn(mockLocationService, 'locations')
        .mockResolvedValueOnce({ edges: [] });

      const result: IFeatureEnabledResponse = await service.adminIsFeatureEnabledForLatAndLong(
        'PAY_AT_TABLE',
        {
          latitude: -33.92584,
          longitude: 18.42322,
        },
      );

      expect(querySpy).toHaveBeenCalled();
      expect(result.isEnabled).toBeFalsy();
      expect(result.distance).toBeFalsy();
      expect(result.storeId).toBeFalsy();
      expect(result.address).toBeFalsy();
    });
  });
});
