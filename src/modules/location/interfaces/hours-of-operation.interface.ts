import { WEEKDAY } from '../constants/weekday.enum';

export interface IHoursOfOperation {
  dayOfWeek: WEEKDAY;
  openTime: string;
  closeTime: string;
  genericHoursString: string;
}
