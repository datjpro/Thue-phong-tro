export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string }; // error là khóa i18n trong namespace "errors"

export const fail = (error: string): { ok: false; error: string } => ({ ok: false, error });
export const success = <T>(data: T): { ok: true; data: T } => ({ ok: true, data });
