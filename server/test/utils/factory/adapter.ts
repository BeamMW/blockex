import { Model } from "objection";

export class ObjectionAdapter<M extends Model> {
  build(model: M, props: M) {
    return { ...props };
  }

  buildMany(model: M, props: M[]) {
    return [...props];
  }

  save(data: M, model: any) {
    return model.query().insert(data);
  }

  destroy() {
    return true;
  }

  get(model: M, attr: keyof M) {
    return model[attr];
  }

  set(props: Partial<M>, model: M) {
    return Object.assign(model, props);
  }
}
