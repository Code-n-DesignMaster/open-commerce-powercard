import { UpdatePassOnDeviceInputDto } from '@open-commerce/data-objects';

import { get } from 'lodash';

export class UpdatePassOnDeviceMapper {
  public static mapUpdatePassOnDeviceDto(
    balances: object,
  ): UpdatePassOnDeviceInputDto {
    const updatePassOnDeviceInput = new UpdatePassOnDeviceInputDto();
    updatePassOnDeviceInput.attractionChips = get(balances, 'AttractionChips');
    updatePassOnDeviceInput.cardNumber = get(balances, 'CardNumber').toString();
    updatePassOnDeviceInput.country = get(balances, 'Country');
    updatePassOnDeviceInput.eligibleRewardCount = get(
      balances,
      'EligibleRewardCount',
    );
    updatePassOnDeviceInput.gameChips = get(balances, 'GameChips');
    updatePassOnDeviceInput.pointsToNextReward = get(
      balances,
      'PointsToNextReward',
    );
    updatePassOnDeviceInput.rewardChips = get(balances, 'RewardChips');
    updatePassOnDeviceInput.rewardPoints = get(balances, 'RewardPoints', 0);
    updatePassOnDeviceInput.status = get(balances, 'Status');
    updatePassOnDeviceInput.tickets = get(balances, 'Tickets');
    updatePassOnDeviceInput.videoChips = get(balances, 'VideoChips');
    updatePassOnDeviceInput.cardEncoding = get(balances, 'CardEncoding');
    return updatePassOnDeviceInput;
  }
}
