import { ValueObject } from "../base/value-object.base";

export interface ChemicalElementProps {
  symbol: string;
}

export class ChemicalElement extends ValueObject<ChemicalElementProps> {
  constructor(props: ChemicalElementProps) {
    super(props);
  }

  get symbol(): string {
    return this.props.symbol;
  }
}
