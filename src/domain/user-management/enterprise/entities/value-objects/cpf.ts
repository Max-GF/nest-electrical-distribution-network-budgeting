export class Cpf {
  public value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(cpf: string): Cpf {
    return new Cpf(this.normalize(cpf));
  }

  static isValid(cpf: string): boolean {
    // Remove caracteres não numéricos
    const normalizedCpf = this.normalize(cpf);

    // Verifica se o CPF tem 11 dígitos ou é uma sequência repetida
    if (normalizedCpf.length !== 11 || /^(\d)\1+$/.test(normalizedCpf)) {
      return false;
    }

    // Calcula os dígitos verificadores
    const calcDigit = (factor: number) => {
      let total = 0;
      for (let i = 0; i < factor - 1; i++) {
        total += parseInt(normalizedCpf[i]) * (factor - i);
      }
      const remainder = total % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    };

    const digit1 = calcDigit(10);
    const digit2 = calcDigit(11);

    // Verifica se os dígitos calculados são iguais aos do CPF
    return (
      digit1 === parseInt(normalizedCpf[9]) &&
      digit2 === parseInt(normalizedCpf[10])
    );
  }

  static normalize(cpf: string): string {
    return cpf.replace(/\D/g, "").padStart(11, "0");
  }
}
