import {Deserializable} from "./deserializable.model";

export class Offer implements Deserializable {
    beam_amount: string;
    height_expired: number;
    min_height: number;
    status: number;
    status_string: string;
    swap_amount: string;
    swap_currency: string;
    time_created: string;
    txId: string;

    deserialize(input: any) {
        Object.assign(this, input);
        return this;
    }
}
