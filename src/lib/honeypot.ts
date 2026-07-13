// Honeypot bot trap — see components/Honeypot.tsx. Forms send the hidden field's
// value as `hp`; a non-empty value means a bot filled a field humans never see.
// Callers should SILENTLY accept-but-drop (return a fake success) so bots don't
// learn the trap exists.
export function isHoneypotTripped(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  const candidates = [b.hp, b.company_website];
  return candidates.some((v) => typeof v === "string" && v.trim().length > 0);
}
