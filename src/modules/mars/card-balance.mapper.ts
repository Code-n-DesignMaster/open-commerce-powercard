import { PowercardBalanceUpdateDto } from './dto/powercard-balance-update.dto';
import { get } from 'lodash';

export class CardBalanceMapper {
  public static mapCardBalancesFromMarsResponse(
    response: any,
    cardNumber?: string,
  ): PowercardBalanceUpdateDto {
    if (!response) {
      return null;
    } else {
      try {
        const dataFromResponse = get(response, 'data');
        const powercardBalanceUpdateDto = new PowercardBalanceUpdateDto();

        powercardBalanceUpdateDto.storeId = get(dataFromResponse, 'StoreID');
        powercardBalanceUpdateDto.cardNumber = get(
          dataFromResponse,
          'CardNumber',
          cardNumber,
        );
        powercardBalanceUpdateDto.gameChips = get(
          dataFromResponse,
          'GameChips',
        );
        powercardBalanceUpdateDto.rewardChips = get(
          dataFromResponse,
          'RewardChips',
        );
        powercardBalanceUpdateDto.videoChips = get(
          dataFromResponse,
          'VideoChips',
        );
        powercardBalanceUpdateDto.attractionChips = get(
          dataFromResponse,
          'AttractionChips',
        );
        powercardBalanceUpdateDto.tickets = get(dataFromResponse, 'Tickets');
        powercardBalanceUpdateDto.rewardPoints = get(
          dataFromResponse,
          'RewardPoints',
        );
        powercardBalanceUpdateDto.pointsToNextReward = get(
          dataFromResponse,
          'PointsToNextReward',
        );
        powercardBalanceUpdateDto.eligibleRewardCount = get(
          dataFromResponse,
          'EligibleRewardCount',
        );
        powercardBalanceUpdateDto.cardEncoding = get(
          dataFromResponse,
          'CardEncoding',
        );
        return powercardBalanceUpdateDto;
      } catch {
        return null;
      }
    }
  }
}
