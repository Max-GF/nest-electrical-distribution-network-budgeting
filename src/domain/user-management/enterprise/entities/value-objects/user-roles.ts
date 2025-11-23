export type UserRoleEntries = (typeof UserRole.VALID_VALUES)[number];

export class UserRole {
  // Quick note: When adding a new role, remember that the array index is used to quickly check for a permission.
  //  So, the order of the roles in the array is important. The first role has the highest permission and the last one has the lowest.
  //  Check documentation for more details.
  static readonly VALID_VALUES = ["ADMIN", "COMMON"] as const;

  public readonly value: UserRoleEntries;

  private constructor(value: UserRoleEntries) {
    this.value = value;
  }

  static create(valor: UserRoleEntries): UserRole {
    return new UserRole(valor);
  }

  static isValid(valor: string): valor is UserRoleEntries {
    return (this.VALID_VALUES as readonly string[]).includes(valor);
  }

  static doesUserHavePermission(
    userRoles: UserRole,
    requiredRole: UserRole,
  ): boolean {
    return (
      this.VALID_VALUES.indexOf(userRoles.value) <=
      this.VALID_VALUES.indexOf(requiredRole.value)
    );
  }
}
