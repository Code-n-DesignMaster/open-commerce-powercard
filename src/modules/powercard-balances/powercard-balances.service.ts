import { get } from 'lodash';

import { Injectable, Inject } from '@nestjs/common';
import { LoggerService } from '@open-commerce/nestjs-logger';
import {
  ENABLE_CONFIG_LOGGING,
  POWERCARD_BALANCES_SERVICE_CONFIG,
} from '../../config/config.constants';
import { IPowercardBalancesServiceConfig } from '../../config/powercard-balances-service-config.interface';

import { MarsCachingService } from '../mars-caching/mars-caching.service';
import {
  RabbitmqService,
  BuildQueueDto,
  QueueOptionsDto,
} from '@open-commerce/nestjs-rabbitmq';
import { PowercardService } from '../powercard/powercard.service';
import {
  NotificationInputDto,
  Powercard,
  UpdatePassOnDeviceInputDto,
  RateCardRequestDto,
  Customer,
} from '@open-commerce/data-objects';
import {
  NotificationServiceGraphqlClient,
  PassManagementServiceGraphqlClient,
  CustomerServiceGraphqlClient,
} from '@open-commerce/internal-services-api';

import { UpdatePassOnDeviceMapper } from './update-pass-on-device.mapper';
import { MarsService } from '../mars/mars.service';
import { CardBalanceRequestDto } from '../mars/dto/CardBalanceRequest.dto';
import { MARS_API_TOKEN } from '../mars/mars.constants';

const MARS_QUEUE_DETAILS = {
  queueName: 'MARS-CardBalance',
  options: {
    durable: true,
    noAck: true,
    // arguments: {
    //   'x-dead-letter-exchange': 'MARS-CardBalance-DLX',
    // },
  } as QueueOptionsDto,
} as BuildQueueDto;

/*
  DB__DONT_ENABLE_POWERCARD_BALANCE_LISTENER is a kill switch for local development when not connected to D&B data center
  NOTE: You'll still need to define these env vars
  export OC__RABBITMQ_HOSTNAME=localhost
  export OC__RABBITMQ_PORT=5672
  export OC__RABBITMQ_USERNAME=guest
  export OC__RABBITMQ_PASSWORD=guest
  export OC__RABBITMQ_VHOST=/
  export DB__DONT_ENABLE_POWERCARD_BALANCE_LISTENER=false
*/

@Injectable()
export class PowercardBalancesService {
  // TODO: inject these, they will be easier to mock when adding unit tests
  private notificationServiceClient: NotificationServiceGraphqlClient;
  private passManagementServiceClient: PassManagementServiceGraphqlClient;
  private customerServiceClient: CustomerServiceGraphqlClient;
  private readonly loggerContext = this.constructor.name;

  constructor(
    private logger: LoggerService,
    private rabbitmqClient: RabbitmqService,
    private powercardService: PowercardService,
    private marsCachingService: MarsCachingService,
    @Inject(MARS_API_TOKEN)
    private marsService: MarsService,
    @Inject(POWERCARD_BALANCES_SERVICE_CONFIG)
    private powercardBalanceServiceConfig: IPowercardBalancesServiceConfig,
    @Inject(ENABLE_CONFIG_LOGGING)
    enableConfigLogging: boolean,
  ) {
    // TODO: inject these, they will be easier to mock when adding unit tests
    this.notificationServiceClient = new NotificationServiceGraphqlClient();
    this.passManagementServiceClient = new PassManagementServiceGraphqlClient();
    this.customerServiceClient = new CustomerServiceGraphqlClient();

    if (enableConfigLogging) {
      this.logger.debug(
        `Powercard Balance Service Configuration:\n${JSON.stringify(
          this.powercardBalanceServiceConfig,
          null,
          4,
        )}`,
        this.loggerContext,
      );
    }
  }

  public async startListeningToBalanceQueue() {
    if (this.powercardBalanceServiceConfig.dontEnablePowercardBalanceListener) {
      return;
    }
    // Initialize queue connection
    await this.rabbitmqClient.initialize([MARS_QUEUE_DETAILS], []);

    const options = {
      noAck: true,
    } as QueueOptionsDto;

    // Define handler for when messages arrive
    const handler = async message => {
      await this.handleInboundBalanceMessage(message);
    };

    // Start listening to queue
    await this.rabbitmqClient.consumeFromQueue(
      MARS_QUEUE_DETAILS.queueName,
      handler,
      options,
    );
  }

  // TODO: refactor this function to reduce complexity
  public async handleInboundBalanceMessage(
    rawBalancesMessage: any,
  ): Promise<boolean> {
    if (!rawBalancesMessage) {
      this.logger.debug(
        { msg: `Message was null. Ignoring.` },
        this.loggerContext,
      );
      return false;
    }

    this.logger.debug(
      {
        msg: `Message has routingKey ${rawBalancesMessage.fields.routingKey}.`,
      },
      this.loggerContext,
    );

    if (!rawBalancesMessage.fields) {
      this.logger.debug(
        {
          msg: `Malformed message. Ignoring.\n${rawBalancesMessage.content.toString()}`,
        },
        this.loggerContext,
      );
    }

    if (
      rawBalancesMessage.fields.routingKey &&
      rawBalancesMessage.fields.routingKey !==
        this.powercardBalanceServiceConfig.powercardBalanceRoutingKey &&
      rawBalancesMessage.fields.routingKey !==
        this.powercardBalanceServiceConfig.powercardTicketUpdateRoutingKey
    ) {
      this.logger.debug(
        {
          msg: `Message didn't have valid routingKey (${
            rawBalancesMessage.fields.routingKey
          }). Ignoring.\n${rawBalancesMessage.content.toString()}`,
        },
        this.loggerContext,
      );
      return false;
    }

    let derivedRoutingKey = this.powercardBalanceServiceConfig
      .powercardBalanceRoutingKey;

    this.logger.debug(
      {
        msg: `>> Received: ${rawBalancesMessage.content.toString()} from ${derivedRoutingKey}`,
      },
      this.loggerContext,
    );

    try {
      // Process inbound message
      const balancesMessageString = rawBalancesMessage.content.toString();
      const balancesMessageJson = JSON.parse(balancesMessageString);
      const cardNumber = get(balancesMessageJson, 'CardNumber');

      // This is necessary because of the production issue
      // NOTE: In production we are not getting the proper routing keys.
      //       Instead we are looking at the number of attributes that are sent.
      //       While this is not pretty it allows us to quickly distinguish between the 2 message types.
      //       If D&B were to change the attributes in the Ticket Update message we would need to update this code.
      // TODO: Figure out why this might be happening only in the D&B production environment!
      if (Object.keys(balancesMessageJson).length === 5) {
        derivedRoutingKey = this.powercardBalanceServiceConfig
          .powercardTicketUpdateRoutingKey;
      }

      if (!cardNumber) {
        this.logger.debug(
          { msg: `Message did not contain card number. Ignoring.` },
          this.loggerContext,
        );
        return false;
      } else {
        // Does this card number exist in redis
        const powercardValidStatus = await this.marsCachingService.getPowercardValidStatusFromCache(
          cardNumber,
        );
        if (powercardValidStatus === false) {
          this.logger.debug(
            {
              msg: `Valid status for ${cardNumber} is ${powercardValidStatus}. Ignoring.`,
            },
            this.loggerContext,
          );
          return false;
        }

        // Retrieve powercard from database (we'll only need to use one)
        let powercards: Powercard[] = [];
        try {
          powercards = await this.powercardService.queryPowercardsByPowercardNumber(
            cardNumber,
          );

          if (powercards.length === 0) {
            this.logger.debug(
              {
                msg: `Found ${powercards.length} powercard records with card number ${cardNumber}. 
              Ignoring and storing in redis as not valid for mobile app for 1 hour.`,
              },
              this.loggerContext,
            );

            // Mark card number as not valid for mobile app for 12 hours
            await this.marsCachingService.markPowercardValidStatusInCache(
              cardNumber,
              false,
            );
            return false;
          } else {
            this.logger.debug(
              {
                msg: `Found ${powercards.length} powercard records with card number ${cardNumber}. Marking valid in redis for 1 hour.`,
              },
              this.loggerContext,
            );
            await this.marsCachingService.markPowercardValidStatusInCache(
              cardNumber,
              true,
            );
          }
        } catch (error) {
          // Can't do anything unless we find the powercard
          this.logger.error({ msg: 'error' }, error, this.loggerContext);
          return false;
        }

        // Make sure this data looks good
        const updatePassOnDeviceInput = UpdatePassOnDeviceMapper.mapUpdatePassOnDeviceDto(
          balancesMessageJson,
        );

        // DB-2913 - Support for App Rating Popup in mobile app
        await this.detectNfcOperationAndUpdateCustomerIfNecessary(
          cardNumber,
          powercards[0],
          balancesMessageJson,
        );

        this.logger.debug(
          {
            msg: `Storing in redis ${JSON.stringify(balancesMessageJson)}`,
          },
          this.loggerContext,
        );
        // Store balances in Redis
        await this.marsCachingService.storePowercardBalancesInCache(
          cardNumber,
          balancesMessageJson,
        );

        // Do this for balance updates
        if (
          derivedRoutingKey ===
          this.powercardBalanceServiceConfig.powercardBalanceRoutingKey
        ) {
          await this.updateWalletPass(updatePassOnDeviceInput);
        }

        // Do this for ticket updates. Warning this is complex because we can get a flood of ticket updates for a single game.
        if (
          derivedRoutingKey ===
          this.powercardBalanceServiceConfig.powercardTicketUpdateRoutingKey
        ) {
          await this.manageTicketSession(cardNumber);
        }

        // Check if we need to send an easy recharge for each powercard we found
        const sentChecklist = {};
        for (const powercard of powercards) {
          const currentCustomerUuid = powercard.customerUuid;

          if (powercard.easyRechargeEnabled === false) {
            this.logger.debug(
              {
                msg: `Powercard ${cardNumber} does not have easy recharge enabled`,
              },
              this.loggerContext,
            );
          }

          if (
            powercard.easyRechargeEnabled &&
            powercard.easyRechargeSent === false &&
            currentCustomerUuid
          ) {
            // Only send a recharge notification once for a customer
            if (!sentChecklist[currentCustomerUuid]) {
              await this.sendEasyRechargeNotificationIfNeccesary(
                updatePassOnDeviceInput.gameChips,
                currentCustomerUuid,
                powercard.uuid,
                powercard.cardNumber,
                powercard.country,
              );
              sentChecklist[currentCustomerUuid] = true;
            }
          }
        }
      }

      return true;
    } catch (error) {
      // TODO: what should we do on an error
      this.logger.error({ msg: 'error' }, error, this.loggerContext);
      return false;
    }
  }

  public async manageTicketSession(cardNumber: string) {
    // start a ticket session if it's not already started
    if (
      (await this.marsCachingService.ticketSessionInProgress(cardNumber)) ===
      false
    ) {
      this.logger.debug(
        { msg: `Starting ticket session for ${cardNumber}` },
        this.loggerContext,
      );
      await this.startTicketSession(cardNumber);
    } else {
      this.logger.debug(
        { msg: `Ticket session is in progress for ${cardNumber}` },
        this.loggerContext,
      );
    }
  }

  public async startTicketSession(cardNumber: string) {
    // Mark ticket session started in cache
    await this.marsCachingService.markTicketSessionStartedInCache(
      cardNumber,
      this.powercardBalanceServiceConfig
        .powercardTicketUpdateSessionTimeoutSecondsLength +
        this.powercardBalanceServiceConfig
          .powercardTicketUpdateSessionTimeoutSecondsLength *
          0.5,
    );

    // Setup a timeout to mark the end of the ticket session.
    // NOTE: this will need to be fine tuned!!!!
    setTimeout(
      async cardNumber => {
        await this.finishTicketSession(cardNumber);
      },
      this.powercardBalanceServiceConfig
        .powercardTicketUpdateSessionTimeoutSecondsLength * 1000,
      cardNumber,
    );
  }

  public async finishTicketSession(cardNumber: string) {
    // TODO: should we check if have a full data set before sending?

    // set ticket session completed
    await this.marsCachingService.markTicketSessionCompletedInCache(cardNumber);

    // get balances from cache
    const balancesMessageJson = await this.marsCachingService.getBalancesInCacheForPowercard(
      parseInt(cardNumber, 10),
    );
    const updatePassOnDeviceInput = UpdatePassOnDeviceMapper.mapUpdatePassOnDeviceDto(
      balancesMessageJson,
    );

    // send notification to pass management
    await this.updateWalletPass(updatePassOnDeviceInput);
  }

  public async updateWalletPass(
    updatePassOnDeviceInput: UpdatePassOnDeviceInputDto,
  ) {
    // Send Pass Management Service that balance has updated
    this.logger.debug(
      {
        msg: `Sending update to pass management for ${updatePassOnDeviceInput.cardNumber}.`,
      },
      this.loggerContext,
    );
    this.logger.debug(
      { msg: `${JSON.stringify(updatePassOnDeviceInput)}` },
      this.loggerContext,
    );
    const result = await this.passManagementServiceClient.updatePassOnDevice(
      updatePassOnDeviceInput,
    );
    if (result.data === false) {
      this.logger.debug(
        {
          msg: `Unable to trigger pass update for card number ${updatePassOnDeviceInput.cardNumber}`,
        },
        this.loggerContext,
      );
    }
  }

  public async triggerEasyRechargeNotificationForPowercard(
    customerUuid: string,
    powercardUuid: string,
  ): Promise<boolean> {
    this.logger.debug(
      {
        msg: `triggerEasyRechargeNotificationForPowercard ${customerUuid} ${powercardUuid}`,
      },
      this.loggerContext,
    );

    // Checking if customer and power card exists before triggering recharge notfication
    let okToSendRechargeNotification = false;
    const powercards = await this.powercardService.powercards(customerUuid);
    for (const powercard of powercards) {
      if (powercard.uuid === powercardUuid) {
        okToSendRechargeNotification = true;
      }
    }

    if (okToSendRechargeNotification) {
      // figure out what rate card item and store to send
      return await this.sendEasyRechargeNotification(
        customerUuid,
        powercardUuid,
      );
    } else {
      return false;
    }
  }

  public async triggerFastEasyRechargeNotificationForPowercard(
    customerUuid: string,
    powercardUuid: string,
    rateCarditemId: string,
  ): Promise<boolean> {
    this.logger.debug(
      {
        msg: `triggerEasyRechargeNotificationForPowercard ${customerUuid} ${powercardUuid} ${rateCarditemId}`,
      },
      this.loggerContext,
    );

    // Checking if customer and power card exists before triggering recharge notfication
    let okToSendRechargeNotification = false;
    const powercards = await this.powercardService.powercards(customerUuid);
    let storeId = null;

    this.logger.debug(
      {
        msg: `Found ${powercards.length} powercard for customer ${customerUuid}`,
      },
      this.loggerContext,
    );

    for (const powercard of powercards) {
      if (powercard.uuid === powercardUuid) {
        okToSendRechargeNotification = true;
        const balanceCheck = new CardBalanceRequestDto();
        balanceCheck.cardNumber = powercard.cardNumber;
        balanceCheck.country = powercard.country;
        const powercardBalance = await this.marsService.cardBalance(
          balanceCheck,
        );
        if (!powercardBalance) {
          throw new Error(
            `Can't find previous store id for power card uuid: ${powercardUuid}`,
          );
        }

        storeId = powercardBalance.storeId;
        this.logger.debug(
          { msg: `Found previous store id for recharge: ${storeId}` },
          this.loggerContext,
        );
      }
    }

    if (okToSendRechargeNotification) {
      if (rateCarditemId) {
        await this.sendFastEasyRechargeNotification(
          customerUuid,
          powercardUuid,
          rateCarditemId,
          storeId,
        );
      } else {
        const foundRateCardItemId = await this.determineBestRateCardItemIdForCustomerBasedOnLastPurchase(
          customerUuid,
          powercardUuid,
          storeId,
        );
        if (foundRateCardItemId) {
          await this.sendFastEasyRechargeNotification(
            customerUuid,
            powercardUuid,
            foundRateCardItemId,
            storeId,
          );
        } else {
          throw new Error(
            `Can't determine rate card item id from previous transactions for power card uuid: ${powercardUuid}`,
          );
        }
      }
    } else {
      return false;
    }
    return true;
  }

  public async determineBestRateCardItemIdForCustomerBasedOnLastPurchase(
    customerUuid: string,
    powercardUuid: string,
    storeId: string,
  ): Promise<string> {
    this.logger.debug(
      { msg: `Determining best rate card` },
      this.loggerContext,
    );
    const lastChipPurchaseQuantity = await this.powercardService.getLastQuantityOfPowercardChipsPurchaseByCustomer(
      powercardUuid,
      customerUuid,
    );

    if (lastChipPurchaseQuantity) {
      this.logger.debug(
        {
          msg: `Found previous transaction and customer purchased ${lastChipPurchaseQuantity} chips`,
        },
        this.loggerContext,
      );
      const rateCardRequest = new RateCardRequestDto();
      rateCardRequest.isNewCustomer = false;
      rateCardRequest.storeId = parseInt(storeId, 10);
      rateCardRequest.version = -1;
      const rateCard = await this.marsService.rateCards(rateCardRequest);
      let foundRateCardItemId = null;

      for (const menuItem of rateCard.menuItemList) {
        if (menuItem.chips === lastChipPurchaseQuantity) {
          foundRateCardItemId = menuItem.itemId;
        }
      }
      return foundRateCardItemId;
    } else {
      return null;
    }
  }

  public async sendEasyRechargeNotificationIfNeccesary(
    gameChipsRemaining: number,
    customerUuid: string,
    powercardUuid: string,
    powercardNumber: string,
    powercardCountry: string,
  ): Promise<boolean> {
    if (
      gameChipsRemaining <
      this.powercardBalanceServiceConfig.powercardChipsRechargeAlertThreshold
    ) {
      // Get customer record to see if easy recharge is enabled
      const response = await this.customerServiceClient.getBasicCustomerDetailsByUuid(
        customerUuid,
      );
      const easyRechargeEnabled = get(response, 'data.easyRechargeEnabled');

      if (easyRechargeEnabled) {
        // See if we can find a previous transaction and rate card item
        const balanceCheck = new CardBalanceRequestDto();
        balanceCheck.cardNumber = powercardNumber;
        balanceCheck.country = powercardCountry;
        const powercardBalance = await this.marsService.cardBalance(
          balanceCheck,
        );

        let foundRateCardItemId = null;
        if (powercardBalance) {
          foundRateCardItemId = await this.determineBestRateCardItemIdForCustomerBasedOnLastPurchase(
            customerUuid,
            powercardUuid,
            powercardBalance.storeId.toString(),
          );
        }

        if (foundRateCardItemId) {
          // Send a fast easy recharge
          return await this.sendFastEasyRechargeNotification(
            customerUuid,
            powercardUuid,
            foundRateCardItemId,
            powercardBalance.storeId.toString(),
          );
        } else {
          // Send an easy recharge
          return await this.sendEasyRechargeNotification(
            customerUuid,
            powercardUuid,
          );
        }
      } else {
        this.logger.debug(
          {
            msg: `Customer ${customerUuid} does not have easy recharge enabled`,
          },
          this.loggerContext,
        );
        return false;
      }
    } else {
      this.logger.debug(
        {
          msg: `Easy recharge was not enabled for customer ${customerUuid}`,
        },
        this.loggerContext,
      );
      return false;
    }
  }

  public async sendFastEasyRechargeNotification(
    customerUuid: string,
    powercardUuid: string,
    rateCardItemId: string,
    storeId: string,
  ): Promise<boolean> {
    // tslint:disable-next-line: max-line-length
    const deeplink =
      `${this.powercardBalanceServiceConfig.easyRechargeDeepLinkUrlPrefix}fastrecharge` +
      `?powercardUuid=${powercardUuid}` +
      `&storeId=${storeId}` +
      `&rateCardItemId=${rateCardItemId}` +
      `&channel=push`;

    this.logger.debug(
      { msg: `Fast Easy Recharge Deep Link: ${deeplink}` },
      this.loggerContext,
    );

    const notification = new NotificationInputDto();
    notification.title = this.powercardBalanceServiceConfig.easyRechargeNotificationTitleCopy;
    notification.body = this.powercardBalanceServiceConfig.easyRechargeNotificationBodyCopy;
    notification.data = {
      deeplink,
      powercardUuid,
      rateCardItemId,
      storeId: `${storeId.toString()}`,
      type: 'deep_link',
    };

    this.logger.debug(
      { msg: `sending ${JSON.stringify(notification.data, null, 4)}` },
      this.loggerContext,
    );
    await this.notificationServiceClient.notificationCustomerDevicesSend(
      customerUuid,
      notification,
    );
    await this.powercardService.powercardMarkEasyRechargeNotificationSent(
      powercardUuid,
    );

    return true;
  }

  public async sendEasyRechargeNotification(
    customerUuid: string,
    powercardUuid: string,
  ): Promise<boolean> {
    this.logger.debug(
      {
        msg: `Sending easy recharge to ${customerUuid} for card ${powercardUuid} via channel 'push'`,
      },
      this.loggerContext,
    );

    const deeplink = `${this.powercardBalanceServiceConfig.easyRechargeDeepLinkUrlPrefix}recharge?powercardUuid=${powercardUuid}&channel=push`;

    this.logger.debug(
      { msg: `Easy Recharge Deep Link: ${deeplink}` },
      this.loggerContext,
    );

    const notification = new NotificationInputDto();
    notification.title = this.powercardBalanceServiceConfig.easyRechargeNotificationTitleCopy;
    notification.body = this.powercardBalanceServiceConfig.easyRechargeNotificationBodyCopy;
    notification.data = {
      deeplink,
      type: 'deep_link',
    };

    await this.notificationServiceClient.notificationCustomerDevicesSend(
      customerUuid,
      notification,
    );

    await this.powercardService.powercardMarkEasyRechargeNotificationSent(
      powercardUuid,
    );

    return true;
  }

  public async triggerPowercardBalanceUpdateMessage(
    cardNumber: string,
    gameChips: string,
  ): Promise<boolean> {
    const powercards = await this.powercardService.queryPowercardsByPowercardNumber(
      +cardNumber,
    );
    const powercard = powercards[0];

    const rawMessage = {
      fields: {
        routingKey: this.powercardBalanceServiceConfig
          .powercardBalanceRoutingKey,
      },
      content: JSON.stringify({
        StoreID: 24,
        IsRegistered: powercard.isRegisteredReward,
        CardNumber: +cardNumber,
        Country: powercard.country,
        CardEncoding: '%S3Q4D3EQ29ID?',
        Status: powercard.status,
        GameChips: +gameChips,
        VideoChips: powercard.videoChips,
        RewardChips: powercard.rewardChips,
        AttractionChips: powercard.attractionChips,
        Tickets: powercard.tickets,
        RewardPoints: powercard.rewardPoints,
        PointsToNextReward: powercard.pointsToNextReward,
        EligibleRewardCount: 42,
      }),
    };
    return await this.handleInboundBalanceMessage(rawMessage);
  }

  // DB-2913 - Support for App Rating Popup in mobile app
  //
  // Check if balance decreased and if powercard is digital.
  // If these conditions are true, the user just scanned the NFC and
  // should see the popup.  This should set `shouldShowAppRatingPopup`
  // on customer with customerUuid to true.  Use customer.tappedNfc to
  // make sure it only happens the first time.
  private async detectNfcOperationAndUpdateCustomerIfNecessary(
    cardNumber: number,
    tappedPowercard: Powercard,
    balancesMessageJson: any,
  ) {
    this.logger.debug(
      { msg: 'Trying to detect NFC operation...' },
      this.loggerContext,
    );
    const oldBalance = await this.marsCachingService.getBalancesInCacheForPowercard(
      cardNumber,
    );
    let customer = null;
    try {
      const customerResponse = await this.customerServiceClient.getBasicCustomerDetailsByUuid(
        tappedPowercard.customerUuid,
      );
      customer = customerResponse.data as Customer;

      if (!customer) {
        this.logger.debug(
          { msg: 'FAIL: Customer response data was null!' },
          this.loggerContext,
        );
        this.logger.debug(
          { msg: customerResponse.statusText },
          this.loggerContext,
        );
        return;
      }
    } catch (error) {
      this.logger.debug({ msg: 'FAIL: ' + error.message }, this.loggerContext);
    }

    this.logger.debug(
      { msg: `oldBalance.GameChips: ${oldBalance.GameChips}` },
      this.loggerContext,
    );
    this.logger.debug(
      {
        msg: `balancesMessageJson.GameChips: ${balancesMessageJson.GameChips}`,
      },
      this.loggerContext,
    );
    this.logger.debug(
      {
        msg: `!tappedPowercard.isPhysical: ${!tappedPowercard.isPhysical}`,
      },
      this.loggerContext,
    );
    this.logger.debug(
      { msg: `!customer.tappedNfc: ${!customer.tappedNfc}` },
      this.loggerContext,
    );

    if (
      oldBalance &&
      oldBalance.GameChips > balancesMessageJson.GameChips &&
      !tappedPowercard.isPhysical &&
      !customer.tappedNfc
    ) {
      this.logger.debug(
        { msg: `MATCH: Updating customer...` },
        this.loggerContext,
      );
      try {
        await this.customerServiceClient.customerUpdate(customer.uuid, {
          tappedNfc: true,
          shouldShowAppRatingPopup: true,
        });

        this.logger.debug(
          { msg: `SUCCESS: Updated customer!` },
          this.loggerContext,
        );
      } catch (error) {
        this.logger.error(
          { msg: `ERROR: ${error.message}` },
          error,
          this.loggerContext,
        );
      }
    }
  }
}
