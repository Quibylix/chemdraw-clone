import { ValueObject } from "../base/value-object.base";
import { ElementSymbol, getElement, isValidElement } from "./elements";
import { Result, ok, err } from "neverthrow";

export type ChemicalElementProps = Readonly<{
  symbol: string;
  name: string;
  atomicNumber: number;
  atomicMass: number;
  commonValencies: number[];
}>;

export class ChemicalElement extends ValueObject<ChemicalElementProps> {
  private constructor(props: ChemicalElementProps) {
    super(props);
  }

  get symbol(): string {
    return this.props.symbol;
  }

  get name(): string {
    return this.props.name;
  }

  get atomicNumber(): number {
    return this.props.atomicNumber;
  }

  get atomicMass(): number {
    return this.props.atomicMass;
  }

  get commonValencies(): number[] {
    return [...this.props.commonValencies];
  }

  public static create(symbol: ElementSymbol): Result<ChemicalElement, Error> {
    if (!isValidElement(symbol)) {
      return err(new Error(`Invalid element symbol: ${symbol}`));
    }

    const elementData = getElement(symbol)!;
    return ok(
      new ChemicalElement({
        symbol: elementData.symbol,
        name: elementData.name,
        atomicNumber: elementData.atomicNumber,
        atomicMass: elementData.atomicMass,
        commonValencies: [...elementData.commonValencies],
      }),
    );
  }
}
