import { isDeepEqual } from "./is-deep-equal";

export type DeepEqualCompatible =
  | string
  | number
  | boolean
  | null
  | undefined
  | Date
  | RegExp
  | Set<unknown>
  | Map<unknown, unknown>
  | { equals(other: unknown): boolean }
  | { readonly [key: string]: DeepEqualCompatible | undefined }
  | readonly DeepEqualCompatible[];

export abstract class ValueObject<T extends DeepEqualCompatible> {
  protected readonly props: T;

  protected constructor(props: T) {
    this.props = Object.freeze(props);
  }

  public equals(other?: ValueObject<T>): boolean {
    return isDeepEqual(this.props, other?.props);
  }
}
