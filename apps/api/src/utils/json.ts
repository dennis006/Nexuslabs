import { Prisma } from "@prisma/client";

export const parseJsonArray = <T>(value: Prisma.JsonValue | null | undefined): T[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value as T[];
  }
  return [];
};

export const parseJsonObject = <T extends Record<string, unknown>>(
  value: Prisma.JsonValue | null | undefined
): T | null => {
  if (!value) return null;
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as T;
  }
  return null;
};

export const toJsonInput = (value: unknown) => {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue;
};
