export interface ISerializer {
  serialize(input: any): any;
  deserialize(input: any): any;
}
