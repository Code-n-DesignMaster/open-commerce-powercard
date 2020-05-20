import { IHoursOfOperation } from './hours-of-operation.interface';

export interface IHoursOfOperationGroup {
  readonly alias: string;
  readonly hours: IHoursOfOperation[];
}
