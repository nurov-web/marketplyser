/** Хатоҳои Supabase Auth → забони оддӣ (тоҷикӣ). */

export function authErrorMessage(err: unknown, fallback = "Хато рух дод. Боз кӯшиш кунед."): string {
  if (!err) return fallback;

  if (err instanceof Error && !("status" in err) && !("code" in err)) {
    const m = err.message || "";
    if (/supabase танзим/i.test(m) || /NEXT_PUBLIC_SUPABASE/i.test(m)) return m;
  }

  const raw =
    typeof err === "object" && err !== null && "message" in err
      ? String((err as { message?: string }).message || "")
      : typeof err === "string"
        ? err
        : "";
  const code =
    typeof err === "object" && err !== null && "code" in err
      ? String((err as { code?: string }).code || "")
      : "";
  const status =
    typeof err === "object" && err !== null && "status" in err
      ? Number((err as { status?: number }).status)
      : 0;

  const text = `${code} ${raw}`.toLowerCase();

  if (status === 429 || /rate.?limit|too many|over_email_send_rate/.test(text)) {
    return "Зиёд кӯшиш кардед. Каме интизор шавед ва боз кӯшиш кунед.";
  }
  if (/otp_expired|token has expired|expired/.test(text)) {
    return "Рамз куҳна шудааст. Рамзи нав дархост кунед.";
  }
  if (/otp|token|code|verify/.test(text) && /invalid|wrong|incorrect|mismatch/.test(text)) {
    return "Рамз нодуруст аст. Аз нома нусха бардоред ва боз санҷед.";
  }
  if (/email.?not.?confirmed|not.?confirmed/.test(text)) {
    return "Аввал email-ро тасдиқ кунед.";
  }
  if (/already.?registered|already.?exists|user.?already|email.?exists/.test(text)) {
    return "Ин email аллакай сабт шудааст. Ворид шавед.";
  }
  if (/invalid.?login|invalid.?credentials|wrong.?password/.test(text)) {
    return "Email ё парол нодуруст аст.";
  }
  if (/user.?not.?found|no.?user/.test(text)) {
    return "Чунин аккаунт ёфт нашуд.";
  }
  if (/signup.?disabled|signups.?not.?allowed/.test(text)) {
    return "Сабти ном ҳоло пӯшида аст.";
  }
  if (/provider.?is.?not.?enabled|unsupported.?provider|validation_failed/.test(text)) {
    return "Воридшавӣ бо Google ҳоло фаъол нест. Бо email ворид шавед.";
  }
  if (/code.?verifier|invalid.?request.*code/.test(text)) {
    return "Воридшавӣ нимкора монд. Саҳифаро нав кунед ва боз кӯшиш кунед.";
  }
  if (/redirect|url.?not.?allowed/.test(text)) {
    return "Суроғаи бозгашт иҷозат надорад. Бо email ворид шавед.";
  }
  if (/email.?rate|email.?sending/.test(text)) {
    return "Нома фиристода нашуд. Каме баъд боз кӯшиш кунед.";
  }
  if (/network|fetch|failed to fetch|timeout/.test(text)) {
    return "Пайвастшавӣ нест. Интернет-ро санҷед.";
  }
  if (/password/.test(text) && (/weak|short|least|characters/.test(text) || /6/.test(text))) {
    return "Парол хеле кӯтоҳ аст. Дарозтар кунед.";
  }
  if (/invalid.?email|email.?address/.test(text)) {
    return "Email нодуруст навишта шудааст.";
  }
  if (/same.?password|identical/.test(text)) {
    return "Ин амал иҷро нашуд. Боз кӯшиш кунед.";
  }

  return fallback;
}
