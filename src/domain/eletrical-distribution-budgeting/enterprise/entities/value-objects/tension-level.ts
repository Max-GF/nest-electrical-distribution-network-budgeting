export type TensionLevelEntries = (typeof TensionLevel.VALID_VALUES)[number];

export class TensionLevel {
  static readonly VALID_VALUES = ["LOW", "MEDIUM"] as const;

  public readonly value: TensionLevelEntries;

  private constructor(value: TensionLevelEntries) {
    this.value = value;
  }

  static create(valor: TensionLevelEntries): TensionLevel {
    return new TensionLevel(valor);
  }

  static isValid(valor: string): valor is TensionLevelEntries {
    return (this.VALID_VALUES as readonly string[]).includes(valor);
  }
}
