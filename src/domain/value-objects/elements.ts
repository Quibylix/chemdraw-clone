export interface ElementData {
  symbol: string;
  name: string;
  atomicNumber: number;
  atomicMass: number;
  commonValencies: number[];
}

export const ELEMENTS = {
  H: {
    symbol: "H",
    name: "Hydrogen",
    atomicNumber: 1,
    atomicMass: 1.008,
    commonValencies: [1],
  },
  C: {
    symbol: "C",
    name: "Carbon",
    atomicNumber: 6,
    atomicMass: 12.011,
    commonValencies: [4],
  },
  N: {
    symbol: "N",
    name: "Nitrogen",
    atomicNumber: 7,
    atomicMass: 14.007,
    commonValencies: [3, 5],
  },
  O: {
    symbol: "O",
    name: "Oxygen",
    atomicNumber: 8,
    atomicMass: 15.999,
    commonValencies: [2],
  },
  F: {
    symbol: "F",
    name: "Fluorine",
    atomicNumber: 9,
    atomicMass: 18.998,
    commonValencies: [1],
  },
  Na: {
    symbol: "Na",
    name: "Sodium",
    atomicNumber: 11,
    atomicMass: 22.99,
    commonValencies: [1],
  },
  Mg: {
    symbol: "Mg",
    name: "Magnesium",
    atomicNumber: 12,
    atomicMass: 24.305,
    commonValencies: [2],
  },
  Al: {
    symbol: "Al",
    name: "Aluminum",
    atomicNumber: 13,
    atomicMass: 26.982,
    commonValencies: [3],
  },
  Si: {
    symbol: "Si",
    name: "Silicon",
    atomicNumber: 14,
    atomicMass: 28.086,
    commonValencies: [4],
  },
  P: {
    symbol: "P",
    name: "Phosphorus",
    atomicNumber: 15,
    atomicMass: 30.974,
    commonValencies: [3, 5],
  },
  S: {
    symbol: "S",
    name: "Sulfur",
    atomicNumber: 16,
    atomicMass: 32.065,
    commonValencies: [2, 4, 6],
  },
  Cl: {
    symbol: "Cl",
    name: "Chlorine",
    atomicNumber: 17,
    atomicMass: 35.453,
    commonValencies: [1],
  },
  K: {
    symbol: "K",
    name: "Potassium",
    atomicNumber: 19,
    atomicMass: 39.098,
    commonValencies: [1],
  },
  Ca: {
    symbol: "Ca",
    name: "Calcium",
    atomicNumber: 20,
    atomicMass: 40.078,
    commonValencies: [2],
  },
  Fe: {
    symbol: "Fe",
    name: "Iron",
    atomicNumber: 26,
    atomicMass: 55.845,
    commonValencies: [2, 3],
  },
  Cu: {
    symbol: "Cu",
    name: "Copper",
    atomicNumber: 29,
    atomicMass: 63.546,
    commonValencies: [1, 2],
  },
  Zn: {
    symbol: "Zn",
    name: "Zinc",
    atomicNumber: 30,
    atomicMass: 65.38,
    commonValencies: [2],
  },
  Br: {
    symbol: "Br",
    name: "Bromine",
    atomicNumber: 35,
    atomicMass: 79.904,
    commonValencies: [1],
  },
  I: {
    symbol: "I",
    name: "Iodine",
    atomicNumber: 53,
    atomicMass: 126.904,
    commonValencies: [1],
  },
  Ba: {
    symbol: "Ba",
    name: "Barium",
    atomicNumber: 56,
    atomicMass: 137.327,
    commonValencies: [2],
  },
  Li: {
    symbol: "Li",
    name: "Lithium",
    atomicNumber: 3,
    atomicMass: 6.941,
    commonValencies: [1],
  },
  B: {
    symbol: "B",
    name: "Boron",
    atomicNumber: 5,
    atomicMass: 10.811,
    commonValencies: [3],
  },
  Se: {
    symbol: "Se",
    name: "Selenium",
    atomicNumber: 34,
    atomicMass: 78.96,
    commonValencies: [2, 4, 6],
  },
} satisfies Record<string, ElementData>;

export type ElementSymbol = keyof typeof ELEMENTS;

export function getElement(symbol: string): ElementData | undefined {
  return Object.hasOwn(ELEMENTS, symbol)
    ? ELEMENTS[symbol as keyof typeof ELEMENTS]
    : undefined;
}

export function isValidElement(symbol: string): boolean {
  return Object.hasOwn(ELEMENTS, symbol);
}
