/**
 * email.ts — thin re-export of the existing mailer so new code can import from
 * "@/lib/email" while the original "@/lib/mailer" continues to work unchanged.
 */
export { sendMail } from "@/lib/mailer";
export type { SendMailOptions } from "@/lib/mailer";
