import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../lib/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt";
import { cache } from "../lib/redis";
import { publicUser } from "../utils/helpers";
import { AuthedRequest } from "../middleware/auth";
import { setAuthCookies, clearAuthCookies } from "../lib/authCookies";
import { assertSupabaseEmailConfirmed } from "../lib/supabaseAuth";
import { config } from "../config";

export const registerSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  password: z.string().min(6).max(100),
  /** Пас аз verifyOtp / агар Supabase фаъол бошад — ҳатмӣ. */
  supabaseAccessToken: z.string().min(20).optional(),
  avatar: z.string().optional(),
  intent: z.enum(["buy", "sell"]).default("buy"),
  shopName: z.string().optional(),
  shopAddress: z.string().optional(),
  shopDescription: z.string().optional(),
});

export const loginSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    password: z.string().min(6),
  })
  .refine((d) => d.email || d.phone, { message: "Email ё телефон лозим аст" });

function supabaseReady() {
  return Boolean(config.supabaseUrl && config.supabaseAnonKey && !config.supabaseUrl.includes("YOUR_PROJECT"));
}

export async function register(req: AuthedRequest, res: Response) {
  const data = req.body as z.infer<typeof registerSchema>;

  if (supabaseReady()) {
    if (!data.supabaseAccessToken) {
      return res.status(400).json({ message: "Аввал email-ро тасдиқ кунед" });
    }
    try {
      const { email: confirmedEmail } = await assertSupabaseEmailConfirmed(data.supabaseAccessToken);
      if (confirmedEmail !== data.email.toLowerCase()) {
        return res.status(400).json({ message: "Email бо тасдиқ мувофиқат намекунад" });
      }
    } catch (e) {
      const err = e as Error & { status?: number };
      return res.status(err.status || 401).json({ message: err.message || "Тасдиқи email лозим аст" });
    }
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: data.email.toLowerCase() }, { phone: data.phone }] },
  });
  if (existing) {
    return res.status(409).json({ message: "Email ё телефон аллакай сабт шудааст" });
  }

  const passwordHash = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.toLowerCase(),
      phone: data.phone,
      passwordHash,
      avatar: data.avatar,
      role: "USER",
    },
  });

  const payload = { userId: user.id, role: user.role };
  const access = signAccessToken(payload);
  const refresh = signRefreshToken(payload);
  setAuthCookies(res, access, refresh);

  const seller = await prisma.seller.findUnique({ where: { userId: user.id } });
  return res.status(201).json({
    user: publicUser(user),
    seller,
    accessToken: access,
  });
}

export const oauthSchema = z.object({
  supabaseAccessToken: z.string().min(20),
});

/** Ворид / сабт тавассути Google (Supabase OAuth) — бидуни рамзи email. */
export async function oauth(req: AuthedRequest, res: Response) {
  const { supabaseAccessToken } = req.body as z.infer<typeof oauthSchema>;

  let authUser;
  try {
    authUser = await assertSupabaseEmailConfirmed(supabaseAccessToken);
  } catch (e) {
    const err = e as Error & { status?: number };
    return res.status(err.status || 401).json({ message: err.message || "Воридшавӣ бо Google номуваффақ" });
  }

  let user = await prisma.user.findUnique({ where: { email: authUser.email } });

  if (!user) {
    const phone = `g${authUser.id.replace(/-/g, "").slice(0, 18)}`;
    const passwordHash = await hashPassword(`oauth:${authUser.id}:${Date.now()}`);
    user = await prisma.user.create({
      data: {
        firstName: authUser.firstName.slice(0, 50),
        lastName: authUser.lastName.slice(0, 50),
        email: authUser.email,
        phone,
        passwordHash,
        avatar: authUser.avatar,
        role: "USER",
      },
    });
  }

  if (user.accountStatus === "BANNED" || user.accountStatus === "SUSPENDED") {
    return res.status(403).json({
      message: "Аккаунт маҳдуд аст",
      accountStatus: user.accountStatus,
    });
  }

  if (authUser.avatar && user.avatar !== authUser.avatar) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { avatar: authUser.avatar },
    });
  }

  const payload = { userId: user.id, role: user.role };
  const access = signAccessToken(payload);
  const refresh = signRefreshToken(payload);
  setAuthCookies(res, access, refresh);

  const seller = await prisma.seller.findUnique({ where: { userId: user.id } });
  return res.json({ user: publicUser(user), seller, accessToken: access });
}

export async function login(req: AuthedRequest, res: Response) {
  const { email, phone, password } = req.body as z.infer<typeof loginSchema>;
  const user = await prisma.user.findFirst({
    where: email ? { email: email.toLowerCase() } : { phone },
  });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({ message: "Маълумоти воридшавӣ нодуруст аст" });
  }
  if (user.accountStatus === "BANNED" || user.accountStatus === "SUSPENDED") {
    return res.status(403).json({
      message: "Аккаунт маҳдуд аст",
      accountStatus: user.accountStatus,
    });
  }

  const payload = { userId: user.id, role: user.role };
  const access = signAccessToken(payload);
  const refresh = signRefreshToken(payload);
  setAuthCookies(res, access, refresh);

  const seller = await prisma.seller.findUnique({ where: { userId: user.id } });
  return res.json({ user: publicUser(user), seller, accessToken: access });
}

export async function logout(req: AuthedRequest, res: Response) {
  const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
  if (token) await cache.set(`bl:${token}`, "1", 15 * 60);
  clearAuthCookies(res);
  return res.json({ ok: true });
}

export async function refresh(req: AuthedRequest, res: Response) {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ message: "Refresh token нест" });
  try {
    const payload = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(401).json({ message: "Корбар ёфт нашуд" });
    const next = { userId: user.id, role: user.role };
    const access = signAccessToken(next);
    const refreshTok = signRefreshToken(next);
    setAuthCookies(res, access, refreshTok);
    return res.json({ accessToken: access });
  } catch {
    return res.status(401).json({ message: "Refresh token нодуруст аст" });
  }
}

export async function me(req: AuthedRequest, res: Response) {
  res.setHeader("Cache-Control", "private, no-store");
  if (!req.user) return res.json({ user: null, seller: null });
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      accountStatus: true,
      createdAt: true,
      seller: { select: { id: true, shopName: true, status: true, logo: true } },
    },
  });
  if (!user) return res.json({ user: null, seller: null });
  const { seller, ...rest } = user;
  return res.json({ user: publicUser(rest), seller });
}

export async function updateProfile(req: AuthedRequest, res: Response) {
  const schema = z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    phone: z.string().min(7).optional(),
    avatar: z.string().optional(),
  });
  const data = schema.parse(req.body);
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data,
  });
  return res.json({ user: publicUser(user) });
}
