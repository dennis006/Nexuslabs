declare module "bcryptjs" {
  export type CompareResult = boolean | Promise<boolean>;
  export type Compare = (data: string, encrypted: string) => CompareResult;

  export interface Bcrypt {
    compare: Compare;
  }

  const bcrypt: Bcrypt;
  export default bcrypt;
  export const compare: Compare;
}
