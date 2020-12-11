import {Deserializable} from "./deserializable.model";

export class Asset implements Deserializable {
  id: number;
  lock_height: number;
  metadata: string;
  metahash: string;
  owner: string;
  value_hi: number;
  value_lo: number;

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }
}