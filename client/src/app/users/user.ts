export interface User {
  _id: string;
  name: string;
  age: number;
  company: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

export const UserConstants = {
  roles: ['admin', 'editor', 'viewer'],
  minAge: 15,
  maxAge: 200,
} as const;

// What you will see on hover: `type UserRole = "admin" | "editor" | "viewer"`
// Much of the time, the above is absolutely fine. Arguably it is already. But hear this out:
//
// Think of this as a way to derive the type from the constants that is like,
// "any valid member of the array". Aka at any index. So it is a union type of all the roles in the array
//
// In production apps with tons of constants, this trick allows all the types to
// automatically be derived when a constant changes.
// An alum recently updated two constants in a production app and it was used to derive 4 types,
// and a few types that relied on those ones as well. Many types that could have otherwise
// been broken if they were hardcoded like the equivalent.
//
// Is this derived type needed in your 3601 app? YOU DECIDE!
export type UserRole = (typeof UserConstants.roles)[number];
