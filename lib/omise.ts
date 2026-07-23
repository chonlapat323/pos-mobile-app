// Tokenizes card details directly against Omise's Vault API using only the public key - the
// card number/CVV go straight from this device to Omise and never touch our own backend, which
// only ever receives the resulting tokn_xxx string.
const VAULT_URL = "https://vault.omise.co/tokens";

export interface OmiseCardInput {
  number: string;
  name: string;
  expirationMonth: number;
  expirationYear: number;
  securityCode: string;
}

// publicKey comes from GET /subscriptions/config (see pos-api.ts) rather than a build-time env
// var, so a platform admin can rotate it from the settings page without anyone rebuilding the app.
export async function createOmiseToken(card: OmiseCardInput, publicKey: string): Promise<string> {
  const auth = btoa(`${publicKey}:`);
  const res = await fetch(VAULT_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      card: {
        number: card.number.replace(/\s/g, ""),
        name: card.name,
        expiration_month: card.expirationMonth,
        expiration_year: card.expirationYear,
        security_code: card.securityCode,
      },
    }),
  });

  const data = (await res.json()) as { id?: string; message?: string };
  if (!res.ok || !data.id) {
    throw new Error(data.message ?? "ไม่สามารถสร้าง token บัตรได้");
  }
  return data.id;
}
