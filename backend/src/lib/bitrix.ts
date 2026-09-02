import { config } from "../config";

export interface BitrixLeadInput {
  title: string;
  name: string;
  phone: string;
  comments?: string;
}

export async function pushBitrixLead(input: BitrixLeadInput): Promise<string | null> {
  const hook = config.bitrixWebhook;
  if (!hook) return null;

  try {
    const r = await fetch(`${hook.replace(/\/$/, "")}/crm.lead.add.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          TITLE: input.title,
          NAME: input.name,
          PHONE: [{ VALUE: input.phone, VALUE_TYPE: "WORK" }],
          COMMENTS: input.comments || "",
          SOURCE_ID: "WEB",
        },
      }),
    });
    const json = (await r.json()) as { result?: number };
    return json.result ? String(json.result) : null;
  } catch {
    return null;
  }
}
