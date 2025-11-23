import { Cpf } from "./cpf";

it("should be able to validate cpfs", () => {
  const testCpfs: string[] = [
    "108.260.513-16", // ✔
    "806.622.804-07", // ✔
    "377.114.325-00", // ✔
    "519.272.382-50", // ✔
    "068.218.425-07", // ✔
    "68.218.425-07", // ✔
    "111.111.111-11", // ✘
    "421.317.458-00", // ✘
    "12345678909", // ✔
    "729896888619", // ✘
    "899919", // ✘
    "00000899919", // ✘
  ];

  const testResult = testCpfs.filter((cpf) => Cpf.isValid(cpf));
  expect(testResult).toHaveLength(7);
});
it("should be able to normalize and create a cpf value object", () => {
  const testCpf = "68.218.425-07";
  const cpf = Cpf.create(testCpf);
  expect(cpf.value).toBe("06821842507");
});
