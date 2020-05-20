import { IsNotEmpty, IsNumber } from 'class-validator';

export class GeoLocationDto {
  @IsNotEmpty()
  @IsNumber()
  public latitude: number;

  @IsNotEmpty()
  @IsNumber()
  public longitude: number;
}
