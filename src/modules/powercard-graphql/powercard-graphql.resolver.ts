import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { IResponse } from './interfaces/response.interface';
import { PowercardService } from '../powercard/powercard.service';
import { IRewardHistory } from '../mars/interfaces/IRewardHistory.interface';
import { LoggerService } from '@open-commerce/nestjs-logger';
import { BaseResolver } from '../../resolvers/BaseResolver';
import {
  CheckPaymentApplyInputDto,
  ICheck,
  IPowercard,
  IPowercardConfigItem,
  IPowercardImagePack,
  IRateCard,
  ITransaction,
  ITransactionPowercard,
  OFFER_PAYMENT_TYPE,
  POWERCARD_STATUS_TYPE,
  PowercardCreateDto,
  PowercardFundsAddDto,
  PowercardOfferListDto,
  PowercardUpdateAttributesDto,
  RateCardFilterDto,
  Receipt,
  RewardAccountInputDto,
  VirtualPowercardCreateDto,
  IImage,
} from '@open-commerce/data-objects';
import { PowercardBalancesService } from '../powercard-balances/powercard-balances.service';
import { IPowercardOfferListResponse } from '../mars/interfaces/IPowercardOfferListResponse.interface';

@Resolver('Powercard')
export class PowercardsResolver extends BaseResolver {
  constructor(
    readonly logger: LoggerService,
    private readonly powercardService: PowercardService,
    private readonly powercardBalancesService: PowercardBalancesService,
  ) {
    super(logger);
  }

  @Query('promoImages')
  public async promoImages(): Promise<IImage[]> {
    return await this.powercardService.promoImages();
  }

  @Mutation('receiptEmail')
  public async receiptEmail(
    @Args('emailAddress') emailAddress: string,
    @Args('storeId') storeId: number,
    @Args('payCode') payCode: string,
  ): Promise<boolean> {
    return await this.powercardService.receiptEmail(
      emailAddress,
      storeId,
      payCode,
    );
  }

  @Mutation('checkPaymentApply')
  public async checkPaymentApply(
    @Args('input') input: CheckPaymentApplyInputDto,
  ): Promise<Receipt> {
    const result = await this.powercardService.checkPaymentApply(input);
    return result;
  }

  @Query('check')
  public async check(
    @Args('storeId') storeId: number,
    @Args('payCode') payCode: string,
  ): Promise<ICheck> {
    const result = await this.powercardService.check(storeId, payCode);
    return result;
  }

  @Query('checkList')
  public async checkList(
    @Args('tableUuid') tableUuid: string,
  ): Promise<ICheck[]> {
    const result = await this.powercardService.checkList(
      tableUuid.toUpperCase(),
    );
    return result;
  }

  @Mutation('ratingCreate')
  public async ratingCreate(
    @Args('transactionUuid') transactionUuid: string,
    @Args('numberOfStars') numberOfStars: number,
  ): Promise<boolean> {
    return await this.powercardService.ratingCreate(
      transactionUuid,
      numberOfStars,
    );
  }

  @Mutation('receiptsClear')
  public async receiptsClear(
    @Args('storeId') storeId: number,
    @Args('payCode') payCode: string,
  ): Promise<boolean> {
    return await this.powercardService.receiptsClear(storeId, payCode);
  }

  @Query('triggerPowercardBalanceUpdateMessage')
  public async triggerPowercardBalanceUpdateMessage(
    @Args('cardNumber') cardNumber: string,
    @Args('gameChips') gameChips: string,
  ): Promise<boolean> {
    const result = await this.powercardBalancesService.triggerPowercardBalanceUpdateMessage(
      cardNumber,
      gameChips,
    );
    this.log('Triggering Powercard Balance Update Message', { result });
    return true;
  }

  @Query('triggerEasyRechargeNotificationForPowercard')
  public async triggerEasyRechargeNotificationForPowercard(
    @Args('customerUuid') customerUuid: string,
    @Args('powercardUuid') powercardUuid: string,
  ): Promise<boolean> {
    const result = await this.powercardBalancesService.triggerEasyRechargeNotificationForPowercard(
      customerUuid,
      powercardUuid,
    );
    this.log('Triggering Easy Recharge Notification', { result });
    return true;
  }

  @Query('triggerFastEasyRechargeNotificationForPowercard')
  public async triggerFastEasyRechargeNotificationForPowercard(
    @Args('customerUuid') customerUuid: string,
    @Args('powercardUuid') powercardUuid: string,
    @Args('rateCardItemId') rateCardItemId: string,
  ): Promise<boolean> {
    const result = await this.powercardBalancesService.triggerFastEasyRechargeNotificationForPowercard(
      customerUuid,
      powercardUuid,
      rateCardItemId,
    );
    this.log('Triggering Fast Easy Recharge Notification', { result });
    return true;
  }

  @Query('triggerCheckUpdate')
  public async triggerCheckUpdate(
    @Args('storeId') storeId: number,
    @Args('payCode') payCode: string,
  ): Promise<boolean> {
    await this.powercardService.triggerCheckUpdate(storeId, payCode);
    return true;
  }

  @Query('triggerTableUpdate')
  public async triggerTableUpdate(
    @Args('tableUuid') tableUuid: string,
  ): Promise<boolean> {
    await this.powercardService.triggerTableUpdate(tableUuid.toUpperCase());
    return true;
  }

  @Mutation('powercardConfigSet')
  public async powercardConfigSet(
    @Args('config') config: IPowercardConfigItem[],
  ): Promise<IPowercardConfigItem[]> {
    return await this.powercardService.powercardConfigSet(config);
  }

  @Query('powercards')
  public async powercards(
    @Args('customerUuid') customerUuid: string,
  ): Promise<IPowercard[]> {
    this.log('Resolving powercards', { customerUuid });

    const result = await this.powercardService.powercards(customerUuid);

    this.log('Returning customer powercards', { result });
    return result;
  }

  @Query('powercard')
  public async powercard(
    @Args('powercardUuid') powercardUuid: string,
  ): Promise<IPowercard> {
    this.log('Resolving powercard by uuid', { powercardUuid });

    const powercard = await this.powercardService.powercard(powercardUuid);

    this.log('Returning powercard', { powercard });
    return powercard;
  }

  @Query('powercardImages')
  public async powercardImages(): Promise<IPowercardImagePack[]> {
    this.log('Resolving powercard images');

    const images = await this.powercardService.powercardImages();

    this.log('Returning powercard images', { images });
    return images;
  }

  @Query('powercardsForTransactions')
  public async powercardsForTransactions(
    @Args('transactionUuids') transactionUuids: string[],
  ): Promise<ITransactionPowercard[]> {
    this.log('Resolving powercards with balance snapshots for transactions');

    const powercardsWithBalances = await this.powercardService.powercardsForTransactions(
      transactionUuids,
    );

    this.log('Returning powercards with balance snapshots for transactions');
    return powercardsWithBalances;
  }

  @Mutation('powercardCreate')
  public async powercardCreate(
    @Args('input') input: PowercardCreateDto,
  ): Promise<IPowercard> {
    this.log('Resolving powercardCreate', { input });

    const powercard = await this.powercardService.powercardCreate(input);

    this.log('Returning created powercard', { powercard });
    return powercard;
  }

  @Mutation('powercardUpdate')
  public async powercardUpdate(
    @Args('powercardId') powercardId: string,
    @Args('customerEmail') customerEmail: string,
    @Args('attributes') attributes: PowercardUpdateAttributesDto,
  ): Promise<IPowercard> {
    this.log('Resolving powercardUpdate', {
      powercardId,
      customerEmail,
      attributes,
    });

    const result = await this.powercardService.powercardUpdate(
      powercardId,
      customerEmail,
      attributes,
    );

    this.log('Returning updated powercard', { result });
    return result;
  }

  @Mutation('powercardDelete')
  public async powercardDelete(
    @Args('powercardId') powercardId: string,
  ): Promise<IResponse> {
    this.log('Resolving powercardDelete', { powercardId });

    const result = await this.powercardService.powercardDelete(powercardId);

    this.log('Returning powercard delete response', { result });
    return result;
  }

  @Mutation('powercardFundsAdd')
  public async powercardFundsAdd(
    @Args('input') input: PowercardFundsAddDto,
  ): Promise<ITransaction> {
    this.log('Resolving powercardFundsAdd', { input });

    const result = await this.powercardService.powercardFundsAdd(input);

    this.log('Returning updated powercard', { result });
    return result;
  }

  @Mutation('powercardVirtualPurchaseCreate')
  public async powercardVirtualPurchaseCreate(
    @Args('input') input: VirtualPowercardCreateDto,
  ): Promise<ITransaction> {
    this.log('Resolving powercardVirtualPurchaseCreate', { input });

    const result = await this.powercardService.powercardVirtualPurchaseCreate(
      input,
    );

    this.log('Returning created virtual powercard', { result });
    return result;
  }

  @Query('rewardHistory')
  public async rewardHistory(
    @Args('emailAddress') emailAddress: string,
    @Args('lastPage') lastPage = 0,
  ): Promise<IRewardHistory> {
    this.log('Resolving rewardHistory', { emailAddress, lastPage });

    const rewardHistory = await this.powercardService.rewardHistory(
      emailAddress,
      lastPage,
    );

    this.log('Returning rewardHistory', { rewardHistory });
    return rewardHistory;
  }

  @Mutation('powercardEnable')
  public async powercardEnable(@Args('id') uuid: string): Promise<IPowercard> {
    this.log('Resolving powercardEnable', { uuid });

    const result = await this.powercardService.powercardEnable(uuid);

    this.log('Returning enabled powercard', { result });
    return result;
  }

  @Mutation('powercardDisable')
  public async powercardDisable(
    @Args('id') uuid: string,
    @Args('reason') reason: POWERCARD_STATUS_TYPE,
  ): Promise<IPowercard> {
    this.log('Resolving powercardDisable', { uuid, reason });

    const result = await this.powercardService.powercardDisable(uuid, reason);

    this.log('Returning disabled powercard', { result });
    return result;
  }

  @Query('getRateCards')
  public async getRateCards(
    @Args('input') input: RateCardFilterDto,
  ): Promise<IRateCard> {
    this.log('Resolving getRateCards', { input });

    const rateCardData = await this.powercardService.getRateCards(input);

    this.log('Returning rateCardData', { rateCardData });
    return rateCardData;
  }

  @Query('getRateCardByPowerCardUuid')
  public async getRateCardByPowerCardUuid(
    @Args('powerCardUuid') powerCardUuid: string,
    @Args('isNewCustomer') isNewCustomer: boolean,
    @Args('paymentType') paymentType: OFFER_PAYMENT_TYPE,
  ): Promise<IRateCard> {
    this.log('Resolving getRateCardByPowerCardUuid', { powerCardUuid });

    const rateCardData = await this.powercardService.getRateCardByPowerCardUuid(
      powerCardUuid,
      isNewCustomer,
      paymentType,
    );

    this.log('Returning rateCardData', { rateCardData });
    return rateCardData;
  }

  @Query('offerList')
  public async offerList(
    @Args('input') input: PowercardOfferListDto,
  ): Promise<IPowercardOfferListResponse> {
    this.log('Resolving offerList', { input });

    const offerList = await this.powercardService.offerList(input);

    this.log('Returning offerList', { offerList });
    return offerList;
  }

  @Mutation('rewardAccountCreate')
  public async rewardAccountCreate(
    @Args('input') input: RewardAccountInputDto,
  ): Promise<boolean> {
    this.log('Resolving rewardAccountCreate', { input });

    const response = await this.powercardService.rewardAccountCreate(input);

    this.log('Returning rewardAccountCreate', { response });
    return response;
  }

  @Mutation('rewardAccountUpdate')
  public async rewardAccountUpdate(
    @Args('input') input: RewardAccountInputDto,
  ): Promise<boolean> {
    this.log('Resolving rewardAccountUpdate', { input });

    const response = await this.powercardService.rewardAccountUpdate(input);

    this.log('Returning rewardAccountUpdate', { response });
    return response;
  }

  @Mutation('rewardEmailUpdate')
  public async rewardEmailUpdate(
    @Args('oldEmailAddress') oldEmailAddress: string,
    @Args('newEmailAddress') newEmailAddress: string,
  ): Promise<boolean> {
    this.log('Resolving rewardEmailUpdate', {
      oldEmailAddress,
      newEmailAddress,
    });

    const response = await this.powercardService.rewardEmailUpdate(
      oldEmailAddress,
      newEmailAddress,
    );

    this.log('Returning rewardEmailUpdate', { response });
    return response;
  }
}
