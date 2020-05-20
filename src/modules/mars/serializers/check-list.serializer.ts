import { MarsSerializer } from './mars.serializer';
import { ICheckListResponse } from '../interfaces/ICheckListResponse.interface';
import { CheckDetailSerializer } from './check-detail.serializer';

export class CheckListSerializer extends MarsSerializer {
  private checkSerializer = new CheckDetailSerializer();

  public serialize(input: string): any {
    this.logSerializing({ input });

    const data = {
      Identifier: input,
    };

    this.logSending(data);
    return data;
  }

  public deserialize({ data }): ICheckListResponse {
    this.logReceived(data);

    const list = data.CheckDetailList;
    const checkList = list.map((marsCheck: any) => {
      const { check } = this.checkSerializer.deserialize({
        data: { CheckDetail: marsCheck },
      });
      return check;
    });

    const result = {
      checkList,
    };

    this.logDeserialized(result);
    return result;
  }
}
