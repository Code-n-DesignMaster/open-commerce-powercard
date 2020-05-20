import { PHONE_TYPE } from '../constants/phone-type.enum';

export interface IContactPhoneNumber {
  uuid: string;
  alias: string;
  phoneNumber: string;
  phoneType: PHONE_TYPE;
}
