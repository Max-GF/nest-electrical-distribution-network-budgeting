import { Cnpj } from "./cnpj";

it("should be able to validate cnpjs", () => {
  const testCnpjs: string[] = [
    "01.860.395/0001-65", // ✔
    "1.860.395/0001-65", // ✔
    "59.751.677/0001-04", // ✔
    "11.111.111/1111-11", // ✘
    "3.233.531/0001-12", // ✔
    "32.546.141/0001-09", // ✔
    "17.632.852/9846-14", // ✘
    "97.981.131/6341-91", // ✘
    "6354132016344651", // ✘
    "63541320163446", // ✘
    "6345968", // ✘
    "00000006345968", // ✘
  ];

  const testResult = testCnpjs.filter((cnpj) => Cnpj.isValid(cnpj));
  expect(testResult).toHaveLength(5);
});
it("should be able to normalize and create a cnpj value object", () => {
  const testCnpj = "1.860.395/0001-65";
  const cnpj = Cnpj.create(testCnpj);
  expect(cnpj.value).toBe("01860395000165");
});
