import { z } from "zod";
import { DEFAULT_LOCALE } from "@/i18n/config";
import { getDictionary } from "@/i18n";

export const USERNAME_REGEX = /^(?!.*\.\.)(?!\.)(?!.*\.$)[a-zA-Z0-9._]{1,30}$/;

export function usernameSchema(messages = getDictionary(DEFAULT_LOCALE).validation) {
  return z
    .string()
    .trim()
    .min(1, messages.required)
    .max(30, messages.tooLong)
    .regex(USERNAME_REGEX, messages.invalid)
    .transform((value) => value.toLowerCase());
}

export type UsernameInput = z.input<ReturnType<typeof usernameSchema>>;

export function parseUsername(value: string): {
  ok: true;
  username: string;
} | {
  ok: false;
  error: string;
} {
  const result = usernameSchema().safeParse(value);
  if (!result.success) {
    return {
      ok: false,
      error: result.error.issues[0]?.message ?? getDictionary(DEFAULT_LOCALE).validation.invalid,
    };
  }
  return { ok: true, username: result.data };
}
