import { Test } from '@nestjs/testing';
import { LocationService } from '../location.service';
import {
  LOCATION_SERVICE_TOKEN,
  GEOLIB_TOKEN,
} from '../constants/location.constants';
import { MARS_API_TOKEN } from '../../mars/mars.constants';
import { LocationFilterDto } from '../../location-graphql/dto/location-filter.dto';
import { mockLocations } from '../__mocks__/location.mock';

export const mockMarsService = {
  refreshToken: jest.fn(),
  storeLocations: jest.fn(),
};

export const mockGeolib = {
  getDistance: jest.fn(),
};

describe('LocationService', () => {
  let service: LocationService = null;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [
        {
          provide: LOCATION_SERVICE_TOKEN,
          useClass: LocationService,
        },
        {
          provide: MARS_API_TOKEN,
          useValue: mockMarsService,
        },
        {
          provide: GEOLIB_TOKEN,
          useValue: mockGeolib,
        },
      ],
    }).compile();

    service = module.get(LOCATION_SERVICE_TOKEN);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  describe('locations', () => {
    it('does stuff', async () => {
      // spies
      jest
        .spyOn(mockMarsService, 'refreshToken')
        .mockResolvedValue('testToken');
      jest
        .spyOn(mockMarsService, 'storeLocations')
        .mockResolvedValueOnce(mockLocations);
      jest.spyOn(mockGeolib, 'getDistance').mockReturnValue(1000);

      // await locations
      const testFilter: LocationFilterDto = {
        radius: 4,
        geoLocationEquals: {
          latitude: 1,
          longitude: 2,
        },
      } as LocationFilterDto;
      const result = await service.locations(testFilter);

      const locations = result.edges;

      // expects
      expect(locations).toBeTruthy();
      expect(locations.length).toBeGreaterThan(0);
    });
  });
});
