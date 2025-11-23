import { UserRole } from "./user-roles";

it("should be able to check if user have permission", () => {
  expect(
    UserRole.doesUserHavePermission(
      UserRole.create("ADMIN"),
      UserRole.create("COMMON"),
    ),
  ).toBe(true);
  expect(
    UserRole.doesUserHavePermission(
      UserRole.create("COMMON"),
      UserRole.create("ADMIN"),
    ),
  ).toBe(false);
});
it("should be able to check if role is valid", () => {
  expect(UserRole.isValid("ADMIN")).toBe(true);
  expect(UserRole.isValid("COMMON")).toBe(true);
  expect(UserRole.isValid("SUPER-ADMIN")).toBe(false);
});
