import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthedRequest } from "../middleware/auth";
import { config } from "../config";
import { routeParam, toNum } from "../utils/helpers";

export async function listCrm(req: AuthedRequest, res: Response) {
  const [contacts, leads, deals] = await Promise.all([
    prisma.crmContact.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.crmLead.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.crmDeal.findMany({ include: { contact: true }, orderBy: { createdAt: "desc" }, take: 200 }),
  ]);
  return res.json({
    contacts,
    leads,
    deals: deals.map((d) => ({ ...d, amount: toNum(d.amount) })),
    bitrixConfigured: Boolean(config.bitrixWebhook),
  });
}

export async function createCrmRow(req: AuthedRequest, res: Response) {
  const type = String(req.body.type || "");
  if (type === "contact") {
    const row = await prisma.crmContact.create({
      data: {
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email || null,
        company: req.body.company || null,
      },
    });
    return res.status(201).json(row);
  }
  if (type === "lead") {
    const row = await prisma.crmLead.create({
      data: {
        title: req.body.title || req.body.name,
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email || null,
        status: req.body.status || "NEW",
        source: req.body.source || "WEB",
      },
    });
    return res.status(201).json(row);
  }
  if (type === "deal") {
    const row = await prisma.crmDeal.create({
      data: {
        title: req.body.title,
        amount: Number(req.body.amount || 0),
        stage: req.body.stage || "NEW",
        contactId: req.body.contactId || null,
      },
    });
    return res.status(201).json(row);
  }
  return res.status(400).json({ message: "type нодуруст аст" });
}

export async function updateCrmStatus(req: AuthedRequest, res: Response) {
  const entity = routeParam(req.params.entity);
  const id = routeParam(req.params.id);
  if (entity === "leads") {
    const row = await prisma.crmLead.update({ where: { id }, data: { status: req.body.status } });
    return res.json(row);
  }
  if (entity === "deals") {
    const row = await prisma.crmDeal.update({ where: { id }, data: { stage: req.body.stage } });
    return res.json(row);
  }
  return res.status(400).json({ message: "entity нодуруст" });
}

export async function syncBitrix(req: AuthedRequest, res: Response) {
  const hook = config.bitrixWebhook;
  if (!hook) {
    return res.status(400).json({
      message: "BITRIX_WEBHOOK_URL дар .env нест. Incoming webhook-и Bitrix24-ро гузоред.",
    });
  }
  const leads = await prisma.crmLead.findMany({ where: { bitrixId: null }, take: 20 });
  const results = [];
  for (const lead of leads) {
    try {
      const r = await fetch(`${hook.replace(/\/$/, "")}/crm.lead.add.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: {
            TITLE: lead.title,
            NAME: lead.name,
            PHONE: [{ VALUE: lead.phone, VALUE_TYPE: "WORK" }],
            EMAIL: lead.email ? [{ VALUE: lead.email, VALUE_TYPE: "WORK" }] : [],
            SOURCE_ID: "WEB",
          },
        }),
      });
      const json = (await r.json()) as { result?: number };
      if (json.result) {
        await prisma.crmLead.update({ where: { id: lead.id }, data: { bitrixId: String(json.result) } });
        results.push({ id: lead.id, bitrixId: json.result });
      }
    } catch (e) {
      results.push({ id: lead.id, error: e instanceof Error ? e.message : "fail" });
    }
  }
  return res.json({ synced: results.length, results });
}
