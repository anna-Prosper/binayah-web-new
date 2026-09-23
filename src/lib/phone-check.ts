// Client-side mirror of the API's validatePhone() (binayah-api
// src/lib/phone-validate.ts). Kept deliberately in step with it: the server is
// the authority and rejects again on its own, but a person who mistypes should
// be told at the form rather than getting a generic failure after submitting.
//
// Same shape of rule as the server: strict about UAE numbers (the format is
// unambiguous) and permissive about everything else, because 38% of website
// leads carry an international number and a real overseas buyer must never be
// turned away by a UAE-shaped rule.
//
// Unlike the server's version, an EMPTY string is invalid here — newsletter
// forms now require a phone, and the server enforces presence separately.

/** UAE mobile: 9 national digits beginning 5. Landline: 8 beginning 2,3,4,6,7 or 9. */
function uaeNationalIsValid(national: string): boolean {
  if (national.length === 9) return national.startsWith("5");
  if (national.length === 8) return /^[234679]/.test(national);
  return false;
}

export function phoneLooksValid(input: string): boolean {
  const raw = String(input ?? "").trim();
  if (!raw) return false;
  // A real number never contains letters — the same trap the API uses.
  if (/[a-z]/i.test(raw)) return false;
  // More than one number pasted into the field.
  if (/[,/;]|\d\s{2,}\d/.test(raw) && raw.replace(/\D/g, "").length > 15) return false;

  const digits = raw.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) return false;

  // Local UAE form: 05X XXX XXXX, or 04 XXX XXXX for a landline.
  if (raw.startsWith("0") && !raw.startsWith("00")) {
    return uaeNationalIsValid(digits.replace(/^0/, ""));
  }

  const withoutIdd = digits.replace(/^00/, "");
  if (withoutIdd.startsWith("971")) {
    // The bot flood used +971 followed by ten digits, which no UAE number has.
    return uaeNationalIsValid(withoutIdd.slice(3));
  }

  // Any other country: E.164 length is the only claim we can make safely.
  return true;
}
