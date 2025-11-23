export class Cnpj {
  public value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(cnpj: string): Cnpj {
    return new Cnpj(this.normalize(cnpj));
  }

  static isValid(cnpj: string): boolean {
    const normalizedCnpj = this.normalize(cnpj);

    if (normalizedCnpj.length !== 14 || /^(\d)\1+$/.test(normalizedCnpj)) {
      return false;
    }

    const calcDigit = (cnpj: string, length: number): number => {
      const factors =
        length === 12
          ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
          : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

      const slice = cnpj.slice(0, length).split("");
      const total = slice.reduce((sum, num, i) => {
        return sum + parseInt(num, 10) * factors[i];
      }, 0);

      const remainder = total % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    };

    const digit1 = calcDigit(normalizedCnpj, 12);
    const digit2 = calcDigit(normalizedCnpj, 13);

    return (
      digit1 === parseInt(normalizedCnpj[12], 10) &&
      digit2 === parseInt(normalizedCnpj[13], 10)
    );
  }

  static normalize(cnpj: string): string {
    return cnpj.replace(/\D/g, "").padStart(14, "0");
  }
}
