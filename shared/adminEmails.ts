// Staff Google accounts that may manage the site.
// When you add an address here, add the same address in firestore.rules and storage.rules.
export const staffEmails = ["alphacortexai@gmail.com"] as const;

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return staffEmails.some(allowed => allowed === normalized);
}
