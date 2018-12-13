import {Deserializable} from "./deserializable.model";

export class Status implements Deserializable {
  height:number;
  chainwork: string;
  hash: string;
  timestamp: number;
  blocks: any;

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }
}