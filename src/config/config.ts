import {
  OCURL,
  OCDate,
  OCDateTime,
  OCPhoneNumber,
} from '@open-commerce/scalar-types';

export const config = {
  port: {
    format: 'port',
    default: 3011,
    arg: 'port',
    env: 'PORT',
  },
  enableConfigLogging: {
    env: 'ENABLE_CONFIG_LOGGING',
    format: Boolean,
    default: false,
  },
  admin: {
    storeGeolocationRadiusMeters: {
      env: 'DB__STORE_GEOLOCATION_RADIUS_METERS',
      format: Number,
      default: 500,
    },
  },
  mars: {
    timezone: {
      format: String,
      env: 'TZ',
      default: 'UTC'
    },
    apiUrl: {
      env: 'MARS_API_URL',
      format: String,
      default: '',
    },
    clientKey: {
      env: 'MARS_CLIENT_KEY',
      format: String,
      default: '',
    },
    clientSecret: {
      env: 'MARS_CLIENT_SECRET',
      format: String,
      default: '',
    },
    enableLogging: {
      env: 'ENABLE_MARS_LOGGING',
      format: Boolean,
      default: false,
    },
    enableMock: {
      env: 'ENABLE_MARS_MOCK',
      format: Boolean,
      default: false,
    },
    tokenTimeoutInMinutes: {
      env: 'DB_TOKEN_TIMEOUT_IN_MINUTES',
      format: Number,
      default: 1440,
    },
    defaultTimeoutMs: {
      env: 'DB__MARS_DEFAULT_TIMEOUT_MS',
      format: Number,
      default: 15000,
    },
    cardBalanceCheckTimoutMs: {
      env: 'DB__MARS_CARD_BALANCE_CHECK_TIMEOUT_MS',
      format: Number,
      default: 30000,
    },
    transactionTimeoutMs: {
      env: 'DB__MARS_TRANSACTION_TIMEOUT_MS',
      format: Number,
      default: 40000,
    },
    locationsFilter: {
      env: 'DB__LOCATIONS_FILTER',
      format(val) {
        if (val) {
          try {
            return val.split(',');
          } catch (err) {
            console.log('locationsFilter', err.message);
            return null;
          }
        } else {
          return null;
        }
      },
      default: null,
    },
    rechargeBalanceRefreshTimeoutMs: {
      env: 'DB__MARS_RECHARGE_BALANCE_REFRESH_TIMEOUT_MS',
      format: Number,
      default: 30000,
    },
    enableMarsRequestInstrumentation: {
      env: 'DB__ENABLE_MARS_REQUEST_INSTRUMENTATION',
      format: Boolean,
      default: false,
    },
    enableMarsDebugRequestData: {
      env: 'DB__ENABLE_MARS_DEBUG_REQUEST_DATA',
      format: Boolean,
      default: false,
    },
    enableMarsDebugResponseData: {
      env: 'DB__ENABLE_MARS_DEBUG_RESPONSE_DATA',
      format: Boolean,
      default: false,
    },
  },
  powercard: {
    rateCardVersion: {
      env: 'RATE_CARD_VERSION',
      format: Number,
      default: -1,
    },
    enableStoreIdOverride: {
      env: 'DB__POWERCARD_STORE_ID_OVERRIDE',
      format: Boolean,
      default: false,
    },
    storeIdOverrideValue: {
      env: 'DB__POWERCARD_STORE_ID_OVERRIDE_VALUE',
      format: String,
      default: '',
    },
    dontEnablePayAtTableListener: {
      env: 'DB__DONT_ENABLE_PAY_AT_TABLE_LISTENER',
      format: Boolean,
      default: false,
    },
    marsCreditLimitBypass: {
      env: 'MARS_CREDIT_LIMIT_BYPASS',
      format: Boolean,
      default: false,
    },
    emailFromAddress: {
      env: 'OC__EMAIL_FROM_ADDRESS',
      format: String,
      default: '',
    },
  },
  marsCaching: {
    powercardBalanceExpirationSeconds: {
      env: 'DB__POWERCARD_BALANCE_EXPIRATION_SECONDS',
      format: Number,
      default: 360,
    },
    powercardValidExpirationSeconds: {
      env: 'DB__POWERCARD_VALID_EXPIRATION_SECONDS',
      format: Number,
      default: 360,
    },
    rateCardExpirationSeconds: {
      env: 'DB__RATE_CARD_EXPIRATION_SECONDS',
      format: Number,
      default: 360,
    },
    locationsExpirationSeconds: {
      env: 'DB__LOCATIONS_EXPIRATION_SECONDS',
      format: Number,
      default: 8640,
    },
  },
  powercardBalancesService: {
    powercardChipsRechargeAlertThreshold: {
      env: 'DB_POWERCARD_CHIPS_RECHARGE_ALERT_THRESHOLD',
      format: Number,
      default: 24,
    },
    powercardBalanceRoutingKey: {
      env: 'DB__POWERCARD_BALANCE_ROUTING_KEY',
      format: String,
      default: 'MARS-CardBalance',
    },
    powercardTicketUpdateRoutingKey: {
      env: 'DB__POWERCARD_TICKET_UPDATE_ROUTING_KEY',
      format: String,
      default: 'MARS.CardBalance.Tickets',
    },
    powercardTicketUpdateSessionTimeoutSecondsLength: {
      env: 'DB_POWERCARD_TICKET_UPDATE_SESSION_TIMEOUT_SECONDS_LENGTH',
      format: Number,
      default: 10,
    },
    dontEnablePowercardBalanceListener: {
      env: 'DB__DONT_ENABLE_POWERCARD_BALANCE_LISTENER',
      format: Boolean,
      default: false,
    },
    easyRechargeNotificationTitleCopy: {
      env: 'DB__EASY_RECHARGE_NOTIFICATION_TITLE_COPY',
      format: String,
      default: 'Time to recharge your Power Card',
    },
    easyRechargeNotificationBodyCopy: {
      env: 'DB__EASY_RECHARGE_NOTIFICATION_BODY_COPY',
      format: String,
      default:
        'Power Card has a low balance. Would you like to recharge it now?',
    },
    easyRechargeDeepLinkUrlPrefix: {
      env: 'DB__EASY_RECHARGE_DEEP_LINK_URL_PREFIX',
      format: String,
      default: 'daveandbusters://deeplink/',
    },
  },
  graphql: {
    typePaths: {
      doc:
        'The typePaths property indicates where the GraphQLModule should look for the GraphQL files.',
      format: Array,
      env: 'GQL_PATH',
      default: [
        'node_modules/@open-commerce/graphql-schema/INTERNAL_API/schema-modules/common.graphqls',
        'node_modules/@open-commerce/graphql-schema/INTERNAL_API/schema-modules/powercard.graphqls',
        'node_modules/@open-commerce/graphql-schema/INTERNAL_API/schema-modules/mutations-dave-and-busters-service.graphqls',
        'node_modules/@open-commerce/graphql-schema/INTERNAL_API/schema-modules/queries-dave-and-busters-service.graphqls',
        'node_modules/@open-commerce/graphql-schema/INTERNAL_API/schema-modules/customer.graphqls',
        'node_modules/@open-commerce/graphql-schema/INTERNAL_API/schema-modules/transaction.graphqls',
        'node_modules/@open-commerce/graphql-schema/INTERNAL_API/schema-modules/payment.graphqls',
        'node_modules/@open-commerce/graphql-schema/INTERNAL_API/schema-modules/location.graphqls',
        'node_modules/@open-commerce/graphql-schema/INTERNAL_API/schema-modules/queries-location-service.graphqls',
      ],
    },
    debug: {
      doc: 'Debug mode',
      format: Boolean,
      env: 'GQL_DEBUG',
      default: true,
    },
    playground: {
      doc: 'Switch on playground',
      format: Boolean,
      env: 'GQL_PLAYGROUND',
      default: true,
    },
    installSubscriptionHandlers: {
      default: true,
    },
    resolvers: {
      default: {
        OCPhoneNumber,
        OCURL,
        OCDate,
        OCDateTime,
      },
    },
  },
  terminus: {
    endpoints: {
      default: [
        {
          // The health check will be available with /health-check
          url: '/health-check',
          // All the indicators which will be checked when requesting /health
          healthIndicators: [],
        },
      ],
    },
  },
  redis: {
    host: {
      format: String,
      env: 'REDIS_HOST',
      default: 'redis',
    },
  },
  payAnywhere: {
    checkRetryCount: {
      format: Number,
      env: 'DB__PAY_AT_TABLE_CHECK_RETRY_COUNT',
      default: 10,
    },
    checkRetryDelay: {
      format: Number,
      env: 'DB__PAY_AT_TABLE_CHECK_RETRY_DELAY_MS',
      default: 15000,
    },
    checkUpdateExpirationSeconds: {
      format: Number,
      env: 'DB__CHECK_UPDATE_EXPIRATION_SECONDS',
      default: 60 * 60 * 12, // 12 hours
    },
    rabbitmq: {
      name: {
        format: String,
        env: 'OC__RABBITMQ_NAME',
        default: 'pay-rabbitmq',
      },
      hostname: {
        format: String,
        env: 'OC__RABBITMQ_HOSTNAME',
        default: 'value is missing',
      },
      port: {
        format: Number,
        env: 'OC__RABBITMQ_PORT',
        default: 5672,
      },
      username: {
        format: String,
        env: 'OC__RABBITMQ_USERNAME',
        default: 'guest',
      },
      password: {
        format: String,
        env: 'OC__RABBITMQ_PASSWORD',
        default: 'guest',
      },
      vhost: {
        format: String,
        env: 'OC__RABBITMQ_PAY_ANYWHERE_VHOST',
        default: 'PAY',
      },
      retrys: {
        format: Number,
        env: 'OC__RABBITMQ_RETRYS',
        default: 1000,
      },
      frameMax: {
        format: Number,
        env: 'OC__RABBITMQ_FRAME_MAX',
        default: 0,
      },
      heartbeat: {
        format: Number,
        env: 'OC__RABBITMQ_HEARTBEAT',
        default: 0,
      },
    },
  },
};
