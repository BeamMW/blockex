import {Deserializable} from "./deserializable.model";

export class Block implements Deserializable {
  height:number;
  difficulty: number;
  hash: string;
  subsidy: number;
  chainwork: string;
  timestamp: number;
  fee: number;
  outputs: any;
  inputs: any;
  kernels: any;

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }
}