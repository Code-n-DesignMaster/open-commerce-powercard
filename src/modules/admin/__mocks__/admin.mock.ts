export const mockAdminFeaturesResult = {
  features: [
    {
      name: 'PAY_AT_TABLE',
      description:
        'Awesome electronic check feature that will revolutionize restaurant ordering',
      enabledStoreIds: [38, 134],
    },
  ],
};

export const mockAdminIsFeatureEnabledQueryResult = [
  {
    id: 174,
    name: 'PAY_AT_TABLE',
    description:
      'Awesome electronic check feature that will revolutionize restaurant ordering',
    isEnabled: true,
    featureId: 1,
    locationId: 38,
  },
];

export const mockFeaturesAndLocationsQueryResult = [
  {
    id: 38,
    name: 'PAY_AT_TABLE',
    description:
      'Awesome electronic check feature that will revolutionize restaurant ordering',
    isEnabled: true,
    featureId: 1,
    locationId: 38,
    createdAt: '2019-12-15T04:01:36.912Z',
    updatedAt: '2019-12-16T04:37:06.261Z',
    uuid: 'ac9d9459-1cd0-4c17-b277-7f9d525c763e',
    brandSpecificLocationId: '38',
    addressId: 7914,
    hoursOfOperationGroupId: null,
    createdById: null,
    updatedById: null,
  },
  {
    id: 134,
    name: 'PAY_AT_TABLE',
    description:
      'Awesome electronic check feature that will revolutionize restaurant ordering',
    isEnabled: true,
    featureId: 1,
    locationId: 134,
    createdAt: '2019-12-15T04:01:36.912Z',
    updatedAt: '2019-12-16T04:37:06.261Z',
    uuid: '75c2ad14-ada3-43a9-93ea-77cf8ed48790',
    brandSpecificLocationId: '134',
    addressId: 7915,
    hoursOfOperationGroupId: null,
    createdById: null,
    updatedById: null,
  },
  {
    id: 53,
    name: 'PAY_AT_TABLE',
    description:
      'Awesome electronic check feature that will revolutionize restaurant ordering',
    isEnabled: false,
    featureId: 1,
    locationId: 53,
    createdAt: '2019-12-15T04:01:36.912Z',
    updatedAt: '2019-12-16T04:37:06.261Z',
    uuid: '3a81642a-0007-44a0-9715-f020d65a3c2b',
    brandSpecificLocationId: '53',
    addressId: 7916,
    hoursOfOperationGroupId: null,
    createdById: null,
    updatedById: null,
  },
];

export const mockFeatureRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  query: jest.fn(),
};

export const mockLocationRepo = {
  findOneOrFail: jest.fn(),
};

export const mockLocationsResponse = {
  edges: [
    {
      node: {
        brandSpecificLocationId: 5,
        distance: 0,
        specialHours: null,
        attributes: null,
        address: {
          alias: 'PA, Philadelphia',
          street1: '325 N Christopher Columbus Blvd',
          street2: null,
          city: 'Philadelphia',
          state: 'Pennsylvania',
          zipCode: '19106',
        },
      },
    },
    {
      node: {
        brandSpecificLocationId: 38,
        distance: 13.274970044,
        specialHours: null,
        attributes: null,
        address: {
          alias: 'PA, Philadelphia (Franklin Mills)',
          street1: '1995 Franklin Mills Cir',
          street2: null,
          city: 'Philadelphia',
          state: 'Pennsylvania',
          zipCode: '19154',
        },
      },
    },
    {
      node: {
        brandSpecificLocationId: 53,
        distance: 13.404836583,
        specialHours: null,
        attributes: null,
        address: {
          alias: 'PA, Plymouth Meeting',
          street1: '500 W Germantown Pike #2195',
          street2: null,
          city: 'Plymouth Meeting',
          state: 'Pennsylvania',
          zipCode: '19462',
        },
      },
    },
    {
      node: {
        brandSpecificLocationId: 118,
        distance: 60.690548312000004,
        specialHours: null,
        attributes: null,
        address: {
          alias: 'NJ, Woodbridge (Middlesex)',
          street1: '274 Woodbridge Center Dr',
          street2: null,
          city: 'Woodbridge',
          state: 'New Jersey',
          zipCode: '07095',
        },
      },
    },
  ],
};
