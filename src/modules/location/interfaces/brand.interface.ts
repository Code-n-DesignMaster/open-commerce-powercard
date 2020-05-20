import { ITenant } from './tenant.interface';
import { IBrandAgreement } from './brand-agreement.interface';
import { IBrandCustomerPreference } from './brand-customer-preference.interface';

export interface IBrand {
  name: string;
  tenant: ITenant;
  agreements: IBrandAgreement[];
  preferences: IBrandCustomerPreference[];
}
