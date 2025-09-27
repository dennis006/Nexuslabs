let __ctr = 0;
export function newId(prefix = "msg") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  __ctr += 1;
  return `${prefix}_${Date.now()}_${__ctr}`;
}
